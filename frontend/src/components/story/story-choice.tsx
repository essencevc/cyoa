"use client";
import React from "react";
import { Choice, ChoiceNode } from "@/types/choice";
import { buildTree, getPath } from "@/lib/tree";
import Link from "next/link";

interface StoryChoiceNodeProps {
  node: ChoiceNode;
  onSelect: (node: ChoiceNode) => void;
  selectedId: string | null;
  prefix?: string;
  isLast?: boolean;
}

const StoryChoiceNode = ({
  node,
  onSelect,
  selectedId,
  prefix = "",
  isLast = true,
}: StoryChoiceNodeProps) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div key={node.id} className="pl-4">
      <div className="flex items-center group">
        <span className="font-mono text-gray-500">{prefix}</span>
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
          {hasChildren && (
            <span
              className="text-green-500 text-sm cursor-pointer"
              onClick={() => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? "-" : "+"}
            </span>
          )}
          {node.title}
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
              prefix={`${prefix}${isLast ? "    " : "│   "}${
                index === node.children.length - 1 ? "└─ " : "├─ "
              }`}
              isLast={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const StoryChoices = ({ choices }: { choices: Choice[] }) => {
  const tree = buildTree(choices);
  const [selectedId, setSelectedId] = React.useState<string>(tree[0].id);
  const selectedPath = getPath(choices, selectedId);
  return (
    <div>
      <div className="mb-4 text-sm">
        {selectedPath.map((choice: Choice, index: number) => (
          <span key={choice.id}>
            {index > 0 && <span className="mx-2">→</span>}
            <span>{choice.title.toLowerCase().replace(/\s+/g, "_")}</span>
          </span>
        ))}
      </div>
      {tree.map((node: ChoiceNode) => (
        <StoryChoiceNode
          key={node.id}
          node={node}
          onSelect={(node: ChoiceNode) => {
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
