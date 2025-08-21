import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    MenuItem, InputAdornment, Avatar, Select, FormControl, InputLabel, TextField
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import LogoutIcon from "@mui/icons-material/Logout";
import ApartmentIcon from "@mui/icons-material/Apartment";
import dayjs from "dayjs";

/* ---------- API base (fixes “import.meta” warning) ---------- */
const API_BASE =
    process.env.REACT_APP_API_BASE ||
    (typeof window !== "undefined" && window.__API_URL__) ||
    "http://localhost:5000";

/* ---------- Theme bits ---------- */
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
    boxShadow: "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    transition: "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        background: "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    },
};
const COLORS = { transfer: "#60A5FA", vacate: "#F59E0B" };
const monthsList = Array.from({ length: 18 }, (_, i) => dayjs().subtract(i, "month").format("MMMM YYYY"));
const fmtTs = (s) => (s ? dayjs(s).format("DD MMM YYYY, HH:mm") : "—");

/* ---------- tiny UI pieces ---------- */
function KpiSquare({ label, value, sub }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, p: 2, borderRadius: 2 }}>
            <Typography variant="caption" sx={{ opacity: .8, fontFamily: FONTS.subhead }}>
                {label}
            </Typography>
            <Typography variant="h5" sx={{ mt: .5, fontWeight: 900, fontFamily: FONTS.number }}>
                {value}
            </Typography>
            {sub && (
                <Typography variant="caption" sx={{ opacity: .7, mt: .25, display: "block", fontFamily: FONTS.subhead }}>
                    {sub}
                </Typography>
            )}
        </Paper>
    );
}
function Insight({ text }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, height: 60, display: "flex", alignItems: "center", px: 2 }}>
            <Typography variant="body2" sx={{ fontFamily: FONTS.subhead, opacity: .92 }} noWrap>
                {text}
            </Typography>
        </Paper>
    );
}
function TimelineItem({ e }) {
    const isTransfer = e.type === "transfer";
    const icon = isTransfer ? <SwapHorizIcon /> : <LogoutIcon />;
    const chipColor = isTransfer ? COLORS.transfer : COLORS.vacate;

    return (
        <Stack direction="row" spacing={1.25} sx={{ p: 1.25, borderRadius: 2, background: "rgba(255,255,255,.02)" }}>
            <Avatar sx={{ width: 26, height: 26, bgcolor: chipColor }}>{icon}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontFamily: FONTS.subhead }} noWrap>
                        {isTransfer ? "Transfer" : "Vacate"}
                    </Typography>
                    <Chip size="small" label={isTransfer ? "Transfer" : "Vacate"} sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }} />
                    {isTransfer ? (
                        <Chip
                            size="small"
                            icon={<ApartmentIcon sx={{ color: "#fff!important" }} />}
                            label={`${e.FromUnit || "—"} → ${e.ToUnit || "—"}`}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                        />
                    ) : (
                        <Chip
                            size="small"
                            icon={<ApartmentIcon sx={{ color: "#fff!important" }} />}
                            label={e.Unit || "—"}
                            sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                        />
                    )}
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" sx={{ opacity: .7, fontFamily: FONTS.subhead }} noWrap>
                        {fmtTs(e.Timestamp)}
                    </Typography>
                </Stack>
                {e.Reason && (
                    <Typography variant="body2" sx={{ opacity: .9, mt: .25, fontFamily: FONTS.subhead }} noWrap>
                        {e.Reason}
                    </Typography>
                )}
                {e.Notes && (
                    <Typography variant="body2" sx={{ opacity: .75, mt: .25, fontFamily: FONTS.subhead }} noWrap>
                        {e.Notes}
                    </Typography>
                )}
            </Box>
        </Stack>
    );
}

/* ---------- Page ---------- */
export default function HistoryLogs() {
    const token = localStorage.getItem("token");
    const abortRef = useRef(null);

    const [apartments, setApartments] = useState([{ ApartmentID: 0, ApartmentName: "All Apartments" }]);
    const [filter, setFilter] = useState({ apartment_id: 0, month: monthsList[0], type: "all" });

    // NOTE: removed from the filter bar on purpose (per request)
    const [tableSearch, setTableSearch] = useState("");

    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({ transfers: 0, vacates: 0, unitsImpacted: 0, topReason: "—" });
    const [timeline, setTimeline] = useState([]);
    const [recent, setRecent] = useState({ recentTransfers: [], recentVacates: [] });

    /* -------- helpers -------- */
    const authFetch = useCallback(async (url, opts = {}) => {
        abortRef.current?.abort?.();
        const controller = new AbortController();
        abortRef.current = controller;

        const res = await fetch(url, {
            ...opts,
            signal: controller.signal,
            headers: {
                "Content-Type": opts.body instanceof FormData ? undefined : "application/json",
                Authorization: `Bearer ${token}`,
                ...(opts.headers || {})
            }
        });
        if (!res.ok) throw new Error((await res.text()) || "Request failed");
        return res;
    }, [token]);

    const loadAll = useCallback(async () => {
        setLoading(true);
        try {
            // 1) apartments for filter
            const a = await authFetch(`${API_BASE}/myapartments`);
            const ajson = await a.json();
            const aps = [{ ApartmentID: 0, ApartmentName: "All Apartments" }, ...(ajson.Apartments || [])];
            setApartments(aps);

            const params = new URLSearchParams();
            if (filter.month) params.append("month", filter.month);
            if (filter.apartment_id) params.append("apartment_id", String(filter.apartment_id));
            if (filter.type && filter.type !== "all") params.append("type", filter.type);

            // 2) stats for KPIs
            const s = await authFetch(`${API_BASE}/logs/stats?${params.toString()}`);
            setStats(await s.json());

            // 3) timeline (no search in filter bar; search stays with list)
            const tl = await authFetch(`${API_BASE}/logs/timeline?${params.toString()}${tableSearch ? `&q=${encodeURIComponent(tableSearch)}` : ""}`);
            const tjson = await tl.json();
            setTimeline(tjson.items || []);

            // 4) recent tables
            const rc = await authFetch(`${API_BASE}/logs/recent?${filter.apartment_id ? `apartment_id=${filter.apartment_id}` : ""}`);
            setRecent(await rc.json());
        } catch (e) {
            console.error("loadAll error:", e);
        } finally {
            setLoading(false);
        }
    }, [authFetch, filter.apartment_id, filter.month, filter.type, tableSearch]);

    useEffect(() => { loadAll(); }, []); // initial
    useEffect(() => { loadAll(); }, [filter.apartment_id, filter.month, filter.type]); // on filter change

    const exportCsv = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.month) params.append("month", filter.month);
            if (filter.apartment_id) params.append("apartment_id", String(filter.apartment_id));
            if (filter.type && filter.type !== "all") params.append("type", filter.type);
            if (tableSearch) params.append("q", tableSearch);

            const res = await authFetch(`${API_BASE}/logs/export?${params.toString()}`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `history_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Export failed:", e);
        }
    };

    /* -------- UI -------- */
    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh", overflowX: "hidden" }}>
            {/* Title / actions */}
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 800,
                        letterSpacing: .5,
                        fontFamily: FONTS.display,
                        background: BRAND.gradient,
                        backgroundClip: "text",
                        color: "transparent"
                    }}
                >
                    History Logs
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <span>
                        <IconButton onClick={loadAll} disabled={loading} sx={{ color: "#fff" }}>
                            <RefreshIcon sx={{ animation: loading ? "spin 900ms linear infinite" : "none" }} />
                        </IconButton>
                    </span>
                </Tooltip>
                <Button
                    startIcon={<FileDownloadOutlinedIcon />}
                    onClick={exportCsv}
                    variant="outlined"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2, color: "#fff",
                        borderColor: "rgba(255,255,255,0.35)",
                        "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" },
                    }}
                >
                    Export
                </Button>
            </Stack>

            {/* KPI Squares — transfers & vacates for selected month */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat( auto-fit, minmax(180px, 1fr) )",
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <KpiSquare label={`Transfers — ${filter.month}`} value={stats.transfers ?? 0} />
                <KpiSquare label={`Vacates — ${filter.month}`} value={stats.vacates ?? 0} />
                <KpiSquare label="Units Impacted" value={stats.unitsImpacted ?? 0} sub="Unique units moved or vacated" />
            </Box>

            {/* Insights (kept slim) */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat( auto-fit, minmax(260px, 1fr) )",
                    gap: 1.5,
                    mb: 2,
                }}
            >
                <Insight text="Keep an eye on repeat transfers — they often signal unit mismatch or pricing friction." />
                <Insight text="Vacates cluster near month end; consider automated retention messages 10 days before." />
            </Box>

            {/* Filters — WITHOUT search (per request) */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel id="apt-lb" sx={{ color: "#aaa" }}>Apartment</InputLabel>
                        <Select
                            labelId="apt-lb"
                            label="Apartment"
                            value={filter.apartment_id}
                            onChange={(e) => setFilter((f) => ({ ...f, apartment_id: e.target.value }))}
                            sx={{ color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                        >
                            {apartments.map((a) => (
                                <MenuItem key={a.ApartmentID} value={a.ApartmentID || 0}>
                                    {a.ApartmentName || "All Apartments"}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 200 }}>
                        <InputLabel id="mn-lb" sx={{ color: "#aaa" }}>Month</InputLabel>
                        <Select
                            labelId="mn-lb"
                            label="Month"
                            value={filter.month}
                            onChange={(e) => setFilter((f) => ({ ...f, month: e.target.value }))}
                            sx={{ color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                        >
                            {monthsList.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 160 }}>
                        <InputLabel id="tp-lb" sx={{ color: "#aaa" }}>Type</InputLabel>
                        <Select
                            labelId="tp-lb"
                            label="Type"
                            value={filter.type}
                            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
                            sx={{ color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                        >
                            <MenuItem value="all">All</MenuItem>
                            <MenuItem value="transfer">Transfer</MenuItem>
                            <MenuItem value="vacate">Vacate</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Paper>

            {/* Search now lives with the list/tables only */}
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
                <TextField
                    size="small"
                    placeholder="Search tenant, reason, notes…"
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") loadAll(); }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>) }}
                    sx={{ flex: 1, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                />
                <Button onClick={loadAll} disabled={loading} sx={{ textTransform: "none" }}>
                    Apply
                </Button>
            </Stack>

            {/* Timeline (compact; no horizontal scroll) */}
            <Paper elevation={0} sx={{ ...softCard, mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Timeline — {filter.month}
                </Typography>
                <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                {timeline.length === 0 ? (
                    <Typography variant="body2" sx={{ opacity: .72, fontFamily: FONTS.subhead, py: 4, textAlign: "center" }}>
                        No events for the selected filters.
                    </Typography>
                ) : (
                    <Stack spacing={1.25}>
                        {timeline.map((e) => (
                            <TimelineItem key={e.id} e={e} />
                        ))}
                    </Stack>
                )}
            </Paper>

            {/* Recent tables — stacked vertically, fixed layout, even columns */}
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
                {/* Transfers */}
                <Paper elevation={0} sx={{ ...softCard }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                        Recent Transfers
                    </Typography>
                    <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                    <Table
                        size="small"
                        sx={{
                            width: "100%",
                            tableLayout: "fixed",
                            "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                            mb: .5
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: "22%" }}>Date</TableCell>
                                <TableCell sx={{ width: "24%" }}>Tenant</TableCell>
                                <TableCell sx={{ width: "28%" }}>From → To</TableCell>
                                <TableCell sx={{ width: "26%" }}>Reason</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(recent.recentTransfers || []).map((r, idx) => (
                                <TableRow key={idx} hover>
                                    <TableCell>{fmtTs(r.Date)}</TableCell>
                                    <TableCell>{r.TenantName}</TableCell>
                                    <TableCell>{`${r.From} → ${r.To}`}</TableCell>
                                    <TableCell>{r.Reason || "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>

                {/* Vacates */}
                <Paper elevation={0} sx={{ ...softCard }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                        Recent Vacates
                    </Typography>
                    <Divider sx={{ mb: 1, borderColor: "rgba(255,255,255,0.08)" }} />
                    <Table
                        size="small"
                        sx={{
                            width: "100%",
                            tableLayout: "fixed",
                            "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
                            mb: .5
                        }}
                    >
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ width: "22%" }}>Date</TableCell>
                                <TableCell sx={{ width: "22%" }}>Tenant</TableCell>
                                <TableCell sx={{ width: "18%" }}>Unit</TableCell>
                                <TableCell sx={{ width: "20%" }}>Reason</TableCell>
                                <TableCell sx={{ width: "18%" }}>Notes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(recent.recentVacates || []).map((r, idx) => (
                                <TableRow key={idx} hover>
                                    <TableCell>{fmtTs(r.Date)}</TableCell>
                                    <TableCell>{r.TenantName}</TableCell>
                                    <TableCell>{r.Unit}</TableCell>
                                    <TableCell>{r.Reason || "—"}</TableCell>
                                    <TableCell>{r.Notes || "—"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>

            {/* spin keyframes */}
            <style>{`@keyframes spin { from {transform: rotate(0)} to {transform: rotate(360deg)} }`}</style>
        </Box>
    );
}
