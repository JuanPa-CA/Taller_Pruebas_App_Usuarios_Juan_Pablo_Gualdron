import { describe, it, expect } from "vitest";
import Usuario from "../../models/usuario.js";

describe("Modelo Usuario", () => {
  it("toJSON devuelve uid en lugar de _id y no incluye password ni __v", () => {
    const usuario = new Usuario({
      nombre: "Carlos Gómez",
      email: "carlos@test.com",
      password: "Password123",
      rol: "usuario",
    });

    const json = usuario.toJSON();
    expect(json.uid).toBeDefined();
    expect(json._id).toBeUndefined();
    expect(json.password).toBeUndefined();
    expect(json.__v).toBeUndefined();
    expect(json.nombre).toBe("Carlos Gómez");
    expect(json.email).toBe("carlos@test.com");
  });

  it("hashea la contraseña antes de guardar con el hook pre('save')", async () => {
    const usuario = new Usuario({
      nombre: "Laura Díaz",
      email: "laura@test.com",
      password: "Password123",
    });

    await usuario.save();

    expect(usuario.password).not.toBe("Password123");
    expect(usuario.password.startsWith("$2")).toBe(true);
  });

  it("validarPassword verifica correctamente la contraseña con bcrypt", async () => {
    const usuario = new Usuario({
      nombre: "Pedro Ramos",
      email: "pedro@test.com",
      password: "Password123",
    });

    await usuario.save();

    expect(usuario.validarPassword("Password123")).toBe(true);
    expect(usuario.validarPassword("Erronea123")).toBe(false);
  });

  it("no vuelve a hashear la contraseña si no fue modificada", async () => {
    const usuario = new Usuario({
      nombre: "Marta Ruiz",
      email: "marta@test.com",
      password: "Password123",
    });

    await usuario.save();
    const hashOriginal = usuario.password;

    usuario.nombre = "Marta Elena Ruiz";
    await usuario.save();

    expect(usuario.password).toBe(hashOriginal);
  });
});
