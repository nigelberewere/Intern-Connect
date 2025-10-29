import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// --- ELEMENTS ---
const loader = document.getElementById('loader');
const pageContent = document.getElementById('page-content');
const companyProfileForm = document.getElementById('company-profile-form');
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');
const companyLogo = document.getElementById('company-logo');

// Form inputs
const allInputs = companyProfileForm.querySelectorAll('input, textarea, select');
const companyNameInput = document.getElementById('companyName');
const logoUrlInput = document.getElementById('logoUrl');
const industryInput = document.getElementById('industry');
const locationInput = document.getElementById('location');
const websiteInput = document.getElementById('website');
const descriptionInput = document.getElementById('description');
const companySizeInput = document.getElementById('companySize');

let currentUser = null;

// --- AUTH & DATA LOADING ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const userDocRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists() && docSnap.data().role === 'company') {
            populateForm(docSnap.data());
        } else {
            window.location.href = 'login.html';
        }
    } else {
        window.location.href = 'login.html';
    }
    loader.classList.add('hidden');
    pageContent.classList.remove('hidden');
    pageContent.classList.add('flex');
});

function populateForm(data) {
    companyNameInput.value = data.companyName || '';
    logoUrlInput.value = data.logoUrl || '';
    industryInput.value = data.industry || '';
    locationInput.value = data.location || '';
    websiteInput.value = data.website || '';
    descriptionInput.value = data.description || '';
    companySizeInput.value = data.companySize || '1-10 employees';
    
    if (data.logoUrl) {
        companyLogo.src = data.logoUrl;
    }
}

// --- EDIT & SAVE LOGIC ---
editProfileBtn.addEventListener('click', () => {
    allInputs.forEach(input => input.disabled = false);
    editProfileBtn.classList.add('hidden');
    saveProfileBtn.classList.remove('hidden');
});

saveProfileBtn.addEventListener('click', async () => {
    if (!currentUser) return;

    const updatedData = {
        companyName: companyNameInput.value,
        logoUrl: logoUrlInput.value,
        industry: industryInput.value,
        location: locationInput.value,
        website: websiteInput.value,
        description: descriptionInput.value,
        companySize: companySizeInput.value,
    };

    try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, updatedData);
        alert("Profile updated successfully!");
        
        // Update logo preview on save
        if(updatedData.logoUrl) {
            companyLogo.src = updatedData.logoUrl;
        }

        allInputs.forEach(input => input.disabled = true);
        saveProfileBtn.classList.add('hidden');
        editProfileBtn.classList.remove('hidden');
    } catch (error) {
        console.error("Error updating profile: ", error);
        alert("Failed to update profile.");
    }
});
