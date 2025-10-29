// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCuTqAWpb5PWWNA6icwJem1k_GgkNP2YS4",
  authDomain: "planning-with-ai-d0c11.firebaseapp.com",
  projectId: "planning-with-ai-d0c11",
  storageBucket: "planning-with-ai-d0c11.appspot.com",
  messagingSenderId: "298898728349",
  appId: "1:298898728349:web:bb1cfdcdc43ed3b0ea3b74"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Get page elements
const loader = document.getElementById('loader');
const pageContent = document.getElementById('page-content');
const welcomeMessage = document.getElementById('welcome-message');
const userNameDisplay = document.getElementById('user-name');
const logoutButton = document.getElementById('logout-button');

// --- AUTHENTICATION & DATA LOADING ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            
            // Redirect if user is a company
            if (userData.role === 'company') {
                window.location.href = 'company-dashboard.html';
                return; // Stop further execution
            }

            let displayName = userData.firstName || user.email.split('@')[0];

            // Populate the page with user data
            welcomeMessage.textContent = `Welcome back, ${displayName}!`;
            if(userNameDisplay) {
                userNameDisplay.textContent = `${displayName}`;
            }

        } else {
            console.log("No such document in Firestore! Using fallback.");
            welcomeMessage.textContent = `Welcome back, ${user.email.split('@')[0]}!`;
             if(userNameDisplay) {
                userNameDisplay.textContent = user.email.split('@')[0];
            }
        }
        
        // Show page content and hide loader
        loader.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.classList.add('flex');

    } else {
        // User is signed out, redirect to login page
        window.location.href = 'auth.html';
    }
});

// --- LOGOUT FUNCTIONALITY ---
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        signOut(auth).then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Sign out error:", error);
        });
    });
}
