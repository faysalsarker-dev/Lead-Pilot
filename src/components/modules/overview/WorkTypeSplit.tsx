"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { dashboardData } from "./data"

const COLORS = ["#378ADD", "#7F77DD"]

export function WorkTypeSplit() {
  const { workTypeSplit } = dashboardData

  const data = [
    { name: "Service", value: workTypeSplit.service },
    { name: "Project", value: workTypeSplit.project },
  ]

  return (
    <div className="rounded-lg border bg-card p-4 h-full">
      <div className="mb-2">
        <p className="text-sm font-medium text-foreground">Work type split</p>
        <p className="text-xs text-muted-foreground">service vs project</p>
      </div>

      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={42}
            outerRadius={62}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value}%`, ""]}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid var(--border)",
              backgroundColor: "var(--card)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="flex justify-center gap-5 mt-1">
        {data.map(({ name, value }, i) => (
          <span key={name} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: COLORS[i] }}
            />
            {name} {value}%
          </span>
        ))}
      </div>
    </div>
  )
}