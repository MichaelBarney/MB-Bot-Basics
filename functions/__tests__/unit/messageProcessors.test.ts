import { FirebaseDocument } from "./../../src/messageProcessors";
process.env.GOOGLE_APPLICATION_CREDENTIALS = "service-account.json";

import messageProcessors from "../../src/messageProcessors";
import TelegramService from "../../src/services/TelegramService";

import * as admin from "firebase-admin";
import { firestore } from "firebase-admin";
admin.initializeApp();

const telegramUser = {
  username: "tester",
  id: 123,
  is_bot: false,
  first_name: "Test",
};

const document = admin
  .firestore()
  .collection("students")
  .doc(telegramUser.id.toString());

jest.setTimeout(50000);

describe("messageProcessors", () => {
  it("Can process text messages", async () => {
    const textMessage = "Hello!";
    await messageProcessors.text({
      from: telegramUser,
      payload: {
        message: textMessage,
      },
      telegramService: {
        sendText: async (processedMessage, from) => {
          expect(processedMessage).toBe(textMessage);
        },
      } as TelegramService,
      document,
    });
  });

  it("Can substitute the user's name", async () => {
    const textMessage = "Hi FIRST_NAME!";
    await messageProcessors.text({
      from: telegramUser,
      payload: {
        message: textMessage,
      },
      telegramService: {
        sendText: async (processedMessage, from) => {
          expect(processedMessage).toBe(
            textMessage.replace("FIRST_NAME", from.first_name)
          );
        },
      } as TelegramService,
      document,
    });
  });

  it("Can process button messages", async () => {
    await messageProcessors.choice({
      from: telegramUser,
      payload: {
        buttons: [
          {
            name: "Title",
          },
          {
            name: "Option 1",
          },

          {
            name: "Option 2",
          },
        ],
      },
      telegramService: {
        sendButtons: async (options, from, header) => {
          expect(options).toStrictEqual(["Option 1", "Option 2"]);
          expect(header).toBe("Title");
        },
      } as TelegramService,
      document,
    });
  });

  it("Can save data to the user", async () => {
    await messageProcessors.save({
      from: telegramUser,
      payload: '{"result":true}',
      telegramService: {} as TelegramService,
      document,
    });

    const userDataAfter = await admin
      .firestore()
      .collection("students")
      .doc(telegramUser.id.toString())
      .get();

    const result = userDataAfter.data()?.result;

    expect(result).toBe(true);
  });

  it("Can save a user's quiz answer", async () => {
    await messageProcessors.saveAnswer({
      from: telegramUser,
      payload: '{"question":"B1Q2", "correct":true}',
      telegramService: {} as TelegramService,
      document,
    });

    const userDataAfter = await admin
      .firestore()
      .collection("students")
      .doc(telegramUser.id.toString())
      .get();

    const answer = userDataAfter.data()?.answers.B1Q2;
    expect(answer).toBe(true);
  });

  it("Can finish a user's block", async () => {
    await messageProcessors.finishBlock({
      from: telegramUser,
      payload: "1",
      telegramService: {} as TelegramService,
      document,
    });

    const userDataAfter = await admin
      .firestore()
      .collection("students")
      .doc(telegramUser.id.toString())
      .get();

    const finishedBlock = userDataAfter.data()?.finishedBlocks["1"];
    expect(finishedBlock).toBe(true);
  });

  it("Can generate the user's menu", async () => {
    const studentData = {
      finishedBlocks: {
        1: true,
      },
    };

    await messageProcessors.menu({
      from: telegramUser,
      payload: "",
      telegramService: {
        sendButtons: async (options, from, header) => {
          expect(options[0]).toContain("✅");
          expect(options[1]).not.toContain("✅");
          expect(options.length).toBe(5);
        },
      } as TelegramService,
      document: {
        get: async () => {
          return {
            data: () => {
              return studentData as FirebaseFirestore.DocumentData;
            },
          };
        },
      } as FirebaseDocument,
    });
  });
  it("Can add certificate generation to the menu", async () => {
    const studentData = {
      finishedBlocks: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
      },
    };

    await messageProcessors.menu({
      from: telegramUser,
      payload: "",
      telegramService: {
        sendButtons: async (options, from, header) => {
          expect(options[0]).toBe("📜 Emitir Certificado 📜");
        },
      } as TelegramService,
      document: {
        get: async () => {
          return {
            data: () => {
              return studentData as FirebaseFirestore.DocumentData;
            },
          };
        },
        set: async (data, options) => {
          expect(data.certificateEmissionDate).toContain(
            new Date().getDate().toString()
          );
          return {
            updateTime: new firestore.Timestamp(0, 0),
            writeTime: new firestore.Timestamp(0, 0),
            isEqual: (other) => {
              return true;
            },
          } as FirebaseFirestore.WriteResult;
        },
      } as FirebaseDocument,
    });
  });

  it("Can finish payments", async () => {
    await messageProcessors.paymentComplete({
      from: telegramUser,
      payload: "successful_payment",
      telegramService: {} as TelegramService,
      document,
    });

    const userDataAfter = await admin
      .firestore()
      .collection("students")
      .doc(telegramUser.id.toString())
      .get();

    const payment = userDataAfter.data()?.pagamento;

    expect(payment).toBe("successful_payment");
  });
});
