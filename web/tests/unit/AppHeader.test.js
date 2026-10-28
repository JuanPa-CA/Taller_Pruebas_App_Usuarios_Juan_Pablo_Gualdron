import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AppHeader from "@/components/AppHeader.vue";
import { useAuth } from "@/composables/useAuth.js";

const pushMock = vi.fn();

vi.mock("vue-router", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Componente AppHeader.vue", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza enlaces de administración si el usuario es admin", () => {
    const { setUser } = useAuth();
    setUser({ uid: "1", nombre: "Admin Master", rol: "admin" });

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.find('[data-test="nav-users"]').exists()).toBe(true);
    expect(wrapper.find('[data-test="current-user-name"]').text()).toBe("Admin Master");
  });

  it("no muestra el enlace de usuarios si el usuario es normal", () => {
    const { setUser } = useAuth();
    setUser({ uid: "2", nombre: "Ana Gómez", rol: "usuario" });

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    expect(wrapper.find('[data-test="nav-users"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="nav-profile"]').exists()).toBe(true);
  });

  it("al presionar cerrar sesión ejecuta logout y redirige a login", async () => {
    const { setUser } = useAuth();
    setUser({ uid: "1", nombre: "Admin Master", rol: "admin" });

    const wrapper = mount(AppHeader, {
      global: {
        stubs: {
          RouterLink: true,
        },
      },
    });

    const logoutBtn = wrapper.find('[data-test="logout"]');
    await logoutBtn.trigger("click");

    expect(pushMock).toHaveBeenCalledWith({ name: "login" });
  });
});
