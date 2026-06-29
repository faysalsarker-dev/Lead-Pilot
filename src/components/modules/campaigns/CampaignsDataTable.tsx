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
import { Copy, Edit, MoreHorizontal, Pause, Play, Trash2 } from "lucide-react";
import {
  useDeleteCampaignMutation,
  useLaunchCampaignMutation,
  usePauseCampaignMutation,
} from "@/redux/hooks";
import { toast } from "sonner";
import { EditCampaignDialog } from "./EditCampaignDialog";
import type { Campaign } from "@/redux/features/campaigns/campaigns.api";

interface CampaignsTableProps {
  campaigns: Campaign[];
  onEdit?: (campaign: Campaign) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  RUNNING: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PAUSED: "border-amber-200 bg-amber-50 text-amber-700",
  COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
};

function getErrorMessage(error: unknown, fallback: string) {
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

  return fallback;
}

export function CampaignsTable({
  campaigns,
  onEdit,
  onDelete,
  isLoading,
}: CampaignsTableProps) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [deleteCampaign] = useDeleteCampaignMutation();
  const [launchCampaign] = useLaunchCampaignMutation();
  const [pauseCampaign] = usePauseCampaignMutation();

  const columns: ColumnDef<Campaign>[] = [
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
      header: "Campaign Name",
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge className={statusColors[row.getValue("status") as string]}>
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "leadCount",
      header: "Leads",
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original._count.campaignLeads} leads
        </span>
      ),
    },
    {
      accessorKey: "sentCount",
      header: "Sent",
      cell: ({ row }) => {
        const sent = row.original.totalSent;
        const total = row.original._count.campaignLeads;
        const percentage = total > 0 ? Math.round((sent / total) * 100) : 0;

        return (
          <div className="flex items-center gap-2">
            <div className="h-2 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{percentage}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: "launchedAt",
      header: "Launched",
      cell: ({ row }) => {
        const date = row.original.launchedAt;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return <span className="text-sm">{new Date(date).toLocaleDateString()}</span>;
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const campaign = row.original;

        async function handleDelete() {
          try {
            await deleteCampaign(campaign.id).unwrap();
            toast.success("Campaign deleted successfully");
            onDelete?.(campaign.id);
          } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to delete campaign"));
          }
        }

        async function handleLaunch() {
          try {
            await launchCampaign(campaign.id).unwrap();
            toast.success("Campaign launched");
          } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to launch campaign"));
          }
        }

        async function handlePause() {
          try {
            await pauseCampaign(campaign.id).unwrap();
            toast.success("Campaign paused");
          } catch (error: unknown) {
            toast.error(getErrorMessage(error, "Failed to pause campaign"));
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
                  navigator.clipboard.writeText(campaign.id);
                  toast.success("Campaign ID copied");
                }}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>
              <EditCampaignDialog campaign={campaign}>
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    onEdit?.(campaign);
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              </EditCampaignDialog>

              {campaign.status === "DRAFT" && (
                <DropdownMenuItem onClick={handleLaunch}>
                  <Play className="mr-2 h-4 w-4" />
                  Launch
                </DropdownMenuItem>
              )}

              {campaign.status === "RUNNING" && (
                <DropdownMenuItem onClick={handlePause}>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </DropdownMenuItem>
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
    data: campaigns,
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
                    <p className="font-medium">No campaigns found</p>
                    <p className="text-sm text-muted-foreground">
                      Try adjusting the filters or create a new campaign.
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
