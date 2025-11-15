import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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

const headerContent = document.getElementById('header-content');

onAuthStateChanged(auth, async (user) => {
    let headerHtml;
    const currentPage = window.location.pathname.split('/').pop();

    if (user) {
        // User is logged in
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        let displayName = user.email.split('@')[0];
        let userRole = 'student';

        if (docSnap.exists()) {
            const userData = docSnap.data();
            displayName = userData.firstName || userData.companyName || displayName;
            userRole = userData.role || 'student';
        }
        
        const dashboardLink = userRole === 'company' ? 'company-dashboard.html' : 'student-dashboard.html';
        const profileLink = userRole === 'company' ? 'company-profile.html' : 'profile.html';

        headerHtml = `
            <div class="flex items-center h-20 relative">
                <!-- Left: Logo Image -->
                <div class="flex-none">
                     <a class="flex items-center" href="${dashboardLink}">
                        <span class="logo-wrap"><img src="assets/icons/text-logo.png" alt="InternConnect" class="h-12 w-auto" /></span>
                    </a>
                </div>

                <!-- Middle: Nav + User -->
                <div class="flex-grow flex justify-center">
                    <div class="hidden md:flex items-center space-x-8">
                        <nav class="flex items-center space-x-8">
                            <a class="nav-link ${currentPage === 'jobs.html' ? 'active' : ''}" ${currentPage === 'jobs.html' ? 'aria-current="page"' : ''} href="jobs.html">Jobs</a>
                            <a class="nav-link ${currentPage === 'companies.html' ? 'active' : ''}" ${currentPage === 'companies.html' ? 'aria-current="page"' : ''} href="companies.html">Companies</a>
                            <a class="nav-link ${currentPage === 'resources.html' ? 'active' : ''}" ${currentPage === 'resources.html' ? 'aria-current="page"' : ''} href="resources.html">Resources</a>
                            <a class="nav-link ${currentPage === 'about.html' ? 'active' : ''}" ${currentPage === 'about.html' ? 'aria-current="page"' : ''} href="about.html">About</a>
                            <a class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}" ${currentPage === 'contact.html' ? 'aria-current="page"' : ''} href="contact.html">Contact</a>
                        </nav>
                        <a href="${profileLink}" class="nav-link flex items-center space-x-2 font-semibold">
                            <span>${displayName}</span>
                        </a>
                    </div>
                </div>

                <!-- Right: Logout Button -->
                <div class="flex-none">
                     <button id="logout-button" class="btn btn-secondary !h-10 !w-10 !p-0 !rounded-full flex items-center justify-center" title="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5 text-foreground/70"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" x2="9" y1="12" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        `;
    } else {
        // User is not logged in
        headerHtml = `
             <div class="flex justify-between items-center h-20">
                <a class="flex items-center" href="index.html">
                    <span class="logo-wrap"><img src="assets/icons/text-logo.png" alt="InternConnect" class="h-12 w-auto" /></span>
                </a>
                <nav class="hidden md:flex items-center space-x-8">
                    <a class="nav-link ${currentPage === 'jobs.html' ? 'active' : ''}" ${currentPage === 'jobs.html' ? 'aria-current="page"' : ''} href="jobs.html">Jobs</a>
                    <a class="nav-link ${currentPage === 'companies.html' ? 'active' : ''}" ${currentPage === 'companies.html' ? 'aria-current="page"' : ''} href="companies.html">Companies</a>
                    <a class="nav-link ${currentPage === 'resources.html' ? 'active' : ''}" ${currentPage === 'resources.html' ? 'aria-current="page"' : ''} href="resources.html">Resources</a>
                    <a class="nav-link ${currentPage === 'about.html' ? 'active' : ''}" ${currentPage === 'about.html' ? 'aria-current="page"' : ''} href="about.html">About</a>
                    <a class="nav-link ${currentPage === 'contact.html' ? 'active' : ''}" ${currentPage === 'contact.html' ? 'aria-current="page"' : ''} href="contact.html">Contact</a>
                </nav>
                <div class="flex items-center space-x-3">
                     <a href="auth.html" class="nav-link font-semibold">Sign In</a>
                     <a href="auth.html#signup" class="btn btn-primary">Get Started</a>
                </div>
            </div>
        `;
    }

    if(headerContent) {
        headerContent.innerHTML = headerHtml;
    }

    // Ensure favicon is present in the document head (for pages that load this header)
    try {
        (function ensureFavicon() {
            try {
                // Resolve the favicon path relative to the current document so it works
                // both when served and when opened via file://
                const faviconHref = new URL('assets/icons/favicon.png', document.baseURI).href;
                if (!document.querySelector('link[rel~="icon"]')) {
                    const l = document.createElement('link');
                    l.rel = 'icon';
                    l.type = 'image/png';
                    l.href = faviconHref;
                    document.head.appendChild(l);
                }
                if (!document.querySelector('link[rel="shortcut icon"]')) {
                    const s = document.createElement('link');
                    s.rel = 'shortcut icon';
                    s.href = faviconHref;
                    document.head.appendChild(s);
                }
                if (!document.querySelector('link[rel="apple-touch-icon"]')) {
                    const at = document.createElement('link');
                    at.rel = 'apple-touch-icon';
                    at.href = faviconHref;
                    document.head.appendChild(at);
                }
            } catch (e) {
                // ignore errors when modifying head
            }
        })();

        // Set a page identifier on the body so the background manager can pick a style
        const pageId = (currentPage || 'index').replace('.html','').toLowerCase();
        if (document && document.body) document.body.dataset.page = pageId;
        // Dynamically load the background manager (best-effort)
        import('./bg-manager.js').then(m => {
            try { m.default && m.default(); } catch (e) { /* ignore */ }
        }).catch(()=>{/* ignore if module missing */});
    } catch(e) {
        // ignore
    }

    if (user) {
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.addEventListener('click', () => {
                signOut(auth).then(() => {
                    window.location.href = 'index.html';
                });
            });
        }
    }
});
