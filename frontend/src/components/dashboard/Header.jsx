// src/components/Header.jsx
import React, { useState } from "react";
import {
    AppBar, Toolbar, Box, IconButton, Badge, Avatar,
    InputBase, useMediaQuery
} from "@mui/material";
import { styled } from "@mui/material/styles";
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
/** horizontal gutter so the header doesn't touch the sidebar or the right edge */
export const HEADER_SIDE_GAP = 16;

/* ---------- Styled parts ---------- */

/** Glassy, rounded header that starts after the sidebar + a small gutter */
const GlassBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== "sidebarwidth",
})(({ sidebarwidth, theme }) => ({
    position: "fixed",
    top: HEADER_TOP,
    left: sidebarwidth + HEADER_SIDE_GAP,                        // pull away from sidebar
    width: `calc(100% - ${sidebarwidth}px - ${HEADER_SIDE_GAP * 2}px)`, // gap on both sides
    height: HEADER_HEIGHT,
    background: "rgba(255,255,255,0.8)",
    color: "#0F172A",
    backdropFilter: "saturate(120%) blur(10px)",
    boxShadow: "0 12px 30px rgba(17,24,39,0.06)",
    borderRadius: 16,
    justifyContent: "center",
    zIndex: theme.zIndex.appBar + 1,
}));

const SearchWrap = styled("div")(({ theme }) => ({
    position: "relative",
    borderRadius: 12,
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "inset 0 8px 20px rgba(15,23,42,0.06)",
    width: "min(460px, 48vw)",
    [theme.breakpoints.down("sm")]: { width: "60vw" },
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

/** Round glass icon button */
const GlassIcon = styled(IconButton)({
    background: "#fff",
    border: "1px solid rgba(15,23,42,0.06)",
    boxShadow: "0 10px 22px rgba(15,23,42,0.08)",
    width: 44,
    height: 44,
    "&:hover": {
        boxShadow: "0 12px 28px rgba(15,23,42,0.12)",
        filter: "brightness(1.02)",
    },
});

/** Logout chip-style button */
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
    transition: "transform .12s ease",
    "&:active": { transform: "scale(0.98)" },
});

/* ---------- Component ---------- */

export default function Header({
    sidebarWidth = 240,
    onLogout = () => { },
    onOpenSettings = () => { },
}) {
    const isSm = useMediaQuery("(max-width:900px)");
    const [q, setQ] = useState("");

    return (
        <GlassBar elevation={0} sidebarwidth={sidebarWidth}>
            <Toolbar sx={{ minHeight: HEADER_HEIGHT, px: 2, gap: 2 }}>
                {/* Search (left) */}
                <SearchWrap>
                    <SearchIconWrap>
                        <SearchIcon sx={{ color: BRAND.blue }} />
                    </SearchIconWrap>
                    <SearchInput
                        placeholder="Search…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </SearchWrap>

                <Box sx={{ flexGrow: 1 }} />

                {/* Actions (right) */}
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
        </GlassBar>
    );
}
