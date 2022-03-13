const functions = require('firebase-functions')
const axios = require('axios')

const TELEGRAM_TOKEN = functions.config().telegram.token
const apiKey = functions.config().voiceflow.key
const versionID = functions.config().voiceflow.version
const STRIPE_TEST = functions.config().stripe.test

const admin = require('firebase-admin')
admin.initializeApp()
const db = admin.firestore()

const { Telegraf } = require('telegraf')
const bot = new Telegraf(TELEGRAM_TOKEN, {
  telegram: { webhookReply: true }
})

const typeProcessors = require('./typeProcessors')

exports.messageReceived = functions.https.onRequest(async (request, response) => {
  return await bot.handleUpdate(request.body, response).then((rv) => {
    return !rv && response.sendStatus(200)
  })
}
)

bot.on('pre_checkout_query', async (checkoutQuery) => {
  const { id, from } = checkoutQuery
  await bot.telegram.answerPreCheckoutQuery(id, true)
  await bot.telegram.sendMessage(from.id, '⏱ Espera só um pouquinho enquanto confirmo o pagamento... Se demorar mais do que 10 minutos, envie /suporte')
})

bot.on('callback_query', async (callbackQuery) => {
  const text = callbackQuery.data
  const from = callbackQuery.from
  await processMsg(text, from)
})

bot.on('message', async (msg) => {
  const { from, text } = msg

  if (text === '/start') {
    console.log('DBG: LAUNCH')
    await processAction('launch', from)
  } else if (msg.successful_payment) {
    await processAction('complete', from)

    const id = from.id.toString()
    await db
      .collection('students')
      .doc(id)
      .update({ pagamento: msg.successful_payment })
  } else {
    await processMsg(text, from)
  }
})

const processAction = async (action, from) => {
  const response = await axios({
    method: 'POST',
    baseURL: 'https://general-runtime.voiceflow.com',
    url: `/state/${versionID}/user/${from.username}/interact`,
    headers: {
      Authorization: apiKey
    },
    data: {
      action: {
        type: action
      }
    }
  })

  for (const data of response.data) {
    const processor = typeProcessors[data.type]
    if (processor) await processor({ data, from, id: from.id.toString(), bot, db, STRIPE_TEST })
  }
}

const processMsg = async (text, from) => {
  const response = await axios({
    method: 'POST',
    baseURL: 'https://general-runtime.voiceflow.com',
    url: `/state/${versionID}/user/${from.username}/interact`,
    headers: {
      Authorization: apiKey
    },
    data: {
      action: {
        type: 'text',
        payload: text
      },
      config: {
        stopTypes: ['pay']
      }
    }
  })

  for (const data of response.data) {
    const processor = typeProcessors[data.type]
    if (processor) await processor({ data, from, id: from.id.toString(), bot, db, STRIPE_TEST })
  }
}
