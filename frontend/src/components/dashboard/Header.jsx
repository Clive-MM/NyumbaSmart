// src/components/Header.jsx
import React, { useEffect, useState } from "react";
import {
    AppBar, Toolbar, Box, IconButton, Badge, Avatar,
    InputBase, useMediaQuery, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";

/* ---------- Brand ---------- */
const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    red: "#FF3B3B",
    blue: "#2979FF",
    purple: "#7E00A6",
};
const brandGradient =
    `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.red}, ${BRAND.blue}, ${BRAND.purple})`;

export const HEADER_HEIGHT = 72;
export const HEADER_TOP = 16;
export const HEADER_SIDE_GAP = 16;

const glareSweep = keyframes`
  0%   { transform: translateX(-120%) rotate(18deg); opacity: .0; }
  10%  { opacity: .25; }
  50%  { opacity: .28; }
  90%  { opacity: .10; }
  100% { transform: translateX(120%) rotate(18deg); opacity: .0; }
`;

/* ---------- Styled (dark by default) ---------- */
const GlassBar = styled(AppBar, {
    shouldForwardProp: (p) => !["sidebarwidth", "collapsed", "hidden", "darkmode"].includes(p),
})(({ sidebarwidth, collapsed, hidden, darkmode, theme }) => ({
    position: "fixed",
    top: HEADER_TOP,
    left: sidebarwidth + HEADER_SIDE_GAP,
    width: `calc(100% - ${sidebarwidth}px - ${HEADER_SIDE_GAP * 2}px)`,
    height: collapsed ? 56 : HEADER_HEIGHT,
    // DARK header like Properties/Tenants
    background: darkmode
        ? "linear-gradient(90deg, rgba(11,11,15,0.95), rgba(16,16,22,0.92))"
        : "rgba(255,255,255,0.88)",
    color: darkmode ? "#EDEDF1" : "#0F172A",
    backdropFilter: "saturate(120%) blur(10px)",
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.06)"}`,
    borderRadius: 12,
    boxShadow: darkmode
        ? (collapsed ? "0 10px 24px rgba(0,0,0,0.45)" : "0 14px 34px rgba(0,0,0,0.55)")
        : (collapsed ? "0 10px 24px rgba(17,24,39,0.06)" : "0 12px 30px rgba(17,24,39,0.08)"),
    zIndex: theme.zIndex.appBar + 1,
    overflow: "hidden",
    transition:
        "height .25s ease, transform .28s ease, width .2s ease, left .2s ease, box-shadow .2s ease",
    transform: hidden ? `translate3d(0,-${HEADER_HEIGHT + HEADER_TOP + 12}px,0)` : "translateZ(0)",
    "&::before": {
        content: '""',
        position: "absolute",
        top: -40,
        bottom: -40,
        left: 0,
        width: "40%",
        background:
            "linear-gradient( to right, rgba(255,255,255,0.00), rgba(255,255,255,0.35), rgba(255,255,255,0.00) )",
        transform: "translateX(-120%) rotate(18deg)",
        animation: `${glareSweep} 4.8s ease-in-out infinite`,
        pointerEvents: "none",
        mixBlendMode: "screen",
    },
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -8,
        borderRadius: 12,
        background: brandGradient,
        filter: "blur(18px)",
        opacity: darkmode ? 0.28 : 0.18,
        pointerEvents: "none",
        mixBlendMode: darkmode ? "screen" : "soft-light",
        transition: "opacity .25s ease",
    },
    "&:hover::after": { opacity: darkmode ? 0.4 : 0.33 },
}));

const ProgressRail = styled("div", { shouldForwardProp: (p) => p !== "darkmode" })(({ darkmode }) => ({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    background: darkmode ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
}));
const ProgressBar = styled("div")({
    height: "100%",
    background: brandGradient,
    transition: "width .15s linear",
});

// Dark-visible search
const SearchWrap = styled("div", { shouldForwardProp: (p) => p !== "darkmode" })(({ theme, darkmode }) => ({
    position: "relative",
    borderRadius: 12,
    background: darkmode ? "rgba(20,22,31,0.96)" : "rgba(255,255,255,0.96)",
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.06)"}`,
    boxShadow: darkmode
        ? "6px 10px 22px rgba(0,0,0,0.5), inset 0 8px 20px rgba(255,255,255,0.05)"
        : "6px 10px 22px rgba(15,23,42,0.08), inset 0 8px 20px rgba(15,23,42,0.06)",
    transition: "box-shadow .2s ease, border-color .2s ease, transform .15s ease",
    width: "min(520px, 50vw)",
    [theme.breakpoints.down("sm")]: { width: "60vw" },
    "&::before": {
        content: '""',
        position: "absolute",
        inset: 0,
        borderRadius: 12,
        background: brandGradient,
        filter: "blur(14px)",
        opacity: darkmode ? 0.14 : 0.28,
        zIndex: 0,
    },
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -6,
        borderRadius: 14,
        background: brandGradient,
        filter: "blur(16px)",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity .25s ease",
    },
    "&:hover::after, &:focus-within::after": { opacity: 0.55 },
}));

const SearchIconWrap = styled("div")({
    position: "absolute",
    left: 12,
    top: 0,
    bottom: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
    zIndex: 1,
});
const SearchInput = styled(InputBase, { shouldForwardProp: (p) => p !== "darkmode" })(({ theme, darkmode }) => ({
    position: "relative",
    zIndex: 1,
    width: "100%",
    color: darkmode ? "#EDEDF1" : "#0F172A",
    "& .MuiInputBase-input": { padding: theme.spacing(1.4, 1.6, 1.4, 5.6), fontSize: 16, fontWeight: 600 },
    "& .MuiInputBase-input::placeholder": { color: darkmode ? "rgba(237,237,241,.62)" : "rgba(15,23,42,.55)", opacity: 1 },
}));

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


const TypeGroup = styled(ToggleButtonGroup, { shouldForwardProp: (p) => p !== "darkmode" })(({ theme, darkmode }) => ({
    background: darkmode ? "rgba(20,22,31,0.96)" : "#fff",
    border: `1px solid ${darkmode ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.06)"}`,
    borderRadius: 12,
    height: 44, overflow: "hidden",
    boxShadow: darkmode ? "6px 10px 22px rgba(0,0,0,0.5)" : "6px 10px 22px rgba(15,23,42,0.08)",
    [theme.breakpoints.down("md")]: { display: "none" },
}));
const TypeBtn = styled(ToggleButton)({
    textTransform: "none", fontWeight: 700, fontSize: 14, padding: "0 14px", color: "#0F172A", border: 0,
    "&.Mui-selected": { color: "#fff", background: brandGradient },
    "&:not(.Mui-selected):hover": { background: "rgba(15,23,42,0.03)" },
});

/* ---------- Component ---------- */
export default function Header({
    mode = "dark",                 // default to DARK now
    sidebarWidth = 240,
    onLogout = () => { },
    onOpenSettings = () => { },
    onSearch = () => { },           // (query, type)
    onTypeChange = () => { },       // (type)
}) {
    const darkmode = mode === "dark";
    const isSm = useMediaQuery("(max-width:900px)");
    const [q, setQ] = useState("");
    const [type, setType] = useState("apartment");

    // scroll-aware state
    const [hidden, setHidden] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let lastY = window.scrollY;
        let expandTimer;
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

    const handleSearchKey = (e) => { if (e.key === "Enter") onSearch(q.trim(), type); };
    // const handleType = (_e, v) => { if (v) { setType(v); onTypeChange(v); } };

    return (
        <GlassBar
            elevation={0}
            sidebarwidth={sidebarWidth}
            collapsed={collapsed}
            hidden={hidden}
            darkmode={darkmode}
        >
            <Toolbar sx={{ minHeight: collapsed ? 56 : HEADER_HEIGHT, px: 2, gap: 12 }}>
                {/* Left: Search */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1 }}>
                    <SearchWrap darkmode={darkmode}>
                        <div style={{ position: "relative", zIndex: 1 }}>
                            <SearchIconWrap>
                                <SearchIcon sx={{ color: darkmode ? BRAND.pink : BRAND.blue }} />
                            </SearchIconWrap>
                            <SearchInput
                                darkmode={darkmode}
                                placeholder={`Search ${type}…`}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={handleSearchKey}
                            />
                        </div>
                    </SearchWrap>

                    {/* Optional type selector
          <TypeGroup exclusive value={type} onChange={handleType} darkmode={darkmode}>
            <TypeBtn value="apartment">Apartments</TypeBtn>
            <TypeBtn value="tenant">Tenants</TypeBtn>
            <TypeBtn value="unit">Units</TypeBtn>
          </TypeGroup> */}
                </Box>

                {/* Right: Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <GlassIcon aria-label="notifications" darkmode={darkmode}>
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon sx={{ color: BRAND.magenta }} />
                        </Badge>
                    </GlassIcon>

                    <GlassIcon aria-label="settings" onClick={onOpenSettings} darkmode={darkmode}>
                        <SettingsIcon sx={{ color: BRAND.purple }} />
                    </GlassIcon>

                    <GlassIcon aria-label="profile" darkmode={darkmode}>
                        <Avatar
                            sx={{
                                width: 30,
                                height: 30,
                                background: brandGradient,
                                boxShadow: "0 6px 16px rgba(0,0,0,0.6)",
                                fontSize: 13,
                                fontWeight: 800,
                                color: "#fff",
                            }}
                        >
                            HM
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
