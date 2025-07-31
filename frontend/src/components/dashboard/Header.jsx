import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    InputBase,
    Badge,
    useMediaQuery,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    "&:hover": { backgroundColor: alpha(theme.palette.common.white, 0.25) },
    marginLeft: theme.spacing(2),
    width: "100%",
    maxWidth: 450,
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
    color: "inherit",
    width: "100%",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1.6, 1, 1.6, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        fontSize: "1.1rem",
    },
}));

const CustomToggle = () => {
    const [checked, setChecked] = useState(true);
    const navigate = useNavigate();

    const handleToggle = () => {
        if (checked) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
        } else {
            navigate("/login");
        }
        setChecked(!checked);
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            onClick={handleToggle}
            sx={{ cursor: "pointer", userSelect: "none" }}
        >
            <Box
                sx={{
                    width: 65,
                    height: 32,
                    bgcolor: checked ? "#3f51b5" : "#bbb",
                    borderRadius: 20,
                    px: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: checked ? "flex-end" : "flex-start",
                    transition: "all 0.3s ease",
                }}
            >
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "white",
                        borderRadius: "50%",
                        boxShadow: "0px 2px 6px rgba(0,0,0,0.3)",
                        transition: "transform 0.3s ease",
                    }}
                />
            </Box>
            <Typography sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}>
                {checked ? "Logout" : "Login"}
            </Typography>
        </Box>
    );
};

function Header() {
    const [showSearch, setShowSearch] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    const user = { name: "John Doe", avatar: "" };

    const getInitials = (name) => {
        const parts = name.trim().split(" ");
        return parts.length >= 2 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    };

    // ✅ Text Animation for Slogan
    const slogan = "Smart Homes, Smarter Payments.";
    const sloganLetters = slogan.split("");

    return (
        <AppBar
            position="fixed"
            sx={{
                backgroundColor: "#1E3A8A",
                px: { xs: 2, sm: 3 },
                boxShadow: "0px 4px 10px rgba(0,0,0,0.3)",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    minHeight: "130px",
                }}
            >
                {/* ✅ Logo + App Name + Slogan */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        {/* ✅ Animated Logo */}
                        <motion.div
                            initial={{ y: -100 }}
                            animate={{ y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                            }}
                            style={{
                                background: "linear-gradient(135deg, #2563EB, #1E3A8A)",
                                padding: "8px",
                                borderRadius: "12px",
                                boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                            }}
                        >
                            <img
                                src={logoUrl}
                                alt="PayNest Logo"
                                style={{ height: 50, width: 50, objectFit: "contain" }}
                            />
                        </motion.div>

                        {!isMobile && (
                            <Box>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: "bold",
                                        letterSpacing: 1,
                                        color: "#FFFFFF",
                                    }}
                                >
                                    PayNest
                                </Typography>

                                {/* ✅ Animated Slogan (Typewriter Effect) */}
                                <Box display="flex" flexWrap="wrap">
                                    {sloganLetters.map((char, index) => (
                                        <motion.span
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            style={{
                                                fontSize: "1.1rem",
                                                fontStyle: "italic",
                                                color: "#F1F5F9",
                                                fontWeight: 500,
                                            }}
                                        >
                                            {char}
                                        </motion.span>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                </motion.div>

                {/* ✅ Collapsible Search */}
                {showSearch && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon sx={{ fontSize: 32 }} />
                            </SearchIconWrapper>
                            <StyledInputBase placeholder="Search…" />
                        </Search>
                    </motion.div>
                )}

                {/* ✅ Right Section */}
                <Box display="flex" alignItems="center" gap={isMobile ? 1.5 : 3}>
                    <motion.div whileHover={{ scale: 1.2 }}>
                        <IconButton color="inherit" onClick={() => setShowSearch(!showSearch)}>
                            <SearchIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.2 }}>
                        <IconButton color="inherit">
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon sx={{ fontSize: 32 }} />
                            </Badge>
                        </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.1 }}>
                        <Avatar
                            alt={user.name}
                            src={user.avatar}
                            sx={{
                                width: 55,
                                height: 55,
                                bgcolor: "#ffffff",
                                color: "#1E3A8A",
                                fontWeight: "bold",
                                fontSize: "1.4rem",
                            }}
                        >
                            {!user.avatar && getInitials(user.name)}
                        </Avatar>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.2 }}>
                        <IconButton color="inherit">
                            <SettingsIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <CustomToggle />
                    </motion.div>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;
