import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "ISFC Management Platform",
  description: "Internal management platform for ISFC Catering Company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">🍽️</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">ISFC Catering</h1>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-orange-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/checklists" className="text-gray-600 hover:text-orange-600 transition-colors">
                Orders
              </Link>
              <Link href="/escalations" className="text-gray-600 hover:text-orange-600 transition-colors">
                Issues
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-orange-600 transition-colors">
                Sign In
              </button>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                Get Started
              </button>
            </div>
          </div>
        </header>
        <main className="min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
