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

/* ---------------- Assets ---------------- */
const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* ---------------- Brand ---------------- */
const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    red: "#FF3B3B",
    blue: "#2979FF",
    purple: "#7E00A6",
};
const GRADIENT = `linear-gradient(180deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;
const TEXT_GRADIENT = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

/* ---------------- Public width constants (used by layout/header) ---------------- */
export const SIDEBAR_EXPANDED = 208; // slightly slimmer than before
export const SIDEBAR_COLLAPSED = 72;

/* ---------------- Helpers ---------------- */
const linkFont = `'Giaza Ginzel', 'Cinzel', 'Times New Roman', serif`;
// TIP: If you don’t have "Giaza Ginzel" locally, add a @font-face
// or swap to Cinzel for now in your global CSS.

/* ---------------- Styled ---------------- */

/** Docked to the viewport (top-left), with rounded outer corners + soft neumorphism */
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
        // Neumorphic depth: darker outer + subtle highlight
        boxShadow:
            "12px 12px 24px rgba(3,6,12,0.75), -10px -10px 24px rgba(32,44,72,0.08), inset 0 0 0 rgba(0,0,0,0)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",

        transition: "width .28s ease, box-shadow .28s ease, background .28s ease",
        zIndex: 10,
    })
);

const NavButton = styled(ListItemButton, {
    shouldForwardProp: (p) => p !== "active" && p !== "collapsed",
})(({ active, collapsed }) => ({
    position: "relative",
    borderRadius: 14,
    padding: collapsed ? "12px 12px" : "12px 12px",
    margin: "6px 10px",
    color: "#E5E7EB",
    background: active ? "rgba(255,255,255,0.035)" : "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    // Soft neumorphic inset on rest, lifted on hover
    boxShadow: active
        ? "inset 4px 4px 10px rgba(6,10,18,0.65), inset -4px -4px 10px rgba(28,40,68,0.08)"
        : "4px 4px 12px rgba(6,10,18,0.55), -4px -4px 12px rgba(28,40,68,0.06)",
    transition:
        "background .2s ease, box-shadow .2s ease, transform .08s ease, border-color .2s ease",

    "&:hover": {
        background: "rgba(255,255,255,0.05)",
        transform: "translateY(-1px)",
        boxShadow:
            "8px 8px 18px rgba(6,10,18,0.6), -6px -6px 16px rgba(28,40,68,0.08)",
    },

    // Gradient glow border on hover/active
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: 14,
        padding: "1px",
        background: active ? TEXT_GRADIENT : "transparent",
        WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        transition: "background .2s ease",
    },
    "&:hover::after": {
        background: TEXT_GRADIENT,
        boxShadow: "0 0 20px rgba(255,0,128,0.15)",
    },
}));

const ActiveBar = styled(motion.span)({
    position: "absolute",
    left: 6,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 4,
    background: GRADIENT,
    boxShadow: "0 0 16px rgba(255,0,128,0.35), 0 0 6px rgba(41,121,255,0.35)",
});

const iconSx = {
    color: "#F8FAFC",
    opacity: 0.92,
    fontSize: 22,
    transition: "transform .15s ease, opacity .2s ease",
};

const BrandName = styled(Typography)({
    fontWeight: 900,
    letterSpacing: 0.3,
    background: TEXT_GRADIENT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: linkFont,
});

/* ---------------- Component ---------------- */
/**
 * SideMenu
 * @param {{ setActivePage: (page: string) => void, onWidthChange?: (w:number)=>void, defaultPage?: string }} props
 */
export default function SideMenu({ setActivePage, onWidthChange, defaultPage = "dashboard" }) {
    const [activePage, setActive] = useState(defaultPage);
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
                        px: 1.25,
                        py: 1.1,
                        mt: 1,
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        cursor: "pointer",
                        userSelect: "none",
                    }}
                >
                    <Box
                        component={motion.img}
                        whileHover={{ scale: 1.06, rotate: 1 }}
                        whileTap={{ scale: 0.96 }}
                        src={logoUrl}
                        alt="PayNest"
                        sx={{
                            width: 34,
                            height: 34,
                            objectFit: "contain",
                            borderRadius: 8,
                            background: "rgba(255,255,255,0.06)",
                            p: 0.5,
                            boxShadow:
                                "6px 6px 14px rgba(6,10,18,0.55), -4px -4px 12px rgba(28,40,68,0.06)",
                            mx: collapsed ? "auto" : 0,
                        }}
                    />
                    {!collapsed && (
                        <BrandName variant="h6" sx={{ fontSize: 17 }}>
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
                            collapsed={collapsed ? 1 : 0}
                            active={active ? 1 : 0}
                            aria-current={active ? "page" : undefined}
                            onClick={() => {
                                setActive(item.page);
                                setActivePage(item.page);
                            }}
                            onMouseEnter={(e) => {
                                const icon = e.currentTarget.querySelector("svg");
                                if (icon) icon.style.transform = "scale(1.06)";
                            }}
                            onMouseLeave={(e) => {
                                const icon = e.currentTarget.querySelector("svg");
                                if (icon) icon.style.transform = "scale(1.0)";
                            }}
                        >
                            {active && (
                                <ActiveBar
                                    layoutId="activeBar"
                                    initial={{ opacity: 0.7 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                                />
                            )}

                            <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 0.5 }}>
                                {/* Icon inherits color; gradient tint on active */}
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        ...(active && {
                                            background: TEXT_GRADIENT,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }),
                                    }}
                                >
                                    {item.icon}
                                </Box>
                            </ListItemIcon>

                            {!collapsed && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: 14.5,
                                        fontWeight: 700,
                                        fontFamily: linkFont,
                                        letterSpacing: 0.2,
                                        lineHeight: 1.1,
                                        ...(active
                                            ? {
                                                background: TEXT_GRADIENT,
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                textShadow: "0 0 18px rgba(255,0,128,0.15)",
                                            }
                                            : { color: "#E5E7EB", opacity: 0.92 }),
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
