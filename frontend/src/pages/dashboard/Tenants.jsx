import React from "react";
import {
    Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Chip, Tooltip, TextField, MenuItem, Stack, Divider, List, ListItem, ListItemText
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Add, AssignmentInd } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from "@mui/icons-material/Search";

/* ---------- Brand ---------- */
const BRAND = {
    bg: "#0b0b0f",
    card: "#15151b",
    cardAlt: "#1a1a1f",
    text: "#EDEDF1",
    subtext: "rgba(237,237,241,0.72)",
    accentA: "#FF0080",
    accentB: "#7E00A6",
    danger: "#FF4D4F",
    warning: "#FFB020",
    success: "#2ECC71",
    border: "rgba(255,255,255,0.08)"
};

/* ---------- Fonts (same as Properties.jsx) ---------- */
const FONTS = {
    display: `"Cinzel", ui-serif, Georgia, serif`,
    subhead: `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
    number: `"Sora", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
};

/* ---------- Reusable UI ---------- */
const MotionPaper = styled(motion.div)({
    background: BRAND.cardAlt,
    borderRadius: 12,
    padding: 16,
    border: `1px solid ${BRAND.border}`,
    boxShadow: "0 4px 14px rgba(0,0,0,0.35)"
});
const kpiHover = {
    whileHover: {
        scale: 1.02,
        boxShadow: `0 0 0 1px ${BRAND.border}, 0 0 18px ${BRAND.accentA}55, 0 0 36px ${BRAND.accentB}33`
    },
    transition: { type: "spring", stiffness: 220, damping: 18 }
};
const BrandButton = styled(Button)({
    background: `linear-gradient(90deg, ${BRAND.accentA}, ${BRAND.accentB})`,
    color: "#fff",
    fontWeight: 700,
    textTransform: "none",
    paddingInline: 16,
    boxShadow: "0 8px 28px rgba(0,0,0,0.35)",
    fontFamily: FONTS.subhead,
    "&:hover": { filter: "brightness(1.05)" }
});
const HoverRow = styled(TableRow)({
    transition: "background 180ms ease, transform 180ms ease",
    "&:hover": { background: "rgba(255,255,255,0.04)", transform: "translateY(-1px)" }
});
const StatusChip = ({ value }) => {
    const map = {
        Overdue: { color: BRAND.danger, bg: "rgba(255,77,79,0.12)" },
        Vacating: { color: BRAND.warning, bg: "rgba(255,176,32,0.12)" },
        Paid: { color: BRAND.success, bg: "rgba(46,204,113,0.12)" },
        Active: { color: BRAND.text, bg: "rgba(255,255,255,0.08)" }
    };
    const s = map[value] || map.Active;
    return (
        <Chip
            label={value}
            size="small"
            sx={{
                color: s.color,
                background: s.bg,
                border: "1px solid rgba(255,255,255,0.08)",
                fontWeight: 700,
                fontFamily: FONTS.subhead
            }}
        />
    );
};

/* ---------- Tiny sparkline (SVG) ---------- */
const Sparkline = ({ data = [9, 7, 6, 6, 5, 6, 7, 8, 9], w = 200, h = 44 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (w - 4) + 2;
        const y = h - 2 - ((d - min) / (max - min || 1)) * (h - 4);
        return `${x},${y}`;
    }).join(" ");
    return (
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <polyline
                points={points}
                fill="none"
                stroke="url(#g)"
                strokeWidth="2.2"
                strokeLinejoin="round"
                strokeLinecap="round"
            />
            <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={BRAND.accentA} />
                    <stop offset="100%" stopColor={BRAND.accentB} />
                </linearGradient>
            </defs>
        </svg>
    );
};

/* ---------- Component ---------- */
const Tenants = () => {
    const monthLabel = "Aug 2025";

    // DISPLAY ORDER -> EXACT AS REQUESTED
    const kpisOrdered = [
        { key: "total", title: "Total Tenants", value: "128", short: "Tenants" },
        { key: "tenantsPerApt", title: "Tenants per Apartments", value: "Oasis 64 • Safari 64", short: "Tenants / Apt", isSquare: true },
        { key: "occ", title: "Occupancy Rate", value: "93%", short: "Occupancy" },
        { key: "expected", title: `Rent Expected — ${monthLabel}`, value: "KES 1,240,000", short: "Expected (Mo)" },
        { key: "collected", title: `Rent Collected — ${monthLabel}`, value: "KES 980,000", short: "Collected (Mo)" },
        { key: "collection", title: "Collection Rate", value: "79%", short: "Collection %" },
        { key: "lateTrend", title: "Late Payment Trend", value: "18%", short: "Late Trend", spark: true },
        { key: "overdue", title: "Overdue Payments (this month)", value: "14", short: "Overdue" },
        { key: "zero", title: "Zero Balance Tenants", value: "92", short: "Zero Balance" },
        { key: "debtors", title: "Tenants in Arrears", value: "36", short: "Debtors" },
        { key: "vacating", title: "Vacating Soon", value: "5", short: "Vacating" },
        { key: "avg", title: "Avg Rent / Tenant", value: "KES 52,000", short: "Avg Rent" }
    ];

    // Vertical list data for square card
    const tenantsPerApt = [
        { name: "Oasis", count: 64 },
        { name: "Safari", count: 64 },
    ];

    // Table data (mock)
    const tenants = [
        { name: "Courtney Hunt", unit: "Unit A-10", apartment: "Oasis Residences", phone: "(515) 555-1211", status: "Overdue", onTime: "56%", balance: "KES 164,000", nextDue: "12/08/2025" },
        { name: "Marvin Jacobs", unit: "Unit B-3", apartment: "Oasis Residences", phone: "(902) 123-466", status: "Vacating", onTime: "100%", balance: "KES 0", nextDue: "01/09/2025" },
        { name: "Diana Stone", unit: "Unit C-7", apartment: "Safari Apartments", phone: "(212) 655-1212", status: "Paid", onTime: "100%", balance: "KES 0", nextDue: "—" }
    ];

    return (
        <Box sx={{ background: BRAND.bg, minHeight: "100vh", p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                    variant="h4"
                    sx={{ color: BRAND.text, fontWeight: 800, letterSpacing: 0.3, fontFamily: FONTS.display }}
                >
                    Tenants
                </Typography>
                <Stack direction="row" spacing={1.5}>
                    <BrandButton startIcon={<Add />}>Add Tenant</BrandButton>
                    <BrandButton startIcon={<AssignmentInd />}>Assign Unit</BrandButton>
                </Stack>
            </Box>

            {/* KPI GRID - dense packing, no gaps */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(6, 1fr)", md: "repeat(12, 1fr)" },
                    gap: 2,
                    gridAutoFlow: "dense",
                    mb: 3
                }}
            >
                {kpisOrdered.map((k) => {
                    let col = { xs: "span 12", sm: "span 3", md: "span 3" };
                    let height = "auto";
                    if (k.key === "tenantsPerApt") height = 180;

                    return (
                        <MotionPaper
                            key={k.key}
                            {...kpiHover}
                            style={{ gridColumn: col.md ? undefined : undefined }}
                            sx={{
                                gridColumn: col,
                                height,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "space-between"
                            }}
                        >
                            <Typography sx={{ color: BRAND.subtext, fontSize: 13, fontFamily: FONTS.subhead }}>
                                {k.title}
                            </Typography>

                            {k.key === "tenantsPerApt" ? (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        background: BRAND.card,
                                        borderColor: BRAND.border,
                                        borderRadius: 1.5,
                                        height: "100%"
                                    }}
                                >
                                    <List dense disablePadding sx={{ maxHeight: 120, overflowY: "auto" }}>
                                        {tenantsPerApt.map((a, i) => (
                                            <ListItem
                                                key={i}
                                                sx={{
                                                    py: 0.5,
                                                    "&:not(:last-of-type)": { borderBottom: `1px dashed ${BRAND.border}` }
                                                }}
                                            >
                                                <ListItemText
                                                    primaryTypographyProps={{ sx: { color: BRAND.text, fontWeight: 800, fontFamily: FONTS.subhead } }}
                                                    secondaryTypographyProps={{ sx: { color: BRAND.subtext, fontFamily: FONTS.subhead } }}
                                                    primary={`${a.name}`}
                                                    secondary="Apartments"
                                                />
                                                <Typography sx={{ color: BRAND.text, fontWeight: 900, fontFamily: FONTS.number }}>
                                                    {a.count}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ) : (
                                <>
                                    <Typography sx={{ color: BRAND.text, fontSize: 26, fontWeight: 800, mt: 0.5, fontFamily: FONTS.number }}>
                                        {k.value}
                                    </Typography>
                                    <Typography sx={{ color: BRAND.subtext, fontSize: 12, mt: 0.25, fontFamily: FONTS.subhead }}>
                                        {k.short}
                                    </Typography>
                                    {k.spark && (
                                        <Box mt={1}>
                                            <Sparkline />
                                        </Box>
                                    )}
                                </>
                            )}
                        </MotionPaper>
                    );
                })}
            </Box>

            {/* Filters */}
            <Paper
                sx={{
                    background: BRAND.card,
                    border: `1px solid ${BRAND.border}`,
                    p: 2,
                    borderRadius: 2,
                    mb: 2
                }}
                component={motion.div}
                whileHover={{ boxShadow: `0 0 0 1px ${BRAND.border}, 0 0 14px ${BRAND.accentB}33` }}
            >
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search tenant, phone, unit…"
                        InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, opacity: 0.6 }} /> }}
                        sx={{
                            flex: 1,
                            "& .MuiInputBase-root": { color: BRAND.text, background: BRAND.cardAlt, borderRadius: 1.5 },
                            "& fieldset": { borderColor: BRAND.border },
                            "& .MuiInputBase-input": { fontFamily: FONTS.subhead }
                        }}
                    />
                    <TextField size="small" select label="Apartment" defaultValue="" sx={{ minWidth: 180 }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Oasis Residences">Oasis Residences</MenuItem>
                        <MenuItem value="Safari Apartments">Safari Apartments</MenuItem>
                    </TextField>
                    <TextField size="small" select label="Status" defaultValue="" sx={{ minWidth: 160 }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                        <MenuItem value="Vacating">Vacating</MenuItem>
                    </TextField>
                    <TextField size="small" select label="Payment" defaultValue="" sx={{ minWidth: 160 }}>
                        <MenuItem value="">Any</MenuItem>
                        <MenuItem value="On-time ≥ 90%">On-time ≥ 90%</MenuItem>
                        <MenuItem value="On-time &lt; 90%">On-time &lt; 90%</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper
                sx={{
                    background: BRAND.card,
                    border: `1px solid ${BRAND.border}`,
                    borderRadius: 2,
                    overflow: "hidden"
                }}
            >
                <Table>
                    <TableHead>
                        <TableRow>
                            {["Name", "Rental Unit", "Apartment", "Phone", "Status", "On-time %", "Balance", "Next Due", "Actions"].map((h) => (
                                <TableCell
                                    key={h}
                                    sx={{ color: BRAND.subtext, fontWeight: 700, background: BRAND.card, fontFamily: FONTS.subhead }}
                                >
                                    {h}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenants.map((t, idx) => (
                            <HoverRow key={idx}>
                                <TableCell sx={{ color: BRAND.text, fontWeight: 600, fontFamily: FONTS.subhead }}>{t.name}</TableCell>
                                <TableCell sx={{ color: BRAND.text, fontFamily: FONTS.subhead }}>{t.unit}</TableCell>
                                <TableCell sx={{ color: BRAND.text, whiteSpace: "nowrap", fontFamily: FONTS.subhead }}>{t.apartment}</TableCell>
                                <TableCell sx={{ color: BRAND.text, fontFamily: FONTS.subhead }}>{t.phone}</TableCell>
                                <TableCell><StatusChip value={t.status} /></TableCell>
                                <TableCell sx={{ color: BRAND.text, fontFamily: FONTS.subhead }}>{t.onTime}</TableCell>
                                <TableCell sx={{ color: t.balance !== "KES 0" ? BRAND.danger : BRAND.text, fontWeight: 700, fontFamily: FONTS.number }}>
                                    {t.balance}
                                </TableCell>
                                <TableCell sx={{ color: BRAND.text, fontFamily: FONTS.subhead }}>{t.nextDue}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    <Tooltip title="View Profile">
                                        <IconButton size="small" sx={{ color: BRAND.text }}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Send Reminder">
                                        <IconButton size="small" sx={{ color: BRAND.text }}>
                                            <EmailIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Record Payment">
                                        <IconButton size="small" sx={{ color: BRAND.text }}>
                                            <PaymentIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </HoverRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ borderColor: BRAND.border }} />
                <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: BRAND.subtext, fontSize: 12, fontFamily: FONTS.subhead }}>4 Filters</Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip size="small" label="Status" sx={{ color: BRAND.text, background: BRAND.cardAlt, fontFamily: FONTS.subhead }} />
                        <Chip size="small" label="Payment" sx={{ color: BRAND.text, background: BRAND.cardAlt, fontFamily: FONTS.subhead }} />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default Tenants;
