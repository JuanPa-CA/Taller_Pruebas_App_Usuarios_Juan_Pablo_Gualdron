import { describe, it, expect, afterEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import Usuario from "../../models/usuario.js";
import { crearUsuario, tokenAdmin } from "../helpers.js";
import { generarJWT } from "../../helpers/generar-jwt.js";

const ID_INEXISTENTE = "64b8f0c2a5c8e4d3a1b2c3d4";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Manejo de errores (ramas defensivas)", () => {
  describe("Middleware de errores de app.js", () => {
    it("email duplicado por índice único (code 11000) responde 400", async () => {
      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(
        Object.assign(new Error("E11000 duplicate key"), { code: 11000 }),
      );

      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Duplicado Índice",
        email: "indice@demo.com",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("Ese email ya está registrado");
    });

    it("error de Schema de Mongoose (ValidationError) responde 400 con el mensaje", async () => {
      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(
        Object.assign(new Error("email inválido para el schema"), { name: "ValidationError" }),
      );

      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Schema Error",
        email: "schema@demo.com",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("email inválido para el schema");
    });

    it("error inesperado responde 500 Error interno", async () => {
      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(new Error("boom inesperado"));

      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Boom",
        email: "boom@demo.com",
        password: "Password123!",
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Error interno");
    });
  });

  describe("Controllers de autenticación", () => {
    it("login: fallo de base de datos responde 500", async () => {
      vi.spyOn(Usuario, "findOne").mockRejectedValue(new Error("db down"));

      const res = await request(app).post("/api/auth/login").send({
        email: "cualquiera@demo.com",
        password: "Password123",
      });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("Error interno");
    });

    it("actualizar perfil: fallo al guardar responde 500", async () => {
      const usuario = await crearUsuario({ email: "perfil-err@demo.com" });
      const token = generarJWT(usuario);

      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(new Error("db down"));

      const res = await request(app)
        .put("/api/auth/perfil")
        .set("x-token", token)
        .send({ nombre: "Nuevo Nombre" });

      expect(res.status).toBe(500);
    });

    it("cambiar contraseña: fallo al guardar responde 500", async () => {
      const usuario = await crearUsuario({ password: "Password123!" });
      const token = generarJWT(usuario);

      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(new Error("db down"));

      const res = await request(app)
        .put("/api/auth/password")
        .set("x-token", token)
        .send({ passwordActual: "Password123!", passwordNueva: "NuevaPassword123" });

      expect(res.status).toBe(500);
    });
  });

  describe("Controllers del CRUD de usuarios", () => {
    it("listar: fallo de base de datos responde 500", async () => {
      const adminToken = await tokenAdmin();
      vi.spyOn(Usuario, "countDocuments").mockRejectedValue(new Error("db down"));

      const res = await request(app).get("/api/usuarios").set("x-token", adminToken);

      expect(res.status).toBe(500);
    });

    it("obtener: fallo de base de datos responde 500", async () => {
      const adminToken = await tokenAdmin();
      const findByIdOriginal = Usuario.findById.bind(Usuario);
      vi.spyOn(Usuario, "findById").mockImplementation((id) =>
        id === ID_INEXISTENTE ? Promise.reject(new Error("db down")) : findByIdOriginal(id),
      );

      const res = await request(app)
        .get(`/api/usuarios/${ID_INEXISTENTE}`)
        .set("x-token", adminToken);

      expect(res.status).toBe(500);
    });

    it("crear: fallo al guardar responde 500", async () => {
      const adminToken = await tokenAdmin();
      vi.spyOn(Usuario.prototype, "save").mockRejectedValue(new Error("db down"));

      const res = await request(app)
        .post("/api/usuarios")
        .set("x-token", adminToken)
        .send({ nombre: "Crear Error", email: "crear-err@demo.com", password: "Password123!" });

      expect(res.status).toBe(500);
    });

    it("actualizar: fallo al buscar responde 500", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({ email: "act-err@demo.com" });
      const targetId = String(usuario._id);
      const findByIdOriginal = Usuario.findById.bind(Usuario);
      vi.spyOn(Usuario, "findById").mockImplementation((id) =>
        id === targetId ? Promise.reject(new Error("db down")) : findByIdOriginal(id),
      );

      const res = await request(app)
        .put(`/api/usuarios/${targetId}`)
        .set("x-token", adminToken)
        .send({ nombre: "Nuevo" });

      expect(res.status).toBe(500);
    });

    it("eliminar: fallo al buscar responde 500", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({ email: "del-err@demo.com" });
      const targetId = String(usuario._id);
      const findByIdOriginal = Usuario.findById.bind(Usuario);
      vi.spyOn(Usuario, "findById").mockImplementation((id) =>
        id === targetId ? Promise.reject(new Error("db down")) : findByIdOriginal(id),
      );

      const res = await request(app)
        .delete(`/api/usuarios/${targetId}`)
        .set("x-token", adminToken);

      expect(res.status).toBe(500);
    });

    it("actualizar con email válido lo actualiza (cubre validarEmail con id propio)", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({ email: "antes@demo.com" });

      const res = await request(app)
        .put(`/api/usuarios/${usuario.id}`)
        .set("x-token", adminToken)
        .send({ email: "despues@demo.com" });

      expect(res.status).toBe(200);
      expect(res.body.email).toBe("despues@demo.com");
    });
  });
});
