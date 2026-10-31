
#ifndef DIAGNOSIS_H
#define DIAGNOSIS_H

#include <string>
#include <vector>
#include "../include/csv.h"

struct DiagnosisResult {
    std::string id;
    std::string category;
    std::string cause;
    std::string solution;
    bool found = false;
};

struct DiagnosisQuestion {
    std::string id;
    std::string category;
    std::string question;
    std::string ifYes;
    std::string ifNo;
    bool found = false;
};

struct DiagnosisStep {
    bool found = false;
    bool finished = false;
    DiagnosisQuestion question;
    DiagnosisResult result;
};

class Diagnosis {
private:
    std::vector<CSVRow> categories;
    std::vector<CSVRow> questions;
    std::vector<CSVRow> solutions;

public:
    Diagnosis();

    void loadDatabase();
    void showCategories();

    DiagnosisResult start(const std::string& categoryCode);

    const std::vector<CSVRow>& getCategories() const;

    // Mengambil pertanyaan pertama
    DiagnosisQuestion getFirstQuestion(
        const std::string& categoryCode
    ) const;

    // Memproses jawaban pengguna
    DiagnosisStep answerQuestion(
        const std::string& categoryCode,
        const std::string& questionID,
        const std::string& answer
    ) const;
};

#endif
