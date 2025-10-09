import { Route, Routes } from "react-router-dom";
import LandingPage from "./Pages/LandingPage";
import AuthPage from "./Pages/AuthPage";
import ForgotPasswordPage from "./Pages/ForgotPasswordPage";
import ProfileCompletionPage from "./Pages/ProfileCompletionPage";
import OTPVerificationPage from "./Pages/OTPVerificationPage";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "./Layout";
import DashboardPage from "./Pages/DashboardPage";
import TransactionPage from "./Pages/TransactionPage";
import AnalyticsPage from "./Pages/AnalyticsPage";
import BudgetPage from "./Pages/BudgetsPage";
import ProfilePage from "./Pages/ProfilePage";
import NotFoundPage from "./Pages/NotFoundPage";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/profile-completion" element={<ProfileCompletionPage />} />
      <Route path="/otp-verification" element={<OTPVerificationPage />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="transactions" element={<TransactionPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="budgets" element={<BudgetPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
