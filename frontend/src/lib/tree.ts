// import { Choice, ChoiceNode } from "@/types/choice";

import { SelectStoryChoice } from "@/db/schema";

type treeChoice = SelectStoryChoice & { children: treeChoice[] };

export function buildTree(
  choices: SelectStoryChoice[],
  parentId: string | "NULL"
): treeChoice[] {
  return choices
    .filter(choice => choice.parentId === parentId)
    .map(choice => ({
      ...choice,
      children: buildTree(choices, choice.id)
    }));
}

export function getPath(
  choices: SelectStoryChoice[],
  targetId: string
): SelectStoryChoice[] {
  const path: SelectStoryChoice[] = [];
  let currentId: string | null = targetId;

  while (currentId) {
    const current = choices.find(c => c.id === currentId);
    if (!current) break;
    path.unshift(current);
    currentId = current.parentId;
  }

  return path;
}

