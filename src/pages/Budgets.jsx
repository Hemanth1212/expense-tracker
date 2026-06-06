import { useState } from "react";
import { Plus, Trash2, Target } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "../context/AppContext";
import {
  formatCurrency,
  getCategory,
  getAllCategories,
} from "../utils/formatters";

export default function Budgets() {
  const { getBudgetUsage, upsertBudget, deleteBudget, data } = useApp();
  const currency = data.user.baseCurrency;
  const customCategories = data.customCategories || [];
  const budgets = getBudgetUsage();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ category: "food", limitAmount: "" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const expenseCategories = getAllCategories(customCategories).filter(
    (c) => c.id !== "income",
  );
  const usedCategories = budgets.map((b) => b.category);

  const openNew = () => {
    const available = expenseCategories.find(
      (c) => !usedCategories.includes(c.id),
    );
    setForm({ category: available?.id || "food", limitAmount: "" });
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({ category: b.category, limitAmount: String(b.limitAmount) });
    setEditingId(b.budgetId);
    setShowForm(true);
  };

  const handleSave = () => {
    const limit = parseFloat(form.limitAmount);
    if (!limit || limit <= 0) return;
    upsertBudget({
      budgetId: editingId || uuidv4(),
      category: form.category,
      limitAmount: limit,
    });
    setShowForm(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            Monthly Budgets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set limits per category
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 text-sm px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-all shadow-md shadow-sky-200 dark:shadow-sky-900"
        >
          <Plus size={16} /> New
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="font-semibold text-slate-800 dark:text-white text-sm">
            {editingId ? "Edit Budget" : "New Budget"}
          </h3>
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Category
            </label>
            <div className="grid grid-cols-4 gap-2 max-h-36 overflow-y-auto scrollbar-hide">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!editingId && usedCategories.includes(cat.id)}
                  onClick={() => setForm((f) => ({ ...f, category: cat.id }))}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-center transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                    form.category === cat.id
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
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Monthly Limit
            </label>
            <input
              type="number"
              inputMode="decimal"
              value={form.limitAmount}
              onChange={(e) =>
                setForm((f) => ({ ...f, limitAmount: e.target.value }))
              }
              placeholder="e.g. 500"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              Save Budget
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Budget List */}
      {budgets.length === 0 && !showForm ? (
        <div className="text-center py-16 space-y-3">
          <Target
            size={40}
            className="mx-auto text-slate-300 dark:text-slate-600"
          />
          <p className="text-slate-400 text-sm">No budgets set yet.</p>
          <button
            onClick={openNew}
            className="text-sm text-sky-500 font-semibold"
          >
            + Set your first budget
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((b) => {
            const cat = getCategory(b.category, customCategories);
            const barColor =
              b.status === "over"
                ? "bg-red-500"
                : b.status === "warning"
                  ? "bg-yellow-400"
                  : "bg-emerald-400";
            return (
              <div
                key={b.budgetId}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        {cat.label}
                      </p>
                      <p className="text-xs text-slate-400">
                        Monthly limit: {formatCurrency(b.limitAmount, currency)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {b.status !== "ok" && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${b.status === "over" ? "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400" : "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/40 dark:text-yellow-400"}`}
                      >
                        {b.status === "over" ? "🔴 Over" : "🟡 Warning"}
                      </span>
                    )}
                    <button
                      onClick={() => openEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors text-xs"
                    >
                      Edit
                    </button>
                    {confirmDelete === b.budgetId ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            deleteBudget(b.budgetId);
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
                        onClick={() => setConfirmDelete(b.budgetId)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>{formatCurrency(b.spent, currency)} spent</span>
                    <span className="font-semibold">
                      {Math.round(b.percentage)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${barColor}`}
                      style={{ width: `${Math.min(b.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
