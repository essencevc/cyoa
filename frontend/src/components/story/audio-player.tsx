"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Volume2, VolumeX } from "lucide-react";

interface StoryAudioProps {
  storyId: string;
}

const StoryAudio = ({ storyId }: StoryAudioProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (hasInteracted) {
      return; // Don't add listeners if already interacted
    }

    const handleInteraction = () => {
      setHasInteracted(true);
      // Remove listeners after first interaction
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [hasInteracted]);

  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [hasInteracted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="flex items-center gap-2 p-4 rounded-lg bg-green-900/10 border border-green-500/20">
      <audio
        ref={audioRef}
        src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${storyId}/theme_song.wav`}
        loop
        muted={isMuted}
      />
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium text-green-400/90">
            Soundtrack
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-1 h-5 bg-green-500/60 rounded-full ${
                  !isMuted ? "animate-pulse" : ""
                }`}
                style={{
                  animationDelay: `${i * 150}ms`,
                  animationDuration: "850ms",
                }}
              />
            ))}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleMute}
          className="hover:bg-green-950/40 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 text-green-400/90" />
          ) : (
            <Volume2 className="h-4 w-4 text-green-400/90" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default StoryAudio;
