import { StoryNode } from "./schemas";

type GraphNode = {
  name: string;
  attributes: {
    id: string;
    setting: string;
    parent_node_id: string | null;
    image_url: string | undefined;
    story_id: string;
  };
  children: GraphNode[];
};

export const createGraph = (nodes: StoryNode[], story_id: string) => {
  if (nodes.length === 0) {
    return null;
  }

  const id_to_node = new Map<string, GraphNode>();

  // First we create all of the nodes
  for (const node of nodes) {
    const graphNode: GraphNode = {
      name: node.choice_text,
      attributes: {
        id: node.id,
        setting: node.setting,
        image_url: node.image_url ?? undefined,
        parent_node_id: node.parent_node_id ?? null,
        story_id: story_id,
      },
      children: [],
    };
    id_to_node.set(node.id, graphNode);
  }

  // Then we for every node, we add the children to the parent
  for (const node of nodes) {
    const graphNode = id_to_node.get(node.id);
    if (graphNode && node.parent_node_id) {
      const parentNode = id_to_node.get(node.parent_node_id);
      if (parentNode) {
        parentNode.children.push(graphNode);
      }
    }
  }

  // We create a dummy root node
  const dummy_root_node: GraphNode = {
    name: "Root",
    attributes: {
      id: "start",
      setting: "",
      parent_node_id: null,
      image_url: undefined,
      story_id: story_id,
    },
    children: [],
  };

  // Then we find the root node
  for (const node of nodes) {
    if (node.parent_node_id === null) {
      dummy_root_node.children.push(id_to_node.get(node.id) as GraphNode);
    }
  }

  return dummy_root_node;
};
