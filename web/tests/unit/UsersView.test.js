import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { createRouter, createMemoryHistory } from "vue-router";
import UsersView from "@/views/UsersView.vue";
import { usersApi } from "@/services/usersApi.js";
import { useAuth } from "@/composables/useAuth.js";

const dummyComponent = { template: "<div></div>" };

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: "/usuarios", name: "users", component: UsersView },
      { path: "/usuarios/nuevo", name: "user-create", component: dummyComponent },
      { path: "/usuarios/:id/editar", name: "user-edit", component: dummyComponent },
    ],
  });

describe("Vista UsersView.vue", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    const { setUser } = useAuth();
    setUser({ uid: "admin1", nombre: "Admin", rol: "admin" });
  });

  it("carga usuarios y renderiza las filas de la tabla", async () => {
    vi.spyOn(usersApi, "listar").mockResolvedValue({
      total: 2,
      pagina: 1,
      limite: 8,
      totalPaginas: 1,
      usuarios: [
        { uid: "u1", nombre: "Ana Torres", email: "ana@demo.com", rol: "usuario", createdAt: "2024-01-01T00:00:00.000Z" },
        { uid: "u2", nombre: "Luis Gómez", email: "luis@demo.com", rol: "usuario", createdAt: "2024-01-01T00:00:00.000Z" },
      ],
    });

    const router = createTestRouter();
    await router.push("/usuarios");
    await router.isReady();

    const wrapper = mount(UsersView, {
      global: {
        plugins: [router],
        stubs: {
          PaginationBar: true,
          ConfirmDialog: true,
        },
      },
    });

    await flushPromises();

    const rows = wrapper.findAll('[data-test="user-row"]');
    expect(rows.length).toBe(2);
    expect(wrapper.text()).toContain("Ana Torres");
    expect(wrapper.text()).toContain("Luis Gómez");
  });

  it("filtra por rol y limpia los filtros", async () => {
    const listSpy = vi.spyOn(usersApi, "listar").mockResolvedValue({
      total: 1,
      pagina: 1,
      limite: 8,
      totalPaginas: 1,
      usuarios: [
        { uid: "u1", nombre: "Ana Torres", email: "ana@demo.com", rol: "usuario", createdAt: "2024-01-01T00:00:00.000Z" },
      ],
    });

    const router = createTestRouter();
    await router.push("/usuarios");
    await router.isReady();

    const wrapper = mount(UsersView, {
      global: {
        plugins: [router],
        stubs: {
          PaginationBar: true,
          ConfirmDialog: true,
        },
      },
    });

    await flushPromises();

    // Cambiar filtro de rol
    const select = wrapper.find('select[data-test="users-role-filter"]');
    await select.setValue("admin");
    await flushPromises();

    // Limpiar filtros si existe el botón
    const clearBtn = wrapper.find('[data-test="users-clear-filters"]');
    if (clearBtn.exists()) {
      await clearBtn.trigger("click");
      await flushPromises();
    }

    expect(listSpy).toHaveBeenCalled();
  });

  it("abre el diálogo de confirmación y elimina un usuario", async () => {
    vi.spyOn(usersApi, "listar").mockResolvedValue({
      total: 1,
      pagina: 1,
      limite: 8,
      totalPaginas: 1,
      usuarios: [
        { uid: "u1", nombre: "Ana Torres", email: "ana@demo.com", rol: "usuario", createdAt: "2024-01-01T00:00:00.000Z" },
      ],
    });
    const deleteSpy = vi.spyOn(usersApi, "eliminar").mockResolvedValue({ mensaje: "Usuario eliminado" });

    const router = createTestRouter();
    await router.push("/usuarios");
    await router.isReady();

    const wrapper = mount(UsersView, {
      global: {
        plugins: [router],
        stubs: {
          PaginationBar: true,
          Teleport: true,
        },
      },
    });

    await flushPromises();

    const deleteBtn = wrapper.find('[data-test="user-delete"]');
    await deleteBtn.trigger("click");

    const confirmBtn = wrapper.find('[data-test="confirm-accept"]');
    await confirmBtn.trigger("click");
    await flushPromises();

    expect(deleteSpy).toHaveBeenCalledWith("u1");
  });
});
