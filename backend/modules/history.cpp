
#include "../include/history.h"
#include "../include/csv.h"

#include <iostream>
#include <fstream>
#include <ctime>
#include <iomanip>
#include <sstream>

void History::save(const DiagnosisResult& result) {
    if (!result.found) return;

    const std::string filename = "database/riwayat.csv";

    std::ifstream check(filename);

    if (!check.good()) {
        std::ofstream create(filename);
        create << "ID_Riwayat,Tanggal,Kode_Kategori,"
                  "ID_Hasil,Penyebab,Solusi\n";
    }

    std::ifstream file(filename);

    int total = 0;
    std::string line;

    while (std::getline(file, line)) {
        if (!line.empty()) total++;
    }

    file.close();

    std::time_t now = std::time(nullptr);
    std::tm localTime{};

    localtime_r(&now, &localTime);

    std::ostringstream date;
    date << std::put_time(&localTime, "%Y-%m-%d %H:%M:%S");

    std::ostringstream id;
    id << "H" << std::setw(4) << std::setfill('0') << total;

    CSV::append(filename, {
        id.str(),
        date.str(),
        result.category,
        result.id,
        result.cause,
        result.solution
    });

    std::cout << "\nRiwayat berhasil disimpan.\n";
}

void History::show() {
    auto histories = CSV::read("database/riwayat.csv");

    std::cout << "\n===== RIWAYAT DIAGNOSIS =====\n";

    if (histories.empty()) {
        std::cout << "Belum ada riwayat diagnosis.\n";
        return;
    }

    for (const auto& row : histories) {
        std::cout << "\nID       : " << row.at("ID_Riwayat");
        std::cout << "\nTanggal  : " << row.at("Tanggal");
        std::cout << "\nKategori : " << row.at("Kode_Kategori");
        std::cout << "\nHasil    : " << row.at("ID_Hasil");
        std::cout << "\nPenyebab : " << row.at("Penyebab");
        std::cout << "\nSolusi   : " << row.at("Solusi");
        std::cout << "\n-----------------------------\n";
    }
}

std::vector<std::map<std::string, std::string>> History::getAll() {
    return CSV::read("database/riwayat.csv");
}