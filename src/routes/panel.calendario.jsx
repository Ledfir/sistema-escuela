import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, ChevronRight, List } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { DataTable } from "@/components/ui-kit/DataTable";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { formatDate, formatMonthYear, weekdayShort } from "@/lib/format";

export const Route = createFileRoute("/panel/calendario")({
  head: () => ({ meta: [{ title: "Calendario escolar · Panel escolar" }] }),
  component: CalendarPage,
});

const TYPE_TONES = {
  reunion: "bg-primary/10 text-primary border-primary/20",
  festival: "bg-brand-sand/50 text-brand-ink border-brand-sand",
  salida: "bg-sky-50 text-sky-800 border-sky-200",
  admision: "bg-amber-50 text-amber-800 border-amber-200",
  interno: "bg-muted text-muted-foreground border-border",
  pastoral: "bg-accent/40 text-[#6b5622] border-accent",
  general: "bg-muted text-muted-foreground border-border",
};

function CalendarPage() {
  const [view, setView] = useState("mes");
  const [levelId, setLevelId] = useState("todos");
  const [cursor, setCursor] = useState(new Date(2026, 10, 1));

  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const lastDay = `${year}-${String(month + 1).padStart(2, "0")}-${String(new Date(year, month + 1, 0).getDate()).padStart(2, "0")}`;

  const events = useServiceQuery(["calendar", { firstDay, lastDay, levelId }], () =>
    services.calendar.list({ from: firstDay, to: lastDay, levelId }),
  );

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells = [...Array(startWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7 !== 0) cells.push(null);

  const byDate = {};
  (events.data || []).forEach((event) => {
    byDate[event.date] = byDate[event.date] || [];
    byDate[event.date].push(event);
  });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunicación"
        title="Calendario escolar"
        description="Reuniones, festivales, salidas y fechas internas del ciclo 2026-2027."
        actions={
          <div className="flex gap-1 border border-border">
            <button
              type="button"
              onClick={() => setView("mes")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] ${view === "mes" ? "bg-brand-ink text-brand-paper" : "text-muted-foreground"}`}
            >
              <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
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
        }
      />

      <FilterBar>
        <FilterField label="Nivel">
          <Select value={levelId} onValueChange={setLevelId}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todo el colegio</SelectItem>
              {(catalog.data?.levels || []).map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        {view === "mes" ? (
          <div className="flex items-center gap-2 pb-0.5 sm:ml-auto">
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Mes anterior">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <span className="min-w-[150px] text-center font-display text-[15px] capitalize text-foreground">
              {formatMonthYear(`${year}-${String(month + 1).padStart(2, "0")}-01`)}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Mes siguiente">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </FilterBar>

      <AsyncState query={events} loadingLabel="Cargando calendario…">
        {(data) =>
          view === "mes" ? (
            <div className="overflow-x-auto border border-border bg-card">
              <div className="min-w-[680px]">
                <div className="grid grid-cols-7 border-b border-border bg-muted/60">
                  {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
                    <div key={day} className="px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7">
                  {cells.map((day, index) => {
                    const iso = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : null;
                    const dayEvents = iso ? byDate[iso] || [] : [];
                    const isToday = iso === "2026-11-18";
                    return (
                      <div
                        key={`${index}-${day}`}
                        className={`min-h-[104px] border-b border-r border-border/70 p-1.5 last:border-r-0 ${day ? "" : "bg-muted/20"} ${
                          isToday ? "bg-brand-sand/20" : ""
                        }`}
                      >
                        {day ? (
                          <>
                            <p className={`text-[11px] ${isToday ? "font-semibold text-brand-ink" : "text-muted-foreground"}`}>{day}</p>
                            <ul className="mt-1 space-y-1">
                              {dayEvents.slice(0, 2).map((event) => (
                                <li
                                  key={event.id}
                                  className={`truncate border px-1.5 py-0.5 text-[10px] ${TYPE_TONES[event.type] || TYPE_TONES.general}`}
                                  title={event.title}
                                >
                                  {event.startTime} {event.title}
                                </li>
                              ))}
                              {dayEvents.length > 2 ? (
                                <li className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} más</li>
                              ) : null}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <DataTable
              rows={data}
              emptyTitle="Sin eventos en el periodo"
              columns={[
                { key: "date", header: "Fecha", render: (row) => `${weekdayShort(row.date)} ${formatDate(row.date)}` },
                { key: "title", header: "Evento", render: (row) => <span className="font-medium">{row.title}</span> },
                { key: "startTime", header: "Horario", render: (row) => `${row.startTime} - ${row.endTime}` },
                {
                  key: "level",
                  header: "Nivel",
                  render: (row) => (row.levelId ? catalog.data?.levels.find((level) => level.id === row.levelId)?.name : "Todo el colegio"),
                },
                { key: "type", header: "Tipo", render: (row) => <span className="capitalize">{row.type}</span> },
                { key: "description", header: "Descripción", render: (row) => <span className="text-[12px] text-muted-foreground">{row.description}</span> },
              ]}
            />
          )
        }
      </AsyncState>
    </div>
  );
}