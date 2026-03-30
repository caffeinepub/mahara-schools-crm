import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useParentActor } from "../../hooks/useParentActor";
import type { AuthUser, CalendarEvent } from "../../types";

interface Props {
  user: AuthUser;
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_COLORS: Record<string, string> = {
  Event: "#4FC3F7",
  Holiday: "#EF5350",
  "CC Meet": "#7B1FA2",
  "Field Trip": "#8BC34A",
};

function categoryColor(cat: string, fallback: string): string {
  return CATEGORY_COLORS[cat] ?? fallback ?? "#64A0A3";
}

export default function ParentCalendar({ user: _user }: Props) {
  const { actor } = useParentActor();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getCalendarEvents()
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [actor]);

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
    setSelectedDay(null);
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
    setSelectedDay(null);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  type Cell = { key: string; day: number | null };
  const leadingBlanks: Cell[] = Array.from({ length: firstDay }, (_, i) => ({
    key: `blank-pre-${i}`,
    day: null,
  }));
  const dayCells: Cell[] = Array.from({ length: daysInMonth }, (_, i) => ({
    key: `day-${i + 1}`,
    day: i + 1,
  }));
  const allCells = [...leadingBlanks, ...dayCells];
  const trailingCount = (7 - (allCells.length % 7)) % 7;
  const cells: Cell[] = [
    ...allCells,
    ...Array.from({ length: trailingCount }, (_, i) => ({
      key: `blank-post-${i}`,
      day: null,
    })),
  ];

  function eventsOnDay(day: number): CalendarEvent[] {
    return events.filter((e) => {
      const d = new Date(e.date);
      return (
        d.getFullYear() === viewYear &&
        d.getMonth() === viewMonth &&
        d.getDate() === day
      );
    });
  }

  const selectedDayEvents = selectedDay ? eventsOnDay(selectedDay) : [];
  const isToday = (day: number) =>
    day === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();
  const isWeekend = (cellIndex: number) =>
    cellIndex % 7 === 0 || cellIndex % 7 === 6;

  function handleDayClick(day: number | null) {
    if (!day) return;
    setSelectedDay(day === selectedDay ? null : day);
  }

  function handleDayKeyDown(e: React.KeyboardEvent, day: number | null) {
    if (!day) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setSelectedDay(day === selectedDay ? null : day);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4" data-ocid="calendar.loading_state">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          School Calendar
        </h2>
        <p className="text-sm text-muted-foreground">
          Events, holidays, and important dates
        </p>
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="py-3 px-4 border-b">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              data-ocid="calendar.pagination_prev"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <CardTitle className="text-base">
              {MONTHS[viewMonth]} {viewYear}
            </CardTitle>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              data-ocid="calendar.pagination_next"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b">
            {DAYS.map((d, i) => (
              <div
                key={d}
                className={[
                  "text-center py-2 text-xs font-semibold uppercase tracking-wide",
                  i === 0 || i === 6
                    ? "text-red-400 bg-red-50/60"
                    : "text-muted-foreground",
                ].join(" ")}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {cells.map(({ key: cellKey, day }, idx) => {
              const dayEvents = day ? eventsOnDay(day) : [];
              const weekend = isWeekend(idx);
              const selected = day !== null && day === selectedDay;
              const todayCell = day !== null && isToday(day);
              return (
                <div
                  key={cellKey}
                  role={day ? "button" : undefined}
                  tabIndex={day ? 0 : undefined}
                  onClick={() => handleDayClick(day)}
                  onKeyDown={(e) => handleDayKeyDown(e, day)}
                  className={[
                    "min-h-[56px] sm:min-h-[72px] p-1 border-b border-r last:border-r-0 transition-colors",
                    day ? "cursor-pointer" : "",
                    weekend && day ? "bg-pink-50/70" : "",
                    selected
                      ? "bg-[#E0F2F3] ring-1 ring-inset ring-[#4F8F92]"
                      : "",
                    day && !selected ? "hover:bg-muted/40" : "",
                  ].join(" ")}
                >
                  {day && (
                    <>
                      <span
                        className={[
                          "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-0.5",
                          todayCell
                            ? "bg-[#4F8F92] text-white"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        {day}
                      </span>
                      <div className="flex flex-col gap-0.5">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <span
                            key={ev.id}
                            className="block w-full text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium text-white"
                            style={{
                              background: categoryColor(ev.category, ev.color),
                            }}
                          >
                            {ev.title}
                          </span>
                        ))}
                        {dayEvents.length > 2 && (
                          <span className="text-[9px] text-muted-foreground pl-1">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedDay !== null && (
        <Card
          className="shadow-sm border-[#4F8F92]/30"
          data-ocid="calendar.panel"
        >
          <CardHeader className="py-3 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm">
              {MONTHS[viewMonth]} {selectedDay}, {viewYear}
            </CardTitle>
            <button
              type="button"
              onClick={() => setSelectedDay(null)}
              className="p-1 hover:bg-muted rounded transition-colors"
              data-ocid="calendar.close_button"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-3 pb-4 px-4">
            {selectedDayEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events on this day.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedDayEvents.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-3">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background: categoryColor(ev.category, ev.color),
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{ev.title}</p>
                      <Badge className="text-[10px] mt-0.5" variant="outline">
                        {ev.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: color }}
            />
            <span className="text-xs text-muted-foreground">{cat}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-pink-100 border border-pink-200" />
          <span className="text-xs text-muted-foreground">Weekend</span>
        </div>
      </div>
    </div>
  );
}
