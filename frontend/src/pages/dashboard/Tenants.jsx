// src/pages/Tenants.jsx
import React from "react";
import {
    Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Chip, Tooltip, TextField, MenuItem, Stack,
    Divider, List, ListItem, ListItemText, InputAdornment
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";
import { Add, AssignmentInd } from "@mui/icons-material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import PaymentIcon from "@mui/icons-material/Payment";
import SearchIcon from "@mui/icons-material/Search";

/* ---------- PayNest Brand + Fonts (match Properties / Billing) ---------- */
const BRAND = {
    start: "#FF0080",
    end: "#7E00A6",
    gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
    glow: "0 14px 30px rgba(255,0,128,.22), 0 8px 20px rgba(126,0,166,.18)"
};
const FONTS = {
    display: `"Cinzel", ui-serif, Georgia, serif`,
    subhead: `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
    number: `"Sora", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
};

/* ---------- Soft neumorphic card (same base as other pages) ---------- */
const softCard = {
    p: 2,
    borderRadius: 3,
    color: "#fff",
    background: "#0e0a17",
    boxShadow:
        "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03), inset 0 0 0 rgba(255,255,255,0)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        background:
            "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    },
};

/* ---------- Reusable UI (styled to PayNest) ---------- */
const MotionCard = styled(motion.div)({
    ...softCard,
    padding: 16,
});
const kpiHover = {
    whileHover: { scale: 1.02 },
    transition: { type: "spring", stiffness: 220, damping: 18 }
};
const BrandButton = styled(Button)({
    background: BRAND.gradient,
    color: "#fff",
    fontWeight: 800,
    textTransform: "none",
    paddingInline: 16,
    borderRadius: 12,
    boxShadow: "none",
    fontFamily: FONTS.subhead,
    "&:hover": { boxShadow: BRAND.glow }
});
const HoverRow = styled(TableRow)({
    transition: "background 180ms ease, transform 180ms ease",
    "&:hover": { background: "rgba(255,255,255,0.04)", transform: "translateY(-1px)" }
});
const StatusChip = ({ value }) => {
    const map = {
        Paid: "rgba(110,231,183,.15)",
        Overdue: "rgba(251,113,133,.15)",
        Vacating: "rgba(253,230,138,.15)",
        Active: "rgba(167,139,250,.15)",
    };
    const bg = map[value] || map.Active;
    return (
        <Chip
            label={value}
            size="small"
            sx={{
                color: "#fff",
                background: bg,
                border: "1px solid rgba(255,255,255,0.14)",
                fontWeight: 700,
                fontFamily: FONTS.subhead
            }}
        />
    );
};

/* ---------- Tiny sparkline (unchanged) ---------- */
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
            <polyline points={points} fill="none" stroke="url(#g)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            <defs>
                <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0%" stopColor={BRAND.start} />
                    <stop offset="100%" stopColor={BRAND.end} />
                </linearGradient>
            </defs>
        </svg>
    );
};

/* ---------- Component ---------- */
const Tenants = () => {
    const monthLabel = "Aug 2025";

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

    const tenantsPerApt = [
        { name: "Oasis", count: 64 },
        { name: "Safari", count: 64 },
    ];

    const tenants = [
        { name: "Courtney Hunt", unit: "Unit A-10", apartment: "Oasis Residences", phone: "(515) 555-1211", status: "Overdue", onTime: "56%", balance: "KES 164,000", nextDue: "12/08/2025" },
        { name: "Marvin Jacobs", unit: "Unit B-3", apartment: "Oasis Residences", phone: "(902) 123-466", status: "Vacating", onTime: "100%", balance: "KES 0", nextDue: "01/09/2025" },
        { name: "Diana Stone", unit: "Unit C-7", apartment: "Safari Apartments", phone: "(212) 655-1212", status: "Paid", onTime: "100%", balance: "KES 0", nextDue: "—" }
    ];

    return (
        <Box sx={{ background: "#0b0714", minHeight: "100vh", p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: BRAND.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: FONTS.display,
                        letterSpacing: .5
                    }}
                >
                    Tenants
                </Typography>
                <Stack direction="row" spacing={1.5}>
                    <BrandButton startIcon={<Add />}>Add Tenant</BrandButton>
                    <BrandButton startIcon={<AssignmentInd />}>Assign Unit</BrandButton>
                </Stack>
            </Box>

            {/* KPI GRID */}
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
                        <MotionCard key={k.key} {...kpiHover} style={{ gridColumn: col.md ? undefined : undefined }} sx={{ gridColumn: col, height, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <Typography sx={{ opacity: .85, fontSize: 13, fontFamily: FONTS.subhead }}>
                                {k.title}
                            </Typography>

                            {k.key === "tenantsPerApt" ? (
                                <Paper elevation={0} sx={{ ...softCard, p: 1.25, borderRadius: 2, height: "100%" }}>
                                    <List dense disablePadding sx={{ maxHeight: 120, overflowY: "auto" }}>
                                        {tenantsPerApt.map((a, i) => (
                                            <ListItem
                                                key={i}
                                                sx={{
                                                    py: .5,
                                                    "&:not(:last-of-type)": { borderBottom: "1px dashed rgba(255,255,255,0.08)" }
                                                }}
                                            >
                                                <ListItemText
                                                    primaryTypographyProps={{ sx: { color: "#fff", fontWeight: 800, fontFamily: FONTS.subhead } }}
                                                    secondaryTypographyProps={{ sx: { color: "rgba(255,255,255,0.72)", fontFamily: FONTS.subhead } }}
                                                    primary={`${a.name}`}
                                                    secondary="Apartments"
                                                />
                                                <Typography sx={{ color: "#fff", fontWeight: 900, fontFamily: FONTS.number }}>
                                                    {a.count}
                                                </Typography>
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            ) : (
                                <>
                                    <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 800, mt: 0.5, fontFamily: FONTS.number }}>
                                        {k.value}
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, mt: 0.25, fontFamily: FONTS.subhead }}>
                                        {k.short}
                                    </Typography>
                                    {k.spark && <Box mt={1}><Sparkline /></Box>}
                                </>
                            )}
                        </MotionCard>
                    );
                })}
            </Box>

            {/* Filters */}
            <Paper elevation={0} sx={{ ...softCard, p: 2, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search tenant, phone, unit…"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ opacity: 0.7 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1,
                            "& .MuiInputBase-root": { color: "#fff", background: "#0e0a17", borderRadius: 1.5 },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            "& .MuiInputBase-input": { fontFamily: FONTS.subhead }
                        }}
                    />
                    <TextField size="small" select label="Apartment" defaultValue="" sx={{ minWidth: 180, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }, "& .MuiInputBase-root": { color: "#fff" } }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Oasis Residences">Oasis Residences</MenuItem>
                        <MenuItem value="Safari Apartments">Safari Apartments</MenuItem>
                    </TextField>
                    <TextField size="small" select label="Status" defaultValue="" sx={{ minWidth: 160, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }, "& .MuiInputBase-root": { color: "#fff" } }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Overdue">Overdue</MenuItem>
                        <MenuItem value="Vacating">Vacating</MenuItem>
                    </TextField>
                    <TextField size="small" select label="Payment" defaultValue="" sx={{ minWidth: 160, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }, "& .MuiInputBase-root": { color: "#fff" } }}>
                        <MenuItem value="">Any</MenuItem>
                        <MenuItem value="On-time ≥ 90%">On-time ≥ 90%</MenuItem>
                        <MenuItem value="On-time &lt; 90%">On-time &lt; 90%</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Table */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, overflow: "hidden" }}>
                <Table
                    sx={{
                        "& th": { color: "rgba(255,255,255,0.8)", fontWeight: 700, fontFamily: FONTS.subhead, background: "#0e0a17" },
                        "& td": { color: "#fff", fontFamily: FONTS.subhead, borderColor: "rgba(255,255,255,0.08)" },
                        "& th, & td": { borderColor: "rgba(255,255,255,0.08)" }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            {["Name", "Rental Unit", "Apartment", "Phone", "Status", "On-time %", "Balance", "Next Due", "Actions"].map((h) => (
                                <TableCell key={h}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tenants.map((t, idx) => (
                            <HoverRow key={idx}>
                                <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                                <TableCell>{t.unit}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>{t.apartment}</TableCell>
                                <TableCell>{t.phone}</TableCell>
                                <TableCell><StatusChip value={t.status} /></TableCell>
                                <TableCell>{t.onTime}</TableCell>
                                <TableCell sx={{ color: t.balance !== "KES 0" ? "#FB7185" : "#fff", fontWeight: 800, fontFamily: FONTS.number }}>
                                    {t.balance}
                                </TableCell>
                                <TableCell>{t.nextDue}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    <Tooltip title="View Profile">
                                        <IconButton size="small" sx={{ color: "#fff" }}>
                                            <VisibilityIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Send Reminder">
                                        <IconButton size="small" sx={{ color: "#fff" }}>
                                            <EmailIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Record Payment">
                                        <IconButton size="small" sx={{ color: "#fff" }}>
                                            <PaymentIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </HoverRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
                <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontFamily: FONTS.subhead }}>4 Filters</Typography>
                    <Stack direction="row" spacing={1}>
                        <Chip size="small" label="Status" sx={{ color: "#fff", background: "#0e0a17", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }} />
                        <Chip size="small" label="Payment" sx={{ color: "#fff", background: "#0e0a17", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }} />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default Tenants;
