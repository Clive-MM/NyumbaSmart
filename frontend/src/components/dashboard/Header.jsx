import React, { useEffect, useMemo, useState } from "react";
import {
    AppBar, Toolbar, Box, Badge, Avatar, useMediaQuery, Tooltip
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

/* -------- Branding & Constants -------- */
const BRAND = { 
    pink: "#FF0080", 
    magenta: "#D4124E", 
    red: "#FF3B3B", 
    blue: "#2979FF", 
    purple: "#7E00A6" 
};

const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

export const HEADER_HEIGHT = 72;
export const HEADER_SIDE_GAP = 16;

/* -------- Animations -------- */
const glareSweep = keyframes`
  0% { transform: translateX(-120%) rotate(18deg); opacity: 0; }
  10% { opacity: .25; } 50% { opacity: .28; } 90% { opacity: .10; }
  100% { transform: translateX(120%) rotate(18deg); opacity: 0; }
`;

/* -------- Styled Components -------- */
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
    transition: "height .25s ease, transform .28s ease, width .2s ease, left .2s ease",
    transform: hidden ? `translate3d(0,-${HEADER_HEIGHT + 12}px,0)` : "translateZ(0)",
    "&::before": {
        content: '""', position: "absolute", top: -40, bottom: -40, left: 0, width: "40%",
        background: "linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,.35), rgba(255,255,255,0))",
        transform: "translateX(-120%) rotate(18deg)", animation: `${glareSweep} 4.8s ease-in-out infinite`,
        pointerEvents: "none", mixBlendMode: "screen",
    }
}));

const IconPill = styled(motion.button, {
    shouldForwardProp: (p) => !["brandcolor", "darkmode"].includes(p),
})(({ brandcolor, darkmode }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    minWidth: 44,
    borderRadius: 14,
    padding: "0 10px",
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
    outline: 'none',
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.18)" : "rgba(15,23,42,0.12)"}`,
    borderBottom: `2px solid ${alpha(brandcolor, 0.4)}`, 
    
    background: darkmode 
        ? `linear-gradient(135deg, ${alpha("#fff", 0.12)} 0%, ${alpha(brandcolor, 0.08)} 100%)`
        : `linear-gradient(135deg, ${alpha("#fff", 0.95)} 0%, ${alpha(brandcolor, 0.05)} 100%)`,
        
    backgroundSize: "200% 100%",
    backdropFilter: "blur(8px)",
    
    boxShadow: darkmode 
        ? `0 8px 20px -6px rgba(0,0,0,0.5), inset 0 0 0 1px ${alpha("#fff", 0.05)}`
        : `0 10px 15px -3px ${alpha(brandcolor, 0.15)}, inset 0 0 0 1px #fff`,
        
    transition: "all .3s cubic-bezier(0.4, 0, 0.2, 1)",

    "&:hover": {
        border: `1px solid ${alpha(brandcolor, 0.6)}`,
        boxShadow: `0 12px 20px -5px ${alpha(brandcolor, 0.3)}`,
    },

    "&:before": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: `radial-gradient(circle at top left, ${alpha(brandcolor, 0.2)}, transparent 70%)`,
        opacity: 0.5,
        pointerEvents: "none",
    }
}));

const ProgressRail = styled("div", { shouldForwardProp: (p) => p !== "darkmode" })(({ darkmode }) => ({
    position: "absolute", left: 0, right: 0, bottom: 0, height: 3,
    background: darkmode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
}));

const ProgressBar = styled("div")({ height: "100%", background: brandGradient, transition: "width .15s linear" });

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

/* -------- Utility -------- */
const getInitials = (name = "") =>
    name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase() || "").join("");

/* -------- Main Component -------- */
export default function Header({
    sidebarWidth = 208,
    sideGap = HEADER_SIDE_GAP,
    overlay = false,
    onLogout = () => { },
    onOpenSettings = () => { },
    onOpenNotifications = () => { },
    onOpenProfile = () => { },
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
        } catch { return null; }
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
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
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

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    
                    {/* Notifications */}
                    <Tooltip title="Notifications" arrow disableInteractive>
                        <IconPill
                            brandcolor={BRAND.pink}
                            darkmode={darkmode}
                            onClick={onOpenNotifications}
                            whileHover={{ scale: 1.08, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        >
                            <Badge badgeContent={notifCount} color="error" overlap="circular">
                                <NotificationsIcon sx={{ color: BRAND.pink, fontSize: 22 }} />
                            </Badge>
                        </IconPill>
                    </Tooltip>

                    {/* Settings */}
                    <Tooltip title="Settings" arrow disableInteractive>
                        <IconPill
                            brandcolor={BRAND.purple}
                            darkmode={darkmode}
                            onClick={onOpenSettings}
                            whileHover={{ scale: 1.08, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ backgroundPositionX: ["0%", "100%", "0%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        >
                            <SettingsIcon sx={{ color: BRAND.purple, fontSize: 22 }} />
                        </IconPill>
                    </Tooltip>

                    {/* Profile */}
                    <Tooltip title="Profile" arrow disableInteractive>
                        <IconPill
                            brandcolor={BRAND.blue}
                            darkmode={darkmode}
                            onClick={onOpenProfile}
                            whileHover={{ scale: 1.08, translateY: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Avatar
                                src={user?.ProfilePicture || undefined}
                                sx={{
                                    width: 28, height: 28,
                                    background: user?.ProfilePicture ? undefined : brandGradient,
                                    fontSize: 11, fontWeight: 900, color: "#fff",
                                    border: `1px solid ${alpha("#fff", 0.5)}`
                                }}
                            >
                                {!user?.ProfilePicture && initials}
                            </Avatar>
                        </IconPill>
                    </Tooltip>

                    {!isSm && (
                        <LogoutChip onClick={onLogout} darkmode={darkmode}>
                            Logout
                        </LogoutChip>
                    )}
                </Box>
            </Toolbar>

            <ProgressRail darkmode={darkmode}>
                <ProgressBar style={{ width: `${progress}%` }} />
            </ProgressRail>
        </GlassBar>
    );
}