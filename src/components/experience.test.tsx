import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TreeScene } from "@/ui/tree-scene/renderer";

type Opts = { reducedMotion: boolean; skipIntro: boolean; onIntroDone: () => void };
const createTreeScene = vi.fn<(canvas: HTMLCanvasElement, opts: Opts) => TreeScene>();
vi.mock("@/ui/tree-scene/renderer", () => ({ createTreeScene: (c: HTMLCanvasElement, o: Opts) => createTreeScene(c, o) }));

import { Experience } from "./experience";

const fakeScene = (opts: Opts): TreeScene => ({ skipIntro: () => opts.onIntroDone(), time: () => 0, dispose: vi.fn() });

// Protege: la intro se puede saltar (clic, teclado o sesión ya vista) y sin WebGL se va directo al menú.
describe("Experience", () => {
  beforeEach(() => {
    sessionStorage.clear();
    createTreeScene.mockReset().mockImplementation((_c, o) => fakeScene(o));
  });

  it("muestra la intro y pasa al menú al pulsar Saltar intro, recordándolo en la sesión", async () => {
    render(<Experience />);
    expect(screen.getByRole("heading", { level: 1, name: "Sophisnavi" })).toBeTruthy();
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: "Saltar intro" }));
    expect(await screen.findByRole("navigation", { name: "Menú principal" })).toBeTruthy();
    expect(sessionStorage.getItem("sophisnavi:intro-seen")).toBe("1");
  });

  it("salta la intro con Enter", async () => {
    render(<Experience />);
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    fireEvent.keyDown(window, { key: "Enter" });
    expect(await screen.findByRole("navigation")).toBeTruthy();
  });

  it("pide saltar la intro si ya se vio en esta sesión", async () => {
    sessionStorage.setItem("sophisnavi:intro-seen", "1");
    render(<Experience />);
    await vi.waitFor(() => expect(createTreeScene).toHaveBeenCalled());
    expect(createTreeScene.mock.calls[0][1].skipIntro).toBe(true);
  });

  it("va directo al menú si la escena no se puede crear (sin WebGL)", async () => {
    createTreeScene.mockImplementation(() => {
      throw new Error("no webgl");
    });
    render(<Experience />);
    expect(await screen.findByRole("navigation", { name: "Menú principal" })).toBeTruthy();
  });
});
