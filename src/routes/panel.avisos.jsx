import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Megaphone, Pencil, Plus, Send, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui-kit/PageHeader";
import { AsyncState } from "@/components/ui-kit/AsyncState";
import { StatusBadge } from "@/components/ui-kit/StatusBadge";
import { FilterBar, FilterField } from "@/components/panel/FilterBar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, FormError } from "@/components/ui-kit/Field";
import { useServiceQuery } from "@/hooks/useServiceQuery";
import { services } from "@/services";
import { useSession } from "@/lib/SessionContext";
import { formatDateTime } from "@/lib/format";

export const Route = createFileRoute("/panel/avisos")({
  head: () => ({ meta: [{ title: "Avisos · Panel escolar" }] }),
  component: AnnouncementsPage,
});

function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const { can } = useSession();
  const [levelId, setLevelId] = useState("todos");
  const [status, setStatus] = useState("todos");
  const [editing, setEditing] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const catalog = useServiceQuery(["panel-catalog"], () => services.catalog.get(), { staleTime: 120_000 });
  const list = useServiceQuery(["announcements", { levelId, status }], () => services.announcements.list({ levelId, status, pageSize: 30 }));

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["announcements"] });

  async function publish(id) {
    await services.announcements.publish(id);
    refresh();
  }

  async function remove(id) {
    await services.announcements.remove(id);
    refresh();
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Comunicación"
        title="Avisos"
        description="Comunica a todo el colegio, a un nivel o a un grupo. Los avisos publicados aparecen en el portal familiar."
        actions={
          can("announcements.manage") || can("announcements.create") ? (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null);
                setEditorOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Nuevo aviso
            </Button>
          ) : null
        }
      />

      <FilterBar
        onClear={() => {
          setLevelId("todos");
          setStatus("todos");
        }}
      >
        <FilterField label="Nivel">
          <Select value={levelId} onValueChange={setLevelId}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              {(catalog.data?.levels || []).map((level) => (
                <SelectItem key={level.id} value={level.id}>
                  {level.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterField>
        <FilterField label="Estado">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="publicado">Publicados</SelectItem>
              <SelectItem value="programado">Programados</SelectItem>
              <SelectItem value="borrador">Borradores</SelectItem>
            </SelectContent>
          </Select>
        </FilterField>
      </FilterBar>

      <AsyncState query={list} loadingLabel="Cargando avisos…" emptyTitle="Sin avisos con estos filtros">
        {(data) => (
          <ul className="space-y-3">
            {data.items.map((announcement) => (
              <li key={announcement.id} className="border border-border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={announcement.status} />
                      <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{announcement.audienceLabel}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg text-foreground">{announcement.title}</h3>
                    <p className="mt-1.5 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">{announcement.body}</p>
                    <p className="mt-2 text-[11px] text-muted-foreground">
                      {announcement.authorName} · {formatDateTime(announcement.publishAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    {announcement.status !== "publicado" ? (
                      <Button size="sm" variant="outline" onClick={() => publish(announcement.id)}>
                        <Send className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                        Publicar
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditing(announcement);
                        setEditorOpen(true);
                      }}
                      aria-label={`Editar ${announcement.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    {can("announcements.manage") ? (
                      <Button size="sm" variant="ghost" onClick={() => remove(announcement.id)} aria-label={`Eliminar ${announcement.title}`}>
                        <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AsyncState>

      <AnnouncementEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        announcement={editing}
        levels={catalog.data?.levels || []}
        groups={catalog.data?.groups || []}
        onSaved={refresh}
      />
    </div>
  );
}

function AnnouncementEditor({ open, onOpenChange, announcement, levels, groups, onSaved }) {
  const [form, setForm] = useState({
    title: "",
    body: "",
    audienceLevelId: "",
    audienceGroupId: "",
    publishAt: "",
    status: "borrador",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({
      title: announcement?.title || "",
      body: announcement?.body || "",
      audienceLevelId: announcement?.audienceLevelId || "",
      audienceGroupId: announcement?.audienceGroupId || "",
      publishAt: announcement?.publishAt ? announcement.publishAt.slice(0, 16) : "",
      status: announcement?.status || "borrador",
    });
    setError("");
  }, [open, announcement?.id]);

  const groupOptions = groups.filter((group) => !form.audienceLevelId || group.levelId === form.audienceLevelId);

  async function submit(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      await services.announcements.save({
        id: announcement?.id,
        title: form.title,
        body: form.body,
        audienceLevelId: form.audienceLevelId || null,
        audienceGroupId: form.audienceGroupId || null,
        publishAt: form.publishAt ? `${form.publishAt}:00` : new Date().toISOString(),
        status: form.status,
      });
      onOpenChange(false);
      onSaved();
    } catch (submitError) {
      if (submitError.fieldErrors) setError(Object.values(submitError.fieldErrors)[0]);
      else setError(submitError.message || "No se pudo guardar el aviso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{announcement ? "Editar aviso" : "Nuevo aviso"}</DialogTitle>
          <DialogDescription>Segmenta por nivel o grupo y programa la publicación.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />
          <Field label="Título" required>
            <Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Festival de Adviento" />
          </Field>
          <Field label="Contenido" required>
            <Textarea rows={5} value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Nivel">
              <Select
                value={form.audienceLevelId || "todos"}
                onValueChange={(value) => setForm((current) => ({ ...current, audienceLevelId: value === "todos" ? "" : value, audienceGroupId: "" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todo el colegio</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Grupo (opcional)">
              <Select
                value={form.audienceGroupId || "todos"}
                onValueChange={(value) => setForm((current) => ({ ...current, audienceGroupId: value === "todos" ? "" : value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los grupos</SelectItem>
                  {groupOptions.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Publicar el">
              <Input type="datetime-local" value={form.publishAt} onChange={(event) => setForm((current) => ({ ...current, publishAt: event.target.value }))} />
            </Field>
            <Field label="Estado">
              <Select value={form.status} onValueChange={(value) => setForm((current) => ({ ...current, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="publicado">Publicado</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Megaphone className="h-3.5 w-3.5" aria-hidden="true" />
              Los publicados se ven en el portal de las familias.
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Guardando…" : "Guardar aviso"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}