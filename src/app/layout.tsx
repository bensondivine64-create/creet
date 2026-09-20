import type { Metadata, Viewport } from "next";
import { Sora, Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ConfirmProvider } from "@/contexts/ConfirmContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import IntroSplash from "@/components/IntroSplash";
import CookieConsentBanner from "@/components/CookieConsentBanner";
import AttributionCapture from "@/components/AttributionCapture";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const display = Sora({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = Plus_Jakarta_Sans({
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
              <NotificationsProvider>
                <PageTransition>{children}</PageTransition>
              </NotificationsProvider>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
        <CookieConsentBanner />
        <AttributionCapture />
      </body>
    </html>
  );
}
