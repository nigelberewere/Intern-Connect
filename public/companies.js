import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, getCountFromServer } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const companiesContainer = document.getElementById('companies-container');
const companiesCount = document.getElementById('companies-count');
const searchInput = document.getElementById('search-input');
const industryFilter = document.getElementById('industry-filter');
const sizeFilter = document.getElementById('size-filter');
const locationFilter = document.getElementById('location-filter');
const sortFilter = document.getElementById('sort-filter');
const loadMoreBtn = document.getElementById('load-more-btn');

let allCompanies = [];
let filteredCompanies = [];
let visibleCompaniesCount = 9;

// --- SKELETON LOADER ---
function createCompanySkeletonCard() {
    return `
        <div class="bg-white p-6 rounded-2xl border space-y-4">
            <div class="flex items-start space-x-4">
                <div class="shimmer-wrapper w-16 h-16 rounded-xl"></div>
                <div class="flex-1 space-y-2">
                    <div class="shimmer-wrapper h-6 w-3/4 rounded-md"></div>
                    <div class="shimmer-wrapper h-4 w-1/2 rounded-md"></div>
                </div>
            </div>
            <div class="shimmer-wrapper h-4 w-full rounded-md"></div>
            <div class="shimmer-wrapper h-4 w-5/6 rounded-md"></div>
            <div class="flex flex-wrap gap-2">
                <div class="shimmer-wrapper h-6 w-20 rounded-full"></div>
                <div class="shimmer-wrapper h-6 w-24 rounded-full"></div>
                <div class="shimmer-wrapper h-6 w-16 rounded-full"></div>
            </div>
            <div class="grid grid-cols-2 gap-2 pt-2">
                <div class="shimmer-wrapper h-10 w-full rounded-lg"></div>
                <div class="shimmer-wrapper h-10 w-full rounded-lg"></div>
            </div>
        </div>
    `;
}

function displaySkeletonLoader(count = 9) {
    let skeletons = '';
    for (let i = 0; i < count; i++) {
        skeletons += createCompanySkeletonCard();
    }
    companiesContainer.innerHTML = skeletons;
    companiesCount.textContent = 'Searching for companies...';
}


// --- COMPANY CARD CREATION ---
function createCompanyCard(companyData, index) {
    const { id, companyName, industry, location, logoUrl, description } = companyData;
    const delay = index * 100;
    
    const placeholder = 'https://placehold.co/64x64/05AD29/FFFFFF?text=Logo';
    return `
        <div class="animate-on-scroll animate-slide-in-up" style="animation-delay: ${delay}ms;">
            <div class="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border flex flex-col h-full">
                <div class="flex items-start space-x-4 mb-4">
                    <img class="w-16 h-16 rounded-xl bg-gray-100 object-contain" src="${logoUrl || placeholder}" alt="${companyName} Logo">
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-foreground truncate">${companyName}</h3>
                        <p class="text-sm text-foreground/70">${industry || 'N/A'}</p>
                    </div>
                </div>
                <p class="text-sm text-foreground/80 mb-4 line-clamp-2 flex-grow">${description || 'No description available.'}</p>
                <div class="text-sm text-foreground/70 space-y-1 mb-4">
                    <p><strong>Location:</strong> ${location || 'N/A'}</p>
                </div>
                <div class="grid grid-cols-2 gap-2 mt-auto">
                    <a href="company-details.html?id=${id}" class="btn btn-primary w-full">View Profile</a>
                    <a href="jobs.html?companyId=${id}" class="btn btn-secondary w-full">View Jobs</a>
                </div>
            </div>
        </div>
    `;
}


// --- DATA FETCHING & DISPLAY ---
function displayCompanies() {
    const companiesToDisplay = filteredCompanies.slice(0, visibleCompaniesCount);
    
    if (companiesToDisplay.length === 0) {
        companiesContainer.innerHTML = '<p class="text-center text-foreground/60 col-span-full py-10">No companies found matching your criteria.</p>';
    } else {
        companiesContainer.innerHTML = companiesToDisplay.map((company, index) => createCompanyCard(company, index)).join('');
    }

    companiesCount.textContent = `${filteredCompanies.length} Compan${filteredCompanies.length !== 1 ? 'ies' : 'y'} Found`;

    if (filteredCompanies.length > visibleCompaniesCount) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
    
    // Re-trigger animations
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

async function fetchCompanies() {
    try {
        const companiesQuery = query(collection(db, 'users'), where("role", "==", "company"));
        const companySnapshot = await getDocs(companiesQuery);
        
        allCompanies = companySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        filteredCompanies = [...allCompanies];
        
        displayCompanies();
    } catch (error) {
        console.error("Error fetching companies: ", error);
        companiesContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Could not load companies.</p>';
    }
}

// --- FILTERING & SORTING ---
function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    const industry = industryFilter.value;
    const size = sizeFilter.value;
    const location = locationFilter.value;
    const sort = sortFilter.value;

    filteredCompanies = allCompanies.filter(company => {
        const matchesSearch = searchTerm === '' || company.companyName.toLowerCase().includes(searchTerm) || (company.description && company.description.toLowerCase().includes(searchTerm));
        const matchesIndustry = industry === '' || company.industry === industry;
        const matchesSize = size === '' || company.companySize === size;
        const matchesLocation = location === '' || company.location === location;
        return matchesSearch && matchesIndustry && matchesSize && matchesLocation;
    });

    if (sort === 'name-asc') {
        filteredCompanies.sort((a, b) => a.companyName.localeCompare(b.companyName));
    } else if (sort === 'name-desc') {
        filteredCompanies.sort((a, b) => b.companyName.localeCompare(a.companyName));
    }
    
    visibleCompaniesCount = 9;
    displayCompanies();
}


// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    displaySkeletonLoader();
    fetchCompanies();
});

[searchInput, industryFilter, sizeFilter, locationFilter, sortFilter].forEach(el => {
    el.addEventListener('change', applyFiltersAndSort);
});
searchInput.addEventListener('input', applyFiltersAndSort);

loadMoreBtn.addEventListener('click', () => {
    visibleCompaniesCount += 6;
    displayCompanies();
});
