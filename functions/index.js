const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const TelegramBot = require('node-telegram-bot-api')

const TELEGRAM_TOKEN = functions.config().telegram.token
const apiKey = functions.config().voiceflow.key
const versionID = functions.config().voiceflow.version

admin.initializeApp()

const db = admin.firestore()
const bot = new TelegramBot(TELEGRAM_TOKEN)

const typeProcessors = require('./typeProcessors')

exports.messageReceived = functions.https.onRequest(
  async (request, response) => {
    bot.processUpdate(request.body)
    response.sendStatus(200)
  }
)

bot.on('callback_query', async (callbackQuery) => {
  const text = callbackQuery.data
  const from = callbackQuery.from
  await processMsg(text, from)
})

bot.on('message', async (msg) => {
  const { from, text } = msg
  await processMsg(text, from)
})

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
      request: {
        type: 'text',
        payload: text
      }
    }
  })

  console.log('voiceflow: ', response.data)

  for (const data of response.data) {
    const processor = typeProcessors[data.type]
    if (processor) await processor({ data, from, id: from.id.toString(), bot, db })
  }
}
