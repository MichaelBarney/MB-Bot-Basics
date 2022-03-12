const { sendButtons } = require('./utils')

const text = async ({ id, bot, from, data }) => {
  let textMessage = data.payload?.message

  textMessage = textMessage.replace('FIRST_NAME', from.first_name)

  if (!textMessage) return

  await bot.sendMessage(id, textMessage, {
    parse_mode: 'Markdown'
  })
}

const choice = async ({ id, bot, data }) => {
  const options = data.payload?.buttons.map(data => data.name)

  const header = options.shift()

  await sendButtons(header, options, bot, id)
}

const save = async ({ id, data, db }) => {
  const payload = JSON.parse(data.payload)
  await db.collection('students').doc(id).set(payload)
}

const saveAnswer = async ({ id, data, db }) => {
  const { question, correct } = JSON.parse(data.payload)
  const key = `answers.${question}`
  await db
    .collection('students')
    .doc(id)
    .update({ [key]: correct })
}

const finishBlock = async ({ id, data, db }) => {
  const block = parseInt(data.payload)
  const key = `finishedBlocks.${block}`
  await db
    .collection('students')
    .doc(id)
    .update({ [key]: true })
}

const createUser = async ({ id, from, db }) => {
  await db
    .collection('students')
    .doc(id)
    .set({ name: from.first_name }, { merge: true })
}

const blocks = ['Tecnologias Importantes', 'Construindo Conversas', 'Bots no WhatsApp', 'Criando Voicebots']
const menu = async ({ id, bot, db }) => {
  const studentData = (await db.collection('students').doc(id).get()).data()
  let finishedBlocks = 0
  const options = blocks.map((blockName, index) => {
    let finished = false

    if (studentData.finishedBlocks?.[index + 1]) {
      finished = true
      finishedBlocks += 1
    }
    return blockName + (finished ? ' ✅' : '')
  })

  if (finishedBlocks === blocks.length) {
    options.push('📜 Emitir Certificado 📜')
  }

  await sendButtons('Qual bloco você quer começar?', options, bot, id)
}

const pay = async ({ bot, id, STRIPE_TEST }) => {
  const payload = id + Date.now()

  const prices = [{
    label: 'Certificação',
    amount: 2000
  }]
  bot.sendInvoice(id, 'Certificação', 'Emita um certificado de conclusão ao terminar o curso', payload, STRIPE_TEST, 'pagar', 'BRL', prices, {
    max_tip_amount: 100000,
    suggested_tip_amounts: [1000, 5000, 10000]
  })

  await sendButtons('Clique no botão acima para fazer o pagamento ⬆️', ['Pagar depois'], bot, id)
}

const animation = async ({ bot, id, data }) => {
  const search = data.payload
  await bot.sendAnimation(id, search)
}

const audio = async ({ bot, id, data }) => {
  const audio = data.payload
  await bot.sendAudio(id, audio)
}

module.exports = { menu, createUser, saveAnswer, save, choice, text, finishBlock, pay, animation, audio }
