import React from "react";
import { html } from "../blog/article.md";
import { Button } from "@/components/ui/button";
import { ArrowRightCircle, Library } from "lucide-react";
import { Link } from "react-router-dom";

const Blog = () => {
  return (
    <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-4 my-12">
      <header className="relative sticky top-0 z-50 py-2 bg-background/60 backdrop-blur">
        <div className="flex justify-between items-center container max-w-[1300px] mx-auto">
          <Link to="/" className="cursor-pointer">
            <img src="logo.webp" alt="Restate" className="w-20 h-20" />
          </Link>
          
          <div className="flex items-center space-x-2">
            <Link to="/#examples">
              <Button size="lg" variant="outline">
                <Library className="mr-2" />
                View Examples
              </Button>
            </Link>
            
            <Link to="/dashboard">
              <Button size="lg" variant="destructive">
                Get Started
                <ArrowRightCircle className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
        
        <hr className="absolute w-full bottom-0 transition-opacity duration-300 ease-in-out opacity-0" />
      </header>

      <main className="mx-auto w-full max-w-[900px]">
        <article className="prose max-w-none">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </article>
      </main>
    </div>
  );
};

export default Blog;