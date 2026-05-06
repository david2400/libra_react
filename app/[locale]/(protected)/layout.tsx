/** @format */

import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

interface RootLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  await Promise.resolve(params);
  const messages = await getMessages();

  return (
    // <QueryProvider>
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
    // </QueryProvider>
  );
}
