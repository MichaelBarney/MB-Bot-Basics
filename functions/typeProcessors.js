const text = async ({ id, bot, from, data }) => {
  let textMessage = data.payload?.message

  textMessage = textMessage.replace('FIRST_NAME', from.first_name)

  if (!textMessage) return

  await bot.sendMessage(id, textMessage, {
    parse_mode: 'Markdown'
  })
}

const choice = async ({ id, bot, data }) => {
  const buttonData = data.payload?.buttons

  const buttonHeader = buttonData.shift().name

  const buttons = buttonData.map((data) => {
    return [{ text: data.name, callback_data: data.name }]
  })

  await bot.sendMessage(id, buttonHeader, {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons
    })
  })
}
const save = async ({ id, data, db }) => {
  const payload = JSON.parse(data.payload)
  await db.collection('students').doc(id).set(payload)
}

const saveAnswer = async ({ id, data, db }) => {
  console.log(data.payload)
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

const blocks = ['Tecnologias', 'Conversas']
const menu = async ({ id, bot, db }) => {
  const studentData = (await db.collection('students').doc(id).get()).data()
  console.log('Student Data: ', studentData)
  let finishedBlocks = 0
  const buttons = blocks.map((blockName, index) => {
    let finished = false

    if (studentData.finishedBlocks?.[index + 1]) {
      finished = true
      finishedBlocks += 1
    }
    return [{ text: blockName + (finished ? ' ✅' : ''), callback_data: blockName }]
  })

  console.log('Length: ', studentData.finishedBlocks?.length)
  if (finishedBlocks === blocks.length) {
    console.log('append')
    buttons.push([{ text: '📜 Emitir Certificado 📜', callback_data: 'Emitir Certificado' }])
  }

  await bot.sendMessage(id, 'Qual bloco você quer começar?', {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons
    })
  })
}

const pay = async ({ bot, id, STRIPE_TEST }) => {
  const payload = id + Date.now()

  const prices = [{
    label: 'Certificação',
    amount: 2000
  }]
  bot.sendInvoice(id, 'Certificação', 'Emita um certificado de conclusão ao terminar o curso', payload, STRIPE_TEST, 'pay', 'BRL', prices, {
    max_tip_amount: 100000,
    suggested_tip_amounts: [1000, 5000, 10000]
  })

  const buttons = ['Pagar depois'].map((name) => {
    return [{ text: name, callback_data: name }]
  })

  await bot.sendMessage(id, 'Outras opções:', {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons
    })
  })
}

module.exports = { menu, createUser, saveAnswer, save, choice, text, finishBlock, pay }
