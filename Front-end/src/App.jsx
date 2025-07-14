import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import AuthPage from "./Pages/AuthPage";
import ProfileCompletionPage from "./Pages/ProfileCompletionPage";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import DashboardPage from "./Pages/DashboardPage";
import TransactionPage from "./Pages/TransactionPage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import ProfilePage from "./Pages/ProfilePage";
import BudgetPage from "./Pages/BudgetPage";
import NotFoundPage from "./Pages/NotFoundPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile-completion" element={<ProfileCompletionPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="budget" element={<BudgetPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
