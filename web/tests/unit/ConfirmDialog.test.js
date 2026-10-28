import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

describe("Componente ConfirmDialog.vue", () => {
  it("no se renderiza en el DOM cuando open es false", () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: false },
      global: {
        stubs: { Teleport: true },
      },
    });

    expect(wrapper.find('[data-test="confirm-dialog"]').exists()).toBe(false);
  });

  it("renderiza título, mensaje y emite confirm al presionar confirm-accept", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: {
        open: true,
        title: "¿Eliminar elemento?",
        message: "Esta acción no se puede deshacer.",
        confirmText: "Sí, eliminar",
      },
      global: {
        stubs: { Teleport: true },
      },
    });

    expect(wrapper.find("#dialog-title").text()).toBe("¿Eliminar elemento?");
    expect(wrapper.find("#dialog-message").text()).toBe("Esta acción no se puede deshacer.");

    const acceptBtn = wrapper.find('[data-test="confirm-accept"]');
    expect(acceptBtn.text()).toBe("Sí, eliminar");

    await acceptBtn.trigger("click");
    expect(wrapper.emitted("confirm")).toBeDefined();
    expect(wrapper.emitted("confirm").length).toBe(1);
  });

  it("emite cancel al presionar confirm-cancel", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: true },
      global: {
        stubs: { Teleport: true },
      },
    });

    const cancelBtn = wrapper.find('[data-test="confirm-cancel"]');
    await cancelBtn.trigger("click");

    expect(wrapper.emitted("cancel")).toBeDefined();
    expect(wrapper.emitted("cancel").length).toBe(1);
  });

  it("emite cancel al presionar la tecla Escape en el backdrop", async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { open: true },
      global: {
        stubs: { Teleport: true },
      },
    });

    const backdrop = wrapper.find(".dialog-backdrop");
    await backdrop.trigger("keydown", { key: "Escape" });

    expect(wrapper.emitted("cancel")).toBeDefined();
  });
});
