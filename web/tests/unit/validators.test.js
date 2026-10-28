import { describe, it, expect } from "vitest";
import {
  validateName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
  isValid,
} from "@/utils/validators.js";

describe("Validadores del cliente (validators.js)", () => {
  describe("validateName", () => {
    it("retorna error si el nombre está vacío o solo contiene espacios", () => {
      expect(validateName("")).toBe("El nombre es obligatorio");
      expect(validateName("   ")).toBe("El nombre es obligatorio");
    });

    it("retorna error si tiene menos de 2 caracteres", () => {
      expect(validateName("A")).toBe("El nombre debe tener entre 2 y 60 caracteres");
    });

    it("retorna error si tiene más de 60 caracteres", () => {
      const largo = "A".repeat(61);
      expect(validateName(largo)).toBe("El nombre debe tener entre 2 y 60 caracteres");
    });

    it("retorna cadena vacía para nombres válidos", () => {
      expect(validateName("Juan Pérez")).toBe("");
      expect(validateName("Ana")).toBe("");
    });
  });

  describe("validateEmail", () => {
    it("retorna error si el email está vacío o solo espacios", () => {
      expect(validateEmail("")).toBe("El email es obligatorio");
      expect(validateEmail("   ")).toBe("El email es obligatorio");
    });

    it("retorna error si el formato es inválido", () => {
      expect(validateEmail("correo-invalido")).toBe("El email no tiene un formato válido");
      expect(validateEmail("sin-arroba.com")).toBe("El email no tiene un formato válido");
      expect(validateEmail("usuario@sin-dominio")).toBe("El email no tiene un formato válido");
    });

    it("retorna cadena vacía para un email válido", () => {
      expect(validateEmail("usuario@ejemplo.com")).toBe("");
      expect(validateEmail("ana.torres@empresa.org")).toBe("");
    });
  });

  describe("validatePassword", () => {
    it("retorna error si está vacía", () => {
      expect(validatePassword("")).toBe("La contraseña es obligatoria");
    });

    it("valida longitud mínima de 8 caracteres", () => {
      expect(validatePassword("Ab1")).toBe("La contraseña debe tener entre 8 y 64 caracteres");
    });

    it("valida longitud máxima de 64 caracteres", () => {
      const muyLarga = "A1a" + "x".repeat(65);
      expect(validatePassword(muyLarga)).toBe("La contraseña debe tener entre 8 y 64 caracteres");
    });

    it("valida que incluya al menos una mayúscula", () => {
      expect(validatePassword("password123")).toBe("La contraseña debe incluir al menos una mayúscula");
    });

    it("valida que incluya al menos una minúscula", () => {
      expect(validatePassword("PASSWORD123")).toBe("La contraseña debe incluir al menos una minúscula");
    });

    it("valida que incluya al menos un número", () => {
      expect(validatePassword("PasswordSinNumero")).toBe("La contraseña debe incluir al menos un número");
    });

    it("retorna cadena vacía si cumple todas las reglas", () => {
      expect(validatePassword("Password123")).toBe("");
      expect(validatePassword("Admin123!")).toBe("");
    });
  });

  describe("validatePasswordConfirmation", () => {
    it("retorna error si la confirmación está vacía", () => {
      expect(validatePasswordConfirmation("Password123", "")).toBe("Repite la contraseña");
    });

    it("retorna error si no coinciden las contraseñas", () => {
      expect(validatePasswordConfirmation("Password123", "OtraPassword456")).toBe(
        "Las contraseñas no coinciden"
      );
    });

    it("retorna cadena vacía si coinciden exactamente", () => {
      expect(validatePasswordConfirmation("Password123", "Password123")).toBe("");
    });
  });

  describe("isValid", () => {
    it("retorna true si todos los errores están vacíos", () => {
      expect(isValid({ email: "", password: "", nombre: "" })).toBe(true);
    });

    it("retorna false si algún campo contiene mensaje de error", () => {
      expect(isValid({ email: "Error en email", password: "" })).toBe(false);
    });
  });
});
