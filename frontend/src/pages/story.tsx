import { Button } from "@/components/ui/button";
import useStories from "@/hooks/useStories";
import { createGraph } from "@/lib/graph";
import {
  AlignStartHorizontal,
  Circle,
  Diamond,
  DiamondPlus,
  Gamepad,
} from "lucide-react";
import React from "react";
import Tree from "react-d3-tree";
import { useNavigate, useParams } from "react-router-dom";

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
}: {
  nodeDatum: any;
  toggleNode: () => void;
  foreignObjectProps: any;
}) => {
  const isParentNode = nodeDatum.attributes?.parent_node_id !== null;
  return (
    <g>
      {isParentNode ? (
        <DiamondPlus width="20" height="20" y="-10" onClick={toggleNode} />
      ) : (
        <Gamepad width="20" height="20" x="-10" onClick={toggleNode} />
      )}

      <text fill="black" strokeWidth="1" x="25" y="5">
        {nodeDatum.attributes?.parent_node_id && nodeDatum.name}
      </text>
    </g>
  );
};

const Story = () => {
  const { storyId } = useParams();
  const { getStory } = useStories();
  const { data: story, isLoading } = getStory(storyId);
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  if (!story) return <div>Story not found</div>;

  const graph = createGraph(story);
  const nodeSize = { x: 300, y: 300 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: 20 };

  return (
    <>
      <Button onClick={() => navigate("/")} variant="outline" className="mb-4">
        Back
      </Button>
      <div className="prose lg:prose-xl">
        <h3>{story.title}</h3>
        <p className="paragraph text-sm">{graph?.attributes?.setting}</p>

        <div
          id="treeWrapper"
          className="w-full max-w-2xl h-[500px] border-2 border-gray-300"
        >
          <Tree
            dimensions={{ width: 500, height: 500 }}
            orientation="horizontal"
            pathFunc="elbow"
            data={graph}
            collapsible={false}
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
          />
        </div>
      </div>
    </>
  );
};

export default Story;
