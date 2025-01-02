import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface CallToActionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonHref: string;
}

export function CallToAction({
  title = "Call to Action",
  subtitle = "Unlock Your Potential with Our Platform",
  description = "Streamline your workflow and take your business to new heights with our cutting-edge tools and features.",
  buttonText = "Get Started",
  buttonHref,
}: CallToActionProps) {
  return (
    <section id="cta" className="flex items-center justify-center">
      <div className="container max-w-7xl px-4 py-12 md:px-6 md:py-24 lg:py-32">
        <div className="mx-auto space-y-4 py-6 text-center">
          <h2 className="font-mono text-[14px] font-medium tracking-tight text-primary">
            {title}
          </h2>
          <h4 className="mx-auto mb-2 max-w-3xl text-balance text-[42px] font-medium tracking-tighter">
            {subtitle}
          </h4>
        </div>
        <div className="space-y-4 text-center">
          <p className="mx-auto max-w-[700px] text-balance text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            {description}
          </p>
          <div className="mt-6 flex justify-center">
            <Button variant="default" asChild>
              <Link to={buttonHref} target="_blank" rel="noopener noreferrer">
                {buttonText}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
