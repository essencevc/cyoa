import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import useStories from "@/hooks/useStories";
import { createGraph } from "@/lib/graph";
import { cn } from "@/lib/utils";
import { DialogTitle } from "@radix-ui/react-dialog";
import { DiamondMinus, DiamondPlus, Gamepad2Icon } from "lucide-react";
import Tree from "react-d3-tree";
import { Link, useNavigate, useParams } from "react-router-dom";

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
}: {
  nodeDatum: any;
  toggleNode: () => void;
  foreignObjectProps: any;
}) => {
  const isParentNode = nodeDatum.attributes?.parent_node_id === null;
  const hasChildren = nodeDatum.children.length > 0;
  return (
    <g>
      <foreignObject
        width="40"
        height="40"
        x="-15"
        y="-10"
        onClick={toggleNode}
      >
        <div className="flex items-center justify-center bg-black text-white p-1 rounded-md">
          {isParentNode ? (
            <Gamepad2Icon width="20" height="20" />
          ) : hasChildren ? (
            <DiamondPlus width="20" height="20" />
          ) : (
            <DiamondMinus width="20" height="20" />
          )}
        </div>
      </foreignObject>
      (
      <foreignObject {...foreignObjectProps}>
        <Dialog>
          <DialogTrigger>
            <p
              style={{
                maxWidth: "200px",
              }}
              className="bg-gray-100 border border-gray-300 rounded-md text-sm text-center py-2 px-4 hover:bg-gray-200 transition-colors duration-200 cursor-pointer"
            >
              {isParentNode ? "Start From The Beginning" : nodeDatum.name}
            </p>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Continue Your Story</DialogTitle>
              <DialogDescription className="py-4">
                <p className="text-sm">
                  {isParentNode
                    ? "This is the beginning of the story. You can start from the beginning or continue from the last node you were on."
                    : nodeDatum.attributes?.setting}
                </p>
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Link
                className={cn(buttonVariants({ variant: "default" }), "w-full")}
                to={`/story/${nodeDatum.attributes?.story_id}/${nodeDatum.attributes?.id}`}
              >
                {isParentNode
                  ? "Start From The Beginning"
                  : "Revisit your choice"}
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </foreignObject>
      )
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

  const graph = createGraph(story.story_nodes.filter((node) => node.consumed));
  const nodeSize = { x: 300, y: 200 };
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: -100,
    y: 20,
  };

  // This is a new story, so we don't have any nodes
  if (graph?.children.length == 0) {
    return (
      <>
        <Button
          onClick={() => navigate("/")}
          variant="outline"
          className="mb-4"
        >
          Back
        </Button>
        <div className="prose lg:prose-xl">
          <h3>{story.title}</h3>
          <p className="paragraph text-sm">{graph?.attributes?.setting}</p>
          <div className="flex items-center justify-center mt-4">
            <Button
              onClick={() =>
                navigate(`/story/${storyId}/${graph.attributes.id}`)
              }
              className="w-[300px] py-2"
            >
              Start Playthrough
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Button onClick={() => navigate("/")} variant="outline" className="mb-4">
        Back
      </Button>
      <div className="prose lg:prose-xl">
        <h3>{story.title}</h3>
        <p className="paragraph text-sm">{graph?.attributes?.setting}</p>
        <hr />
        <p className="text-sm font-bold">Your Current Progress</p>
        <div
          id="treeWrapper"
          className="w-full max-w-2xl h-[500px] border-2 border-gray-300"
        >
          <Tree
            orientation="horizontal"
            pathFunc="step"
            nodeSize={nodeSize}
            shouldCollapseNeighborNodes={true}
            dimensions={{
              height: 500,
              width: 500,
            }}
            //@ts-ignore
            data={graph}
            collapsible={true}
            renderCustomNodeElement={(rd3tProps) =>
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
          />
        </div>
      </div>
      <div className="h-[100px] mt-4" />
    </>
  );
};

export default Story;
