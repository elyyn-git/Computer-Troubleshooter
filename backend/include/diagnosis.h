
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

class Diagnosis {
private:
    std::vector<CSVRow> categories;
    std::vector<CSVRow> questions;
    std::vector<CSVRow> solutions;

public:
    Diagnosis();

    void loadDatabase();

    void showCategories();

    DiagnosisResult start(
        const std::string& categoryCode
    );

    const std::vector<CSVRow>& getCategories() const;
};

#endif
