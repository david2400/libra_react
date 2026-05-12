/** @format */

import { Layout } from "@/components/layout";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <Layout>{children}</Layout>;
}
