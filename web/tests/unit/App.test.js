import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import App from "@/App.vue";
import { useAuth } from "@/composables/useAuth.js";
import { authApi } from "@/services/authApi.js";

describe("Componente App.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra AppHeader cuando el usuario está autenticado", async () => {
    vi.spyOn(authApi, "login").mockResolvedValue({
      token: "dummy-token",
      usuario: { uid: "1", nombre: "Admin", rol: "admin" },
    });

    const { login } = useAuth();
    await login({ email: "admin@demo.com", password: "Password123" });

    const wrapper = mount(App, {
      global: {
        stubs: {
          AppHeader: true,
          ToastContainer: true,
          RouterView: true,
        },
      },
    });

    expect(wrapper.findComponent({ name: "AppHeader" }).exists()).toBe(true);
    expect(wrapper.findComponent({ name: "ToastContainer" }).exists()).toBe(true);
  });
});
