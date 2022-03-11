import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.1/firebase-app.js";
import { getFirestore, getDoc, doc} from "https://www.gstatic.com/firebasejs/9.1.1/firebase-firestore.js"

const firebaseConfig = {
    apiKey: "AIzaSyDGkDBbq4R5rOiTnu67BoWd6APDKrJRNyc",
    authDomain: "mb-bot-basics.firebaseapp.com",
    projectId: "mb-bot-basics",
    storageBucket: "mb-bot-basics.appspot.com",
    messagingSenderId: "515207181768",
    appId: "1:515207181768:web:e0214be882a2e4419afcfd"
};

const href = window.location.href
const url = new URL(href)
const id = url.searchParams.get('s')

console.log("ID:", id)
// Initialize Firebase
const app = initializeApp(firebaseConfig);

const db = getFirestore();

const userDoc = doc(db, `students/${id}`)

const studentSnapshot = await getDoc(userDoc)

const studentName = document.getElementById('student_name');
const status = document.getElementById('status')
const ul = document.getElementById('answers')

if (studentSnapshot.exists()) { 
    const studentData = studentSnapshot.data();
    console.log("Student: ", studentData)
    studentName.textContent = studentData.name;
    if (Object.keys(studentData.finishedBlocks).length == 2 && studentData.pagamento) {
        status.textContent = "OK!"

        for (const answerKey of Object.keys(studentData.answers).sort()) {
            const correct = studentData.answers[answerKey]

            var li = document.createElement("li");
            li.appendChild(document.createTextNode(`${answerKey} - ${correct ? "✅" : "❌"}`))
            ul.appendChild(li)
        }

    } else { 
        status.textContent = "MISSING"
    }
}

