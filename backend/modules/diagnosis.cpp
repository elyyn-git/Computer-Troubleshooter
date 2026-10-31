
#include "../include/diagnosis.h"

#include <iostream>
#include <algorithm>
#include <set>
#include <cctype>

Diagnosis::Diagnosis() {
    loadDatabase();
}

void Diagnosis::loadDatabase() {
    categories = CSV::read("database/kategori.csv");
    questions = CSV::read("database/pertanyaan.csv");
    solutions = CSV::read("database/solusi.csv");

    std::cout << "Database berhasil dimuat.\n";
    std::cout << "Kategori   : " << categories.size() << '\n';
    std::cout << "Pertanyaan : " << questions.size() << '\n';
    std::cout << "Solusi     : " << solutions.size() << '\n';
}

const std::vector<CSVRow>& Diagnosis::getCategories() const {
    return categories;
}

void Diagnosis::showCategories() {
    std::cout << "\n===== KATEGORI MASALAH =====\n";

    for (const auto& category : categories) {
        std::cout
            << category.at("Kode_Kategori")
            << " - "
            << category.at("Nama_Kategori")
            << '\n';
    }
}

DiagnosisResult Diagnosis::start(
    const std::string& categoryCode
) {
    DiagnosisResult result;

    // Memeriksa apakah kategori tersedia
    bool categoryExists = false;

    for (const auto& category : categories) {
        if (category.at("Kode_Kategori") == categoryCode) {
            categoryExists = true;
            break;
        }
    }

    if (!categoryExists) {
        std::cout << "Kategori tidak ditemukan.\n";
        return result;
    }

    // Mencari pertanyaan pertama
    std::string currentID;

    for (const auto& question : questions) {
        if (question.count("Kode_Kategori") == 0 ||
            question.count("ID_Pertanyaan") == 0) {
            continue;
        }

        if (question.at("Kode_Kategori") == categoryCode) {
            currentID = question.at("ID_Pertanyaan");
            break;
        }
    }

    if (currentID.empty()) {
        std::cout << "Pertanyaan kategori belum tersedia.\n";
        return result;
    }

    std::set<std::string> visited;

    // Proses diagnosis
    while (true) {

        // Mencegah percabangan berulang
        if (visited.count(currentID)) {
            std::cout << "Terjadi percabangan berulang.\n";
            return result;
        }

        visited.insert(currentID);

        // Mencari pertanyaan berdasarkan ID
        auto it = std::find_if(
            questions.begin(),
            questions.end(),
            [&](const CSVRow& row) {
                return row.at("ID_Pertanyaan") == currentID &&
                       row.at("Kode_Kategori") == categoryCode;
            }
        );

        if (it == questions.end()) {
            std::cout << "Pertanyaan tidak ditemukan: "
                      << currentID << '\n';
            return result;
        }

        // Menampilkan pertanyaan
        std::cout << "\n" << it->at("Pertanyaan") << '\n';

        std::string answer;

        // Meminta jawaban Y atau T
        while (true) {
            std::cout << "Jawaban (Y/T): ";
            std::getline(std::cin, answer);

            std::transform(
                answer.begin(),
                answer.end(),
                answer.begin(),
                [](unsigned char c) {
                    return static_cast<char>(std::toupper(c));
                }
            );

            if (answer == "Y" || answer == "T") {
                break;
            }

            std::cout << "Masukkan hanya Y atau T.\n";
        }

        // Menentukan percabangan berikutnya
        std::string nextID =
            (answer == "Y")
            ? it->at("Jika_Y")
            : it->at("Jika_T");

        if (nextID.empty()) {
            std::cout << "Tujuan diagnosis belum diatur.\n";
            return result;
        }

        // Jika tujuan merupakan kode hasil R
        if (nextID[0] == 'R') {

            for (const auto& solution : solutions) {
                if (solution.at("ID_Hasil") == nextID &&
                    solution.at("Kode_Kategori") == categoryCode) {

                    result.id = nextID;
                    result.category = categoryCode;
                    result.cause = solution.at("Penyebab");
                    result.solution = solution.at("Solusi");
                    result.found = true;

                    return result;
                }
            }

            std::cout << "Hasil diagnosis tidak ditemukan.\n";
            return result;
        }

        // Jika tujuan merupakan pertanyaan berikutnya
        if (nextID[0] == 'Q') {
            currentID = nextID;
            continue;
        }

        std::cout << "Kode tujuan tidak valid: "
                  << nextID << '\n';

        return result;
    }
}


// ========================================
// FUNGSI BARU UNTUK CROW API
// ========================================

// Mengambil pertanyaan pertama berdasarkan kategori
DiagnosisQuestion Diagnosis::getFirstQuestion(
    const std::string& categoryCode
) const {
    DiagnosisQuestion result;

    // Pastikan kategori tersedia
    for (const auto& category : categories) {
        if (category.at("Kode_Kategori") != categoryCode) {
            continue;
        }

        // Cari pertanyaan pertama
        for (const auto& question : questions) {
            if (question.at("Kode_Kategori") == categoryCode) {
                result.id = question.at("ID_Pertanyaan");
                result.category = categoryCode;
                result.question = question.at("Pertanyaan");
                result.ifYes = question.at("Jika_Y");
                result.ifNo = question.at("Jika_T");
                result.found = true;

                return result;
            }
        }

        return result;
    }

    return result;
}


// Memproses jawaban pengguna dari website
DiagnosisStep Diagnosis::answerQuestion(
    const std::string& categoryCode,
    const std::string& questionID,
    const std::string& answer
) const {
    DiagnosisStep step;

    std::string userAnswer = answer;

    // Mengubah jawaban menjadi huruf kapital
    std::transform(
        userAnswer.begin(),
        userAnswer.end(),
        userAnswer.begin(),
        [](unsigned char c) {
            return static_cast<char>(std::toupper(c));
        }
    );

    if (userAnswer != "Y" && userAnswer != "T") {
        return step;
    }

    // Mencari pertanyaan saat ini
    auto it = std::find_if(
        questions.begin(),
        questions.end(),
        [&](const CSVRow& row) {
            return row.at("ID_Pertanyaan") == questionID &&
                   row.at("Kode_Kategori") == categoryCode;
        }
    );

    if (it == questions.end()) {
        return step;
    }

    // Menentukan tujuan berdasarkan jawaban
    std::string nextID =
        (userAnswer == "Y")
        ? it->at("Jika_Y")
        : it->at("Jika_T");

    if (nextID.empty()) {
        return step;
    }

    // Jika tujuan merupakan hasil diagnosis
    if (nextID[0] == 'R') {

        for (const auto& solution : solutions) {
            if (solution.at("ID_Hasil") == nextID &&
                solution.at("Kode_Kategori") == categoryCode) {

                step.found = true;
                step.finished = true;

                step.result.id = nextID;
                step.result.category = categoryCode;
                step.result.cause = solution.at("Penyebab");
                step.result.solution = solution.at("Solusi");
                step.result.found = true;

                return step;
            }
        }

        return step;
    }

    // Jika tujuan merupakan pertanyaan berikutnya
    if (nextID[0] == 'Q') {

        for (const auto& question : questions) {
            if (question.at("ID_Pertanyaan") == nextID &&
                question.at("Kode_Kategori") == categoryCode) {

                step.found = true;
                step.finished = false;

                step.question.id = nextID;
                step.question.category = categoryCode;
                step.question.question = question.at("Pertanyaan");
                step.question.ifYes = question.at("Jika_Y");
                step.question.ifNo = question.at("Jika_T");
                step.question.found = true;

                return step;
            }
        }
    }

    return step;
}
