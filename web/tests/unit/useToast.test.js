import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useToast } from "@/composables/useToast.js";

describe("Composable useToast (composables/useToast.js)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("success agrega un toast de tipo success y se elimina al pasar el tiempo", () => {
    const { toasts, success } = useToast();
    const id = success("Operación exitosa");

    expect(toasts.some((t) => t.id === id && t.message === "Operación exitosa" && t.type === "success")).toBe(true);

    // Avanza el temporizador por defecto (3500ms)
    vi.advanceTimersByTime(3500);

    expect(toasts.some((t) => t.id === id)).toBe(false);
  });

  it("error agrega un toast de tipo error y se elimina al pasar 5000ms", () => {
    const { toasts, error } = useToast();
    const id = error("Ocurrió un error inesperado");

    expect(toasts.some((t) => t.id === id && t.message === "Ocurrió un error inesperado" && t.type === "error")).toBe(true);

    vi.advanceTimersByTime(4999);
    expect(toasts.some((t) => t.id === id)).toBe(true);

    vi.advanceTimersByTime(1);
    expect(toasts.some((t) => t.id === id)).toBe(false);
  });

  it("dismiss elimina el toast inmediatamente", () => {
    const { toasts, success, dismiss } = useToast();
    const id = success("Mensaje temporal");

    expect(toasts.some((t) => t.id === id)).toBe(true);

    dismiss(id);

    expect(toasts.some((t) => t.id === id)).toBe(false);
  });
});
