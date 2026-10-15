
#ifndef CSV_H
#define CSV_H

#include <string>
#include <vector>
#include <map>

using CSVRow = std::map<std::string, std::string>;

class CSV {
public:
    static std::vector<CSVRow> read(const std::string& filename);
    static void append(
        const std::string& filename,
        const std::vector<std::string>& values
    );
};

#endif
