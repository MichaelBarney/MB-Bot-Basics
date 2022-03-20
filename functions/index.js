const functions = require("firebase-functions");
const axios = require("axios");

const TELEGRAM_TOKEN = functions.config().telegram.token;
const apiKey = functions.config().voiceflow.key;
const versionID = functions.config().voiceflow.version;
const STRIPE_TEST = functions.config().stripe.test;

const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(TELEGRAM_TOKEN, {
  telegram: { webhookReply: true },
});

const typeProcessors = require("./typeProcessors");

exports.messageReceived = functions.https.onRequest(
  async (request, response) => {
    await bot.handleUpdate(request.body, response);
    response.send();
  }
);

bot.on("pre_checkout_query", async (ctx) => {
  await ctx.answerPreCheckoutQuery(true);
});

bot.command("/start", async (ctx) => await processAction("launch", ctx.from));

bot.on("message", async (ctx) => {
  const msg = ctx.message;
  const { from, text } = msg;

  console.log("DBG: ", from);

  if (msg.successful_payment) {
    await processAction("complete", from);

    const id = from.id.toString();
    await db
      .collection("students")
      .doc(id)
      .update({ pagamento: msg.successful_payment });
  } else {
    await processMsg(text, from);
  }
});

const processAction = async (action, from) => {
  const response = await axios({
    method: "POST",
    baseURL: "https://general-runtime.voiceflow.com",
    url: `/state/${versionID}/user/${from.username}/interact`,
    headers: {
      Authorization: apiKey,
    },
    data: {
      action: {
        type: action,
      },
    },
  });

  for (const data of response.data) {
    const processor = typeProcessors[data.type];
    if (processor)
      await processor({
        data,
        from,
        id: from.id.toString(),
        bot,
        db,
        STRIPE_TEST,
      });
  }
};

const processMsg = async (text, from) => {
  console.log("DBG: SENT", text);
  const response = await axios({
    method: "POST",
    baseURL: "https://general-runtime.voiceflow.com",
    url: `/state/${versionID}/user/${from.username}/interact`,
    headers: {
      Authorization: apiKey,
    },
    data: {
      action: {
        type: "text",
        payload: text,
      },
      config: {
        stopTypes: ["pay"],
      },
    },
  });

  for (const data of response.data) {
    const processor = typeProcessors[data.type];
    if (processor)
      await processor({
        data,
        from,
        id: from.id.toString(),
        bot,
        db,
        STRIPE_TEST,
      });
  }
};
