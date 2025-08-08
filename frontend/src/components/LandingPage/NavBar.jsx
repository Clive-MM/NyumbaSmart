// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Tooltip,
  useMediaQuery, InputBase
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HomeIcon from "@mui/icons-material/Home";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import SearchIcon from "@mui/icons-material/Search";
import ContactMailIcon from "@mui/icons-material/ContactMail";

const logoUrl =
  "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

// Brand tint colors for active icons
const brandTints = ["#FF0080", "#FF4DA6", "#FF4336", "#FFC22E", "#00B3FF"];

const GradientText = styled(Typography)({
  background: "linear-gradient(90deg,#5A0953,#D4124E,#E8511E,#FEAB2B)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: "'Counter Stream', sans-serif",
});

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  background: "rgba(255,255,255,0.25)",
  backdropFilter: "blur(8px)",
  boxShadow: "4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.3)",
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: 360,
}));
const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));
const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "#fff",
  width: "100%",
  fontFamily: "'Xillian', sans-serif",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: "1rem",
  },
}));

// Small glassy circle style (same as Login/Register)
const GlassCircle = styled(IconButton)(({ activecolor }) => ({
  background: "rgba(255, 255, 255, 0.25)",
  backdropFilter: "blur(8px)",
  boxShadow: "4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.3)",
  color: activecolor || "#fff",
  padding: 12,
  borderRadius: "50%",
  transition: "all 0.25s ease",
  "&:hover": {
    transform: "scale(1.15) rotate(5deg)",
  },
}));

const NavBar = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const slogan = "Smart Homes, Smarter Payments.";
  const [visibleText, setVisibleText] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i <= slogan.length) setVisibleText(slogan.substring(0, i++));
      else clearInterval(t);
    }, 100);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const AnimatedIconButton = motion(IconButton);

  const navLinks = [
    { text: "Home", icon: <HomeIcon />, path: "/" },
    { text: "Services", icon: <MiscellaneousServicesIcon />, path: "/services" },
    { text: "Contact", icon: <ContactMailIcon />, path: "/contact" },
  ];

  return (
    <AppBar
      position="absolute"
      sx={{
        background: "transparent",
        boxShadow: "none",
        px: { xs: 2, sm: 3 },
        minHeight: scrolled ? "80px" : "110px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
        {/* Logo + Slogan */}
        <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1, ml: 1 }}>
          <motion.div whileHover={{ rotate: 10 }}>
            <img
              src={logoUrl}
              alt="PayNest logo"
              style={{ height: 60, width: 60, objectFit: "contain", cursor: "pointer" }}
              onClick={() => navigate("/")}
            />
          </motion.div>
          {!isMobile && (
            <Box>
              <GradientText variant="h4" sx={{ fontWeight: "bold", cursor: "pointer", fontSize: "2rem" }}>
                PayNest
              </GradientText>
              <Typography
                variant="subtitle1"
                sx={{ fontSize: "1.2rem", fontStyle: "italic", color: "#fff", fontFamily: "'Counter Stream', sans-serif" }}
              >
                {visibleText}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Links + Search (desktop) */}
        {!isMobile && (
          <Box display="flex" alignItems="center" gap={2} sx={{ ml: 2 }}>
            {navLinks.map((link, i) => {
              const tint = brandTints[i % brandTints.length];
              const isActive = location.pathname === link.path;
              return (
                <Tooltip key={link.text} title={link.text}>
                  <GlassCircle
                    activecolor={isActive ? tint : "#fff"}
                    onClick={() => navigate(link.path)}
                  >
                    {link.icon}
                  </GlassCircle>
                </Tooltip>
              );
            })}
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: "white" }} />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} />
            </Search>
          </Box>
        )}

        {/* Login / Register or Mobile Menu */}
        {isMobile ? (
          <IconButton onClick={() => setDrawerOpen(true)} aria-label="open menu">
            <MenuIcon sx={{ color: "white" }} />
          </IconButton>
        ) : (
          <Box display="flex" gap={2} sx={{ mr: 1 }}>
            {[{ icon: <LoginIcon />, path: "/login", color: "#00B3FF" },
              { icon: <PersonAddIcon />, path: "/register", color: "#10b981" }].map((btn, i) => (
              <Tooltip key={i} title={btn.path === "/login" ? "Login" : "Register"}>
                <AnimatedIconButton
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate(btn.path)}
                  sx={{
                    background: "rgba(255, 255, 255, 0.25)",
                    backdropFilter: "blur(8px)",
                    boxShadow:
                      "4px 4px 10px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.3)",
                    color: btn.color,
                    p: 1.5,
                    borderRadius: "50%",
                  }}
                >
                  {btn.icon}
                </AnimatedIconButton>
              </Tooltip>
            ))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
