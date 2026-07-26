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
      <body>
        <Providers>
          {session ? (
            <div style={{ display: "flex", minHeight: "100vh" }}>
              <Nav userEmail={session.user?.email ?? ""} />
              <main style={{ flex: 1, padding: 32, background: "#f6f8fb" }}>{children}</main>
            </div>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}