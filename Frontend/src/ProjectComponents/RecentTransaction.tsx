import { Card, CardContent } from "@/components/ui/card.jsx"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useTransaction } from "@/stores/TransactionStore"

export default function RecentTransactions() {
  const { transactions } = useTransaction();
  return (
    <Card className="overflow-y-scroll h-[95%]">
      <CardContent>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-full ${
                      transaction.transactionType === "income"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {transaction.transactionType === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{transaction.description}</p>
                    <p className="text-sm text-slate-500">
                      {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.transactionType === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.transactionType === "income" ? "+" : "-"}${transaction.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">No transactions Data Available</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
