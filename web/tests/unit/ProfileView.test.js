import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ProfileView from "@/views/ProfileView.vue";
import { useAuth } from "@/composables/useAuth.js";
import { authApi } from "@/services/authApi.js";

describe("Vista ProfileView.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const { setUser } = useAuth();
    setUser({
      uid: "1",
      nombre: "Ana Torres",
      email: "ana@demo.com",
      rol: "usuario",
      createdAt: "2024-01-01T00:00:00.000Z",
    });
  });

  it("renderiza el rol en el badge y los datos iniciales del usuario", () => {
    const wrapper = mount(ProfileView);

    expect(wrapper.find('[data-test="profile-role"]').text()).toBe("Usuario");
    expect(wrapper.find('input[data-test="profile-name"]').element.value).toBe("Ana Torres");
    expect(wrapper.find('input[data-test="profile-email"]').element.value).toBe("ana@demo.com");
  });

  it("permite guardar los cambios del perfil llamando a authApi.actualizarPerfil", async () => {
    const spy = vi.spyOn(authApi, "actualizarPerfil").mockResolvedValue({
      uid: "1",
      nombre: "Ana María Torres",
      email: "anamaria@demo.com",
      rol: "usuario",
      createdAt: "2024-01-01T00:00:00.000Z",
    });

    const wrapper = mount(ProfileView);

    await wrapper.find('input[data-test="profile-name"]').setValue("Ana María Torres");
    await wrapper.find('input[data-test="profile-email"]').setValue("anamaria@demo.com");
    await wrapper.find('form[data-test="profile-form"]').trigger("submit");

    expect(spy).toHaveBeenCalledWith({
      nombre: "Ana María Torres",
      email: "anamaria@demo.com",
    });
  });

  it("permite cambiar la contraseña llamando a authApi.cambiarPassword", async () => {
    const spy = vi.spyOn(authApi, "cambiarPassword").mockResolvedValue({
      mensaje: "Contraseña actualizada",
    });

    const wrapper = mount(ProfileView);

    await wrapper.find('input[data-test="password-current"]').setValue("PasswordActual1!");
    await wrapper.find('input[data-test="password-new"]').setValue("PasswordNueva2!");
    await wrapper.find('input[data-test="password-confirmation"]').setValue("PasswordNueva2!");
    await wrapper.find('form[data-test="password-form"]').trigger("submit");

    expect(spy).toHaveBeenCalledWith({
      passwordActual: "PasswordActual1!",
      passwordNueva: "PasswordNueva2!",
    });
  });
});
