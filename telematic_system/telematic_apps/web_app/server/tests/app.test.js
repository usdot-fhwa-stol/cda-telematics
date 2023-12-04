const request = require("supertest")
const app = require("../app");
require("dotenv").config();

describe("GET /api/org/all", () => {
    it("connect ECONNREFUSED ", async () => {
        const res = await request(app).get("/api/org/all");
        expect(res.statusCode).toBe(500);
    });
});

describe("GET /api/users/login", () => {
    it("Session expired", async () => {
        const res = await request(app).get("/api/users/login");
        expect(res.statusCode).toBe(500);
    });
});