import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuTqAWpb5PWWNA6icwJem1k_GgkNP2YS4",
  authDomain: "planning-with-ai-d0c11.firebaseapp.com",
  projectId: "planning-with-ai-d0c11",
  storageBucket: "planning-with-ai-d0c11.appspot.com",
  messagingSenderId: "298898728349",
  appId: "1:298898728349:web:bb1cfdcdc43ed3b0ea3b74"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const postJobForm = document.getElementById('post-job-form');
const submitButton = document.getElementById('submit-button');
const formMessage = document.getElementById('form-message');

let currentUser = null;
let companyData = {};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists() && userDocSnap.data().role === 'company') {
            companyData = userDocSnap.data();
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
});

postJobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    submitButton.disabled = true;
    submitButton.textContent = 'Posting...';
    formMessage.classList.add('hidden');

    const title = postJobForm.title.value;
    const location = postJobForm.location.value;
    const jobType = postJobForm.jobType.value;
    const salary = postJobForm.salary.value;
    const description = postJobForm.description.value;
    const skills = postJobForm.skills.value.split(',').map(skill => skill.trim()).filter(Boolean);

    try {
        await addDoc(collection(db, 'jobs'), {
            title,
            location,
            jobType,
            salary,
            description,
            skills,
            companyId: currentUser.uid,
            companyName: companyData.companyName,
            postedAt: serverTimestamp()
        });

        formMessage.textContent = 'Job posted successfully! Redirecting...';
        formMessage.className = 'status-badge status-green mb-4';
        formMessage.classList.remove('hidden');

        setTimeout(() => {
            window.location.href = 'company-dashboard.html';
        }, 2000);

    } catch (error) {
        console.error("Error posting job: ", error);
        formMessage.textContent = 'An error occurred. Please try again.';
        formMessage.className = 'status-badge status-red mb-4';
        formMessage.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.textContent = 'Post Job Listing';
    }
});
