// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// --- AUTHENTICATION & DATA LOADING ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const userData = docSnap.data();
                if (userData.role === 'company') {
                    // If a company user somehow lands here, redirect them
                    window.location.href = 'company-dashboard.html';
                    return;
                }
                let displayName = userData.firstName || user.email.split('@')[0];
                welcomeMessage.textContent = `Welcome back, ${displayName}!`;

                // --- DATA FETCHING FOR DASHBOARD WIDGETS ---
                await Promise.all([
                    fetchApplicationStats(user.uid),
                    fetchRecentApplications(user.uid),
                    fetchUpcomingInterviews(user.uid)
                ]);

            } else {
                console.log("No such document in Firestore!");
                welcomeMessage.textContent = `Welcome, ${user.email.split('@')[0]}!`;
                 // Hide loader even if no data, but show default page state
                loader.classList.add('hidden');
                pageContent.classList.remove('hidden');
                pageContent.classList.add('flex');
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
            const dashboardContainer = document.querySelector('main');
            dashboardContainer.innerHTML = '<p class="text-center text-red-500">Could not load dashboard. Please try again later.</p>';
        } finally {
            // Ensure loader is always hidden after checks
            loader.classList.add('hidden');
            pageContent.classList.remove('hidden');
            pageContent.classList.add('flex');
        }
    } else {
        // User is signed out, redirect to the new auth page
        console.log("User is not signed in. Redirecting to login.");
        window.location.href = 'auth.html';
    }
});


async function fetchApplicationStats(userId) {
    // This is a placeholder. You'll need an 'applications' collection
    // where each document has a 'userId' and 'status' field.
    document.getElementById('applications-count').textContent = '12';
    document.getElementById('interviews-count').textContent = '3';
    document.getElementById('offers-count').textContent = '1';
}

async function fetchRecentApplications(userId) {
    // Placeholder function.
    const container = document.getElementById('recent-applications-list');
    container.innerHTML = `
        <div class="list-item">
            <div>
                <h4 class="font-medium text-foreground">Frontend Developer Intern</h4>
                <p class="text-sm text-foreground/60">TechCorp - San Francisco, CA</p>
            </div>
            <span class="status-badge status-yellow">Under Review</span>
        </div>
        <div class="list-item">
            <div>
                <h4 class="font-medium text-foreground">UX Design Intern</h4>
                <p class="text-sm text-foreground/60">Design Studio - New York, NY</p>
            </div>
            <span class="status-badge status-blue">Interview</span>
        </div>
    `;
}

async function fetchUpcomingInterviews(userId) {
     // Placeholder function.
    const container = document.getElementById('upcoming-interviews-list');
    container.innerHTML = `
        <div class="list-item !flex-col !items-start gap-2">
            <h4 class="font-medium text-foreground">UX Design Intern</h4>
            <p class="text-sm text-foreground/60">Design Studio</p>
            <div class="text-xs text-foreground/80 font-medium bg-white px-2 py-1 rounded-md border">
                Oct 28, 2025 at 2:00 PM
            </div>
        </div>
    `;
}
