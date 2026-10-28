import { describe, it, expect } from "vitest";
import jwt from "jsonwebtoken";
import { generarJWT } from "../../helpers/generar-jwt.js";

describe("Helper generarJWT", () => {
  it("genera un token válido que incluye uid y rol en el payload", () => {
    const usuarioMock = {
      id: "64b8f0c2a5c8e4d3a1b2c3d4",
      rol: "admin",
    };

    const token = generarJWT(usuarioMock);
    expect(typeof token).toBe("string");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.uid).toBe(usuarioMock.id);
    expect(decoded.rol).toBe("admin");
    expect(decoded.exp).toBeDefined();
  });
});
