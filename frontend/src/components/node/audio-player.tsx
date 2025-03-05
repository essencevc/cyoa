"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface Props {
  muted?: boolean;
  story_id: string;
  node_id: string;
}

const RetroAudioPlayer = ({
  muted: initialMuted = false,
  story_id,
  node_id,
}: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(initialMuted);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  // Set up audio element and event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Force the browser to start downloading the audio file
    audio.load();

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsAudioLoaded(true);
      console.log("Audio metadata loaded, ready to play on interaction");
    };

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handlePause = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("play", handlePlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("play", handlePlay);
    };
  }, []);

  // Handle user interactions to enable audio
  useEffect(() => {
    const handleUserInteraction = async () => {
      if (hasInteracted || !isAudioLoaded) return;

      const audio = audioRef.current;
      if (!audio) return;

      setHasInteracted(true);

      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Playback after interaction failed:", error);
      }
    };

    // Listen for various user interactions
    const interactionEvents = [
      "click",
      "touchstart",
      "keydown",
      "scroll",
      "mousemove",
    ];

    interactionEvents.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { once: true });
    });

    return () => {
      interactionEvents.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [hasInteracted, isAudioLoaded]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (audio.paused) {
        await audio.play();
        setHasInteracted(true);
      } else {
        audio.pause();
      }
    } catch (error) {
      console.error("Playback failed:", error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  // Ensure audio playback state matches component state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && audio.paused) {
      audio.play().catch((error) => console.error("Playback failed:", error));
    } else if (!isPlaying && !audio.paused) {
      audio.pause();
    }
  }, [isPlaying]);

  return (
    <div className="font-mono text-green-500 bg-black/80 p-2 sm:p-3 md:p-4 rounded-lg border border-green-500/30 w-full sm:w-[200px]">
      <audio
        ref={audioRef}
        src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${story_id}/${node_id}.wav`}
        preload="auto"
      />

      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
        <button
          onClick={togglePlayPause}
          className="hover:text-green-400 transition-colors flex-shrink-0"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="hover:text-green-400 transition-colors flex-shrink-0"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
          )}
        </button>

        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={0.1}
          onValueChange={([value]) => {
            const audio = audioRef.current;
            if (audio) audio.currentTime = value;
          }}
          className={cn(
            "flex-1",
            "[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 sm:[&_[role=slider]]:h-4 sm:[&_[role=slider]]:w-4",
            "[&_[role=slider]]:border-green-500",
            "[&_[role=slider]]:bg-green-500",
            "[&_[role=slider]]:focus:ring-green-500/50",
            "[&_[role=track]]:bg-green-900",
            "[&_[role=range]]:bg-green-500"
          )}
        />
      </div>
    </div>
  );
};

export default RetroAudioPlayer;
