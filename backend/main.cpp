
#include <iostream>
#include <string>

#include "include/diagnosis.h"
#include "include/history.h"

using namespace std;

int main() {
    Diagnosis diagnosis;

    int choice;

    while (true) {
        cout << "\n";
        cout << "================================\n";
        cout << "     COMPUTER TROUBLESHOOTER\n";
        cout << "================================\n";
        cout << "1. Mulai Diagnosis\n";
        cout << "2. Lihat Riwayat\n";
        cout << "0. Keluar\n";
        cout << "================================\n";
        cout << "Pilih menu: ";

        string input;
        getline(cin, input);

        try {
            size_t pos;
            choice = stoi(input, &pos);

            if (pos != input.size()) {
                cout << "Pilihan tidak valid.\n";
                continue;
            }
        }
        catch (...) {
            cout << "Masukkan angka yang benar.\n";
            continue;
        }

        if (choice == 0) {
            cout << "Terima kasih telah menggunakan "
                    "Computer Troubleshooter!\n";
            break;
        }

        else if (choice == 1) {
            diagnosis.showCategories();

            cout << "\nMasukkan kode kategori: ";

            string categoryCode;
            getline(cin, categoryCode);

            DiagnosisResult result =
                diagnosis.start(categoryCode);

            if (result.found) {
                cout << "\n";
                cout << "================================\n";
                cout << "       HASIL DIAGNOSIS\n";
                cout << "================================\n";

                cout << "Kode hasil : " << result.id << '\n';
                cout << "Penyebab   : " << result.cause << '\n';
                cout << "Solusi     : " << result.solution << '\n';

                History::save(result);
            }
        }

        else if (choice == 2) {
            History::show();
        }

        else {
            cout << "Pilihan tidak tersedia.\n";
        }
    }

    return 0;
}
