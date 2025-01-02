import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, ArrowRightCircle, Library } from "lucide-react";
import { Carousel } from "@/components/carousel";
import { Link } from "react-router-dom";
import SignInModal from "@/components/signin";
import { UniqueChoices } from "@/components/customstories";
import { RestateIntegration } from "@/components/restateintegration";
import { EasyToShare } from "@/components/easytoshare";
import { CallToAction } from "@/components/cta";

const LandingPage = () => {
  return (
    <>
      {/* Hero Section */}
      <div className="relative h-[900px] w-full overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-50"
        >
          <source src="/backdrop.mp4" type="video/mp4" />
        </video>

        <div className="relative flex w-full flex-col items-center justify-start gap-y-8 px-4 pt-20 sm:px-6 sm:pt-24 md:pt-32 lg:px-8">
          <Link
            to="/how-it-works"
            className="group flex w-fit items-center gap-x-2 rounded-full bg-primary/20 px-3 py-1.5 ring-1 ring-accent transition-colors hover:bg-primary/30"
          >
            <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-primary sm:text-sm">
              📣 How it works
            </span>
            <p className="line-clamp-1 text-xs font-medium text-primary sm:text-sm">
              How we used Restate and Turso
            </p>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="flex w-full max-w-2xl flex-col space-y-6 pt-8">
            <h1 className="text-balance text-center text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
              <span className="block">Choose your</span>
              <span className="block">own adventure</span>
            </h1>

            <p className="mx-auto max-w-xl text-center text-base text-muted-foreground sm:text-lg md:text-xl">
              Create your own story and share it with others
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 w-full max-w-xs">
            <Button
              variant="outline"
              onClick={() => {
                document.querySelector("#examples")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className="w-full sm:w-auto"
            >
              <Library className="mr-2 h-4 w-4" />
              View Examples
            </Button>

            <SignInModal
              fallback={
                <div
                  className={buttonVariants({
                    variant: "destructive",
                    className: "w-full sm:w-auto",
                  })}
                >
                  Get Started <ArrowRightCircle className="ml-2 h-4 w-4" />
                </div>
              }
              redirectUrl="/dashboard/"
            >
              <Link
                to="/dashboard/"
                className={buttonVariants({
                  variant: "destructive",
                  className: "w-full sm:w-auto",
                })}
              >
                Get Started <ArrowRightCircle className="ml-2 h-4 w-4" />
              </Link>
            </SignInModal>
          </div>
        </div>
      </div>

      <section id="examples" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-4 mb-12">
            <p className="text-sm text-primary font-mono font-medium tracking-wider uppercase">
              See what others have made
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              Try these examples
            </h2>
          </div>
          <Carousel />
        </div>
      </section>
      <section id="features" className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-4 mb-16">
            <p className="text-sm text-primary font-mono font-medium tracking-wider uppercase">
              Features
            </p>
            <h2 className="text-3xl font-bold sm:text-4xl md:text-5xl">
              What we've built with restate
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <RestateIntegration />
            <EasyToShare />
            <UniqueChoices />
          </div>
        </div>
      </section>

      <CallToAction
        title="Building complex pipelines?"
        subtitle="You've come to the right place"
        description="Restate makes building complex pipelines easy with sdks in Typescript, Python, Rust, and more."
        buttonHref="https://restate.dev"
        buttonText="Learn More"
      />
    </>
  );
};

export default LandingPage;
