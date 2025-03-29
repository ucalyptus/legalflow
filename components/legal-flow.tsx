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
      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-gray-100 ${
        active ? "bg-gray-100 text-black" : "text-gray-500"
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
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
    <div className="w-64 border-r">
      <div className="flex items-center gap-2 p-4">
        <div className="h-8 w-8 rounded-lg bg-[#4880ff]" />
        <span className="text-xl font-semibold">LegalFlow</span>
      </div>
      <nav className="space-y-1 p-3">
      <NavItem icon={<FileText className="h-5 w-5" />} href="/dashboard">
          Dashboard
        </NavItem>
        <NavItem icon={<Upload className="h-5 w-5" />} href="/documents">
          Documents
        </NavItem>
      </nav>
      <div className="mt-auto p-3">
        <div className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2">
          <Avatar className="h-8 w-8">
            <div className="bg-purple-100" />
          </Avatar>
        </div>
      </div>
    </div>
  )
}

