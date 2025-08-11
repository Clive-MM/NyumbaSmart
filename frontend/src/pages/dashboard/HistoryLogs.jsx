// src/pages/HistoryLogs.jsx
import React, { useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, InputAdornment, Avatar
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import {
    ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, Legend
} from "recharts";
import dayjs from "dayjs";

/* ---------- Brand + Fonts (consistent with Properties/Billing/Payments/Expenses) ---------- */
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
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(n || 0))}`;

/* ---------- Tiny reusable ---------- */
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

/* ---------- Mock data (mirrors your DB screenshot) ---------- */
// TransferLogs
const transferLogs = [
    { LogID: 2, TenantID: 2, OldUnitID: null, NewUnitID: 4, TransferredBy: 1, TransferDate: "2025-06-24 18:20:39.653", Reason: "Returning tenant" },
    { LogID: 3, TenantID: 2, OldUnitID: 5, NewUnitID: 1, TransferredBy: 1, TransferDate: "2025-06-25 18:11:47.543", Reason: "Moved to smaller unit" },
    { LogID: 4, TenantID: 1003, OldUnitID: 2, NewUnitID: 5, TransferredBy: 1, TransferDate: "2025-06-25 16:18:53.523", Reason: "Requested better lighting" },
    { LogID: 5, TenantID: 1003, OldUnitID: 1004, NewUnitID: 4, TransferredBy: 1, TransferDate: "2025-07-25 19:37:34.693", Reason: "Tenant requested a bigger unit" },
    { LogID: 6, TenantID: 1003, OldUnitID: 1004, NewUnitID: 1005, TransferredBy: 1, TransferDate: "2025-07-25 19:42:58.500", Reason: "Moving to a different house in the same apartment" },
];
// VacateLogs
const vacateLogs = [
    { LogID: 1, TenantID: 2, UnitID: 2, ApartmentID: 1, VacatedBy: 1, VacateDate: "2025-06-24 17:19:22.277", Reason: null, Notes: null },
    { LogID: 2, TenantID: 2, UnitID: 3, ApartmentID: 2, VacatedBy: 1, VacateDate: "2025-06-24 18:06:11.430", Reason: null, Notes: null },
    { LogID: 3, TenantID: 1003, UnitID: 1002, ApartmentID: 2, VacatedBy: 1, VacateDate: "2025-06-25 17:57:12.873", Reason: "Tenant requested to leave", Notes: "Moved to another town for work" },
    { LogID: 4, TenantID: 1009, UnitID: 1005, ApartmentID: 1002, VacatedBy: 1, VacateDate: "2025-07-25 19:32:18.793", Reason: null, Notes: null },
];

/* ---------- Helpers ---------- */
const monthsList = Array.from({ length: 12 }, (_, i) =>
    dayjs().subtract(i, "month").format("MMMM YYYY")
);
const COLORS = { transfer: "#60A5FA", vacate: "#F59E0B" };

function toEvents(transfers, vacates) {
    const t = transfers.map((x) => ({
        id: `T-${x.LogID}`,
        ts: dayjs(x.TransferDate),
        type: "transfer",
        title: "Transfer",
        detail: x.Reason || "Transfer",
        meta: x,
    }));
    const v = vacates.map((x) => ({
        id: `V-${x.LogID}`,
        ts: dayjs(x.VacateDate),
        type: "vacate",
        title: "Vacate",
        detail: x.Reason || "Vacate recorded",
        meta: x,
    }));
    return [...t, ...v].sort((a, b) => b.ts.valueOf() - a.ts.valueOf());
}

/* ---------- Timeline item ---------- */
function TimelineItem({ e }) {
    const isTransfer = e.type === "transfer";
    const icon = isTransfer ? <SwapHorizIcon /> : <LogoutIcon />;
    const chipColor = isTransfer ? COLORS.transfer : COLORS.vacate;

    return (
        <Stack direction="row" spacing={1.5} sx={{ position: "relative", pl: 2 }}>
            <Box
                sx={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    width: 2, bgcolor: "rgba(255,255,255,0.08)",
                }}
            />
            <Avatar sx={{ width: 28, height: 28, bgcolor: chipColor }}>{icon}</Avatar>
            <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                        {e.title}
                    </Typography>
                    <Chip
                        size="small"
                        label={isTransfer ? "Transfer" : "Vacate"}
                        sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                    />
                    {isTransfer && (
                        <Chip
                            size="small"
                            icon={<ApartmentIcon sx={{ color: "#fff!important" }} />}
                            label={`Unit ${e.meta.OldUnitID ?? "—"} → ${e.meta.NewUnitID}`}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                        />
                    )}
                </Stack>
                <Typography variant="body2" sx={{ opacity: .9, mt: .25, fontFamily: FONTS.subhead }}>
                    {e.detail}
                </Typography>
                <Typography variant="caption" sx={{ opacity: .7, fontFamily: FONTS.subhead }}>
                    {e.ts.format("DD MMM YYYY, HH:mm")}
                </Typography>
            </Box>
        </Stack>
    );
}

/* ---------- Page ---------- */
export default function HistoryLogs() {
    const [filter, setFilter] = useState({
        q: "",
        month: monthsList[0],
        type: "All",
    });

    const events = useMemo(() => toEvents(transferLogs, vacateLogs), []);
    const eventsFiltered = events.filter((e) => {
        const inMonth = e.ts.format("MMMM YYYY") === filter.month;
        const byType = filter.type === "All" || e.type === filter.type;
        const byQ =
            !filter.q ||
            (e.detail + " " + (e.meta?.Notes || "")).toLowerCase().includes(filter.q.toLowerCase());
        return inMonth && byType && byQ;
    });

    // KPIs
    const transfersCount = eventsFiltered.filter((e) => e.type === "transfer").length;
    const vacatesCount = eventsFiltered.filter((e) => e.type === "vacate").length;
    const unitsImpacted = new Set(
        eventsFiltered
            .map((e) => (e.type === "transfer" ? e.meta.NewUnitID : e.meta.UnitID))
            .filter(Boolean)
    ).size;

    // Donut breakdown
    const donut = [
        { name: "Transfers", value: transfersCount, c: COLORS.transfer },
        { name: "Vacates", value: vacatesCount, c: COLORS.vacate },
    ].filter((d) => d.value > 0);

    // Insights
    const topReason =
        eventsFiltered
            .filter((e) => e.detail)
            .map((e) => e.detail)
            .sort(
                (a, b) =>
                    eventsFiltered.filter((e) => e.detail === b).length -
                    eventsFiltered.filter((e) => e.detail === a).length
            )[0] || "—";

    const recentTransfers = transferLogs
        .slice()
        .sort((a, b) => dayjs(b.TransferDate).valueOf() - dayjs(a.TransferDate).valueOf())
        .slice(0, 5);
    const recentVacates = vacateLogs
        .slice()
        .sort((a, b) => dayjs(b.VacateDate).valueOf() - dayjs(a.VacateDate).valueOf())
        .slice(0, 5);

    const exportCsv = () => {
        const rows = eventsFiltered.map((e) => ({
            Type: e.type,
            Date: e.ts.format("YYYY-MM-DD HH:mm"),
            TenantID: e.meta.TenantID ?? "",
            Unit_From: e.meta.OldUnitID ?? "",
            Unit_To: e.meta.NewUnitID ?? "",
            Unit: e.meta.UnitID ?? "",
            ApartmentID: e.meta.ApartmentID ?? "",
            Reason: e.detail || "",
            Notes: e.meta.Notes || "",
        }));
        if (rows.length === 0) return;

        const head = Object.keys(rows[0]).join(",");
        const body = rows
            .map((r) =>
                Object.values(r)
                    .map((v) => `"${String(v).replace(/"/g, '""')}"`)
                    .join(",")
            )
            .join("\n");
        const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `history_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Title + actions */}
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
                    History Logs
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
                <Button
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={exportCsv}
                    variant="outlined"
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
                    startIcon={<NoteAddIcon />}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                        "&:hover": { boxShadow: BRAND.glow },
                    }}
                    onClick={() => console.log("Open Add Note modal")}
                >
                    Add Note
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label={`Transfers — ${filter.month}`} value={transfersCount} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label={`Vacates — ${filter.month}`} value={vacatesCount} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label="Units Impacted" value={unitsImpacted} />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Kpi label="Top Reason" value={topReason} />
                </Grid>
            </Grid>

            {/* Insights */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Insight text="Keep an eye on repeat transfers — they often signal unit mismatch or pricing friction." />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Insight text="Vacates cluster near month end; consider automated retention messages 10 days before." />
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search reason, notes…"
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
                        {monthsList.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Type" value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        sx={{ minWidth: 160, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["All", "transfer", "vacate"].map((t) => <MenuItem key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</MenuItem>)}
                    </TextField>
                </Stack>
            </Paper>

            {/* Charts + Timeline + Side tables */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Donut breakdown */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .9, mb: 1 }}>
                            Events by Type — {filter.month}
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={62} outerRadius={95} stroke="none">
                                        {donut.map((d, i) => <Cell key={i} fill={d.c} />)}
                                    </Pie>
                                    <RTooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>

                {/* Timeline */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={0} sx={{ ...softCard }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                            Timeline — {filter.month}
                        </Typography>
                        <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                        {eventsFiltered.length === 0 ? (
                            <Typography variant="body2" sx={{ opacity: .72, fontFamily: FONTS.subhead, py: 4, textAlign: "center" }}>
                                No events for the selected filters.
                            </Typography>
                        ) : (
                            <Stack spacing={1.5} sx={{ pb: 1 }}>
                                {eventsFiltered.map((e) => (
                                    <Paper key={e.id} elevation={0} sx={{ ...softCard, p: 1.5, "&:hover": { transform: "none" } }}>
                                        <TimelineItem e={e} />
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Recent Transfers & Vacates */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ ...softCard }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                            Recent Transfers
                        </Typography>
                        <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                        <Table size="small" sx={{ "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>TenantID</TableCell>
                                    <TableCell>From → To</TableCell>
                                    <TableCell>Reason</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentTransfers.map((r) => (
                                    <TableRow key={r.LogID} hover>
                                        <TableCell>{dayjs(r.TransferDate).format("DD MMM YYYY, HH:mm")}</TableCell>
                                        <TableCell>{r.TenantID}</TableCell>
                                        <TableCell>{(r.OldUnitID ?? "—")} → {r.NewUnitID}</TableCell>
                                        <TableCell>{r.Reason || "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ ...softCard }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                            Recent Vacates
                        </Typography>
                        <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                        <Table size="small" sx={{ "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead } }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>TenantID</TableCell>
                                    <TableCell>UnitID</TableCell>
                                    <TableCell>Reason</TableCell>
                                    <TableCell>Notes</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {recentVacates.map((r) => (
                                    <TableRow key={r.LogID} hover>
                                        <TableCell>{dayjs(r.VacateDate).format("DD MMM YYYY, HH:mm")}</TableCell>
                                        <TableCell>{r.TenantID}</TableCell>
                                        <TableCell>{r.UnitID}</TableCell>
                                        <TableCell>{r.Reason || "—"}</TableCell>
                                        <TableCell>{r.Notes || "—"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
