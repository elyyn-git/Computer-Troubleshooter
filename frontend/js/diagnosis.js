
const API_URL = "https://employ-available-clusters-state.trycloudflare.com/api";

// Menyimpan kategori dan proses diagnosis yang sedang berjalan
let diagnosisCategories = [];
let currentCategoryCode = "";
let currentCategoryName = "";
let currentQuestionId = "";

// Mengambil elemen HTML
const categoryGrid = document.getElementById("categoryGrid");
const diagnosisTitle = document.getElementById("diagnosisTitle");
const questionNumber = document.getElementById("questionNumber");
const questionText = document.getElementById("questionText");
const yesButton = document.getElementById("yesButton");
const noButton = document.getElementById("noButton");
const resultContent = document.getElementById("resultContent");
const retryButton = document.getElementById("retryButton");

// Mengambil kategori dari backend Crow
async function loadCategoriesFromAPI(containerId = "categoryGrid") {
    try {
        const response = await fetch(`${API_URL}/categories`);
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error("Gagal mengambil kategori.");
        }

        diagnosisCategories = result.data;

        // Menyesuaikan data agar bisa digunakan script.js
        categories = result.data.map(item => ({
            id: item.kode,
            name: item.nama,
            description: "Pilih untuk memulai diagnosis.",
            questions: []
}));

        renderCategoriesFromAPI(containerId);

    } catch (error) {
        console.error(error);

        const container = document.getElementById(containerId);

        if (container) {
            container.innerHTML =
                "<p>Gagal mengambil kategori. Pastikan server Crow berjalan.</p>";
        }
    }
}

// Menampilkan kategori ke halaman
function renderCategoriesFromAPI(containerId) {
    const container = document.getElementById(containerId);

    if (!container) return;

    container.replaceChildren();

    diagnosisCategories.forEach(category => {
        const card = document.createElement("button");

        card.type = "button";
        card.className = "category-card";

        const icon = document.createElement("div");
        icon.className = "category-icon";
        icon.textContent = "PC";

        const title = document.createElement("h3");
        title.textContent = category.nama;

        const description = document.createElement("p");
        description.textContent = category.kode;

        card.append(icon, title, description);

        card.addEventListener("click", () => {
            startDiagnosisFromAPI(category.kode, category.nama);
        });

        container.appendChild(card);
    });
}


// Memulai diagnosis dan mengambil pertanyaan pertama
async function startDiagnosisFromAPI(categoryCode, categoryName) {
    try {
        currentCategoryCode = categoryCode;
        currentCategoryName = categoryName;
        diagnosisAnswers = [];

        const response = await fetch(
            `${API_URL}/questions/${categoryCode}`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Pertanyaan tidak ditemukan.");
        }

        showPage("diagnosisPage");

        if (diagnosisTitle) {
            diagnosisTitle.textContent = categoryName;
        }

        showQuestion(result.data);

    } catch (error) {
        alert(error.message);
        console.error(error);
    }
}

// Menampilkan pertanyaan
function showQuestion(question) {
    currentQuestionId = question.id;

    if (questionText) {
        questionText.textContent = question.pertanyaan;
    }

    if (questionNumber) {
        questionNumber.textContent = "Pertanyaan diagnosis";
    }

    if (yesButton) yesButton.disabled = false;
    if (noButton) noButton.disabled = false;
}

// Mengirim jawaban ke backend
async function submitDiagnosisAnswer(answer) {
    if (!currentQuestionId || !currentCategoryCode) return;

    try {
        yesButton.disabled = true;
        noButton.disabled = true;

        const response = await fetch(`${API_URL}/diagnosis/answer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                category: currentCategoryCode,
                question_id: currentQuestionId,
                answer: answer
            })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || "Gagal memproses jawaban.");
        }
        diagnosisAnswers.push({
            question: questionText.textContent,
            answer: answer === "Y" ? "Ya" : "Tidak"
        });

        if (result.finished) {
            showDiagnosisResult(result.data);
        } else {
            showQuestion(result.data);
        }

    } catch (error) {
        alert(error.message);
        console.error(error);

        yesButton.disabled = false;
        noButton.disabled = false;
    }
}

// Menampilkan hasil diagnosis
function showDiagnosisResult(data) {
    showPage("resultPage");

    if (resultContent) {
        resultContent.replaceChildren();

        const title = document.createElement("h3");
        title.textContent = "Hasil Diagnosis";

        const category = document.createElement("p");
        category.textContent = `Kategori: ${currentCategoryName}`;

        const causeTitle = document.createElement("strong");
        causeTitle.textContent = "Kemungkinan penyebab:";

        const cause = document.createElement("p");
        cause.textContent = data.penyebab;

        const solutionTitle = document.createElement("strong");
        solutionTitle.textContent = "Solusi:";

        const solution = document.createElement("p");
        solution.textContent = data.solusi;

        resultContent.append(
            title,
            category,
            causeTitle,
            cause,
            solutionTitle,
            solution
        );
    }

    // Menyimpan hasil ke riwayat
    lastDiagnosis = {
        id: Date.now(),
        username: currentUser,
        role: currentRole,
        categoryId: currentCategoryCode,
        category: currentCategoryName,
        date: new Date().toLocaleString("id-ID"),
        answers: [...diagnosisAnswers],
        causes: [{
            cause: data.penyebab,
            solution: data.solusi
        }],
        summary: data.penyebab
    };

    historyData.unshift(lastDiagnosis);
    saveData();
}

// Mengatur tombol Ya dan Tidak
if (yesButton) {
    yesButton.onclick = () => submitDiagnosisAnswer("Y");
}

if (noButton) {
    noButton.onclick = () => submitDiagnosisAnswer("T");
}

// Tombol mengulang diagnosis
if (retryButton) {
    retryButton.onclick = () => {
        showPage("categoryPage");
    };
}
