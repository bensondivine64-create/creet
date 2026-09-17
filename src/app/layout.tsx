import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import IntroSplash from "@/components/IntroSplash";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AttributionCapture from "@/components/AttributionCapture";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "CREET",
  description: "CREET — buy, hire, and sell, all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CREET",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body text-fg bg-paper">
        <IntroSplash />
        <AuthProvider>
          <ToastProvider>
            <ConfirmProvider>
              <NotificationsProvider>{children}</NotificationsProvider>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
        <CookieConsentBanner />
        <AttributionCapture />
      </body>
    </html>
  );
}
