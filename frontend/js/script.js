"use strict";

// ============================================
// COMPUTER TROUBLESHOOTER
// Versi demo frontend
// ============================================

// 1. DATA KATEGORI
let categories = [];

// 2. DATA ADMIN DEMO
// Hanya untuk simulasi frontend.
// Jangan gunakan kredensial ini untuk aplikasi sebenarnya.
const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "admin123";

// 3. STATE APLIKASI
let currentUser = null;
let currentRole = null;
let currentCategory = null;
let currentQuestionIndex = 0;
let diagnosisAnswers = [];
let questionDatabase = [];
let lastDiagnosis = null;

// 4. AMBIL DATA DARI LOCAL STORAGE
function loadStoredData(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        console.warn("Data browser tidak dapat dibaca:", error);
        return fallback;
    }
}

let historyData = loadStoredData("ct_history", []);
questionDatabase = loadStoredData("ct_questions", []);

if (!Array.isArray(historyData)) {
    historyData = [];
}

if (!Array.isArray(questionDatabase)) {
    questionDatabase = [];
}

// 5. SIMPAN DATA
function saveData() {
    try {
        localStorage.setItem("ct_history", JSON.stringify(historyData));
        localStorage.setItem("ct_questions", JSON.stringify(questionDatabase));
    } catch (error) {
        alert("Data gagal disimpan di browser. Periksa kapasitas penyimpanan.");
        console.error(error);
    }
}

// 6. HELPER DOM
function getElement(id) {
    return document.getElementById(id);
}

// Membuat elemen dengan teks aman dari input pengguna.
function createTextElement(tag, text, className = "") {
    const element = document.createElement(tag);
    element.textContent = text;

    if (className) {
        element.className = className;
    }

    return element;
}

// 7. NAVIGASI HALAMAN
const pageIds = [
    "loginPage",
    "dashboardPage",
    "categoryPage",
    "diagnosisPage",
    "resultPage",
    "historyPage",
    "statisticsPage",
    "managePage",
    "accessPage"
];


function showPage(pageId) {
    // Memastikan halaman tersedia
    if (!pageIds.includes(pageId)) {
        return;
    }

    // Pengguna yang belum login hanya boleh melihat halaman login
    if (pageId !== "loginPage" && !currentUser) {
        pageId = "loginPage";
    }

    // Halaman khusus Admin
    const adminPages = [
        "historyPage",
        "statisticsPage",
        "managePage"
    ];

    // Guest tidak boleh membuka halaman khusus Admin
    if (adminPages.includes(pageId) && currentRole !== "admin") {
        pageId = "accessPage";
    }

    // Menampilkan halaman yang dipilih
    pageIds.forEach(id => {
        getElement(id).classList.toggle("hidden", id !== pageId);
    });

    // Menampilkan Dashboard
    if (pageId === "dashboardPage") {
        renderDashboard();
    }

    // Menampilkan kategori diagnosis
    if (pageId === "categoryPage") {
        renderCategories("categoryGrid");
    }

    // Menampilkan Riwayat
    if (pageId === "historyPage") {
        renderHistory();
    }

    // Menampilkan Statistik
    if (pageId === "statisticsPage") {
        renderStatistics();
    }

    // Menampilkan halaman Admin
    if (pageId === "managePage") {
        renderAdminPage();
    }

    // Kembali ke bagian atas halaman
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// Semua tombol yang menggunakan data-page.
document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

// 8. LOGIN GUEST
getElement("guestForm").addEventListener("submit", event => {
    event.preventDefault();

    const username = getElement("guestUsername").value.trim();

    if (!username) {
        alert("Username tidak boleh kosong.");
        return;
    }

    currentUser = username;
    currentRole = "guest";

    updateUserInfo();
    showPage("dashboardPage");
});

// 9. LOGIN ADMIN
getElement("adminForm").addEventListener("submit", event => {
    event.preventDefault();

    const username = getElement("adminUsername").value.trim();
    const password = getElement("adminPassword").value;

    if (
        username === DEMO_USERNAME &&
        password === DEMO_PASSWORD
    ) {
        currentUser = username;
        currentRole = "admin";

        updateUserInfo();
        showPage("dashboardPage");
    } else {
        alert("Username atau password Admin salah.");
    }
});

// 10. INFORMASI PENGGUNA
function updateUserInfo() {
    const userInfo = getElement("userInfo");

    userInfo.replaceChildren();

    if (!currentUser) {
        userInfo.classList.add("hidden");
        return;
    }

    userInfo.classList.remove("hidden");

    const userText = createTextElement(
        "span",
        `${currentUser} (${currentRole === "admin" ? "Admin" : "Guest"})`
    );

    const logoutButton = createTextElement("button", "Logout");
    logoutButton.type = "button";
    logoutButton.className = "btn outline";
    logoutButton.style.marginLeft = "10px";

    logoutButton.addEventListener("click", logout);

    userInfo.append(userText, logoutButton);
}

function logout() {
    currentUser = null;
    currentRole = null;
    currentCategory = null;
    diagnosisAnswers = [];
    lastDiagnosis = null;

    getElement("guestForm").reset();
    getElement("adminForm").reset();

    updateUserInfo();
    showPage("loginPage");
}

// 11. DASHBOARD
function renderDashboard() {
    const isAdmin = currentRole === "admin";

    getElement("dashboardTitle").textContent =
        `Selamat datang, ${currentUser}!`;

    getElement("dashboardDescription").textContent = isAdmin
        ? "Kelola sistem diagnosis komputer dan pantau data pemeriksaan."
        : "Pilih kategori masalah untuk mulai memeriksa komputer kamu.";

    const dashboardCards = getElement("dashboardCards");
    dashboardCards.replaceChildren();

    const features = [
        {
            title: "Mulai Diagnosis",
            description: "Periksa kemungkinan masalah komputer.",
            page: "categoryPage",
            roles: ["guest", "admin"]
        },
        {
            title: "Riwayat Diagnosis",
            description: "Lihat daftar pemeriksaan sebelumnya.",
            page: "historyPage",
            roles: ["admin"]
        },
        {
            title: "Statistik Diagnosis",
            description: "Lihat ringkasan jumlah pemeriksaan.",
            page: "statisticsPage",
            roles: ["admin"]
        },
        {
            title: "Kelola Pertanyaan",
            description: "Tambahkan pertanyaan diagnosis.",
            page: "managePage",
            roles: ["admin"]
        }
    ];

    features
        .filter(feature => feature.roles.includes(currentRole))
        .forEach(feature => {
            const card = document.createElement("div");
            card.className = "feature-card";

            card.append(
                createTextElement("h3", feature.title),
                createTextElement("p", feature.description)
            );

            const button = createTextElement("button", "Buka Menu");
            button.type = "button";
            button.className = "btn primary";
            button.style.marginTop = "16px";

            button.addEventListener("click", () => {
                showPage(feature.page);
            });

            card.append(button);
            dashboardCards.append(card);
        });

    renderCategories("categoryPreview");
}

// 12. KATEGORI MASALAH
function renderCategories(containerId) {
    loadCategoriesFromAPI(containerId);
}

// 19. RIWAYAT DIAGNOSIS
async function renderHistory() {
    const container = getElement("historyContent");
    container.textContent = "Memuat riwayat...";

    try {
        const response = await fetch(`${API_URL}/history`);

        if (!response.ok) {
            throw new Error("Gagal mengambil riwayat.");
        }

        const result = await response.json();
        container.replaceChildren();

        if (!result.data || result.data.length === 0) {
            container.textContent = "Belum ada riwayat diagnosis.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const header = document.createElement("tr");

        ["ID", "Tanggal", "Kategori", "Hasil", "Penyebab", "Solusi"]
            .forEach(label => {
                header.append(createTextElement("th", label));
            });

        thead.append(header);

        result.data.forEach(item => {
            const row = document.createElement("tr");

            [
                item.id,
                item.tanggal,
                item.kategori,
                item.hasil,
                item.penyebab,
                item.solusi
            ].forEach(value => {
                row.append(createTextElement("td", String(value ?? "-")));
            });

            tbody.append(row);
        });

        table.append(thead, tbody);
        container.append(table);

    } catch (error) {
        container.textContent = "Gagal memuat riwayat diagnosis.";
        console.error("Gagal memuat riwayat:", error);
    }
}
// 20. STATISTIK
function renderStatistics() {
    const container = getElement("statisticsContent");
    container.replaceChildren();

    const total = historyData.length;
    const totalUsers = new Set(
        historyData.map(item => item.username)
    ).size;

    const cards = [
        {
            title: "Total Diagnosis",
            value: total
        },
        {
            title: "Pengguna Tercatat",
            value: totalUsers
        },
        {
            title: "Kategori Tersedia",
            value: categories.length
        }
    ];

    cards.forEach(item => {
        const card = document.createElement("div");
        card.className = "stat-card";

        card.append(
            createTextElement("p", item.title),
            createTextElement("h3", String(item.value))
        );

        container.append(card);
    });
}

// 21. PENGELOLAAN ADMIN
// Fitur admin dikelola melalui frontend/js/admin.js.

// 22. INISIALISASI
function initApp() {
    updateUserInfo();
    showPage("loginPage");
}

initApp();