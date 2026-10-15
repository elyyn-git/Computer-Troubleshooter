
#include "../include/csv.h"

#include <fstream>
#include <sstream>
#include <iostream>

namespace {

std::vector<std::string> splitCSV(const std::string& line) {
    std::vector<std::string> result;
    std::string value;
    bool insideQuotes = false;

    for (size_t i = 0; i < line.size(); i++) {
        char c = line[i];

        if (c == '"') {
            if (insideQuotes && i + 1 < line.size()
                && line[i + 1] == '"') {
                value += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        }
        else if (c == ',' && !insideQuotes) {
            result.push_back(value);
            value.clear();
        }
        else {
            value += c;
        }
    }

    result.push_back(value);
    return result;
}

std::string escapeCSV(const std::string& value) {
    std::string result = "\"";

    for (char c : value) {
        if (c == '"') result += "\"\"";
        else result += c;
    }

    result += "\"";
    return result;
}

}

std::vector<CSVRow> CSV::read(const std::string& filename) {
    std::vector<CSVRow> rows;
    std::ifstream file(filename);

    if (!file.is_open()) {
        std::cerr << "Gagal membuka file: " << filename << '\n';
        return rows;
    }

    std::string line;

    if (!std::getline(file, line)) {
        return rows;
    }

    if (!line.empty() && line.back() == '\r') {
        line.pop_back();
    }

    std::vector<std::string> headers = splitCSV(line);
    if (!headers.empty() &&
    headers[0].substr(0, 3) == "\xEF\xBB\xBF") {
    headers[0].erase(0, 3);
}

    while (std::getline(file, line)) {
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }

        if (line.empty()) continue;

        std::vector<std::string> values = splitCSV(line);
        CSVRow row;

        for (size_t i = 0; i < headers.size(); i++) {
            row[headers[i]] =
                (i < values.size()) ? values[i] : "";
        }

        rows.push_back(row);
    }

    return rows;
}

void CSV::append(
    const std::string& filename,
    const std::vector<std::string>& values
) {
    std::ofstream file(filename, std::ios::app);

    if (!file.is_open()) {
        std::cerr << "Gagal menyimpan data ke " << filename << '\n';
        return;
    }

    for (size_t i = 0; i < values.size(); i++) {
        if (i > 0) file << ",";
        file << escapeCSV(values[i]);
    }

    file << '\n';
}
