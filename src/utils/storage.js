import { createDefaultData } from '../data/defaultData'

const STORAGE_KEY = 'expenseflow_data'

export const loadData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      const defaults = createDefaultData()
      saveData(defaults)
      return defaults
    }
    return JSON.parse(raw)
  } catch {
    const defaults = createDefaultData()
    saveData(defaults)
    return defaults
  }
}

export const saveData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save data:', e)
  }
}

export const clearData = () => {
  localStorage.removeItem(STORAGE_KEY)
}
