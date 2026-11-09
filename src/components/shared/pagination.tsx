"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaginationMeta } from "@/types/api";

export function Pagination({ pagination, onPageChange }: {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}) {
  const { page, pageSize, total, totalPages } = pagination;
  const first = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-slate-500">Showing <span className="font-medium text-slate-700">{first}–{last}</span> of <span className="font-medium text-slate-700">{total}</span></p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
          <ChevronLeft aria-hidden="true" /> Previous
        </Button>
        <span className="min-w-20 text-center text-xs text-slate-500">Page {page} of {Math.max(totalPages, 1)}</span>
        <Button type="button" variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
          Next <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
