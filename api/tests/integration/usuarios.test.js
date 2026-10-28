import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import Usuario from "../../models/usuario.js";
import { crearUsuario, crearAdmin, tokenAdmin, tokenUsuario } from "../helpers.js";
import { generarJWT } from "../../helpers/generar-jwt.js";

describe("Integración - CRUD de Usuarios (/api/usuarios)", () => {
  describe("GET /api/usuarios", () => {
    it("sin token responde 401", async () => {
      const res = await request(app).get("/api/usuarios");
      expect(res.status).toBe(401);
      expect(res.body.error).toBe("No hay token en la petición");
    });

    it("con token de rol usuario responde 403 No tiene permisos para esto", async () => {
      const token = await tokenUsuario();
      const res = await request(app).get("/api/usuarios").set("x-token", token);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe("No tiene permisos para esto");
    });

    it("con token de admin responde 200 con paginación y solo usuarios activos", async () => {
      const admin = await crearAdmin({ nombre: "Admin Master", email: "adminmaster@demo.com" });
      const adminToken = generarJWT(admin);

      await crearUsuario({ nombre: "Activo 1", email: "activo1@demo.com" });
      await crearUsuario({ nombre: "Inactivo 1", email: "inactivo1@demo.com", estado: false });

      const res = await request(app).get("/api/usuarios").set("x-token", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2); // Admin + Activo 1 (el inactivo no cuenta)
      expect(res.body.pagina).toBe(1);
      expect(res.body.limite).toBe(10);
      expect(res.body.totalPaginas).toBe(1);
      expect(Array.isArray(res.body.usuarios)).toBe(true);

      const emails = res.body.usuarios.map((u) => u.email);
      expect(emails).toContain("activo1@demo.com");
      expect(emails).not.toContain("inactivo1@demo.com");
    });

    it("con limite=51 responde 400 (límite máximo permitido es 50)", async () => {
      const token = await tokenAdmin();
      const res = await request(app)
        .get("/api/usuarios?limite=51")
        .set("x-token", token);

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
      expect(res.body.errores.some((e) => e.path === "limite")).toBe(true);
    });

    it("filtra por búsqueda y rol combinados (?buscar=ana&rol=usuario)", async () => {
      const adminToken = await tokenAdmin();

      await crearUsuario({ nombre: "Ana Torres", email: "ana@demo.com", rol: "usuario" });
      await crearUsuario({ nombre: "Ana María", email: "anamaria@demo.com", rol: "admin" });
      await crearUsuario({ nombre: "Carlos Pérez", email: "carlos@demo.com", rol: "usuario" });

      const res = await request(app)
        .get("/api/usuarios?buscar=ana&rol=usuario")
        .set("x-token", adminToken);

      expect(res.status).toBe(200);
      expect(res.body.usuarios.length).toBe(1);
      expect(res.body.usuarios[0].email).toBe("ana@demo.com");
    });
  });

  describe("GET /api/usuarios/:id", () => {
    it("con id mal formado responde 400", async () => {
      const token = await tokenAdmin();
      const res = await request(app)
        .get("/api/usuarios/abc")
        .set("x-token", token);

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
      expect(res.body.errores.some((e) => e.path === "id")).toBe(true);
    });

    it("con id válido que no existe responde 404", async () => {
      const token = await tokenAdmin();
      const res = await request(app)
        .get("/api/usuarios/64b8f0c2a5c8e4d3a1b2c3d4")
        .set("x-token", token);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Usuario no encontrado");
    });

    it("con id válido de usuario existente responde 200 y sus datos", async () => {
      const token = await tokenAdmin();
      const usuario = await crearUsuario({ nombre: "Diana Mora", email: "diana@demo.com" });

      const res = await request(app)
        .get(`/api/usuarios/${usuario.id}`)
        .set("x-token", token);

      expect(res.status).toBe(200);
      expect(res.body.nombre).toBe("Diana Mora");
      expect(res.body.email).toBe("diana@demo.com");
    });
  });

  describe("POST /api/usuarios", () => {
    it("admin crea usuario y la contraseña queda hasheada en la base de datos", async () => {
      const token = await tokenAdmin();

      const res = await request(app)
        .post("/api/usuarios")
        .set("x-token", token)
        .send({
          nombre: "Nuevo Empleado",
          email: "empleado@demo.com",
          password: "PasswordSeguro123",
          rol: "usuario",
        });

      expect(res.status).toBe(201);
      expect(res.body.nombre).toBe("Nuevo Empleado");
      expect(res.body.email).toBe("empleado@demo.com");
      expect(res.body.password).toBeUndefined();

      // Verificar en la BD directamente que la contraseña esté hasheada
      const usuarioEnBD = await Usuario.findOne({ email: "empleado@demo.com" });
      expect(usuarioEnBD).not.toBeNull();
      expect(usuarioEnBD.password).not.toBe("PasswordSeguro123");
      expect(usuarioEnBD.validarPassword("PasswordSeguro123")).toBe(true);
    });

    it("con datos incompletos responde 400", async () => {
      const token = await tokenAdmin();
      const res = await request(app)
        .post("/api/usuarios")
        .set("x-token", token)
        .send({
          nombre: "Faltan Campos",
        });

      expect(res.status).toBe(400);
      expect(res.body.errores).toBeDefined();
    });
  });

  describe("PUT /api/usuarios/:id", () => {
    it("admin intenta cambiar su propio rol y responde 400", async () => {
      const admin = await crearAdmin({ email: "admin_auto@demo.com" });
      const adminToken = generarJWT(admin);

      const res = await request(app)
        .put(`/api/usuarios/${admin.id}`)
        .set("x-token", adminToken)
        .send({ rol: "usuario" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No puedes cambiar tu propio rol");
    });

    it("con password vacía responde 200, no cambia la contraseña y el login sigue funcionando", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({
        email: "conpass@demo.com",
        password: "OriginalPassword123",
      });

      const resActualizar = await request(app)
        .put(`/api/usuarios/${usuario.id}`)
        .set("x-token", adminToken)
        .send({
          nombre: "Nombre Modificado",
          password: "", // Contraseña vacía = no se modifica
        });

      expect(resActualizar.status).toBe(200);
      expect(resActualizar.body.nombre).toBe("Nombre Modificado");

      // Comprobar que el login sigue funcionando con la password original
      const resLogin = await request(app).post("/api/auth/login").send({
        email: "conpass@demo.com",
        password: "OriginalPassword123",
      });
      expect(resLogin.status).toBe(200);
    });

    it("actualiza datos de otro usuario correctamente", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({ nombre: "Viejo Nombre", email: "viejo@demo.com" });

      const res = await request(app)
        .put(`/api/usuarios/${usuario.id}`)
        .set("x-token", adminToken)
        .send({ nombre: "Nuevo Nombre" });

      expect(res.status).toBe(200);
      expect(res.body.nombre).toBe("Nuevo Nombre");
    });
  });

  describe("DELETE /api/usuarios/:id", () => {
    it("admin intenta eliminarse a sí mismo y responde 400", async () => {
      const admin = await crearAdmin({ email: "admin_del@demo.com" });
      const adminToken = generarJWT(admin);

      const res = await request(app)
        .delete(`/api/usuarios/${admin.id}`)
        .set("x-token", adminToken);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("No puedes eliminar tu propia cuenta");
    });

    it("borrado lógico: responde 200, deja de aparecer en listado y ya no puede iniciar sesión", async () => {
      const adminToken = await tokenAdmin();
      const usuario = await crearUsuario({
        email: "a_borrar@demo.com",
        password: "Password123!",
      });

      const resDelete = await request(app)
        .delete(`/api/usuarios/${usuario.id}`)
        .set("x-token", adminToken);

      expect(resDelete.status).toBe(200);
      expect(resDelete.body.mensaje).toBe("Usuario eliminado");

      // Verificar que el usuario no aparece en el listado activo
      const resListar = await request(app)
        .get("/api/usuarios")
        .set("x-token", adminToken);
      const emails = resListar.body.usuarios.map((u) => u.email);
      expect(emails).not.toContain("a_borrar@demo.com");

      // Verificar que ya no puede iniciar sesión (devuelve 401 Usuario desactivado)
      const resLogin = await request(app).post("/api/auth/login").send({
        email: "a_borrar@demo.com",
        password: "Password123!",
      });
      expect(resLogin.status).toBe(401);
      expect(resLogin.body.error).toBe("Usuario desactivado");
    });

    it("con id de usuario no existente responde 404", async () => {
      const adminToken = await tokenAdmin();
      const res = await request(app)
        .delete("/api/usuarios/64b8f0c2a5c8e4d3a1b2c3d4")
        .set("x-token", adminToken);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe("Usuario no encontrado");
    });
  });
});
