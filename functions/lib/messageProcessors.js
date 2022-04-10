"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const consts_1 = require("./consts");
const admin = require("firebase-admin");
admin.initializeApp();
const messageProcessors = {
    text: async ({ from, payload, telegramService }) => {
        let textMessage = payload.message;
        // Apply Substitutions
        textMessage = textMessage.replace("FIRST_NAME", from.first_name);
        await telegramService.sendText(textMessage, from);
    },
    choice: async ({ from, payload, telegramService }) => {
        const options = payload.buttons.map((choice) => choice.name);
        const header = options.shift();
        await telegramService.sendButtons(options, from, header);
    },
    save: async ({ from, payload }) => {
        const jsonPayload = JSON.parse(payload);
        await admin
            .firestore()
            .collection("students")
            .doc(String(from.id))
            .set(jsonPayload);
    },
    animation: async ({ from, payload, telegramService }) => {
        await telegramService.sendAnimation(payload, from);
    },
    audio: async ({ from, payload, telegramService }) => {
        await telegramService.sendAudio(payload, from);
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
    createUser: async ({ from, payload }) => {
        var _a;
        await admin
            .firestore()
            .collection("students")
            .doc(String(from.id))
            .set({ name: from.first_name, lastName: (_a = from.last_name) !== null && _a !== void 0 ? _a : "" }, { merge: true });
    },
    menu: async ({ from, telegramService }, mocks) => {
        const studentData = mocks.studentData ||
            (await admin
                .firestore()
                .collection("students")
                .doc(String(from.id))
                .get()).data();
        let finishedBlocks = 0;
        const options = consts_1.BLOCKS.map((blockName, index) => {
            var _a;
            let finished = false;
            if ((_a = studentData === null || studentData === void 0 ? void 0 : studentData.finishedBlocks) === null || _a === void 0 ? void 0 : _a[index + 1]) {
                finished = true;
                finishedBlocks += 1;
            }
            return blockName + (finished ? " ✅" : "");
        });
        if (finishedBlocks === consts_1.BLOCKS.length) {
            options.unshift("📜 Emitir Certificado 📜");
            //Set emission date
            if (!(studentData === null || studentData === void 0 ? void 0 : studentData.certificateEmissionDate)) {
                const date = new Date();
                const monthName = date.toLocaleDateString("pt-BR", { month: "long" });
                await admin
                    .firestore()
                    .collection("students")
                    .doc(String(from.id))
                    .set({
                    certificateEmissionDate: `${date.getDate()} de ${monthName}, ${date.getFullYear()}`,
                }, { merge: true });
            }
        }
        await telegramService.sendButtons(options, from, "Qual bloco você quer começar?");
    },
    pay: async ({ from, telegramService }) => {
        await telegramService.sendInvoice(from);
        await telegramService.sendButtons(["Pagar depois"], from, "Clique no botão acima para fazer o pagamento ⬆️");
    },
    paymentComplete: async ({ from, payload }) => {
        await admin
            .firestore()
            .collection("students")
            .doc(String(from.id))
            .update({ pagamento: payload });
    },
};
exports.default = messageProcessors;
//# sourceMappingURL=messageProcessors.js.map