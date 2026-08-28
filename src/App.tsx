import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { ClientProtectedRoute } from "./components/ClientProtectedRoute";
import { OnboardingGuard } from "./components/OnboardingGuard";
import { RequireFeature } from "./components/RequireFeature";
import { BillingGuard } from "./components/BillingGuard";
import { RequireOwner } from "./components/RequireOwner";
import { RequireBusinessRoles } from "./components/RequireBusinessRoles";
import { AppRouteLoader } from "./components/AppRouteLoader";
import { ScrollToTop } from "./components/ScrollToTop";
import { ScrollToTopButton } from "./components/ScrollToTopButton";
import { RouteSeo } from "./components/RouteSeo";

const Index = lazy(() => import("./pages/Index"));
const BusinessLanding = lazy(() => import("./pages/BusinessLanding"));
const Login = lazy(() => import("./pages/Login"));
const ClientLogin = lazy(() => import("./pages/ClientLogin"));
const ClientRegister = lazy(() => import("./pages/ClientRegister"));
const ClientCabinet = lazy(() => import("./pages/ClientCabinet"));
const ClientVerifyEmail = lazy(() => import("./pages/ClientVerifyEmail"));
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
const RequireAdminRole = lazy(() => import("./admin/components/RequireAdminRole"));
const BusinessDetails = lazy(() => import("./admin/pages/BusinessDetails"));
const AdminBusinessesPage = lazy(() => import("./admin/pages/AdminBusinesses"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminAdmins = lazy(() => import("./admin/pages/AdminAdmins"));
const AdminLogs = lazy(() => import("./admin/pages/AdminLogs"));
const AdminPlans = lazy(() => import("./admin/pages/AdminPlans"));

export default function App() {
    const mockBankEnabled = String(import.meta.env.VITE_ENABLE_MOCK_BANK ?? import.meta.env.DEV).toLowerCase() === "true";

    return (
        <Suspense fallback={<AppRouteLoader />}>
            <ScrollToTop />
            <ScrollToTopButton />
            <RouteSeo />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/business" element={<BusinessLanding />} />
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
                {mockBankEnabled ? <Route path="/mock-bank/idbank" element={<MockBankIdBank />} /> : null}
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
                        <Route index element={<Navigate to="/admin/businesses" replace />} />
                        <Route path="dashboard" element={<RequireAdminRole roles={["super_admin"]}><AdminDashboard /></RequireAdminRole>} />
                        <Route path="businesses" element={<AdminBusinessesPage />} />
                        <Route path="businesses/:id" element={<RequireAdminRole roles={["super_admin"]}><BusinessDetails /></RequireAdminRole>} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="admins" element={<RequireAdminRole roles={["super_admin"]}><AdminAdmins /></RequireAdminRole>} />
                        <Route path="logs" element={<RequireAdminRole roles={["super_admin"]}><AdminLogs /></RequireAdminRole>} />
                        <Route path="plans" element={<RequireAdminRole roles={["super_admin"]}><AdminPlans /></RequireAdminRole>} />
                    </Route>
                </Route>

                <Route element={<ClientProtectedRoute />}>
                    <Route path="/client/cabinet" element={<ClientCabinet />} />
                    <Route path="/client/verify-email/:id/:hash" element={<ClientVerifyEmail />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<OnboardingGuard />}>
                        <Route element={<BillingGuard />}>
                            <Route path="/app" element={<AppLayout />}>
                                <Route index element={<Navigate to="/app/dashboard" replace />} />
                                <Route path="dashboard" element={<Dashboard />} />
                                <Route path="calendar" element={<Calendar />} />
                                <Route path="services" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><Services /></RequireBusinessRoles>} />
                                <Route path="staff" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><Staff /></RequireBusinessRoles>} />
                                <Route path="clients" element={<Clients />} />
                                <Route path="tasks" element={<RequireFeature feature="tasks"><Tasks /></RequireFeature>} />
                                <Route path="analytics" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><RequireFeature feature="analytics"><Analytics /></RequireFeature></RequireBusinessRoles>} />
                                <Route path="gift-cards" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><RequireFeature feature="gift_cards"><GiftCards /></RequireFeature></RequireBusinessRoles>} />
                                <Route path="loyalty" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><RequireFeature feature="loyalty"><Loyalty /></RequireFeature></RequireBusinessRoles>} />
                                <Route path="settings" element={<RequireBusinessRoles roles={["owner", "manager", "super_admin"]}><BusinessSettings /></RequireBusinessRoles>} />
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
