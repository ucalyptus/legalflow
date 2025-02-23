"use client"

import type React from "react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Bell, FileText, Grid, LayoutDashboard, MessageSquareText, Search, Settings, Star, Upload } from "lucide-react"
import Link from "next/link"

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
          <h1 className="text-xl font-semibold">Hi User!</h1>
          <Card className="mt-4 bg-[#eaffe2] p-4">
            <p>You have 3 action items --</p>
          </Card>
          <Card className="mt-4 bg-[#e2e9ff] p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Cases</h2>
              <Button variant="ghost" size="icon">
                <Grid className="h-5 w-5" />
              </Button>
            </div>
          </Card>
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

