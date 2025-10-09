import { Card, CardContent } from "@/components/ui/card.jsx"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"
import { useTransaction } from "@/stores/TransactionStore"

const COLORS = [
  "#3B82F6", // Blue
  "#EF4444", // Red
  "#10B981", // Green
  "#F59E0B", // Yellow
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#84CC16", // Lime
]


export default function ExpenseChart() {
  const { transactions } = useTransaction()
  const expenseTransactions = transactions.filter((t) => t.transactionType === "expense")

  const categoryData = expenseTransactions.reduce(
    (acc: Record<string, number>, transaction) => {
      const category = transaction.category
      if (acc[category]) {
        acc[category] += transaction.amount
      } else {
        acc[category] = transaction.amount
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const chartData = Object.entries(categoryData).map(([category, amount]) => ({
    name: category,
    value: amount,
  }))

  return (
    <Card>
      <CardContent>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value">
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-slate-500">
            No expense data available for current month
          </div>
        )}
      </CardContent>
    </Card>
  )
}
