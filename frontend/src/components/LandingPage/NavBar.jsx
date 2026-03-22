import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Typography, Box, IconButton, Tooltip,
  useMediaQuery, InputBase, Button, Container
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";

// Icons
import MenuIcon from "@mui/icons-material/Menu";
import HomeRepairServiceRoundedIcon from "@mui/icons-material/HomeRepairServiceRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";

const logoUrl = "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const BRAND = {
  magenta: "#D4124E",
  slate: "#0F172A",
  muted: "#64748B",
  glassBg: "rgba(255, 255, 255, 0.75)",
  insetDark: "rgba(0, 0, 0, 0.28)",  
  insetLight: "rgba(255, 255, 255, 1)", 
};



const GlassAppBar = styled(AppBar)(({ scrolled }) => ({
  background: BRAND.glassBg,
  backdropFilter: "blur(20px) saturate(180%)",
  borderBottom: `1px solid ${alpha(BRAND.slate, 0.08)}`,
  color: BRAND.slate,
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  height: scrolled ? "72px" : "90px",
  display: "flex",
  justifyContent: "center",
  boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.04)" : "none",
}));

const LogoText = styled(Typography)({
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 900, 
  fontSize: "1.75rem",
  letterSpacing: "-0.8px",
 
  background: `linear-gradient(135deg, ${BRAND.slate} 0%, ${BRAND.magenta} 50%, #8e0b35 100%)`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
 
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
  transition: "all 0.3s ease",
  "&:hover": {
    filter: `drop-shadow(0 4px 8px ${alpha(BRAND.magenta, 0.3)})`,
    transform: "scale(1.02)",
  }
});

const SloganText = styled(Typography)({
  fontFamily: "'Inter', sans-serif",
  fontSize: "0.85rem",
  fontWeight: 700, 
  color: BRAND.slate, 
  marginTop: "-2px",
  letterSpacing: "0.5px", 
  textTransform: "uppercase", 
  opacity: 0.85,
  
  textShadow: "0 1px 2px rgba(255,255,255,0.8)", 
});

const SearchContainer = styled("div")(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "240px",
  marginLeft: theme.spacing(2),
  borderRadius: "14px",
  background: "rgba(255, 255, 255, 0.2)", 
  backdropFilter: "blur(16px) saturate(200%)", 
  boxShadow: `
    inset 6px 6px 12px ${BRAND.insetDark}, 
    inset -3px -3px 8px ${BRAND.insetLight},
    inset 0px 0px 10px rgba(0, 0, 0, 0.05)
  `,
  border: "1px solid rgba(0, 0, 0, 0.08)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    background: "rgba(255, 255, 255, 0.35)",
    boxShadow: `
      inset 8px 8px 16px ${BRAND.insetDark}, 
      inset -4px -4px 10px ${BRAND.insetLight}
    `,
  },
  "&:focus-within": {
    background: "#fff",
    width: "300px",
    boxShadow: `0 12px 30px ${alpha(BRAND.magenta, 0.2)}, inset 1px 1px 3px ${BRAND.insetDark}`,
    border: `1px solid ${alpha(BRAND.magenta, 0.5)}`,
  },
}));

const SearchIconWrapper = styled("div")({
  padding: "0 12px",
  height: "100%",
  position: "absolute",
  display: "flex",
  alignItems: "center",
  pointerEvents: "none",
  color: BRAND.muted,
});

const StyledInputBase = styled(InputBase)({
  color: BRAND.slate,
  padding: "8px 12px 8px 42px",
  fontSize: "0.92rem",
  width: "100%",
  fontFamily: "'Inter', sans-serif",
  fontWeight: 600, 
  "& .MuiInputBase-input::placeholder": {
    color: alpha(BRAND.slate, 0.5),
    opacity: 1,
  },
});


const GlassIconBtn = styled(IconButton)(({ active }) => ({
  margin: "0 6px",
  width: 48,
  height: 48,
  borderRadius: "14px", 
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  

  background: `linear-gradient(135deg, ${BRAND.magenta} 0%, #9f0d3a 100%)`,
  color: "#fff",


  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: `
    0 8px 16px -4px rgba(0, 0, 0, 0.3), 
    0 4px 8px ${alpha(BRAND.magenta, 0.4)}, 
    inset 0 1px 1px rgba(255, 255, 255, 0.5)
  `,

  "&:hover": {
    transform: "translateY(-4px) scale(1.1)",
    background: `linear-gradient(135deg, #f01e6a 0%, ${BRAND.magenta} 100%)`,
    boxShadow: `0 12px 20px -5px rgba(0, 0, 0, 0.35), 0 6px 12px ${alpha(BRAND.magenta, 0.5)}`,
  },

  "&:active": {
    transform: "translateY(1px) scale(0.95)",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.1)",
  },

  "& .MuiSvgIcon-root": {
    fontSize: "1.4rem",
    filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
  },
}));


const AuthPill = styled(motion.create(Button))(({ theme }) => ({
  borderRadius: "50px",
  padding: "12px 28px", 
  fontWeight: 800,
  textTransform: "none",
  fontFamily: "'Inter', sans-serif",
  fontSize: "1rem",
  background: `linear-gradient(135deg, ${BRAND.magenta} 0%, #9f0d3a 100%)`,
  color: "#fff",
  border: "1px solid rgba(255, 255, 255, 0.4)",
  boxShadow: `
    0 12px 24px -6px rgba(0, 0, 0, 0.3),
    0 4px 12px ${alpha(BRAND.magenta, 0.5)},
    inset 0 2px 2px rgba(255, 255, 255, 0.5),
    inset 0 -2px 4px rgba(0, 0, 0, 0.2)
  `,
  transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  "&:hover": {
    transform: "translateY(-5px) scale(1.02)", 
    background: `linear-gradient(135deg, #f01e6a 0%, ${BRAND.magenta} 100%)`,
    boxShadow: `
      0 20px 35px -8px rgba(0, 0, 0, 0.35), 
      0 8px 20px ${alpha(BRAND.magenta, 0.4)},
      inset 0 2px 4px rgba(255, 255, 255, 0.6)
    `,
  },
  "&:active": {
    transform: "translateY(2px) scale(0.98)", 
    boxShadow: `0 4px 10px rgba(0, 0, 0, 0.2), inset 0 1px 4px rgba(0,0,0,0.3)`,
  },
  "& .MuiButton-startIcon": {
    marginRight: 12,
    "& svg": {
      fontSize: 24,
      filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
    }
  }
}));



const NavBar = () => {
  const isMobile = useMediaQuery("(max-width:960px)");
  const [scrolled, setScrolled] = useState(false);
  const [visibleText, setVisibleText] = useState("");
  const slogan = "Smart Homes, Smarter Payments.";
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i <= slogan.length) setVisibleText(slogan.substring(0, i++));
      else clearInterval(t);
    }, 70);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const navLinks = [
    { text: "Services", icon: <HomeRepairServiceRoundedIcon />, kind: "anchor", to: "features" },
    { text: "Support", icon: <SupportAgentRoundedIcon />, kind: "anchor", to: "feedback" },
  ];

  const handleNav = (link) => {
    if (link.kind === "route") {
      navigate(link.to);
      return;
    }
    const id = link.to;
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <GlassAppBar position="fixed" scrolled={scrolled} elevation={0}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: "space-between", px: { xs: 0 } }}>
          
          <Box display="flex" alignItems="center" gap={1.5} sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
            <motion.img 
              src={logoUrl} 
              alt="PayNest" 
              style={{ height: scrolled ? 40 : 50, transition: "0.4s" }} 
              whileHover={{ rotate: 5 }}
            />
            {!isMobile && (
              <Box sx={{ lineHeight: 1, display: 'flex', flexDirection: 'column' }}>
  <LogoText variant="h6">PayNest</LogoText>
  <SloganText>{visibleText}</SloganText>
</Box>
            )}
          </Box>

          {!isMobile && (
            <Box display="flex" alignItems="center">
              {navLinks.map((link) => {
                const isActive = link.kind === "route" 
                  ? location.pathname === link.to 
                  : location.pathname === "/" && window.location.hash === `#${link.to}`;
                return (
                  <Tooltip key={link.text} title={link.text} arrow>
                    <GlassIconBtn active={isActive} onClick={() => handleNav(link)}>
                      {link.icon}
                    </GlassIconBtn>
                  </Tooltip>
                );
              })}
              
              <SearchContainer>
                <SearchIconWrapper>
                  <SearchRoundedIcon sx={{ fontSize: 20 }} />
                </SearchIconWrapper>
                <StyledInputBase placeholder="Search ..." />
              </SearchContainer>
            </Box>
          )}

          <Box display="flex" alignItems="center" gap={1.5}>
            <AuthPill
              startIcon={<AccountCircleRoundedIcon />}
              onClick={() => navigate("/login")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get started
            </AuthPill>

            {isMobile && (
              <IconButton sx={{ color: BRAND.slate }}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>

        </Toolbar>
      </Container>
    </GlassAppBar>
  );
};

export default NavBar;