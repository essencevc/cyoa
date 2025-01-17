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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Handle first interaction
  useEffect(() => {
    const handleInteraction = async () => {
      const audio = audioRef.current;
      if (audio && duration > 0 && !isPlaying) {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.error("Autoplay failed:", error);
        }
      }
    };

    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("click", handleInteraction);
      window.removeEventListener("keydown", handleInteraction);
    };
  }, [duration, isPlaying]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
      } else {
        await audio.play();
      }
      setIsPlaying(!isPlaying);
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

  return (
    <div className="font-mono text-green-500 bg-black/80 p-4 rounded-lg border border-green-500/30 w-[200px]">
      <audio
        ref={audioRef}
        src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${story_id}/${node_id}.wav`}
        preload="auto"
      />

      <div className="flex items-center space-x-4">
        <button
          onClick={togglePlayPause}
          className="hover:text-green-400 transition-colors"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>

        <button
          onClick={toggleMute}
          className="hover:text-green-400 transition-colors"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
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
            "[&_[role=slider]]:h-4",
            "[&_[role=slider]]:w-4",
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
