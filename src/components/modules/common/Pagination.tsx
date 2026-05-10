"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

type PageItem = number | "ellipsis-left" | "ellipsis-right";

interface PaginationProps {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  showFirstLast?: boolean;
}

function getPageItems(page: number, totalPages: number, siblingCount: number): PageItem[] {
  if (totalPages <= 0) return [];

  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const totalNumbers = siblingCount * 2 + 5;

  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, index) => index + 1
    );
    return [...leftRange, "ellipsis-right", totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRangeStart = totalPages - (2 + siblingCount * 2);
    const rightRange = Array.from(
      { length: 3 + siblingCount * 2 },
      (_, index) => rightRangeStart + index
    );
    return [1, "ellipsis-left", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, index) => leftSibling + index
  );

  return [1, "ellipsis-left", ...middleRange, "ellipsis-right", totalPages];
}

export function Pagination({
  page,
  totalPages,
  total = 0,
  limit = 10,
  onPageChange,
  siblingCount = 1,
  className,
  showFirstLast = true,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const currentPage = Math.min(Math.max(page, 1), safeTotalPages);
  const pageItems = getPageItems(currentPage, safeTotalPages, siblingCount);
  const startItem = total > 0 ? (currentPage - 1) * limit + 1 : 0;
  const endItem = total > 0 ? Math.min(currentPage * limit, total) : 0;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-t bg-muted/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <p className="text-sm text-muted-foreground">
        {total > 0
          ? `Showing ${startItem}-${endItem} of ${total}`
          : "No results to show"}
      </p>

      <div className="flex flex-wrap items-center gap-1.5">
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="Go to first page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pageItems.map((item) =>
          typeof item === "number" ? (
            <Button
              key={item}
              variant={item === currentPage ? "default" : "outline"}
              size="icon-sm"
              onClick={() => onPageChange(item)}
              aria-current={item === currentPage ? "page" : undefined}
            >
              {item}
            </Button>
          ) : (
            <span
              key={item}
              className="flex h-7 w-7 items-center justify-center text-sm text-muted-foreground"
              aria-hidden="true"
            >
              ...
            </span>
          )
        )}

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === safeTotalPages}
          aria-label="Go to next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        {showFirstLast && (
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={currentPage === safeTotalPages}
            aria-label="Go to last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
