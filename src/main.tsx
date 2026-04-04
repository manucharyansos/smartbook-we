import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { ClientProtectedRoute } from "./components/ClientProtectedRoute";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { RequireFeature } from "./components/RequireFeature";
import { BillingGuard } from "./components/BillingGuard";
import { RequireOwner } from "./components/RequireOwner";
import { AppRouteLoader } from "./components/AppRouteLoader";
import { ScrollToTop } from "./components/ScrollToTop";

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientRegister = lazy(() => import("./pages/ClientRegister"));
const ClientCabinet = lazy(() => import("./pages/ClientCabinet"));
const SocialAuthCallback = lazy(() => import("./pages/SocialAuthCallback"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Register = lazy(() => import("./pages/Register"));
const PublicBooking = lazy(() => import("./pages/PublicBooking"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Features = lazy(() => import("./pages/Features"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Support = lazy(() => import("./pages/Support"));
const Faq = lazy(() => import("./pages/Faq"));
const Blog = lazy(() => import("./pages/Blog"));
const Press = lazy(() => import("./pages/Press"));
const Careers = lazy(() => import("./pages/Careers"));
const PublicBusinessProfile = lazy(() => import("./pages/PublicBusinessProfile"));
const PaymentReturn = lazy(() => import("./pages/PaymentReturn"));
const MockBankIdBank = lazy(() => import("./pages/MockBankIdBank"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Calendar = lazy(() => import("./pages/Calendar").then((m) => ({ default: m.Calendar })));
const Services = lazy(() => import("./pages/Services"));
const Staff = lazy(() => import("./pages/Staff"));
const Clients = lazy(() => import("./pages/Clients"));
const Tasks = lazy(() => import("./pages/Tasks"));
const BusinessSettings = lazy(() => import("./pages/BusinessSettings"));
const Billing = lazy(() => import("./pages/Billing"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const GiftCards = lazy(() => import("./pages/GiftCards").then((m) => ({ default: m.GiftCards })));
const Loyalty = lazy(() => import("./pages/Loyalty"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AppLayout = lazy(() => import("./layouts/AppLayout").then((m) => ({ default: m.AppLayout })));

const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminLayout = lazy(() => import("./admin/components/AdminLayout"));
const ProtectedAdminRoute = lazy(() => import("./admin/components/ProtectedAdminRoute"));
const BusinessDetails = lazy(() => import("./admin/pages/BusinessDetails"));
const AdminBusinessesPage = lazy(() => import("./admin/pages/AdminBusinesses"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminAdmins = lazy(() => import("./admin/pages/AdminAdmins"));
const AdminLogs = lazy(() => import("./admin/pages/AdminLogs"));
const AdminPlans = lazy(() => import("./admin/pages/AdminPlans"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// eslint-disable-next-line react-refresh/only-export-components
function RoutedApp() {
  return (
    <Suspense fallback={<AppRouteLoader />}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/business/login" element={<Navigate to="/login" replace />} />
        <Route path="/client/login" element={<ClientLogin />} />
        <Route path="/auth/social/callback" element={<SocialAuthCallback />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/business/register" element={<Navigate to="/register" replace />} />
        <Route path="/client/register" element={<ClientRegister />} />
        <Route path="/businesses/:slug" element={<PublicBusinessProfile />} />
        <Route path="/payment-return" element={<PaymentReturn />} />
        <Route path="/mock-bank/idbank" element={<MockBankIdBank />} />
        <Route path="/book/:slug" element={<PublicBooking />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/features" element={<Features />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/support" element={<Support />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/press" element={<Press />} />
        <Route path="/careers" element={<Careers />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="businesses" element={<AdminBusinessesPage />} />
            <Route path="businesses/:id" element={<BusinessDetails />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="admins" element={<AdminAdmins />} />
            <Route path="logs" element={<AdminLogs />} />
            <Route path="plans" element={<AdminPlans />} />
          </Route>
        </Route>

        <Route element={<ClientProtectedRoute />}>
          <Route path="/client/cabinet" element={<ClientCabinet />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingGuard />}>
            <Route element={<BillingGuard />}>
              <Route path="/app" element={<AppLayout />}>
                <Route index element={<Navigate to="/app/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="calendar" element={<Calendar />} />
                <Route path="services" element={<Services />} />
                <Route path="staff" element={<Staff />} />
                <Route path="clients" element={<Clients />} />
                <Route
                  path="tasks"
                  element={
                    <RequireFeature feature="tasks">
                      <Tasks />
                    </RequireFeature>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <RequireFeature feature="analytics">
                      <Analytics />
                    </RequireFeature>
                  }
                />
                <Route
                  path="gift-cards"
                  element={
                    <RequireFeature feature="gift_cards">
                      <GiftCards />
                    </RequireFeature>
                  }
                />
                <Route
                  path="loyalty"
                  element={
                    <RequireFeature feature="loyalty">
                      <Loyalty />
                    </RequireFeature>
                  }
                />
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="billing" element={<RequireOwner><Billing /></RequireOwner>} />
              </Route>
            </Route>

            <Route path="/app/onboarding" element={<Onboarding />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/*<BrowserRouter basename="/app">*/}
        <ScrollToTop />
        <RoutedApp />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
