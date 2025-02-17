"use client";
import React from "react";
import { buildTree, getPath } from "@/lib/tree";
import Link from "next/link";
import { SelectStoryChoice } from "@/db/schema";
import { useRouter } from "next/navigation";

type ChoiceNode = SelectStoryChoice & { children: ChoiceNode[] };

interface StoryChoiceNodeProps {
  node: ChoiceNode;
  onSelect: (node: ChoiceNode) => void;
  selectedId: string | null;
  isLast?: boolean;
}

const StoryChoiceNode = ({
  node,
  onSelect,
  selectedId,
  isLast = true,
}: StoryChoiceNodeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div key={node.id} className="pl-8">
      <div className="flex items-center group">
        <span />
        <span className="font-mono text-gray-500">
          {isLast ? "└── " : "└── "}
        </span>
        <span
          onClick={() => {
            onSelect(node);
            setIsExpanded(!isExpanded);
          }}
          className={`font-mono cursor-pointer px-2 py-0.5 rounded flex items-center gap-2 ${
            selectedId === node.id
              ? "bg-green-950 text-green-400"
              : "group-hover:text-green-400"
          }`}
        >
          {node.choice_title}{" "}
          {hasChildren && (
            <span
              className="text-green-500 text-sm cursor-pointer"
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? "" : "+"}
            </span>
          )}
        </span>
      </div>
      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child: ChoiceNode, index: number) => (
            <StoryChoiceNode
              key={child.id}
              node={child}
              onSelect={onSelect}
              selectedId={selectedId}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StoryChoices = ({
  choices,
  isUserStory,
}: {
  choices: SelectStoryChoice[];
  isUserStory: boolean;
}) => {
  const validChoices = choices.filter((choice) => choice.explored === 1);

  const tree = buildTree(validChoices, "NULL");

  const [selectedId, setSelectedId] = React.useState<string>(tree[0].id);

  const selectedPath = getPath(choices, selectedId);
  const router = useRouter();

  if (!isUserStory) {
    return (
      <div className="my-4 text-center">
        <p className="mt-2 text-red-600 font-bold">
          WARNING: This is a publicly shared story, progress is not saved
        </p>
        <Link
          href={`/dashboard/story/choice/${selectedPath.at(-1)?.id}`}
          className="mt-10 px-4 py-2 bg-green-950 text-green-400 rounded hover:bg-green-900 transition-colors inline-block"
        >
          START HERE
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 text-sm">
        {selectedPath.map((choice: SelectStoryChoice, index: number) => (
          <span key={choice.id}>
            {index > 0 && <span className="mx-2">→</span>}
            <span>
              {choice.choice_title.toLowerCase().replace(/\s+/g, "_")}
            </span>
          </span>
        ))}
      </div>

      <div className="py-1" />
      {tree.map((node: ChoiceNode) => (
        <StoryChoiceNode
          key={node.id}
          node={node}
          onSelect={(node: ChoiceNode) => {
            router.prefetch(`/dashboard/story/choice/${node.id}`);
            setSelectedId(node.id);
          }}
          selectedId={selectedId}
        />
      ))}
      <div className="bg-gray-900/50 p-4 rounded mt-4 text-sm">
        {selectedPath.at(-1)?.description}
      </div>
      <div className="my-4">
        <Link
          href={`/dashboard/story/choice/${selectedPath.at(-1)?.id}`}
          className="px-4 py-2 bg-green-950 text-green-400 rounded hover:bg-green-900 transition-colors"
        >
          Start Here
        </Link>
      </div>
    </div>
  );
};

export default StoryChoices;
