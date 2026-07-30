import { Route, Routes } from 'react-router-dom'
import { EmailVerificationBanner } from './components/EmailVerificationBanner'
import { Navbar } from './components/Navbar'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminGroupsPage } from './pages/AdminGroupsPage'
import { BlogListPage } from './pages/BlogListPage'
import { BlogPostEditorPage } from './pages/BlogPostEditorPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { FeedPage } from './pages/FeedPage'
import { GroupPage } from './pages/GroupPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PrivacyPage } from './pages/PrivacyPage'
import { ProfilePage } from './pages/ProfilePage'
import { RegisterPage } from './pages/RegisterPage'
import { SubscriptionPage } from './pages/SubscriptionPage'
import { TermsPage } from './pages/TermsPage'
import { VerifyEmailPage } from './pages/VerifyEmailPage'
import { ProtectedRoute, PublicOnlyRoute } from './routes/ProtectedRoute'

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <EmailVerificationBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoute>
              <FeedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/group"
          element={
            <ProtectedRoute>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscription"
          element={
            <ProtectedRoute roles={['user']}>
              <SubscriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminGroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/groups/:groupId/feed"
          element={
            <ProtectedRoute roles={['admin']}>
              <GroupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/new"
          element={
            <ProtectedRoute roles={['admin']}>
              <BlogPostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/blog/:id/edit"
          element={
            <ProtectedRoute roles={['admin']}>
              <BlogPostEditorPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
