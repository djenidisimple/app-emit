'use client';

import React, { useState } from 'react';
import { 
  Search, Filter, Plus, ChevronLeft, ChevronRight, 
  MoreHorizontal, Clock, Coffee, Timer 
} from 'lucide-react';
import StatCard from '@/components/global/StatCard';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const employeesData = [
  {name:"Jerome Bell", email:"nuray@aligmui.com", img:1, in:"10:02 AM", inLate:false, out:"09:10 PM", outLate:false, dur:"8h 58m", brk:"10:00  10:15", ot:"2h 10", status:"ontime"},
  {name:"Liam Carter", email:"liam@aligmui.com", img:2, in:"12:02 PM", inLate:true, out:"09:00 PM", outLate:false, dur:"8h 58m", brk:"11:00  11:10", ot:"-", status:"late"},
  {name:"Maya Ross", email:"maya@aligmui.com", img:3, in:"10:02 AM", inLate:true, out:"09:10 PM", outLate:false, dur:"8h 58m", brk:"11:00  11:10", ot:"2h 10", status:"late"},
  {name:"Ethan Cole", email:"ethan@aligmui.com", img:4, in:"10:02 AM", inLate:false, out:"09:10 PM", outLate:false, dur:"8h 58m", brk:"12:00  12:20", ot:"2h 10", status:"ontime"},
  {name:"Ava Brooks", email:"ava@aligmui.com", img:5, in:"10:02 AM", inLate:false, out:"07:00 PM", outLate:true, dur:"8h 58m", brk:"10:00  10:15", ot:"-", status:"ontime"},
  {name:"Noah Reed", email:"noah@aligmui.com", img:6, in:"10:02 AM", inLate:true, out:"09:10 PM", outLate:false, dur:"8h 58m", brk:"11:00  11:10", ot:"2h 10", status:"late"},
  {name:"Chloe Dean", email:"chloe@aligmui.com", img:7, in:"10:02 AM", inLate:false, out:"07:00 PM", outLate:true, dur:"8h 58m", brk:"12:00  12:20", ot:"-", status:"ontime"},
  {name:"Owen Hayes", email:"owen@aligmui.com", img:8, in:"10:02 AM", inLate:false, out:"09:10 PM", outLate:false, dur:"8h 58m", brk:"10:00  10:15", ot:"2h 10", status:"ontime"},
];

export default function AttendancePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-6 flex flex-col gap-6 max-w-[1400px] mx-auto w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Employee" value="32" variant="default" />
        <StatCard label="Total Presents" value="19" variant="success" />
        <StatCard label="Total Absents" value="05" variant="danger" />
        <StatCard label="Total Leave" value="08" variant="warning" />
      </div>

      <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 font-semibold text-sm text-fg-default">
            <span>Monday 05 October</span>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-full">
                <ChevronLeft size={14} />
              </Button>
              <span className="text-xs text-fg-muted font-medium cursor-pointer">
                2025 ▾
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3 text-fg-muted" />
              <Input 
                placeholder="Search" 
                className="pl-8 w-[160px] h-8" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Filter size={14} />
              Filter
            </Button>
            <Button size="sm" className="h-8 gap-2 bg-accent text-white hover:bg-accent-dark">
              <Plus size={14} />
              Add New Employee
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input type="checkbox" className="rounded-sm border border-border" />
                </TableHead>
                <TableHead>Employee name</TableHead>
                <TableHead>Clock-in & Out</TableHead>
                <TableHead>Break time</TableHead>
                <TableHead>Overtime</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employeesData
                .filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((e, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <input type="checkbox" className="rounded-sm border border-border" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar src={`https://i.pravatar.cc/64?img=${e.img}`} alt={e.name} className="w-8 h-8" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-fg-default">{e.name}</span>
                        <span className="text-xs text-fg-muted">{e.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <span style={{ color: e.inLate ? '#ef4444' : 'var(--color-fg-default, #1f2937)' }}>{e.in}</span>
                      <span className="text-fg-subtle">•</span>
                      <span className="text-fg-muted text-[11px]">{e.dur}</span>
                      <span className="text-fg-subtle">•</span>
                      <span style={{ color: e.outLate ? '#f97316' : 'var(--color-fg-default, #1f2937)' }}>{e.out}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {e.brk}
                  </TableCell>
                  <TableCell className="text-xs text-fg-muted">
                    {e.ot}
                  </TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'ontime' ? 'success' : 'danger'} className={`text-xs px-2 py-0.5 border-none ${
                      e.status === 'ontime' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {e.status === 'ontime' ? 'On time' : 'Late'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="p-1 text-fg-muted">
                      <MoreHorizontal size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between items-center pt-4 text-xs text-fg-muted">
          <div className="flex items-center gap-2">
            <span>Show</span>
            <select className="bg-bg-muted border border-border rounded-md px-2 py-1 text-xs outline-none">
              <option>10</option>
              <option>20</option>
              <option>50</option>
            </select>
            <span>Employees per page</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-md">
              <ChevronLeft size={14} />
            </Button>
            {[1, 2, 3, 4, 5].map(p => (
              <Button 
                key={p} 
                variant={p === 1 ? 'accent' : 'outline'} 
                size="sm" 
                className={`w-8 h-8 p-0 rounded-md ${
                  p === 1 ? 'bg-accent text-white' : 'bg-white text-fg-muted'
                }`}
              >
                {p}
              </Button>
            ))}
            <span className="px-1">…</span>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-md">
              16
            </Button>
            <Button variant="outline" size="sm" className="w-8 h-8 p-0 rounded-md">
              <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
