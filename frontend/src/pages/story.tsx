import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import useStories from "@/hooks/useStories";
import { createGraph } from "@/lib/graph";
import { ArrowRightCircle, DiamondPlus, Gamepad } from "lucide-react";
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
  const isParentNode = nodeDatum.attributes?.parent_node_id === null;
  return (
    <g>
      {isParentNode ? (
        <Gamepad width="20" height="20" x="-10" onClick={toggleNode} />
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
                {/* <DialogTitle>Continue Story From Here?</DialogTitle> */}
                <DialogDescription className="py-4">
                  <p className="text-sm">{nodeDatum.attributes?.setting}</p>
                  <p className="text-md mt-4">
                    You're choosing to{" "}
                    <span className="font-bold">{nodeDatum.name}</span>
                  </p>
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button>
                  <ArrowRightCircle /> Continue From Here
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </foreignObject>
      )}

      {/* 
      <text fill="black" strokeWidth="1" >
        {nodeDatum.attributes?.parent_node_id && nodeDatum.name}
      </text> */}
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
