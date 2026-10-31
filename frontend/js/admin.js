
// ========================================
// ADMIN - COMPUTER TROUBLESHOOTER
// ========================================

const questionForm = document.getElementById("questionForm");
const newCategory = document.getElementById("newCategory");
const newQuestion = document.getElementById("newQuestion");
const newCause = document.getElementById("newCause");
const newSolution = document.getElementById("newSolution");
const questionTable = document.getElementById("questionTable");

// ========================================
// PILIHAN KATEGORI
// ========================================

function renderCategoryOptions() {
    if (!newCategory) return;

    const previousValue = newCategory.value;
    newCategory.replaceChildren();

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        newCategory.appendChild(option);
    });

    if (categories.some(category => category.id === previousValue)) {
        newCategory.value = previousValue;
    }
}

// ========================================
// TABEL PERTANYAAN TAMBAHAN
// ========================================

function renderQuestionTable() {
    if (!questionTable) return;

    questionTable.replaceChildren();

    if (!Array.isArray(questionDatabase) || questionDatabase.length === 0) {
        const empty = document.createElement("p");
        empty.textContent = "Belum ada pertanyaan tambahan.";
        questionTable.appendChild(empty);
        return;
    }

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const header = document.createElement("tr");

    ["No", "Kategori", "Pertanyaan", "Penyebab", "Solusi", "Aksi"]
        .forEach(label => {
            const th = document.createElement("th");
            th.textContent = label;
            header.appendChild(th);
        });

    thead.appendChild(header);

    questionDatabase.forEach((item, index) => {
        const category = categories.find(
            entry => entry.id === item.categoryId
        );

        const row = document.createElement("tr");

        [
            String(index + 1),
            category ? category.name : item.categoryId,
            item.question,
            item.cause,
            item.solution
        ].forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "btn outline";
        deleteButton.textContent = "Hapus";

        deleteButton.addEventListener("click", () => {
            if (!confirm("Hapus pertanyaan tambahan ini?")) return;

            questionDatabase.splice(index, 1);
            saveData();
            renderQuestionTable();
        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);
        tbody.appendChild(row);
    });

    table.append(thead, tbody);
    questionTable.appendChild(table);
}

// ========================================
// HALAMAN ADMIN
// ========================================

async function renderAdminPage() {
    if (!categories.length && typeof loadCategoriesFromAPI === "function") {
        await loadCategoriesFromAPI("categoryPreview");
    }

    renderCategoryOptions();
    renderQuestionTable();
}

// ========================================
// TAMBAH PERTANYAAN
// ========================================

if (questionForm) {
    questionForm.addEventListener("submit", event => {
        event.preventDefault();

        if (currentRole !== "admin") {
            alert("Hanya Admin yang dapat menambahkan pertanyaan.");
            return;
        }

        const categoryId = newCategory.value;
        const question = newQuestion.value.trim();
        const cause = newCause.value.trim();
        const solution = newSolution.value.trim();

        if (!categoryId || !question || !cause || !solution) {
            alert("Semua kolom harus diisi.");
            return;
        }

        const categoryExists = categories.some(
            category => category.id === categoryId
        );

        if (!categoryExists) {
            alert("Kategori tidak ditemukan. Pastikan server Crow berjalan.");
            return;
        }

        questionDatabase.push({
            id: Date.now(),
            categoryId,
            question,
            cause,
            solution,
            createdAt: new Date().toISOString()
        });

        saveData();
        questionForm.reset();
        renderCategoryOptions();
        renderQuestionTable();

        alert("Pertanyaan tambahan berhasil disimpan di browser ini.");
    });
}

// ========================================
// RIWAYAT DIAGNOSIS
// Update otomatis setiap 3 detik
// ========================================

async function loadHistory() {
    const historyContent = document.getElementById("historyContent");
    const historyPage = document.getElementById("historyPage");

    if (!historyContent || !historyPage) return;

    // Hanya mengambil data saat halaman riwayat dibuka.
    if (historyPage.classList.contains("hidden")) return;

    try {
        const response = await fetch(`${API_URL}/history`);

        if (!response.ok) {
            throw new Error("Gagal mengambil riwayat.");
        }

        const result = await response.json();

        historyContent.replaceChildren();

        if (!result.data || result.data.length === 0) {
            historyContent.textContent = "Belum ada riwayat diagnosis.";
            return;
        }

        const table = document.createElement("table");
        const thead = document.createElement("thead");
        const tbody = document.createElement("tbody");
        const header = document.createElement("tr");

        ["ID", "Tanggal", "Kategori", "Hasil", "Penyebab", "Solusi"]
            .forEach(label => {
                const th = document.createElement("th");
                th.textContent = label;
                header.appendChild(th);
            });

        thead.appendChild(header);

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
                const td = document.createElement("td");
                td.textContent = value || "-";
                row.appendChild(td);
            });

            tbody.appendChild(row);
        });

        table.append(thead, tbody);
        historyContent.appendChild(table);

    } catch (error) {
        console.error("Gagal memuat riwayat:", error);
    }
}

// Periksa riwayat setiap 3 detik.
setInterval(loadHistory, 3000);
