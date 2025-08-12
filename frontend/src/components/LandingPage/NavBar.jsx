// src/components/NavBar.jsx
import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Tooltip,
  useMediaQuery, InputBase, Button
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

const logoUrl =
  "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* Brand palette */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E", // default icon color
  red: "#FF3B3B",
  blue: "#2979FF",
  purple: "#7E00A6",
};

/* Hover gradient (requested mix) */
const hoverMix = "linear-gradient(90deg, #035A52, #D8E267, #BDF806)";

/* Helper css for gradient-colored icons/text */
const gradientTextCss = {
  background: hoverMix,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};

/* Brand wordmark */
const GradientText = styled(Typography)({
  background: "linear-gradient(90deg,#5A0953,#D4124E,#E8511E,#FEAB2B)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: "'Counter Stream', sans-serif",
});

/* Slogan (readable on white) */
const SloganText = styled(Typography)({
  background: "linear-gradient(90deg,#FF0080,#D4124E,#FF3B3B,#2979FF,#7E00A6)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  fontFamily: "'Counter Stream', sans-serif",
  fontStyle: "italic",
  fontWeight: 600,
});

/* Search styles (white chip) */
const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: 12,
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
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
  color: "#111827",
  width: "100%",
  fontFamily: "'Xillian', sans-serif",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.2, 1, 1.2, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    fontSize: "1rem",
  },
  "& .MuiInputBase-input::placeholder": {
    color: "rgba(17,24,39,0.55)",
  },
}));

/* Round icon buttons (white background friendly) */
const GlassCircle = styled(IconButton)(({ activecolor }) => ({
  background: "#fff",
  border: "1px solid rgba(0,0,0,0.06)",
  backdropFilter: "blur(8px)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.08)",
  color: activecolor || BRAND.magenta,
  padding: 12,
  borderRadius: "50%",
  transition: "all 0.25s ease",
  "&:hover": {
    transform: "scale(1.15) rotate(5deg)",
  },
  "&:hover .MuiSvgIcon-root": {
    ...gradientTextCss,
    color: "transparent",
  },
}));

/* New: Animated pill CTA (smaller on mobile via sx overrides) */
const AuthPill = styled(motion(Button))({
  borderRadius: 999,
  padding: "10px 18px",
  fontWeight: 800,
  textTransform: "none",
  letterSpacing: 0.3,
  color: "#fff",
  background: "linear-gradient(90deg, #D4124E, #E8511E, #FF0080, #456BBC)",
  boxShadow: "0 10px 22px rgba(0,0,0,0.18)",
  backdropFilter: "blur(6px)",
  outline: "none",
  "&:hover": {
    transform: "scale(1.06)",
    boxShadow: "0 16px 36px rgba(0,0,0,0.22)",
  },
  "&:focus-visible": {
    outline: "2px solid rgba(255,0,128,.6)",
    outlineOffset: "2px",
  },
});

const NavBar = () => {
  const isMobile = useMediaQuery("(max-width:900px)");
  const slogan = "Smart Homes, Smarter Payments.";
  const [visibleText, setVisibleText] = useState("");
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

  // Home = route; Services = #features; Contact = #feedback
  const navLinks = [
    { text: "Home", icon: <HomeIcon />, kind: "route", to: "/" },
    { text: "Services", icon: <HomeRepairServiceRoundedIcon />, kind: "anchor", to: "features" },
    { text: "Contact", icon: <SupportAgentRoundedIcon />, kind: "anchor", to: "feedback" },
  ];

  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNav = (link) => {
    if (link.kind === "route") {
      navigate(link.to);
      return;
    }
    const id = link.to;
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(() => scrollToId(id), 150);
    } else {
      scrollToId(id);
      if (window?.history?.replaceState) {
        window.history.replaceState(null, "", `#${id}`);
      }
    }
  };

  // gradient tooltip title node
  const tip = (label) => (
    <Typography sx={{ fontWeight: 700, ...gradientTextCss }}>
      {label}
    </Typography>
  );

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
              <SloganText variant="subtitle1" sx={{ fontSize: "1.05rem" }}>
                {visibleText}
              </SloganText>
            </Box>
          )}
        </Box>

        {/* Links + Search (desktop) */}
        {!isMobile && (
          <Box display="flex" alignItems="center" gap={2} sx={{ ml: 2 }}>
            {navLinks.map((link) => {
              const isActive =
                link.kind === "route"
                  ? location.pathname === link.to
                  : location.pathname === "/" && window.location.hash === `#${link.to}`;
              return (
                <Tooltip
                  key={link.text}
                  title={tip(link.text)}
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#fff",
                        border: "1px solid rgba(0,0,0,0.06)",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                      },
                    },
                  }}
                >
                  <GlassCircle
                    activecolor={isActive ? BRAND.magenta : undefined}
                    onClick={() => handleNav(link)}
                  >
                    {link.icon}
                  </GlassCircle>
                </Tooltip>
              );
            })}
            <Search>
              <SearchIconWrapper>
                <SearchIcon sx={{ color: BRAND.blue }} />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search…" inputProps={{ "aria-label": "search" }} />
            </Search>
          </Box>
        )}

        {/* Right side: Mobile menu + Auth pill (smaller on mobile), Desktop: Auth pill */}
        <Box display="flex" alignItems="center" gap={isMobile ? 1.5 : 2} sx={{ mr: 1 }}>
          {isMobile && (
            <IconButton aria-label="open menu">
              <MenuIcon sx={{ color: "#374151" }} />
            </IconButton>
          )}

          <AuthPill
            startIcon={<AccountCircleIcon />}
            onClick={() => navigate("/login")}
            aria-label="Login or Register"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.96 }}
            animate={{
              scale: [1, 1.035, 1],
              boxShadow: [
                "0 10px 22px rgba(0,0,0,0.18)",
                "0 12px 30px rgba(255, 0, 128, 0.25)",
                "0 10px 22px rgba(0,0,0,0.18)",
              ],
            }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            // Slightly smaller on mobile, same brand look
            sx={{
              px: isMobile ? 2 : 2.5,
              py: isMobile ? 0.75 : 1,
              fontSize: isMobile ? ".95rem" : "1rem",
            }}
          >
            Get started
          </AuthPill>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
