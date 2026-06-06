import { useState } from "react";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Budgets from "./pages/Budgets";
import Settings from "./pages/Settings";
import QuickAddModal from "./components/QuickAddModal";

function App() {
  const [page, setPage] = useState("dashboard");
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const pages = {
    dashboard: Dashboard,
    transactions: Transactions,
    budgets: Budgets,
    settings: Settings,
  };
  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Layout
        page={page}
        setPage={setPage}
        onQuickAdd={() => setShowQuickAdd(true)}
      >
        <PageComponent />
      </Layout>
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}
    </div>
  );
}

export default App;
