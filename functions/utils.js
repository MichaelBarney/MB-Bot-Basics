const sendButtons = async (header, options, bot, id, placeholder) => {
  const buttons = options.map((option) => {
    return [{ text: option, callback_data: option }]
  })

  await bot.sendMessage(id, header, {
    reply_markup: {
      keyboard: buttons,
      resize_keyboard: true,
      one_time_keyboard: true,
      input_field_placeholder: placeholder ?? options[0]
    }
  })
}

module.exports = { sendButtons }
