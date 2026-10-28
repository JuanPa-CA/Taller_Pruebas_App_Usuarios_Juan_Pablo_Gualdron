import Usuario from "../models/usuario.js";
import { generarJWT } from "../helpers/generar-jwt.js";

let contador = 0;

export const crearUsuario = async (datos = {}) => {
  contador += 1;
  const usuario = new Usuario({
    nombre: `Usuario ${contador}`,
    email: `usuario${contador}_${Date.now()}@test.com`,
    password: "Password123",
    rol: "usuario",
    ...datos,
  });

  await usuario.save();
  return usuario;
};

export const crearAdmin = async (datos = {}) => {
  return await crearUsuario({
    rol: "admin",
    ...datos,
  });
};

export const tokenUsuario = async (datos = {}) => {
  const usuario = await crearUsuario(datos);
  return generarJWT(usuario);
};

export const tokenAdmin = async (datos = {}) => {
  const admin = await crearAdmin(datos);
  return generarJWT(admin);
};
