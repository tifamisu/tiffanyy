import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tiffany Yin — PM × UI/UX × Illustration",
  description: "Portfolio of Tiffany Yin — Marketing & Analytics at Texas A&M University. Product management, UI/UX design, illustration, and creative work.",
  openGraph: {
    title: "Tiffany Yin — PM × UI/UX × Illustration",
    description: "Portfolio of Tiffany Yin — Marketing & Analytics at Texas A&M University. Product management, UI/UX design, illustration, and creative work.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tiffany Yin — PM × UI/UX × Illustration",
    description: "Portfolio of Tiffany Yin — Marketing & Analytics at Texas A&M University.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
