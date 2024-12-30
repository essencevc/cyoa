import { Choice, ChoiceNode } from "@/types/choice";

export function buildTree(
  choices: Choice[],
  parentId: string | null = null
): ChoiceNode[] {
  return choices
    .filter(choice => choice.parent_id === parentId)
    .map(choice => ({
      ...choice,
      children: buildTree(choices, choice.id)
    }));
}

export function getPath(choices: Choice[], targetId: string): Choice[] {
  const path: Choice[] = [];
  let currentId: string | null = targetId;

  while (currentId) {
    const current = choices.find(c => c.id === currentId);
    if (!current) break;
    path.unshift(current);
    currentId = current.parent_id;
  }

  return path;
}

