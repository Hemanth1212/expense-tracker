import { LayoutDashboard, List, Target, Settings, Plus } from 'lucide-react'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: List },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Layout({ page, setPage, onQuickAdd, children }) {
  return (
    <div className="flex flex-col min-h-screen max-w-2xl mx-auto relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">ExpenseFlow</span>
        </div>
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md shadow-sky-200 dark:shadow-sky-900 transition-all"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add
        </button>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-around py-2">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = page === id
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                  active
                    ? 'text-sky-500'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Floating Quick Add FAB (mobile, secondary) */}
      <button
        onClick={onQuickAdd}
        aria-label="Quick add transaction"
        className="fixed bottom-20 right-4 z-40 w-14 h-14 bg-sky-500 hover:bg-sky-600 active:scale-95 text-white rounded-full shadow-xl shadow-sky-300 dark:shadow-sky-900 flex items-center justify-center transition-all sm:hidden"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  )
}
