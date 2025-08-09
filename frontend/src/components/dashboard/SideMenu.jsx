// src/components/SideMenu.jsx
import React, { useEffect, useState } from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Tooltip,
    Divider,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";

/* ---------- Assets ---------- */
const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* ---------- Brand ---------- */
const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    red: "#FF3B3B",
    blue: "#2979FF",
    purple: "#7E00A6",
};
const GRADIENT = `linear-gradient(180deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;
const TEXT_GRADIENT = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

/* ---------- Public width constants (use these in the layout/header) ---------- */
export const SIDEBAR_EXPANDED = 240;
export const SIDEBAR_COLLAPSED = 80;

/* ---------- Styled ---------- */

/** Docked to the viewport (top-left), with rounded outer corners */
const SidebarWrap = styled(Box, { shouldForwardProp: (p) => p !== "isCollapsed" })(
    ({ isCollapsed }) => ({
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,

        background: "#0B1220",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "0 16px 16px 0",
        boxShadow: "8px 0 24px rgba(0,0,0,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",

        transition: "width .28s ease",
        zIndex: 10, // sits below the floating header (which should have a higher zIndex)
    })
);

const NavButton = styled(ListItemButton, { shouldForwardProp: (p) => p !== "active" })(
    ({ active }) => ({
        position: "relative",
        borderRadius: 12,
        padding: "12px 12px",
        margin: "4px 8px",
        color: "#E5E7EB",
        background: active ? "rgba(255,255,255,0.04)" : "transparent",
        "&:hover": { background: "rgba(255,255,255,0.06)" },
    })
);

const ActiveBar = styled(motion.span)({
    position: "absolute",
    left: 6,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 4,
    background: GRADIENT,
    boxShadow: "0 0 14px rgba(255,0,128,0.35)",
});

const iconSx = { color: "#F8FAFC", opacity: 0.9, fontSize: 22 };

const BrandName = styled(Typography)({
    fontWeight: 900,
    letterSpacing: 0.3,
    background: TEXT_GRADIENT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
});

/**
 * SideMenu
 * @param {{ setActivePage: (page: string) => void, onWidthChange?: (w:number)=>void }} props
 */
export default function SideMenu({ setActivePage, onWidthChange }) {
    const [activePage, setActive] = useState("dashboard");
    const [collapsed, setCollapsed] = useState(false);

    // Expose current width to parent (so header/main can animate/resize)
    useEffect(() => {
        onWidthChange?.(collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);
    }, [collapsed, onWidthChange]);

    const toggleCollapsed = () => setCollapsed((v) => !v);

    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon sx={iconSx} />, page: "dashboard" },
        { text: "Properties", icon: <HomeIcon sx={iconSx} />, page: "properties" },
        { text: "Tenants", icon: <PeopleIcon sx={iconSx} />, page: "tenants" },
        { text: "Billing", icon: <ReceiptIcon sx={iconSx} />, page: "billing" },
        { text: "Payments", icon: <PaymentIcon sx={iconSx} />, page: "payments" },
        { text: "Expenses", icon: <AttachMoneyIcon sx={iconSx} />, page: "expenses" },
        { text: "Reports", icon: <AssessmentIcon sx={iconSx} />, page: "reports" },
        { text: "History Logs", icon: <HistoryIcon sx={iconSx} />, page: "historylogs" },
    ];

    return (
        <SidebarWrap isCollapsed={collapsed}>
            {/* Brand header — also the collapse/expand toggle */}
            <Tooltip title={collapsed ? "Expand" : "Collapse"} arrow placement="right">
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={toggleCollapsed}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleCollapsed()}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.5,
                        py: 1.25,
                        mt: 1, // slight inset from the very top
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    <Box
                        component={motion.img}
                        whileHover={{ scale: 1.05, rotate: 2 }}
                        whileTap={{ scale: 0.96 }}
                        src={logoUrl}
                        alt="PayNest"
                        sx={{
                            width: 36,
                            height: 36,
                            objectFit: "contain",
                            borderRadius: 1,
                            background: "rgba(255,255,255,0.06)",
                            p: 0.5,
                            boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                            mx: collapsed ? "auto" : 0,
                        }}
                    />
                    {!collapsed && (
                        <BrandName variant="h6" sx={{ fontSize: 18 }}>
                            PayNest
                        </BrandName>
                    )}
                </Box>
            </Tooltip>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 1, my: 1 }} />

            {/* Navigation */}
            <List sx={{ py: 0 }}>
                {menuItems.map((item) => {
                    const active = activePage === item.page;

                    const button = (
                        <NavButton
                            active={active ? 1 : 0}
                            onClick={() => {
                                setActive(item.page);
                                setActivePage(item.page);
                            }}
                        >
                            {active && (
                                <ActiveBar
                                    layoutId="activeBar"
                                    initial={{ opacity: 0.6 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                                />
                            )}

                            <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>

                            {!collapsed && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: active ? "#FFFFFF" : "#E5E7EB",
                                    }}
                                />
                            )}
                        </NavButton>
                    );

                    return (
                        <Tooltip key={item.page} title={collapsed ? item.text : ""} placement="right" arrow>
                            <ListItem disablePadding>{button}</ListItem>
                        </Tooltip>
                    );
                })}
            </List>
        </SidebarWrap>
    );
}
