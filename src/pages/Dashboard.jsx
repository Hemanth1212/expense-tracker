import { useState } from "react";
import { TrendingUp, TrendingDown, Wallet, AlertTriangle } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { useApp } from "../context/AppContext";
import {
  formatCurrency,
  getCategory,
  getMonthLabel,
} from "../utils/formatters";

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className={`rounded-2xl p-4 flex flex-col gap-1 ${color}`}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
        {label}
      </span>
      <Icon size={18} className="opacity-70" />
    </div>
    <span className="text-2xl font-bold tracking-tight">{value}</span>
    {sub && <span className="text-xs opacity-60">{sub}</span>}
  </div>
);

const CustomTooltip = ({ active, payload, currency, customCategories }) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    const cat = getCategory(name, customCategories);
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 shadow-lg text-sm">
        <span className="font-semibold">
          {cat.icon} {cat.label}
        </span>
        <br />
        <span className="text-slate-600 dark:text-slate-300">
          {formatCurrency(value, currency)}
        </span>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const {
    getMonthlyStats,
    getCategoryBreakdown,
    getWeeklyTrend,
    getBudgetUsage,
    data,
  } = useApp();
  const [activeCategory, setActiveCategory] = useState(null);
  const currency = data.user.baseCurrency;
  const customCategories = data.customCategories || [];

  const stats = getMonthlyStats();
  const breakdown = getCategoryBreakdown();
  const weeklyTrend = getWeeklyTrend();
  const budgetUsage = getBudgetUsage();

  const chartData = breakdown.map((b) => {
    const cat = getCategory(b.category, customCategories);
    return {
      name: b.category,
      value: b.amount,
      label: cat.label,
      color: cat.color,
      icon: cat.icon,
    };
  });

  const alerts = budgetUsage.filter((b) => b.status !== "ok");

  const filteredTransactions = activeCategory
    ? stats.transactions.filter(
        (t) => t.category === activeCategory && t.type === "expense",
      )
    : stats.transactions.slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Month Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            {getMonthLabel()}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Your financial overview
          </p>
        </div>
      </div>

      {/* At-a-Glance Cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          label="Income"
          value={formatCurrency(stats.income, currency)}
          icon={TrendingUp}
          color="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
        />
        <StatCard
          label="Expenses"
          value={formatCurrency(stats.expenses, currency)}
          icon={TrendingDown}
          color="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300"
        />
        <StatCard
          label="Balance"
          value={formatCurrency(Math.abs(stats.balance), currency)}
          icon={Wallet}
          color={
            stats.balance >= 0
              ? "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300"
              : "bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300"
          }
          sub={stats.balance < 0 ? "Over budget" : "Remaining"}
        />
      </div>

      {/* Budget Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((b) => {
            const cat = getCategory(b.category, customCategories);
            return (
              <div
                key={b.budgetId}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                  b.status === "over"
                    ? "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800"
                }`}
              >
                <AlertTriangle size={16} />
                <span>
                  {cat.icon} {cat.label}: {formatCurrency(b.spent, currency)} /{" "}
                  {formatCurrency(b.limitAmount, currency)} (
                  {Math.round(b.percentage)}%)
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Donut Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
              Spending by Category
            </h3>
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="text-xs text-sky-500 hover:text-sky-600 font-medium"
              >
                Clear filter
              </button>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  onClick={(entry) =>
                    setActiveCategory((prev) =>
                      prev === entry.name ? null : entry.name,
                    )
                  }
                  style={{ cursor: "pointer" }}
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.color}
                      opacity={
                        activeCategory && activeCategory !== entry.name
                          ? 0.3
                          : 1
                      }
                      stroke={
                        activeCategory === entry.name ? "#fff" : "transparent"
                      }
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <CustomTooltip
                      currency={currency}
                      customCategories={customCategories}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-1.5 overflow-y-auto max-h-44 scrollbar-hide">
              {chartData.map((item) => (
                <button
                  key={item.name}
                  onClick={() =>
                    setActiveCategory((prev) =>
                      prev === item.name ? null : item.name,
                    )
                  }
                  className={`w-full flex items-center gap-2 text-left rounded-lg px-2 py-1 transition-all ${activeCategory === item.name ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"}`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">
                    {item.icon} {item.label}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-white">
                    {formatCurrency(item.value, currency)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
          <p className="text-slate-400 text-sm">
            No expenses this month yet.
            <br />
            Tap + to add your first transaction.
          </p>
        </div>
      )}

      {/* Weekly Trend Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-800 dark:text-white text-sm mb-3">
          Weekly Spending Trend
        </h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={weeklyTrend} barSize={14} barGap={2}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              formatter={(v, name) => [
                formatCurrency(v, currency),
                name === "current" ? "This month" : "Last month",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(v) => (v === "current" ? "This month" : "Last month")}
              iconSize={8}
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar dataKey="current" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent / Filtered Transactions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            {activeCategory
              ? `${getCategory(activeCategory, customCategories).icon} ${getCategory(activeCategory, customCategories).label} Transactions`
              : "Recent Transactions"}
          </h3>
        </div>
        {filteredTransactions.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            No transactions found.
          </p>
        ) : (
          <ul>
            {filteredTransactions.map((txn, i) => {
              const cat = getCategory(txn.category, customCategories);
              return (
                <li
                  key={txn.transactionId}
                  className={`flex items-center gap-3 px-4 py-3 ${i < filteredTransactions.length - 1 ? "border-b border-slate-50 dark:border-slate-800" : ""}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {txn.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cat.label} ·{" "}
                      {new Date(txn.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${txn.type === "income" ? "text-emerald-500" : "text-slate-800 dark:text-white"}`}
                  >
                    {txn.type === "income" ? "+" : "−"}
                    {formatCurrency(txn.amount, currency)}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
