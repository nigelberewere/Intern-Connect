import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
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
const mobileToSignin = document.getElementById('mobile-to-signin');
const mobileToSignup = document.getElementById('mobile-to-signup');
const backBtn = document.getElementById('back-btn');

if (signUpButton) {
    signUpButton.addEventListener('click', () => container.classList.add('right-panel-active'));
}
if (signInButton) {
    signInButton.addEventListener('click', () => container.classList.remove('right-panel-active'));
}

if (mobileToSignin) {
    mobileToSignin.addEventListener('click', () => container.classList.remove('right-panel-active'));
}
if (mobileToSignup) {
    mobileToSignup.addEventListener('click', () => container.classList.add('right-panel-active'));
}

if (backBtn) {
    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
            if (history.length > 1) {
                history.back();
            } else {
                window.location.href = 'index.html';
            }
        } catch (err) {
            window.location.href = 'index.html';
        }
    });
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

        // Forgot password handler: uses email from the login field or prompts the user
        const forgotLink = document.getElementById('forgot-password');
        if (forgotLink) {
            forgotLink.addEventListener('click', async (e) => {
                e.preventDefault();
                // Try to use the email already entered in the login form
                const entered = document.getElementById('loginEmail') ? document.getElementById('loginEmail').value.trim() : '';
                let targetEmail = entered && entered.includes('@') ? entered : '';

                if (!targetEmail) {
                    targetEmail = prompt('Enter your account email to receive a password reset link:');
                    if (!targetEmail) return;
                    targetEmail = targetEmail.trim();
                }

                try {
                    await sendPasswordResetEmail(auth, targetEmail);
                    const successMsg = 'Password reset email sent — check your inbox and your spam/junk folder.';
                    if (errorLogin) {
                        errorLogin.textContent = successMsg;
                    } else {
                        alert(successMsg);
                    }
                } catch (err) {
                    const message = getFriendlyErrorMessage(err.code) || 'Failed to send password reset email.';
                    if (errorLogin) {
                        errorLogin.textContent = message;
                    } else {
                        alert(message);
                    }
                }
            });
        }


if(signupForm){
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorSignup.textContent = '';
        const isStudent = studentTab.classList.contains('active');
        // Disable inputs that belong to the hidden role to avoid native browser
        // validation trying to focus hidden required controls (causes the
        // "An invalid form control with name='' is not focusable" error).
        const studentInputs = studentFields.querySelectorAll('input,textarea,select');
        const companyInputs = companyFields.querySelectorAll('input,textarea,select');
        if (isStudent) {
            companyInputs.forEach(i => { i.disabled = true; });
            studentInputs.forEach(i => { i.disabled = false; });
        } else {
            studentInputs.forEach(i => { i.disabled = true; });
            companyInputs.forEach(i => { i.disabled = false; });
        }

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
        // Re-enable all inputs after attempt (in case user stays on the page)
        studentInputs.forEach(i => { i.disabled = false; });
        companyInputs.forEach(i => { i.disabled = false; });
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

