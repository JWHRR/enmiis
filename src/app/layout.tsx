import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ENMIIS — Premium Graduation Robes & Capes",
  description:
    "Premium graduation robes and capes, ready to wear in five sizes and shipped in 48 hours. Personalize yours with live 3D embroidery in the ENMIIS Atelier.",
  keywords: [
    "graduation robe",
    "custom graduation gown",
    "embroidered stole",
    "graduation cape",
    "3D configurator",
  ],
  openGraph: {
    title: "ENMIIS Atelier",
    description: "Couture graduation apparel, designed by you in real-time 3D.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Embroidery + display fonts: loaded with stable family names so the
            live canvas embroidery engine can render them directly. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&family=Great+Vibes&family=Cinzel:wght@400..700&family=Amiri:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("ennmiss-theme");if(t)document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
