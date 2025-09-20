import { LucideIcon } from "lucide-react";

export interface Domain {
  id: string;
  title: string;
  icon: LucideIcon;
}

export interface Task {
  id: string;
  domainId: string;
  columnId: ColumnId;
  content: string;
}

export type ColumnId = "todo" | "inprogress" | "done";

export interface Column {
  id: ColumnId;
  title: string;
}