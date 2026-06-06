import { v4 as uuidv4 } from "uuid";

export const CATEGORIES = [
  { id: "food", label: "Food & Dining", icon: "🍔", color: "#f97316" },
  { id: "transport", label: "Transport", icon: "🚗", color: "#3b82f6" },
  { id: "utilities", label: "Utilities", icon: "⚡", color: "#eab308" },
  { id: "entertainment", label: "Entertainment", icon: "🎬", color: "#8b5cf6" },
  { id: "shopping", label: "Shopping", icon: "🛍️", color: "#ec4899" },
  { id: "health", label: "Health", icon: "💊", color: "#10b981" },
  { id: "rent", label: "Rent/Housing", icon: "🏠", color: "#6366f1" },
  { id: "subscriptions", label: "Subscriptions", icon: "📱", color: "#14b8a6" },
  { id: "education", label: "Education", icon: "📚", color: "#f59e0b" },
  { id: "income", label: "Income", icon: "💰", color: "#22c55e" },
  { id: "other", label: "Other", icon: "📦", color: "#94a3b8" },
];

export const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "CA$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
];

export const createDefaultData = () => ({
  user: {
    userId: uuidv4(),
    baseCurrency: "INR",
    createdAt: new Date().toISOString(),
  },
  transactions: [],
  budgets: [],
  recurringExpenses: [],
  exchangeRates: {
    USD: 1,
    EUR: 0.89,
    GBP: 0.76,
    INR: 95.39,
    JPY: 144.0,
    CAD: 1.38,
    AUD: 1.57,
    CHF: 0.88,
  },
});
