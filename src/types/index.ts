import { LucideIcon } from "lucide-react";

export interface Domain {
  id: string;
  title: string;
  icon: LucideIcon;
  progress: number;
}

export interface Task {
  id: string;
  columnId: ColumnId;
  content: string;
}

export type ColumnId = "todo" | "inprogress" | "done";

export interface Column {
  id: ColumnId;
  title: string;
}