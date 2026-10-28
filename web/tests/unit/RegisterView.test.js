import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import RegisterView from "@/views/RegisterView.vue";
import { authApi } from "@/services/authApi.js";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Vista RegisterView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("con datos inválidos no llama al servicio de registro y muestra errores", async () => {
    const regSpy = vi.spyOn(authApi, "registro");

    const wrapper = mount(RegisterView, {
      global: {
        stubs: { RouterLink: true },
      },
    });

    await wrapper.find('form[data-test="register-form"]').trigger("submit");

    expect(regSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-test="register-name-error"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="register-email-error"]').exists()).toBe(true);
  });

  it("con datos válidos llama a authApi.registro y redirige", async () => {
    vi.spyOn(authApi, "registro").mockResolvedValue({
      token: "jwt-token-register",
      usuario: { uid: "1", nombre: "Nuevo", rol: "usuario" },
    });

    const wrapper = mount(RegisterView, {
      global: {
        stubs: { RouterLink: true },
      },
    });

    await wrapper.find('input[data-test="register-name"]').setValue("Juan Pérez");
    await wrapper.find('input[data-test="register-email"]').setValue("juan@demo.com");
    await wrapper.find('input[data-test="register-password"]').setValue("Password123!");
    await wrapper.find('input[data-test="register-confirmation"]').setValue("Password123!");

    await wrapper.find('form[data-test="register-form"]').trigger("submit");
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(pushMock).toHaveBeenCalledWith({ name: "home" });
  });
});
