// src/pages/dashboard/Tenants.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
    Box, Typography, Paper, Button, Table, TableHead, TableRow, TableCell,
    TableBody, IconButton, Chip, Tooltip, TextField, MenuItem, Stack,
    Divider, List, ListItem, ListItemText, InputAdornment, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Snackbar, Alert, Pagination,
    Grid, LinearProgress, Checkbox, Toolbar
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Icons
import AddIcon from "@mui/icons-material/Add";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import PersonSearchRounded from "@mui/icons-material/PersonSearchRounded";
import SwapHorizRounded from "@mui/icons-material/SwapHorizRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import CampaignRounded from "@mui/icons-material/CampaignRounded";
import DownloadRounded from "@mui/icons-material/DownloadRounded";
import MarkEmailUnreadRounded from "@mui/icons-material/MarkEmailUnreadRounded";
import SearchIcon from "@mui/icons-material/Search";
import EditRounded from "@mui/icons-material/EditRounded";

/* ---------- API client ---------- */
const API_BASE = process.env.REACT_APP_API || "http://localhost:5000";
const api = axios.create({ baseURL: API_BASE });
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem("token");
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

/* ---------- Brand + fonts ---------- */
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

/* ---------- Card styling ---------- */
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
const MotionCard = styled(motion.div)({ ...softCard, padding: 16 });
const kpiHover = { whileHover: { scale: 1.02 }, transition: { type: "spring", stiffness: 220, damping: 18 } };
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
        Inactive: "rgba(148,163,184,.18)"
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

// currency helper
const currency = (n) => {
    if (n === null || n === undefined) return "KES 0";
    const val = typeof n === "number" ? n : parseFloat(n || 0);
    return `KES ${isNaN(val) ? 0 : val.toLocaleString()}`;
};

// TextField label visibility fix (no cropping, always visible)
const labelFixSx = {
    "& .MuiInputLabel-root": {
        whiteSpace: "normal",
        lineHeight: 1.2,
    },
    "& .MuiFormLabel-root": {
        whiteSpace: "normal",
    },
};

/* ======================== Component ======================== */
const Tenants = () => {
    /* KPIs */
    const [kpi, setKpi] = useState({
        total: 0, active: 0, inactive: 0,
        expected: null, collected: null, collectionRate: null, unpaidUnits: null,
    });

    /* Filters + pagination */
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState("");
    const [apartmentId, setApartmentId] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(12);

    /* Data */
    const [loading, setLoading] = useState(false);
    const [tenants, setTenants] = useState([]);
    const [total, setTotal] = useState(0);
    const [apartments, setApartments] = useState([]);

    /* Distribution (active tenants per apartment) */
    const [dist, setDist] = useState({ total: 0, items: [] });

    /* Bulk selection */
    const [selectedIds, setSelectedIds] = useState([]);
    const selectedCount = selectedIds.length;

    /* Dialogs state */
    const [addOpen, setAddOpen] = useState(false);
    const [vacateFor, setVacateFor] = useState(null);
    const [transferFor, setTransferFor] = useState(null);
    const [noticeFor, setNoticeFor] = useState(null);
    const [viewFor, setViewFor] = useState(null);
    const [editFor, setEditFor] = useState(null);

    /* Dynamic confirm flags (appear after first click) */
    const [showConfirmAdd, setShowConfirmAdd] = useState(false);
    const [showConfirmVacate, setShowConfirmVacate] = useState(false);
    const [showConfirmTransfer, setShowConfirmTransfer] = useState(false);
    const [showConfirmNotice, setShowConfirmNotice] = useState(false);
    const [showConfirmEdit, setShowConfirmEdit] = useState(false);
    const [showConfirmBulkVacate, setShowConfirmBulkVacate] = useState(false);
    const [showConfirmBulkNotice, setShowConfirmBulkNotice] = useState(false);

    /* Add tenant form */
    const [addForm, setAddForm] = useState({
        FullName: "", Phone: "", Email: "", IDNumber: "",
        ApartmentID: "", RentalUnitID: "", MoveInDate: ""
    });
    const [unitsForApartment, setUnitsForApartment] = useState([]);
    const [saving, setSaving] = useState(false);

    /* Edit tenant form */
    const [editForm, setEditForm] = useState({
        FullName: "", Phone: "", Email: "", IDNumber: "",
        MoveInDate: "", MoveOutDate: "", Status: "Active"
    });
    const [editing, setEditing] = useState(false);

    /* Transfer form */
    const [transfer, setTransfer] = useState({
        ApartmentID: "", NewRentalUnitID: "", MoveInDate: "", Reason: "Unit-to-unit transfer"
    });
    const [transferUnits, setTransferUnits] = useState([]);
    const [transferring, setTransferring] = useState(false);

    /* Vacate form */
    const [vacate, setVacate] = useState({ Reason: "", Notes: "" });
    const [vacating, setVacating] = useState(false);

    /* Notice form */
    const [notice, setNotice] = useState({ ExpectedVacateDate: "", InspectionDate: "", Reason: "" });
    const [noticing, setNoticing] = useState(false);

    /* Bulk forms */
    const [bulkVacateOpen, setBulkVacateOpen] = useState(false);
    const [bulkVacateForm, setBulkVacateForm] = useState({ Reason: "", Notes: "" });
    const [bulkNoticeOpen, setBulkNoticeOpen] = useState(false);
    const [bulkNoticeForm, setBulkNoticeForm] = useState({ ExpectedVacateDate: "", InspectionDate: "", Reason: "" });
    const [bulkReminding, setBulkReminding] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    /* Snackbar */
    const [snack, setSnack] = useState({ open: false, msg: "", sev: "success" });

    const monthLabel = useMemo(() => {
        const d = new Date();
        return d.toLocaleString("en-US", { month: "long", year: "numeric" });
    }, []);

    /* -------- Loaders (useCallback for lint) -------- */
    const loadApartments = useCallback(async () => {
        try {
            const { data } = await api.get("/myapartments");
            setApartments(data?.Apartments || []);
        } catch {
            setApartments([]);
        }
    }, []);

    const loadTenants = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get("/tenants", {
                params: {
                    page, limit,
                    query: query || undefined,
                    status: status || undefined,
                    apartment_id: apartmentId || undefined
                }
            });
            const rows = data?.items || data?.tenants || [];
            setTenants(rows);
            setTotal(data?.total ?? data?.total_tenants ?? rows.length);
            setKpi((k) => ({ ...k, total: data?.total ?? data?.total_tenants ?? rows.length }));
            const pageIds = rows.map(r => r.TenantID);
            setSelectedIds((prev) => prev.filter(id => pageIds.includes(id)));
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Failed to load tenants", sev: "error" });
        } finally {
            setLoading(false);
        }
    }, [page, limit, query, status, apartmentId]);

    const loadDistribution = useCallback(async () => {
        try {
            const { data } = await api.get("/tenants", { params: { status: "Active", page: 1, limit: 1000000 } });
            const items = data?.items || [];
            const counts = new Map();
            items.forEach(t => {
                const name = t.Apartment || "N/A";
                counts.set(name, (counts.get(name) || 0) + 1);
            });
            const totalActive = items.length;
            const list = Array.from(counts.entries())
                .map(([name, count]) => ({ name, count, share: totalActive ? Math.round((count / totalActive) * 100) : 0 }))
                .sort((a, b) => b.count - a.count);
            setDist({ total: totalActive, items: list });
        } catch {
            setDist({ total: 0, items: [] });
        }
    }, []);

    const loadKPIs = useCallback(async () => {
        try {
            const [allRes, activeRes] = await Promise.all([
                api.get("/tenants", { params: { page: 1, limit: 1000000 } }),
                api.get("/tenants", { params: { status: "Active", page: 1, limit: 1000000 } })
            ]);
            const totalCount = (allRes.data?.items || []).length;
            const activeCount = (activeRes.data?.items || []).length;
            const inactiveCount = Math.max(totalCount - activeCount, 0);

            let expected = null, collected = null, unpaidUnits = null;
            try {
                let bills = null;
                try {
                    const { data } = await api.get(`/bills/month/${monthLabel}`);
                    bills = data?.items || data || null;
                } catch {
                    const { data } = await api.get(`/bills`, { params: { month: monthLabel } });
                    bills = data?.items || data || null;
                }
                if (Array.isArray(bills)) {
                    expected = bills.reduce((s, b) => s + (+b.TotalAmountDue || 0), 0);
                    const paid = new Set(["Paid", "Overpaid"]);
                    collected = bills.reduce((s, b) => {
                        const st = String(b.BillStatus || "");
                        if (paid.has(st)) return s + (+b.TotalAmountDue || 0);
                        if (st === "Partially Paid") return s + (+b.AmountPaid || 0);
                        return s;
                    }, 0);
                    unpaidUnits = bills.filter(b => String(b.BillStatus || "") === "Unpaid").length;
                }
            } catch { }
            const collectionRate = expected > 0 ? Math.round((collected / expected) * 100) : null;

            setKpi({
                total: totalCount, active: activeCount, inactive: inactiveCount,
                expected, collected, collectionRate, unpaidUnits
            });
        } catch { }
    }, [monthLabel]);

    const fullRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadApartments(), loadTenants(), loadDistribution(), loadKPIs()]);
        setRefreshing(false);
        setSnack({ open: true, msg: "Data refreshed", sev: "success" });
    }, [loadApartments, loadTenants, loadDistribution, loadKPIs]);

    useEffect(() => { fullRefresh(); }, [fullRefresh]);
    useEffect(() => { loadTenants(); }, [loadTenants]);

    /* Helpers */
    const fetchUnitsForApartment = async (aptId, setUnits) => {
        if (!aptId) { setUnits([]); return; }
        try {
            const { data } = await api.get(`/apartments/${aptId}/units`);
            const vacant = (data || []).filter(u => Number(u.StatusID) === 1); // 1 = Vacant
            setUnits(vacant);
        } catch {
            setUnits([]);
        }
    };

    /* -------- Single actions with dynamic confirm -------- */
    const saveTenant = async () => {
        const { FullName, Phone, IDNumber, RentalUnitID, MoveInDate } = addForm;
        if (!showConfirmAdd) { setShowConfirmAdd(true); return; }
        if (!FullName || !Phone || !IDNumber || !RentalUnitID || !MoveInDate) {
            setSnack({ open: true, msg: "Full name, phone, ID, unit & move-in date are required.", sev: "warning" });
            return;
        }
        setSaving(true);
        try {
            await api.post("/tenants/add", {
                FullName: addForm.FullName.trim(),
                Phone: addForm.Phone.trim(),
                Email: addForm.Email?.trim() || null,
                IDNumber: addForm.IDNumber.trim(),
                RentalUnitID: Number(addForm.RentalUnitID),
                MoveInDate: addForm.MoveInDate
            });
            setSnack({ open: true, msg: "Tenant added ✅", sev: "success" });
            setAddOpen(false);
            setAddForm({ FullName: "", Phone: "", Email: "", IDNumber: "", ApartmentID: "", RentalUnitID: "", MoveInDate: "" });
            setUnitsForApartment([]);
            setShowConfirmAdd(false);
            await fullRefresh();
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Failed to add tenant", sev: "error" });
        } finally { setSaving(false); }
    };

    const vacateTenant = async () => {
        if (!showConfirmVacate) { setShowConfirmVacate(true); return; }
        if (!vacateFor) return;
        setVacating(true);
        try {
            await api.put(`/tenants/vacate/${vacateFor.TenantID}`, {
                Reason: vacate.Reason || undefined, Notes: vacate.Notes || undefined
            });
            setSnack({ open: true, msg: "Tenant vacated ✅", sev: "success" });
            setVacateFor(null);
            setVacate({ Reason: "", Notes: "" });
            setShowConfirmVacate(false);
            await fullRefresh();
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Vacate failed", sev: "error" });
        } finally { setVacating(false); }
    };

    const submitTransfer = async () => {
        const { ApartmentID, NewRentalUnitID, MoveInDate } = transfer;
        if (!showConfirmTransfer) { setShowConfirmTransfer(true); return; }
        if (!ApartmentID || !NewRentalUnitID || !MoveInDate) {
            setSnack({ open: true, msg: "Select apartment, vacant unit and move-in date.", sev: "warning" }); return;
        }
        setTransferring(true);
        try {
            await api.put(`/tenants/transfer/${transferFor.TenantID}`, {
                NewRentalUnitID: Number(transfer.NewRentalUnitID),
                MoveInDate: transfer.MoveInDate,
                Reason: transfer.Reason || "Unit-to-unit transfer"
            });
            setSnack({ open: true, msg: "Transfer successful ✅", sev: "success" });
            setTransferFor(null);
            setTransfer({ ApartmentID: "", NewRentalUnitID: "", MoveInDate: "", Reason: "Unit-to-unit transfer" });
            setTransferUnits([]);
            setShowConfirmTransfer(false);
            await fullRefresh();
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Transfer failed", sev: "error" });
        } finally { setTransferring(false); }
    };

    const submitNotice = async () => {
        if (!showConfirmNotice) { setShowConfirmNotice(true); return; }
        if (!noticeFor) return;
        if (!notice.ExpectedVacateDate) {
            setSnack({ open: true, msg: "Expected vacate date is required.", sev: "warning" }); return;
        }
        setNoticing(true);
        try {
            await api.post(`/vacate-notice/${noticeFor.TenantID}`, {
                ExpectedVacateDate: notice.ExpectedVacateDate,
                InspectionDate: notice.InspectionDate || undefined,
                Reason: notice.Reason || undefined
            });
            setSnack({ open: true, msg: "Vacate notice sent ✅", sev: "success" });
            setNoticeFor(null);
            setNotice({ ExpectedVacateDate: "", InspectionDate: "", Reason: "" });
            setShowConfirmNotice(false);
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Failed to issue notice", sev: "error" });
        } finally { setNoticing(false); }
    };

    const openEdit = (t) => {
        setEditFor(t);
        setEditForm({
            FullName: t.FullName || "",
            Phone: t.Phone || "",
            Email: t.Email || "",
            IDNumber: t.IDNumber || "",
            MoveInDate: t.MoveInDate || "",
            MoveOutDate: t.MoveOutDate || "",
            Status: t.Status || "Active",
        });
        setShowConfirmEdit(false);
    };

    const submitEdit = async () => {
        if (!showConfirmEdit) { setShowConfirmEdit(true); return; }
        if (!editFor) return;
        setEditing(true);
        try {
            await api.put(`/tenants/${editFor.TenantID}`, {
                FullName: editForm.FullName,
                Phone: editForm.Phone || null,
                Email: editForm.Email || null,
                IDNumber: editForm.IDNumber || null,
                MoveInDate: editForm.MoveInDate || null,
                MoveOutDate: editForm.MoveOutDate || null,
                Status: editForm.Status || null
            });
            setSnack({ open: true, msg: "Tenant updated ✅", sev: "success" });
            setEditFor(null);
            setShowConfirmEdit(false);
            await fullRefresh();
        } catch (e) {
            setSnack({ open: true, msg: e?.response?.data?.message || "Update failed", sev: "error" });
        } finally { setEditing(false); }
    };

    /* -------- Bulk actions -------- */
    const selectedTenants = tenants.filter(t => selectedIds.includes(t.TenantID));
    const toggleSelectAll = (checked) => setSelectedIds(checked ? tenants.map(t => t.TenantID) : []);
    const toggleSelectOne = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const exportSelectedCSV = () => {
        if (selectedTenants.length === 0) return;
        const headers = ["TenantID", "FullName", "Email", "IDNumber", "Status", "Apartment", "Unit", "MoveInDate", "MoveOutDate"];
        const rows = selectedTenants.map(t => headers.map(h => (t[h] ?? "")).join(","));
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `tenants_selected_${Date.now()}.csv`; a.click();
        URL.revokeObjectURL(url);
    };

    const runBulkVacate = async () => {
        if (!showConfirmBulkVacate) { setShowConfirmBulkVacate(true); return; }
        if (selectedIds.length === 0) return;
        setVacating(true);
        try {
            const results = await Promise.allSettled(
                selectedTenants.map(t =>
                    api.put(`/tenants/vacate/${t.TenantID}`, {
                        Reason: bulkVacateForm.Reason || undefined,
                        Notes: bulkVacateForm.Notes || undefined
                    })
                )
            );
            const ok = results.filter(r => r.status === "fulfilled").length;
            const fail = results.length - ok;
            setSnack({ open: true, msg: `Vacated ${ok} tenant(s)${fail ? `, ${fail} failed` : ""}.`, sev: fail ? "warning" : "success" });
            setBulkVacateOpen(false);
            setSelectedIds([]);
            setBulkVacateForm({ Reason: "", Notes: "" });
            setShowConfirmBulkVacate(false);
            await fullRefresh();
        } catch {
            setSnack({ open: true, msg: "Bulk vacate failed.", sev: "error" });
        } finally { setVacating(false); }
    };

    const runBulkIssueNotices = async () => {
        if (!showConfirmBulkNotice) { setShowConfirmBulkNotice(true); return; }
        if (selectedIds.length === 0 || !bulkNoticeForm.ExpectedVacateDate) {
            setSnack({ open: true, msg: "Set an expected vacate date.", sev: "warning" }); return;
        }
        setNoticing(true);
        try {
            const results = await Promise.allSettled(
                selectedTenants.map(t =>
                    api.post(`/vacate-notice/${t.TenantID}`, {
                        ExpectedVacateDate: bulkNoticeForm.ExpectedVacateDate,
                        InspectionDate: bulkNoticeForm.InspectionDate || undefined,
                        Reason: bulkNoticeForm.Reason || undefined
                    })
                )
            );
            const ok = results.filter(r => r.status === "fulfilled").length;
            const fail = results.length - ok;
            setSnack({ open: true, msg: `Sent ${ok} notice(s)${fail ? `, ${fail} failed` : ""}.`, sev: fail ? "warning" : "success" });
            setBulkNoticeOpen(false);
            setSelectedIds([]);
            setBulkNoticeForm({ ExpectedVacateDate: "", InspectionDate: "", Reason: "" });
            setShowConfirmBulkNotice(false);
        } catch {
            setSnack({ open: true, msg: "Bulk notice failed.", sev: "error" });
        } finally { setNoticing(false); }
    };

    /* -------- KPI Model -------- */
    const kpis = [
        {
            key: "activeInactive",
            title: "Active vs Inactive",
            render: () => (
                <Box>
                    <Box display="flex" justifyContent="space-between" mb={0.5}>
                        <Typography sx={{ fontFamily: FONTS.subhead }}>Active</Typography>
                        <Typography sx={{ fontFamily: FONTS.number, fontWeight: 800 }}>
                            {kpi.active} / {kpi.total}
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={kpi.total ? Math.round((kpi.active / kpi.total) * 100) : 0}
                        sx={{
                            height: 8, borderRadius: 8,
                            "& .MuiLinearProgress-bar": { background: BRAND.gradient },
                            backgroundColor: "rgba(255,255,255,0.08)"
                        }}
                    />
                    <Typography sx={{ opacity: .75, fontSize: 12, mt: .75, fontFamily: FONTS.subhead }}>
                        Inactive: {kpi.inactive}
                    </Typography>
                </Box>
            ),
        },
        { key: "expected", title: `Expected Rent — ${monthLabel}`, value: kpi.expected != null ? currency(kpi.expected) : "—", short: "Expected (Mo)" },
        { key: "collected", title: `Collected Rent — ${monthLabel}`, value: kpi.collected != null ? currency(kpi.collected) : "—", short: "Collected (Mo)" },
        {
            key: "rate", title: "Collection Rate",
            render: () => (
                <Box>
                    <Typography sx={{ fontSize: 26, fontWeight: 800, fontFamily: FONTS.number }}>
                        {kpi.collectionRate != null ? `${kpi.collectionRate}%` : "—"}
                    </Typography>
                    <Typography sx={{ opacity: .75, fontSize: 12, mt: .25, fontFamily: FONTS.subhead }}>Collected / Expected</Typography>
                    <LinearProgress variant="determinate" value={kpi.collectionRate || 0}
                        sx={{ mt: 1, height: 8, borderRadius: 8, "& .MuiLinearProgress-bar": { background: BRAND.gradient }, backgroundColor: "rgba(255,255,255,0.08)" }} />
                </Box>
            )
        },
        { key: "unpaid", title: "Unpaid Units (this month)", value: kpi.unpaidUnits != null ? String(kpi.unpaidUnits) : "—", short: "Unpaid" },
        { key: "tenantsPerApt", title: "Tenants per Apartment", isDist: true },
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
                    <BrandButton startIcon={<AddIcon />} onClick={() => { setAddOpen(true); setShowConfirmAdd(false); }}>Add Tenant</BrandButton>
                    <BrandButton startIcon={<RefreshRounded />} onClick={fullRefresh} disabled={refreshing}>
                        {refreshing ? "Refreshing…" : "Refresh"}
                    </BrandButton>
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
                {kpis.map((k) => {
                    const col = { xs: "span 12", sm: "span 3", md: "span 3" };
                    const height = k.isDist ? 260 : "auto";
                    return (
                        <MotionCard key={k.key} {...kpiHover}
                            sx={{ gridColumn: col, height, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <Typography sx={{ opacity: .85, fontSize: 13, fontFamily: FONTS.subhead }}>
                                {k.title}
                            </Typography>

                            {k.isDist ? (
                                <Paper elevation={0} sx={{ ...softCard, p: 1.25, borderRadius: 2, height: "100%" }}>
                                    <List dense disablePadding sx={{ maxHeight: 190, overflowY: "auto" }}>
                                        {dist.items.map((a) => (
                                            <ListItem key={a.name} sx={{ py: .6, flexDirection: "column", alignItems: "stretch" }}>
                                                <Box display="flex" justifyContent="space-between" width="100%">
                                                    <Typography sx={{ color: "#fff", fontWeight: 800, fontFamily: FONTS.subhead, mr: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                                                        {a.name}
                                                    </Typography>
                                                    <Typography sx={{ color: "#fff", fontWeight: 900, fontFamily: FONTS.number, whiteSpace: "nowrap" }}>
                                                        {a.count} <Typography component="span" sx={{ opacity: .7, fontFamily: FONTS.subhead, fontWeight: 600 }}>({a.share}%)</Typography>
                                                    </Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={a.share}
                                                    sx={{
                                                        mt: .5, height: 6, borderRadius: 6,
                                                        "& .MuiLinearProgress-bar": { background: BRAND.gradient },
                                                        backgroundColor: "rgba(255,255,255,0.08)"
                                                    }}
                                                />
                                            </ListItem>
                                        ))}
                                        {dist.items.length === 0 && (
                                            <ListItem><ListItemText primary="No active tenants yet." /></ListItem>
                                        )}
                                    </List>
                                </Paper>
                            ) : k.render ? (
                                k.render()
                            ) : (
                                <>
                                    <Typography sx={{ color: "#fff", fontSize: 26, fontWeight: 800, mt: 0.5, fontFamily: FONTS.number }}>
                                        {k.value}
                                    </Typography>
                                    <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, mt: 0.25, fontFamily: FONTS.subhead }}>
                                        {k.short}
                                    </Typography>
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
                        placeholder="Search tenant, email, ID…"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ opacity: 0.7 }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: 1, ...labelFixSx,
                            "& .MuiInputBase-root": { color: "#fff", background: "#0e0a17", borderRadius: 1.5 },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            "& .MuiInputBase-input": { fontFamily: FONTS.subhead }
                        }}
                        InputLabelProps={{ shrink: true }}
                        label="Search"
                    />
                    <TextField
                        size="small" select label="Apartment"
                        value={apartmentId} onChange={(e) => { setApartmentId(e.target.value); setPage(1); }}
                        sx={{ minWidth: 220, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }, "& .MuiInputBase-root": { color: "#fff" }, ...labelFixSx }}
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {apartments.map(a => (
                            <MenuItem key={a.ApartmentID} value={a.ApartmentID}>{a.ApartmentName}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        size="small" select label="Status"
                        value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                        sx={{ minWidth: 180, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" }, "& .MuiInputBase-root": { color: "#fff" }, ...labelFixSx }}
                        InputLabelProps={{ shrink: true }}
                    >
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Active">Active</MenuItem>
                        <MenuItem value="Inactive">Inactive</MenuItem>
                    </TextField>
                </Stack>
            </Paper>

            {/* Bulk actions toolbar */}
            {selectedCount > 0 && (
                <Toolbar
                    sx={{
                        position: "sticky", top: 8, zIndex: 5, mb: 1, borderRadius: 2,
                        background: "#141024", border: "1px solid rgba(255,255,255,0.08)"
                    }}
                >
                    <Typography sx={{ flex: 1, fontFamily: FONTS.subhead }}>
                        {selectedCount} selected
                    </Typography>
                    <Tooltip title="Send Due Reminders (SMS)">
                        <span>
                            <Button size="small" onClick={async () => {
                                setBulkReminding(true);
                                try {
                                    const results = await Promise.allSettled(
                                        selectedTenants.map(t =>
                                            api.post(`/tenants/${t.TenantID}/remind`, { channel: "sms", template: "due" })
                                        )
                                    );
                                    const ok = results.filter(r => r.status === "fulfilled").length;
                                    const fail = results.length - ok;
                                    setSnack({ open: true, msg: `Reminders: ${ok} sent${fail ? `, ${fail} failed` : ""}.`, sev: fail ? "warning" : "success" });
                                } catch {
                                    setSnack({ open: true, msg: "Bulk remind failed.", sev: "error" });
                                } finally {
                                    setBulkReminding(false);
                                }
                            }} disabled={bulkReminding}>
                                <MarkEmailUnreadRounded sx={{ mr: .75 }} /> {bulkReminding ? "Reminding…" : "Remind"}
                            </Button>
                        </span>
                    </Tooltip>
                    <Tooltip title="Issue Vacate Notice">
                        <Button size="small" onClick={() => { setShowConfirmBulkNotice(false); setBulkNoticeOpen(true); }}>
                            <CampaignRounded sx={{ mr: .75 }} /> Vacate Notice
                        </Button>
                    </Tooltip>
                    <Tooltip title="Vacate Selected Tenants">
                        <Button size="small" onClick={() => { setShowConfirmBulkVacate(false); setBulkVacateOpen(true); }}>
                            <LogoutRounded sx={{ mr: .75 }} /> Vacate
                        </Button>
                    </Tooltip>
                    <Tooltip title="Export CSV">
                        <Button size="small" onClick={exportSelectedCSV}>
                            <DownloadRounded sx={{ mr: .75 }} /> Export
                        </Button>
                    </Tooltip>
                </Toolbar>
            )}

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
                            <TableCell padding="checkbox">
                                <Checkbox
                                    color="primary"
                                    checked={tenants.length > 0 && selectedIds.length === tenants.length}
                                    indeterminate={selectedIds.length > 0 && selectedIds.length < tenants.length}
                                    onChange={(e) => toggleSelectAll(e.target.checked)}
                                />
                            </TableCell>
                            {["Name", "Rental Unit", "Apartment", "Status", "Move In", "Move Out", "Actions"].map((h) => (
                                <TableCell key={h}>{h}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Box display="flex" alignItems="center" gap={1}><CircularProgress size={18} /><Typography>Loading…</Typography></Box>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && tenants.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8}>
                                    <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>No tenants found.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && tenants.map((t) => (
                            <HoverRow key={t.TenantID}>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        color="primary"
                                        checked={selectedIds.includes(t.TenantID)}
                                        onChange={() => toggleSelectOne(t.TenantID)}
                                    />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>{t.FullName}</TableCell>
                                <TableCell>{t.Unit || "—"}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>{t.Apartment || "—"}</TableCell>
                                <TableCell><StatusChip value={t.Status || "Active"} /></TableCell>
                                <TableCell>{t.MoveInDate || "—"}</TableCell>
                                <TableCell>{t.MoveOutDate || "—"}</TableCell>
                                <TableCell sx={{ whiteSpace: "nowrap" }}>
                                    <Tooltip title="View Profile">
                                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => setViewFor(t)}>
                                            <PersonSearchRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Edit Tenant">
                                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => openEdit(t)}>
                                            <EditRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Transfer Tenant">
                                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => { setShowConfirmTransfer(false); setTransferFor(t); }}>
                                            <SwapHorizRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Vacate Tenant">
                                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => { setShowConfirmVacate(false); setVacateFor(t); }}>
                                            <LogoutRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Issue Vacate Notice">
                                        <IconButton size="small" sx={{ color: "#fff" }} onClick={() => { setShowConfirmNotice(false); setNoticeFor(t); }}>
                                            <CampaignRounded fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </HoverRow>
                        ))}
                    </TableBody>
                </Table>

                <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
                <Box p={1.5} display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 12, fontFamily: FONTS.subhead }}>
                        {total} result(s)
                    </Typography>
                    <Pagination
                        count={Math.max(1, Math.ceil(total / limit))}
                        page={page}
                        onChange={(_, p) => setPage(p)}
                        sx={{ "& .MuiPaginationItem-root": { color: "#fff" } }}
                    />
                </Box>
            </Paper>

            {/* ---------------- Dialogs ---------------- */}

            {/* Add Tenant */}
            <Dialog open={addOpen} onClose={() => { setAddOpen(false); setShowConfirmAdd(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Add Tenant</DialogTitle>
                <DialogContent dividers sx={{ pt: 2 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" value={addForm.FullName}
                                onChange={e => setAddForm(f => ({ ...f, FullName: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Phone (2547XXXXXXXX)" value={addForm.Phone}
                                onChange={e => setAddForm(f => ({ ...f, Phone: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Email (optional)" value={addForm.Email}
                                onChange={e => setAddForm(f => ({ ...f, Email: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="ID Number" value={addForm.IDNumber}
                                onChange={e => setAddForm(f => ({ ...f, IDNumber: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="date" label="Move In" InputLabelProps={{ shrink: true }}
                                value={addForm.MoveInDate} onChange={e => setAddForm(f => ({ ...f, MoveInDate: e.target.value }))}
                                sx={labelFixSx} />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Apartment" value={addForm.ApartmentID}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setAddForm(f => ({ ...f, ApartmentID: v, RentalUnitID: "" }));
                                    fetchUnitsForApartment(v, setUnitsForApartment);
                                }}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx}>
                                {apartments.map(a => <MenuItem key={a.ApartmentID} value={a.ApartmentID}>{a.ApartmentName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Vacant Unit" value={addForm.RentalUnitID}
                                onChange={(e) => setAddForm(f => ({ ...f, RentalUnitID: e.target.value }))} disabled={!addForm.ApartmentID}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx}>
                                {unitsForApartment.length === 0 && <MenuItem value="" disabled>No vacant units</MenuItem>}
                                {unitsForApartment.map(u => (
                                    <MenuItem key={u.UnitID} value={u.UnitID}>{u.Label}</MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    {showConfirmAdd && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Confirm you want to add this tenant to the selected unit.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmAdd ? (
                        <>
                            <Button onClick={() => setShowConfirmAdd(false)}>Back</Button>
                            <Button onClick={saveTenant} variant="contained" disabled={saving}>{saving ? "Saving..." : "Confirm & Save"}</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
                            <Button onClick={saveTenant} variant="contained">Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* View Profile */}
            <Dialog open={!!viewFor} onClose={() => setViewFor(null)} maxWidth="sm" fullWidth>
                <DialogTitle>{viewFor?.FullName || "Tenant"}</DialogTitle>
                <DialogContent dividers>
                    {viewFor ? (
                        <List dense>
                            <ListItem><ListItemText primary="Email" secondary={viewFor.Email || "—"} /></ListItem>
                            <ListItem><ListItemText primary="Apartment / Unit" secondary={`${viewFor.Apartment || "—"} — ${viewFor.Unit || "—"}`} /></ListItem>
                            <ListItem><ListItemText primary="Status" secondary={viewFor.Status || "—"} /></ListItem>
                            <ListItem><ListItemText primary="Move In" secondary={viewFor.MoveInDate || "—"} /></ListItem>
                            <ListItem><ListItemText primary="Move Out" secondary={viewFor.MoveOutDate || "—"} /></ListItem>
                        </List>
                    ) : (
                        <Box display="flex" alignItems="center" gap={1}><CircularProgress size={18} /><Typography>Loading…</Typography></Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setViewFor(null)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Edit Tenant */}
            <Dialog open={!!editFor} onClose={() => { setEditFor(null); setShowConfirmEdit(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Tenant — {editFor?.FullName}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField fullWidth label="Full Name" value={editForm.FullName}
                                onChange={e => setEditForm(f => ({ ...f, FullName: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Phone (2547XXXXXXXX)" value={editForm.Phone}
                                onChange={e => setEditForm(f => ({ ...f, Phone: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Email" value={editForm.Email}
                                onChange={e => setEditForm(f => ({ ...f, Email: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="ID Number" value={editForm.IDNumber}
                                onChange={e => setEditForm(f => ({ ...f, IDNumber: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="date" label="Move In" InputLabelProps={{ shrink: true }}
                                value={editForm.MoveInDate} onChange={e => setEditForm(f => ({ ...f, MoveInDate: e.target.value }))}
                                sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="date" label="Move Out" InputLabelProps={{ shrink: true }}
                                value={editForm.MoveOutDate} onChange={e => setEditForm(f => ({ ...f, MoveOutDate: e.target.value }))}
                                sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth select label="Status" value={editForm.Status}
                                onChange={e => setEditForm(f => ({ ...f, Status: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx}>
                                <MenuItem value="Active">Active</MenuItem>
                                <MenuItem value="Inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>

                    {showConfirmEdit && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Confirm you want to update this tenant’s details.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmEdit ? (
                        <>
                            <Button onClick={() => setShowConfirmEdit(false)}>Back</Button>
                            <Button variant="contained" disabled={editing} onClick={submitEdit}>{editing ? "Saving…" : "Confirm & Save"}</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setEditFor(null)}>Cancel</Button>
                            <Button variant="contained" onClick={submitEdit}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Vacate Tenant */}
            <Dialog open={!!vacateFor} onClose={() => { setVacateFor(null); setShowConfirmVacate(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Vacate Tenant — {vacateFor?.FullName}</DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 1.5 }}>
                    <TextField label="Reason" value={vacate.Reason} onChange={e => setVacate(v => ({ ...v, Reason: e.target.value }))}
                        InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    <TextField label="Notes" value={vacate.Notes} onChange={e => setVacate(v => ({ ...v, Notes: e.target.value }))}
                        multiline rows={3} InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    {showConfirmVacate && (
                        <Alert severity="warning">Are you sure you want to vacate this tenant? This will mark their unit as vacant.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmVacate ? (
                        <>
                            <Button onClick={() => setShowConfirmVacate(false)}>Back</Button>
                            <Button variant="contained" disabled={vacating} onClick={vacateTenant}>{vacating ? "Processing…" : "Confirm Vacate"}</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setVacateFor(null)}>Cancel</Button>
                            <Button variant="contained" onClick={vacateTenant}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Transfer Tenant */}
            <Dialog open={!!transferFor} onClose={() => { setTransferFor(null); setShowConfirmTransfer(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Transfer Tenant — {transferFor?.FullName}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2} sx={{ mt: .5 }}>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="New Apartment" value={transfer.ApartmentID}
                                onChange={(e) => {
                                    const v = e.target.value;
                                    setTransfer(t => ({ ...t, ApartmentID: v, NewRentalUnitID: "" }));
                                    fetchUnitsForApartment(v, setTransferUnits);
                                }}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx}>
                                {apartments.map(a => <MenuItem key={a.ApartmentID} value={a.ApartmentID}>{a.ApartmentName}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField select fullWidth label="Vacant Unit" value={transfer.NewRentalUnitID}
                                onChange={(e) => setTransfer(t => ({ ...t, NewRentalUnitID: e.target.value }))} disabled={!transfer.ApartmentID}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx}>
                                {transferUnits.length === 0 && <MenuItem value="" disabled>No vacant units</MenuItem>}
                                {transferUnits.map(u => <MenuItem key={u.UnitID} value={u.UnitID}>{u.Label}</MenuItem>)}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="date" label="New Move-In" InputLabelProps={{ shrink: true }}
                                value={transfer.MoveInDate} onChange={(e) => setTransfer(t => ({ ...t, MoveInDate: e.target.value }))}
                                sx={labelFixSx} />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth label="Reason" value={transfer.Reason} onChange={(e) => setTransfer(t => ({ ...t, Reason: e.target.value }))}
                                InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                        </Grid>
                    </Grid>

                    {showConfirmTransfer && (
                        <Alert severity="warning" sx={{ mt: 2 }}>
                            Confirm you want to transfer this tenant to the new unit.
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmTransfer ? (
                        <>
                            <Button onClick={() => setShowConfirmTransfer(false)}>Back</Button>
                            <Button variant="contained" disabled={transferring} onClick={submitTransfer}>
                                {transferring ? "Transferring…" : "Confirm Transfer"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setTransferFor(null)}>Cancel</Button>
                            <Button variant="contained" onClick={submitTransfer}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Issue Vacate Notice (single) */}
            <Dialog open={!!noticeFor} onClose={() => { setNoticeFor(null); setShowConfirmNotice(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Vacate Notice — {noticeFor?.FullName}</DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 1.5 }}>
                    <TextField type="date" label="Expected Vacate Date" InputLabelProps={{ shrink: true }}
                        value={notice.ExpectedVacateDate} onChange={(e) => setNotice(n => ({ ...n, ExpectedVacateDate: e.target.value }))}
                        sx={labelFixSx} />
                    <TextField type="date" label="Inspection Date (optional)" InputLabelProps={{ shrink: true }}
                        value={notice.InspectionDate} onChange={(e) => setNotice(n => ({ ...n, InspectionDate: e.target.value }))}
                        sx={labelFixSx} />
                    <TextField label="Reason (optional)" value={notice.Reason} onChange={(e) => setNotice(n => ({ ...n, Reason: e.target.value }))}
                        InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    {showConfirmNotice && (
                        <Alert severity="warning">Confirm you want to send a vacate notice to this tenant.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmNotice ? (
                        <>
                            <Button onClick={() => setShowConfirmNotice(false)}>Back</Button>
                            <Button variant="contained" disabled={noticing} onClick={submitNotice}>
                                {noticing ? "Sending…" : "Confirm & Send"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setNoticeFor(null)}>Cancel</Button>
                            <Button variant="contained" onClick={submitNotice}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Bulk Vacate */}
            <Dialog open={bulkVacateOpen} onClose={() => { setBulkVacateOpen(false); setShowConfirmBulkVacate(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Vacate {selectedCount} tenant(s)</DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 1.5 }}>
                    <TextField label="Reason" value={bulkVacateForm.Reason} onChange={e => setBulkVacateForm(v => ({ ...v, Reason: e.target.value }))}
                        InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    <TextField label="Notes" value={bulkVacateForm.Notes} onChange={e => setBulkVacateForm(v => ({ ...v, Notes: e.target.value }))}
                        multiline rows={3} InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    {showConfirmBulkVacate && (
                        <Alert severity="warning">Are you sure you want to vacate these tenants?</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmBulkVacate ? (
                        <>
                            <Button onClick={() => setShowConfirmBulkVacate(false)}>Back</Button>
                            <Button variant="contained" disabled={vacating} onClick={runBulkVacate}>
                                {vacating ? "Processing…" : "Confirm Vacate"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setBulkVacateOpen(false)}>Cancel</Button>
                            <Button variant="contained" onClick={runBulkVacate}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Bulk Vacate Notices */}
            <Dialog open={bulkNoticeOpen} onClose={() => { setBulkNoticeOpen(false); setShowConfirmBulkNotice(false); }} maxWidth="sm" fullWidth>
                <DialogTitle>Send vacate notices to {selectedCount} tenant(s)</DialogTitle>
                <DialogContent dividers sx={{ display: "grid", gap: 1.5 }}>
                    <TextField type="date" label="Expected Vacate Date" InputLabelProps={{ shrink: true }}
                        value={bulkNoticeForm.ExpectedVacateDate} onChange={(e) => setBulkNoticeForm(n => ({ ...n, ExpectedVacateDate: e.target.value }))}
                        sx={labelFixSx} />
                    <TextField type="date" label="Inspection Date (optional)" InputLabelProps={{ shrink: true }}
                        value={bulkNoticeForm.InspectionDate} onChange={(e) => setBulkNoticeForm(n => ({ ...n, InspectionDate: e.target.value }))}
                        sx={labelFixSx} />
                    <TextField label="Reason (optional)" value={bulkNoticeForm.Reason} onChange={(e) => setBulkNoticeForm(n => ({ ...n, Reason: e.target.value }))}
                        InputLabelProps={{ shrink: true }} sx={labelFixSx} />
                    {showConfirmBulkNotice && (
                        <Alert severity="warning">Confirm you want to send vacate notices to selected tenants.</Alert>
                    )}
                </DialogContent>
                <DialogActions>
                    {showConfirmBulkNotice ? (
                        <>
                            <Button onClick={() => setShowConfirmBulkNotice(false)}>Back</Button>
                            <Button variant="contained" disabled={noticing} onClick={runBulkIssueNotices}>
                                {noticing ? "Sending…" : "Confirm & Send"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setBulkNoticeOpen(false)}>Cancel</Button>
                            <Button variant="contained" onClick={runBulkIssueNotices}>Continue</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snack.open}
                autoHideDuration={3500}
                onClose={() => setSnack(s => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert severity={snack.sev} onClose={() => setSnack(s => ({ ...s, open: false }))} variant="filled">
                    {snack.msg}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Tenants;
