import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
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
const auth = getAuth(app);
const db = getFirestore(app);

const loader = document.getElementById('loader');
const pageContent = document.getElementById('page-content');
const jobTitle = document.getElementById('job-title');
const applicantsContainer = document.getElementById('applicants-container');

const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('jobId');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if (!jobId) {
            window.location.href = 'company-dashboard.html';
            return;
        }
        await loadApplicants(user.uid, jobId);
    } else {
        window.location.href = 'login.html';
    }
});

async function loadApplicants(companyId, jobId) {
    try {
        // First, verify the company owns this job
        const jobDocRef = doc(db, 'jobs', jobId);
        const jobDocSnap = await getDoc(jobDocRef);

        if (!jobDocSnap.exists() || jobDocSnap.data().companyId !== companyId) {
            applicantsContainer.innerHTML = `<p class="text-red-500 text-center">Error: Job not found or you do not have permission to view it.</p>`;
            loader.classList.add('hidden');
            pageContent.classList.remove('hidden');
            return;
        }

        jobTitle.textContent = `Applicants for ${jobDocSnap.data().title}`;

        // Find all applications for this job
        const applicationsQuery = query(collection(db, 'applications'), where('jobId', '==', jobId));
        const applicationsSnapshot = await getDocs(applicationsQuery);

        if (applicationsSnapshot.empty) {
            applicantsContainer.innerHTML = `<p class="text-foreground/60 text-center py-6">There are no applicants for this position yet.</p>`;
        } else {
            let applicantsHtml = '';
            for (const appDoc of applicationsSnapshot.docs) {
                const application = appDoc.data();
                const studentDocRef = doc(db, 'users', application.studentId);
                const studentDocSnap = await getDoc(studentDocRef);
                if (studentDocSnap.exists()) {
                    const student = studentDocSnap.data();
                    applicantsHtml += createApplicantCard(student);
                }
            }
            applicantsContainer.innerHTML = applicantsHtml;
        }
    } catch (error) {
        console.error("Error loading applicants: ", error);
        applicantsContainer.innerHTML = `<p class="text-red-500 text-center">Could not load applicants.</p>`;
    } finally {
        loader.classList.add('hidden');
        pageContent.classList.remove('hidden');
    }
}

function createApplicantCard(studentData) {
    return `
        <div class="card flex items-center justify-between">
            <div>
                <h3 class="font-bold text-lg text-foreground">${studentData.firstName} ${studentData.lastName}</h3>
                <p class="text-sm text-primary font-medium">${studentData.university}</p>
            </div>
            <a href="mailto:${studentData.email}" class="btn btn-secondary !h-9">Contact</a>
        </div>
    `;
}
