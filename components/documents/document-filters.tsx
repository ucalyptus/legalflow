"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DocStatus } from "@/types/documents"

interface DocumentFiltersProps {
  statusFilter: string[]
  setStatusFilter: (status: string[]) => void
  sortBy: string
  setSortBy: (sort: string) => void
}

const statusOptions = [
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "APPROVED", label: "Approved" }
]

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "alphabetical", label: "Alphabetical (A-Z)" }
]

export function DocumentFilters({
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
}: DocumentFiltersProps) {
  
  const toggleStatus = (status: string) => {
    const newStatusFilter = statusFilter.includes(status)
      ? statusFilter.filter(s => s !== status)
      : [...statusFilter, status]
    setStatusFilter(newStatusFilter)
  }
  
  return (
    <>
      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <span>{statusFilter.length ? `${statusFilter.length} selected` : "Filter by Status"}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          {statusOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={statusFilter.includes(option.value)}
              onCheckedChange={() => toggleStatus(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Sort Options */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[180px] justify-between">
            <span>Sort by</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-4 w-4 opacity-50"><path d="m6 9 6 6 6-6"/></svg>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[180px]">
          {sortOptions.map(option => (
            <DropdownMenuCheckboxItem
              key={option.value}
              checked={sortBy === option.value}
              onCheckedChange={() => setSortBy(option.value)}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
} 