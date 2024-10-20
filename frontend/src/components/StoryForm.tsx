import React, { useState } from "react";
import { z } from "zod";
import { Textarea } from "./ui/textarea";
import { Button, buttonVariants } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import { HashLoader } from "react-spinners";
import { toast } from "sonner";
import { storyResponseSchema } from "@/lib/schemas";
import { makePostRequest } from "@/lib/server";
import { cn } from "@/lib/utils";

// Add this line to get the backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_APP_BACKEND_URL || "http://127.0.0.1:5000";

const Names = [
  "John Doe",
  "Jane Smith",
  "Michael Johnson",
  "Emily Davis",
  "Chris Brown",
  "Jessica Wilson",
  "David Miller",
  "Sarah Taylor",
  "James Anderson",
];

const Titles = [
  "A Day in the Life of a Cat",
  "The Great Cookie Caper",
  "Murder at the Coffee Shop",
  "The Misadventures of a Clumsy Detective",
  "Life's Little Surprises",
  "The Mystery of the Missing Sandwich",
  "A Slice of Life in the Big City",
  "The Hilarious Heist",
  "The Secret Diary of a High School Student",
];

const Settings = [
  "In a world where vibrant cultures blend and traditions thrive",
  "Sometimes we don't realize the ancient spirits guiding us towards harmony",
  "It all started with a futuristic society where every voice is valued and equality reigns",
  "In a realm where nature and technology exist in perfect harmony",
  "Once upon a time in a land where stories of resilience and hope inspired generations",
  "In a universe where diverse beings unite to protect their shared home",
];

const StoryForm = () => {
  const [mainCharacter, setMainCharacter] = useState(
    Names[Math.floor(Math.random() * Names.length)]
  );
  const [title, setTitle] = useState(
    Titles[Math.floor(Math.random() * Titles.length)]
  );
  const [content, setContent] = useState(
    Settings[Math.floor(Math.random() * Settings.length)]
  );
  const [userChoice, setUserChoice] = useState("");
  const [generatedStory, setGeneratedStory] = useState<z.infer<
    typeof storyResponseSchema
  > | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateStory = async () => {
    setLoading(true);
    try {
      const response = await makePostRequest(
        "/stories",
        {
          main_character: mainCharacter,
          title: title,
          content: content,
        },
        storyResponseSchema
      );
      console.log(response);
      setGeneratedStory(response);
      toast.success("Story generated successfully");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Error generating story");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = async (choice: string) => {
    setLoading(true);
    try {
      toast.success("You chose: " + choice);
      const response = await makePostRequest(
        "/continue",
        {
          previous_setting: generatedStory?.setting,
          previous_choice: choice,
          main_character: mainCharacter,
        },
        storyResponseSchema
      );
      setGeneratedStory(response);
      toast.success("Story generated successfully");
    } catch (error) {
      console.error("Error generating story:", error);
      toast.error("Error generating story");
    } finally {
      setLoading(false);
    }
  };

  if (!generatedStory) {
    return (
      <div>
        <div className="grid w-full gap-">
          <div className="grid gap-2 grid-cols-2">
            <div>
              <Label className="text-sm font-medium pl-1 mb-2">
                Title Of Story
              </Label>
              <Input
                type="text"
                placeholder="Title Of Story"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium pl-1 mb-2">
                Main Character Name
              </Label>
              <Input
                type="text"
                placeholder="Main Character Name"
                value={mainCharacter}
                onChange={(e) => setMainCharacter(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium pl-1 mb-2">
              Story Setting
            </Label>
            <Textarea
              placeholder="Story Setting"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          <Button
            className="mt-4 py-2"
            disabled={loading}
            onClick={handleGenerateStory}
          >
            {loading ? (
              <HashLoader color="white" className="py-2" size={20} />
            ) : (
              "Generate Story"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-lg font-bold">{title}</h1>
      <p className="py-4">{generatedStory?.setting}</p>
      {generatedStory?.choices.map((choice) => (
        <Button
          disabled={loading}
          onClick={() => handleChoice(choice.choice_text)}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "text-bold w-full my-2 text-wrap h-[80px]"
          )}
          key={choice.choice_text}
        >
          {choice.choice_text}
        </Button>
      ))}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setUserChoice("");
          handleChoice(userChoice);
        }}
      >
        <Input
          type="text"
          className="text-center my-2 h-[80px]"
          placeholder="Stir Things Up - Write your own choice!"
          value={userChoice}
          onChange={(e) => setUserChoice(e.target.value)}
        />
      </form>
    </div>
  );
};

export default StoryForm;
