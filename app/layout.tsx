import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const siteUrl = "https://governmentexamindia.com";

const themeBootstrap = `
  (function () {
    try {
      var saved = localStorage.getItem("theme");
      var dark = saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
      var theme = dark ? "dark" : "light";
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = theme;
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", dark ? "#0b141b" : "#f7f5ef");
    } catch (_) {}
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Government Exam India — Government exams across India",
    template: "%s | Government Exam India",
  },
  description:
    "Search central and state government exams by education, status and location. Clear timelines, eligibility, vacancies, reservation and official sources.",
  applicationName: "Government Exam India",
  keywords: [
    "government exams India",
    "sarkari exam",
    "government jobs",
    "exam notification",
    "SSC",
    "UPSC",
    "state PSC",
  ],
  alternates: { canonical: "/" },
  icons: {
    // Generated from public/favicon.svg by `npm run icons:build`; the PNGs
    // exist only because iOS and Android ignore an SVG icon.
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.svg",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Government Exam India",
    title: "Government exams across India. One clear next step.",
    description:
      "Search notifications, eligibility, seats, reservation and timelines for central and state government exams.",
    images: [
      {
        url: "https://governmentexamindia.com/og-v2.jpg",
        width: 1734,
        height: 907,
        alt: "Government Exam India — government exams across India, with one clear next step.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Government Exam India",
    description: "Government exams across India. One clear next step.",
    images: ["https://governmentexamindia.com/og-v2.jpg"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef",
  colorScheme: "light dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
