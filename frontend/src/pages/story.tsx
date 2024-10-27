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
import {
  ArrowRightCircle,
  DiamondPlus,
  Gamepad,
  Gamepad2Icon,
} from "lucide-react";
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

  return (
    <g>
      {isParentNode ? (
        <Gamepad2Icon
          width="20"
          height="20"
          x="-10"
          y="-10"
          onClick={toggleNode}
        />
      ) : (
        <DiamondPlus width="20" height="20" y="-10" onClick={toggleNode} />
      )}

      {!isParentNode && (
        <foreignObject {...foreignObjectProps}>
          <Dialog>
            <DialogTrigger>
              <p className="text-sm -mt-4">{nodeDatum.name}</p>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Continue Your Story</DialogTitle>
                <DialogDescription className="py-4">
                  <p className="text-sm">{nodeDatum.attributes?.setting}</p>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Link
                  className={cn(
                    buttonVariants({ variant: "default" }),
                    "w-full"
                  )}
                  to={`/story/${nodeDatum.attributes?.story_id}/${nodeDatum.attributes?.id}`}
                >
                  {nodeDatum.name}
                </Link>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </foreignObject>
      )}
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
  const nodeSize = { x: 150, y: 150 };
  const foreignObjectProps = {
    width: nodeSize.x,
    height: nodeSize.y,
    x: 30,
    y: -28,
  };

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
            pathFunc="elbow"
            //@ts-ignore
            data={graph}
            collapsible={false}
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
