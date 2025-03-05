import React from "react";

export default function ChoiceLoading() {
  return (
    <div className="w-full h-screen flex items-center justify-center bg-black">
      <div className="animate-pulse space-y-4 max-w-4xl w-full px-4">
        <div className="h-8 w-64 bg-green-900/30 rounded"></div>
        <div className="h-64 w-full bg-green-900/30 rounded"></div>
        <div className="h-32 w-full bg-green-900/30 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-16 bg-green-900/30 rounded"></div>
          <div className="h-16 bg-green-900/30 rounded"></div>
        </div>
      </div>
    </div>
  );
}
