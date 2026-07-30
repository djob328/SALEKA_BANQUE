import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import ChatWindow from './components/ChatBot/ChatWindow'

// Public pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyOTP from './pages/VerifyOTP'

// Client pages
import ClientDashboard from './pages/client/Dashboard'
import Profile from './pages/client/Profile'
import Account from './pages/client/Account'
import TransactionsHistory from './pages/client/TransactionsHistory'
import AccountApplication from './pages/client/AccountApplication'
import PreEnrollment from './pages/client/PreEnrollment'
import DocumentUpload from './pages/client/DocumentUpload'
import AppointmentBooking from './pages/client/AppointmentBooking'
import AccountSelection from './pages/client/AccountSelection'
import QueueStatus from './pages/client/QueueStatus'
import AgencyMap from './pages/client/AgencyMap'
import ElectronicSignature from './pages/client/ElectronicSignature'
import Accounts from './pages/client/Accounts'
import Transfers from './pages/client/Transfers'
import Cards from './pages/client/Cards'
import Credits from './pages/client/Credits'
import Savings from './pages/client/Savings'
import MobileMoney from './pages/client/MobileMoney'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ClientManagement from './pages/admin/ClientManagement'
import KYCVerification from './pages/admin/KYCVerification'
import AgencyManagement from './pages/admin/AgencyManagement'
import SecurityLogs from './pages/admin/SecurityLogs'
import AccountApplications from './pages/admin/AccountApplications'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatWindow />
        <Routes future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          {/* Public routes - without Layout */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Protected routes with Layout */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Client routes */}
            <Route path="/client/dashboard" element={
              <ProtectedRoute roles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/client/profile" element={
              <ProtectedRoute roles={['client']}>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/client/account" element={
              <ProtectedRoute roles={['client']}>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/client/transactions-history" element={
              <ProtectedRoute roles={['client']}>
                <TransactionsHistory />
              </ProtectedRoute>
            } />
            <Route path="/client/account-application" element={
              <ProtectedRoute roles={['client']}>
                <AccountApplication />
              </ProtectedRoute>
            } />
            <Route path="/client/pre-enrollment" element={
              <ProtectedRoute roles={['client']}>
                <PreEnrollment />
              </ProtectedRoute>
            } />
            <Route path="/client/documents" element={
              <ProtectedRoute roles={['client']}>
                <DocumentUpload />
              </ProtectedRoute>
            } />
            <Route path="/client/appointments" element={
              <ProtectedRoute roles={['client']}>
                <AppointmentBooking />
              </ProtectedRoute>
            } />
            <Route path="/client/account-selection" element={
              <ProtectedRoute roles={['client']}>
                <AccountSelection />
              </ProtectedRoute>
            } />
            <Route path="/client/queue" element={
              <ProtectedRoute roles={['client']}>
                <QueueStatus />
              </ProtectedRoute>
            } />
            <Route path="/client/agencies" element={
              <ProtectedRoute roles={['client']}>
                <AgencyMap />
              </ProtectedRoute>
            } />
            <Route path="/client/signature" element={
              <ProtectedRoute roles={['client']}>
                <ElectronicSignature />
              </ProtectedRoute>
            } />
            <Route path="/client/accounts" element={
              <ProtectedRoute roles={['client']}>
                <Accounts />
              </ProtectedRoute>
            } />
            <Route path="/client/transfers" element={
              <ProtectedRoute roles={['client']}>
                <Transfers />
              </ProtectedRoute>
            } />
            <Route path="/client/cards" element={
              <ProtectedRoute roles={['client']}>
                <Cards />
              </ProtectedRoute>
            } />
            <Route path="/client/credits" element={
              <ProtectedRoute roles={['client']}>
                <Credits />
              </ProtectedRoute>
            } />
            <Route path="/client/savings" element={
              <ProtectedRoute roles={['client']}>
                <Savings />
              </ProtectedRoute>
            } />
            <Route path="/client/mobile-money" element={
              <ProtectedRoute roles={['client']}>
                <MobileMoney />
              </ProtectedRoute>
            } />
            
            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute roles={['admin', 'super_admin', 'agent']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/clients" element={
              <ProtectedRoute roles={['admin', 'super_admin', 'agent']}>
                <ClientManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/kyc" element={
              <ProtectedRoute roles={['admin', 'super_admin', 'agent']}>
                <KYCVerification />
              </ProtectedRoute>
            } />
            <Route path="/admin/agencies" element={
              <ProtectedRoute roles={['admin', 'super_admin']}>
                <AgencyManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/security" element={
              <ProtectedRoute roles={['admin', 'super_admin']}>
                <SecurityLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/account-applications" element={
              <ProtectedRoute roles={['admin', 'super_admin', 'agent']}>
                <AccountApplications />
              </ProtectedRoute>
            } />
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
