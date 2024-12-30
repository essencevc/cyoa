export interface Choice {
    id: string;
    parent_id: string | null;
    description: string;
    title: string;
    is_terminal: boolean;
  }
  
  export interface ChoiceNode extends Choice {
    children: ChoiceNode[];
  }
  
  