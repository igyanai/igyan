import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoginModal from "./components/LoginModal";
import Homepage from "./pages/Home";
import Mentor from "./pages/Mentors";
import AIGuide from "./pages/AiGuide";
import Contact from "./pages/Contact";
import Companies from "./pages/Companies";
import StudentProjects from "./pages/Projects";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
// import Login from "./pages/auth/Login";
// import Signup from "./pages/auth/Signup";
import StudentDashboard from "./pages/Dashboard/StudentDashboard";
import CourseModulePage from "./pages/Courses";
import AboutPage from "./pages/About";
import UserDashboard from "./components/userDashboard";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <Navbar />
          <LoginModal />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/mentors" element={<Mentor />} />
            <Route path="/aiguide" element={<AIGuide />} />
            <Route path="/projects" element={<StudentProjects />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/courses" element={<CourseModulePage/>}/>
            <Route path="/about" element={<AboutPage />} />
            <Route path="/dashboard/student" element={<StudentDashboard />} />
            <Route path="/dashboard/me" element={<UserDashboard/>}/>
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
          {useLocation().pathname !== '/aiguide' && <Footer />}
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
