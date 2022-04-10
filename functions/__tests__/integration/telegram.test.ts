import TelegramService from "../../src/services/TelegramService";
const telegramService = new TelegramService();

const telegramUser = {
  username: "tester",
  id: 123,
  is_bot: false,
  first_name: "Test",
};

it("Can send text messages", async () => {
  await telegramService.sendText("Hello World", telegramUser, {
    telegram: {
      sendMessage: async (id, text, extra) => {
        expect(text).toBe("Hello World");
      },
      sendInvoice: async (id, invoice) => {},
    },
  });
});

it("Can send button messages", async () => {
  await telegramService.sendButtons(
    ["Option 1", "Option 2"],
    telegramUser,
    "Header",
    undefined,
    {
      telegram: {
        sendMessage: async (id, header, extras) => {
          expect(header).toBe("Header");
          expect(extras.reply_markup.keyboard[0][0].text).toBe("Option 1");
        },
        sendInvoice: async (id, invoice) => {},
      },
    }
  );
});

it("Can send invoices", async () => {
  await telegramService.sendInvoice(telegramUser, {
    telegram: {
      sendInvoice: async (id, invoice) => {
        expect(invoice.title).toBe("Certificação");
        expect(invoice.prices[0].amount).toBe(2000);
      },
      sendMessage: async (id, invoice) => {},
    },
  });
});
