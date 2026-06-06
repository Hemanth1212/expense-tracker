const CATEGORY_KEYWORDS = {
  food: ['food', 'lunch', 'dinner', 'breakfast', 'eat', 'meal', 'restaurant', 'coffee', 'cafe', 'pizza', 'burger', 'snack', 'groceries', 'grocery', 'diner'],
  transport: ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'bus', 'metro', 'train', 'transport', 'commute', 'parking', 'toll', 'ride'],
  utilities: ['electric', 'electricity', 'water', 'internet', 'phone', 'bill', 'utilities', 'utility', 'gas bill'],
  entertainment: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'entertainment', 'theatre', 'bar', 'club', 'streaming'],
  shopping: ['shopping', 'clothes', 'amazon', 'shop', 'buy', 'purchase', 'store', 'mall'],
  health: ['doctor', 'medicine', 'pharmacy', 'gym', 'health', 'medical', 'hospital', 'fitness', 'drug'],
  rent: ['rent', 'housing', 'mortgage', 'apartment', 'house'],
  subscriptions: ['subscription', 'subscribe', 'monthly', 'membership', 'plan'],
  education: ['book', 'course', 'school', 'college', 'tuition', 'education', 'class', 'learning'],
  income: ['salary', 'income', 'paycheck', 'paid', 'freelance', 'bonus', 'dividend', 'received', 'got paid'],
}

export const smartParse = (text) => {
  const lower = text.toLowerCase().trim()
  const result = { amount: null, category: 'other', description: text, type: 'expense', date: new Date().toISOString() }

  // Extract amount — supports: $25, 25$, 25.50, USD 25, etc.
  const amountMatch = lower.match(/(?:[$€£₹¥])\s*(\d+(?:\.\d{1,2})?)|(\d+(?:\.\d{1,2})?)\s*(?:[$€£₹¥]|usd|eur|gbp|inr)|^(\d+(?:\.\d{1,2})?)(?:\s|$)/)
  if (amountMatch) {
    result.amount = parseFloat(amountMatch[1] || amountMatch[2] || amountMatch[3])
  }

  // Detect income
  if (CATEGORY_KEYWORDS.income.some(kw => lower.includes(kw))) {
    result.type = 'income'
    result.category = 'income'
  } else {
    // Detect category
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (cat === 'income') continue
      if (keywords.some(kw => lower.includes(kw))) {
        result.category = cat
        break
      }
    }
  }

  // Extract relative date
  if (lower.includes('yesterday')) {
    const d = new Date()
    d.setDate(d.getDate() - 1)
    result.date = d.toISOString()
  } else if (lower.includes('today')) {
    result.date = new Date().toISOString()
  }

  // Clean description — remove amount tokens
  result.description = text
    .replace(/(?:[$€£₹¥]\s*\d+(?:\.\d{1,2})?|\d+(?:\.\d{1,2})?\s*[$€£₹¥]|\d+(?:\.\d{1,2})?\s*(?:usd|eur|gbp|inr))/gi, '')
    .replace(/\b(today|yesterday)\b/gi, '')
    .replace(/\s+for\s+/gi, ' ')
    .trim() || text

  return result
}
