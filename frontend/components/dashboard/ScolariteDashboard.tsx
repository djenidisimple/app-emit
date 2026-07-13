'use client';

import { Topbar } from './Topbar';
import { StatStrip, defaultStats } from './StatStrip';
import { ExceptionQueue, defaultExceptions } from './ExceptionQueue';
import { RoomStatusGrid, defaultBuildings } from './RoomStatusGrid';
import { DayTimeline, defaultDayTimeline } from './DayTimeline';
import { WeeklyLoadChart, defaultWeeklyLoad } from './WeeklyLoadChart';
import { TrackFilList, defaultFiliereData } from './TrackFilList';
import { ContactList, defaultContacts } from './ContactList';

export function ScolariteDashboard() {
  return (
    <div className="flex flex-col gap-[18px]">
      <Topbar />
      <StatStrip stats={defaultStats} />
      <div className="grid grid-cols-2 gap-[18px] max-[1180px]:grid-cols-1">
        <ExceptionQueue exceptions={defaultExceptions} />
        <ContactList contacts={defaultContacts} />
      </div>
      <RoomStatusGrid buildings={defaultBuildings} />
      <DayTimeline {...defaultDayTimeline} />
      <div className="grid grid-cols-2 gap-[18px] max-[1180px]:grid-cols-1">
        <WeeklyLoadChart data={defaultWeeklyLoad} />
        <TrackFilList data={defaultFiliereData} />
      </div>
    </div>
  );
}
