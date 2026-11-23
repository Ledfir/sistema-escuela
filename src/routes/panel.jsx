import { createFileRoute } from "@tanstack/react-router";
import { PanelLayout } from "@/components/panel/PanelLayout";

export const Route = createFileRoute("/panel")({
  component: PanelLayout,
});