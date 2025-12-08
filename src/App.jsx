import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { BadgesProvider } from './context/BadgesContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Forum from './pages/Forum'
import TopicDetail from './pages/TopicDetail'
import Profiles from './pages/Profiles'
import ProfileDetail from './pages/ProfileDetail'
import Favorites from './pages/Favorites'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ChangePassword from './pages/ChangePassword'
import Dashboard from './pages/Dashboard'
import Notifications from './pages/Notifications'
import CreateArticle from './pages/CreateArticle'
import CreateTopic from './pages/CreateTopic'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Coaching from './pages/Coaching'
import Challenges from './pages/Challenges'
import ChallengeDetail from './pages/ChallengeDetail'
import Donations from './pages/Donations'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

function AppContent() {
  const location = useLocation()
  const isAuthPage = location.pathname === '/login' || 
                     location.pathname === '/signup' || 
                     location.pathname === '/forgot-password' ||
                     location.pathname === '/change-password'

  return (
    <div className="app">
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? 'auth-main' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/articles/create" element={<CreateArticle />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          <Route 
            path="/projects/create" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CreateArticle />
              </ProtectedRoute>
            } 
          />
          <Route path="/coaching" element={<Coaching />} />
          <Route path="/challenges" element={<Challenges />} />
          <Route path="/challenges/:id" element={<ChallengeDetail />} />
          <Route 
            path="/challenges/create" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CreateArticle />
              </ProtectedRoute>
            } 
          />
          <Route path="/forum" element={<Forum />} />
          <Route path="/forum/:id" element={<TopicDetail />} />
          <Route 
            path="/forum/create" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <CreateTopic />
              </ProtectedRoute>
            } 
          />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/profiles/:id" element={<ProfileDetail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/donations" element={<Donations />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                } 
              />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <BadgesProvider>
            <Router>
              <AppContent />
            </Router>
          </BadgesProvider>
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

