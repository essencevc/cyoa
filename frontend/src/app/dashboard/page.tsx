import StoryList from "@/components/dashboard/story-list";
import { TerminalInput } from "@/components/dashboard/terminal-input";
import React from "react";

const userStories = [
  {
    id: "1",
    title: "The Dragon's Quest",
    description:
      "A tale of adventure and magic in the realm of dragons, where ancient prophecies come to life. The young hero, armed with nothing but courage and a mysterious amulet, must face fire-breathing behemoths and cunning sorcerers to save the kingdom from an eternal winter.",
    timestamp: "Generated less than a minute ago",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "2",
    title: "Cyberpunk Samurai",
    description:
      "A warrior from the past finds himself in a neon-lit future, where honor meets technology. Struggling to adapt to a world of AI, cybernetic enhancements, and corporate warfare, the samurai must find a way to uphold his ancient code while navigating the treacherous streets of Neo-Tokyo.",
    timestamp: "Generated 2 hours ago",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "3",
    title: "Space Pirates",
    description:
      "Adventures in the cosmic seas, where treasure and danger lurk among the stars. Captain Zara and her motley crew of aliens and humans sail their modified starship through wormholes and asteroid fields, always one step ahead of the Galactic Federation and rival pirate gangs.",
    timestamp: "Generated yesterday",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
];

const communityStories = [
  {
    id: "4",
    title: "The Last Wizard",
    description:
      "In a world where magic is dying, one wizard stands against the tide of technology. As cities grow and machines replace spells, Eldrin must find a way to preserve the ancient arts and prove that magic still has a place in the modern world.",
    timestamp: "Shared by @magicUser",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "5",
    title: "Desert Winds",
    description:
      "A journey through endless sands reveals ancient secrets and forgotten civilizations. Archeologist Dr. Samira Patel uncovers a mysterious artifact that could rewrite history, but she must race against time and rival expeditions to unlock its power.",
    timestamp: "Shared by @wanderer",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
  {
    id: "6",
    title: "Ocean's Call",
    description:
      "Deep beneath the waves, a mysterious signal draws explorers to an underwater kingdom. Marine biologist Kai Chen leads a team into the abyss, where they discover a bioluminescent civilization and face the choice of scientific revelation or protecting an alien culture from the surface world.",
    timestamp: "Shared by @deepDiver",
    image:
      "https://huggingface.co/prithivMLmods/Retro-Pixel-Flux-LoRA/resolve/main/images/RP1.png",
  },
];
const Dashboard = () => {
  return (
    <div className="space-y-8 bg-black/50 rounded-lg p-4 border border-green-900/30">
      <TerminalInput />
      <StoryList
        command="cyoa list-stories --filter user-stories"
        logMessages={[
          {
            logType: "INFO",
            message: "Fetching stories with user filter",
          },
          {
            logType: "SUCCESS",
            message: "Found 3 stories in collection",
          },
          {
            logType: "INFO",
            message: "Formatting output...",
          },
        ]}
        stories={userStories}
      />
      <StoryList
        command="cyoa list-stories --filter community-stories"
        logMessages={[
          {
            logType: "INFO",
            message: "Fetching stories with community filter",
          },
          {
            logType: "SUCCESS",
            message: "Found 5 stories in collection. Sorting by popularity...",
          },
          {
            logType: "INFO",
            message: "Formatting output...",
          },
        ]}
        stories={communityStories}
      />
    </div>
  );
};

export default Dashboard;
