import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getFirestore, collection, getDocs, query, where, limit, startAfter, orderBy, doc, updateDoc, increment, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

// Estimate read time from text (words per minute)
function estimateReadTime(text) {
    const words = (text || '').trim().split(/\s+/).filter(Boolean).length;
    const wpm = 220; // average reading speed
    const minutes = Math.max(1, Math.round(words / wpm));
    return `${minutes} min read`;
}

// --- RESOURCE CARD CREATION ---
function createResourceCard(resourceData) {
    const { title, description, category, type, difficulty, link, preview, author, date, readTime, downloads } = resourceData;
    const typeIcon = iconMap[type] || iconMap['Article'];
    const diffColor = difficultyColors[difficulty] || 'bg-gray-100 text-gray-700';

    const tags = (resourceData.tags || ['general']).map(tag => `<span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${tag}</span>`).join('');
    const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    let actionButton;
    switch(type) {
        case 'Video':
        case 'Webinar':
            actionButton = `<a href="${link}" target="_blank" class="btn btn-primary w-full !rounded-lg mt-4">Watch Now</a>`;
            break;
        case 'Template':
            // For templates (often DOCX) prefer an in-browser PDF preview if available, otherwise use Google Docs viewer
            const fileUrl = link;
            let previewUrl = null;
            if (preview) {
                previewUrl = preview; // already a full path like /resources/resumes/... encoded earlier
            } else if (fileUrl.endsWith('.docx')) {
                // derive probable PDF name by replacing extension
                previewUrl = fileUrl.replace(/\.docx$/i, '.pdf');
            }

            if (previewUrl) {
                actionButton = `
                    <div class="flex gap-2 mt-4">
                        <a href="${previewUrl}" target="_blank" class="btn btn-outline flex-1">Preview</a>
                        <a href="${fileUrl}" target="_blank" class="btn btn-primary flex-1 download-link" data-id="${resourceData.id || ''}">Download</a>
                    </div>
                `;
            } else {
                const googleViewer = `https://docs.google.com/gview?url=${encodeURIComponent(window.location.origin + fileUrl)}&embedded=true`;
                actionButton = `
                    <div class="flex gap-2 mt-4">
                        <a href="${googleViewer}" target="_blank" class="btn btn-outline flex-1">Preview</a>
                        <a href="${fileUrl}" target="_blank" class="btn btn-primary flex-1 download-link" data-id="${resourceData.id || ''}">Download</a>
                    </div>
                `;
            }
            break;
        default:
             actionButton = `<a href="${link}" target="_blank" class="btn btn-primary w-full !rounded-lg mt-4 download-link" data-id="${resourceData.id || ''}">View Resource</a>`;
    }

    return `
        <div class="card resource-card p-6 rounded-2xl flex flex-col h-full">
            <div class="flex justify-between items-start mb-3 gap-4">
                <div class="flex items-center gap-2 text-sm text-foreground/80">${typeIcon}<span class="font-semibold">${type}</span></div>
                <div class="text-xs font-semibold px-3 py-1 rounded-full ${diffColor}">${difficulty}</div>
            </div>

            <h3 class="text-lg font-bold text-foreground mb-2 line-clamp-2">${title}</h3>

            <div class="text-sm text-foreground/60 mb-3">${author} · ${formattedDate}</div>

            <div class="flex items-center gap-4 text-sm text-foreground/60 mb-3">
                <span>${readTime}</span>
                <span>·</span>
                <span>${downloads} downloads</span>
            </div>

            <p class="text-sm text-foreground/70 my-4 line-clamp-3">${description}</p>

            <div class="flex flex-wrap gap-2 mb-4">${tags}</div>

            <div class="mt-auto">${actionButton}</div>
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
        // Try a few common paths for the local metadata (works for local server or deployed site)
        const metaPaths = [
            'resources/meta/index.json',
            '/resources/meta/index.json',
            './resources/meta/index.json'
        ];
        let meta = null;
        for (const p of metaPaths) {
            try {
                const resp = await fetch(p);
                if (resp.ok) {
                    meta = await resp.json();
                    break;
                }
            } catch (err) {
                // ignore and try next
            }
        }
        if (meta) {
            allResources = (meta.resources || []).map(item => ({
                id: item.id,
                    title: item.title,
                    description: item.description,
                    category: item.category || 'general',
                    type: item.type || 'Template',
                    difficulty: item.difficulty || 'Beginner',
                    author: item.author || 'InternConnect Team',
                    date: item.date || new Date().toISOString(),
                    readTime: item.readTime || estimateReadTime(item.description || ''),
                    downloads: item.downloads || 0,
                tags: item.tags || [],
                filename: item.filename || null,
                // Use relative paths (no leading slash) so the link resolves correctly from the site root or nested deploy paths
                link: item.filename ? `resources/resumes/${encodeURIComponent(item.filename)}` : (item.link || '#'),
                preview: item.preview ? `resources/resumes/${encodeURIComponent(item.preview)}` : null
            }));

            // Merge existing download counts from Firestore documents when available.
            // This keeps counts persistent across page refreshes for items that have a Firestore doc with the same `id`.
            try {
                await Promise.all(allResources.map(async (r, idx) => {
                    if (!r.id) return;
                    try {
                        const docRef = doc(db, 'resources', r.id);
                        const snap = await getDoc(docRef);
                        if (snap.exists()) {
                            const data = snap.data();
                            if (typeof data.downloads === 'number') {
                                allResources[idx].downloads = data.downloads;
                            }
                        }
                    } catch (e) {
                        // ignore read errors (rules, network) and continue
                    }
                }));
            } catch (e) {
                // ignore
            }

            filteredResources = [...allResources];
            displayResources();
            return;
        }

        // Fallback: fetch from Firestore collection 'resources' if meta not available
        const resourcesCol = collection(db, 'resources');
        const resourceSnapshot = await getDocs(resourcesCol);
        allResources = resourceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Add placeholder data for new design
        allResources.forEach(res => {
            res.author = res.author || 'InternConnect Team';
            res.date = res.date || new Date().toISOString();
            // Estimate read time from description or content if not provided
            res.readTime = res.readTime || estimateReadTime(res.description || res.content || '');
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

// Track download clicks: optimistic UI increment + Firestore increment (best-effort)
resourcesContainer.addEventListener('click', async (e) => {
    const anchor = e.target.closest && e.target.closest('a.download-link');
    if (!anchor) return;
    // don't block the navigation/download — update counts in background
    const id = anchor.dataset.id;

    // Optimistically update local data and re-render
    if (id) {
        const idx = allResources.findIndex(r => r.id === id);
        if (idx !== -1) {
            allResources[idx].downloads = (allResources[idx].downloads || 0) + 1;
            // Keep filteredResources in sync and re-display
            const frIdx = filteredResources.findIndex(r => r.id === id);
            if (frIdx !== -1) filteredResources[frIdx].downloads = allResources[idx].downloads;
            displayResources();
        }
    }

    // Firestore increment (best-effort). Works only if the document exists and rules allow the update.
    if (id) {
        try {
            const docRef = doc(db, 'resources', id);
            await updateDoc(docRef, { downloads: increment(1) });
        } catch (err) {
            // ignore failures (document may not exist or rules may block updates)
            // console.debug('Could not increment downloads in Firestore for', id, err);
        }
    }
});

[searchInput, categoryFilter, typeFilter, difficultyFilter].forEach(el => {
    el.addEventListener('change', applyFilters);
});
searchInput.addEventListener('keyup', applyFilters);

loadMoreBtn.addEventListener('click', () => {
    visibleResourcesCount += 6;
    displayResources();
});
