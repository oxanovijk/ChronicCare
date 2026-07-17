import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/plus-jakarta-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ChroniCare | Care in Motion",
    template: "%s | ChroniCare",
  },
  description:
    "ChroniCare membantu Patient dan caregiver menjalani rutinitas perawatan jangka panjang dari satu tempat.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
