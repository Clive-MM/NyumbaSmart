// src/pages/Payments.jsx
import React, { useEffect, useState } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, CircularProgress, Menu, InputAdornment
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
    LineChart, Line, ResponsiveContainer, XAxis, YAxis,
    Tooltip as RTooltip, Legend, PieChart, Pie, Cell
} from "recharts";
import dayjs from "dayjs";

/* ---------- Config ---------- */
const monthKey = dayjs().format("MMMM YYYY");

/* ---------- Brand + Fonts ---------- */
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

/* ---------- Utils ---------- */
const fmtNum = (n) => new Intl.NumberFormat().format(Number(n || 0));
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
function Kpi({ label, value, hint }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
            <Typography variant="body2" sx={{ opacity: .9, fontFamily: FONTS.subhead }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: .5, fontWeight: 900, fontFamily: FONTS.number }}>
                {value}
            </Typography>
            {hint && (
                <Typography variant="caption" sx={{ opacity: .7, fontFamily: FONTS.subhead }}>
                    {hint}
                </Typography>
            )}
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

/* ---------- Colors ---------- */
const METHOD_COLORS = { Mobile: "#A78BFA", Bank: "#60A5FA", Cash: "#F59E0B" };

/* ---------- Page ---------- */
export default function Payments() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({ collected: 0, expected: 0, rate: 0, outstanding: 0 });
    const [insights] = useState([
        "7 tenants are 7+ days overdue",
        "5 unreconciled mobile payments",
        "SMS spend this month: KES 145",
    ]);

    const [series, setSeries] = useState([]);
    const [methods, setMethods] = useState([]);
    const [rows, setRows] = useState([]);

    // filters (used for table)
    const months = Array.from({ length: 12 }, (_, i) =>
        dayjs().subtract(i, "month").format("MMMM YYYY")
    );
    const [filter, setFilter] = useState({ q: "", month: months[0], apartment: "All", status: "All" });

    // menu
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuRow, setMenuRow] = useState(null);

    const load = async () => {
        try {
            setLoading(true);

            // demo data
            setKpis({
                collected: 615000,
                expected: 820000,
                rate: Math.round((615000 / 820000) * 100),
                outstanding: 820000 - 615000,
            });

            setSeries([
                { d: "01", billed: 80, paid: 48 },
                { d: "05", billed: 120, paid: 90 },
                { d: "10", billed: 100, paid: 75 },
                { d: "15", billed: 140, paid: 100 },
                { d: "20", billed: 130, paid: 110 },
                { d: "25", billed: 160, paid: 140 },
                { d: "30", billed: 170, paid: 150 },
            ]);

            setMethods([
                { name: "Mobile", value: 68 },
                { name: "Bank", value: 24 },
                { name: "Cash", value: 8 },
            ]);

            setRows([
                { id: 1, date: "2025-08-12 09:22", tenant: "Emily Cherltyrit", unit: "Apt 3B", apt: "Oasis", method: "Mobile", ref: "RQP23X", month: monthKey, paid: 65000, balanceAfter: 0, status: "Paid" },
                { id: 2, date: "2025-08-11 18:40", tenant: "Angela Opondo", unit: "B-12", apt: "Oasis", method: "Bank", ref: "TRX884", month: monthKey, paid: 30000, balanceAfter: 20000, status: "Partially Paid" },
                { id: 3, date: "2025-08-10 11:05", tenant: "David Otieno", unit: "C-2", apt: "Safari", method: "Mobile", ref: "MPA921", month: monthKey, paid: 30000, balanceAfter: 30000, status: "Unpaid" },
                { id: 4, date: "2025-08-09 15:14", tenant: "Grace Kibet", unit: "D-4", apt: "Safari", method: "Cash", ref: "CASH", month: monthKey, paid: 25000, balanceAfter: 0, status: "Paid" },
            ]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-line */ }, []);

    const filtered = rows.filter(r => {
        const byQ = !filter.q || [r.tenant, r.unit, r.apt, r.ref].join(" ").toLowerCase().includes(filter.q.toLowerCase());
        const byMonth = !filter.month || r.month === filter.month;
        const byApt = filter.apartment === "All" || r.apt === filter.apartment;
        const byStatus = filter.status === "All" || r.status === filter.status;
        return byQ && byMonth && byApt && byStatus;
    });

    const openMenu = (e, row) => { setMenuAnchor(e.currentTarget); setMenuRow(row); };
    const closeMenu = () => { setMenuAnchor(null); setMenuRow(null); };

    const onReceipt = () => { console.log("Receipt:", menuRow); closeMenu(); };
    const onEdit = () => { console.log("Edit:", menuRow); closeMenu(); };
    const onAdjust = () => { console.log("Adjust/Refund:", menuRow); closeMenu(); };

    const recordPayment = () => console.log("Open Record Payment modal");
    const importTxns = () => console.log("Open Import dialog");
    const reconcile = () => console.log("Open Reconcile queue");

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Title + Actions */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
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
                    Payments
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={load} sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    startIcon={<CloudUploadIcon />}
                    onClick={importTxns}
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.35)", "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" } }}
                >
                    Import Mobile/Bank
                </Button>
                <Button
                    startIcon={<DoneAllIcon />}
                    onClick={reconcile}
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.35)", "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" } }}
                >
                    Reconcile
                </Button>
                <Button
                    startIcon={<AddIcon />}
                    onClick={recordPayment}
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none", "&:hover": { boxShadow: BRAND.glow } }}
                >
                    Record Payment
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3}><Kpi label={`Collected — ${monthKey}`} value={fmtKES(kpis.collected)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Expected (Billed)" value={fmtKES(kpis.expected)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Collection Rate" value={`${fmtNum(kpis.rate)}%`} hint="Billed vs Paid" /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Outstanding" value={fmtKES(kpis.outstanding)} /></Grid>
            </Grid>

            {/* Insights */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {insights.map((t, i) => (
                    <Grid key={i} item xs={12} md={4}>
                        <Insight text={t} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts row */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280 }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Revenue Collection — Billed vs Collected (This Month)
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={series}>
                                <XAxis dataKey="d" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <RTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="billed" stroke="#7E00A6" strokeWidth={2} dot={false} name="Billed" />
                                <Line type="monotone" dataKey="paid" stroke="#FF0080" strokeWidth={2} dot={false} name="Collected" />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Payment Methods Split
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={methods} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} stroke="none">
                                        {methods.map((m, i) => <Cell key={i} fill={METHOD_COLORS[m.name] || "#8884d8"} />)}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                            {methods.map((m) => (
                                <Chip
                                    key={m.name}
                                    size="small"
                                    label={`${m.name} ${m.value}%`}
                                    sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* ⬇️ Moved filter/search bar here (below charts, above table) */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search tenant, unit, ref…"
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
                        sx={{ minWidth: 180, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {months.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Apartment" value={filter.apartment}
                        onChange={(e) => setFilter({ ...filter, apartment: e.target.value })}
                        sx={{ minWidth: 180, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["All", "Oasis", "Safari"].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Status" value={filter.status}
                        onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                        sx={{ minWidth: 160, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["All", "Paid", "Partially Paid", "Unpaid"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    </TextField>
                </Stack>
            </Paper>

            {/* Recent Payments Table */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Recent Payments
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
                            sx={{ "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead } }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Tenant</TableCell>
                                    <TableCell>Unit / Apartment</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Ref #</TableCell>
                                    <TableCell align="right">Amount Paid</TableCell>
                                    <TableCell>Billing Month</TableCell>
                                    <TableCell align="right">Balance After</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>{dayjs(r.date).format("DD MMM, HH:mm")}</TableCell>
                                        <TableCell>{r.tenant}</TableCell>
                                        <TableCell>{r.unit} — {r.apt}</TableCell>
                                        <TableCell>{r.method}</TableCell>
                                        <TableCell>{r.ref}</TableCell>
                                        <TableCell align="right">{fmtKES(r.paid)}</TableCell>
                                        <TableCell>{r.month}</TableCell>
                                        <TableCell align="right">{fmtKES(r.balanceAfter)}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                endIcon={<KeyboardArrowDownIcon />}
                                                sx={{
                                                    textTransform: "none",
                                                    borderRadius: 2,
                                                    color: "#fff",
                                                    border: "1px solid rgba(255,255,255,0.25)",
                                                    px: 1.25,
                                                    "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" }
                                                }}
                                                onClick={(e) => openMenu(e, r)}
                                            >
                                                Action
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={closeMenu}
                            PaperProps={{ sx: { bgcolor: "#0e0a17", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" } }}
                        >
                            <MenuItem onClick={onReceipt}>View Receipt</MenuItem>
                            <MenuItem onClick={onEdit}>Edit</MenuItem>
                            <MenuItem onClick={onAdjust}>Refund / Adjust</MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>
        </Box>
    );
}
