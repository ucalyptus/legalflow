"use client"

import type React from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, FileText, Grid, LayoutDashboard, MessageSquareText, Search, Settings, Star, Upload, ChevronRight } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@supabase/supabase-js"

interface NavItemProps {
  icon: React.ReactNode
  children: React.ReactNode
  active?: boolean
}

function NavItem({ icon, children, active, href = "#" }: NavItemProps & { href?: string }) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        active ? "bg-[#e2e9ff] text-[#4880ff]" : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{children}</span>
    </Link>
  )
}

function NotificationItem({ time }: { time: string }) {
  return (
    <div className="flex gap-3 px-4 py-2 hover:bg-gray-50">
      <Avatar className="h-8 w-8">
        <div className="bg-gray-100" />
      </Avatar>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">@Name</span> made redlines in Document A
        </p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

// Add this interface for case data
interface CaseItem {
  id: string
  title: string
  clientName: string
  status: "Ongoing" | "Settled" | "Under Review" | "Pending"
  nextHearing?: string
  updatedAt: string
  priority: "High" | "Medium" | "Low"
}

// Sample case data
const recentCases: CaseItem[] = [
  {
    id: "1",
    title: "ABC Corp vs XYZ Ltd",
    clientName: "ABC Corporation",
    status: "Ongoing",
    nextHearing: "2024-03-01",
    updatedAt: "2024-02-23",
    priority: "High"
  },
  {
    id: "2",
    title: "State vs John Doe",
    clientName: "State Government",
    status: "Under Review",
    updatedAt: "2024-02-22",
    priority: "Medium"
  },
  {
    id: "3",
    title: "Property Dispute - Singh vs Kumar",
    clientName: "Mr. Singh",
    status: "Pending",
    nextHearing: "2024-03-15",
    updatedAt: "2024-02-21",
    priority: "Low"
  }
]

export default function LegalFlow() {
  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar */}
      <div className="w-64 border-r">
        <div className="flex items-center gap-2 p-4">
          <div className="h-8 w-8 rounded-lg bg-[#4880ff]" />
          <span className="text-xl font-semibold">LegalFlow</span>
        </div>
        <nav className="space-y-1 p-3">
          <NavItem icon={<LayoutDashboard className="h-5 w-5" />} href="/">
            Dashboard
          </NavItem>
          <NavItem icon={<FileText className="h-5 w-5" />} href="/cases">
            Cases
          </NavItem>
          <NavItem icon={<Upload className="h-5 w-5" />} href="/documents">
            Documents
          </NavItem>
          <NavItem icon={<MessageSquareText className="h-5 w-5" />}>Ask AI</NavItem>
          <NavItem icon={<Star className="h-5 w-5" />}>Filings</NavItem>
        </nav>
        <div className="mt-auto p-3">
          <NavItem icon={<Settings className="h-5 w-5" />}>Settings</NavItem>
          <div className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2">
            <Avatar className="h-8 w-8">
              <div className="bg-purple-100" />
            </Avatar>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <div className="flex items-center gap-4">
            <Grid className="h-5 w-5 text-gray-500" />
            <Star className="h-5 w-5 text-gray-500" />
            <div className="text-sm text-gray-600">Dashboard / Default</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input className="w-64 pl-9" placeholder="Search" />
            </div>
            <Button variant="ghost" size="icon">
              <Grid className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <main className="p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold">Welcome back!</h1>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              New Case
            </Button>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Card className="bg-blue-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-blue-900">
                  Active Cases
                </CardTitle>
                <div className="text-2xl font-bold text-blue-900">24</div>
              </CardHeader>
            </Card>
            <Card className="bg-green-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-green-900">
                  Cases Won
                </CardTitle>
                <div className="text-2xl font-bold text-green-900">18</div>
              </CardHeader>
            </Card>
            <Card className="bg-purple-50">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-purple-900">
                  Pending Review
                </CardTitle>
                <div className="text-2xl font-bold text-purple-900">7</div>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Latest Cases</h2>
              <Button variant="ghost" size="sm">
                View All
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Next Hearing</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentCases.map((case_) => (
                    <TableRow key={case_.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">{case_.title}</TableCell>
                      <TableCell>{case_.clientName}</TableCell>
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
                      <TableCell>{case_.updatedAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 border-l">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-medium">Notifications</h2>
          <Bell className="h-5 w-5" />
        </div>
        <div className="divide-y">
          <NotificationItem time="Just now" />
          <NotificationItem time="6 hours ago" />
          <NotificationItem time="12 hours ago" />
          <NotificationItem time="Today, 09:45 AM" />
          <NotificationItem time="Today, 09:45 AM" />
        </div>
        <div className="border-t p-4">
          <h2 className="font-medium">Activity</h2>
        </div>
        <div className="divide-y">
          <NotificationItem time="Today, 09:45 AM" />
          <NotificationItem time="Today, 09:45 AM" />
          <NotificationItem time="Today, 09:45 AM" />
          <NotificationItem time="Today, 09:45 AM" />
        </div>
      </div>
    </div>
  )
}

