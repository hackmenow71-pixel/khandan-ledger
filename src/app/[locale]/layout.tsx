import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Providers } from "@/components/Providers";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import { ThemeProvider } from "@/components/ThemeProvider";
import { CapacitorHandler } from "@/components/CapacitorHandler";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Account Management",
  description: "Account and profit management system",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  // If the locale is Urdu, we set direction to rtl
  const dir = locale === 'ur' ? 'rtl' : 'ltr';

  // Apply custom font class if Urdu, else default sans
  const fontClass = locale === 'ur' ? 'font-urdu' : `${geistSans.variable} ${geistMono.variable} font-sans`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var cleanBis = function() {
                  var nodes = document.querySelectorAll('[bis_skin_checked]');
                  for (var i = 0; i < nodes.length; i++) {
                    nodes[i].removeAttribute('bis_skin_checked');
                  }
                };
                cleanBis();
                if (window.MutationObserver) {
                  new MutationObserver(function(mutations) {
                    for (var i = 0; i < mutations.length; i++) {
                      if (mutations[i].attributeName === 'bis_skin_checked') {
                        mutations[i].target.removeAttribute('bis_skin_checked');
                      }
                    }
                  }).observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className={`${fontClass} antialiased min-h-screen flex flex-col bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <NextIntlClientProvider messages={messages}>
            <CapacitorHandler />
            <Providers>{children}</Providers>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
