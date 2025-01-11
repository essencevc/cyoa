import Link from "next/link";
import { Terminal } from "lucide-react";

import SignOut from "@/components/header/sign-out";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
import UserInfo from "@/components/header/user-info";
import { SessionProvider } from "next-auth/react";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  return (
    <SessionProvider session={session}>
      <ReactQueryProvider>
        <div className="min-h-screen bg-black text-green-400 font-mono">
          <header className="border-b border-green-400/20">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-6 h-6" />
                <Link href="/" className="text-xl font-bold">
                  CYOA-OS v1.0
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <UserInfo session={session} />
                <SignOut />
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 py-4">
            <div className="min-h-[calc(100vh-200px)]">{children}</div>
          </div>

          {/* Footer */}
          <footer className="border-t border-green-400/20">
            <div className="container mx-auto px-4 py-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5" />
                  <span>CYOA-OS v1.0</span>
                </div>
                <div className="flex space-x-6">
                  <Link
                    href="#"
                    className="text-green-400/80 hover:text-green-400"
                  >
                    About
                  </Link>
                  <Link
                    href="#"
                    className="text-green-400/80 hover:text-green-400"
                  >
                    Terms
                  </Link>
                  <Link
                    href="#"
                    className="text-green-400/80 hover:text-green-400"
                  >
                    Privacy
                  </Link>
                </div>
                <div className="text-green-400/60 text-sm">
                  © {new Date().getFullYear()} CYOA-OS. All rights reserved.
                </div>
              </div>
            </div>
          </footer>
        </div>
      </ReactQueryProvider>
    </SessionProvider>
  );
};

export default Layout;
