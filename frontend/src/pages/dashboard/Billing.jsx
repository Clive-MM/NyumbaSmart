// src/pages/Billing.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, CircularProgress, Menu, InputAdornment
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import {
    PieChart, Pie, Cell,
    LineChart, Line, ResponsiveContainer, XAxis, YAxis,
    Tooltip as RTooltip, Legend
} from "recharts";
import dayjs from "dayjs";
import axios from "axios";

/* ---------- Config ---------- */
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
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

/* ---------- Utilities ---------- */
const fmtNum = (n) => new Intl.NumberFormat().format(Number(n || 0));
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(n || 0))}`;

/* ---------- Dark Neumorphic Card ---------- */
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

/* ---------- KPI Card ---------- */
function Kpi({ label, value, hint }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 120 }}>
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

/* ---------- Insight (rectangular, larger) ---------- */
function Insight({ text }) {
    return (
        <Paper
            elevation={0}
            sx={{
                ...softCard,
                borderRadius: 2,
                height: 72,
                display: "flex",
                alignItems: "center",
                px: 2.25
            }}
        >
            <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .92 }}>
                {text}
            </Typography>
        </Paper>
    );
}

/* ---------- Colors for breakdown ---------- */
const TYPE_COLORS = {
    Rent: "#6D28D9",
    Water: "#60A5FA",
    Electricity: "#A78BFA",
    Garbage: "#F59E0B",
    Other: "#F472B6"
};

/* ---------- Component ---------- */
export default function Billing() {
    const [loading, setLoading] = useState(true);
    const [kpis, setKpis] = useState({
        totalBills: 0, expected: 0, collected: 0, outstanding: 0, overduePct: 0
    });

    // NOTE: we only need the state values; omit the unused setters to satisfy ESLint.
    const [insights] = useState([
        "3 tenants are 7+ days overdue",
        "Security fee not billed for 2 units",
        "Recurring rent set for 8% of units",
    ]);
    const [breakdown] = useState([
        { name: "Rent", value: 75 },
        { name: "Water", value: 10 },
        { name: "Electricity", value: 8 },
        { name: "Garbage", value: 5 },
        { name: "Other", value: 2 },
    ]);
    const [yearSeries] = useState([
        { m: "Jan", billed: 140, collected: 90 },
        { m: "Feb", billed: 220, collected: 160 },
        { m: "Mar", billed: 210, collected: 170 },
        { m: "Apr", billed: 260, collected: 200 },
        { m: "May", billed: 200, collected: 180 },
        { m: "Jun", billed: 310, collected: 240 },
        { m: "Jul", billed: 330, collected: 260 },
        { m: "Aug", billed: 350, collected: 270 },
        { m: "Sep", billed: 360, collected: 300 },
        { m: "Oct", billed: 370, collected: 310 },
        { m: "Nov", billed: 380, collected: 320 },
        { m: "Dec", billed: 390, collected: 330 },
    ]);

    const [rows, setRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");

    // row action menu state
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuRow, setMenuRow] = useState(null);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = axios.create({
        baseURL: API,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const load = async () => {
        try {
            setLoading(true);

            // TODO: connect to real endpoints
            // const billsMonth = await api.get(`/bills/month/${encodeURIComponent(monthKey)}`);
            // const stats = await api.get(`/bills/stats/${encodeURIComponent(monthKey)}`);
            // const trend = await api.get("/bills/year-trend");
            // const mix = await api.get("/bills/breakdown");

            setRows([
                { id: 1, tenant: "Emily Cherltyrit", unit: "Apt 3B", apt: "John Mwangi", type: "Rent", amount: 65000, due: "13 Jan", status: "Paid" },
                { id: 2, tenant: "Angela Opondo", unit: "B-12", apt: "Angela Oponno", type: "Water", amount: 30000, due: "25 Feb", status: "Pending" },
                { id: 3, tenant: "David Otieno", unit: "C-2", apt: "David Otieno", type: "Rent", amount: 30000, due: "25 Feb", status: "Overdue" },
                { id: 4, tenant: "Grace Kibet", unit: "D-4", apt: "Abigail Odhiambo", type: "Garbage", amount: 25000, due: "5 Feb", status: "Partially Paid" },
            ]);

            setKpis({
                totalBills: 32,
                expected: 820000,
                collected: 615000,
                outstanding: 205000,
                overduePct: 5
            });

            // If you later wire real data, reintroduce the setters above.
            // setYearSeries(trend.data?.series || []);
            // setBreakdown(mix.data?.mix || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-line */ }, []);

    const filteredRows = rows.filter(r => statusFilter === "All" ? true : r.status === statusFilter);

    const handleGenerate = async () => {
        try {
            const { data } = await api.post("/bills/generate-or-update", { BillingMonth: monthKey });
            console.log(data);
            load();
        } catch (e) { console.error(e); }
    };

    const openMenu = (event, row) => {
        setMenuAnchor(event.currentTarget);
        setMenuRow(row);
    };
    const closeMenu = () => { setMenuAnchor(null); setMenuRow(null); };

    const onView = () => { console.log("View:", menuRow); closeMenu(); };
    const onEdit = () => { console.log("Edit:", menuRow); closeMenu(); };
    const onReminder = () => { console.log("Reminder:", menuRow); closeMenu(); };

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Header (trimmed) */}
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
                    Billing
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={load} sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    startIcon={<AddIcon />}
                    onClick={handleGenerate}
                    variant="contained"
                    sx={{
                        ml: 1,
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                        "&:hover": { boxShadow: BRAND.glow }
                    }}
                >
                    Generate New Bill
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Total Bills (This Month)" value={fmtNum(kpis.totalBills)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Expected Amount (This Month)" value={fmtKES(kpis.expected)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Amount Collected" value={fmtKES(kpis.collected)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Outstanding Amount" value={fmtKES(kpis.outstanding)} hint={`Overdue ${kpis.overduePct}%`} /></Grid>
            </Grid>

            {/* Insights — rectangular */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {insights.map((t, i) => (
                    <Grid item xs={12} md={4} key={i}>
                        <Insight text={t} />
                    </Grid>
                ))}
            </Grid>

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={7}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280 }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Billed vs Collected (This Year)
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={yearSeries}>
                                <XAxis dataKey="m" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <RTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="billed" stroke="#7E00A6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="collected" stroke="#FF0080" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Breakdown by Bill Type
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={breakdown} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} stroke="none">
                                        {breakdown.map((d, i) => (
                                            <Cell key={i} fill={TYPE_COLORS[d.name] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                            {breakdown.map((d) => (
                                <Chip
                                    key={d.name}
                                    size="small"
                                    label={`${d.name} ${d.value}%`}
                                    sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Table – compact, single Action column */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Search tenant, unit…"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            minWidth: 260,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{
                            minWidth: 160,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }
                        }}
                    >
                        {["All", "Paid", "Pending", "Overdue", "Partially Paid"].map((s) => (
                            <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                    </TextField>
                    <Box sx={{ flexGrow: 1 }} />
                </Stack>

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
                                    fontFamily: FONTS.subhead
                                }
                            }}
                        >
                            <TableHead>
                                <TableRow>
                                    <TableCell>Tenant</TableCell>
                                    <TableCell>Unit / Apartment</TableCell>
                                    <TableCell>Bill Type</TableCell>
                                    <TableCell align="right">Amount Due</TableCell>
                                    <TableCell>Due Date</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell>{r.tenant}</TableCell>
                                        <TableCell>{r.unit} — {r.apt}</TableCell>
                                        <TableCell>{r.type}</TableCell>
                                        <TableCell align="right">{fmtKES(r.amount)}</TableCell>
                                        <TableCell>{r.due}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={r.status}
                                                sx={{
                                                    color: "#fff",
                                                    border: "1px solid rgba(255,255,255,0.14)",
                                                    bgcolor:
                                                        r.status === "Paid" ? "rgba(110,231,183,.15)" :
                                                            r.status === "Pending" ? "rgba(253,230,138,.15)" :
                                                                r.status === "Overdue" ? "rgba(251,113,133,.15)" :
                                                                    "rgba(167,139,250,.15)"
                                                }}
                                            />
                                        </TableCell>
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

                        {/* Row action dropdown */}
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={closeMenu}
                            PaperProps={{
                                sx: {
                                    bgcolor: "#0e0a17",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,0.12)"
                                }
                            }}
                        >
                            <MenuItem onClick={onView}>View</MenuItem>
                            <MenuItem onClick={onEdit}>Edit</MenuItem>
                            <MenuItem onClick={onReminder}>Reminder</MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>
        </Box>
    );
}
