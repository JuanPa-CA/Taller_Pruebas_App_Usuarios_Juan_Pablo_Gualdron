import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { crearUsuario, tokenUsuario } from "../helpers.js";

describe("Integración - Rutas Generales y Autenticación (/api/auth)", () => {
  describe("Rutas Generales", () => {
    it("GET /api/health responde 200 con status ok", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: "ok" });
    });

    it("Ruta inexistente responde 404 en JSON", async () => {
      const res = await request(app).get("/api/ruta-que-no-existe");
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: "Ruta no encontrada" });
    });

    it("Body con JSON mal formado responde 400 con mensaje explicativo", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send("{ email: no-valido, }");

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("El cuerpo de la petición no es un JSON válido");
    });
  });

  describe("POST /api/auth/registro", () => {
    it("con datos válidos responde 201, token, rol usuario y sin campo password", async () => {
      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Nuevo Usuario",
        email: "nuevo@demo.com",
        password: "Password123!",
        rol: "admin", // Intentar crearse como admin
      });

      expect(res.status).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario).toBeDefined();
      expect(res.body.usuario.rol).toBe("usuario"); // Fuerza rol usuario
      expect(res.body.usuario.password).toBeUndefined();
      expect(res.body.usuario.uid).toBeDefined();
      expect(res.body.usuario.email).toBe("nuevo@demo.com");
    });

    it("con email ya registrado responde 400 con path email", async () => {
      await crearUsuario({ email: "duplicado@demo.com" });

      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Otro Usuario",
        email: "duplicado@demo.com",
        password: "Password123!",
      });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
      const errorEmail = res.body.errores.find((e) => e.path === "email");
      expect(errorEmail).toBeDefined();
      expect(errorEmail.msg).toBe("Ese email ya está registrado");
    });

    it("con contraseña corta responde 400", async () => {
      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Usuario Test",
        email: "test_pass@demo.com",
        password: "Ab1",
      });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
      expect(res.body.errores.some((e) => e.path === "password")).toBe(true);
    });

    it("con contraseña sin mayúscula responde 400", async () => {
      const res = await request(app).post("/api/auth/registro").send({
        nombre: "Usuario Test",
        email: "test_pass2@demo.com",
        password: "password123",
      });

      expect(res.status).toBe(400);
      expect(res.body.errores.some((e) => e.path === "password")).toBe(true);
    });
  });

  describe("POST /api/auth/login", () => {
    it("con credenciales correctas responde 200, token y usuario con uid", async () => {
      await crearUsuario({ email: "login@demo.com", password: "Password123" });

      const res = await request(app).post("/api/auth/login").send({
        email: "login@demo.com",
        password: "Password123",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.usuario).toBeDefined();
      expect(res.body.usuario.uid).toBeDefined();
      expect(res.body.usuario.password).toBeUndefined();
    });

    it("con contraseña incorrecta responde 401 Credenciales inválidas", async () => {
      await crearUsuario({ email: "login_err@demo.com", password: "Password123" });

      const res = await request(app).post("/api/auth/login").send({
        email: "login_err@demo.com",
        password: "PasswordIncorrecta",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Credenciales inválidas");
    });

    it("con email inexistente responde 401 con el mismo mensaje genérico", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "no_existe@demo.com",
        password: "Password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Credenciales inválidas");
    });

    it("con usuario desactivado responde 401 Usuario desactivado", async () => {
      await crearUsuario({ email: "inactivo@demo.com", password: "Password123", estado: false });

      const res = await request(app).post("/api/auth/login").send({
        email: "inactivo@demo.com",
        password: "Password123",
      });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Usuario desactivado");
    });
  });

  describe("GET /api/auth/perfil", () => {
    it("sin token responde 401", async () => {
      const res = await request(app).get("/api/auth/perfil");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("No hay token en la petición");
    });

    it("con token inválido responde 401", async () => {
      const res = await request(app)
        .get("/api/auth/perfil")
        .set("x-token", "token-invalido-123");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("Token no válido o expirado");
    });

    it("con token válido responde 200 y el perfil del usuario", async () => {
      const usuario = await crearUsuario({ nombre: "Perfil Test", email: "perfil@demo.com" });
      const token = await tokenUsuario({ email: "otro@demo.com" }); // let's use usuario's token:
      const { generarJWT } = await import("../../helpers/generar-jwt.js");
      const userToken = generarJWT(usuario);

      const res = await request(app)
        .get("/api/auth/perfil")
        .set("x-token", userToken);

      expect(res.status).toBe(200);
      expect(res.body.nombre).toBe("Perfil Test");
      expect(res.body.email).toBe("perfil@demo.com");
      expect(res.body.uid).toBe(usuario.id);
    });
  });

  describe("PUT /api/auth/perfil", () => {
    it("permite al usuario autenticado actualizar su nombre y email", async () => {
      const usuario = await crearUsuario({ nombre: "Original", email: "original@demo.com" });
      const { generarJWT } = await import("../../helpers/generar-jwt.js");
      const token = generarJWT(usuario);

      const res = await request(app)
        .put("/api/auth/perfil")
        .set("x-token", token)
        .send({ nombre: "Actualizado", email: "actualizado@demo.com" });

      expect(res.status).toBe(200);
      expect(res.body.nombre).toBe("Actualizado");
      expect(res.body.email).toBe("actualizado@demo.com");
    });
  });

  describe("PUT /api/auth/password", () => {
    it("con contraseña actual incorrecta responde 400", async () => {
      const usuario = await crearUsuario({ password: "PasswordOriginal1" });
      const { generarJWT } = await import("../../helpers/generar-jwt.js");
      const token = generarJWT(usuario);

      const res = await request(app)
        .put("/api/auth/password")
        .set("x-token", token)
        .send({
          passwordActual: "Incorrecta1",
          passwordNueva: "NuevaPassword2",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("La contraseña actual no es correcta");
    });

    it("con nueva contraseña igual a la actual responde 400", async () => {
      const usuario = await crearUsuario({ password: "PasswordOriginal1" });
      const { generarJWT } = await import("../../helpers/generar-jwt.js");
      const token = generarJWT(usuario);

      const res = await request(app)
        .put("/api/auth/password")
        .set("x-token", token)
        .send({
          passwordActual: "PasswordOriginal1",
          passwordNueva: "PasswordOriginal1",
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("La nueva contraseña debe ser distinta de la actual");
    });

    it("cambio correcto responde 200 y luego el login funciona con la nueva contraseña", async () => {
      const usuario = await crearUsuario({
        email: "cambiopass@demo.com",
        password: "PasswordOriginal1",
      });
      const { generarJWT } = await import("../../helpers/generar-jwt.js");
      const token = generarJWT(usuario);

      const resCambio = await request(app)
        .put("/api/auth/password")
        .set("x-token", token)
        .send({
          passwordActual: "PasswordOriginal1",
          passwordNueva: "PasswordNueva2",
        });

      expect(resCambio.status).toBe(200);
      expect(resCambio.body.mensaje).toBe("Contraseña actualizada");

      // Verificar que el login funciona con la nueva contraseña
      const resLogin = await request(app).post("/api/auth/login").send({
        email: "cambiopass@demo.com",
        password: "PasswordNueva2",
      });
      expect(resLogin.status).toBe(200);
      expect(resLogin.body.token).toBeDefined();

      // Verificar que la vieja ya no funciona
      const resLoginVieja = await request(app).post("/api/auth/login").send({
        email: "cambiopass@demo.com",
        password: "PasswordOriginal1",
      });
      expect(resLoginVieja.status).toBe(401);
    });
  });
});
