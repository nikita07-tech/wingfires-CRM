import "./globals.css";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Providers from "./providers";
import Nav from "./nav";

export const metadata = { title: "Wing Fires CRM" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.setAttribute('data-theme', localStorage.getItem('theme') === 'dark' ? 'dark' : 'light')}catch(e){}`,
          }}
        />
      </head>
      <body>
        <Providers>
          {session ? (
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Nav userEmail={session.user?.email ?? ""} />
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
