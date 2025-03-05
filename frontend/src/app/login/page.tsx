import TerminalLogin from "@/components/login/terminal-login";
import React from "react";

const Login = () => {
  return (
    <div className="min-h-screen bg-black text-green-400 font-mono">
      <div className="flex items-center justify-center h-screen p-4">
        <TerminalLogin />
      </div>
    </div>
  );
};

export default Login;
