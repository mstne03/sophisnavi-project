import { describe, expect, it } from "vitest";
import { canonicalTikTokUrl, parseOEmbed, tiktokOEmbedUrl } from "./tiktok";

// Protege: solo se aceptan vídeos reales de tiktok.com, sin parámetros de seguimiento, y del oEmbed solo lo validado.
describe("TikTok", () => {
  it("canonicaliza la URL de un vídeo quitando los parámetros de compartir", () => {
    const shared = "https://www.tiktok.com/@sophisnavi/video/7687679526872059168?is_from_webapp=1&sender_device=pc&web_id=745944";
    expect(canonicalTikTokUrl(shared)).toBe("https://www.tiktok.com/@sophisnavi/video/7687679526872059168");
    expect(canonicalTikTokUrl("https://tiktok.com/@a.b_c/video/1")).toBe("https://www.tiktok.com/@a.b_c/video/1");
  });

  it("rechaza http, otros dominios, dominios parecidos y URLs que no son de un vídeo", () => {
    for (const url of [
      "http://www.tiktok.com/@a/video/1",
      "https://www.tiktok.com.evil.example/@a/video/1",
      "https://evil.example/https://www.tiktok.com/@a/video/1",
      "https://www.tiktok.com/@a",
      "https://www.tiktok.com/@a/video/abc",
      "https://www.youtube.com/watch?v=1",
    ])
      expect(canonicalTikTokUrl(url), url).toBeUndefined();
  });

  it("construye la URL del oEmbed codificando la del vídeo", () => {
    expect(tiktokOEmbedUrl("https://www.tiktok.com/@a/video/1")).toBe("https://www.tiktok.com/oembed?url=https%3A%2F%2Fwww.tiktok.com%2F%40a%2Fvideo%2F1");
  });

  it("del oEmbed toma título, autor y miniatura https, y descarta lo demás", () => {
    expect(parseOEmbed({ title: " Hola\n  mundo ", author_name: "Sofi", thumbnail_url: "https://cdn/t.jpg?x=1", html: "<script>" })).toEqual({
      title: "Hola mundo",
      author: "Sofi",
      thumbnailUrl: "https://cdn/t.jpg?x=1",
    });
    expect(parseOEmbed({ title: 1, thumbnail_url: "https://cdn/t.jpg" })).toEqual({ title: "", author: "", thumbnailUrl: "https://cdn/t.jpg" });
    expect(parseOEmbed({ title: "x", thumbnail_url: "http://cdn/t.jpg" })).toBeUndefined();
    expect(parseOEmbed({ title: "x" })).toBeUndefined();
    expect(parseOEmbed(null)).toBeUndefined();
    expect(parseOEmbed("texto")).toBeUndefined();
  });
});
