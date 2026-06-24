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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import {
  AlertTriangle,
  Copy,
  Edit,
  Mail,
  MoreHorizontal,
  Server,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useDeleteMailboxMutation, useSetDefaultMailboxMutation } from "@/redux/hooks";
import { toast } from "sonner";
import { MailboxDialog } from "./MailboxDialog";
import type { Mailbox } from "@/redux/features/mailbox/mailbox.api";

function getMutationMessage(error: unknown, fallback: string) {
  const maybeError = error as { data?: { message?: string } };
  return maybeError.data?.message || fallback;
}

interface MailboxesTableProps {
  mailboxes: Mailbox[];
  onEdit?: (mailbox: Mailbox) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const typeColors: Record<string, string> = {
  GMAIL_OAUTH: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300",
  GMAIL_IMAP: "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300",
  CUSTOM_SMTP: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300",
  CLOUDFLARE_WORKER: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300",
};

const typeLabels: Record<string, string> = {
  GMAIL_OAUTH: "Gmail OAuth",
  GMAIL_IMAP: "Gmail IMAP",
  CUSTOM_SMTP: "Custom SMTP",
  CLOUDFLARE_WORKER: "Cloudflare Worker",
};

function getMailboxAddress(mailbox: Mailbox) {
  return mailbox.smtpUser || mailbox.imapUser || mailbox.gmailEmail || mailbox.replyTo || "";
}



export function MailboxesTable({ mailboxes, onDelete }: MailboxesTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deletingMailboxId, setDeletingMailboxId] = useState<string | null>(null);
  const [deleteMailbox] = useDeleteMailboxMutation();
  const [setDefault] = useSetDefaultMailboxMutation();

  const columns: ColumnDef<Mailbox>[] = [

    {
      accessorKey: "label",
      header: "Mailbox",
      cell: ({ row }) => {
        const mailbox = row.original;
        const address = getMailboxAddress(mailbox);

        return (
          <div className="flex min-w-55 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              {mailbox.type === "CUSTOM_SMTP" ? (
                <Server className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate font-medium">{row.getValue("label")}</span>
                {mailbox.isDefault && (
                  <Star className="h-4 w-4 shrink-0 fill-amber-500 text-amber-500" />
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {address || "No sender address"}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Provider",
      cell: ({ row }) => (
        <Badge variant="outline" className={typeColors[row.getValue("type") as string]}>
          {typeLabels[row.getValue("type") as string] || row.getValue("type")}
        </Badge>
      ),
    },
    {
      id: "replyTracking",
      header: "Reply Tracking",
      cell: ({ row }) => {
        const mailbox = row.original;
        const isReceiving = mailbox.imapEnabled || mailbox.type === "GMAIL_OAUTH";

        return (
          <div className="flex items-center gap-2">
            <span
              className={`flex h-2 w-2 rounded-full ${
                isReceiving ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
            />
            <span className="text-sm text-muted-foreground">
              {isReceiving ? "Enabled" : "Not configured"}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={row.original.isActive ? "outline" : "secondary"}
          className={
            row.original.isActive
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              : ""
          }
        >
          {row.original.isActive && <ShieldCheck className="h-3 w-3" />}
          {row.original.isActive ? "Active" : "Paused"}
        </Badge>
      ),
    },
    
    {
      id: "actions",
      cell: ({ row }) => {
        const mailbox = row.original;

        async function handleDelete() {
          setDeletingMailboxId(mailbox.id);
          try {
            await deleteMailbox(mailbox.id).unwrap();
            toast.success("Mailbox deleted successfully");
            onDelete?.(mailbox.id);
          } catch (error: unknown) {
            toast.error(getMutationMessage(error, "Failed to delete mailbox"));
          } finally {
            setDeletingMailboxId(null);
          }
        }

        async function handleSetDefault() {
          try {
            await setDefault(mailbox.id).unwrap();
            toast.success("Mailbox set as default");
          } catch (error: unknown) {
            toast.error(getMutationMessage(error, "Failed to set default"));
          }
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
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
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem
                    onSelect={(event) => event.preventDefault()}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogMedia className="bg-red-100 text-red-600 dark:bg-red-950/40">
                      <AlertTriangle className="h-5 w-5" />
                    </AlertDialogMedia>
                    <AlertDialogTitle>Delete mailbox?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove &quot;{mailbox.label}&quot; from your sending
                      infrastructure. Campaigns using this mailbox may no longer send from it.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel disabled={deletingMailboxId === mailbox.id}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deletingMailboxId === mailbox.id}
                    >
                      {deletingMailboxId === mailbox.id ? "Deleting..." : "Delete mailbox"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // eslint-disable-next-line react-hooks/incompatible-library
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
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted/40">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-11 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
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
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"} className="h-16">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Mail className="h-8 w-8 opacity-60" />
                    <span className="text-sm">No mailboxes found.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-muted/25 px-3 py-2">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} selected
        </div>
        <div className="text-sm text-muted-foreground">{mailboxes.length} visible</div>
      </div>
    </div>
  );
}
