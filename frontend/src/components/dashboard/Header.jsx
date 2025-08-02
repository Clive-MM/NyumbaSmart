import React, { useState, useEffect } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Box,
    Badge,
    useMediaQuery,
    InputBase,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import SettingsIcon from "@mui/icons-material/Settings";
import { motion } from "framer-motion";

const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

const Search = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: "12px",
    background: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(12px)",
    "&:hover": { background: "rgba(255, 255, 255, 0.3)" },
    marginLeft: theme.spacing(2),
    width: "100%",
    maxWidth: 450,
    transition: "all 0.3s ease",
    boxShadow: "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
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
    "& .MuiInputBase-input": {
        padding: theme.spacing(1.5, 1, 1.5, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        fontSize: "1rem",
    },
}));

const CustomToggle = () => {
    const [checked] = useState(true);

    const handleToggle = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            gap={1.2}
            onClick={handleToggle}
            sx={{ cursor: "pointer", userSelect: "none" }}
        >
            <Box
                sx={{
                    width: 65,
                    height: 32,
                    bgcolor: checked ? "#456BBC" : "#bbb",
                    borderRadius: 20,
                    px: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: checked ? "flex-end" : "flex-start",
                    transition: "all 0.3s ease",
                    boxShadow:
                        "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
                }}
            >
                <Box
                    sx={{
                        width: 28,
                        height: 28,
                        bgcolor: "white",
                        borderRadius: "50%",
                        boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
                    }}
                />
            </Box>
            <Typography
                sx={{ color: "white", fontWeight: "bold", fontSize: "1rem" }}
            >
                Logout
            </Typography>
        </Box>
    );
};

export default function Header({ setActivePage }) {
    const [showSearch, setShowSearch] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    const user = { name: "John Doe", avatar: "" };
    const slogan = "Smart Homes, Smarter Payments.";
    const [visibleText, setVisibleText] = useState("");

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

    const HoverIcon = ({ icon, label, onClick }) => (
        <motion.div
            whileHover={{ y: -6, scale: 1.08 }}
            style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        >
            <IconButton
                sx={{
                    background: "rgba(255, 255, 255, 0.15)",
                    backdropFilter: "blur(10px)",
                    "&:hover": { background: "rgba(255, 255, 255, 0.3)" },
                }}
                onClick={onClick}
            >
                {icon}
            </IconButton>
            <motion.span
                initial={{ opacity: 0, y: 5 }}
                whileHover={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                    fontSize: "0.8rem",
                    color: "#E0E7FF",
                    fontWeight: 600,
                    marginTop: "-3px",
                    textShadow: "0px 0px 5px rgba(255,255,255,0.5)",
                }}
            >
                {label}
            </motion.span>
        </motion.div>
    );

    return (
        <AppBar
            position="fixed"
            sx={{
                background: "rgba(30, 58, 138, 0.85)",
                backdropFilter: "blur(12px)",
                px: { xs: 2, sm: 3 },
                boxShadow: "4px 4px 10px rgba(0,0,0,0.2)",
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    minHeight: "130px",
                }}
            >
                {/* ✅ Logo + Slogan */}
                <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                        <motion.div
                            initial={{ y: -80 }}
                            animate={{ y: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            whileHover={{ scale: 1.1 }}
                            style={{
                                background: "rgba(255, 255, 255, 0.25)",
                                padding: "8px",
                                borderRadius: "12px",
                                boxShadow:
                                    "inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff",
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
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: "bold",
                                            letterSpacing: 1.2,
                                            color: "white",
                                            textShadow: "0px 0px 10px rgba(255,255,255,0.8)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        PayNest
                                    </Typography>
                                </motion.div>

                                <motion.div>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{
                                            fontSize: "1.2rem",
                                            fontStyle: "italic",
                                            color: "#F1F5F9",
                                            textShadow: "0px 0px 6px rgba(255,255,255,0.6)",
                                            fontWeight: 500,
                                        }}
                                    >
                                        {visibleText}
                                    </Typography>
                                </motion.div>
                            </Box>
                        )}
                    </Box>
                </motion.div>

                {/* ✅ Search Bar */}
                {showSearch && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                        <Search>
                            <SearchIconWrapper>
                                <SearchIcon sx={{ fontSize: 28, color: "#fff" }} />
                            </SearchIconWrapper>
                            <StyledInputBase placeholder="Search…" />
                        </Search>
                    </motion.div>
                )}

                {/* ✅ Right Side Icons */}
                <Box display="flex" alignItems="center" gap={isMobile ? 1.5 : 3}>
                    <HoverIcon
                        icon={<SearchIcon sx={{ fontSize: 28, color: "#fff" }} />}
                        label="Search"
                        onClick={() => setShowSearch(!showSearch)}
                    />

                    <HoverIcon
                        icon={
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon sx={{ fontSize: 28, color: "#fff" }} />
                            </Badge>
                        }
                        label="Notifications"
                        onClick={() => setActivePage("notifications")}
                    />

                    <HoverIcon
                        icon={
                            <Avatar
                                alt={user.name}
                                src={user.avatar || ""}
                                sx={{
                                    width: 50,
                                    height: 50,
                                    bgcolor: "#fff",
                                    color: "#1E3A8A",
                                    fontWeight: "bold",
                                    fontSize: "1.3rem",
                                    cursor: "pointer",
                                }}
                                onClick={() => setActivePage("profile")}
                            />
                        }
                        label="Profile"
                    />

                    <HoverIcon
                        icon={<SettingsIcon sx={{ fontSize: 28, color: "#fff" }} />}
                        label="Settings"
                        onClick={() => setActivePage("settings")}
                    />

                    <motion.div whileHover={{ scale: 1.05 }}>
                        <CustomToggle />
                    </motion.div>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
