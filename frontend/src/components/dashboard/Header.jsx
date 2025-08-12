// src/components/dashboard/Header.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    AppBar, Toolbar, Box, IconButton, Badge, Avatar, useMediaQuery
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

const BRAND = { pink: "#FF0080", magenta: "#D4124E", red: "#FF3B3B", blue: "#2979FF", purple: "#7E00A6" };
const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

export const HEADER_HEIGHT = 72;
export const HEADER_SIDE_GAP = 16;

const glareSweep = keyframes`
  0% { transform: translateX(-120%) rotate(18deg); opacity: 0; }
  10% { opacity: .25; } 50% { opacity: .28; } 90% { opacity: .10; }
  100% { transform: translateX(120%) rotate(18deg); opacity: 0; }
`;

const GlassBar = styled(AppBar, {
    shouldForwardProp: (p) => !["sidebarwidth", "collapsed", "hidden", "darkmode", "overlay", "sidegap"].includes(p),
})(({ sidebarwidth, collapsed, hidden, darkmode, overlay, sidegap, theme }) => ({
    position: "fixed",
    top: 0,
    left: overlay ? sidegap : sidebarwidth + sidegap,
    width: overlay
        ? `calc(100% - ${sidegap * 2}px - 2px)`
        : `calc(100% - ${sidebarwidth}px - ${sidegap * 2}px - 2px)`,
    height: collapsed ? 56 : HEADER_HEIGHT,
    background: darkmode ? "linear-gradient(90deg, rgba(11,11,15,0.95), rgba(16,16,22,0.92))" : "rgba(255,255,255,0.88)",
    color: darkmode ? "#EDEDF1" : "#0F172A",
    backdropFilter: "saturate(120%) blur(10px)",
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`,
    borderRadius: 0,
    boxShadow: darkmode
        ? (collapsed ? "0 10px 24px rgba(0,0,0,0.45)" : "0 14px 34px rgba(0,0,0,0.55)")
        : (collapsed ? "0 10px 24px rgba(17,24,39,0.06)" : "0 12px 30px rgba(17,24,39,0.08)"),
    zIndex: theme.zIndex.appBar + 1,
    overflow: "hidden",
    transition: "height .25s ease, transform .28s ease, width .2s ease, left .2s ease, box-shadow .2s ease, border-radius .2s ease",
    transform: hidden ? `translate3d(0,-${HEADER_HEIGHT + 12}px,0)` : "translateZ(0)",
    "&::before": {
        content: '""', position: "absolute", top: -40, bottom: -40, left: 0, width: "40%",
        background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,.35), rgba(255,255,255,0))",
        transform: "translateX(-120%) rotate(18deg)", animation: `${glareSweep} 4.8s ease-in-out infinite`,
        pointerEvents: "none", mixBlendMode: "screen",
    },
    "&::after": {
        content: '""', position: "absolute", inset: 0, borderRadius: 0, background: brandGradient,
        filter: "blur(18px)", opacity: darkmode ? 0.28 : 0.18, pointerEvents: "none",
        mixBlendMode: darkmode ? "screen" : "soft-light", transition: "opacity .25s ease",
    },
    "&:hover::after": { opacity: darkmode ? 0.4 : 0.33 },
}));

const ProgressRail = styled("div", { shouldForwardProp: (p) => p !== "darkmode" })(({ darkmode }) => ({
    position: "absolute", left: 0, right: 0, bottom: 0, height: 3,
    background: darkmode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
}));
const ProgressBar = styled("div")({ height: "100%", background: brandGradient, transition: "width .15s linear" });

const GlassIcon = styled(IconButton, { shouldForwardProp: (p) => p !== "darkmode" })(({ darkmode }) => ({
    position: "relative",
    background: darkmode ? "rgba(20,22,31,0.96)" : "#fff",
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.06)"}`,
    boxShadow: darkmode ? "0 10px 22px rgba(0,0,0,0.5)" : "0 10px 22px rgba(15,23,42,0.08)",
    width: 42, height: 42, borderRadius: 10,
    transition: "box-shadow .2s ease, transform .15s ease, color .15s ease",
    "&:hover": { transform: "translateY(-1px)", boxShadow: darkmode ? "0 14px 28px rgba(0,0,0,0.65)" : "0 14px 28px rgba(15,23,42,0.12)" },
    "&::after": { content: '""', position: "absolute", inset: -4, borderRadius: 12, background: brandGradient, filter: "blur(10px)", opacity: 0, transition: "opacity .25s ease", zIndex: -1 },
    "&:hover::after": { opacity: 0.45 },
    "& .MuiSvgIcon-root": { fontSize: 22 },
}));

const LogoutChip = styled("button", { shouldForwardProp: (p) => p !== "darkmode" })(({ darkmode }) => ({
    height: 42, padding: "0 14px", borderRadius: 10,
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)"}`,
    background: darkmode ? "rgba(20,22,31,0.96)" : "#fff",
    color: darkmode ? "#EDEDF1" : "#0F172A",
    fontWeight: 700, cursor: "pointer",
    boxShadow: darkmode ? "0 10px 22px rgba(0,0,0,0.5)" : "0 10px 22px rgba(15,23,42,0.08)",
    transition: "transform .12s ease, box-shadow .2s ease",
    "&:hover": {
        boxShadow: darkmode
            ? "0 14px 28px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.06) inset"
            : "0 14px 28px rgba(15,23,42,0.12), 0 0 0 2px rgba(15,23,42,0.06) inset",
    },
    "&:active": { transform: "scale(0.98)" },
}));

const getInitials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() || "")
        .join("");

export default function Header({
    sidebarWidth = 240,
    sideGap = HEADER_SIDE_GAP,
    overlay = false,
    onLogout = () => { },
    onOpenSettings = () => { },
    onOpenNotifications = () => { },
    onOpenProfile = () => { },          // <-- NEW: parent switches to Profile page
    user: userProp,
    notificationCount: notifProp,
}) {
    const theme = useTheme();
    const darkmode = theme.palette.mode === "dark";
    const isSm = useMediaQuery("(max-width:900px)");

    const user = useMemo(() => {
        if (userProp) return userProp;
        try {
            const raw = localStorage.getItem("user");
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }, [userProp]);

    const initials = useMemo(() => getInitials(user?.FullName || "Pay Nest"), [user]);
    const [hidden, setHidden] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [progress, setProgress] = useState(0);
    const [notifCount, setNotifCount] = useState(notifProp ?? 0);

    useEffect(() => {
        if (typeof notifProp === "number") setNotifCount(notifProp);
    }, [notifProp]);

    useEffect(() => {
        let lastY = window.scrollY, expandTimer;
        const onScroll = () => {
            const y = window.scrollY;
            const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            setProgress(Math.min(100, (y / max) * 100));
            if (y < 8) { setHidden(false); setCollapsed(false); }
            if (y > lastY + 6) setHidden(true);
            if (y < lastY - 6) { setHidden(false); setCollapsed(true); }
            lastY = y;
            clearTimeout(expandTimer);
            expandTimer = setTimeout(() => { if (!hidden) setCollapsed(false); }, 900);
        };
        const onResize = () => onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            clearTimeout(expandTimer);
        };
    }, [hidden]);

    return (
        <GlassBar
            elevation={0}
            sidebarwidth={sidebarWidth}
            collapsed={collapsed}
            hidden={hidden}
            darkmode={darkmode}
            overlay={overlay}
            sidegap={sideGap}
        >
            <Toolbar sx={{ minHeight: collapsed ? 56 : HEADER_HEIGHT, px: 2, gap: 12 }}>
                <Box sx={{ flex: 1 }} />

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <GlassIcon aria-label="notifications" darkmode={darkmode} onClick={onOpenNotifications}>
                        <Badge badgeContent={notifCount} color="error" max={99}>
                            <NotificationsIcon sx={{ color: BRAND.magenta }} />
                        </Badge>
                    </GlassIcon>

                    <GlassIcon aria-label="settings" onClick={onOpenSettings} darkmode={darkmode}>
                        <SettingsIcon sx={{ color: BRAND.purple }} />
                    </GlassIcon>

                    {/* Avatar now directly opens Profile panel */}
                    <GlassIcon aria-label="profile" darkmode={darkmode} onClick={onOpenProfile}>
                        <Avatar
                            src={user?.ProfilePicture || undefined}
                            sx={{
                                width: 30, height: 30,
                                background: user?.ProfilePicture ? undefined : brandGradient,
                                boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
                                fontSize: 13, fontWeight: 800, color: "#fff",
                            }}
                        >
                            {!user?.ProfilePicture && initials}
                        </Avatar>
                    </GlassIcon>

                    {!isSm && <LogoutChip onClick={onLogout} darkmode={darkmode}>Logout</LogoutChip>}
                </Box>
            </Toolbar>

            <ProgressRail darkmode={darkmode}>
                <ProgressBar style={{ width: `${progress}%` }} />
            </ProgressRail>
        </GlassBar>
    );
}
