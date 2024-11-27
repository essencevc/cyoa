import React from "react";
// @ts-ignore
import { html } from "../blog/article.md";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Library } from "lucide-react";
const Blog = () => {
  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4 my-12">
      <header className="relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur max-w-[1300px] mx-auto">
        <div className="flex justify-between items-center container">
          <img src="logo.webp" alt="Restate" className="w-20 h-20" />
          <div className="flex items-center space-x-2">
            <Button size="lg" variant="outline">
              <Library />
              View Examples
            </Button>
            <Button size="lg" variant="destructive">
              Get Started <ArrowRightCircle />
            </Button>
          </div>
        </div>
        <hr className="absolute w-full bottom-0 transition-opacity duration-300 ease-in-out opacity-0" />
      </header>
      <div className="mx-auto w-full max-w-[900px]">
        <div className="mb-8">
          <img
            alt="Introducing Acme.ai"
            loading="lazy"
            width="1200"
            height="630"
            decoding="async"
            data-nimg="1"
            className="h-auto rounded-lg border shadow-md"
            src="blog.webp"
          />
        </div>

        <div className="flex items-center space-x-2">
          <article className="prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: html }} />
          </article>
        </div>
      </div>
    </div>
  );
};

export default Blog;
