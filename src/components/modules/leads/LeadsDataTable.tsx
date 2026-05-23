"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Copy, Edit, Trash2, Eye } from "lucide-react";
import { useDeleteLeadMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { EditLeadDialog } from "./EditLeadDialog";
import type { Lead } from "@/app/generated/prisma/browser";
import Link from "next/link";

interface LeadsTableProps {
  leads: Lead[];
  onEdit?: (lead: Lead) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  NEW: "border-slate-200 bg-slate-50 text-slate-700",
  CONTACTED: "border-blue-200 bg-blue-50 text-blue-700",
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  INTERESTED: "border-purple-200 bg-purple-50 text-purple-700",
  CONVERTED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  REJECTED: "border-red-200 bg-red-50 text-red-700",
  GHOST: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

const priorityColors: Record<string, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-700",
  MEDIUM: "border-blue-200 bg-blue-50 text-blue-700",
  HIGH: "border-orange-200 bg-orange-50 text-orange-700",
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
};

const enrichmentColors: Record<string, string> = {
  PENDING: "border-slate-200 bg-slate-50 text-slate-700",
  RUNNING: "border-blue-200 bg-blue-50 text-blue-700",
  DONE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  FAILED: "border-red-200 bg-red-50 text-red-700",
  SKIPPED: "border-zinc-200 bg-zinc-50 text-zinc-700",
};

function formatEnum(value?: string | null) {
  return value ? value.replaceAll("_", " ") : "-";
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return "Failed to delete lead";
}

export function LeadsTable({ leads, onEdit, onDelete, isLoading }: LeadsTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteLead] = useDeleteLeadMutation();

  const columns: ColumnDef<Lead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <Link href={`/leads/${row.original.id}`} className="font-medium hover:underline">
            {row.getValue("name")}
          </Link>
          <span className="text-xs text-muted-foreground">
            {row.original.jobTitle || row.original.email || row.original.phone || "No contact channel"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "businessName",
      header: "Business",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-sm">{row.original.businessName}</div>
          <div className="text-xs text-muted-foreground">
            {[row.original.businessType, row.original.city, row.original.country]
              .filter(Boolean)
              .join(" / ") || "-"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.getValue("status") as string]}>
          {formatEnum(row.getValue("status") as string)}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge variant="outline" className={priorityColors[row.original.priority]}>
          {formatEnum(row.original.priority)}
        </Badge>
      ),
    },
    {
      accessorKey: "enrichmentStatus",
      header: "AI",
      cell: ({ row }) => (
        <Badge variant="outline" className={enrichmentColors[row.original.enrichmentStatus]}>
          {formatEnum(row.original.enrichmentStatus)}
        </Badge>
      ),
    },
    {
      accessorKey: "aiScore",
      header: "AI Score",
      cell: ({ row }) => {
        const score = row.getValue("aiScore") as number | undefined;
        if (!score) return <span className="text-muted-foreground">-</span>;

        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500"
                style={{ width: `${(score / 10) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium">{score}/10</span>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const date = new Date(row.getValue("createdAt"));
        return <span className="text-sm">{date.toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const lead = row.original;

        async function handleDelete() {
          try {
            await deleteLead(lead.id).unwrap();
            toast.success("Lead deleted successfully");
            onDelete?.(lead.id);
          } catch (error: unknown) {
            toast.error(getErrorMessage(error));
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/leads/${lead.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(lead.id);
                  toast.success("Lead ID copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <EditLeadDialog lead={lead}>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onEdit?.(lead);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </EditLeadDialog>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data: leads,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/45">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="h-14"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="space-y-1">
                    <p className="font-medium">No leads found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting the search or filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        {isLoading && (
          <span className="text-sm text-muted-foreground">Refreshing...</span>
        )}
      </div>
    </div>
  );
}
