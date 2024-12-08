import { Button, buttonVariants } from "@/components/ui/button";
import {
  ArrowRight,
  ArrowRightCircle,
  ArrowRightSquare,
  Book,
  Library,
} from "lucide-react";
import { Carousel } from "@/components/carousel";
import { Link } from "react-router-dom";
import SignInModal from "@/components/signin";

const LandingPage = () => {
  return (
    <>
      <div className="h-[900px] w-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 -z-10 h-[900px] w-screen object-cover opacity-50"
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
            <Button
              variant="outline"
              onClick={() => {
                document.querySelector("#examples")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                  inline: "nearest",
                });
              }}
            >
              <Library /> View Examples
            </Button>
            <SignInModal
              fallback={
                <div className={buttonVariants({ variant: "destructive" })}>
                  Get Started <ArrowRightCircle />
                </div>
              }
              redirectUrl="/dashboard/"
            >
              <Link
                to="/dashboard/"
                className={buttonVariants({ variant: "destructive" })}
              >
                Get Started <ArrowRightCircle />
              </Link>
            </SignInModal>
          </div>
        </div>
      </div>

      <div id="examples">
        <div className="relative container mx-auto px-4 py-16 max-w-7xl">
          <div className="text-center space-y-4 pb-6 mx-auto">
            <h2 className="text-sm text-primary font-mono font-medium tracking-wider uppercase">
              See what others have made
            </h2>
            <h2 className="mx-auto mt-4 max-w-xs text-3xl font-semibold sm:max-w-none sm:text-4xl md:text-5xl">
              Try these examples
            </h2>
          </div>
          <Carousel />
        </div>
      </div>
    </>
  );
};

export default LandingPage;
