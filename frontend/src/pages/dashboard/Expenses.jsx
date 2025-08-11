// src/pages/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, CircularProgress, InputAdornment, Link
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
    LineChart, Line, ResponsiveContainer, XAxis, YAxis,
    Tooltip as RTooltip, Legend, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid
} from "recharts";
import dayjs from "dayjs";

/* ---------- Brand + Fonts ---------- */
const BRAND = {
    start: "#FF0080",
    end: "#7E00A6",
    gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
    glow: "0 14px 30px rgba(255,0,128,.22), 0 8px 20px rgba(126,0,166,.18)",
};
const FONTS = {
    display: `"Cinzel", ui-serif, Georgia, serif`,
    subhead: `"Nunito", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
    number: `"Sora", ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial`,
};

/* ---------- Utils ---------- */
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(n || 0))}`;

/* ---------- Soft card ---------- */
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

/* ---------- Reusable ---------- */
function Kpi({ label, value }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
            <Typography variant="body2" sx={{ opacity: .9, fontFamily: FONTS.subhead }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: .5, fontWeight: 900, fontFamily: FONTS.number }}>
                {value}
            </Typography>
        </Paper>
    );
}

function Insight({ text }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, height: 74, display: "flex", alignItems: "center", px: 2.25 }}>
            <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .92 }}>
                {text}
            </Typography>
        </Paper>
    );
}

/* ---------- Colors by type ---------- */
const TYPE_COLORS = {
    Repairs: "#A78BFA",
    Water: "#7C3AED",
    Electricity: "#60A5FA",
    Garbage: "#F59E0B",
    Internet: "#22D3EE",
    Other: "#F472B6",
};

/* ---------- Page ---------- */
export default function Expenses() {
    /* Filters */
    const months = useMemo(
        () => Array.from({ length: 12 }, (_, i) => dayjs().subtract(i, "month").format("MMMM YYYY")),
        []
    );
    const [filter, setFilter] = useState({
        q: "",
        month: months[0], // current month
        apartment: "All",
        type: "All",
    });

    /* Data/state */
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [trend, setTrend] = useState([]);
    const [byType, setByType] = useState([]);
    const [byApt, setByApt] = useState([]);
    const [kpi, setKpi] = useState({
        monthTotal: 0,
        highest: 0,
        avgPercent: 31, // matches mockup visual
    });

    const [insights] = useState([
        "Utility expenses up 12% from last month",
        "Total expenses decreased by 6% this year",
    ]);

    /* Mock load (plug in your API later) */
    useEffect(() => {
        setLoading(true);

        // Example ledger data
        const sampleRows = [
            { id: 1, date: "2025-07-24", apartment: "Alpha", type: "Repairs", description: "Water leak repair", amount: 18000, attachment: "view" },
            { id: 2, date: "2025-07-27", apartment: "Oasis", type: "Electricity", description: "Monthly utility bill", amount: 40000, attachment: null },
            { id: 3, date: "2025-07-25", apartment: "Safari", type: "Water", description: "Water delivery", amount: 22500, attachment: null },
            { id: 4, date: "2025-07-25", apartment: "Alpha", type: "Repairs", description: "Fence section replacement", amount: 34200, attachment: null },
            { id: 5, date: "2025-07-12", apartment: "Oasis", type: "Garbage", description: "Waste collection", amount: 9000, attachment: null },
            { id: 6, date: "2025-07-02", apartment: "Safari", type: "Internet", description: "Shared internet", amount: 12500, attachment: null },
        ];

        // Trend (last 6 months)
        const sampleTrend = [
            { m: "Feb", total: 45 },
            { m: "Apr", total: 64 },
            { m: "Aug", total: 128 }, // keeping labels like mock, but you can fill months
            { m: "Sep", total: 132 },
            { m: "Oct", total: 160 },
        ];

        // By type (percent-ish weights)
        const sampleByType = [
            { name: "Repairs", value: 31 },
            { name: "Electricity", value: 19 },
            { name: "Water", value: 19 },
            { name: "Garbage", value: 12 },
            { name: "Internet", value: 10 },
            { name: "Other", value: 9 },
        ];

        // By apartment
        const sampleByApt = [
            { name: "Oasis", total: 72 },
            { name: "Safari", total: 64 },
            { name: "Alpha", total: 80 },
        ];

        // Compute KPIs for selected month (using sample rows)
        const monthLabel = months[0]; // current
        const monthRows = sampleRows.filter(
            (r) => dayjs(r.date).format("MMMM YYYY") === monthLabel
        );
        const monthTotal = monthRows.reduce((a, r) => a + r.amount, 0);
        const highest = monthRows.reduce((a, r) => Math.max(a, r.amount), 0);

        setRows(sampleRows);
        setTrend(sampleTrend);
        setByType(sampleByType);
        setByApt(sampleByApt);
        setKpi({ monthTotal, highest, avgPercent: 31 });

        setLoading(false);
    }, [months]);

    /* Filtering for the table */
    const filteredRows = rows.filter((r) => {
        const matchesQ =
            !filter.q ||
            [r.apartment, r.type, r.description].join(" ").toLowerCase().includes(filter.q.toLowerCase());
        const matchesMonth =
            !filter.month || dayjs(r.date).format("MMMM YYYY") === filter.month;
        const matchesApt = filter.apartment === "All" || r.apartment === filter.apartment;
        const matchesType = filter.type === "All" || r.type === filter.type;
        return matchesQ && matchesMonth && matchesApt && matchesType;
    });

    /* Handlers */
    const doImport = () => console.log("Import receipts");
    const doExport = () => console.log("Export CSV/XLSX");
    const addExpense = () => console.log("Open Add Expense modal");
    const refresh = () => console.log("Refresh data");

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Title + actions (inside main section, not the global header) */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        background: BRAND.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        fontFamily: FONTS.display,
                        letterSpacing: .5,
                    }}
                >
                    Expenses
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={refresh} sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    startIcon={<CloudUploadIcon />}
                    variant="outlined"
                    onClick={doImport}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.35)",
                        "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" },
                    }}
                >
                    Import Receipts
                </Button>
                <Button
                    startIcon={<FileDownloadOutlinedIcon />}
                    variant="outlined"
                    onClick={doExport}
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        color: "#fff",
                        borderColor: "rgba(255,255,255,0.35)",
                        "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" },
                    }}
                >
                    Export
                </Button>
                <Button
                    startIcon={<AddIcon />}
                    onClick={addExpense}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                        "&:hover": { boxShadow: BRAND.glow },
                    }}
                >
                    Add Expense
                </Button>
            </Stack>

            {/* KPI row (matches mock) */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label={`Expenses (${filter.month})`} value={fmtKES(kpi.monthTotal)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label="Highest Expense" value={fmtKES(kpi.highest)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label="Avg, per Month" value={`${kpi.avgPercent}%`} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
                        <Typography variant="body2" sx={{ opacity: .9, fontFamily: FONTS.subhead }}>
                            By Apartment
                        </Typography>
                        <Box sx={{ height: 68 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byApt}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="name" stroke="#aaa" />
                                    <YAxis hide />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                        {byApt.map((a, i) => (
                                            <Cell
                                                key={i}
                                                fill={i === 0 ? "#7E00A6" : i === 1 ? "#FF0080" : "#F59E0B"}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
            </Grid>

            {/* Insights (2 rectangular cards) */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {insights.map((t, i) => (
                    <Grid key={i} item xs={12} md={6}>
                        <Insight text={t} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280 }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Trend by Month
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={trend}>
                                <XAxis dataKey="m" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <RTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="total" stroke="#7E00A6" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            By Type
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={byType} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} stroke="none">
                                        {byType.map((t, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[t.name] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                            {byType.map((t) => (
                                <Chip
                                    key={t.name}
                                    size="small"
                                    label={`${t.name} ${t.value}%`}
                                    sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters (search + selects) */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search…"
                        value={filter.q}
                        onChange={(e) => setFilter({ ...filter, q: e.target.value })}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ flex: 1, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    />
                    <TextField
                        select size="small" label="Month" value={filter.month}
                        onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                        sx={{ minWidth: 160, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {months.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Apartment" value={filter.apartment}
                        onChange={(e) => setFilter({ ...filter, apartment: e.target.value })}
                        sx={{ minWidth: 160, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["All", "Alpha", "Oasis", "Safari"].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Type" value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        sx={{ minWidth: 160, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["All", "Repairs", "Electricity", "Water", "Garbage", "Internet", "Other"].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </TextField>
                </Stack>
            </Paper>

            {/* Ledger Table */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Expenses
                </Typography>

                {loading ? (
                    <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <>
                        <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                        <Table
                            size="small"
                            sx={{
                                tableLayout: "auto",
                                "& th, & td": {
                                    borderColor: "rgba(255,255,255,0.08)",
                                    color: "#fff",
                                    fontFamily: FONTS.subhead,
                                },
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Apartment</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell align="right">Attachment</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>{dayjs(r.date).format("DD MMM YYYY")}</TableCell>
                                        <TableCell>{r.apartment}</TableCell>
                                        <TableCell>{r.type}</TableCell>
                                        <TableCell>{r.description}</TableCell>
                                        <TableCell align="right">{fmtKES(r.amount)}</TableCell>
                                        <TableCell align="right">
                                            {r.attachment ? (
                                                <Link component="button" sx={{ color: "#fff" }} onClick={() => console.log("View attachment", r.id)}>
                                                    View
                                                </Link>
                                            ) : (
                                                "—"
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </>
                )}
            </Paper>
        </Box>
    );
}
