import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Tooltip,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    useMediaQuery,
    InputBase,
    Paper
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import HomeIcon from "@mui/icons-material/Home";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import SearchIcon from "@mui/icons-material/Search";
import ContactMailIcon from "@mui/icons-material/ContactMail";

const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const brandColors = ["#5A0953", "#D4124E", "#E8511E", "#FEAB2B"];

const GradientText = styled(Typography)(() => ({
    background: `linear-gradient(90deg, ${brandColors.join(", ")})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'Counter Stream', sans-serif",
}));

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    boxShadow: "inset 4px 4px 8px rgba(0,0,0,0.2), inset -4px -4px 8px rgba(255,255,255,0.3)",
    marginLeft: theme.spacing(2),
    width: "100%",
    maxWidth: 300,
    transition: "all 0.3s ease",
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

const NeumorphicPaper = styled(Paper)(() => ({
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    boxShadow: "8px 8px 16px rgba(0,0,0,0.25), -8px -8px 16px rgba(255,255,255,0.2)",
    padding: "8px",
}));

const NavBar = () => {
    const isMobile = useMediaQuery("(max-width:900px)");
    const slogan = "Smart Homes, Smarter Payments.";
    const [visibleText, setVisibleText] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            if (i <= slogan.length) {
                setVisibleText(slogan.substring(0, i));
                i++;
            } else {
                clearInterval(interval);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const AnimatedIconButton = motion(IconButton);

    const navLinks = [
        { text: "Home", icon: <HomeIcon />, path: "/" },
        { text: "Services", icon: <MiscellaneousServicesIcon />, path: "/services" },
        { text: "Contact", icon: <ContactMailIcon />, path: "/contact" },
    ];

    return (
        <AppBar
            position="absolute" // ✅ Change to absolute so it overlays hero section
            sx={{
                background: "transparent", // ✅ Make background transparent
                boxShadow: "none", // ✅ Remove shadow for now
                px: { xs: 2, sm: 3 },
                minHeight: scrolled ? "80px" : "110px",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Toolbar sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <motion.div whileHover={{ scale: 1.05 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <motion.div whileHover={{ rotate: 10 }}>
                            <img
                                src={logoUrl}
                                alt="PayNest Logo"
                                style={{ height: 50, width: 50, objectFit: "contain", cursor: "pointer" }}
                                onClick={() => navigate("/")}
                            />
                        </motion.div>

                        {!isMobile && (
                            <Box>
                                <GradientText variant="h4" sx={{ fontWeight: "bold", cursor: "pointer" }}>
                                    PayNest
                                </GradientText>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontSize: "1.1rem",
                                        fontStyle: "italic",
                                        color: "#fff",
                                        fontFamily: "'Counter Stream', sans-serif",
                                    }}
                                >
                                    {visibleText}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </motion.div>

                {!isMobile && (
                    <Box display="flex" alignItems="center" gap={3}>
                        {navLinks.map((link) => (
                            <motion.div whileHover={{ scale: 1.1 }} key={link.text}>
                                <Typography
                                    onClick={() => navigate(link.path)}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        cursor: "pointer",
                                        color: "#fff",
                                        fontFamily: "'Counter Stream', sans-serif",
                                        fontWeight: 600,
                                    }}
                                >
                                    {link.icon} {link.text}
                                </Typography>
                            </motion.div>
                        ))}

                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon sx={{ color: "white" }} />
                            </SearchIconWrapper>
                            <StyledInputBase placeholder="Search…" />
                        </Search>
                    </Box>
                )}

                {isMobile ? (
                    <IconButton onClick={() => setDrawerOpen(true)}>
                        <MenuIcon sx={{ color: "white" }} />
                    </IconButton>
                ) : (
                    <Box display="flex" gap={2}>
                        {[{ icon: <LoginIcon />, path: "/login" }, { icon: <PersonAddIcon />, path: "/register" }].map(
                            (btn, i) => (
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
                                            color: i === 0 ? "#06b6d4" : "#10b981",
                                            p: 1.5,
                                            borderRadius: "50%",
                                        }}
                                    >
                                        {btn.icon}
                                    </AnimatedIconButton>
                                </Tooltip>
                            )
                        )}
                    </Box>
                )}

                <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
                    <Box sx={{ width: 260, p: 2 }}>
                        <NeumorphicPaper>
                            <List>
                                {navLinks.map((item) => (
                                    <ListItem key={item.text} disablePadding>
                                        <ListItemButton
                                            onClick={() => navigate(item.path)}
                                            sx={{
                                                borderRadius: "12px",
                                                m: 0.5,
                                                boxShadow:
                                                    "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.3)",
                                            }}
                                        >
                                            <ListItemIcon>{item.icon}</ListItemIcon>
                                            <ListItemText
                                                primary={item.text}
                                                primaryTypographyProps={{ fontFamily: "'Counter Stream', sans-serif" }}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/login")}
                                        sx={{
                                            borderRadius: "12px",
                                            m: 0.5,
                                            boxShadow:
                                                "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        <ListItemIcon>
                                            <LoginIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Login"
                                            primaryTypographyProps={{ fontFamily: "'Counter Stream', sans-serif" }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        onClick={() => navigate("/register")}
                                        sx={{
                                            borderRadius: "12px",
                                            m: 0.5,
                                            boxShadow:
                                                "inset 2px 2px 5px rgba(0,0,0,0.2), inset -2px -2px 5px rgba(255,255,255,0.3)",
                                        }}
                                    >
                                        <ListItemIcon>
                                            <PersonAddIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Register"
                                            primaryTypographyProps={{ fontFamily: "'Counter Stream', sans-serif" }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </NeumorphicPaper>
                    </Box>
                </Drawer>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
