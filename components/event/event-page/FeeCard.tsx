"use client";

import { useState, useRef } from "react";
import { Coins, Pencil, ShieldAlert } from "lucide-react";
import { InlineEdit } from "./InlineEdit";
import type { ResolvedTheme } from "@/lib/theme";

export function FeeCard({
  feeDescription,
  isHost,
  theme: t,
  onSave,
}: {
  feeDescription?: string | null;
  isHost: boolean;
  theme: ResolvedTheme;
  onSave: (val: string) => void;
}) {
  const feeRef = useRef<HTMLSpanElement>(null);

  if (!feeDescription && !isHost) {
    return null;
  }

  return (
    <div className="card-sheet p-5 mb-6 border-l-4 border-l-[var(--signal)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--signal)]/10 text-[var(--signal)] flex items-center justify-center border border-[var(--signal)]/30">
            <Coins size={15} />
          </div>
          <div>
            <span className="tech-index text-[var(--signal)] text-[10px]">FIN-01</span>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
              Aporte Sugerido / Cuota
            </h3>
          </div>
        </div>
        {isHost && (
          <button
            onClick={() => feeRef.current?.click()}
            className="text-[var(--muted)] hover:text-[var(--ink)] p-1 transition-colors"
            title="Editar cuota"
          >
            <Pencil size={12} />
          </button>
        )}
      </div>

      <div className="mt-2 text-sm font-sans font-medium text-[var(--ink)]">
        <InlineEdit
          outerRef={feeRef}
          value={feeDescription ?? ""}
          onSave={onSave}
          placeholder="+ Agregar detalle de cuota o aporte para gastos comunes (ej: $5.000 para arriendo de quincho)"
          multiline
          isHost={isHost}
          style={{
            display: "block",
            lineHeight: 1.5,
          }}
        />
      </div>

      <p className="mt-3 pt-2 border-t border-[var(--line)] text-[11px] text-[var(--muted)] font-sans flex items-center gap-1.5">
        <ShieldAlert size={12} className="text-[var(--muted)] flex-shrink-0" />
        <span>
          Informativo: Coordina directamente con el anfitrión. Invita no cobra comisiones.
        </span>
      </p>
    </div>
  );
}
