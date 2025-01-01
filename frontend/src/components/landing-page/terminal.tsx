"use client";

import { useState, useEffect, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useTypewriter } from "../../hooks/useTypewriter";
import { Wrapper } from "../../components/wrapper";

type Story = {
  prompt: string;
  description: string;
  choices: string[];
};

interface StoryGeneratorProps {
  stories: Story[];
  typingSpeed?: number;
}

const getRandomDelay = (min = 100, max = 2000) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export default function StoryGenerator({
  stories,
  typingSpeed = 15,
}: StoryGeneratorProps) {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [phase, setPhase] = useState<
    "prompt" | "thinking" | "story" | "choices" | "transition"
  >("prompt");
  const [areChoicesRendered, setAreChoicesRendered] = useState(false);

  const currentStory = stories[currentStoryIndex];

  const { text: promptText, isComplete: promptComplete } = useTypewriter(
    currentStory.prompt,
    { startDelay: 0 },
    typingSpeed
  );

  useEffect(() => {
    if (promptComplete) {
      setPhase("thinking");
      const timer = setTimeout(() => setPhase("story"), 1500);
      return () => clearTimeout(timer);
    }
  }, [promptComplete]);

  useEffect(() => {
    if (phase === "choices") {
      const timer = setTimeout(() => {
        setAreChoicesRendered(true);
      }, currentStory.choices.length * 500);
      return () => clearTimeout(timer);
    }
  }, [phase, currentStory.choices.length]);

  useEffect(() => {
    if (areChoicesRendered) {
      const timer = setTimeout(() => {
        handleChoiceSelect();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [areChoicesRendered]);

  const choiceDelays = useMemo(
    () => currentStory.choices.map(() => getRandomDelay()),
    [currentStory.choices]
  );

  const handleChoiceSelect = () => {
    setPhase("transition");
    setAreChoicesRendered(false);
    setTimeout(() => {
      // Loop back to the first story if we're at the end
      setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
      setPhase("prompt");
    }, 2000);
  };

  return (
    <div className="my-10 bg-black p-4">
      <section className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto border border-green-400/20 rounded-lg p-6 backdrop-blur-sm font-mono leading-relaxed space-y-6">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-white whitespace-nowrap shrink-0">
                root@cyoa-os:~$
              </span>
            </div>
            <div className="text-green-400/80">{promptText}</div>
          </div>

          {phase === "thinking" && (
            <div className="flex items-center space-x-2 animate-pulse text-green-400/80">
              <Sparkles className="h-5 w-5" />
              <span>Thinking...</span>
            </div>
          )}

          {phase !== "prompt" && phase !== "thinking" && (
            <Wrapper
              delay={2000}
              fallbackComponent={
                <div className="border border-green-400/20 rounded-lg p-4 backdrop-blur-sm mt-4">
                  <p className="whitespace-pre-wrap text-green-400/80">
                    Loading...
                  </p>
                </div>
              }
            >
              <StoryDescription
                onComplete={() => setPhase("choices")}
                text={currentStory.description}
                typingSpeed={typingSpeed}
                isComplete={phase === "choices" || phase === "transition"}
              />
            </Wrapper>
          )}

          {phase === "choices" && (
            <div className="space-y-2">
              {currentStory.choices.map((choice, index) => (
                <Wrapper
                  key={index}
                  delay={choiceDelays[index]}
                  fallbackComponent={
                    <div className="border border-green-400/20 rounded-lg p-4 backdrop-blur-sm mt-4">
                      <p className="whitespace-pre-wrap text-green-400/80">
                        Loading...
                      </p>
                    </div>
                  }
                >
                  <Choice
                    number={index + 1}
                    text={choice}
                    speed={typingSpeed}
                  />
                </Wrapper>
              ))}
            </div>
          )}

          {phase === "transition" && (
            <div className="flex items-center space-x-2 animate-pulse text-green-400/80">
              <Sparkles className="h-5 w-5" />
              <span>Transitioning to next story...</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const StoryDescription = ({
  text,
  typingSpeed,
  onComplete,
  isComplete,
}: {
  text: string;
  typingSpeed: number;
  onComplete: () => void;
  isComplete: boolean;
}) => {
  const { text: storyText } = useTypewriter(
    text,
    {
      startDelay: 0,
      onComplete,
      skipAnimation: isComplete,
    },
    typingSpeed
  );

  return (
    <div className="border border-green-400/20 rounded-lg p-4 backdrop-blur-sm mt-4">
      <p className="whitespace-pre-wrap text-green-400/80">{storyText}</p>
    </div>
  );
};

interface ChoiceProps {
  number: number;
  text: string;
  speed: number;
}

function Choice({ number, text, speed }: ChoiceProps) {
  const { text: choiceText } = useTypewriter(
    text,
    {
      startDelay: 0,
    },
    speed
  );

  return (
    <div className="w-full text-left border border-green-400/20 rounded-lg p-4 backdrop-blur-sm">
      <span className="text-green-400/80">
        <span>{number}. </span>
        <span>{choiceText}</span>
      </span>
    </div>
  );
}
