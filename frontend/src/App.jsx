import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import Footer from "./components/Footer";

import Homepage from "./pages/Home";
import Mentor from "./pages/Mentors";
import AIGuide from "./pages/AiGuide";
import Contact from "./pages/Contact";
import Companies from "./pages/Companies";
import StudentProjects from "./pages/Projects";
import CourseModulePage from "./pages/Courses";
import AboutPage from "./pages/About";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./components/HeroSection/ProtectedRoute";
import Dashboard from "./components/Dashboard";
import { CompanyAuthProvider } from "./context/CompanyAuthContext";
import CompanyLoginModal from "./components/CompanyLoginModal";

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Navbar />
      <LoginModal />
      <CompanyLoginModal/>

      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/mentors" element={<Mentor />} />
        <Route path="/aiguide" element={<AIGuide />} />
        <Route path="/projects" element={<StudentProjects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/courses" element={<CourseModulePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* Hide footer on aiguide page */}
      {location.pathname !== "/aiguide" && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyAuthProvider>
          <AppContent />
        </CompanyAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
