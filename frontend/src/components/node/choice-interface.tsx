"use client";
import { SelectStoryChoice } from "@/db/schema";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import AutoAudioPlayer from "./audio-player";
import { HoverCard } from "@radix-ui/react-hover-card";
import { HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import { NavigationLink } from "../navigation/navigation-link";
import { useNavigationProgress } from "../navigation/navigation-progress-provider";

type ChoiceInterfaceProps = {
  title: string;
  description: string;
  choices: SelectStoryChoice[];
  choiceId: string;
  storyId: string;
  imagePrompt: string;
};

const ChoiceInterface = ({
  title,
  description,
  choices,
  choiceId,
  storyId,
  imagePrompt,
}: ChoiceInterfaceProps) => {
  const [selectedChoice, setSelectedChoice] = useState(0);
  const router = useRouter();
  const { startNavigation } = useNavigationProgress();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowUp":
          setSelectedChoice((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case "ArrowDown":
          setSelectedChoice((prev) =>
            prev < choices.length - 1 ? prev + 1 : prev
          );
          break;
        case "Enter":
          startNavigation();
          router.push(`/dashboard/story/choice/${choices[selectedChoice].id}`);
          break;
        case "Escape":
          startNavigation();
          router.push(
            `/dashboard/story/${choices[selectedChoice].storyId}?node=${choices[selectedChoice].id}`
          );
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedChoice, router, choices, startNavigation]);

  return (
    <div className="flex items-center justify-center bg-black p-2 sm:p-4">
      <div className="flex flex-col w-full max-w-5xl bg-black/20 rounded-lg border border-green-900/30">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-8 p-3 sm:p-6">
          {/* For larger screens - use HoverCard */}
          <div className="hidden md:block">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="max-w-[200px] h-48 rounded overflow-hidden relative">
                  <img
                    src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/${choiceId}.png`}
                    alt="Story Banner"
                    className="object-contain w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-green-400 text-xs py-1 px-2 opacity-100 text-center">
                    Hover to see image prompt
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-black/90 border border-green-500/20 p-4">
                <p className="text-sm text-green-400 font-mono leading-relaxed">
                  {imagePrompt}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>

          {/* For mobile screens - show image and prompt directly */}
          <div className="md:hidden flex flex-col gap-2 w-full">
            <div className="w-full h-36 sm:h-48 rounded overflow-hidden">
              <img
                src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/${choiceId}.png`}
                alt="Story Banner"
                className="object-contain w-full h-full"
              />
            </div>
            <div className="bg-black/60 border border-green-500/20 rounded p-2 mt-1">
              <p className="text-xs text-green-400 font-mono leading-relaxed">
                <span className="text-green-500 font-bold">Image Prompt:</span>{" "}
                {imagePrompt}
              </p>
            </div>
          </div>

          <div className="flex-1 font-mono space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-green-500">
              <span>{`>`}</span>
              <h2 className="text-base sm:text-lg">{title}</h2>
            </div>
            <p className="text-[#00FF00]/90 whitespace-pre-line text-xs sm:text-sm leading-relaxed">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 border-t border-green-900/30 pt-3 sm:pt-4">
              <AutoAudioPlayer story_id={storyId} node_id={choiceId} />
              <div className="text-green-400/80 space-y-1 font-mono text-xs sm:text-sm pt-2 sm:pt-4 flex-1">
                <p>↵ ENTER to confirm selection</p>
                <p>↑↓ ARROWS to navigate choices</p>
                <p className="text-green-400/50">ESC to return to main story</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-green-900/30 overflow-hidden h-[250px] sm:h-[300px]">
          <div className="h-full overflow-y-auto p-3 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              {choices.map((choice, index) => (
                <NavigationLink
                  key={index}
                  href={`/dashboard/story/choice/${choice.id}`}
                >
                  <motion.div
                    className={`p-3 sm:p-4 rounded-lg cursor-pointer ${
                      selectedChoice === index
                        ? "bg-green-950 border-2 border-green-500"
                        : "border border-green-900/30 hover:border-green-500/50"
                    }`}
                    onClick={() => setSelectedChoice(index)}
                    layout
                    transition={{
                      layout: { duration: 0.2, ease: "easeInOut" },
                    }}
                  >
                    <div className="flex flex-col items-left gap-1 sm:gap-2">
                      <h3
                        className={`font-mono text-sm sm:text-base transition-colors duration-300 ${
                          selectedChoice === index
                            ? "text-green-400"
                            : "text-green-300"
                        }`}
                      >
                        {choice.choice_title}
                      </h3>

                      <span className="text-gray-200 text-xs">
                        {choice.choice_description}
                      </span>
                    </div>
                  </motion.div>
                </NavigationLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoiceInterface;
