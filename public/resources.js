import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, limit, startAfter, orderBy } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
const resourcesContainer = document.getElementById('resources-container');
const loader = document.getElementById('loader');
const resourcesCount = document.getElementById('resources-count');
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const typeFilter = document.getElementById('type-filter');
const difficultyFilter = document.getElementById('difficulty-filter');
const loadMoreBtn = document.getElementById('load-more-btn');

let allResources = [];
let filteredResources = [];
let visibleResourcesCount = 6;


// --- ICONS ---
const iconMap = {
    Article: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 0-2 2Z"/><path d="M16 2v20"/><path d="M8 7h4"/><path d="M8 12h4"/><path d="M8 17h4"/></svg>`,
    Video: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>`,
    Template: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="M21.44 11.05-9.19 22.37a1 1 0 0 1-1.41 0L1 14.22a1 1 0 0 1 0-1.41l11.05-9.19a2 2 0 0 1 2.82 0l8.58 8.58a2 2 0 0 1 0 2.82z"/><line x1="7" x2="14" y1="14" y2="7"/></svg>`,
    Course: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
    Webinar: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" x2="12" y1="18" y2="12"/><line x1="9" x2="15" y1="15" y2="15"/></svg>`
};

const difficultyColors = {
    Beginner: 'bg-green-100 text-green-700',
    Intermediate: 'bg-yellow-100 text-yellow-700',
    Advanced: 'bg-red-100 text-red-700'
};

// --- RESOURCE CARD CREATION ---
function createResourceCard(resourceData) {
    const { title, description, category, type, difficulty, link, author, date, readTime, downloads } = resourceData;
    const typeIcon = iconMap[type] || iconMap['Article'];
    const diffColor = difficultyColors[difficulty] || 'bg-gray-100 text-gray-700';

    const tags = (resourceData.tags || ['general']).map(tag => `<span class="resource-tag">${tag}</span>`).join('');
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let actionButton;
    switch(type) {
        case 'Video':
        case 'Webinar':
            actionButton = `<a href="${link}" target="_blank" class="btn btn-primary w-full !rounded-lg mt-4">Watch Now</a>`;
            break;
        case 'Template':
            actionButton = `<a href="${link}" target="_blank" class="btn btn-primary w-full !rounded-lg mt-4">Download</a>`;
            break;
        default:
             actionButton = `<a href="${link}" target="_blank" class="btn btn-primary w-full !rounded-lg mt-4">View Resource</a>`;
    }

    return `
        <div class="resource-card">
            <div class="flex justify-between items-center mb-3">
                <span class="resource-type-badge">${typeIcon} ${type}</span>
                <span class="resource-difficulty-badge ${diffColor}">${difficulty}</span>
            </div>
            <h3 class="text-lg font-bold text-foreground mb-2 line-clamp-2">${title}</h3>
            
            <div class="resource-meta">
                <span>${author}</span> · <span>${formattedDate}</span>
            </div>

            <div class="resource-stats">
                <span>${readTime}</span>
                <span>${downloads} downloads</span>
            </div>

            <p class="text-sm text-foreground/70 my-4 line-clamp-3 flex-grow">${description}</p>
            
            <div class="flex flex-wrap gap-2 mb-2">${tags}</div>

            ${actionButton}
        </div>
    `;
}

// --- DATA FETCHING & DISPLAY ---
function displayResources() {
    const resourcesToDisplay = filteredResources.slice(0, visibleResourcesCount);
    resourcesContainer.innerHTML = resourcesToDisplay.map(createResourceCard).join('');
    
    resourcesCount.textContent = `${filteredResources.length} Resource${filteredResources.length !== 1 ? 's' : ''} Found`;

    if (filteredResources.length > visibleResourcesCount) {
        loadMoreBtn.classList.remove('hidden');
    } else {
        loadMoreBtn.classList.add('hidden');
    }
    
    if(filteredResources.length === 0) {
       resourcesContainer.innerHTML = '<p class="text-center text-foreground/60 col-span-full py-10">No resources found matching your criteria.</p>';
    }
}

async function fetchResources() {
    try {
        const resourcesCol = collection(db, 'resources');
        const resourceSnapshot = await getDocs(resourcesCol);
        allResources = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Add placeholder data for new design
        allResources.forEach(res => {
            res.author = res.author || 'InternConnect Team';
            res.date = res.date || new Date().toISOString();
            res.readTime = res.readTime || `${Math.floor(Math.random()*10)+2} min read`;
            res.downloads = res.downloads || Math.floor(Math.random()*1000)+50;
            res.difficulty = res.difficulty || ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random()*3)];
        });

        filteredResources = [...allResources];
        displayResources();
    } catch (error) {
        console.error("Error fetching resources: ", error);
        resourcesContainer.innerHTML = '<p class="text-center text-red-500 col-span-full">Could not load resources.</p>';
    } finally {
        loader.classList.add('hidden');
    }
}


// --- FILTERING ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const type = typeFilter.value;
    const difficulty = difficultyFilter.value;

    filteredResources = allResources.filter(resource => {
        const matchesSearch = searchTerm === '' || resource.title.toLowerCase().includes(searchTerm) || resource.description.toLowerCase().includes(searchTerm);
        const matchesCategory = category === '' || resource.category === category;
        const matchesType = type === '' || resource.type === type;
        const matchesDifficulty = difficulty === '' || resource.difficulty === difficulty;

        return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
    });

    visibleResourcesCount = 6;
    displayResources();
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', fetchResources);

[searchInput, categoryFilter, typeFilter, difficultyFilter].forEach(el => {
    el.addEventListener('change', applyFilters);
});
searchInput.addEventListener('keyup', applyFilters);

loadMoreBtn.addEventListener('click', () => {
    visibleResourcesCount += 6;
    displayResources();
});
