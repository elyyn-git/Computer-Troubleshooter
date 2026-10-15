
#include <iostream>
#include <fstream>
#include <string>

using namespace std;

int main() {

    ifstream file("database/pertanyaan.csv");

    if (!file.is_open()) {
        cout << "File kategori.csv gagal dibuka!" << endl;
        return 1;
    }

    string baris;

    while (getline(file, baris)) {
        cout << baris << endl;
    }

    file.close();

    return 0;
}
