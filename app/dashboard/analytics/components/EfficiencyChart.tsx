'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface EfficiencyChartProps {
  data: {
    date: string
    trips: number
  }[]
}

export default function EfficiencyChart({ data }: EfficiencyChartProps) {
  return (
    <div className="h-[200px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis
            dataKey="date"
            stroke="#71717a"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis stroke="#71717a" fontSize={12} />
          <Tooltip
            contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
            itemStyle={{ color: '#e4e4e7' }}
          />
          <Line
            type="monotone"
            dataKey="trips"
            stroke="#f59e0b" // Amber-500
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, fill: '#f59e0b' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
