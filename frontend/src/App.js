import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { paynestTheme } from "./theme/paynestTheme"; 


import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import LandingPage from "./components/LandingPage/LandingPage";
import Profile from "./pages/dashboard/Profile";
import DashboardLayout from "./components/layouts/DashboardLayout";

function App() {
  return (
    <ThemeProvider theme={paynestTheme}>
     
      <CssBaseline />
      
      <Router>
        <Routes>
     
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard" element={<DashboardLayout />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;