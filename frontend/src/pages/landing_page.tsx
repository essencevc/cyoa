import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowRightCircle,
  ArrowRightSquare,
  Book,
  Library,
} from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 -z-10 h-screen w-screen object-cover opacity-50"
      >
        <source src="/backdrop.mp4" type="video/mp4" />
      </video>
      <div className="relative flex w-full flex-col items-center justify-start gap-y-8 px-4 pt-32 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
        <Link
          to="/how-it-works"
          className="flex w-auto items-center space-x-2 rounded-full bg-primary/20 px-2 py-1 ring-1 ring-accent whitespace-pre"
          style={{ opacity: 1, willChange: "auto", transform: "none" }}
        >
          <div className="w-fit rounded-full bg-accent px-2 py-0.5 text-center text-xs font-medium text-primary sm:text-sm">
            📣 How it works
          </div>
          <p className="text-xs font-medium text-primary sm:text-sm">
            How we used Restate and Turso to build this
          </p>
          <ArrowRight />
        </Link>
        <div className="flex w-full max-w-2xl flex-col space-y-4 overflow-hidden pt-8">
          <h1
            className="text-center text-4xl font-medium leading-tight text-foreground sm:text-5xl md:text-6xl"
            style={{
              filter: "blur(0px)",
              opacity: 1,
              willChange: "auto",
              transform: "none",
            }}
          >
            <span
              className="inline-block px-1 md:px-2 text-balance font-semibold"
              style={{ opacity: 1, willChange: "auto", transform: "none" }}
            >
              Choose
            </span>
            <span
              className="inline-block px-1 md:px-2 text-balance font-semibold"
              style={{ opacity: 1, willChange: "auto", transform: "none" }}
            >
              your
            </span>
            <br />
            <span
              className="inline-block px-1 md:px-2 text-balance font-semibold"
              style={{ opacity: 1, willChange: "auto", transform: "none" }}
            >
              own
            </span>
            <span
              className="inline-block px-1 md:px-2 text-balance font-semibold"
              style={{ opacity: 1, willChange: "auto", transform: "none" }}
            >
              adventure
            </span>
          </h1>
          <p className="mx-auto max-w-xl text-center text-lg leading-7 text-muted-foreground sm:text-xl sm:leading-9 text-balance">
            Create your own story and share it with others
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Library /> View Examples
          </Button>
          <Button variant="destructive">
            {" "}
            Get Started <ArrowRightCircle />
          </Button>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
