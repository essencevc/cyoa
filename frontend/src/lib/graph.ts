import { StoryWithNodes } from "./schemas";

type GraphNode = {
    name: string
    attributes: {
        id: number
        setting: string
    }
    children: GraphNode[]
}

export const createGraph = (story: StoryWithNodes) => {
    const nodes = story.story_nodes
    const id_to_node  = new Map<number, GraphNode>()

    // First we create all of the nodes
    for (const node of nodes) {
        const graphNode: GraphNode = {
            name: node.setting,
            attributes: {
                id: node.node_id,
                setting: node.setting
            },
            children: []
        }
        id_to_node.set(node.node_id, graphNode)
    }

    // Then we for every node, we add the children to the parent
    for (const node of nodes) {
        const graphNode = id_to_node.get(node.node_id)
        if (graphNode && node.parent_node_id) {
            const parentNode = id_to_node.get(node.parent_node_id)
            if (parentNode) {
                parentNode.children.push(graphNode)
            }
        }
    }

    // Then we find the root node
    for (const node of nodes) {
        if (node.parent_node_id === null) {
            return id_to_node.get(node.node_id)
        }
    }
}