import React from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Tree from 'react-d3-tree';
import { BarLoader } from 'react-spinners';
import { DiamondMinus, DiamondPlus, Gamepad2Icon } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTrigger } from '@/components/ui/dialog';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import useStories from '@/hooks/useStories';
import { createGraph } from '@/lib/graph';
import { StoryWithNodes } from '@/lib/schemas';

type NodeDatum = {
  name: string;
  children: NodeDatum[];
  attributes?: {
    id: string;
    story_id: string;
    setting?: string;
  };
};

type ForeignObjectProps = {
  width: number;
  height: number;
  x: number;
  y: number;
};

const NodeContent = ({ 
  nodeDatum, 
  isParentNode, 
  storyId 
}: { 
  nodeDatum: NodeDatum; 
  isParentNode: boolean;
  storyId: string;
}) => (
  <Dialog>
    <DialogTrigger>
      <p className="max-w-[200px] bg-gray-100 border border-gray-300 rounded-md text-sm text-center py-2 px-4 hover:bg-gray-200 transition-colors duration-200 cursor-pointer">
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
          to={`/dashboard/story/${storyId}/${nodeDatum.attributes?.id}`}
        >
          {isParentNode ? "Start From The Beginning" : "Revisit your choice"}
        </Link>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

const NodeIcon = ({ isParentNode, hasChildren }: { isParentNode: boolean; hasChildren: boolean }) => (
  <div className="flex items-center justify-center bg-black text-white p-1 rounded-md">
    {isParentNode ? (
      <Gamepad2Icon width="20" height="20" />
    ) : hasChildren ? (
      <DiamondPlus width="20" height="20" />
    ) : (
      <DiamondMinus width="20" height="20" />
    )}
  </div>
);

const renderForeignObjectNode = ({
  nodeDatum,
  toggleNode,
  foreignObjectProps,
}: {
  nodeDatum: NodeDatum;
  toggleNode: () => void;
  foreignObjectProps: ForeignObjectProps;
}) => {
  const isParentNode = nodeDatum.attributes?.id === "start";
  const hasChildren = nodeDatum.children.length > 0;
  
  return (
    <g>
      <foreignObject width="40" height="40" x="-15" y="-10" onClick={toggleNode}>
        <NodeIcon isParentNode={isParentNode} hasChildren={hasChildren} />
      </foreignObject>
      <foreignObject {...foreignObjectProps}>
        <NodeContent 
          nodeDatum={nodeDatum} 
          isParentNode={isParentNode}
          storyId={nodeDatum.attributes?.story_id || ''} 
        />
      </foreignObject>
    </g>
  );
};

const StoryContent = ({ story, storyId }: { story: StoryWithNodes ; storyId: string }) => {
  const navigate = useNavigate();
  const graph = createGraph(story.story_nodes.filter((node: any) => node.consumed), story.id);
  const { toggleVisibility } = useStories();

  if (!graph) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate("/dashboard")} variant="outline">← Back</Button>
          <div className="flex items-center gap-3">
            <Switch id="public-mode" />
            <Label htmlFor="public-mode">Make Story Public</Label>
          </div>
        </div>
        <div className="prose lg:prose-xl">
          <h3 className="text-2xl font-bold">{story.title}</h3>
          <p className="text-sm mb-6">{story.description}</p>
          {story.banner_image_url && (
            <img src={story.banner_image_url} alt="Banner" className="w-full rounded-lg shadow-md mb-6" />
          )}
          <div className="flex justify-center mt-8">
            <Button onClick={() => navigate(`/dashboard/story/${storyId}/start`)} className="w-[300px] py-2">
              Start Playthrough
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const nodeSize = { x: 300, y: 200 };
  const foreignObjectProps = { width: nodeSize.x, height: nodeSize.y, x: -100, y: 20 };

  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => navigate("/dashboard")} variant="outline">← Back</Button>
        <div className="flex items-center gap-3">
          <Switch
          checked={story.public}
          onCheckedChange={() => toggleVisibility(story.id)}
          id="public-mode" />
          <Label htmlFor="public-mode">Make Story Public</Label>
        </div>
      </div>
      <div className="prose lg:prose-xl">
        <h3 className="text-2xl font-bold">{story.title}</h3>
        <p className="text-sm mb-6">{story.description}</p>
        {story.banner_image_url && (
          <img src={story.banner_image_url} alt="Banner" className="w-full rounded-lg shadow-md mb-6" />
        )}
        <hr className="my-6" />
        <p className="text-sm font-bold mb-4">Your Current Progress</p>
        <div className="w-full max-w-2xl h-[500px] border-2 border-gray-300 rounded-lg">
          <Tree
            orientation="horizontal"
            pathFunc="step"
            nodeSize={nodeSize}
            dimensions={{ height: 500, width: 500 }}
            //@ts-ignore
            data={graph}
            collapsible={true}
            renderCustomNodeElement={(rd3tProps) =>
              //@ts-ignore
              renderForeignObjectNode({ ...rd3tProps, foreignObjectProps })
            }
          />
        </div>
      </div>
      <div className="h-[100px]" />
    </div>
  );
};

const Story = () => {
  const { storyId } = useParams();
  const { getStory } = useStories();
  const { data: story, isLoading } = getStory(storyId);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[300px]">
        <p className="text-sm mb-4">Loading story...</p>
        <BarLoader speedMultiplier={0.5} />
      </div>
    );
  }

  if (!story) return <div>Story not found</div>;

  return <StoryContent story={story} storyId={storyId || ''} />;
};

export default Story;