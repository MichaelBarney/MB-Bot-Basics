import { BLOCKS } from "./consts";
import { User } from "telegraf/typings/core/types/typegram";
import TelegramService from "./services/TelegramService";
import * as admin from "firebase-admin";

admin.initializeApp();

interface processorDTO {
  from: User;
  payload: any;
  telegramService: TelegramService;
}

interface processorFunction {
  (dto: processorDTO, mocks?: any): Promise<void>;
}

const messageProcessors: { [type: string]: processorFunction } = {
  text: async ({ from, payload, telegramService }) => {
    let textMessage = payload.message;
    textMessage = textMessage.replace("FIRST_NAME", from.first_name);
    await telegramService.sendText(textMessage, from);
  },

  choice: async ({ from, payload, telegramService }) => {
    const options = payload.buttons.map((choice: any) => choice.name);
    const header = options.shift();
    await telegramService.sendButtons(options, from, header);
  },
  animation: async ({ from, payload, telegramService }) => {
    await telegramService.sendAnimation(payload, from);
  },

  audio: async ({ from, payload, telegramService }) => {
    await telegramService.sendAudio(payload, from);
  },

  // Database Actions
  createUser: async ({ from, payload }) => {
    await admin
      .firestore()
      .collection("students")
      .doc(String(from.id))
      .set(
        { name: from.first_name, lastName: from.last_name ?? "" },
        { merge: true }
      );
  },
  save: async ({ from, payload }) => {
    const jsonPayload = JSON.parse(payload);
    await admin
      .firestore()
      .collection("students")
      .doc(String(from.id))
      .set(jsonPayload);
  },
  saveAnswer: async ({ from, payload }) => {
    const { question, correct } = JSON.parse(payload);
    const key = `answers.${question}`;
    await admin
      .firestore()
      .collection("students")
      .doc(String(from.id))
      .update({ [key]: correct });
  },
  finishBlock: async ({ from, payload }) => {
    const block = parseInt(payload);
    const key = `finishedBlocks.${block}`;
    await admin
      .firestore()
      .collection("students")
      .doc(String(from.id))
      .update({ [key]: true });
  },

  // Main Menu
  menu: async ({ from, telegramService }, mocks) => {
    const studentData =
      mocks.studentData ||
      (
        await admin
          .firestore()
          .collection("students")
          .doc(String(from.id))
          .get()
      ).data();

    let finishedBlocks = 0;
    const options = BLOCKS[from.language_code === "en" ? "en" : "pt"].map(
      (blockName, index) => {
        let finished = false;

        if (studentData?.finishedBlocks?.[index + 1]) {
          finished = true;
          finishedBlocks += 1;
        }
        return blockName + (finished ? " ✅" : "");
      }
    );

    // Check if certificate can be emitted
    if (finishedBlocks === BLOCKS.pt.length) {
      options.unshift(
        _localizedString(
          from,
          "📜 Emit Certificate 📜",
          "📜 Emitir Certificado 📜"
        )
      );

      //Set emission date
      if (!studentData?.certificateEmissionDate) {
        const date = new Date();
        const monthName = date.toLocaleDateString(
          _localizedString(from, "en", "pt-BR"),
          { month: "long" }
        );
        await admin
          .firestore()
          .collection("students")
          .doc(String(from.id))
          .set(
            {
              certificateEmissionDate: _localizedString(
                from,
                `${monthName} ${date.getDate()}, ${date.getFullYear()}`,
                `${date.getDate()} de ${monthName}, ${date.getFullYear()}`
              ),
            },
            { merge: true }
          );
      }
    }
    await telegramService.sendButtons(
      options,
      from,
      _localizedString(
        from,
        "Which block do you want to start?",
        "Qual bloco você quer começar?"
      )
    );
  },

  // Payments
  pay: async ({ from, telegramService }) => {
    await telegramService.sendInvoice(from);
    await telegramService.sendButtons(
      ["Pagar depois"],
      from,
      _localizedString(
        from,
        "Click the button above to make the payment ⬆️",
        "Clique no botão acima para fazer o pagamento ⬆️"
      )
    );
  },

  paymentComplete: async ({ from, payload }) => {
    await admin
      .firestore()
      .collection("students")
      .doc(String(from.id))
      .update({ pagamento: payload });
  },
};

const _localizedString = (from: User, en: string, pt: string) => {
  if (from.language_code === "en") return en;
  else return pt;
};

export default messageProcessors;
