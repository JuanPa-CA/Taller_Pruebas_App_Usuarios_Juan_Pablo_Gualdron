import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import UserFormView from "@/views/UserFormView.vue";
import { usersApi } from "@/services/usersApi.js";
import { ApiError } from "@/services/http.js";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Vista UserFormView.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("en modo creación valida y envía datos a usersApi.crear", async () => {
    const spy = vi.spyOn(usersApi, "crear").mockResolvedValue({
      uid: "3",
      nombre: "Nuevo Usuario",
      email: "nuevo@demo.com",
      rol: "usuario",
    });

    const wrapper = mount(UserFormView, {
      global: {
        stubs: { RouterLink: true },
      },
    });

    await wrapper.find('input[data-test="user-name"]').setValue("Nuevo Usuario");
    await wrapper.find('input[data-test="user-email"]').setValue("nuevo@demo.com");
    await wrapper.find('input[data-test="user-password"]').setValue("Password123!");
    await wrapper.find('select[data-test="user-role"]').setValue("usuario");

    await wrapper.find('form[data-test="user-form"]').trigger("submit");
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(spy).toHaveBeenCalledWith({
      nombre: "Nuevo Usuario",
      email: "nuevo@demo.com",
      password: "Password123!",
      rol: "usuario",
    });
    expect(pushMock).toHaveBeenCalledWith({ name: "users" });
  });

  it("en modo edición carga datos del usuario y permite actualizarlo", async () => {
    vi.spyOn(usersApi, "obtener").mockResolvedValue({
      uid: "u999",
      nombre: "Carlos Usuario",
      email: "carlos@demo.com",
      rol: "usuario",
    });

    const updateSpy = vi.spyOn(usersApi, "actualizar").mockResolvedValue({
      uid: "u999",
      nombre: "Carlos Editado",
      email: "carlos@demo.com",
      rol: "usuario",
    });

    const wrapper = mount(UserFormView, {
      props: { id: "u999" },
      global: {
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.find('input[data-test="user-name"]').element.value).toBe("Carlos Usuario");

    await wrapper.find('input[data-test="user-name"]').setValue("Carlos Editado");
    await wrapper.find('form[data-test="user-form"]').trigger("submit");
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(updateSpy).toHaveBeenCalledWith("u999", {
      nombre: "Carlos Editado",
      email: "carlos@demo.com",
      rol: "usuario",
    });
  });

  it("si el usuario no existe muestra el estado no encontrado", async () => {
    vi.spyOn(usersApi, "obtener").mockRejectedValue(new ApiError(404, "No encontrado"));

    const wrapper = mount(UserFormView, {
      props: { id: "inexistente" },
      global: {
        stubs: { RouterLink: true },
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(wrapper.find('[data-test="user-not-found"]').exists()).toBe(true);
  });
});
