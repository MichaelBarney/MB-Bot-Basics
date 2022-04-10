import { Telegraf } from "telegraf";
import { User } from "telegraf/typings/core/types/typegram";
import * as functions from "firebase-functions";

const isEmulated = process.env.FUNCTIONS_EMULATOR === "true";

const STRIPE_TEST_KEY: string = functions.config().stripe.test;

const TELEGRAM_TOKEN: string = isEmulated
  ? functions.config().telegram.tokens.test
  : functions.config().telegram.tokens.prod;

interface BotMock {
  telegram: {
    sendMessage(id: number, text: string, extra: any): Promise<void>;
    sendInvoice(id: number, invoice: any): Promise<void>;
  };
}

class TelegramService {
  bot = new Telegraf(TELEGRAM_TOKEN, {
    telegram: { webhookReply: true },
  });

  async sendText(text: string, to: User, botMock?: BotMock) {
    const id = to.id;
    const usableBot = botMock || this.bot;
    await usableBot.telegram.sendMessage(id, text, {
      parse_mode: "Markdown",
    });
  }

  async sendButtons(
    options: string[],
    to: User,
    header?: string,
    placeholder?: string,
    botMock?: BotMock
  ) {
    const id = to.id;

    const buttons = options.map((option) => {
      return [{ text: option, callback_data: option }];
    });

    const usableBot = botMock || this.bot;

    await usableBot.telegram.sendMessage(id, header ?? "Escolha uma opção:", {
      reply_markup: {
        keyboard: buttons,
        resize_keyboard: true,
        one_time_keyboard: true,
        input_field_placeholder: placeholder ?? options[0],
      },
    });
  }

  async sendAnimation(url: string, to: User) {
    await this.bot.telegram.sendAnimation(to.id, url);
  }

  async sendAudio(url: string, to: User) {
    await this.bot.telegram.sendAudio(to.id, url);
  }

  async sendInvoice(
    to: User,
    productName: string,
    description: string,
    priceInBRL: number,
    botMock?: BotMock
  ) {
    const price = priceInBRL * 100;
    const invoice = {
      chat_id: to.id, // Unique identifier of the target chat or username of the target channel
      provider_token: STRIPE_TEST_KEY,
      start_parameter: "pagar", // Unique parameter for deep links. If you leave this field blank, forwarded copies of the forwarded message will have a Pay button that allows multiple users to pay directly from the forwarded message using the same account. If not empty, redirected copies of the sent message will have a URL button with a deep link to the bot (instead of a payment button) with a value used as an initial parameter.
      title: productName, // Product name, 1-32 characters
      description, // Product description, 1-255 characters
      currency: "BRL", // ISO 4217 Three-Letter Currency Code
      prices: [
        {
          label: productName,
          amount: price,
        },
      ], // Price breakdown, serialized list of components in JSON format 100 kopecks * 100 = 100 rubles
      payload: String(to.id + Date.now()),
    };

    const usableBot = botMock || this.bot;
    await usableBot.telegram.sendInvoice(to.id, invoice);
  }
}

export default TelegramService;
