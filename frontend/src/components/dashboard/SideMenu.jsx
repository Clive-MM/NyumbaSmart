// src/dashboard/SideMenu.jsx
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
import { styled, alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";

/* -------- Public width constants (used by layout/header) -------- */
export const SIDEBAR_EXPANDED = 208;
export const SIDEBAR_COLLAPSED = 72;

/* -------- Fonts / brand -------- */
const linkFont = `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`;
const displayFont = `"Cinzel", ui-serif, Georgia, serif`;
const GRADIENT = "linear-gradient(90deg,#FF0080,#7E00A6)";
const logoUrl =
    "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* -------- Shell (glass + dark-neumorphism, no rounded outer corners) -------- */
const SidebarWrap = styled(Box, {
    shouldForwardProp: (p) => p !== "isCollapsed",
})(({ theme, isCollapsed }) => ({
    position: "fixed",
    inset: 0,
    right: "auto",
    width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED,

    background: theme.palette.background.paper, // #0e0a17 (theme)
    borderRight: `1px solid ${theme.palette.divider}`,
    borderRadius: 0,
    boxShadow: "12px 12px 28px rgba(0,0,0,.55), -8px -8px 20px rgba(255,255,255,.03)",
    backdropFilter: "saturate(120%) blur(6px)",

    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    zIndex: theme.zIndex.drawer,
    transition: "width .28s ease, box-shadow .28s ease, background .28s ease",

    // soft branded glow along the border
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        boxShadow:
            "inset 0 0 0 1px rgba(255,255,255,.04), 0 0 24px rgba(255,0,128,.06), 0 0 16px rgba(126,0,166,.05)",
    },
}));

/* -------- Navigation button (tight spacing + gradient ring on hover/active) -------- */
const NavButton = styled(ListItemButton, {
    shouldForwardProp: (p) => p !== "active" && p !== "collapsed",
})(({ theme, active }) => {
    const baseBg = alpha("#fff", 0.02);
    const hoverBg = alpha("#fff", 0.05);
    const actBg = alpha("#fff", 0.035);
    return {
        position: "relative",
        borderRadius: 12,
        padding: "11px 12px",
        margin: "5px 8px",
        color: theme.palette.text.primary,
        background: active ? actBg : baseBg,
        border: `1px solid ${alpha("#fff", 0.06)}`,
        boxShadow: active
            ? "inset 4px 4px 10px rgba(0,0,0,.55), inset -4px -4px 10px rgba(255,255,255,.03)"
            : "4px 4px 12px rgba(0,0,0,.35), -4px -4px 12px rgba(255,255,255,.03)",
        transition:
            "background .2s ease, box-shadow .2s ease, transform .08s ease, border-color .2s ease",

        "&:hover": {
            background: hoverBg,
            transform: "translateY(-1px)",
            boxShadow: "8px 8px 18px rgba(0,0,0,.5), -6px -6px 16px rgba(255,255,255,.04)",
        },

        // Branded glow ring (replaces vertical bar)
        "&::after": {
            content: '""',
            position: "absolute",
            inset: 0,
            borderRadius: 12,
            padding: "1px",
            background: active ? GRADIENT : "transparent",
            WebkitMask:
                "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            transition: "background .2s ease, box-shadow .2s ease",
            pointerEvents: "none",
        },
        "&:hover::after": {
            background: GRADIENT,
            boxShadow: "0 0 20px rgba(255,0,128,.18)",
        },
    };
});

const BrandName = styled(Typography)({
    fontWeight: 900,
    letterSpacing: 0.3,
    background: GRADIENT,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: displayFont,
    fontSize: 17,
});

/* -------- Footer pill (animated, branded, smart) -------- */
const FooterPill = styled(motion.button)(({ theme }) => ({
    width: "100%",
    borderRadius: 12,
    padding: "8px 10px",
    textAlign: "center",
    cursor: "pointer",
    color: "#fff",
    fontFamily: linkFont,
    fontWeight: 800,
    position: "relative",
    border: `1px solid ${alpha("#fff", 0.08)}`,
    background:
        "linear-gradient(90deg, rgba(255,0,128,.18), rgba(126,0,166,.18) 35%, rgba(41,121,255,.18) 70%, rgba(255,0,128,.18))",
    backgroundSize: "200% 100%",
    boxShadow: "inset 0 0 0 1px rgba(255,255,255,.04), 0 10px 24px rgba(0,0,0,.35)",
    overflow: "hidden",
    "&:before": {
        content: '""',
        position: "absolute",
        inset: -2,
        borderRadius: 14,
        background: "linear-gradient(90deg,#FF0080,#7E00A6,#2979FF,#FF3B3B,#FF0080)",
        filter: "blur(14px)",
        opacity: 0.14,
        pointerEvents: "none",
    },
}));

/* -------- Component -------- */
export default function SideMenu({
    setActivePage,
    onWidthChange,
    defaultPage = "dashboard",
}) {
    const theme = useTheme();
    const [activePage, setActive] = useState(defaultPage);
    const [collapsed, setCollapsed] = useState(false);

    // Footer smart behaviour
    const [copied, setCopied] = useState(false);
    const version = "v1.0";

    useEffect(() => {
        onWidthChange?.(collapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED);
    }, [collapsed, onWidthChange]);

    const toggleCollapsed = () => setCollapsed((v) => !v);

    const handleCopyVersion = async () => {
        try {
            await navigator.clipboard.writeText(`PayNest ${version}`);
            setCopied(true);
            setTimeout(() => setCopied(false), 1200);
        } catch (e) {
            console.error("Copy failed", e);
        }
    };

    const iconSx = {
        color: theme.palette.text.primary,
        opacity: 0.92,
        fontSize: 22,
        transition: "transform .15s ease, opacity .2s ease",
    };

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
            {/* Brand header / collapse toggle */}
            <Tooltip title={collapsed ? "Expand" : "Collapse"} arrow placement="right">
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={toggleCollapsed}
                    onKeyDown={(e) =>
                        (e.key === "Enter" || e.key === " ") && toggleCollapsed()
                    }
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.25,
                        px: 1.25,
                        py: 1.05,
                        mt: 0.75,
                        borderBottom: `1px solid ${theme.palette.divider}`,
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
                            width: 32,
                            height: 32,
                            objectFit: "contain",
                            borderRadius: 8,
                            background: alpha("#fff", 0.06),
                            p: 0.5,
                            boxShadow:
                                "6px 6px 14px rgba(0,0,0,.55), -4px -4px 12px rgba(255,255,255,.04)",
                            mx: collapsed ? "auto" : 0,
                        }}
                    />
                    {!collapsed && <BrandName variant="h6">PayNest</BrandName>}
                </Box>
            </Tooltip>

            <Divider sx={{ borderColor: theme.palette.divider, mx: 1, my: 1 }} />

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
                            <ListItemIcon
                                sx={{ minWidth: collapsed ? 0 : 36, mr: collapsed ? 0 : 0.5 }}
                            >
                                <Box
                                    component="span"
                                    sx={{
                                        display: "inline-flex",
                                        ...(active && {
                                            background: GRADIENT,
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            textShadow: "0 0 18px rgba(255,0,128,.14)",
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
                                        fontSize: 14.25,
                                        fontWeight: 800,
                                        fontFamily: linkFont,
                                        letterSpacing: 0.2,
                                        lineHeight: 1.1,
                                        ...(active
                                            ? {
                                                background: GRADIENT,
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                textShadow: "0 0 18px rgba(255,0,128,.14)",
                                            }
                                            : { color: alpha("#fff", 0.92) }),
                                    }}
                                />
                            )}
                        </NavButton>
                    );

                    return (
                        <Tooltip
                            key={item.page}
                            title={collapsed ? item.text : ""}
                            placement="right"
                            arrow
                        >
                            <ListItem disablePadding>{button}</ListItem>
                        </Tooltip>
                    );
                })}
            </List>

            {/* Footer / dynamic version pill */}
            <Box sx={{ mt: "auto", px: 1.25, pb: 1 }}>
                {!collapsed && (
                    <>
                        <FooterPill
                            onClick={handleCopyVersion}
                            onDoubleClick={toggleCollapsed}
                            initial={{ opacity: 0.95 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            {copied ? "Copied ✓" : `PayNest ${version}`}
                        </FooterPill>

                        <Typography
                            variant="caption"
                            sx={{
                                mt: 0.5,
                                color: alpha("#fff", 0.55),
                                display: "block",
                                textAlign: "center",
                                fontFamily: linkFont,
                            }}
                        >
                            Click to copy • Double-click to {collapsed ? "expand" : "collapse"}
                        </Typography>
                    </>
                )}
            </Box>
        </SidebarWrap>
    );
}
