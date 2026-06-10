import type { Metadata } from "next";
import { GodModeApp } from "@/components/godmode/GodModeApp";

export const metadata: Metadata = {
  title: "AshboardOS 2.0",
  description: "A unified command center that sits above your entire tool ecosystem.",
};

export default function GodModePage() {
  return <GodModeApp />;
}
