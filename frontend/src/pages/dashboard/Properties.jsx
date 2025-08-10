// src/pages/Properties.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Paper, Typography, Grid, Chip, Button, IconButton, Tooltip,
    Snackbar, Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Stack
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const monthKey = dayjs().format("MMMM YYYY");

const fmtNum = (n) => new Intl.NumberFormat().format(Number(n || 0));
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(n || 0))}`;

const OCCUPIED_COLOR = "#6EE7B7";
const VACANT_COLOR = "#FB7185";
const RESERVED_COLOR = "#FDE68A";

// ---------- Brand + fonts ----------
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

// ---------- Neumorphic card base ----------
const softCard = {
    p: 2,
    borderRadius: 3,
    color: "#fff",
    background: "#0e0a17",
    // dual soft shadows for dark neumorphism
    boxShadow:
        "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03), inset 0 0 0 rgba(255,255,255,0)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
        transform: "translateY(-3px)",
        boxShadow:
            "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        // brand ring & glow
        outline: "1px solid transparent",
        background:
            "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
        boxDecorationBreak: "clone",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    }
};

// small square KPI (top row)
function KpiCard({ icon, label, value, sublabel }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 120 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography variant="body2" sx={{ opacity: 0.88, fontFamily: FONTS.subhead, letterSpacing: .2 }}>
                    {label}
                </Typography>
            </Stack>
            <Typography variant="h5" sx={{ mt: .5, fontWeight: 800, fontFamily: FONTS.number }}>
                {value}
            </Typography>
            {sublabel ? (
                <Typography variant="caption" sx={{ opacity: 0.72, fontFamily: FONTS.subhead }}>
                    {sublabel}
                </Typography>
            ) : null}
        </Paper>
    );
}

// wide rectangular KPI (second row)
function RectCard({ icon, label, value, help }) {
    return (
        <Paper
            elevation={0}
            sx={{
                ...softCard,
                p: 2.25,
                borderRadius: 2,
                height: 88,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: .25
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                {icon}
                <Typography variant="body2" sx={{ opacity: 0.88, fontFamily: FONTS.subhead }}>{label}</Typography>
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: FONTS.number }}>{value}</Typography>
                {help ? <Typography variant="caption" sx={{ opacity: .7, fontFamily: FONTS.subhead }}>{help}</Typography> : null}
            </Stack>
        </Paper>
    );
}

function Donut({ occupied = 0, vacant = 0, reserved = 0, size = 72 }) {
    const data = [
        { name: "Occupied", value: occupied, c: OCCUPIED_COLOR },
        { name: "Vacant", value: vacant, c: VACANT_COLOR },
        { name: "Reserved", value: reserved, c: RESERVED_COLOR },
    ].filter((d) => d.value > 0);

    const total = occupied + vacant + reserved;
    const occRate = total ? Math.round((occupied / total) * 100) : 0;

    return (
        <Box sx={{ position: "relative", width: size, height: size, transition: "transform .25s ease" }} className="donut">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        innerRadius={size / 2 - 12}
                        outerRadius={size / 2}
                        paddingAngle={1}
                        stroke="none"
                    >
                        {data.map((entry, i) => (
                            <Cell key={i} fill={entry.c} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <Box
                sx={{
                    position: "absolute", inset: 0, display: "grid",
                    placeItems: "center", fontSize: 12, color: "#fff",
                    fontWeight: 700, fontFamily: FONTS.number,
                }}
            >
                {occRate}%
            </Box>
        </Box>
    );
}

function PropertyCard({ p, onOpen }) {
    const s = p.Stats || {};
    return (
        <Paper
            elevation={0}
            onClick={() => onOpen?.(p)}
            sx={{
                ...softCard,
                cursor: "pointer",
                height: "100%",
                "&:hover .donut": { transform: "scale(1.06)" }
            }}
        >
            <Stack direction="row" alignItems="center" spacing={1}>
                <HomeWorkIcon fontSize="small" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                    {p.ApartmentName}
                </Typography>
                <Chip
                    size="small"
                    label={p.Location || "—"}
                    sx={{
                        ml: "auto",
                        color: "#fff",
                        border: "1px solid rgba(255,255,255,0.12)",
                        bgcolor: "rgba(255,255,255,0.04)",
                        fontFamily: FONTS.subhead
                    }}
                />
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 1.5 }}>
                <Donut
                    occupied={s.OccupiedUnits || 0}
                    vacant={s.VacantUnits || 0}
                    reserved={s.ReservedUnits || 0}
                />
                <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <Chip size="small" label={`Units: ${fmtNum(s.TotalUnits)}`}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }} />
                        <Chip size="small" label={`Occupied: ${fmtNum(s.OccupiedUnits)}`}
                            icon={<CheckCircleOutlineIcon sx={{ color: OCCUPIED_COLOR }} />}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }} />
                        <Chip size="small" label={`Vacant: ${fmtNum(s.VacantUnits)}`}
                            icon={<CancelOutlinedIcon sx={{ color: VACANT_COLOR }} />}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)", fontFamily: FONTS.subhead }} />
                    </Stack>
                    {p.Description ? (
                        <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.8, fontFamily: FONTS.subhead }}>
                            {p.Description}
                        </Typography>
                    ) : null}
                </Box>
            </Stack>

            <Divider sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.08)" }} />
            <Stack direction="row" spacing={1}>
                <Button
                    onClick={(e) => { e.stopPropagation(); onOpen?.(p); }}
                    size="small"
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}
                    startIcon={<OpenInNewIcon />}
                >
                    View Apartment
                </Button>
                <Button size="small" variant="outlined"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" }
                    }}>
                    Units
                </Button>
                <Button size="small" variant="outlined"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" }
                    }}>
                    Tenants
                </Button>
            </Stack>
        </Paper>
    );
}

// ---------------- Main component (logic unchanged) ----------------
export default function Properties() {
    const [loading, setLoading] = useState(true);
    const [apartments, setApartments] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [collectedThisMonth, setCollectedThisMonth] = useState(0);
    const [overdueThisMonth, setOverdueThisMonth] = useState(0);
    const [expensesMonthTotal, setExpensesMonthTotal] = useState(0);
    const [expensesByApartment, setExpensesByApartment] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = axios.create({
        baseURL: API,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [
                aptsRes, tenantsRes, billsMonthRes, unpaidRes, partialRes,
                expByAptRes, expByMonthRes,
            ] = await Promise.all([
                api.get("/myapartments"),
                api.get("/tenants"),
                api.get(`/bills/month/${encodeURIComponent(monthKey)}`).catch(() => ({ data: { bills: [] } })),
                api.get("/bills/status/Unpaid").catch(() => ({ data: { bills: [] } })),
                api.get("/bills/status/Partially%20Paid").catch(() => ({ data: { bills: [] } })),
                api.get("/landlord-expenses/by-apartment").catch(() => ({ data: { expenses: {} } })),
                api.get("/landlord-expenses/by-month").catch(() => ({ data: { expenses: {} } })),
            ]);

            const apts = (aptsRes.data?.Apartments || []).map((a) => ({
                ...a,
                Stats: a.Stats || { TotalUnits: 0, OccupiedUnits: 0, VacantUnits: 0, ReservedUnits: 0, VacancyRate: 0 },
            }));
            setApartments(apts);
            setTenants(tenantsRes.data?.tenants || []);

            const monthBills = billsMonthRes.data?.bills || [];
            const collected = monthBills.filter((b) => b.BillStatus === "Paid")
                .reduce((acc, b) => acc + Number(b.TotalAmountDue || 0), 0);
            setCollectedThisMonth(collected);

            const overdue =
                (unpaidRes.data?.bills || []).reduce((a, b) => a + Number(b.TotalAmountDue || 0), 0) +
                (partialRes.data?.bills || []).reduce((a, b) => a + Number(b.TotalAmountDue || 0), 0);
            setOverdueThisMonth(overdue);

            const byApt = expByAptRes.data?.expenses || {};
            const byMonth = expByMonthRes.data?.expenses || {};
            const monthList = byMonth[monthKey] || [];
            setExpensesMonthTotal(monthList.reduce((sum, r) => sum + Number(r.Amount || 0), 0));

            const byApartmentMonth = Object.entries(byApt).map(([aptName, arr]) => {
                const totalMonth = arr
                    .filter((e) => dayjs(e.ExpenseDate, "YYYY-MM-DD").format("MMMM YYYY") === monthKey)
                    .reduce((sum, e) => sum + Number(e.Amount || 0), 0);
                return { apartment: aptName, totalMonth };
            }).sort((a, b) => b.totalMonth - a.totalMonth);
            setExpensesByApartment(byApartmentMonth);
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: "Failed to load data. Check API/token.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

    const kpi = useMemo(() => {
        const totals = apartments.reduce(
            (acc, a) => {
                const s = a.Stats || {};
                acc.units += s.TotalUnits || 0;
                acc.occ += s.OccupiedUnits || 0;
                acc.vac += s.VacantUnits || 0;
                return acc;
            },
            { units: 0, occ: 0, vac: 0 }
        );
        const occRate = totals.units ? Math.round((totals.occ / totals.units) * 100) : 0;
        return {
            totalApartments: apartments.length,
            totalUnits: totals.units,
            occupied: totals.occ,
            vacant: totals.vac,
            occupancyRate: occRate,
        };
    }, [apartments]);

    const exportCSV = () => {
        try {
            const rows = tenants.map((t) => ({
                TenantID: t.TenantID,
                FullName: t.FullName,
                Apartment: t.Apartment,
                Unit: t.RentalUnit,
                Phone: t.Phone,
                Status: t.Status,
                MoveInDate: t.MoveInDate || "",
            }));
            const head = Object.keys(rows[0] || { Sample: "" }).join(",");
            const body = rows.map((r) => Object.values(r).map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
            const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a"); a.href = url;
            a.download = `tenants_${dayjs().format("YYYYMMDD_HHmmss")}.csv`; a.click();
            URL.revokeObjectURL(url);
        } catch {
            setSnackbar({ open: true, message: "Export failed.", severity: "error" });
        }
    };

    const generateBills = async () => {
        try {
            const { data } = await api.post("/bills/generate-or-update", { BillingMonth: monthKey });
            setSnackbar({ open: true, message: data.alert || "Bills generated.", severity: "success" });
            fetchAll();
        } catch {
            setSnackbar({ open: true, message: "Failed to generate bills.", severity: "error" });
        }
    };

    const handleOpenApartment = (p) => {
        console.log("open apartment", p.ApartmentID);
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
                    Properties
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchAll} sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none", "&:hover": { boxShadow: BRAND.glow } }}
                    onClick={() => console.log("Add Property dialog")}
                >
                    Add Property
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3} lg={2.4}><KpiCard icon={<ApartmentIcon fontSize="small" />} label="Total Apartments" value={fmtNum(kpi.totalApartments)} /></Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}><KpiCard icon={<PeopleIcon fontSize="small" />} label="Occupancy Rate" value={`${kpi.occupancyRate}%`} sublabel={`${fmtNum(kpi.occupied)} occupied`} /></Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}><KpiCard icon={<HomeWorkIcon fontSize="small" />} label="Total Units" value={fmtNum(kpi.totalUnits)} /></Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}><KpiCard icon={<CheckCircleOutlineIcon fontSize="small" />} label="Occupied" value={fmtNum(kpi.occupied)} /></Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}><KpiCard icon={<CancelOutlinedIcon fontSize="small" />} label="Vacant" value={fmtNum(kpi.vacant)} /></Grid>
            </Grid>

            {/* Money row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}><RectCard icon={<LocalAtmOutlinedIcon sx={{ color: "#6EE7B7" }} />} label={`Collected — ${monthKey}`} value={fmtKES(collectedThisMonth)} help="Sum of Paid bills" /></Grid>
                <Grid item xs={12} md={4}><RectCard icon={<WarningAmberOutlinedIcon sx={{ color: "#FB7185" }} />} label="Overdue (unpaid & partial)" value={fmtKES(overdueThisMonth)} help="Outstanding before payments" /></Grid>
                <Grid item xs={12} md={4}><RectCard icon={<ReceiptLongOutlinedIcon sx={{ color: "#A78BFA" }} />} label={`Expenses — ${monthKey}`} value={fmtKES(expensesMonthTotal)} help="Across all apartments" /></Grid>
            </Grid>

            {/* Expenses by Apartment */}
            <Paper elevation={0} sx={{ ...softCard, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Expenses by Apartment — {monthKey}
                </Typography>
                {expensesByApartment.length === 0 ? (
                    <Typography variant="body2" sx={{ opacity: .72, fontFamily: FONTS.subhead }}>No expenses recorded this month.</Typography>
                ) : (
                    <Grid container spacing={1.5}>
                        {expensesByApartment.map((e) => (
                            <Grid key={e.apartment} item xs={12} sm={6} md={4} lg={3}>
                                <Paper elevation={0} sx={{ ...softCard, p: 1.5, borderRadius: 2, height: 72, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                    <Typography variant="body2" sx={{ opacity: .85, mb: .25, fontFamily: FONTS.subhead }}>{e.apartment}</Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: FONTS.number }}>{fmtKES(e.totalMonth)}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>

            {/* Properties grid */}
            <Typography variant="h6" sx={{ color: "#fff", mb: 1, fontWeight: 800, fontFamily: FONTS.subhead }}>
                Your Properties
            </Typography>
            {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 6 }}><CircularProgress /></Box>
            ) : apartments.length === 0 ? (
                <Paper elevation={0} sx={{ ...softCard, textAlign: "center", mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, fontFamily: FONTS.subhead }}>No properties found</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8, fontFamily: FONTS.subhead }}>Try adding your first property.</Typography>
                </Paper>
            ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {apartments.map((p) => (
                        <Grid key={p.ApartmentID} item xs={12} sm={6} md={4} lg={3}>
                            <PropertyCard p={p} onOpen={console.log} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Rental Units & Tenants */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontFamily: FONTS.subhead }}>
                        Rental Units & Tenants
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" startIcon={<FileDownloadOutlinedIcon />}
                            sx={{ textTransform: "none", borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.35)", "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" } }}
                            onClick={() => { /* exportCSV(); */ }}>
                            Export CSV
                        </Button>
                        <Button size="small" variant="outlined" startIcon={<RequestQuoteOutlinedIcon />}
                            sx={{ textTransform: "none", borderRadius: 2, color: "#fff", borderColor: "rgba(255,255,255,0.35)", "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" } }}
                            onClick={() => { /* generateBills(); */ }}>
                            Generate Bills
                        </Button>
                    </Stack>
                </Stack>

                <Table size="small" sx={{ "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell>Unit</TableCell>
                            <TableCell>Property</TableCell>
                            <TableCell>Tenant</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Move In</TableCell>
                            <TableCell align="right">Arrears</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* feed your tenants here as before */}
                    </TableBody>
                </Table>
            </Paper>

            <Snackbar
                open={false}
                autoHideDuration={4000}
                onClose={() => { }}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="success" sx={{ width: "100%" }}>ok</Alert>
            </Snackbar>
        </Box>
    );
}
