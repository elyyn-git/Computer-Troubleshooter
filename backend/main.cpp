
#include "crow.h"
#include "include/diagnosis.h"
#include "include/history.h"

// =================================
// MIDDLEWARE CORS
// =================================
struct CORS {
    struct context {};

    void before_handle(
        crow::request& req,
        crow::response& res,
        context& ctx
    ) {}

    void after_handle(
        crow::request& req,
        crow::response& res,
        context& ctx
    ) {
        res.add_header("Access-Control-Allow-Origin", "*");
        res.add_header(
            "Access-Control-Allow-Methods",
            "GET, POST, OPTIONS"
        );
        res.add_header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );
    }
};

int main() {
    crow::App<CORS> app;
    Diagnosis diagnosis;
    History history;

    // Halaman utama
    CROW_ROUTE(app, "/")([]() {
        return "Computer Troubleshooter API is running!";
    });

    // Menangani request OPTIONS (CORS Preflight)
    CROW_ROUTE(app, "/api/<path>")
    .methods(crow::HTTPMethod::OPTIONS)
    ([](const std::string& path) {
        return crow::response(204);
    });

    // =================================
    // API MENAMPILKAN KATEGORI
    // =================================
    CROW_ROUTE(app, "/api/categories")
    ([&diagnosis]() {
        crow::json::wvalue result;

        const auto& categories = diagnosis.getCategories();

        result["success"] = true;
        result["total"] = categories.size();

        for (size_t i = 0; i < categories.size(); i++) {
            result["data"][i]["id"] =
                categories[i].at("ID");

            result["data"][i]["kode"] =
                categories[i].at("Kode_Kategori");

            result["data"][i]["nama"] =
                categories[i].at("Nama_Kategori");
        }

        return result;
    });

    // =================================
    // API MENGAMBIL PERTANYAAN PERTAMA
    // =================================
    CROW_ROUTE(app, "/api/questions/<string>")
    ([&diagnosis](const std::string& categoryCode) {
        auto question = diagnosis.getFirstQuestion(categoryCode);

        crow::json::wvalue result;

        result["success"] = question.found;

        if (!question.found) {
            result["message"] =
                "Pertanyaan tidak ditemukan.";

            return crow::response(404, result.dump());
        }

        result["data"]["id"] = question.id;
        result["data"]["kategori"] = question.category;
        result["data"]["pertanyaan"] = question.question;

        return crow::response(200, result.dump());
    });

    // =================================
    // API MEMPROSES JAWABAN
    // =================================
    CROW_ROUTE(app, "/api/diagnosis/answer")
    .methods(crow::HTTPMethod::POST)
    ([&diagnosis, &history](const crow::request& req) {
        auto body = crow::json::load(req.body);

        if (!body) {
            return crow::response(400, "JSON tidak valid.");
        }

        if (!body.has("category") ||
            !body.has("question_id") ||
            !body.has("answer")) {
            return crow::response(400, "Data tidak lengkap.");
        }

        std::string category = body["category"].s();
        std::string questionID = body["question_id"].s();
        std::string answer = body["answer"].s();

        auto step = diagnosis.answerQuestion(
            category,
            questionID,
            answer
        );

        crow::json::wvalue result;

        result["success"] = step.found;

        if (!step.found) {
            result["message"] =
                "Jawaban atau pertanyaan tidak valid.";

            return crow::response(400, result.dump());
        }

        result["finished"] = step.finished;

        if (step.finished) {
            history.save(step.result);
            result["data"]["id"] = step.result.id;
            result["data"]["kategori"] = step.result.category;
            result["data"]["penyebab"] = step.result.cause;
            result["data"]["solusi"] = step.result.solution;
        } else {
            result["data"]["id"] = step.question.id;
            result["data"]["kategori"] = step.question.category;
            result["data"]["pertanyaan"] = step.question.question;
        }

        return crow::response(200, result.dump());
    });

    // =================================
// API MENGAMBIL RIWAYAT DIAGNOSIS
// =================================
    CROW_ROUTE(app, "/api/history")
    ([&history]() {
        auto histories = History::getAll();

        crow::json::wvalue result;

        result["success"] = true;
        result["total"] = histories.size();

        for (size_t i = 0; i < histories.size(); i++) {
            result["data"][i]["id"] =
                histories[i].at("ID_Riwayat");

            result["data"][i]["tanggal"] =
                histories[i].at("Tanggal");

            result["data"][i]["kategori"] =
                histories[i].at("Kode_Kategori");

            result["data"][i]["hasil"] =
                histories[i].at("ID_Hasil");

            result["data"][i]["penyebab"] =
                histories[i].at("Penyebab");

            result["data"][i]["solusi"] =
                histories[i].at("Solusi");
        }

        return crow::response(200, result.dump());
    });
    // Menjalankan server
    app.port(18080).multithreaded().run();

    return 0;
}
