import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ServiceWorkerRegister } from "./sw-register";

// Protege: el service worker se registra en "/" sin caché de actualización; sin soporte, no falla.
describe("ServiceWorkerRegister", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("registra /sw.js cuando el navegador lo soporta", () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    const { container } = render(<ServiceWorkerRegister />);
    expect(container.innerHTML).toBe("");
    expect(register).toHaveBeenCalledWith("/sw.js", { scope: "/", updateViaCache: "none" });
  });

  it("no hace nada sin serviceWorker", () => {
    vi.stubGlobal("navigator", {});
    expect(() => render(<ServiceWorkerRegister />)).not.toThrow();
  });
});
