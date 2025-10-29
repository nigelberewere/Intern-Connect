import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const loader = document.getElementById('loader');
const pageContent = document.getElementById('page-content');
const welcomeMessage = document.getElementById('welcome-message');
const statsContainer = document.getElementById('stats-container');
const recentApplicantsCard = document.getElementById('recent-applicants-card');
const activeListingsCard = document.getElementById('active-listings-card');

// --- SKELETON LOADERS ---
function createStatCardSkeleton() {
    return `
        <div class="stat-card p-4">
            <div class="shimmer-wrapper h-5 w-3/4 rounded-md"></div>
            <div class="shimmer-wrapper h-8 w-1/2 mt-2 rounded-md"></div>
        </div>
    `;
}

function createListSkeleton(items = 3) {
    let skeleton = '';
    for(let i=0; i<items; i++) {
        skeleton += `
            <div class="flex items-center space-x-4">
                <div class="shimmer-wrapper h-10 w-10 rounded-full"></div>
                <div class="flex-1 space-y-2">
                    <div class="shimmer-wrapper h-4 w-3/4 rounded-md"></div>
                    <div class="shimmer-wrapper h-3 w-1/2 rounded-md"></div>
                </div>
            </div>
        `;
    }
    return skeleton;
}

function displaySkeletonLoader() {
    let statSkeletons = '';
    for(let i=0; i<4; i++) statSkeletons += createStatCardSkeleton();
    statsContainer.innerHTML = statSkeletons;

    recentApplicantsCard.innerHTML = `<h3 class="card-title-sm mb-4">Recent Applicants</h3><div class="space-y-4">${createListSkeleton(3)}</div>`;
    activeListingsCard.innerHTML = `<h3 class="card-title-sm mb-4">Active Listings</h3><div class="space-y-4">${createListSkeleton(2)}</div>`;
}

// --- AUTH & DATA LOADING ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        displaySkeletonLoader(); // Show skeletons immediately
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                 const userData = docSnap.data();
                 if (userData.role !== 'company') {
                    window.location.href = 'student-dashboard.html';
                    return;
                }
                let displayName = userData.companyName || user.email.split('@')[0];
                welcomeMessage.textContent = `Welcome, ${displayName}`;

                await Promise.all([
                    renderDashboardStats(user.uid),
                    renderRecentApplicants(user.uid),
                    renderActiveListings(user.uid)
                ]);

            } else {
                 console.log("No user data found in Firestore!");
                 welcomeMessage.textContent = `Welcome!`;
                 statsContainer.innerHTML = '<p class="text-center col-span-4">Could not load stats.</p>';
                 recentApplicantsCard.innerHTML = '<p class="text-center">Could not load applicants.</p>';
                 activeListingsCard.innerHTML = '<p class="text-center">Could not load listings.</p>';
            }
        } catch (error) {
            console.error("Error loading dashboard:", error);
            const mainContent = document.querySelector('main');
            if(mainContent) mainContent.innerHTML = `<p class="text-center text-red-500">Could not load dashboard. Please try again later.</p>`;
        } finally {
            loader.classList.add('hidden'); // Hide initial spinner
            pageContent.classList.remove('hidden');
            pageContent.classList.add('flex');
            // Trigger animations
            const animatedItems = document.querySelectorAll('.animate-on-scroll');
            animatedItems.forEach(item => new IntersectionObserver((entries) => {
                entries.forEach(entry => entry.isIntersecting && entry.target.classList.add('animated'));
            }).observe(item));
        }
    } else {
        window.location.href = 'auth.html';
    }
});

// --- RENDER FUNCTIONS ---
async function renderDashboardStats(companyId) {
    const jobsQuery = query(collection(db, 'jobs'), where("companyId", "==", companyId));
    const jobsSnapshot = await getDocs(jobsQuery);
    const jobCount = jobsSnapshot.size;
    
    // In a real app, you'd calculate these with more complex queries or cloud functions
    const totalApplications = 128; // Placeholder
    const newApplicants = 12; // Placeholder
    const interviewing = 8; // Placeholder

    statsContainer.innerHTML = `
        <div class="stat-card animate-on-scroll animate-slide-in-up">
            <p>Total Jobs Posted</p><p class="stat-number">${jobCount}</p>
        </div>
        <div class="stat-card animate-on-scroll animate-slide-in-up" style="animation-delay: 100ms;">
            <p>Total Applications</p><p class="stat-number">${totalApplications}</p>
        </div>
        <div class="stat-card animate-on-scroll animate-slide-in-up" style="animation-delay: 200ms;">
            <p>New Applicants (24h)</p><p class="stat-number">${newApplicants}</p>
        </div>
        <div class="stat-card animate-on-scroll animate-slide-in-up" style="animation-delay: 300ms;">
            <p>Interviewing</p><p class="stat-number">${interviewing}</p>
        </div>
    `;
}

async function renderRecentApplicants(companyId) {
    // This is a placeholder as it requires querying a subcollection or different data structure
    const applicantsHTML = `
        <div class="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
            <div class="flex items-center gap-4">
                <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=JD" alt="Applicant" class="rounded-full">
                <div>
                    <h4 class="font-medium text-foreground">John Doe</h4>
                    <p class="text-sm text-foreground/60">Applied for Frontend Developer</p>
                </div>
            </div>
            <a href="#" class="btn btn-secondary !h-9 !px-4 !text-xs">View Profile</a>
        </div>
        <div class="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
            <div class="flex items-center gap-4">
                <img src="https://placehold.co/40x40/E0E7FF/4F46E5?text=SM" alt="Applicant" class="rounded-full">
                <div>
                    <h4 class="font-medium text-foreground">Sarah Miller</h4>
                    <p class="text-sm text-foreground/60">Applied for UX/UI Designer</p>
                </div>
            </div>
            <a href="#" class="btn btn-secondary !h-9 !px-4 !text-xs">View Profile</a>
        </div>
    `;
    recentApplicantsCard.innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="card-title-sm">Recent Applicants</h3><a href="#" class="text-sm font-medium text-primary hover:underline">View All</a></div><div class="space-y-2">${applicantsHTML}</div>`;
}

async function renderActiveListings(companyId) {
    const jobsQuery = query(collection(db, 'jobs'), where("companyId", "==", companyId), limit(3));
    const jobsSnapshot = await getDocs(jobsQuery);
    
    let listingsHTML = '<p class="text-sm text-foreground/60">No active job listings.</p>';
    if (!jobsSnapshot.empty) {
        listingsHTML = jobsSnapshot.docs.map(doc => {
            const job = doc.data();
            return `
                <div class="list-item">
                    <div>
                        <h4 class="font-medium text-foreground">${job.title}</h4>
                        <p class="text-sm text-foreground/60">${job.location} · ${job.jobType}</p>
                    </div>
                    <span class="status-badge status-green">Active</span>
                </div>
            `;
        }).join('');
    }
    
    activeListingsCard.innerHTML = `<div class="flex justify-between items-center mb-4"><h3 class="card-title-sm">Active Listings</h3><a href="#" class="text-sm font-medium text-primary hover:underline">Manage Jobs</a></div><div class="space-y-3">${listingsHTML}</div>`;
}
