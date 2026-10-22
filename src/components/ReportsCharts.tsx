"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

import { RingChart, Ring, RingCenter } from "@/components/RingChart";

export function ReportsCharts({ pieData, barData, profitData, labels }: {
  pieData: { name: string, value: number, color: string }[],
  barData: { month: string, credit: number, debit: number }[],
  profitData: { month: string, profit: number }[],
  labels: { titlePie: string, titleBar: string, titleProfit: string, credit: string, debit: string }
}) {
  const maxVal = Math.max(...pieData.map(d => d.value), 1);
  const ringData = pieData.map(d => ({
    label: d.name,
    value: d.value,
    maxValue: maxVal,
    color: d.color
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ring Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center w-full">{labels.titlePie}</h3>
          <div className="flex-1 w-full flex items-center justify-center min-h-[300px]">
            <RingChart 
              data={ringData} 
              size={240}
              animationDuration={1100}
              animationEasing="cubic-bezier(0.85, 0, 0.15, 1)" 
              strokeWidth={16} 
              ringGap={7} 
              baseInnerRadius={50}
            >
              {ringData.map((_, i) => <Ring index={i} key={i} />)}
              <RingCenter defaultLabel="Total" />
            </RingChart>
          </div>
          {/* Custom Legend for Ring Chart */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {ringData.map((d, i) => (
              <div key={i} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center print:break-inside-avoid">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center w-full">{labels.titleBar}</h3>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                <Tooltip formatter={(value: any) => Number(value).toLocaleString()} />
                <Legend />
                <Bar dataKey="credit" name={labels.credit} fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="debit" name={labels.debit} fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
