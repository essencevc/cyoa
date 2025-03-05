import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 bg-black/50 max-w-5xl mx-auto rounded-lg p-4 animate-pulse">
      {/* Terminal Input Loading */}
      <div className="h-12 bg-green-900/30 rounded"></div>

      {/* Sample Stories Loading */}
      <div className="space-y-4">
        <div className="h-6 w-64 bg-green-900/30 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-green-900/30 rounded"></div>
          ))}
        </div>
      </div>

      {/* User Stories Loading */}
      <div className="space-y-4">
        <div className="h-6 w-64 bg-green-900/30 rounded"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-green-900/30 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
