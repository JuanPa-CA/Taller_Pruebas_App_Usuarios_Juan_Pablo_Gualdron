import { describe, it, expect, vi, afterEach } from "vitest";
import Usuario from "../../models/usuario.js";
import { esRolValido, emailExiste } from "../../helpers/db-validators.js";

describe("Helpers db-validators", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("esRolValido", () => {
    it("acepta el rol 'admin'", () => {
      expect(esRolValido("admin")).toBe(true);
    });

    it("acepta el rol 'usuario'", () => {
      expect(esRolValido("usuario")).toBe(true);
    });

    it.each(["jefe", "ADMIN", "", undefined, "root"])(
      "rechaza rol inválido %j",
      (rol) => {
        expect(() => esRolValido(rol)).toThrow("El rol debe ser uno de: admin, usuario");
      }
    );
  });

  describe("emailExiste", () => {
    it("resuelve satisfactoriamente si el email no está registrado", async () => {
      vi.spyOn(Usuario, "findOne").mockResolvedValue(null);
      await expect(emailExiste("nuevo@test.com")).resolves.toBeUndefined();
    });

    it("busca el email normalizado (en minúsculas y sin espacios)", async () => {
      const spy = vi.spyOn(Usuario, "findOne").mockResolvedValue(null);
      await emailExiste("  Test@Ejemplo.com  ");
      expect(spy).toHaveBeenCalledWith({ email: "test@ejemplo.com" });
    });

    it("lanza un error si el email ya existe y pertenece a otro usuario", async () => {
      vi.spyOn(Usuario, "findOne").mockResolvedValue({ id: "usuario-existente" });
      await expect(emailExiste("existente@test.com", "mi-id")).rejects.toThrow(
        "Ese email ya está registrado"
      );
    });

    it("no lanza error si el email pertenece al propio usuario al editar", async () => {
      vi.spyOn(Usuario, "findOne").mockResolvedValue({ id: "mi-id" });
      await expect(emailExiste("propio@test.com", "mi-id")).resolves.toBeUndefined();
    });
  });
});
