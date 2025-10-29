// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const editProfileBtn = document.getElementById('edit-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');

// Profile card elements
const profileName = document.getElementById('profile-name');
const profileUniversity = document.getElementById('profile-university');
const profileSkills = document.getElementById('profile-skills');

// Form input elements
const profileForm = document.getElementById('profile-form');
const firstNameInput = document.getElementById('firstName');
const lastNameInput = document.getElementById('lastName');
const emailInput = document.getElementById('email');
const universityInput = document.getElementById('university');
const majorInput = document.getElementById('major');
const graduationYearInput = document.getElementById('graduationYear');

let currentUser = null; // Variable to hold the current user's data

// --- AUTHENTICATION & DATA LOADING ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const userData = docSnap.data();
            populateProfileData(userData, user.email);
        } else {
            console.log("No such document in Firestore!");
            populateProfileData({}, user.email); // Populate with default/empty data
        }
        
        loader.classList.add('hidden');
        pageContent.classList.remove('hidden');
        pageContent.classList.add('flex');

    } else {
        window.location.href = 'auth.html';
    }
});

function populateProfileData(userData, email) {
    // Populate profile card
    profileName.textContent = `${userData.firstName || ''} ${userData.lastName || 'User'}`;
    profileUniversity.textContent = userData.university || 'University not specified';
    
    // Populate form fields
    firstNameInput.value = userData.firstName || '';
    lastNameInput.value = userData.lastName || '';
    emailInput.value = email; // Email is not editable
    universityInput.value = userData.university || '';
    majorInput.value = userData.major || '';
    graduationYearInput.value = userData.graduationYear || '';

    // Handle skills display
    if (userData.skills && Array.isArray(userData.skills)) {
        profileSkills.innerHTML = ''; // Clear existing skills
        userData.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full';
            skillTag.textContent = skill;
            profileSkills.appendChild(skillTag);
        });
    }
}


// --- EDIT AND SAVE PROFILE LOGIC ---
const allInputs = profileForm.querySelectorAll('input');

if(editProfileBtn){
    editProfileBtn.addEventListener('click', () => {
        // Enable all input fields except email
        allInputs.forEach(input => {
            if (input.id !== 'email') {
                input.disabled = false;
            }
        });
        
        // Toggle button visibility
        editProfileBtn.classList.add('hidden');
        saveProfileBtn.classList.remove('hidden');
    });
}

if(saveProfileBtn){
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUser) return;

        // Create an object with the updated data
        const updatedData = {
            firstName: firstNameInput.value,
            lastName: lastNameInput.value,
            university: universityInput.value,
            major: majorInput.value,
            graduationYear: graduationYearInput.value,
        };

        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            await updateDoc(userDocRef, updatedData);
            
            alert("Profile updated successfully!");

            // Disable fields and toggle buttons back to view mode
            allInputs.forEach(input => {
                if(input.id !== 'email') input.disabled = true;
            });
            saveProfileBtn.classList.add('hidden');
            editProfileBtn.classList.remove('hidden');

            // Refresh the displayed data by merging with existing data
            const docSnap = await getDoc(userDocRef);
            if(docSnap.exists()){
                 populateProfileData(docSnap.data(), currentUser.email);
            }

        } catch (error) {
            console.error("Error updating profile: ", error);
            alert("Failed to update profile. Please try again.");
        }
    });
}

