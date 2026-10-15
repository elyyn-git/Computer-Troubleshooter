
#ifndef HISTORY_H
#define HISTORY_H

#include "../include/diagnosis.h"
#include <string>

class History {
public:
    static void save(const DiagnosisResult& result);
    static void show();
};

#endif
