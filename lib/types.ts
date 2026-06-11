export type NCRStatus   = "Open" | "In Progress" | "Closed" | "Overdue"
export type Severity    = "Critical" | "Major" | "Minor"
export type DefectType  = "Weld Defect" | "Structural" | "Piping" | "Painting" | "Outfit" | "Electrical" | "Machinery" | "Hull Plate" | "Other"
export type RootCause   = "Design Issue" | "Material Defect" | "Workmanship" | "Process Gap" | "Environmental" | "Sub-contractor" | "Unknown"
export type ClassSociety = "IRS" | "BV" | "DNV" | "LR" | "ABS" | "KR" | "NK" | "Internal" | "None"
export type Currency    = "INR" | "USD" | "EUR" | "GBP" | "AED"

export interface NCR {
  id: string                // NCR-YYYY-XXXX
  vessel: string
  imoNumber?: string        // IMO vessel number
  yard: string              // Shipyard name
  location: string          // Block / compartment / frame no.
  drawingRef?: string       // Drawing / document reference

  defectType: DefectType
  severity: Severity
  description: string
  rootCause: RootCause

  department: string        // Responsible department

  // People — Indian shipyard hierarchy
  raisedBy: string          // QA Inspector / Class Surveyor who raised
  responsible: string       // Dept HOD / Manager responsible for closure
  authorizedBy: string      // QA Manager / Production Manager who authorized NCR
  assignedTo: string        // Foreman / Supervisor assigned for correction
  followedBy: string        // QA Engineer following up
  reviewedBy?: string       // Class Surveyor / QA Manager final review

  // Classification
  classSociety: ClassSociety
  classRef?: string         // Class survey number / IRS reference

  raisedDate: string        // ISO date
  targetDate: string
  closedDate?: string
  status: NCRStatus

  correctiveAction: string
  lessonLearned?: string    // filled on close

  currency: Currency
  cost?: number             // rework cost in selected currency
}

export interface Equipment {
  id: string
  vessel: string
  yard: string
  tag: string               // Equipment tag number
  name: string
  system: string
  lastServiceDate: string
  nextServiceDate: string
  failureHistory: FailureRecord[]
  notes: string
}

export interface FailureRecord {
  date: string
  description: string
  downtime: number          // hours
  cost: number              // in INR by default
  currency: Currency
}

export interface AppSettings {
  currency: Currency
  yard: string
  classSociety: ClassSociety
}
