export enum DocStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED"
}

export interface DocumentItem {
  id: string
  title: string
  caseTitle: string
  status: "Draft" | "Submitted" | "Under Review" | "Approved"
  type: string
  lastModified: string
}

export interface DocumentTags {
  document_id: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
} 