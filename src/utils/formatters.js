import { CURRENCIES, CATEGORIES } from "../data/defaultData";

export const getCurrencySymbol = (code) => {
  return CURRENCIES.find((c) => c.code === code)?.symbol || code;
};

export const convertAmount = (amount, fromCurrency, toCurrency, rates = {}) => {
  if (fromCurrency === toCurrency) return amount;
  const fromRate = rates[fromCurrency] ?? 1;
  const toRate = rates[toCurrency] ?? 1;
  return (amount / fromRate) * toRate;
};

export const formatCurrency = (amount, currencyCode = "INR") => {
  const symbol = getCurrencySymbol(currencyCode);
  const isHighValue = ["INR", "JPY"].includes(currencyCode);
  const formatted = Math.abs(amount).toLocaleString("en-IN", {
    minimumFractionDigits: isHighValue ? 0 : 2,
    maximumFractionDigits: isHighValue ? 0 : 2,
  });
  return `${symbol}${formatted}`;
};

export const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export const getCategory = (categoryId, customCategories = []) => {
  return (
    customCategories.find((c) => c.id === categoryId) ||
    CATEGORIES.find((c) => c.id === categoryId) ||
    CATEGORIES[CATEGORIES.length - 1]
  );
};

export const getAllCategories = (customCategories = []) => {
  return [...CATEGORIES, ...customCategories];
};

export const getMonthLabel = (date = new Date()) => {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

export const isSameMonth = (isoString, referenceDate = new Date()) => {
  const d = new Date(isoString);
  return (
    d.getMonth() === referenceDate.getMonth() &&
    d.getFullYear() === referenceDate.getFullYear()
  );
};

export const getWeekOfMonth = (isoString) => {
  const d = new Date(isoString);
  return Math.ceil(d.getDate() / 7);
};
