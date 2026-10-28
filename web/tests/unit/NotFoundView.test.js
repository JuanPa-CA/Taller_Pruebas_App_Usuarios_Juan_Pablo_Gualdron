import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import NotFoundView from "@/views/NotFoundView.vue";

describe("Vista NotFoundView.vue", () => {
  it("renderiza el código 404 y el mensaje de página no encontrada", () => {
    const wrapper = mount(NotFoundView, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Página no encontrada");
  });
});
