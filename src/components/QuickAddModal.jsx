import { useState, useRef, useEffect } from "react";
import { X, Wand2, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { smartParse } from "../utils/smartParser";
import {
  formatCurrency,
  getCurrencySymbol,
  getAllCategories,
} from "../utils/formatters";

const TYPE_TABS = [
  { id: "expense", label: "Expense" },
  { id: "income", label: "Income" },
];

export default function QuickAddModal({ onClose }) {
  const { addTransaction, data } = useApp();
  const currency = data.user.baseCurrency;

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [smartText, setSmartText] = useState("");
  const [smartMode, setSmartMode] = useState(false);
  const [parsed, setParsed] = useState(null);
  const [error, setError] = useState("");
  const amountRef = useRef(null);

  useEffect(() => {
    amountRef.current?.focus();
  }, []);

  const handleSmartParse = () => {
    if (!smartText.trim()) return;
    const result = smartParse(smartText);
    if (result.amount) {
      setAmount(String(result.amount));
      setCategory(result.category);
      setDescription(result.description);
      setType(result.type);
      setDate(result.date.split("T")[0]);
      setParsed(result);
    } else {
      setError(
        'Could not parse an amount. Try "25 for lunch" or "$50 groceries".',
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!num || num <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    addTransaction({
      amount: num,
      type,
      category,
      description: description || category,
      timestamp: new Date(date + "T12:00:00").toISOString(),
    });
    onClose();
  };

  const allCategories = getAllCategories(data.customCategories || []);
  const filteredCategories =
    type === "income"
      ? allCategories.filter((c) => c.id === "income" || c.id === "other")
      : allCategories.filter((c) => c.id !== "income");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl z-10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Add Transaction
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 pb-6 space-y-4">
          {/* Smart Parse Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSmartMode((m) => !m);
                setParsed(null);
                setError("");
              }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all ${smartMode ? "bg-violet-50 border-violet-300 text-violet-700 dark:bg-violet-900/30 dark:border-violet-600 dark:text-violet-300" : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"}`}
            >
              <Wand2 size={12} /> Smart Parse
            </button>
            {parsed && (
              <span className="text-xs text-emerald-500 font-medium">
                ✓ Parsed!
              </span>
            )}
          </div>

          {smartMode && (
            <div className="flex gap-2">
              <input
                value={smartText}
                onChange={(e) => {
                  setSmartText(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleSmartParse())
                }
                placeholder='e.g. "$25 for lunch today" or "10 gas"'
                className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <button
                type="button"
                onClick={handleSmartParse}
                className="px-3 py-2.5 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-sm font-medium transition-colors"
              >
                Parse
              </button>
            </div>
          )}

          {/* Type Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            {TYPE_TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setType(t.id);
                  setCategory(t.id === "income" ? "income" : "food");
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${type === t.id ? (t.id === "income" ? "bg-emerald-500 text-white shadow-sm" : "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm") : "text-slate-500 dark:text-slate-400"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Amount */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
              {getCurrencySymbol(data.user.baseCurrency)}
            </span>
            <input
              ref={amountRef}
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError("");
              }}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-4 text-3xl font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-300 focus:outline-none focus:border-sky-400 transition-colors"
            />
          </div>

          {/* Category Grid */}
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 block">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto scrollbar-hide">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-center transition-all ${
                    category === cat.id
                      ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30"
                      : "border-transparent bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span className="text-[9px] font-medium text-slate-600 dark:text-slate-300 leading-tight">
                    {cat.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Description + Date row */}
          <div className="flex gap-3">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400 w-36"
              />
              <ChevronDown
                size={14}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}

          <button
            type="submit"
            className={`w-full py-3.5 rounded-2xl text-base font-bold text-white transition-all shadow-lg ${
              type === "income"
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-emerald-900"
                : "bg-sky-500 hover:bg-sky-600 shadow-sky-200 dark:shadow-sky-900"
            }`}
          >
            {type === "income" ? "+ Add Income" : "− Add Expense"}
            {amount &&
              ` • ${formatCurrency(parseFloat(amount) || 0, currency)}`}
          </button>
        </form>
      </div>
    </div>
  );
}
