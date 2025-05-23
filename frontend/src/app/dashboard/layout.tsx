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
        <div className="min-h-screen bg-black text-green-400 font-mono flex flex-col">
          <header className="border-b border-green-400/20">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
              <div className="flex flex-col items-center sm:items-start">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />
                  <Link href="/" className="text-lg sm:text-xl font-bold">
                    CYOA-OS v1.0
                  </Link>
                </div>
                <Link
                  href="/about"
                  className="mt-2 px-3 py-1 border border-green-400/40 rounded text-xs bg-black hover:bg-green-400/10 transition-colors duration-200 shadow-sm"
                >
                  [ABOUT]
                </Link>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <UserInfo session={session} />
                <div className="w-full sm:w-auto mt-2 sm:mt-0">
                  <SignOut />
                </div>
              </div>
            </div>
          </header>
          <div className="container mx-auto px-4 py-4 flex-grow">
            <div className="min-h-[calc(100vh-200px)]">{children}</div>
          </div>

          {/* Footer */}
          <footer className="border-t border-green-400/20 mt-auto">
            <div className="container mx-auto px-4 py-3">
              <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-center md:text-left">
                <div className="flex items-center space-x-2">
                  <Terminal className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="text-sm md:text-base">CYOA-OS v1.0</span>
                </div>
                <div className="text-green-400/60 text-xs md:text-sm mt-1 md:mt-0">
                  © {new Date().getFullYear()} CYOA-OS. All rights reserved.
                  <span className="block md:inline md:ml-1">
                    Built with{" "}
                    <a
                      href="https://restate.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      Restate
                    </a>
                    ,{" "}
                    <a
                      href="https://modal.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      Modal
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://aistudio.google.com/prompts/new_chat"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      Gemini
                    </a>{" "}
                    by{" "}
                    <a
                      href="https://x.com/ivanleomk"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-400 hover:text-green-300"
                    >
                      @ivanleomk
                    </a>
                  </span>
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
