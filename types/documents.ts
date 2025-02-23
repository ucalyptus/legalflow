export interface DocumentItem {
  id: string
  title: string
  caseTitle: string
  status: "Draft" | "Submitted" | "Under Review" | "Approved"
  type: string
  lastModified: string
} 