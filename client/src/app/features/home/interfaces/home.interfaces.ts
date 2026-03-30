export interface Item {
  id: number;
  name: string;
  description?: string;
  box: number;         // ID de la caja a la que pertenece
  created_at?: string;
  isEditing?: boolean; // Estado local para edición inline (igual que Box)
}

export interface Box {
  id: number;
  name: string;
  created_at?: string;
  itemCount?: number;  // Viene del backend (items.count)
  items?: Item[];      // Viene anidado del BoxSerializer
  isEditing?: boolean;
}