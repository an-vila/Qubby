export interface Item {
  id: number;
  name: string;
  description: string;
  box: number;
  code?: string;
  image?: string;
  tags?: string[];
  registrationDate?: string;
  quantity?: number;
  status?: string;
  isEditing?: boolean;
}

export interface Box {
  id: number;
  name: string;
  created_at?: string;
  itemCount?: number;
  items?: Item[];
  isEditing?: boolean;
}
