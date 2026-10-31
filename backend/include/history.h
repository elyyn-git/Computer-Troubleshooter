#ifndef HISTORY_H
#define HISTORY_H

#include "../include/diagnosis.h"
#include <string>
#include <vector>
#include <map>

class History {
public:
    static void save(const DiagnosisResult& result);
    static void show();
    static std::vector<std::map<std::string, std::string>> getAll();
};

#endif