import "./globals.css";
import Script from "next/script";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Providers from "./providers";
import Nav from "./nav";

export const metadata = { title: "Wing Fires CRM" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const unreadCount = session ? await prisma.notification.count({ where: { readAt: null } }) : 0;

  return (
    <html lang="en">
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {`try{document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')}catch(e){}`}
        </Script>
        <Providers>
          {session ? (
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Nav userEmail={session.user?.email ?? ""} unreadCount={unreadCount} />
              <main style={{ flex: 1, padding: 32, background: "var(--bg)", color: "var(--text)", minHeight: "100vh" }}>{children}</main>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
