import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import {
  getFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDGkDBbq4R5rOiTnu67BoWd6APDKrJRNyc",
  authDomain: "mb-bot-basics.firebaseapp.com",
  projectId: "mb-bot-basics",
  storageBucket: "mb-bot-basics.appspot.com",
  messagingSenderId: "515207181768",
  appId: "1:515207181768:web:e0214be882a2e4419afcfd",
};

const id = window.location.pathname.replace("/", "");

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

const userDoc = doc(db, `students/${id}`);

const studentSnapshot = await getDoc(userDoc);

const studentName = document.getElementById("studentName");
const answers = document.getElementById("answers");
const certificateLink = document.getElementById("certificateLink");
const emissionDate = document.getElementById("emissionDate");

const blockNames = [
  "Tecnologias Importantes",
  "Construindo Conversas",
  "Bots no WhatsApp",
  "Criando Voicebots",
  "Programando Ações",
];

const percentageBar = (percentage) => {
  const percentageBar = document.createElement("div");
  percentageBar.classList.add("percentageBar");
  percentageBar.style.width = percentage;
  percentageBar.innerText = `${percentage}`;
  return percentageBar;
};

if (studentSnapshot.exists()) {
  const studentData = studentSnapshot.data();
  console.log("DBG Student Data: ", studentData);
  studentName.textContent = `${studentData.name} ${studentData.lastName ?? ""}`;
  certificateLink.textContent = `https://mb-bot-basics.web.app/${id}`;
  emissionDate.textContent = studentData.certificateEmissionDate;

  if (studentData.pagamento) {
    let lastBlock = 0;
    let questions = 0;
    let correctAnswers = 0;

    for (const answerKey of Object.keys(studentData.answers).sort()) {
      const regex = /B(\d)Q(\d)/;
      const matches = regex.exec(answerKey);
      const block = matches[1];
      const question = matches[2];
      const correct = studentData.answers[answerKey];

      if (block != lastBlock) {
        if (block != 1) {
          const percentage = `${(100 * correctAnswers) / questions}%`;
          answers.appendChild(percentageBar(percentage));

          questions = 0;
          correctAnswers = 0;
        }

        const blockHeader = document.createElement("h3");
        blockHeader.textContent = `${blockNames[block - 1]}:`;
        answers.appendChild(blockHeader);

        lastBlock = block;
      }

      questions += 1;
      if (correct) correctAnswers += 1;
    }

    const percentage = `${(100 * correctAnswers) / questions}%`;
    answers.appendChild(percentageBar(percentage));
  }
}
