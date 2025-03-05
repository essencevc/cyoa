import React from "react";

export default function StoryLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 px-3 sm:px-4 animate-pulse">
      <div className="h-6 w-32 bg-green-900/30 rounded"></div>
      <div className="border-b border-green-900/30 pb-2">
        <div className="h-5 w-full bg-green-900/30 rounded"></div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        <div className="w-full md:w-1/5 flex justify-center md:justify-start">
          <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-lg bg-green-900/30"></div>
        </div>
        <div className="w-full md:w-4/5 space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-green-900/30 rounded"></div>
            <div className="h-20 w-full bg-green-900/30 rounded"></div>
          </div>
          <div className="h-8 w-40 bg-green-900/30 rounded"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-green-900/30 rounded"></div>
            <div className="h-2 w-full bg-green-900/30 rounded"></div>
          </div>
        </div>
      </div>
      <div className="border-b border-green-900/30 pb-2">
        <div className="h-5 w-full bg-green-900/30 rounded"></div>
      </div>
      <div className="h-20 w-full bg-green-900/30 rounded"></div>
      <div className="border-b border-green-900/30 pb-2">
        <div className="h-5 w-full bg-green-900/30 rounded"></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-green-900/30 rounded"></div>
        ))}
      </div>
    </div>
  );
}
