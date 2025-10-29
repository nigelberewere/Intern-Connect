import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// --- ANIMATION LOGIC ---
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const studentTab = document.getElementById('student-tab');
const companyTab = document.getElementById('company-tab');
const studentFields = document.getElementById('student-fields');
const companyFields = document.getElementById('company-fields');

if (signUpButton) {
    signUpButton.addEventListener('click', () => container.classList.add('right-panel-active'));
}
if (signInButton) {
    signInButton.addEventListener('click', () => container.classList.remove('right-panel-active'));
}

if (studentTab) {
    studentTab.addEventListener('click', () => {
        studentTab.classList.add('active');
        companyTab.classList.remove('active');
        studentFields.classList.remove('hidden');
        companyFields.classList.add('hidden');
    });
}

if (companyTab) {
    companyTab.addEventListener('click', () => {
        companyTab.classList.add('active');
        studentTab.classList.remove('active');
        companyFields.classList.remove('hidden');
        studentFields.classList.add('hidden');
    });
}

// Handle URL hash for direct linking
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.hash === '#signup') {
        container.classList.add('right-panel-active');
    }
    if (window.location.hash === '#signup-company') {
        container.classList.add('right-panel-active');
        setTimeout(() => companyTab.click(), 100);
    }
});


// --- FIREBASE AUTH LOGIC ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorLogin = document.getElementById('error-message-login');
const errorSignup = document.getElementById('error-message-signup');

if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorLogin.textContent = '';
        const email = loginForm.loginEmail.value;
        const password = loginForm.loginPassword.value;

        signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().role === 'company') {
                    window.location.href = 'company-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch(error => {
                errorLogin.textContent = getFriendlyErrorMessage(error.code);
            });
    });
}


if(signupForm){
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorSignup.textContent = '';
        const isStudent = studentTab.classList.contains('active');

        const email = isStudent ? signupForm.studentEmail.value : signupForm.companyEmail.value;
        const password = isStudent ? signupForm.studentPassword.value : signupForm.companyPassword.value;
        const confirmPassword = isStudent ? signupForm.studentConfirmPassword.value : signupForm.companyConfirmPassword.value;

        if (password !== confirmPassword) {
            errorSignup.textContent = "Passwords do not match.";
            return;
        }

        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                let userData = { email: user.email, createdAt: new Date() };

                if (isStudent) {
                    userData.role = 'student';
                    userData.firstName = signupForm.firstName.value;
                    userData.lastName = signupForm.lastName.value;
                    userData.university = ""; // Default empty value
                } else {
                    userData.role = 'company';
                    userData.companyName = signupForm.companyName.value;
                    userData.website = signupForm.companyWebsite.value;
                    // Default empty values for other company profile fields
                    userData.industry = "";
                    userData.location = "";
                    userData.description = "";
                    userData.logoUrl = "";
                }

                await setDoc(doc(db, "users", user.uid), userData);
                
                if (userData.role === 'company') {
                    window.location.href = 'company-dashboard.html';
                } else {
                    window.location.href = 'student-dashboard.html';
                }
            })
            .catch(error => {
                errorSignup.textContent = getFriendlyErrorMessage(error.code);
            });
    });
}


function getFriendlyErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Invalid email or password.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        default:
            return 'An unexpected error occurred. Please try again.';
    }
}

