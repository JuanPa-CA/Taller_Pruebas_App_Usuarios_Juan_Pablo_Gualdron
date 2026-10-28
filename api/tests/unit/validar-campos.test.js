import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("express-validator", () => {
  const mockValidationResult = vi.fn();
  return {
    validationResult: mockValidationResult,
  };
});

import { validationResult } from "express-validator";
import { validarCampos } from "../../middlewares/validar-campos.js";

const crearRes = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

describe("Middleware validarCampos", () => {
  let res;
  let next;

  beforeEach(() => {
    res = crearRes();
    next = vi.fn();
    vi.clearAllMocks();
  });

  it("responde 400 con la lista de errores si validationResult no está vacío", () => {
    const req = {};
    const mockErrores = [
      { path: "email", msg: "Email no válido" },
      { path: "password", msg: "La contraseña es obligatoria" },
    ];

    validationResult.mockReturnValue({
      isEmpty: () => false,
      array: () => mockErrores,
    });

    validarCampos(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ errores: mockErrores });
    expect(next).not.toHaveBeenCalled();
  });

  it("llama a next() si no hay errores de validación", () => {
    const req = {};

    validationResult.mockReturnValue({
      isEmpty: () => true,
      array: () => [],
    });

    validarCampos(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
