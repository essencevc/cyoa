import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { createGraph } from "@/lib/graph";
import React from "react";
import Tree from "react-d3-tree";
import { useNavigate, useParams } from "react-router-dom";

const orgChart = {
  name: "CEO",
  children: [
    {
      name: "Manager",
      attributes: {
        department: "Production",
      },
      children: [
        {
          name: "Foreman",
          attributes: {
            department: "Fabrication",
          },
          children: [
            {
              name: "Worker",
            },
          ],
        },
        {
          name: "Foreman",
          attributes: {
            department: "Assembly",
          },
          children: [
            {
              name: "Worker",
            },
          ],
        },
      ],
    },
  ],
};

const Story = () => {
  const { storyId } = useParams();
  const { getStory } = useStories();
  const { data: story, isLoading } = getStory(storyId);
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (!story) return <div>Story not found</div>;

  const graph = createGraph(story);

  return (
    <>
      <Button onClick={() => navigate("/")} variant="outline" className="mb-4">
        Back
      </Button>
      <div className="prose lg:prose-xl">
        <h3>{story.title}</h3>
        <p>{story.description}</p>
        <div
          id="treeWrapper"
          className="w-full max-w-2xl h-[500px] border-2 border-gray-300"
        >
          <Tree
            dimensions={{ width: 500, height: 500 }}
            orientation="horizontal"
            pathFunc="elbow"
            data={graph}
            collapsible={true}
          />
        </div>
      </div>
    </>
  );
};

export default Story;
