"use client";

import { use } from "react";
import { CanvasEditor } from "@/components/canvas/CanvasEditor";

export default function GraphPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CanvasEditor graphId={id} />;
}
