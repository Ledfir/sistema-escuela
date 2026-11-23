import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CreditCard, Mail, MapPin, MoreHorizontal, Phone, UserRound } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { EmptyState } from "@/components/ui-kit/States";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StudentEditDialog, StudentEnrollDialog, StudentWithdrawDialog } from "@/components/panel/students/StudentDialogs";
import { StudentDocuments } from "@/components/panel/students/StudentDocuments";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { useSession } from "@/lib/SessionContext";
import { formatCurrency, formatDate } from "@/lib/format";

export const Route = createFileRoute("/panel/alumnos/$id")({
  validateSearch: (search) => ({ volver: search.volver || undefined }),
  head: () => ({ meta: [{ title: "Expediente del alumno · Panel escolar" }] }),
  component: StudentDetail,
});

function DataRow({ label, value }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground">{value || "—"}</dd>
    </div>
  );
}

function StudentDetail() {
  const { id } = Route.useParams();
  const { volver } = Route.useSearch();
  const queryClient = useQueryClient();
  const { can } = useSession();
  const [dialog, setDialog] = useState(null);

  const detail = useServiceQuery(["student", id], () => services.students.get(id));
  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["student", id] });
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const canManage = can("students.manage");

  return (
    <div className="space-y-5">
      <Link to={`/panel/alumnos${volver || ""}`} className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Volver al listado
      </Link>

      <AsyncState query={detail} loadingLabel="Cargando expediente…">
        {(student) => (
          <div className="space-y-5">
            <PageHeader
              eyebrow={`${student.matricula} · ${student.levelName}`}
              title={student.fullName}
              description={`${student.gradeName} · Grupo ${student.groupName} · Ciclo 2026-2027`}
              actions={
                <div className="flex items-center gap-2">
                  <StatusBadge status={student.status} />
                  {canManage ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Acciones
                          <MoreHorizontal className="ml-2 h-4 w-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuLabel>Expediente</DropdownMenuLabel>
                        <DropdownMenuItem onSelect={() => setDialog("edit")}>Editar datos</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDialog("enroll")}>Reinscribir</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setDialog("group")}>Cambio de grupo</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setDialog("withdraw")} className="text-destructive">
                          Registrar baja
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                </div>
              }
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Saldo pendiente</p>
                <p className={`mt-2 font-display text-2xl tabular ${student.balance > 0 ? "text-destructive" : "text-primary"}`}>
                  {formatCurrency(student.balance)}
                </p>
                <Link
                  to="/panel/cargos"
                  search={{ estudiante: student.id, tab: "estado" }}
                  className="mt-1 inline-flex items-center gap-1 text-[11px] text-brand-ink hover:underline"
                >
                  <CreditCard className="h-3 w-3" aria-hidden="true" />
                  Ver estado de cuenta
                </Link>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Asistencia registrada</p>
                <p className="mt-2 font-display text-2xl tabular text-foreground">{student.attendanceSummary.total} días</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {student.attendanceSummary.present} presentes · {student.attendanceSummary.absent} faltas
                </p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Documentos</p>
                <p className="mt-2 font-display text-2xl tabular text-foreground">{student.documents.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">en el expediente</p>
              </div>
              <div className="border border-border bg-card p-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">Incidencias</p>
                <p className="mt-2 font-display text-2xl tabular text-foreground">{student.incidents.length}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">registradas en el ciclo</p>
              </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
              <TabsList className="w-full justify-start overflow-x-auto bg-transparent p-0">
                {[
                  ["general", "Datos generales"],
                  ["tutores", "Tutores"],
                  ["documentos", "Documentos"],
                  ["historial", "Historial"],
                ].map(([value, label]) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="rounded-none border-b-2 border-transparent px-4 py-2 text-[13px] data-[state=active]:border-brand-ink data-[state=active]:bg-transparent data-[state=active]:text-foreground"
                  >
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="general">
                <section className="border border-border bg-card px-5 py-5">
                  <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    <DataRow label="Nombre completo" value={student.fullName} />
                    <DataRow label="Matrícula" value={student.matricula} />
                    <DataRow label="Fecha de nacimiento" value={formatDate(student.birthDate)} />
                    <DataRow label="CURP" value={student.curp} />
                    <DataRow label="Sexo" value={student.gender === "F" ? "Femenino" : "Masculino"} />
                    <DataRow label="Tipo de sangre" value={student.bloodType} />
                    <DataRow label="Alergias" value={student.allergies} />
                    <DataRow label="Fecha de inscripción" value={formatDate(student.enrollmentDate)} />
                    <DataRow label="Estado" value={student.status === "activo" ? "Activo" : "Baja"} />
                    <div className="sm:col-span-2 lg:col-span-3">
                      <DataRow label="Domicilio" value={student.address} />
                    </div>
                    {student.notes ? (
                      <div className="sm:col-span-2 lg:col-span-3">
                        <dt className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">Notas</dt>
                        <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{student.notes}</dd>
                      </div>
                    ) : null}
                  </dl>
                </section>
              </TabsContent>

              <TabsContent value="tutores">
                {student.tutors.length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {student.tutors.map((tutor) => (
                      <section key={tutor.id} className="border border-border bg-card p-5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-sand/40 text-brand-ink">
                            <UserRound className="h-5 w-5" aria-hidden="true" />
                          </span>
                          <div>
                            <p className="text-sm font-medium text-foreground">{tutor.name}</p>
                            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{tutor.relationship}</p>
                          </div>
                        </div>
                        <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                            <a href={`tel:${tutor.phone}`} className="hover:text-foreground">
                              {tutor.phone || "Sin teléfono"}
                            </a>
                          </li>
                          <li className="flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                            <a href={`mailto:${tutor.email}`} className="break-all hover:text-foreground">
                              {tutor.email || "Sin correo"}
                            </a>
                          </li>
                          <li className="flex items-start gap-2">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            {tutor.address || "Sin domicilio registrado"}
                          </li>
                        </ul>
                      </section>
                    ))}
                  </div>
                ) : (
                  <EmptyState title="Sin tutores vinculados" description="Agrega un tutor desde la edición del expediente." />
                )}
              </TabsContent>

              <TabsContent value="documentos">
                <StudentDocuments
                  studentId={student.id}
                  documents={student.documents}
                  canManage={canManage}
                  onChanged={refresh}
                />
              </TabsContent>

              <TabsContent value="historial">
                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="border border-border bg-card">
                    <header className="border-b border-border px-5 py-3.5">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Inscripciones</h3>
                    </header>
                    <ol className="space-y-4 px-5 py-4">
                      {student.enrollments.map((enrollment) => (
                        <li key={enrollment.id} className="relative border-l border-border pl-4">
                          <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-brand-gold" aria-hidden="true" />
                          <p className="text-sm text-foreground">
                            {enrollment.status === "reinscrito" ? "Reinscripción" : "Inscripción"} · {formatDate(enrollment.date)}
                          </p>
                          <p className="text-[11px] text-muted-foreground">Ciclo {enrollment.cycleId === "cyc-2026" ? "2026-2027" : enrollment.cycleId}</p>
                        </li>
                      ))}
                    </ol>
                  </section>

                  <section className="border border-border bg-card">
                    <header className="border-b border-border px-5 py-3.5">
                      <h3 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Incidencias</h3>
                    </header>
                    {student.incidents.length ? (
                      <ul className="divide-y divide-border">
                        {student.incidents.map((incident) => (
                          <li key={incident.id} className="px-5 py-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-[13px] font-medium capitalize text-foreground">{incident.type}</p>
                              <StatusBadge status={incident.status} />
                            </div>
                            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{incident.description}</p>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {formatDate(incident.date)} · {incident.reportedBy}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-5 py-4 text-sm text-muted-foreground">Sin incidencias registradas.</p>
                    )}
                  </section>
                </div>
              </TabsContent>
            </Tabs>

            <StudentEditDialog
              student={student}
              groups={catalog.data?.groups || []}
              open={dialog === "edit"}
              onOpenChange={(open) => !open && setDialog(null)}
              onSaved={refresh}
            />
            <StudentEnrollDialog
              student={student}
              mode={dialog === "group" ? "group" : "enroll"}
              groups={catalog.data?.groups || []}
              cycles={catalog.data?.cycles || []}
              open={dialog === "enroll" || dialog === "group"}
              onOpenChange={(open) => !open && setDialog(null)}
              onSaved={refresh}
            />
            <StudentWithdrawDialog
              student={student}
              open={dialog === "withdraw"}
              onOpenChange={(open) => !open && setDialog(null)}
              onSaved={refresh}
            />
          </div>
        )}
      </AsyncState>
    </div>
  );
}