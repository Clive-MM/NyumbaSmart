// src/pages/Billing.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, CircularProgress, Menu, InputAdornment, Snackbar, Alert,
    Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, TableSortLabel,
    TablePagination
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PaymentsIcon from "@mui/icons-material/Payments";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import TimelapseIcon from "@mui/icons-material/Timelapse";
import {
    PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, XAxis, YAxis,
    Tooltip as RTooltip, Legend
} from "recharts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import axios from "axios";

dayjs.extend(utc);

/* ---------- Config ---------- */
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const NOW_MONTH = dayjs().format("MMMM YYYY");

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
const fmtPct = (n) => `${Math.round(Number(n || 0))}%`;
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(n || 0))}`;
const monthOptions = Array.from({ length: 13 }, (_, i) =>
    dayjs().subtract(i, "month").format("MMMM YYYY")
);
const STATUS_OPTIONS = ["All", "Unpaid", "Paid", "Partially Paid", "Overpaid"];

/* ---------- Cards ---------- */
const softCard = {
    p: 2, borderRadius: 3, color: "#fff", background: "#0e0a17",
    boxShadow: "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
        transform: "translateY(-3px)",
        boxShadow: "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        background: "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    },
};

function Kpi({ label, value, hint, onClick, icon }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 120, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="body2" sx={{ opacity: .9, fontFamily: FONTS.subhead }}>{label}</Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: .5, fontWeight: 900, fontFamily: FONTS.number }}>{value}</Typography>
            {hint && <Typography variant="caption" sx={{ opacity: .7, fontFamily: FONTS.subhead }}>{hint}</Typography>}
        </Paper>
    );
}

function Insight({ text }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, height: 72, display: "flex", alignItems: "center", px: 2.25 }}>
            <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .92 }}>{text}</Typography>
        </Paper>
    );
}

/* ---------- Status display ---------- */
const STATUS_BG = {
    Paid: "rgba(110,231,183,.15)",
    "Partially Paid": "rgba(253,230,138,.15)",
    Overpaid: "rgba(96,165,250,.15)",
    Unpaid: "rgba(167,139,250,.15)",
    Overdue: "rgba(251,113,133,.15)"
};
const STATUS_ORDER = ["Paid", "Partially Paid", "Overpaid", "Unpaid"];

/* ---------- Component ---------- */
export default function Billing() {
    const [loading, setLoading] = useState(true);
    const [rows, setRows] = useState([]);
    const [statusFilter, setStatusFilter] = useState("All");
    const [monthFilter, setMonthFilter] = useState(NOW_MONTH);
    const [apartmentFilter, setApartmentFilter] = useState("All"); // string name for now
    const [search, setSearch] = useState("");
    const searchRef = useRef();
    const [selected, setSelected] = useState([]);
    const [snack, setSnack] = useState({ open: false, severity: "success", msg: "" });

    // Sorting & pagination
    const [orderBy, setOrderBy] = useState("dueISO");
    const [orderDir, setOrderDir] = useState("asc");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // KPIs & insights
    const [kpis, setKpis] = useState({
        totalBills: 0, expected: 0, collected: 0, outstanding: 0,
        overduePct: 0, overdueCount: 0, unpaidCount: 0, avgDaysOverdue: 0, collectionRate: 0,
        countsByStatus: {}
    });
    const [insights, setInsights] = useState([]);

    // Actions
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuRow, setMenuRow] = useState(null);
    const [viewOpen, setViewOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [remindOpen, setRemindOpen] = useState(false);

    const [editForm, setEditForm] = useState({ WaterBill: 0, ElectricityBill: 0, Garbage: 0, Internet: 0 });

    // Payment dialog
    const [payOpen, setPayOpen] = useState(false);
    const [payForm, setPayForm] = useState({
        AmountPaid: "", PaidViaMobile: "MPesa", TxRef: "", PaymentNote: "",
        TenantID: "", RentalUnitID: "", BillingMonth: NOW_MONTH
    });

    // Cashflow series (from backend)
    const [cashflowSeries, setCashflowSeries] = useState([]);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = useMemo(() => axios.create({
        baseURL: API,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    }), [token]);

    /* ---------- Data Loading ---------- */
    const load = async () => {
        try {
            setLoading(true);
            const params = {};
            if (monthFilter && monthFilter !== "All") params.month = monthFilter;
            if (statusFilter && statusFilter !== "All") params.status = statusFilter;

            // Only pass apartment_id if filter is a numeric id (current UI uses name)
            const maybeId = Number(apartmentFilter);
            if (!Number.isNaN(maybeId) && String(maybeId) === String(apartmentFilter)) {
                params.apartment_id = maybeId;
            }

            const { data } = await api.get("/bills", { params });

            const normalized = (data?.bills || []).map((b) => ({
                id: b.BillID,
                BillID: b.BillID,
                tenant: b.TenantName,
                unit: b.UnitLabel,
                apt: b.ApartmentName || "—",
                type: "Total",
                amount: b.TotalAmountDue,
                paid: b.PaidToDate ?? 0,
                balance: b.Balance ?? Math.max((b.TotalAmountDue || 0), 0),
                dueISO: b.DueDate, // yyyy-mm-dd
                due: b.DueDate ? dayjs(b.DueDate).format("DD MMM") : "—",
                status: b.BillStatus,
                month: b.BillingMonth,
                issued: b.IssuedDate,
                // If you add IDs to backend response, these will prefill payment dialog:
                TenantID: b.TenantID,
                RentalUnitID: b.RentalUnitID
            }));

            setRows(normalized);

            // Reset apartment filter if it no longer exists
            const apts = ["All", ...Array.from(new Set(normalized.map(r => r.apt).filter(Boolean)))];
            if (!apts.includes(apartmentFilter)) setApartmentFilter("All");
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: "Failed to load bills." });
        } finally {
            setLoading(false);
        }
    };

    const loadKpis = async () => {
        try {
            const params = {};
            if (monthFilter && monthFilter !== "All") params.month = monthFilter;
            const maybeId = Number(apartmentFilter);
            if (!Number.isNaN(maybeId) && String(maybeId) === String(apartmentFilter)) {
                params.apartment_id = maybeId;
            }

            // KPIs
            const { data } = await api.get("/billing/kpis", { params });
            const counts = data?.kpis?.counts_by_status || {};
            const totals = data?.kpis?.totals || {};
            const totalBills = Object.values(counts).reduce((s, n) => s + Number(n || 0), 0);
            const unpaidCount = Number(counts["Unpaid"] || 0);

            // Overdue details from arrears
            const arrears = await api.get("/billing/arrears", { params: { apartment_id: params.apartment_id } });
            const items = arrears?.data?.arrears || [];
            const overdueCount = items.length;
            const avgDaysOverdue = overdueCount
                ? Math.round(items.reduce((s, r) => s + Number(r.DaysOverdue || 0), 0) / overdueCount)
                : 0;

            setKpis({
                totalBills,
                expected: totals.sum_due || 0,
                collected: totals.sum_paid || 0,
                outstanding: totals.sum_balance || 0,
                overduePct: totalBills ? Math.round((overdueCount / totalBills) * 100) : 0,
                overdueCount,
                unpaidCount,
                avgDaysOverdue,
                collectionRate: totals.sum_due ? ((totals.sum_paid / totals.sum_due) * 100) : 0,
                countsByStatus: counts
            });

            // Insights
            const partially = Number(counts["Partially Paid"] || 0);
            const topApt = items
                .reduce((m, r) => {
                    const key = `${r.Apartment || "—"}`;
                    m[key] = (m[key] || 0) + 1;
                    return m;
                }, {});
            const topAptName = Object.entries(topApt).sort((a, b) => b[1] - a[1])[0]?.[0];

            setInsights([
                overdueCount ? `${overdueCount} tenant${overdueCount > 1 ? "s" : ""} are overdue (past due date).` : "No overdue tenants. Great job!",
                partially ? `${partially} bill${partially > 1 ? "s are" : " is"} partially paid.` : "No partial payments recorded.",
                topAptName ? `Highest unpaid concentration: ${topAptName}.` : "No apartment risk concentration detected."
            ]);
        } catch (e) {
            console.error(e);
        }
    };

    const loadCashflow = async () => {
        try {
            const start = (monthFilter === "All")
                ? dayjs().startOf("month")
                : dayjs(monthFilter, "MMMM YYYY").startOf("month");
            const end = start.endOf("month");
            const { data } = await api.get("/billing/cashflow", {
                params: { from: start.format("YYYY-MM-DD"), to: end.format("YYYY-MM-DD") }
            });
            setCashflowSeries(data?.series || []);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [monthFilter, statusFilter]);
    useEffect(() => { loadKpis().catch(console.error); /* eslint-disable-next-line */ }, [monthFilter, apartmentFilter]);
    useEffect(() => { loadCashflow().catch(console.error); /* eslint-disable-next-line */ }, [monthFilter]);

    /* ---------- Generate Bills ---------- */
    const handleGenerate = async () => {
        try {
            const { data } = await api.post("/bills/generate-or-update", { BillingMonth: monthFilter || NOW_MONTH });
            setSnack({ open: true, severity: "success", msg: data?.alert || `Bills generated for ${monthFilter}.` });
            load();
            loadKpis();
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: "Failed to generate/update bills." });
        }
    };

    /* ---------- Client filters ---------- */
    const filteredRows = rows.filter(r => {
        const byApt = apartmentFilter === "All" ? true : r.apt === apartmentFilter;
        const q = search.trim().toLowerCase();
        const bySearch = !q
            || r.tenant?.toLowerCase().includes(q)
            || r.unit?.toLowerCase().includes(q)
            || r.apt?.toLowerCase().includes(q)
            || r.status?.toLowerCase().includes(q)
            || String(r.amount).includes(q);
        return byApt && bySearch;
    });

    /* ---------- Sorting / Pagination ---------- */
    const sortedRows = [...filteredRows].sort((a, b) => {
        const dir = orderDir === "asc" ? 1 : -1;
        const va = a[orderBy], vb = b[orderBy];
        if (orderBy === "amount" || orderBy === "paid" || orderBy === "balance") return (Number(va) - Number(vb)) * dir;
        if (orderBy === "tenant" || orderBy === "apt" || orderBy === "unit" || orderBy === "status")
            return String(va).localeCompare(String(vb)) * dir;
        // dates
        return (dayjs(va).valueOf() - dayjs(vb).valueOf()) * dir;
    });
    const pagedRows = sortedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const handleSort = (key) => {
        if (orderBy === key) setOrderDir(prev => (prev === "asc" ? "desc" : "asc"));
        else { setOrderBy(key); setOrderDir("asc"); }
    };

    /* ---------- Selection / Bulk ---------- */
    const allSelected = pagedRows.length > 0 && pagedRows.every(r => selected.includes(r.BillID));
    const toggleSelectAll = (checked) => {
        if (checked) {
            const add = pagedRows.map(r => r.BillID).filter(id => !selected.includes(id));
            setSelected(prev => [...prev, ...add]);
        } else {
            const remove = new Set(pagedRows.map(r => r.BillID));
            setSelected(prev => prev.filter(id => !remove.has(id)));
        }
    };
    const toggleSelectOne = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const exportCSV = () => {
        const hdr = ["BillID", "Tenant", "Apartment", "Unit", "Month", "Amount", "Paid", "Balance", "DueDate", "Status"];
        const pick = (r) => [r.BillID, r.tenant, r.apt, r.unit, r.month, r.amount, r.paid, r.balance, r.dueISO, r.status];
        const base = selected.length ? filteredRows.filter(r => selected.includes(r.BillID)) : filteredRows;
        const data = base.map(pick);
        const lines = [hdr, ...data].map(arr => arr.map(val => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([lines], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url; a.download = `bills_${(monthFilter || NOW_MONTH).replace(/\s+/g, "_")}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const bulkRemind = async () => {
        try {
            const bill_ids = selected.length ? selected : filteredRows.filter(r => r.status !== "Paid").map(r => r.BillID);
            const body = {
                bill_ids,
                dry_run: false,
                message: "Dear {name}, your balance {balance} for {month} (unit {unit}) is overdue. Kindly clear. Thank you."
            };
            const { data } = await api.post("/billing/reminders", body);
            setSnack({ open: true, severity: "success", msg: `Reminders sent: ${data?.count || bill_ids.length}` });
        } catch (e) {
            console.error(e);
            setSnack({ open: true, severity: "error", msg: "Failed to send reminders." });
        }
    };

    /* ---------- Row actions ---------- */
    const openMenu = (event, row) => { setMenuAnchor(event.currentTarget); setMenuRow(row); };
    const closeMenu = () => { setMenuAnchor(null); };

    const onView = () => { setViewOpen(true); closeMenu(); };
    const onEdit = () => {
        setEditForm({ WaterBill: 0, ElectricityBill: 0, Garbage: 0, Internet: 0 });
        setEditOpen(true);
        closeMenu();
    };
    const onReminder = () => { setRemindOpen(true); closeMenu(); };

    const saveEdit = async () => {
        // Hook to POST /bills/generate-or-update with utilities to update this bill's month & tenant
        setEditOpen(false);
        setSnack({ open: true, severity: "success", msg: "Bill updated." });
        load();
        loadKpis();
    };
    const sendReminder = async () => {
        try {
            const body = { bill_ids: [menuRow?.BillID], dry_run: false };
            await api.post("/billing/reminders", body);
            setSnack({ open: true, severity: "success", msg: "Reminder sent." });
        } catch {
            setSnack({ open: true, severity: "error", msg: "Failed to send reminder." });
        }
        setRemindOpen(false);
    };

    /* ---------- Status chart data ---------- */
    const statusCounts = STATUS_ORDER.map(name => ({
        name,
        value: Number(kpis.countsByStatus?.[name] || 0)
    })).filter(x => x.value > 0);
    const STATUS_COLORS = {
        Paid: "#34D399", "Partially Paid": "#F59E0B", Overpaid: "#60A5FA", Unpaid: "#A78BFA"
    };

    /* ---------- Toolbar styles helper ---------- */
    const inputSx = {
        "& .MuiInputBase-root": { color: "#fff", bgcolor: "rgba(255,255,255,0.04)", borderRadius: 2 },
        "& fieldset": { borderColor: "rgba(255,255,255,0.20) !important" }
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Header */}
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
                    <IconButton onClick={() => { load(); loadKpis(); loadCashflow(); }} sx={{ color: "#fff" }}>
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
                    Generate Monthly Bills
                </Button>
            </Stack>

            {/* KPI Row 1 */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Total Bills" value={fmtNum(kpis.totalBills)} onClick={() => setStatusFilter("All")} icon={<PaymentsIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Expected" value={fmtKES(kpis.expected)} icon={<TrendingUpIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Collected" value={fmtKES(kpis.collected)} icon={<TrendingUpIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Outstanding" value={fmtKES(kpis.outstanding)} hint={`Overdue ${kpis.overduePct}%`} icon={<WarningAmberIcon fontSize="small" />} /></Grid>
            </Grid>

            {/* KPI Row 2 */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Collection Rate" value={fmtPct(kpis.collectionRate)} hint="Collected / Expected" icon={<TrendingUpIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Overdue Count" value={fmtNum(kpis.overdueCount)} onClick={() => setStatusFilter("All")} icon={<WarningAmberIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Avg Days Overdue" value={fmtNum(kpis.avgDaysOverdue)} icon={<TimelapseIcon fontSize="small" />} /></Grid>
                <Grid item xs={12} sm={6} md={3}><Kpi label="Unpaid Bills" value={fmtNum(kpis.unpaidCount)} onClick={() => setStatusFilter("Unpaid")} icon={<PaymentsIcon fontSize="small" />} /></Grid>
            </Grid>

            {/* Insights */}
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
                            Expected vs Collected (This Month)
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={cashflowSeries}>
                                <XAxis dataKey="date" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <RTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="expected" stroke="#7E00A6" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="collected" stroke="#FF0080" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Breakdown by Status (click to filter)
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusCounts}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={70}
                                        outerRadius={100}
                                        stroke="none"
                                        onClick={(slice) => {
                                            const name = slice?.name;
                                            if (name && STATUS_OPTIONS.includes(name)) setStatusFilter(name);
                                        }}
                                    >
                                        {statusCounts.map((d, i) => (
                                            <Cell key={i} fill={STATUS_COLORS[d.name] || "#8884d8"} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mt: 1 }}>
                            {statusCounts.map((d) => (
                                <Chip
                                    key={d.name}
                                    size="small"
                                    label={`${d.name} ${d.value}`}
                                    onClick={() => setStatusFilter(d.name)}
                                    sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead, cursor: "pointer" }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filter Toolbar */}
            <Paper elevation={0} sx={{ ...softCard, mb: 2, p: 2.5 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", md: "center" }}
                    useFlexGap
                    flexWrap="wrap"
                >
                    {/* Left cluster: month, status, apartment, search */}
                    <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" sx={{ flex: 1, minWidth: 280 }}>
                        <TextField
                            select size="small" label="Month" value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            sx={{ minWidth: 190, ...inputSx }}
                        >
                            {["All", ...monthOptions].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>

                        <TextField
                            select size="small" label="Status" value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            sx={{ minWidth: 170, ...inputSx }}
                        >
                            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                        </TextField>

                        <TextField
                            select size="small" label="Apartment" value={apartmentFilter}
                            onChange={(e) => setApartmentFilter(e.target.value)}
                            sx={{ minWidth: 200, ...inputSx }}
                        >
                            {["All", ...Array.from(new Set(rows.map(r => r.apt).filter(Boolean)))].map((a) => (
                                <MenuItem key={a} value={a}>{a}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            size="small" label="Search"
                            placeholder="Tenant, unit, amount…"
                            value={search}
                            inputRef={searchRef}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ minWidth: 260, flex: 1, ...inputSx }}
                        />
                    </Stack>

                    {/* Right cluster: actions */}
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                            size="small"
                            onClick={bulkRemind}
                            sx={{ textTransform: "none", borderRadius: 999, px: 2, color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            Bulk Remind
                        </Button>
                        <Button
                            size="small"
                            onClick={exportCSV}
                            sx={{ textTransform: "none", borderRadius: 999, px: 2, color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
                        >
                            Export CSV
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            {/* Table Card */}
            <Paper elevation={0} sx={{ ...softCard }}>
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
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            indeterminate={!allSelected && selected.some(id => pagedRows.map(r => r.BillID).includes(id))}
                                            checked={allSelected}
                                            onChange={(e) => toggleSelectAll(e.target.checked)}
                                        />
                                    </TableCell>
                                    <TableCell sortDirection={orderBy === "tenant" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "tenant"} direction={orderDir} onClick={() => handleSort("tenant")}>
                                            Tenant
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sortDirection={orderBy === "apt" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "apt"} direction={orderDir} onClick={() => handleSort("apt")}>
                                            Unit / Apartment
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Bill</TableCell>
                                    <TableCell align="right" sortDirection={orderBy === "amount" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "amount"} direction={orderDir} onClick={() => handleSort("amount")}>
                                            Amount Due
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right" sortDirection={orderBy === "paid" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "paid"} direction={orderDir} onClick={() => handleSort("paid")}>
                                            Paid
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell align="right" sortDirection={orderBy === "balance" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "balance"} direction={orderDir} onClick={() => handleSort("balance")}>
                                            Balance
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell sortDirection={orderBy === "dueISO" ? orderDir : false}>
                                        <TableSortLabel active={orderBy === "dueISO"} direction={orderDir} onClick={() => handleSort("dueISO")}>
                                            Due Date
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {pagedRows
                                    .filter(r => apartmentFilter === "All" ? true : r.apt === apartmentFilter)
                                    .map((r) => (
                                        <TableRow key={r.id} hover>
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selected.includes(r.BillID)}
                                                    onChange={() => toggleSelectOne(r.BillID)}
                                                />
                                            </TableCell>
                                            <TableCell>{r.tenant}</TableCell>
                                            <TableCell>{r.unit} — {r.apt}</TableCell>
                                            <TableCell>{r.type}</TableCell>
                                            <TableCell align="right">{fmtKES(r.amount)}</TableCell>
                                            <TableCell align="right">{fmtKES(r.paid)}</TableCell>
                                            <TableCell align="right">{fmtKES(r.balance)}</TableCell>
                                            <TableCell>{r.due}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={r.status}
                                                    sx={{
                                                        color: "#fff",
                                                        border: "1px solid rgba(255,255,255,0.14)",
                                                        bgcolor: STATUS_BG[r.status] || "rgba(167,139,250,.15)"
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
                                                    onClick={(e) => { setMenuRow(r); openMenu(e, r); }}
                                                >
                                                    Action
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={sortedRows.length}
                            page={page}
                            onPageChange={(_, p) => setPage(p)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            rowsPerPageOptions={[5, 10, 25, 50]}
                            sx={{ color: "#fff" }}
                        />

                        {/* Row action dropdown */}
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={closeMenu}
                            PaperProps={{
                                sx: { bgcolor: "#0e0a17", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }
                            }}
                        >
                            <MenuItem onClick={onView}>View</MenuItem>
                            <MenuItem onClick={onEdit}>Edit</MenuItem>
                            <MenuItem onClick={onReminder}>Reminder</MenuItem>
                            <MenuItem onClick={() => {
                                setPayForm(f => ({
                                    ...f,
                                    TenantID: menuRow?.TenantID || "",
                                    RentalUnitID: menuRow?.RentalUnitID || "",
                                    BillingMonth: menuRow?.month || NOW_MONTH
                                }));
                                setPayOpen(true);
                                closeMenu();
                            }}>Record Payment</MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>

            {/* View Dialog */}
            <Dialog open={viewOpen} onClose={() => setViewOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Bill Details</DialogTitle>
                <DialogContent dividers>
                    {menuRow ? (
                        <Stack spacing={1}>
                            <Typography><b>Tenant:</b> {menuRow.tenant}</Typography>
                            <Typography><b>Apartment / Unit:</b> {menuRow.apt} / {menuRow.unit}</Typography>
                            <Typography><b>Billing Month:</b> {menuRow.month}</Typography>
                            <Typography><b>Amount Due:</b> {fmtKES(menuRow.amount)}</Typography>
                            <Typography><b>Paid:</b> {fmtKES(menuRow.paid)}</Typography>
                            <Typography><b>Balance:</b> {fmtKES(menuRow.balance)}</Typography>
                            <Typography><b>Due Date:</b> {menuRow.dueISO ? dayjs(menuRow.dueISO).format("DD MMM YYYY") : "—"}</Typography>
                            <Typography><b>Status:</b> {menuRow.status}</Typography>
                            {/* Consider pulling ledger here via /billing/tenant/:id/ledger */}
                        </Stack>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog (utilities adjustments placeholder) */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Edit Bill</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Water Bill"
                            type="number"
                            value={editForm.WaterBill}
                            onChange={(e) => setEditForm({ ...editForm, WaterBill: Number(e.target.value) })}
                        />
                        <TextField
                            label="Electricity Bill"
                            type="number"
                            value={editForm.ElectricityBill}
                            onChange={(e) => setEditForm({ ...editForm, ElectricityBill: Number(e.target.value) })}
                        />
                        <TextField
                            label="Garbage"
                            type="number"
                            value={editForm.Garbage}
                            onChange={(e) => setEditForm({ ...editForm, Garbage: Number(e.target.value) })}
                        />
                        <TextField
                            label="Internet"
                            type="number"
                            value={editForm.Internet}
                            onChange={(e) => setEditForm({ ...editForm, Internet: Number(e.target.value) })}
                        />
                        <Typography variant="caption" sx={{ opacity: .8 }}>
                            Tip: Wire this form to a backend route that updates a bill by ID, then recompute totals server-side.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveEdit}>Save</Button>
                </DialogActions>
            </Dialog>

            {/* Reminder Dialog */}
            <Dialog open={remindOpen} onClose={() => setRemindOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle>Send Reminder</DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        Send payment reminder to <b>{menuRow?.tenant}</b> for <b>{menuRow?.month}</b>?
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: .8 }}>
                        This will use your notifications service.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRemindOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={sendReminder}>Send</Button>
                </DialogActions>
            </Dialog>

            {/* Record Payment Dialog */}
            <Dialog open={payOpen} onClose={() => setPayOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Record Payment</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField label="TenantID" value={payForm.TenantID} onChange={e => setPayForm({ ...payForm, TenantID: e.target.value })} />
                        <TextField label="RentalUnitID" value={payForm.RentalUnitID} onChange={e => setPayForm({ ...payForm, RentalUnitID: e.target.value })} />
                        <TextField label="Billing Month" value={payForm.BillingMonth || monthFilter} onChange={e => setPayForm({ ...payForm, BillingMonth: e.target.value })} />
                        <TextField label="Amount Paid" type="number" value={payForm.AmountPaid} onChange={e => setPayForm({ ...payForm, AmountPaid: e.target.value })} />
                        <TextField label="Paid Via" value={payForm.PaidViaMobile} onChange={e => setPayForm({ ...payForm, PaidViaMobile: e.target.value })} />
                        <TextField label="Tx Ref" value={payForm.TxRef} onChange={e => setPayForm({ ...payForm, TxRef: e.target.value })} />
                        <TextField label="Note" value={payForm.PaymentNote} onChange={e => setPayForm({ ...payForm, PaymentNote: e.target.value })} />
                        <Typography variant="caption" sx={{ opacity: .8 }}>
                            Tip: if you add TenantID & RentalUnitID to `/bills` response, these fields prefill automatically.
                        </Typography>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPayOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            try {
                                const body = {
                                    TenantID: Number(payForm.TenantID),
                                    RentalUnitID: Number(payForm.RentalUnitID),
                                    BillingMonth: payForm.BillingMonth || monthFilter || NOW_MONTH,
                                    AmountPaid: Number(payForm.AmountPaid),
                                    PaidViaMobile: payForm.PaidViaMobile || "MPesa",
                                    TxRef: payForm.TxRef || undefined,
                                    PaymentNote: payForm.PaymentNote || undefined
                                };
                                await api.post("/tenant-payments", body);
                                setSnack({ open: true, severity: "success", msg: "Payment recorded." });
                                setPayOpen(false);
                                load();
                                loadKpis();
                            } catch (e) {
                                console.error(e);
                                setSnack({ open: true, severity: "error", msg: "Failed to record payment." });
                            }
                        }}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack({ ...snack, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnack({ ...snack, open: false })} severity={snack.severity} variant="filled">
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
}
