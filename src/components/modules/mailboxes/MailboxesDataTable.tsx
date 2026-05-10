"use client";

import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
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
import { MoreHorizontal, Copy, Edit, Trash2, Star } from "lucide-react";
import { useDeleteMailboxMutation, useSetDefaultMailboxMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { MailboxDialog } from "./MailboxDialog";
import type { Mailbox } from "@/redux/features/mailboxes/mailboxes.api";

interface MailboxesTableProps {
  mailboxes: Mailbox[];
  onEdit?: (mailbox: Mailbox) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const typeColors: Record<string, string> = {
  GMAIL_OAUTH: "bg-blue-100 text-blue-800",
  CUSTOM_SMTP: "bg-purple-100 text-purple-800",
};

export function MailboxesTable({ mailboxes, onEdit, onDelete, isLoading }: MailboxesTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteMailbox] = useDeleteMailboxMutation();
  const [setDefault] = useSetDefaultMailboxMutation();

  const columns: ColumnDef<Mailbox>[] = [
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
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => {
        const mailbox = row.original;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{row.getValue("label")}</span>
            {mailbox.isDefault && (
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={typeColors[row.getValue("type") as string]}>
          {row.getValue("type")}
        </Badge>
      ),
    },
    {
      accessorKey: "smtpUser",
      header: "Email Address",
      cell: ({ row }) => {
        const mailbox = row.original;
        return (
          <span className="text-sm text-muted-foreground">
            {mailbox.smtpUser || mailbox.imapUser || "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastImapSync",
      header: "Last Sync",
      cell: ({ row }) => {
        const date = row.original.lastImapSync;
        if (!date) return <span className="text-muted-foreground">Never</span>;
        return (
          <span className="text-sm">
            {new Date(date).toLocaleDateString()} {new Date(date).toLocaleTimeString()}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const mailbox = row.original;

        async function handleDelete() {
          try {
            await deleteMailbox(mailbox.id).unwrap();
            toast.success("Mailbox deleted successfully");
            onDelete?.(mailbox.id);
          } catch (error: any) {
            toast.error(error?.data?.message || "Failed to delete mailbox");
          }
        }

        async function handleSetDefault() {
          try {
            await setDefault(mailbox.id).unwrap();
            toast.success("Mailbox set as default");
          } catch (error: any) {
            toast.error(error?.data?.message || "Failed to set default");
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
              <DropdownMenuItem
                onClick={() => {
                  navigator.clipboard.writeText(mailbox.id);
                  toast.success("Mailbox ID copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <MailboxDialog mailbox={mailbox}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </MailboxDialog>

              {!mailbox.isDefault && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSetDefault}>
                    <Star className="mr-2 h-4 w-4" />
                    Set as Default
                  </DropdownMenuItem>
                </>
              )}

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
    data: mailboxes,
    columns,
    state: {
      rowSelection,
      sorting,
    },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-12">
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No mailboxes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
