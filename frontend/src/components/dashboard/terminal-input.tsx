"use client";

import { useState } from "react";
import { Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TerminalInput() {
  const [input, setInput] = useState("");

  return (
    <div className="flex items-center gap-2">
      <span className="text-white">root@cyoa-os:~$</span>
      <Input
        // ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        // onKeyDown={handleKeyDown}
        className="flex-1 bg-transparent border-none text-[#39FF14] placeholder:text-green-800/50 focus-visible:ring-0 h-8 p-0"
        placeholder="Write a story about... (press Enter)"
      />
    </div>
  );
}
