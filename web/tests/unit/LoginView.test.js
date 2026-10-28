import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import LoginView from "@/views/LoginView.vue";
import { authApi } from "@/services/authApi.js";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
  useRoute: () => ({ query: {} }),
}));

describe("Vista LoginView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("con email inválido muestra el error y no llama a authApi.login", async () => {
    const loginSpy = vi.spyOn(authApi, "login");

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    // Llenar con email incorrecto y enviar formulario
    await wrapper.find('input[data-test="login-email"]').setValue("correo-invalido");
    await wrapper.find('input[data-test="login-password"]').setValue("Password123");
    await wrapper.find('form[data-test="login-form"]').trigger("submit");

    expect(loginSpy).not.toHaveBeenCalled();

    const emailError = wrapper.find('[data-test="login-email-error"]');
    expect(emailError.exists()).toBe(true);
    expect(emailError.text()).toBe("El email no tiene un formato válido");
  });

  it("con error del servidor muestra la alerta de error", async () => {
    vi.spyOn(authApi, "login").mockRejectedValue(new Error("Credenciales inválidas"));

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    await wrapper.find('input[data-test="login-email"]').setValue("admin@demo.com");
    await wrapper.find('input[data-test="login-password"]').setValue("Incorrecta123");
    await wrapper.find('form[data-test="login-form"]').trigger("submit");

    // Esperar resolución de promesas
    await new Promise((resolve) => setTimeout(resolve, 10));

    const alert = wrapper.find('[data-test="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe("Credenciales inválidas");
  });

  it("con credenciales válidas llama a authApi.login y redirige", async () => {
    vi.spyOn(authApi, "login").mockResolvedValue({
      token: "jwt-token",
      usuario: { uid: "1", nombre: "Admin", rol: "admin" },
    });

    const wrapper = mount(LoginView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    await wrapper.find('input[data-test="login-email"]').setValue("admin@demo.com");
    await wrapper.find('input[data-test="login-password"]').setValue("Admin123!");
    await wrapper.find('form[data-test="login-form"]').trigger("submit");

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(pushMock).toHaveBeenCalledWith({ name: "home" });
  });
});
