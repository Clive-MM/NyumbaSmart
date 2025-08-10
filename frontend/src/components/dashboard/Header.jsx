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

/* ---------- Layout constants (exported) ---------- */
export const HEADER_HEIGHT = 72;
export const HEADER_TOP = 16;
export const HEADER_SIDE_GAP = 16;

/* ---------- Animations ---------- */
const glareSweep = keyframes`
  0%   { transform: translateX(-120%) rotate(18deg); opacity: .0; }
  10%  { opacity: .25; }
  50%  { opacity: .28; }
  90%  { opacity: .10; }
  100% { transform: translateX(120%) rotate(18deg); opacity: .0; }
`;

/* ---------- Styled ---------- */
const GlassBar = styled(AppBar, {
    shouldForwardProp: (p) => !["sidebarwidth", "collapsed", "hidden"].includes(p),
})(({ sidebarwidth, collapsed, hidden, theme }) => ({
    position: "fixed",
    top: HEADER_TOP,
    left: sidebarwidth + HEADER_SIDE_GAP,
    width: `calc(100% - ${sidebarwidth}px - ${HEADER_SIDE_GAP * 2}px)`,
    height: collapsed ? 56 : HEADER_HEIGHT,
    background: "rgba(255,255,255,0.85)",
    color: "#0F172A",
    backdropFilter: "saturate(120%) blur(10px)",
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: 16,
    boxShadow: collapsed
        ? "0 10px 24px rgba(17,24,39,0.06)"
        : "0 12px 30px rgba(17,24,39,0.08)",
    zIndex: theme.zIndex.appBar + 1,
    overflow: "hidden",
    transition:
        "height .25s ease, transform .28s ease, width .2s ease, left .2s ease, box-shadow .2s ease",
    transform: hidden ? `translate3d(0,-${HEADER_HEIGHT + HEADER_TOP + 12}px,0)` : "translateZ(0)",

    // animated glare
    "&::before": {
        content: '""',
        position: "absolute",
        top: -40,
        bottom: -40,
        left: 0,
        width: "40%",
        background:
            "linear-gradient( to right, rgba(255,255,255,0.00), rgba(255,255,255,0.45), rgba(255,255,255,0.00) )",
        transform: "translateX(-120%) rotate(18deg)",
        animation: `${glareSweep} 4.8s ease-in-out infinite`,
        pointerEvents: "none",
        mixBlendMode: "screen",
    },

    // subtle brand aura
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -10,
        borderRadius: 16,
        background: brandGradient,
        filter: "blur(20px)",
        opacity: 0.18,
        pointerEvents: "none",
        mixBlendMode: "soft-light",
        transition: "opacity .25s ease",
    },
    "&:hover::after": { opacity: 0.33 },
}));

const ProgressRail = styled("div")({
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 3,
    background: "rgba(15,23,42,0.08)",
});
const ProgressBar = styled("div")({
    height: "100%",
    background: brandGradient,
    transition: "width .15s linear",
});

const SearchWrap = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: 14,
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow:
        "6px 10px 22px rgba(15,23,42,0.08), inset 0 8px 20px rgba(15,23,42,0.06)",
    transition:
        "box-shadow .2s ease, border-color .2s ease, transform .15s ease",
    width: "min(460px, 48vw)",
    [theme.breakpoints.down("sm")]: { width: "58vw" },

    // brand glow on hover/focus
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -6,
        borderRadius: 18,
        background: brandGradient,
        filter: "blur(14px)",
        opacity: 0,
        pointerEvents: "none",
        transition: "opacity .25s ease",
    },
    "&:hover::after, &:focus-within::after": { opacity: 0.55 },
    "&:focus-within": {
        borderColor: "rgba(41,121,255,0.35)",
        boxShadow:
            "8px 14px 26px rgba(15,23,42,0.12), 0 0 0 2px rgba(41,121,255,.12) inset",
        transform: "translateY(-1px)",
    },
}));

const SearchIconWrap = styled("div")({
    position: "absolute",
    left: 12,
    top: 0,
    bottom: 0,
    display: "grid",
    placeItems: "center",
    pointerEvents: "none",
});

const SearchInput = styled(InputBase)(({ theme }) => ({
    width: "100%",
    "& .MuiInputBase-input": {
        padding: theme.spacing(1.3, 1.5, 1.3, 5.5),
        fontSize: 16,
    },
    "& .MuiInputBase-input::placeholder": { color: "rgba(15,23,42,.45)" },
}));

const GlassIcon = styled(IconButton)({
    position: "relative",
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
    width: 44,
    height: 44,
    transition: "box-shadow .2s ease, transform .15s ease",
    "&:hover": {
        transform: "translateY(-1px)",
        boxShadow: "0 14px 28px rgba(15,23,42,0.12)",
    },
    "&::after": {
        content: '""',
        position: "absolute",
        inset: -4,
        borderRadius: "50%",
        background: brandGradient,
        filter: "blur(10px)",
        opacity: 0,
        transition: "opacity .25s ease",
        zIndex: -1,
    },
    "&:hover::after": { opacity: 0.45 },
});

const LogoutChip = styled("button")({
    height: 44,
    padding: "0 16px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#fff",
    color: "#0F172A",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
    transition: "transform .12s ease, box-shadow .2s ease",
    "&:hover": {
        boxShadow:
            "0 14px 28px rgba(15,23,42,0.12), 0 0 0 2px rgba(15,23,42,0.06) inset",
    },
    "&:active": { transform: "scale(0.98)" },
});

/* --- Type selector (Apartment / Tenant / Unit) --- */
const TypeGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: 14,
    height: 44,
    overflow: "hidden",
    boxShadow: "6px 10px 22px rgba(15,23,42,0.08)",
    [theme.breakpoints.down("md")]: { display: "none" },
}));

const TypeBtn = styled(ToggleButton)({
    textTransform: "none",
    fontWeight: 700,
    fontSize: 14,
    padding: "0 14px",
    color: "#0F172A",
    border: 0,
    "&.Mui-selected": {
        color: "#fff",
        background: brandGradient,
    },
    "&:not(.Mui-selected):hover": {
        background: "rgba(15,23,42,0.03)",
    },
});

/* ---------- Component ---------- */
export default function Header({
    sidebarWidth = 240,
    onLogout = () => { },
    onOpenSettings = () => { },
    onSearch = () => { },       // (query, type) => void  <-- optional integration
    onTypeChange = () => { },   // (type) => void        <-- optional integration
}) {
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
            const max = Math.max(
                1,
                document.documentElement.scrollHeight - window.innerHeight
            );
            setProgress(Math.min(100, (y / max) * 100));

            // at very top: show & expand
            if (y < 8) {
                setHidden(false);
                setCollapsed(false);
            }

            // scrolling down → hide
            if (y > lastY + 6) setHidden(true);
            // scrolling up → show (collapsed)
            if (y < lastY - 6) {
                setHidden(false);
                setCollapsed(true);
            }
            lastY = y;

            // auto-expand after user stops scrolling for a moment
            clearTimeout(expandTimer);
            expandTimer = setTimeout(() => {
                if (!hidden) setCollapsed(false);
            }, 900);
        };

        const onResize = () => onScroll();

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        onScroll(); // init

        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            clearTimeout(expandTimer);
        };
    }, [hidden]);

    const handleSearchKey = (e) => {
        if (e.key === "Enter") onSearch(q.trim(), type);
    };
    const handleType = (_e, v) => {
        if (v) {
            setType(v);
            onTypeChange(v);
        }
    };

    return (
        <GlassBar
            elevation={0}
            sidebarwidth={sidebarWidth}
            collapsed={collapsed}
            hidden={hidden}
        >
            <Toolbar sx={{ minHeight: collapsed ? 56 : HEADER_HEIGHT, px: 2, gap: 12 }}>
                {/* Left: Search */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1 }}>
                    <SearchWrap>
                        <div style={{ position: "relative" }}>
                            <SearchIconWrap>
                                <SearchIcon sx={{ color: BRAND.blue }} />
                            </SearchIconWrap>
                            <SearchInput
                                placeholder={`Search ${type}…`}
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                onKeyDown={handleSearchKey}
                            />
                        </div>
                    </SearchWrap>

                    {/* Type selector */}

                </Box>

                {/* Right: Actions */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                    <GlassIcon aria-label="notifications">
                        <Badge badgeContent={3} color="error">
                            <NotificationsIcon sx={{ color: BRAND.magenta }} />
                        </Badge>
                    </GlassIcon>

                    <GlassIcon aria-label="settings" onClick={onOpenSettings}>
                        <SettingsIcon sx={{ color: BRAND.purple }} />
                    </GlassIcon>

                    <GlassIcon aria-label="profile">
                        <Avatar
                            sx={{
                                width: 32,
                                height: 32,
                                background: brandGradient,
                                boxShadow: "0 6px 16px rgba(212,18,78,0.25)",
                                fontSize: 14,
                                fontWeight: 700,
                            }}
                        >
                            HM
                        </Avatar>
                    </GlassIcon>

                    {!isSm && <LogoutChip onClick={onLogout}>Logout</LogoutChip>}
                </Box>
            </Toolbar>

            {/* Brand progress bar */}
            <ProgressRail>
                <ProgressBar style={{ width: `${progress}%` }} />
            </ProgressRail>
        </GlassBar>
    );
}
