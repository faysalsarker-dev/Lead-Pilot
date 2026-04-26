"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { dashboardData } from "./data"

export function ActivityChart() {
  const { activityChart } = dashboardData

  const data = activityChart.labels.map((label, i) => ({
    day: label,
    sent: activityChart.sent[i],
    replies: activityChart.replies[i],
  }))

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-4">
        <p className="text-sm font-medium text-foreground">Outreach activity</p>
        <p className="text-xs text-muted-foreground">last 14 days</p>
      </div>

      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(136,135,128,0.15)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#888780" }}
            tickLine={false}
            axisLine={false}
            interval={1}
            angle={-35}
            textAnchor="end"
            height={40}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#888780" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          />
          <Line
            type="monotone"
            dataKey="sent"
            stroke="#378ADD"
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="Sent"
          />
          <Line
            type="monotone"
            dataKey="replies"
            stroke="#639922"
            strokeWidth={2}
            strokeDasharray="4 3"
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            name="Replies"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex gap-4 mt-2">
        {[
          { color: "#378ADD", label: "Sent", dash: false },
          { color: "#639922", label: "Replies", dash: true },
        ].map(({ color, label, dash }) => (
          <span key={label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block h-0.5 w-6 rounded"
              style={{
                backgroundColor: color,
                backgroundImage: dash
                  ? `repeating-linear-gradient(90deg, ${color} 0, ${color} 4px, transparent 4px, transparent 7px)`
                  : "none",
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  )
}