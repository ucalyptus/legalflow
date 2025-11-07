"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  FileText,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Users,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCases } from "@/app/actions/documents"

// Type for raw case data from Prisma
interface PrismaCase {
  id: string
  title: string
  clientName: string
  status: string
  nextHearing: Date | null
  updatedAt: Date
  priority: string
  caseType: string
  assignedTo: string[]
  filingDate: Date
  documents: unknown[]
}

// Map Prisma CaseStatus to UI status
const mapCaseStatus = (status: string) => {
  const statusMap: { [key: string]: "Ongoing" | "Settled" | "Under Review" | "Pending" } = {
    'ONGOING': 'Ongoing',
    'SETTLED': 'Settled',
    'UNDER_REVIEW': 'Under Review',
    'PENDING': 'Pending'
  }
  return statusMap[status] || 'Pending'
}

interface CaseItem {
  id: string
  title: string
  clientName: string
  status: "Ongoing" | "Settled" | "Under Review" | "Pending"
  nextHearing?: string
  updatedAt: string
  priority: "High" | "Medium" | "Low"
  caseType: string
  assignedTo: string[]
  filingDate: string
}

export default function CasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    async function loadCases() {
      const loadedCases = await getCases()
      // Map the loaded cases to match the CaseItem interface
      const mappedCases: CaseItem[] = loadedCases.map((c: PrismaCase) => ({
        ...c,
        status: mapCaseStatus(c.status),
        priority: c.priority.charAt(0) + c.priority.slice(1).toLowerCase() as "High" | "Medium" | "Low",
        updatedAt: c.updatedAt.toISOString(),
        filingDate: c.filingDate.toISOString(),
        nextHearing: c.nextHearing?.toISOString()
      }))
      setCases(mappedCases)
    }
    loadCases()
  }, [])

  const filteredCases = cases.filter(case_ => {
    const matchesSearch = 
      case_.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      case_.clientName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || case_.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType = typeFilter === "all" || case_.caseType.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cases</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Case
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cases.length}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === "Ongoing").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +2 new this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === "Under Review").length}
            </div>
            <p className="text-xs text-muted-foreground">
              3 require attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Closed Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cases.filter(c => c.status === "Settled").length}
            </div>
            <p className="text-xs text-muted-foreground">
              +12 this year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ongoing">Ongoing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="under review">Under Review</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
        <Select onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Case Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="civil">Civil</SelectItem>
            <SelectItem value="criminal">Criminal</SelectItem>
            <SelectItem value="corporate">Corporate</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Cases Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Title</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Next Hearing</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Filing Date</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCases.map((case_) => (
              <TableRow key={case_.id}>
                <TableCell className="font-medium">{case_.title}</TableCell>
                <TableCell>{case_.clientName}</TableCell>
                <TableCell>{case_.caseType}</TableCell>
                <TableCell>
                  <Badge variant={
                    case_.status === "Ongoing" ? "default" :
                    case_.status === "Under Review" ? "warning" :
                    case_.status === "Settled" ? "success" : "secondary"
                  }>
                    {case_.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    case_.priority === "High" ? "destructive" :
                    case_.priority === "Medium" ? "warning" : "secondary"
                  }>
                    {case_.priority}
                  </Badge>
                </TableCell>
                <TableCell>{case_.nextHearing || "Not Scheduled"}</TableCell>
                <TableCell>{case_.assignedTo.join(", ")}</TableCell>
                <TableCell>{case_.filingDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Case</DropdownMenuItem>
                      <DropdownMenuItem>Assign Team</DropdownMenuItem>
                      <DropdownMenuItem>Schedule Hearing</DropdownMenuItem>
                      <DropdownMenuItem>View Documents</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
} 