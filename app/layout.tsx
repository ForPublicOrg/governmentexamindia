import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const siteUrl = "https://governmentexamindia.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Government Exam India — Every exam, one clear next step",
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Government Exam India",
    title: "Every government exam. One clear next step.",
    description:
      "Search notifications, eligibility, seats, reservation and timelines for central and state government exams.",
    images: [
      {
        url: "https://governmentexamindia.com/og.png",
        width: 1734,
        height: 907,
        alt: "Government Exam India — Every government exam. One clear next step.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Government Exam India",
    description: "Every government exam. One clear next step.",
    images: ["https://governmentexamindia.com/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5ef",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN">
      <body>
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
