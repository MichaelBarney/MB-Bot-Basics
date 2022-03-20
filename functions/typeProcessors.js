const { sendButtons } = require("./utils");

const text = async ({ id, bot, from, data }) => {
  let textMessage = data.payload?.message;

  textMessage = textMessage.replace("FIRST_NAME", from.first_name);

  if (!textMessage) return;

  await bot.telegram.sendMessage(id, textMessage, {
    parse_mode: "Markdown",
  });
};

const choice = async ({ id, bot, data }) => {
  const options = data.payload?.buttons.map((data) => data.name);

  const header = options.shift();

  await sendButtons(header, options, bot, id);
};

const save = async ({ id, data, db }) => {
  const payload = JSON.parse(data.payload);
  await db.collection("students").doc(id).set(payload);
};

const saveAnswer = async ({ id, data, db }) => {
  const { question, correct } = JSON.parse(data.payload);
  const key = `answers.${question}`;
  await db
    .collection("students")
    .doc(id)
    .update({ [key]: correct });
};

const finishBlock = async ({ id, data, db }) => {
  const block = parseInt(data.payload);
  const key = `finishedBlocks.${block}`;
  await db
    .collection("students")
    .doc(id)
    .update({ [key]: true });
};

const createUser = async ({ id, from, db }) => {
  console.log("DBG: started creating user");
  await db
    .collection("students")
    .doc(id)
    .set({ name: from.first_name, lastName: from.last_name }, { merge: true });
  console.log("DBG: finished creating user");
};

const blocks = [
  "Tecnologias Importantes",
  "Construindo Conversas",
  "Bots no WhatsApp",
  "Criando Voicebots",
  "Programando Ações",
];

const menu = async ({ id, bot, db }) => {
  const studentData = (await db.collection("students").doc(id).get()).data();
  let finishedBlocks = 0;
  const options = blocks.map((blockName, index) => {
    let finished = false;

    if (studentData.finishedBlocks?.[index + 1]) {
      finished = true;
      finishedBlocks += 1;
    }
    return blockName + (finished ? " ✅" : "");
  });

  if (finishedBlocks === blocks.length) {
    options.unshift("📜 Emitir Certificado 📜");
    if (!studentData.certificateEmissionDate) {
      const date = new Date();
      const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
      await db
        .collection("students")
        .doc(id)
        .set(
          {
            certificateEmissionDate: `${date.getDate()} de ${monthName}, ${date.getFullYear()}`,
          },
          { merge: true }
        );
    }
  }

  await sendButtons("Qual bloco você quer começar?", options, bot, id);
};

const pay = async ({ bot, id, STRIPE_TEST }) => {
  const invoice = {
    chat_id: id, // Unique identifier of the target chat or username of the target channel
    provider_token: STRIPE_TEST,
    start_parameter: "pagar", // Unique parameter for deep links. If you leave this field blank, forwarded copies of the forwarded message will have a Pay button that allows multiple users to pay directly from the forwarded message using the same account. If not empty, redirected copies of the sent message will have a URL button with a deep link to the bot (instead of a payment button) with a value used as an initial parameter.
    title: "Certificação", // Product name, 1-32 characters
    description: "Emita um certificado de conclusão ao terminar o curso", // Product description, 1-255 characters
    currency: "BRL", // ISO 4217 Three-Letter Currency Code
    prices: [
      {
        label: "Certificação",
        amount: 2000,
      },
    ], // Price breakdown, serialized list of components in JSON format 100 kopecks * 100 = 100 rubles
    payload: id + Date.now(),
  };

  await bot.telegram.sendInvoice(id, invoice);

  await sendButtons(
    "Clique no botão acima para fazer o pagamento ⬆️",
    ["Pagar depois"],
    bot,
    id
  );
};

const animation = async ({ bot, id, data }) => {
  const search = data.payload;
  await bot.telegram.sendAnimation(id, search);
};

const audio = async ({ bot, id, data }) => {
  const audio = data.payload;
  await bot.telegram.sendAudio(id, audio);
};

module.exports = {
  menu,
  createUser,
  saveAnswer,
  save,
  choice,
  text,
  finishBlock,
  pay,
  animation,
  audio,
};
