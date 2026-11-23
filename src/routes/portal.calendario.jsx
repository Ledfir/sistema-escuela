import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { EmptyState } from "@/components/ui-kit/States";
import { Button } from "@/components/ui/button";
import { usePortal } from "@/components/portal/PortalContext";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate, formatMonthYear, weekdayShort } from "@/lib/format";

export const Route = createFileRoute("/portal/calendario")({
  head: () => ({ meta: [{ title: "Calendario · Portal familiar" }] }),
  component: PortalCalendar,
});

function PortalCalendar() {
  const { student, studentId } = usePortal();
  const [view, setView] = useState("mes");
  const [cursor, setCursor] = useState(new Date(2026, 10, 1));

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`;

  const events = useServiceQuery(["portal-events", studentId], () => services.portal.events(studentId), {
    enabled: Boolean(studentId),
  });

  if (!student) return <EmptyState title="Sin alumno seleccionado" description="Selecciona un alumno para ver su calendario." />;

  const inMonth = (events.data || []).filter((event) => event.date >= firstDay && event.date <= lastDay);
  const byDate = {};
  inMonth.forEach((event) => {
    byDate[event.date] = byDate[event.date] || [];
    byDate[event.date].push(event);
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{student.gradeName}</p>
          <h1 className="font-display text-2xl text-foreground">Calendario</h1>
        </div>
        <div className="flex gap-1 border border-border">
          <button
            type="button"
            onClick={() => setView("mes")}
            className={`px-3 py-1.5 text-[12px] ${view === "mes" ? "bg-brand-ink text-brand-paper" : "text-muted-foreground"}`}
          >
            Mes
          </button>
          <button
            type="button"
            onClick={() => setView("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] ${view === "lista" ? "bg-brand-ink text-brand-paper" : "text-muted-foreground"}`}
          >
            <List className="h-3.5 w-3.5" aria-hidden="true" />
            Lista
          </button>
        </div>
      </div>

      <AsyncState query={events} loadingLabel="Cargando calendario…">
        {() =>
          view === "mes" ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Mes anterior">
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </Button>
                <p className="font-display text-[15px] capitalize text-foreground">{formatMonthYear(firstDay)}</p>
                <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Mes siguiente">
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
              <div className="overflow-x-auto border border-border bg-card">
                <div className="min-w-[560px]">
                  <div className="grid grid-cols-7 border-b border-border bg-muted/50">
                    {["L", "M", "M", "J", "V", "S", "D"].map((day, index) => (
                      <div key={`${day}-${index}`} className="py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {cells.map((day, index) => {
                      const iso = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
                      const dayEvents = iso ? byDate[iso] || [] : [];
                      return (
                        <div key={`${index}-${day}`} className={`min-h-[76px] border-b border-r border-border/60 p-1 ${day ? "" : "bg-muted/20"}`}>
                          {day ? (
                            <>
                              <p className="text-[10px] text-muted-foreground">{day}</p>
                              {dayEvents.slice(0, 2).map((event) => (
                                <p key={event.id} className="mt-0.5 truncate bg-brand-sand/40 px-1 text-[9px] text-brand-ink" title={event.title}>
                                  {event.title}
                                </p>
                              ))}
                              {dayEvents.length > 2 ? <p className="text-[9px] text-muted-foreground">+{dayEvents.length - 2}</p> : null}
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {(events.data || []).map((event) => (
                <li key={event.id} className="border border-border bg-card px-4 py-3">
                  <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {weekdayShort(event.date)} {formatDate(event.date)} · {event.startTime} - {event.endTime}
                  </p>
                  <p className="mt-0.5 text-[13px] font-medium text-foreground">{event.title}</p>
                  {event.description ? <p className="text-[12px] text-muted-foreground">{event.description}</p> : null}
                </li>
              ))}
            </ul>
          )
        }
      </AsyncState>
    </div>
  );
}