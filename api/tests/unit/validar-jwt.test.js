import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import { validarJWT } from "../../middlewares/validar-jwt.js";
import Usuario from "../../models/usuario.js";

const crearRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("Middleware validarJWT", () => {
  let res;
  let next;

  beforeEach(() => {
    res = crearRes();
    next = vi.fn();
    vi.restoreAllMocks();
  });

  it("responde 401 si no se envía header x-token", async () => {
    const req = { header: vi.fn().mockReturnValue(undefined) };

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "No hay token en la petición" });
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 401 si el token es inválido o expiró", async () => {
    const req = { header: vi.fn().mockReturnValue("token-invalido") };

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Token no válido o expirado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 401 si el usuario no existe en la base de datos", async () => {
    const token = jwt.sign({ uid: "64b8f0c2a5c8e4d3a1b2c3d4" }, process.env.JWT_SECRET);
    const req = { header: vi.fn().mockReturnValue(token) };
    vi.spyOn(Usuario, "findById").mockResolvedValue(null);

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuario desactivado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("responde 401 si el usuario tiene estado: false (desactivado)", async () => {
    const token = jwt.sign({ uid: "64b8f0c2a5c8e4d3a1b2c3d4" }, process.env.JWT_SECRET);
    const req = { header: vi.fn().mockReturnValue(token) };
    vi.spyOn(Usuario, "findById").mockResolvedValue({ id: "64b8f0c2a5c8e4d3a1b2c3d4", estado: false });

    await validarJWT(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Usuario desactivado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("asigna req.usuario y llama a next() cuando el token y usuario son válidos", async () => {
    const usuarioMock = { id: "64b8f0c2a5c8e4d3a1b2c3d4", estado: true, rol: "usuario" };
    const token = jwt.sign({ uid: usuarioMock.id }, process.env.JWT_SECRET);
    const req = { header: vi.fn().mockReturnValue(token) };
    vi.spyOn(Usuario, "findById").mockResolvedValue(usuarioMock);

    await validarJWT(req, res, next);

    expect(req.usuario).toEqual(usuarioMock);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
