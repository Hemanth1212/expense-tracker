import { useState, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { loadData, saveData } from "../utils/storage";
import { isSameMonth } from "../utils/formatters";

const applyRecurringIfNeeded = (storedData) => {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const lastApplied = localStorage.getItem("recurring_applied");
  if (lastApplied === monthKey) return storedData;

  const recurring = storedData.recurringExpenses || [];
  if (recurring.length === 0) return storedData;

  const newTxns = recurring.map((r) => ({
    transactionId: uuidv4(),
    amount: r.amount,
    type: r.type || "expense",
    category: r.category,
    timestamp: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
    description: `${r.description} (Auto)`,
    isRecurring: true,
  }));

  localStorage.setItem("recurring_applied", monthKey);
  return {
    ...storedData,
    transactions: [...storedData.transactions, ...newTxns],
  };
};

export const useStore = () => {
  const [data, setData] = useState(() => applyRecurringIfNeeded(loadData()));

  useEffect(() => {
    saveData(data);
  }, [data]);

  const addTransaction = useCallback((txn) => {
    const newTxn = {
      transactionId: uuidv4(),
      timestamp: new Date().toISOString(),
      isRecurring: false,
      ...txn,
    };
    setData((prev) => ({
      ...prev,
      transactions: [newTxn, ...prev.transactions],
    }));
    return newTxn;
  }, []);

  const deleteTransaction = useCallback((transactionId) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(
        (t) => t.transactionId !== transactionId,
      ),
    }));
  }, []);

  const updateTransaction = useCallback((transactionId, updates) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map((t) =>
        t.transactionId === transactionId ? { ...t, ...updates } : t,
      ),
    }));
  }, []);

  const upsertBudget = useCallback((budget) => {
    setData((prev) => {
      const exists = prev.budgets.find((b) => b.budgetId === budget.budgetId);
      if (exists) {
        return {
          ...prev,
          budgets: prev.budgets.map((b) =>
            b.budgetId === budget.budgetId ? { ...b, ...budget } : b,
          ),
        };
      }
      return {
        ...prev,
        budgets: [
          ...prev.budgets,
          { budgetId: uuidv4(), period: "monthly", ...budget },
        ],
      };
    });
  }, []);

  const deleteBudget = useCallback((budgetId) => {
    setData((prev) => ({
      ...prev,
      budgets: prev.budgets.filter((b) => b.budgetId !== budgetId),
    }));
  }, []);

  const upsertRecurring = useCallback((rec) => {
    setData((prev) => {
      const list = prev.recurringExpenses || [];
      const exists = list.find((r) => r.id === rec.id);
      if (exists) {
        return {
          ...prev,
          recurringExpenses: list.map((r) =>
            r.id === rec.id ? { ...r, ...rec } : r,
          ),
        };
      }
      return {
        ...prev,
        recurringExpenses: [...list, { id: uuidv4(), ...rec }],
      };
    });
  }, []);

  const deleteRecurring = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      recurringExpenses: (prev.recurringExpenses || []).filter(
        (r) => r.id !== id,
      ),
    }));
  }, []);

  const updateSettings = useCallback((updates) => {
    setData((prev) => ({ ...prev, user: { ...prev.user, ...updates } }));
  }, []);

  const updateExchangeRates = useCallback((rates) => {
    setData((prev) => ({
      ...prev,
      exchangeRates: { ...prev.exchangeRates, ...rates },
    }));
  }, []);

  const upsertCategory = useCallback((cat) => {
    setData((prev) => {
      const list = prev.customCategories || [];
      const exists = list.find((c) => c.id === cat.id);
      if (exists) {
        return {
          ...prev,
          customCategories: list.map((c) =>
            c.id === cat.id ? { ...c, ...cat } : c,
          ),
        };
      }
      return { ...prev, customCategories: [...list, { id: uuidv4(), ...cat }] };
    });
  }, []);

  const deleteCategory = useCallback((id) => {
    setData((prev) => ({
      ...prev,
      customCategories: (prev.customCategories || []).filter(
        (c) => c.id !== id,
      ),
    }));
  }, []);

  // Computed monthly stats for a given date
  const getMonthlyStats = useCallback(
    (referenceDate = new Date()) => {
      const monthTxns = data.transactions.filter((t) =>
        isSameMonth(t.timestamp, referenceDate),
      );
      const income = monthTxns
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
      const expenses = monthTxns
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
      return {
        income,
        expenses,
        balance: income - expenses,
        transactions: monthTxns,
      };
    },
    [data.transactions],
  );

  // Category breakdown for current month
  const getCategoryBreakdown = useCallback(
    (referenceDate = new Date()) => {
      const { transactions } = getMonthlyStats(referenceDate);
      const expenseTxns = transactions.filter((t) => t.type === "expense");
      const map = {};
      expenseTxns.forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
      return Object.entries(map).map(([category, amount]) => ({
        category,
        amount,
      }));
    },
    [getMonthlyStats],
  );

  // Weekly spending for current and previous month (for bar chart)
  const getWeeklyTrend = useCallback(() => {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const buildWeeks = (refDate) => {
      const txns = data.transactions.filter(
        (t) => isSameMonth(t.timestamp, refDate) && t.type === "expense",
      );
      const weeks = { "Wk 1": 0, "Wk 2": 0, "Wk 3": 0, "Wk 4": 0 };
      txns.forEach((t) => {
        const day = new Date(t.timestamp).getDate();
        const wk = `Wk ${Math.ceil(day / 7)}`;
        if (weeks[wk] !== undefined) weeks[wk] += t.amount;
      });
      return weeks;
    };

    const current = buildWeeks(now);
    const previous = buildWeeks(prev);

    return ["Wk 1", "Wk 2", "Wk 3", "Wk 4"].map((wk) => ({
      week: wk,
      current: current[wk],
      previous: previous[wk],
    }));
  }, [data.transactions]);

  // Budget usage for current month
  const getBudgetUsage = useCallback(() => {
    const breakdown = getCategoryBreakdown();
    return data.budgets.map((b) => {
      const spent =
        breakdown.find((c) => c.category === b.category)?.amount || 0;
      const pct = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;
      return {
        ...b,
        spent,
        percentage: Math.min(pct, 100),
        status: pct >= 100 ? "over" : pct >= 80 ? "warning" : "ok",
      };
    });
  }, [data.budgets, getCategoryBreakdown]);

  return {
    data,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    upsertBudget,
    deleteBudget,
    upsertRecurring,
    deleteRecurring,
    updateSettings,
    updateExchangeRates,
    upsertCategory,
    deleteCategory,
    getMonthlyStats,
    getCategoryBreakdown,
    getWeeklyTrend,
    getBudgetUsage,
  };
};
