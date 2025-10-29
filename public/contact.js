import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCuTqAWpb5PWWNA6icwJem1k_GgkNP2YS4",
  authDomain: "planning-with-ai-d0c11.firebaseapp.com",
  projectId: "planning-with-ai-d0c11",
  storageBucket: "planning-with-ai-d0c11.appspot.com",
  messagingSenderId: "298898728349",
  appId: "1:298898728349:web:bb1cfdcdc43ed3b0ea3b74"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const contactForm = document.getElementById('contact-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');
const submitButton = document.getElementById('submit-button');


contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Disable button to prevent multiple submissions
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';

    // Hide previous messages
    successMessage.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const name = contactForm.name.value;
        const email = contactForm.email.value;
        const subject = contactForm.subject.value;
        const message = contactForm.message.value;

        // Add a new document with a generated ID to the 'contactSubmissions' collection.
        await addDoc(collection(db, "contactSubmissions"), {
            name: name,
            email: email,
            subject: subject,
            message: message,
            submittedAt: serverTimestamp() // Adds a server-side timestamp
        });
        
        // Show success message and clear form
        successMessage.classList.remove('hidden');
        contactForm.reset();

    } catch (error) {
        console.error("Error adding document: ", error);
        errorMessage.textContent = 'Sorry, there was an error sending your message. Please try again later.';
        errorMessage.classList.remove('hidden');
    } finally {
        // Re-enable button
        submitButton.disabled = false;
        submitButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path><path d="m21.854 2.147-10.94 10.939"></path></svg>
            Send Message
        `;
    }
});
