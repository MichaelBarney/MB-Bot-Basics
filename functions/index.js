const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const TELEGRAM_TOKEN = functions.config().telegram.token
const apiKey = functions.config().voiceflow.key
const versionID = functions.config().voiceflow.version
const STRIPE_TEST = functions.config().stripe.test

admin.initializeApp()

const db = admin.firestore()
const bot = new TelegramBot(TELEGRAM_TOKEN)

const typeProcessors = require('./typeProcessors')

exports.messageReceived = functions.https.onRequest(
  async (request, response) => {
    console.log('Request Received: ', request.body)
    bot.processUpdate(request.body)
    response.sendStatus(200)
  }
)

bot.on('pre_checkout_query', async (checkoutQuery) => {
  console.log('CHECKING OUT: ', checkoutQuery)
  const { id } = checkoutQuery
  await bot.answerPreCheckoutQuery(id, true)
})

bot.on('callback_query', async (callbackQuery) => {
  const text = callbackQuery.data
  const from = callbackQuery.from
  await processMsg(text, from)
})

bot.on('message', async (msg) => {
  const { from, text } = msg

  console.log('Message received: ', msg)

  if (msg.successful_payment) {
    const id = from.id.toString()
    await db
      .collection('students')
      .doc(id)
      .update({ pagamento: msg.successful_payment })

    await processAction('complete', from)

    return
  }

  await processMsg(text, from)
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

  console.log('voiceflow: ', response.data)

  for (const data of response.data) {
    const processor = typeProcessors[data.type]
    if (processor) await processor({ data, from, id: from.id.toString(), bot, db, STRIPE_TEST })
  }
}

const processMsg = async (text, from) => {
  console.log('RECEIVED: ', text)
  console.log('FROM: ', from)

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

  console.log('voiceflow: ', response.data)

  for (const data of response.data) {
    const processor = typeProcessors[data.type]
    if (processor) await processor({ data, from, id: from.id.toString(), bot, db, STRIPE_TEST })
  }
}
