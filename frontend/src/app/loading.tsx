import React from "react";

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/90 z-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-green-500 rounded-full animate-spin"></div>
        </div>
        <div className="font-mono text-green-500 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-white">root@cyoa-os:~$</span>
            <span className="text-green-400">loading content...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
