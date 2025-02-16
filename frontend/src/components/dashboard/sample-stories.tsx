import React from "react";
import { SelectStory } from "@/db/schema";
import Link from "next/link";

type props = {
  stories: SelectStory[];
};

const SampleStories = ({ stories }: props) => {
  return (
    <div className="font-mono">
      <div className="flex items-center gap-2 border-b border-green-900/30 pb-2">
        <span className="text-white">root@cyoa-os:~$</span>
        <span className="text-[#39FF14]">
          cyoa list-stories --filter sample-stories
        </span>
      </div>
      <div className="py-2 space-y-0.5">
        <div className="text-sm mb-6">
          <div className="text-white">
            Showing {stories?.length} sample stories
          </div>
          {stories?.map((story) => (
            <Link
              href={`/dashboard/story/${story.id}`}
              key={story.id}
              className="block border border-green-500/30 px-4 py-2 mt-4 cursor-pointer hover:scale-[1.02] transition-transform duration-200 ease-in-out"
            >
              <div className="flex gap-4">
                <div className="w-1/6">
                  <img
                    src={`https://restate-story.s3.ap-southeast-1.amazonaws.com/${story.id}/banner.png`}
                    alt={story.title as string}
                    className="w-24 h-24 object-cover rounded"
                  />
                </div>
                <div className="w-5/6">
                  <h3 className="text-[#39FF14] mb-1">{story.title}</h3>
                  <p className="text-green-400/80 line-clamp-2">
                    {story.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SampleStories;
