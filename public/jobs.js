// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc, serverTimestamp, query, where } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const jobsContainer = document.getElementById('jobs-container');
const jobsCount = document.getElementById('jobs-count');
const searchInput = document.getElementById('search-input');
const locationFilter = document.getElementById('location-filter');
const typeFilter = document.getElementById('type-filter');

let allJobs = [];
let currentUser = null;

// --- AUTH LISTENER ---
onAuthStateChanged(auth, (user) => {
    if(user) {
        currentUser = user;
    } else {
        currentUser = null;
    }
    if (allJobs.length > 0) {
        renderJobs(allJobs);
    }
});

// --- SKELETON LOADER ---
function createSkeletonCard() {
    return `
        <div class="bg-white rounded-2xl p-6 border">
            <div class="flex flex-col md:flex-row justify-between items-start">
                <div class="flex-1 mb-4 md:mb-0 w-full">
                    <div class="shimmer-wrapper rounded-md" style="height: 1.75rem; width: 60%;"></div>
                    <div class="shimmer-wrapper rounded-md mt-3" style="height: 1rem; width: 80%;"></div>
                    <div class="shimmer-wrapper rounded-md mt-4" style="height: 0.875rem; width: 95%;"></div>
                    <div class="shimmer-wrapper rounded-md mt-1" style="height: 0.875rem; width: 90%;"></div>
                    <div class="flex flex-wrap gap-2 mt-4">
                        <div class="shimmer-wrapper rounded-full" style="height: 1.5rem; width: 5rem;"></div>
                        <div class="shimmer-wrapper rounded-full" style="height: 1.5rem; width: 4rem;"></div>
                        <div class="shimmer-wrapper rounded-full" style="height: 1.5rem; width: 6rem;"></div>
                    </div>
                </div>
                <div class="ml-0 md:ml-6 flex flex-col space-y-2 w-full md:w-auto shrink-0">
                    <div class="shimmer-wrapper rounded-full" style="height: 2.5rem; width: 120px;"></div>
                    <div class="shimmer-wrapper rounded-full" style="height: 2.5rem; width: 120px;"></div>
                </div>
            </div>
        </div>
    `;
}

function displaySkeletonLoader(count = 6) {
    let skeletons = '';
    for (let i = 0; i < count; i++) {
        skeletons += createSkeletonCard();
    }
    jobsContainer.innerHTML = skeletons;
    jobsCount.textContent = 'Searching for internships...';
}

// --- JOB CARD & DISPLAY ---
function createJobCard(jobData, index) {
    const { id, title, companyName, companyId, location, jobType, salary, description, skills } = jobData;
    const delay = index * 100;
    
    const skillsHtml = skills.map(skill => `<span class="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">${skill}</span>`).join('');
    const companyLink = `<a href="company-details.html?id=${companyId}" class="hover:underline">${companyName}</a>`;

    return `
        <div class="animate-on-scroll animate-slide-in-up" style="animation-delay: ${delay}ms;">
            <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border">
                <div class="flex flex-col md:flex-row justify-between items-start">
                    <div class="flex-1 mb-4 md:mb-0">
                        <h3 class="text-xl font-bold text-foreground mb-1">${title}</h3>
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground/70 mb-3">
                            <span>${companyLink}</span><span>·</span>
                            <span>${location}</span><span>·</span>
                            <span>${jobType}</span>
                            ${salary ? `<span>·</span><span>${salary}</span>` : ''}
                        </div>
                        <p class="text-sm text-foreground/80 mb-4 line-clamp-2">${description}</p>
                        <div class="flex flex-wrap gap-2">
                            ${skillsHtml}
                        </div>
                    </div>
                    <div class="ml-0 md:ml-6 flex flex-col space-y-2 w-full md:w-auto shrink-0">
                        <button class="btn btn-primary apply-btn" 
                                data-job-id="${id}" 
                                data-company-id="${companyId}">Apply Now</button>
                        <a href="job-details.html?id=${id}" class="btn btn-secondary">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderJobs(jobs) {
    if (jobs.length === 0) {
        jobsContainer.innerHTML = '<p class="text-center text-gray-500">No jobs found that match your criteria.</p>';
    } else {
        jobsContainer.innerHTML = jobs.map((job, index) => createJobCard(job, index)).join('');
    }
    
    jobsCount.textContent = `${jobs.length} Internship${jobs.length !== 1 ? 's' : ''} Found`;

    document.querySelectorAll('.apply-btn').forEach(button => {
        button.addEventListener('click', handleApplyClick);
    });

    const animatedItems = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
            }
        });
    });
    animatedItems.forEach(item => observer.observe(item));
}

// --- DATA FETCHING ---
async function fetchJobs() {
    try {
        const jobsCol = collection(db, 'jobs');
        const jobSnapshot = await getDocs(jobsCol);
        allJobs = jobSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        renderJobs(allJobs);

    } catch (error) {
        console.error("Error fetching jobs: ", error);
        jobsContainer.innerHTML = '<p class="text-center text-red-500">Could not load jobs. Please try again later.</p>';
    }
}


// --- FILTERING ---
function filterJobs() {
    const searchTerm = searchInput.value.toLowerCase();
    const location = locationFilter.value;
    const type = typeFilter.value;

    const filteredJobs = allJobs.filter(job => {
        const matchesSearch = searchTerm === '' ||
            job.title.toLowerCase().includes(searchTerm) ||
            job.companyName.toLowerCase().includes(searchTerm) ||
            (job.skills && job.skills.some(skill => skill.toLowerCase().includes(searchTerm)));

        const matchesLocation = location === '' || job.location === location;
        const matchesType = type === '' || job.jobType === type;

        return matchesSearch && matchesLocation && matchesType;
    });

    renderJobs(filteredJobs);
}

// --- JOB APPLICATION ---
async function handleApplyClick(event) {
    const button = event.currentTarget;
    
    if (!currentUser) {
        alert("Please sign in or create an account to apply for jobs.");
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
            status: 'Applied', // Initial status
            appliedAt: serverTimestamp()
        });
        
        button.textContent = 'Applied!';
        button.classList.replace('btn-primary', 'btn-secondary');
        
    } catch (error) {
        console.error("Error applying for job: ", error);
        alert("There was an error submitting your application. Please try again.");
        button.disabled = false;
        button.textContent = 'Apply Now';
    }
}


// --- INITIAL LOAD & EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    displaySkeletonLoader();
    fetchJobs();
});
searchInput.addEventListener('input', filterJobs);
locationFilter.addEventListener('change', filterJobs);
typeFilter.addEventListener('change', filterJobs);

