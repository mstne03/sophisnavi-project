import type { VideoMeta } from "@/domain/content";

// Vista previa de un vídeo (patrón facade): miniatura descargada en el build + título, enlazando a la plataforma.
// No carga nada de TikTok al abrir la página: sin cookies de terceros ni JS ajeno (no requiere consentimiento).
export function VideoCard({ video }: { video: VideoMeta }) {
  const t = video.thumbnail;
  return (
    <a href={video.url} target="_blank" rel="noopener noreferrer" className="video-card">
      <span className="video-card-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element -- WebP generado en el build, como las imágenes de Notion */}
        <img src={t.src} width={t.width} height={t.height} alt="" loading="lazy" decoding="async" />
        <span aria-hidden="true" className="video-card-play" />
      </span>
      <span className="video-card-text">
        <span className="video-card-provider">TikTok{video.author && ` · ${video.author}`}</span>
        {video.title && <span className="video-card-title">{video.title}</span>}
        <span className="video-card-cta">Ver el vídeo en TikTok →</span>
      </span>
    </a>
  );
}
