import { describe, expect, it } from "vitest";
import robots, { AI_TRAINING_BOTS } from "./robots";

// Protege: la política de bots decidida en seo-facts §3.3: todo permitido salvo /api y los bots de entrenamiento; sitemap absoluto.
describe("robots", () => {
  it("permite a todos salvo /api, bloquea el entrenamiento de IA y enlaza el sitemap", () => {
    const r = robots();
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules];
    expect(rules[0]).toEqual({ userAgent: "*", allow: "/", disallow: ["/api/"] });
    expect(rules[1]).toEqual({ userAgent: AI_TRAINING_BOTS, disallow: "/" });
    expect(AI_TRAINING_BOTS).toContain("GPTBot");
    expect(AI_TRAINING_BOTS).not.toContain("OAI-SearchBot");
    expect(r.sitemap).toBe("https://www.sophisnavi.com/sitemap.xml");
  });
});
