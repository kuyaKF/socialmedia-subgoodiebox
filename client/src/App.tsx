import { Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/admin/AdminLayout'
import { SiteLayout } from './components/SiteLayout'
import { AdminDashboardPage } from './pages/AdminDashboardPage'
import { AdminGoodieBoxOrdersPage } from './pages/AdminGoodieBoxOrdersPage'
import { AdminGroupsPage } from './pages/AdminGroupsPage'
import { BlogListPage } from './pages/BlogListPage'
import { BlogPostEditorPage } from './pages/BlogPostEditorPage'
import { BlogPostPage } from './pages/BlogPostPage'
import { FeedPage } from './pages/FeedPage'
import { GoodieBoxPage } from './pages/GoodieBoxPage'
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
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:id" element={<BlogPostPage />} />
        <Route path="/goodie-box" element={<GoodieBoxPage />} />
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="groups" element={<AdminGroupsPage />} />
        <Route path="groups/:groupId/feed" element={<GroupPage />} />
        <Route path="goodie-box-orders" element={<AdminGoodieBoxOrdersPage />} />
        <Route path="blog/new" element={<BlogPostEditorPage />} />
        <Route path="blog/:id/edit" element={<BlogPostEditorPage />} />
      </Route>
    </Routes>
  )
}

export default App
