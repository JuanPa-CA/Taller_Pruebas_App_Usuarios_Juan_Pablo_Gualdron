import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FormField from "@/components/FormField.vue";

describe("Componente FormField.vue", () => {
  it("muestra el mensaje de error con data-test {testId}-error", () => {
    const wrapper = mount(FormField, {
      props: {
        label: "Correo electrónico",
        modelValue: "",
        error: "El email es obligatorio",
        testId: "login-email",
      },
    });

    const errorEl = wrapper.find('[data-test="login-email-error"]');
    expect(errorEl.exists()).toBe(true);
    expect(errorEl.text()).toBe("El email es obligatorio");
  });

  it("no muestra el elemento de error cuando la propiedad error está vacía", () => {
    const wrapper = mount(FormField, {
      props: {
        label: "Correo electrónico",
        modelValue: "test@demo.com",
        error: "",
        testId: "login-email",
      },
    });

    const errorEl = wrapper.find('[data-test="login-email-error"]');
    expect(errorEl.exists()).toBe(false);
  });

  it("el botón Mostrar/Ocultar cambia el tipo de input de password a text y viceversa", async () => {
    const wrapper = mount(FormField, {
      props: {
        label: "Contraseña",
        type: "password",
        modelValue: "Secreto123",
        testId: "login-password",
      },
    });

    const input = wrapper.find('input[data-test="login-password"]');
    const toggleBtn = wrapper.find('[data-test="login-password-toggle"]');

    expect(toggleBtn.exists()).toBe(true);
    expect(input.attributes("type")).toBe("password");
    expect(toggleBtn.text()).toBe("Mostrar");

    // Clic para mostrar
    await toggleBtn.trigger("click");
    expect(input.attributes("type")).toBe("text");
    expect(toggleBtn.text()).toBe("Ocultar");

    // Clic para volver a ocultar
    await toggleBtn.trigger("click");
    expect(input.attributes("type")).toBe("password");
    expect(toggleBtn.text()).toBe("Mostrar");
  });

  it("emite update:modelValue cuando el usuario escribe en el input", async () => {
    const wrapper = mount(FormField, {
      props: {
        label: "Nombre",
        modelValue: "",
        testId: "user-name",
      },
    });

    const input = wrapper.find('input[data-test="user-name"]');
    await input.setValue("Carlos");

    expect(wrapper.emitted("update:modelValue")).toBeDefined();
    expect(wrapper.emitted("update:modelValue")[0]).toEqual(["Carlos"]);
  });
});
