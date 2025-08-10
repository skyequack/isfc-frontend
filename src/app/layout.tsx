import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Navigation from "@/components/Navigation/Navigation";
import "./globals.css";

// Read Clerk publishable key from env (required both at build and runtime)
const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

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
  // If the publishable key is missing (e.g., build/prerender), render a minimal layout to avoid crashes.
  if (!clerkPublishableKey) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Clerk publishable key is missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.");
    }
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}>
          <header className="bg-dark shadow-sm border-b border-dark sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">🍽️</span>
                </div>
                <h1 className="text-xl font-bold text-light">ISFC Catering</h1>
              </div>
              <div className="flex items-center gap-4">
                <Link href="/sign-in" className="text-highlight hover:text-accent transition-colors">
                  Sign In
                </Link>
                <Link href="/sign-up" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors font-medium">
                  Get Started
                </Link>
              </div>
            </div>
          </header>
          <main className="min-h-screen">{children}</main>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        >
          <SignedIn>
            <Navigation />
          </SignedIn>
          <SignedOut>
            <header className="bg-dark shadow-sm border-b border-dark sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">🍽️</span>
                  </div>
                  <h1 className="text-xl font-bold text-light">ISFC Catering</h1>
                </div>
                <div className="flex items-center gap-4">
                  <Link href="/sign-in" className="text-highlight hover:text-accent transition-colors">
                    Sign In
                  </Link>
                  <Link href="/sign-up" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors font-medium">
                    Get Started
                  </Link>
                </div>
              </div>
            </header>
          </SignedOut>
          <main className="min-h-screen">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
