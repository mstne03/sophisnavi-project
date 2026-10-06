import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminLayout, { metadata } from "./layout";
import LoginPage from "./login/page";
import AdminHome from "./page";
import EditPage, { dynamicParams, generateStaticParams } from "./paginas/[slug]/page";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

const props = (slug: string) => ({ params: Promise.resolve({ slug }), searchParams: Promise.resolve({}) });

// Protege: la demo del panel no se indexa, lista el contenido real y deja claro que no guarda nada.
describe("panel de administración (demo)", () => {
  it("el layout pide noindex, avisa de que es una demo y enlaza a la web", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    render(
      <AdminLayout params={Promise.resolve({})}>
        <p>hijo</p>
      </AdminLayout>,
    );
    expect(screen.getByRole("status").textContent).toMatch(/Demo/);
    expect(within(screen.getByRole("navigation", { name: "Panel" })).getByRole("link", { name: /ver la web/i }).getAttribute("href")).toBe("/");
    expect(screen.getByText("hijo")).toBeTruthy();
  });

  it("el inicio muestra los contadores, la tabla de páginas y las secciones", async () => {
    render(await AdminHome());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Hola, Sofi");
    expect(screen.getByText("Borradores").nextElementSibling?.textContent).toBe("9");
    expect(screen.getByText("Sin texto").nextElementSibling?.textContent).toBe("3");
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(10); // cabecera + 9 páginas
    expect(within(rows[1]).getByRole("link").getAttribute("href")).toMatch(/^\/admin\/paginas\//);
    expect(screen.getByRole("button", { name: /nueva página/i }).hasAttribute("disabled")).toBe(true);
  });

  it("el editor precarga la página, actualiza la vista previa y avisa al guardar", async () => {
    expect(dynamicParams).toBe(false);
    expect(await generateStaticParams()).toHaveLength(9);
    render(await EditPage(props("por-que-los-na-vi-son-azules")));
    const title = screen.getByLabelText("Título") as HTMLInputElement;
    expect(title.value).toMatch(/azules/);
    fireEvent.change(title, { target: { value: "Nuevo título" } });
    expect(within(screen.getByRole("complementary", { name: "Vista previa" })).getByText("Nuevo título")).toBeTruthy();
    fireEvent.change(screen.getByLabelText(/Texto/), { target: { value: "Hola **Eywa**" } });
    expect(screen.getByText("Eywa").tagName).toBe("STRONG");
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
    expect(screen.getByRole("status").textContent).toMatch(/no se guardan/);
    expect(screen.getByRole("link", { name: /ver en la web/i }).getAttribute("href")).toBe("/pandora/por-que-los-na-vi-son-azules");
  });

  it("el editor devuelve 404 con un slug desconocido", async () => {
    await expect(EditPage(props("nope"))).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("el login de demo lleva al panel sin enviar nada", () => {
    render(<LoginPage />);
    fireEvent.submit(screen.getByRole("button", { name: "Entrar" }).closest("form")!);
    expect(push).toHaveBeenCalledWith("/admin");
  });
});
