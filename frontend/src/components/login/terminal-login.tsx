"use client";

import { useTypewriter } from "@/hooks/useTypewriter";
import { Fingerprint, Sparkles, X } from "lucide-react";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/login-server";
import { Button } from "../ui/button";
import Link from "next/link";

interface TerminalLineConfig {
  text: string;
  loaderDuration: number;
  startDelay: number;
  loaderText: string;
  LoaderIcon?: React.ElementType; // Add optional loader icon prop
}

const TerminalLine = ({
  config,
  onComplete,
}: {
  config: TerminalLineConfig;
  onComplete: () => void;
}) => {
  const [renderLoader, setRenderLoader] = useState(false);

  const { text: renderText } = useTypewriter(
    config.text,
    {
      startDelay: config.startDelay,
      onComplete: () => setRenderLoader(true),
      skipAnimation: false,
    },
    20
  );

  useEffect(() => {
    if (renderLoader) {
      setTimeout(() => {
        onComplete();
        setRenderLoader(false);
      }, config.loaderDuration);
    }
  }, [renderLoader]);

  const LoaderIcon = config.LoaderIcon || Sparkles; // Use provided icon or fallback to Sparkles

  return (
    <div className="w-full">
      <div className="flex">
        <span className="text-white whitespace-nowrap shrink-0 mr-2">
          root@cyoa-os:~$
        </span>
        <span className="text-green-400/80">
          {renderText}
          <span className="animate-pulse"> ▋</span>
        </span>
      </div>
      {renderLoader && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
          className="flex items-center justify-center space-x-2 text-green-400/80 mt-4"
        >
          <motion.div
            animate={{
              opacity: [1, 0.5, 1],
            }}
            className="flex items-center space-x-2"
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          >
            <div className="flex items-center space-x-4">
              <LoaderIcon className="h-5 w-5 mx-2" />
              <span className="text-green-400/80">{config.loaderText}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const TerminalLogin = () => {
  const terminalLines: TerminalLineConfig[] = [
    {
      text: "User login attempt detected",
      loaderDuration: 3000,
      loaderText: "Authenticating user now",
      startDelay: 500,
      LoaderIcon: Fingerprint,
    },
    {
      text: "User authentication unsuccessful",
      loaderDuration: 3000,
      loaderText: "Initialising sign in flow",
      startDelay: 500,
      LoaderIcon: Sparkles,
    },
  ];
  const [completedLines, setCompletedLines] = useState<TerminalLineConfig[]>(
    []
  );

  const handleComplete = () => {
    setCompletedLines((prev) => [...prev, terminalLines[prev.length]]);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-[640px] border border-green-400/20 rounded-lg p-6 backdrop-blur-sm font-mono leading-relaxed relative">
        <div className="flex flex-col space-y-2">
          <div className="absolute top-4 right-4">
            <Link
              href="/"
              className="text-green-400/80 hover:text-green-400 transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex flex-col items-start gap-y-4">
            {completedLines.map((line, index) => (
              <div key={index} className="w-full">
                <div className="flex">
                  <span className="text-white whitespace-nowrap shrink-0 mr-2">
                    root@cyoa-os:~$
                  </span>
                  <span className="text-green-400/80">{line.text}</span>
                </div>
              </div>
            ))}
            {completedLines.length < terminalLines.length && (
              <TerminalLine
                config={terminalLines[completedLines.length]}
                onComplete={handleComplete}
              />
            )}
            {completedLines.length === terminalLines.length && (
              <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <Button
                  variant="outline"
                  onClick={() => signInWithGoogle()}
                  className="bg-transparent border-green-400/20 text-green-400/80 hover:bg-green-400/20 hover:text-green-400 transition-colors duration-300 font-mono tracking-wider w-full relative group overflow-hidden mt-4"
                >
                  <span className="relative z-10">Sign in with Google</span>
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(74,222,128,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine" />
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalLogin;
