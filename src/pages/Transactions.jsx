import { useState, useMemo } from "react";
import { Trash2, Search, SlidersHorizontal } from "lucide-react";
import { useApp } from "../context/AppContext";
import {
  formatCurrency,
  getCategory,
  getAllCategories,
} from "../utils/formatters";

const SORT_OPTIONS = [
  { id: "date_desc", label: "Newest first" },
  { id: "date_asc", label: "Oldest first" },
  { id: "amount_desc", label: "Highest amount" },
  { id: "amount_asc", label: "Lowest amount" },
];

export default function Transactions() {
  const { data, deleteTransaction } = useApp();
  const currency = data.user.baseCurrency;
  const customCategories = data.customCategories || [];
  const allCategories = getAllCategories(customCategories);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    let list = [...data.transactions];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.description?.toLowerCase().includes(q) ||
          t.category?.toLowerCase().includes(q),
      );
    }
    if (filterType !== "all") list = list.filter((t) => t.type === filterType);
    if (filterCategory !== "all")
      list = list.filter((t) => t.category === filterCategory);

    list.sort((a, b) => {
      if (sortBy === "date_desc")
        return new Date(b.timestamp) - new Date(a.timestamp);
      if (sortBy === "date_asc")
        return new Date(a.timestamp) - new Date(b.timestamp);
      if (sortBy === "amount_desc") return b.amount - a.amount;
      if (sortBy === "amount_asc") return a.amount - b.amount;
      return 0;
    });

    return list;
  }, [data.transactions, search, filterType, filterCategory, sortBy]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach((t) => {
      const day = new Date(t.timestamp).toDateString();
      if (!groups[day]) groups[day] = [];
      groups[day].push(t);
    });
    return Object.entries(groups);
  }, [filtered]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Transactions
        </h1>
        <button
          onClick={() => setShowFilters((f) => !f)}
          className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border transition-all ${showFilters ? "bg-sky-50 border-sky-300 text-sky-600 dark:bg-sky-900/30 dark:border-sky-600 dark:text-sky-300" : "border-slate-200 dark:border-slate-700 text-slate-500"}`}
        >
          <SlidersHorizontal size={14} /> Filters
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search transactions..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex gap-2">
            {["all", "expense", "income"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${filterType === t ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCategory === "all" ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
            >
              All
            </button>
            {allCategories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filterCategory === c.id ? "bg-sky-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"}`}
              >
                {c.icon} {c.label.split("/")[0]}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Summary bar */}
      <div className="flex gap-3 text-xs">
        <span className="text-slate-500 dark:text-slate-400">
          {filtered.length} transactions
        </span>
        <span className="text-red-500 font-semibold">
          −
          {formatCurrency(
            filtered
              .filter((t) => t.type === "expense")
              .reduce((s, t) => s + t.amount, 0),
            currency,
          )}
        </span>
        <span className="text-emerald-500 font-semibold">
          +
          {formatCurrency(
            filtered
              .filter((t) => t.type === "income")
              .reduce((s, t) => s + t.amount, 0),
            currency,
          )}
        </span>
      </div>

      {/* Grouped list */}
      {grouped.length === 0 ? (
        <div className="text-center py-12 text-slate-400 text-sm">
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {grouped.map(([day, txns]) => (
            <div key={day} className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide px-1">
                {new Date(day).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {txns.map((txn, i) => {
                  const cat = getCategory(txn.category, customCategories);
                  return (
                    <div
                      key={txn.transactionId}
                      className={`flex items-center gap-3 px-4 py-3 ${i < txns.length - 1 ? "border-b border-slate-50 dark:border-slate-800" : ""}`}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: cat.color + "22" }}
                      >
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                          {txn.description}
                        </p>
                        <p className="text-xs text-slate-400">
                          {cat.label}
                          {txn.isRecurring ? " · 🔄 Recurring" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${txn.type === "income" ? "text-emerald-500" : "text-slate-800 dark:text-white"}`}
                        >
                          {txn.type === "income" ? "+" : "−"}
                          {formatCurrency(txn.amount, currency)}
                        </span>
                        {confirmDelete === txn.transactionId ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                deleteTransaction(txn.transactionId);
                                setConfirmDelete(null);
                              }}
                              className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg"
                            >
                              Del
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(txn.transactionId)}
                            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
