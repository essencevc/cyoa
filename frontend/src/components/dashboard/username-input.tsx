"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateUsername } from "@/lib/user";

export function UsernameInput() {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await validateUsername(username);
    setMessage(result.message);

    if (result.success) {
      setTimeout(() => {
        router.refresh();
      }, 2000); // Refresh after 2 seconds to show the success message
    }
  };

  return (
    <div className="bg-black flex flex-col items-center justify-center font-mono">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl px-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white">root@cyoa-os:~$</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="flex-1 bg-transparent text-green-400 outline-none border-none"
            placeholder="Enter username..."
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            autoFocus
          />
        </div>
      </form>
      {message && (
        <div
          className={`text-${
            message.includes("Invalid") ? "red" : "green"
          }-400 mt-4`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
