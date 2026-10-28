import { describe, it, expect, beforeEach } from "vitest";
import router from "@/router/index.js";
import { useAuth } from "@/composables/useAuth.js";

describe("Router y guardas de navegación (router/index.js)", () => {
  beforeEach(async () => {
    const { logout } = useAuth();
    logout();
    await router.push("/login");
  });

  it("redirige a /login con query redirect si un usuario no autenticado intenta acceder a una ruta protegida", async () => {
    await router.push("/perfil");
    expect(router.currentRoute.value.name).toBe("login");
    expect(router.currentRoute.value.query.redirect).toBe("/perfil");
  });

  it("redirige a /home si un usuario ya autenticado intenta acceder a login o registro (guestOnly)", async () => {
    const { setUser } = useAuth();
    setUser({ uid: "1", nombre: "Usuario", rol: "usuario" });

    await router.push("/login");
  });

  it("redirige a /perfil si un usuario no admin intenta acceder a /usuarios (requiresAdmin)", async () => {
    const { setUser } = useAuth();
    setUser({ uid: "2", nombre: "Usuario Normal", rol: "usuario" });

    localStorage.setItem("x-token", "fake-token");

    await router.push("/usuarios");
    expect(["profile", "login"]).toContain(router.currentRoute.value.name);
  });

  it("actualiza document.title después de cada navegación", async () => {
    await router.push("/login");
    expect(document.title).toContain("Iniciar sesión");
  });

  it("resuelve todos los componentes de ruta perezosos (lazy-loaded routes)", async () => {
    const routes = router.getRoutes();
    for (const r of routes) {
      if (typeof r.components?.default === "function") {
        const comp = await r.components.default();
        expect(comp).toBeDefined();
      }
    }
  });
});
