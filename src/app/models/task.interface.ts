export interface Task {
    id: string;
    title?: string,
    todo: string;
    completed: boolean;
    userId: string;
    deadline?: string; // Coloque como opcional, caso nem sempre seja fornecido
  }
  