import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteUrl } from "@/lib/site";
import "./globals.css";
import "./storefront.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Graphic T-Shirts in Pakistan | The Item Box",
    template: "%s | The Item Box",
  },
  description: "Shop The Item Box graphic T-shirts and relaxed streetwear in Pakistan. Explore the Vice City Drop in bold colours and original player-inspired designs.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: "Graphic T-Shirts in Pakistan | The Item Box",
    description: "Shop bold graphic T-shirts and relaxed streetwear from The Item Box.",
    url: "/",
    siteName: "The Item Box",
    images: [{ url: "/banner.jpeg", alt: "The Item Box Vice City graphic T-shirt collection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Graphic T-Shirts in Pakistan | The Item Box",
    description: "Shop bold graphic T-shirts and relaxed streetwear from The Item Box.",
    images: ["/banner.jpeg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
