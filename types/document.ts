export interface Document {
  id: string;
  title: string;
  url: string;
  content: string | null;
  type: string;
  status: string;
  caseTitle?: string;
  lastModified: string;
  tags?: string[];
} 