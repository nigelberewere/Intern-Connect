import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// --- ELEMENTS ---
const loader = document.getElementById('loader');
const pageContent = document.getElementById('page-content');
const container = document.getElementById('company-details-container');
const skeletonLoader = document.getElementById('company-details-skeleton');

async function fetchCompanyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
        container.innerHTML = '<p class="text-center text-red-500">No company ID provided.</p>';
        skeletonLoader.classList.add('hidden');
        return;
    }

    try {
        const companyRef = doc(db, 'users', companyId);
        const companySnap = await getDoc(companyRef);

        if (companySnap.exists() && companySnap.data().role === 'company') {
            const companyData = companySnap.data();
            const jobs = await fetchCompanyJobs(companyId);
            renderCompanyDetails(companyData, jobs);
        } else {
            container.innerHTML = '<p class="text-center text-red-500">Company not found.</p>';
        }
    } catch (error) {
        console.error("Error fetching company details:", error);
        container.innerHTML = '<p class="text-center text-red-500">Error loading company details.</p>';
    } finally {
        skeletonLoader.classList.add('hidden');
    }
}

async function fetchCompanyJobs(companyId) {
    const jobsQuery = query(collection(db, 'jobs'), where("companyId", "==", companyId));
    const jobsSnapshot = await getDocs(jobsQuery);
    return jobsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}


function renderCompanyDetails(company, jobs) {
    const { companyName, logoUrl, industry, location, website, description, companySize } = company;

    let jobsHtml = '<p class="text-sm text-foreground/70">This company has no active job listings.</p>';
    if (jobs && jobs.length > 0) {
        jobsHtml = jobs.map(job => `
            <a href="job-details.html?id=${job.id}" class="list-item hover:bg-indigo-50">
                <div>
                    <h4 class="font-medium text-foreground">${job.title}</h4>
                    <p class="text-sm text-foreground/60">${job.location} · ${job.jobType}</p>
                </div>
                <span class="text-primary font-semibold text-sm">&rarr;</span>
            </a>
        `).join('');
    }

    const companyHtml = `
        <div class="card p-8">
            <div class="flex flex-col md:flex-row items-start gap-8">
                <img src="${logoUrl || `https://placehold.co/96x96/E0E7FF/4F46E5?text=${companyName.charAt(0)}`}" alt="${companyName} Logo" class="w-24 h-24 rounded-2xl object-contain bg-gray-100 flex-shrink-0">
                <div class="w-full">
                    <h1 class="text-3xl md:text-4xl font-bold text-foreground">${companyName}</h1>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-md text-foreground/70 mt-2">
                        <span>${industry || 'N/A'}</span>
                        <span>·</span>
                        <span>${location || 'N/A'}</span>
                        <span>·</span>
                        <span>${companySize || 'N/A'}</span>
                    </div>
                    <a href="${website}" target="_blank" class="text-primary font-medium hover:underline mt-1 inline-block">${website}</a>
                </div>
            </div>
            
            <div class="prose max-w-none text-foreground/80 mt-8">
                <h3 class="font-semibold text-lg text-foreground mb-2">About ${companyName}</h3>
                <p>${description || 'No description available.'}</p>
            </div>
        </div>

        <div class="card p-8 mt-8">
            <h3 class="card-title-sm mb-4">Open Positions</h3>
            <div class="space-y-3">${jobsHtml}</div>
        </div>
    `;

    container.innerHTML = companyHtml;
}


document.addEventListener('DOMContentLoaded', () => {
    fetchCompanyDetails();
    loader.classList.add('hidden');
    pageContent.classList.remove('hidden');
    pageContent.classList.add('flex');
});
