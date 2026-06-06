import { useState } from "react";
import { Plus, Trash2, Database, Tag } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/defaultData";
import { clearData } from "../utils/storage";

const PRESET_COLORS = [
  "#f97316",
  "#3b82f6",
  "#eab308",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#6366f1",
  "#14b8a6",
  "#f59e0b",
  "#22c55e",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#a855f7",
  "#64748b",
];

const PRESET_EMOJIS = [
  "🏋️",
  "🐾",
  "✈️",
  "🎮",
  "🎨",
  "🎵",
  "🏖️",
  "🍕",
  "☕",
  "🛒",
  "💇",
  "🚀",
  "🌿",
  "💼",
  "🏥",
  "🎓",
  "🔧",
  "🎁",
  "🏠",
  "⚽",
];

export default function Settings() {
  const {
    data,
    upsertRecurring,
    deleteRecurring,
    upsertCategory,
    deleteCategory,
  } = useApp();
  const currency = data.user.baseCurrency;
  const recurring = data.recurringExpenses || [];
  const customCategories = data.customCategories || [];

  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [recForm, setRecForm] = useState({
    description: "",
    amount: "",
    category: "rent",
    type: "expense",
  });

  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({
    label: "",
    icon: "🏷️",
    color: "#6366f1",
  });
  const [catError, setCatError] = useState("");
  const [confirmDeleteCat, setConfirmDeleteCat] = useState(null);

  const handleSaveCat = () => {
    if (!catForm.label.trim()) {
      setCatError("Name is required");
      return;
    }
    const id =
      catForm.label.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
    upsertCategory({
      id,
      label: catForm.label.trim(),
      icon: catForm.icon,
      color: catForm.color,
    });
    setCatForm({ label: "", icon: "🏷️", color: "#6366f1" });
    setCatError("");
    setShowCatForm(false);
  };
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveRecurring = () => {
    const amt = parseFloat(recForm.amount);
    if (!recForm.description.trim() || !amt || amt <= 0) return;
    upsertRecurring({ id: uuidv4(), ...recForm, amount: amt });
    setRecForm({
      description: "",
      amount: "",
      category: "rent",
      type: "expense",
    });
    setShowRecurringForm(false);
  };

  const handleReset = () => {
    clearData();
    window.location.reload();
  };

  const expenseCategories = CATEGORIES.filter((c) => c.id !== "income");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your preferences
        </p>
      </div>

      {/* Recurring Expenses */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              Recurring Expenses
            </h2>
            <p className="text-xs text-slate-400">
              Auto-added on the 1st of each month
            </p>
          </div>
          <button
            onClick={() => setShowRecurringForm((f) => !f)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {showRecurringForm && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/50">
            <input
              value={recForm.description}
              onChange={(e) =>
                setRecForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description (e.g. Netflix, Rent)"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <div className="flex gap-2">
              <input
                type="number"
                value={recForm.amount}
                onChange={(e) =>
                  setRecForm((f) => ({ ...f, amount: e.target.value }))
                }
                placeholder="Amount"
                className="flex-1 px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
              <select
                value={recForm.type}
                onChange={(e) =>
                  setRecForm((f) => ({ ...f, type: e.target.value }))
                }
                className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto scrollbar-hide">
              {expenseCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setRecForm((f) => ({ ...f, category: cat.id }))
                  }
                  className={`flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all ${
                    recForm.category === cat.id
                      ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30"
                      : "border-transparent bg-white dark:bg-slate-800"
                  }`}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="text-[8px] text-slate-500 dark:text-slate-400">
                    {cat.label.split(" ")[0]}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveRecurring}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowRecurringForm(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {recurring.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            No recurring expenses.
          </p>
        ) : (
          <ul>
            {recurring.map((r, i) => {
              const cat =
                CATEGORIES.find((c) => c.id === r.category) ||
                CATEGORIES[CATEGORIES.length - 1];
              return (
                <li
                  key={r.id}
                  className={`flex items-center gap-3 px-4 py-3 ${i < recurring.length - 1 ? "border-b border-slate-50 dark:border-slate-800" : ""}`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white truncate">
                      {r.description}
                    </p>
                    <p className="text-xs text-slate-400">
                      {cat.label} · 🔄 Monthly
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {r.type === "income" ? "+" : "−"}
                    {r.amount} {currency}
                  </span>
                  <button
                    onClick={() => deleteRecurring(r.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-300 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
            Data Management
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5">
            <Database size={14} />
            <span>
              All data stored locally in your browser via localStorage
            </span>
          </div>
          {confirmReset ? (
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Yes, reset everything
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="w-full py-2.5 border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl text-sm font-semibold transition-colors"
            >
              Reset All Data
            </button>
          )}
        </div>
      </div>

      {/* Custom Categories */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white">
              Custom Categories
            </h2>
            <p className="text-xs text-slate-400">
              Add your own spending categories
            </p>
          </div>
          <button
            onClick={() => {
              setShowCatForm((f) => !f);
              setCatError("");
            }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-full font-semibold transition-colors"
          >
            <Plus size={12} /> Add
          </button>
        </div>

        {showCatForm && (
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-800/50">
            <input
              value={catForm.label}
              onChange={(e) => {
                setCatForm((f) => ({ ...f, label: e.target.value }));
                setCatError("");
              }}
              placeholder="Category name (e.g. Gym, Travel)"
              className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            {catError && <p className="text-xs text-red-500">{catError}</p>}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Icon
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    onClick={() => setCatForm((f) => ({ ...f, icon: e }))}
                    className={`w-9 h-9 text-lg rounded-xl border-2 transition-all ${
                      catForm.icon === e
                        ? "border-sky-400 bg-sky-50 dark:bg-sky-900/30"
                        : "border-transparent bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                Color
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCatForm((f) => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full border-4 transition-all ${
                      catForm.color === c
                        ? "border-slate-400 dark:border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-xl">{catForm.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {catForm.label || "Preview"}
                </span>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: catForm.color }}
                />
              </div>
              <button
                onClick={handleSaveCat}
                className="flex-1 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowCatForm(false)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Built-in categories (read-only) */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Built-in
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {CATEGORIES.filter(
              (c) => c.id !== "income" && c.id !== "other",
            ).map((cat) => (
              <span
                key={cat.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                {cat.icon} {cat.label.split("/")[0]}
              </span>
            ))}
          </div>
        </div>

        {customCategories.length === 0 ? (
          <div className="flex items-center gap-2 px-4 py-4 text-slate-400 text-xs">
            <Tag size={14} />
            <span>No custom categories yet. Tap Add to create one.</span>
          </div>
        ) : (
          <div className="px-4 pb-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Custom
            </p>
            <div className="space-y-2">
              {customCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center gap-3 py-2 px-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="flex-1 text-sm font-medium text-slate-800 dark:text-white">
                    {cat.label}
                  </span>
                  {confirmDeleteCat === cat.id ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          deleteCategory(cat.id);
                          setConfirmDeleteCat(null);
                        }}
                        className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg"
                      >
                        Del
                      </button>
                      <button
                        onClick={() => setConfirmDeleteCat(null)}
                        className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteCat(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-slate-300 dark:text-slate-600 pb-2">
        ExpenseFlow Beta · Data stored locally
      </p>
    </div>
  );
}
