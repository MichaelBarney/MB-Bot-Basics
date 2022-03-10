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
  const { question, answer } = JSON.parse(data.payload)
  const updateData = { answers: {} }
  updateData.answers[question] = answer
  await db
    .collection('students')
    .doc(id)
    .update(updateData)
}

const finishBlock = async ({ id, data, db }) => {
  const block = parseInt(data.payload)
  const updateData = { finishedBlocks: {} }
  updateData.finishedBlocks[block] = true
  await db
    .collection('students')
    .doc(id)
    .update(updateData)
}

const createUser = async ({ id, from, db }) => {
  await db
    .collection('students')
    .doc(id)
    .set({ name: from.first_name }, { merge: true })
}

const menu = async ({ id, bot, db }) => {
  const studentData = (await db.collection('students').doc(id).get()).data()
  console.log('Student Data: ', studentData)
  const buttons = ['Tecnologias', 'Conversas'].map((blockName, index) => {
    let finished = false

    if (studentData.finishedBlocks?.[index + 1]) finished = true

    return [{ text: blockName + (finished ? ' ✅' : ''), callback_data: blockName }]
  })

  await bot.sendMessage(id, 'Qual bloco você quer começar?', {
    reply_markup: JSON.stringify({
      inline_keyboard: buttons
    })
  })
}

module.exports = { menu, createUser, saveAnswer, save, choice, text, finishBlock }
