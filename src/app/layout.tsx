import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Marcellus } from "next/font/google";
import { SITE_NAME, SITE_URL, websiteJsonLd } from "@/application/seo/metadata";
import { JsonLd } from "@/ui/json-ld";
import { ServiceWorkerRegister } from "./sw-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Todo sobre Avatar en español: Pandora, personajes, clanes, la saga, colección y vida fan, por Sofi (@sophisnavi).",
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
  icons: { apple: "/icon-192x192.png" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#02040a",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${marcellus.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <JsonLd data={websiteJsonLd()} />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
