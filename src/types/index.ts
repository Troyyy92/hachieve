import { LucideIcon } from "lucide-react";

export interface Domain {
  id: string;
  title: string;
  icon: LucideIcon;
  description?: string;
  isPriority?: boolean;
}

export interface Task {
  id: string;
  domainId: string;
  columnId: ColumnId;
  content: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  isPriority?: boolean;
  isAllDay?: boolean;
}

export type ColumnId = "todo" | "inprogress" | "done";

export interface Column {
  id: ColumnId;
  title: string;
}