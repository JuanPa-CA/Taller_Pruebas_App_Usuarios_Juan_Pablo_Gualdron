import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import PaginationBar from "@/components/PaginationBar.vue";

describe("Componente PaginationBar.vue", () => {
  it("en la página 1 deshabilita Anterior y emite change con la página 2", async () => {
    const wrapper = mount(PaginationBar, {
      props: { page: 1, totalPages: 3, total: 20, limit: 8 },
    });

    const $ = (id) => wrapper.find(`[data-test=${id}]`);

    expect($("pagination-info").text()).toContain("Mostrando 1–8 de 20");
    expect($("pagination-prev").attributes("disabled")).toBeDefined();
    expect($("pagination-next").attributes("disabled")).toBeUndefined();

    await $("pagination-next").trigger("click");
    expect(wrapper.emitted("change")[0]).toEqual([2]);
  });

  it("en la última página deshabilita Siguiente y permite Anterior", async () => {
    const wrapper = mount(PaginationBar, {
      props: { page: 3, totalPages: 3, total: 20, limit: 8 },
    });

    const $ = (id) => wrapper.find(`[data-test=${id}]`);

    expect($("pagination-info").text()).toContain("Mostrando 17–20 de 20");
    expect($("pagination-prev").attributes("disabled")).toBeUndefined();
    expect($("pagination-next").attributes("disabled")).toBeDefined();

    await $("pagination-prev").trigger("click");
    expect(wrapper.emitted("change")[0]).toEqual([2]);
  });

  it("cuando total es 0 muestra 'Mostrando 0–0 de 0'", () => {
    const wrapper = mount(PaginationBar, {
      props: { page: 1, totalPages: 1, total: 0, limit: 10 },
    });

    expect(wrapper.find('[data-test="pagination-info"]').text()).toContain(
      "Mostrando 0–0 de 0"
    );
  });
});
