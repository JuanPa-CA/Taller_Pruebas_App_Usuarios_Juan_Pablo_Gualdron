import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import ToastContainer from "@/components/ToastContainer.vue";
import { useToast } from "@/composables/useToast.js";

describe("Componente ToastContainer.vue", () => {
  it("renderiza los toasts activos y permite cerrarlos con el botón", async () => {
    const { success, error } = useToast();
    const idSuccess = success("Toast de éxito");
    const idError = error("Toast de error");

    const wrapper = mount(ToastContainer);

    const toastEls = wrapper.findAll('[data-test="toast"]');
    expect(toastEls.length).toBe(2);
    expect(wrapper.text()).toContain("Toast de éxito");
    expect(wrapper.text()).toContain("Toast de error");

    // Cerrar el primer toast
    const closeBtn = toastEls[0].find(".toast__close");
    await closeBtn.trigger("click");

    expect(wrapper.findAll('[data-test="toast"]').length).toBe(1);
  });
});
