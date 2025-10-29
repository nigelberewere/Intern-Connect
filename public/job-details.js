import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const jobDetailsContainer = document.getElementById('job-details-container');
const skeletonLoader = document.getElementById('job-details-skeleton');

let currentUser = null;

// --- AUTH LISTENER ---
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    // We can re-render parts of the page if needed when auth state changes
    // For now, we mainly need it for the 'Apply' button logic.
});


// --- DATA FETCHING & DISPLAY ---
async function fetchAndDisplayJobDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!jobId) {
        jobDetailsContainer.innerHTML = '<p class="text-center text-red-500">No job ID provided.</p>';
        skeletonLoader.classList.add('hidden');
        return;
    }

    try {
        const jobRef = doc(db, 'jobs', jobId);
        const jobSnap = await getDoc(jobRef);

        if (jobSnap.exists()) {
            const jobData = jobSnap.data();
            renderJobDetails(jobData, jobId);
        } else {
            jobDetailsContainer.innerHTML = '<p class="text-center text-red-500">Job not found.</p>';
        }
    } catch (error) {
        console.error("Error fetching job details:", error);
        jobDetailsContainer.innerHTML = '<p class="text-center text-red-500">Error loading job details.</p>';
    } finally {
        skeletonLoader.classList.add('hidden');
    }
}

function renderJobDetails(job, jobId) {
    const { title, companyName, companyId, location, jobType, description, skills, salary } = job;
    
    const skillsHtml = skills && skills.length > 0
        ? skills.map(skill => `<span class="skill-badge">${skill}</span>`).join('')
        : '<span class="text-sm text-foreground/70">No skills specified.</span>';

    const jobHtml = `
        <div class="card p-8">
            <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">${title}</h1>
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-md text-foreground/70 mb-6">
                <a href="company-details.html?id=${companyId}" class="font-semibold text-primary hover:underline">${companyName}</a>
                <span>·</span>
                <span>${location}</span>
                <span>·</span>
                <span>${jobType}</span>
                ${salary ? `<span>·</span><span>${salary}</span>` : ''}
            </div>
            
            <div class="prose max-w-none text-foreground/80 mb-6">
                <h3 class="font-semibold text-lg text-foreground mb-2">Job Description</h3>
                <p>${description.replace(/\n/g, '<br>')}</p>
            </div>

            <div class="mb-8">
                <h3 class="font-semibold text-lg text-foreground mb-3">Required Skills</h3>
                <div class="flex flex-wrap gap-2">${skillsHtml}</div>
            </div>

            <button id="apply-btn" class="btn btn-primary btn-lg" data-job-id="${jobId}" data-company-id="${companyId}">
                Apply Now
            </button>
        </div>
    `;

    jobDetailsContainer.innerHTML = jobHtml;

    // Attach event listener to the new button
    const applyBtn = document.getElementById('apply-btn');
    if(applyBtn){
         applyBtn.addEventListener('click', handleApplyClick);
    }
}

async function handleApplyClick(event) {
    const button = event.currentTarget;
    
    if (!currentUser) {
        alert("Please sign in or create an account to apply.");
        window.location.href = 'auth.html';
        return;
    }
    
    button.disabled = true;
    button.textContent = 'Applying...';
    
    const jobId = button.dataset.jobId;
    const companyId = button.dataset.companyId;

    try {
        const applicationRef = doc(db, "applications", `${currentUser.uid}_${jobId}`);
        await setDoc(applicationRef, {
            studentId: currentUser.uid,
            jobId: jobId,
            companyId: companyId,
            status: 'Applied',
            appliedAt: serverTimestamp()
        });
        
        button.textContent = 'Applied Successfully!';
        button.classList.replace('btn-primary', 'btn-success');
        
    } catch (error) {
        console.error("Error applying for job: ", error);
        alert("There was an error submitting your application.");
        button.disabled = false;
        button.textContent = 'Apply Now';
    }
}

// --- INITIAL LOAD ---
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayJobDetails();
    loader.classList.add('hidden');
    pageContent.classList.remove('hidden');
    pageContent.classList.add('flex');
});
