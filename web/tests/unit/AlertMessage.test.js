import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import AlertMessage from "@/components/AlertMessage.vue";

describe("Componente AlertMessage.vue", () => {
  it("renderiza el mensaje y aplica la clase correspondiente al tipo", () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: "Credenciales incorrectas",
        type: "error",
      },
    });

    const alert = wrapper.find('[data-test="alert"]');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe("Credenciales incorrectas");
    expect(alert.classes()).toContain("alert--error");
  });

  it("aplica tipo success o info según se indique", () => {
    const wrapper = mount(AlertMessage, {
      props: {
        message: "Operación exitosa",
        type: "success",
      },
    });

    const alert = wrapper.find('[data-test="alert"]');
    expect(alert.classes()).toContain("alert--success");
  });

  it("no se renderiza si el mensaje está vacío", () => {
    const wrapper = mount(AlertMessage, {
      props: { message: "" },
    });

    expect(wrapper.find('[data-test="alert"]').exists()).toBe(false);
  });
});
