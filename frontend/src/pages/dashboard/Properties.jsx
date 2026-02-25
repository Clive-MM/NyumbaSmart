// src/pages/Properties.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Paper, Typography, Grid, Chip, Button, IconButton, Tooltip,
    Snackbar, Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Stack, TextField, LinearProgress, MenuItem, Checkbox,
    FormGroup, FormControlLabel, TablePagination
} from "@mui/material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import EditIcon from "@mui/icons-material/Edit";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import ApartmentIcon from "@mui/icons-material/Apartment";
import HomeWorkIcon from "@mui/icons-material/HomeWork";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import CategoryIcon from "@mui/icons-material/Category";
import BusinessIcon from "@mui/icons-material/Business";
import ScheduleIcon from "@mui/icons-material/Schedule";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

/* ---------- Config / Branding ---------- */
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";
const monthKey = dayjs().format("MMMM YYYY");

const fmtNum = (n) => new Intl.NumberFormat().format(Number(n || 0));
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(
        Number(n || 0)
    )}`;

const OCCUPIED_COLOR = "#6EE7B7";
const VACANT_COLOR = "#FB7185";
const RESERVED_COLOR = "#FDE68A";

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
        boxShadow:
            "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        outline: "1px solid transparent",
        background:
            "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
        boxDecorationBreak: "clone",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    }
};
/* Shared field style */
const fieldNeumorphSx = {
    "& .MuiFormControl-root": { overflow: "visible" },
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.92)",
        fontFamily: FONTS.subhead,
        whiteSpace: "nowrap",
        overflow: "visible",
        textOverflow: "clip",
        maxWidth: "none"
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": { maxWidth: "none" },
    "& .MuiInputBase-root": {
        background: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        boxShadow:
            "inset 6px 6px 12px rgba(0,0,0,.45), inset -6px -6px 12px rgba(255,255,255,.03)",
        paddingTop: 1,
        paddingBottom: 1
    },
    "& .MuiInputBase-input": { color: "#fff", fontFamily: FONTS.subhead },
    "& .MuiInputBase-input::placeholder": {
        color: "rgba(255,255,255,0.7)",
        opacity: 1
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.22)"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.45)"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.start }
};

/* ------------------------- Reusable Modal Shell ------------------------- */
function ModalShell({
    open,
    onClose,
    title,
    width = "min(500px, 92vw)",
    top = "12%",
    maxHeight = "70vh",
    headerRight = null,
    children,
    actions = null,
}) {
    if (!open) return null;
    return (
        <Box
            sx={{
                position: "absolute",
                inset: 0,
                zIndex: 20,
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                pt: top,
            }}
        >
            {/* Backdrop */}
            <Box
                onClick={onClose}
                sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,.55)",
                    backdropFilter: "blur(2px)"
                }}
            />
            <Paper
                elevation={0}
                sx={{
                    ...softCard,
                    width,
                    maxHeight,
                    overflow: "hidden",
                    p: 0,
                    borderRadius: 3,
                    position: "relative"
                }}
            >
                {/* Header */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ p: 1.5, pb: 1, borderBottom: "1px solid rgba(255,255,255,0.08)" }}
                >
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 900, fontFamily: FONTS.subhead }}
                    >
                        {title}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    {headerRight}
                    <Button onClick={onClose} sx={{ color: "#fff", textTransform: "none" }}>
                        Close
                    </Button>
                </Stack>

                {/* Body */}
                <Box
                    sx={{
                        p: 1.5,
                        pt: 1,
                        overflowY: "auto",
                        maxHeight: `calc(${maxHeight} - 56px - ${actions ? "54px" : "0px"})`
                    }}
                >
                    {children}
                </Box>

                {/* Footer */}
                {actions ? (
                    <Stack
                        direction="row"
                        spacing={1}
                        sx={{ p: 1.25, borderTop: "1px solid rgba(255,255,255,0.08)" }}
                        justifyContent="flex-end"
                    >
                        {actions}
                    </Stack>
                ) : null}
            </Paper>
        </Box>
    );
}

/* -------------------------- KPI & small components -------------------------- */
function KpiCard({ icon, label, value, sublabel }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 120 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography
                    variant="body2"
                    sx={{ opacity: 0.88, fontFamily: FONTS.subhead, letterSpacing: 0.2 }}
                >
                    {label}
                </Typography>
            </Stack>
            <Typography
                variant="h5"
                sx={{ mt: 0.5, fontWeight: 800, fontFamily: FONTS.number }}
            >
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
function RectCard({ icon, label, value, help, loading = false }) {
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
                gap: 0.25
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                {icon}
                <Typography variant="body2" sx={{ opacity: 0.88, fontFamily: FONTS.subhead }}>
                    {label}
                </Typography>
            </Stack>
            <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: FONTS.number }}>
                    {value}
                </Typography>
                {help ? (
                    <Typography variant="caption" sx={{ opacity: 0.7, fontFamily: FONTS.subhead }}>
                        {help}
                    </Typography>
                ) : null}
            </Stack>
            {loading ? <LinearProgress sx={{ mt: 0.5 }} /> : null}
        </Paper>
    );
}
function StatChip({ icon, label, value, help }) {
    return (
        <Paper
            elevation={0}
            sx={{
                ...softCard,
                p: 1.5,
                borderRadius: 2,
                height: 72,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center">
                {icon}
                <Typography variant="body2" sx={{ opacity: 0.88, fontFamily: FONTS.subhead }}>
                    {label}
                </Typography>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="baseline">
                <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: FONTS.number }}>
                    {value}
                </Typography>
                {help ? (
                    <Typography variant="caption" sx={{ opacity: 0.7, fontFamily: FONTS.subhead }}>
                        {help}
                    </Typography>
                ) : null}
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
        <Box
            sx={{ position: "relative", width: size, height: size, transition: "transform .25s ease" }}
            className="donut"
        >
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
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 12,
                    color: "#fff",
                    fontWeight: 700,
                    fontFamily: FONTS.number
                }}
            >
                {occRate}%
            </Box>
        </Box>
    );
}
function PropertyCard({ p, onOpen, onEdit, onAddUnits }) {
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
                <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}
                >
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
                        <Chip
                            size="small"
                            label={`Units: ${fmtNum(s.TotalUnits)}`}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.14)",
                                fontFamily: FONTS.subhead
                            }}
                        />
                        <Chip
                            size="small"
                            label={`Occupied: ${fmtNum(s.OccupiedUnits)}`}
                            icon={<CheckCircleOutlineIcon sx={{ color: OCCUPIED_COLOR }} />}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.14)",
                                fontFamily: FONTS.subhead
                            }}
                        />
                        <Chip
                            size="small"
                            label={`Vacant: ${fmtNum(s.VacantUnits)}`}
                            icon={<CancelOutlinedIcon sx={{ color: VACANT_COLOR }} />}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.14)",
                                fontFamily: FONTS.subhead
                            }}
                        />
                    </Stack>
                    {p.Description ? (
                        <Typography
                            variant="caption"
                            sx={{ mt: 1, display: "block", opacity: 0.8, fontFamily: FONTS.subhead }}
                        >
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
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none"
                    }}
                    startIcon={<OpenInNewIcon />}
                >
                    View
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => { e.stopPropagation(); onEdit?.(p); }}
                    startIcon={<EditIcon />}
                    sx={{
                        textTransform: "none",
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" }
                    }}
                >
                    Edit
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => { e.stopPropagation(); onAddUnits?.(p); }}
                    startIcon={<AddHomeWorkIcon />}
                    sx={{
                        textTransform: "none",
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" }
                    }}
                >
                    Add Units
                </Button>
            </Stack>
        </Paper>
    );
}

/* ------------------------ Dialogs (using ModalShell) ------------------------ */
function ConfirmDialog({
    open, title, content, onCancel, onConfirm, confirmText = "Confirm", loading = false
}) {
    return (
        <ModalShell
            open={open}
            onClose={loading ? () => { } : onCancel}
            title={title}
            width="min(480px, 92vw)"
        >
            <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}>
                {content}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button onClick={onCancel} disabled={loading} sx={{ textTransform: "none" }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}
                >
                    {loading ? "Working…" : confirmText}
                </Button>
            </Stack>
        </ModalShell>
    );
}

function AddApartmentDialog({ open, onClose, onCreated, api }) {
    const [form, setForm] = useState({ ApartmentName: "", Location: "", Description: "" });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => { if (!open) setForm({ ApartmentName: "", Location: "", Description: "" }); }, [open]);
    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.ApartmentName.trim()) e.ApartmentName = "Apartment name is required";
        if (!form.Location.trim()) e.Location = "Location is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const requestSave = () => { if (validate()) setConfirmOpen(true); };
    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await api.post("/apartments/create", form);
            onCreated?.(data);
            setForm({ ApartmentName: "", Location: "", Description: "" });
            onClose?.();
        } catch (err) {
            const msg = err?.response?.data?.message || "Failed to create apartment.";
            onCreated?.({ error: msg });
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <ModalShell open={open} onClose={saving ? () => { } : onClose} title="Add Property" width="min(560px, 92vw)">
                <Grid container spacing={1.25}>
                    <Grid item xs={12}>
                        <TextField
                            size="small" fullWidth label="Apartment Name" name="ApartmentName"
                            placeholder="e.g., Blue House Apartment"
                            value={form.ApartmentName} onChange={onChange}
                            error={!!errors.ApartmentName} helperText={errors.ApartmentName}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size="small" fullWidth label="Location" name="Location"
                            placeholder="e.g., Kileleshwa, Nairobi"
                            value={form.Location} onChange={onChange}
                            error={!!errors.Location} helperText={errors.Location}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            size="small" fullWidth multiline minRows={3} label="Description (optional)" name="Description"
                            placeholder="Short description of the property"
                            value={form.Description} onChange={onChange}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}
                        />
                    </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={requestSave} disabled={saving} variant="contained"
                        sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                        {saving ? "Saving…" : "Create Apartment"}
                    </Button>
                </Stack>
            </ModalShell>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleSave}
                loading={saving}
                title="Create this apartment?"
                content={`Name: ${form.ApartmentName || "—"} • Location: ${form.Location || "—"}`}
                confirmText="Create"
            />
        </>
    );
}

function EditApartmentDialog({ open, onClose, apartment, api, onUpdated }) {
    const [form, setForm] = useState({ ApartmentName: "", Location: "", Description: "" });
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open && apartment) {
            setForm({
                ApartmentName: apartment.ApartmentName || "",
                Location: apartment.Location || "",
                Description: apartment.Description || "",
            });
        }
        if (!open) setForm({ ApartmentName: "", Location: "", Description: "" });
    }, [open, apartment]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const requestSave = () => setConfirmOpen(true);

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await api.put(`/apartments/update/${apartment.ApartmentID}`, form);
            onUpdated?.(data?.Apartment, data?.message);
            onClose?.();
        } catch (err) {
            onUpdated?.(null, err?.response?.data?.message || "Failed to update apartment.");
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <ModalShell open={open} onClose={saving ? () => { } : onClose} title={`Edit Apartment — ${apartment?.ApartmentName}`} width="min(560px, 92vw)">
                <Grid container spacing={1.25}>
                    <Grid item xs={12}>
                        <TextField size="small" fullWidth label="Apartment Name" name="ApartmentName"
                            value={form.ApartmentName} onChange={onChange}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField size="small" fullWidth label="Location" name="Location"
                            value={form.Location} onChange={onChange}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField size="small" fullWidth multiline minRows={3} label="Description (optional)" name="Description"
                            value={form.Description} onChange={onChange}
                            InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={requestSave} disabled={saving} variant="contained" startIcon={<EditIcon />}
                        sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                        {saving ? "Saving…" : "Save Changes"}
                    </Button>
                </Stack>
            </ModalShell>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleSave}
                loading={saving}
                title="Save apartment changes?"
                content={`Name: ${form.ApartmentName || "—"} • Location: ${form.Location || "—"}`}
                confirmText="Save"
            />
        </>
    );
}

function AddUnitsDialog({ open, onClose, apartment, api, onDone }) {
    const defaults = { prefix: "", startAt: 1, count: 1, pad: 0, MonthlyRent: "", CategoryID: "", StatusID: "", Description: "" };
    const [form, setForm] = useState(defaults);

    const [cats, setCats] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => { if (!open) setForm(defaults); }, [open]);
    const onChange = (e) => { const { name, value } = e.target; setForm((f) => ({ ...f, [name]: value })); };

    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                const [cRes, sRes] = await Promise.all([api.get("/unit-categories"), api.get("/rental-unit-statuses")]);
                setCats(cRes.data?.UnitCategories || []);
                const sts = sRes.data?.RentalUnitStatuses || [];
                setStatuses(sts);
                const vacant = sts.find((x) => x.StatusName?.toLowerCase() === "vacant");
                setForm((f) => ({ ...f, StatusID: f.StatusID || vacant?.StatusID || "" }));
            } catch { /* ignore */ }
        })();
    }, [open]); // eslint-disable-line

    const labelsPreview = useMemo(() => {
        const start = Number(form.startAt) || 1;
        const count = Math.max(1, Number(form.count) || 1);
        const pad = Math.max(0, Number(form.pad) || 0);
        const first = `${form.prefix || ""}${String(start).padStart(pad, "0")}`;
        const last = `${form.prefix || ""}${String(start + count - 1).padStart(pad, "0")}`;
        return { first, last, count };
    }, [form.prefix, form.startAt, form.count, form.pad]);

    const requestCreate = () => { if (!form.MonthlyRent || !form.CategoryID || !form.StatusID) return; setConfirmOpen(true); };

    const handleCreate = async () => {
        const start = Number(form.startAt) || 1;
        const count = Math.max(1, Number(form.count) || 1);
        const pad = Math.max(0, Number(form.pad) || 0);

        const labels = Array.from({ length: count }, (_, i) => {
            const n = start + i;
            const suffix = pad > 0 ? String(n).padStart(pad, "0") : String(n);
            return `${form.prefix || ""}${suffix}`;
        });

        const payloads = labels.map((Label) => ({
            ApartmentID: apartment.ApartmentID,
            Label,
            MonthlyRent: Number(form.MonthlyRent),
            CategoryID: Number(form.CategoryID),
            StatusID: Number(form.StatusID),
            Description: form.Description || "",
        }));

        try {
            setSaving(true);
            const results = await Promise.allSettled(payloads.map((p) => api.post("/rental-units/create", p)));
            const ok = results.filter((r) => r.status === "fulfilled").length;
            const fail = results.length - ok;
            onDone?.({ ok, fail, total: results.length, labels });
            onClose?.();
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <ModalShell open={open} onClose={saving ? () => { } : onClose} title={`Add Units — ${apartment?.ApartmentName}`} width="min(620px, 94vw)">
                <Grid container spacing={1.25}>
                    <Grid item xs={12} sm={3}>
                        <TextField size="small" fullWidth label="Prefix" name="prefix" placeholder="e.g., A-" value={form.prefix} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField size="small" fullWidth label="Start at" name="startAt" type="number" value={form.startAt} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField size="small" fullWidth label="Count" name="count" type="number" value={form.count} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <TextField size="small" fullWidth label="Pad" name="pad" type="number" value={form.pad} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                        <TextField size="small" select fullWidth label="Category" name="CategoryID" value={form.CategoryID} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}>
                            {cats.map((c) => <MenuItem key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</MenuItem>)}
                        </TextField>
                    </Grid>
                </Grid>

                <Typography variant="caption" sx={{ display: "block", mt: 1, opacity: 0.9, fontFamily: FONTS.subhead }}>
                    Example: {labelsPreview.first} … {labelsPreview.last} ({labelsPreview.count} unit{labelsPreview.count > 1 ? "s" : ""})
                </Typography>

                <Grid container spacing={1.25} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" fullWidth label="Monthly Rent" name="MonthlyRent" type="number" value={form.MonthlyRent} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" select fullWidth label="Status" name="StatusID" value={form.StatusID} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}>
                            {statuses.map((s) => <MenuItem key={s.StatusID} value={s.StatusID}>{s.StatusName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField size="small" fullWidth multiline minRows={3} label="Description (optional)" name="Description" value={form.Description} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                </Grid>

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={requestCreate} disabled={saving} variant="contained" startIcon={<AddHomeWorkIcon />} sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                        {saving ? "Creating…" : "Create Units"}
                    </Button>
                </Stack>
            </ModalShell>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleCreate}
                loading={saving}
                title="Create these units?"
                content={`Apartment: ${apartment?.ApartmentName || "—"} • Range: ${labelsPreview.first} … ${labelsPreview.last} (${labelsPreview.count}) • Rent: ${form.MonthlyRent || "—"}`}
                confirmText="Create Units"
            />
        </>
    );
}

function EditUnitDialog({ open, onClose, unit, api, categories, statuses, onUpdated }) {
    const [form, setForm] = useState({ Label: "", Description: "", MonthlyRent: "", CategoryID: "", StatusID: "" });
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (open && unit) {
            setForm({
                Label: unit.Label || "",
                Description: unit.Description || "",
                MonthlyRent: unit.RentAmount ?? unit.MonthlyRent ?? "",
                CategoryID: unit.CategoryID || "",
                StatusID: unit.StatusID || "",
            });
        }
        if (!open) setForm({ Label: "", Description: "", MonthlyRent: "", CategoryID: "", StatusID: "" });
    }, [open, unit]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const requestSave = () => setConfirmOpen(true);

    const handleSave = async () => {
        try {
            setSaving(true);
            const payload = {
                Label: form.Label,
                Description: form.Description,
                MonthlyRent: Number(form.MonthlyRent || 0),
                CategoryID: Number(form.CategoryID || 0),
                StatusID: Number(form.StatusID || 0),
            };
            const { data } = await api.put(`/rental-units/update/${unit.UnitID}`, payload);
            onUpdated?.(data?.RentalUnit, data?.message);
            onClose?.();
        } catch (e) {
            onUpdated?.(null, e?.response?.data?.message || "Failed to update unit.");
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <ModalShell open={open} onClose={saving ? () => { } : onClose} title={`Edit Unit — ${unit?.Label}`} width="min(560px, 92vw)">
                <Grid container spacing={1.25}>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" fullWidth label="Unit Label" name="Label" value={form.Label} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" fullWidth type="number" label="Monthly Rent" name="MonthlyRent" value={form.MonthlyRent} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" select fullWidth label="Category" name="CategoryID" value={form.CategoryID} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}>
                            {categories.map((c) => <MenuItem key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField size="small" select fullWidth label="Status" name="StatusID" value={form.StatusID} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx}>
                            {statuses.map((s) => <MenuItem key={s.StatusID} value={s.StatusID}>{s.StatusName}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid item xs={12}>
                        <TextField size="small" fullWidth multiline minRows={3} label="Description" name="Description" value={form.Description} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                    </Grid>
                </Grid>
                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                    <Button onClick={requestSave} disabled={saving} variant="contained" startIcon={<EditIcon />} sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                        {saving ? "Saving…" : "Save Changes"}
                    </Button>
                </Stack>
            </ModalShell>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={handleSave}
                loading={saving}
                title="Apply changes to this unit?"
                content={`Label: ${form.Label || "—"} • Rent: ${fmtKES(form.MonthlyRent || 0)}`}
                confirmText="Save"
            />
        </>
    );
}

function AssignTenantDialog({ open, onClose, unit, api, onAssigned }) {
    const [form, setForm] = useState({
        FullName: "", Phone: "", Email: "", IDNumber: "", MoveInDate: dayjs().format("YYYY-MM-DD"),
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) {
            setForm({ FullName: "", Phone: "", Email: "", IDNumber: "", MoveInDate: dayjs().format("YYYY-MM-DD") });
            setErrors({});
        }
    }, [open]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const validate = () => {
        const e = {};
        if (!form.FullName.trim()) e.FullName = "Name required";
        if (!/^(?:\+?254|0)?7\d{8}$/.test(form.Phone || "")) {
            e.Phone = "Use 07XXXXXXXX, 2547XXXXXXXX or +2547XXXXXXXX";
        }
        if (!form.IDNumber?.trim()) e.IDNumber = "ID number required";
        if (!form.MoveInDate) e.MoveInDate = "Move-in date required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleAssign = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            const payload = {
                FullName: form.FullName.trim(),
                Phone: form.Phone.trim(),
                Email: (form.Email || "").trim(),
                IDNumber: form.IDNumber.trim(),
                RentalUnitID: unit.UnitID,
                MoveInDate: form.MoveInDate,
            };
            const { data } = await api.post("/tenants/add", payload);
            onAssigned?.(data, null, payload);
            onClose?.();
        } catch (e) {
            onAssigned?.(null, e?.response?.data?.message || "Failed to assign tenant.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell open={open} onClose={saving ? () => { } : onClose} title={`Assign Tenant — ${unit?.ApartmentName} / ${unit?.Label}`} width="min(560px, 92vw)">
            <Grid container spacing={1.25}>
                <Grid item xs={12} sm={6}>
                    <TextField size="small" fullWidth label="Full Name" name="FullName" value={form.FullName} onChange={onChange} error={!!errors.FullName} helperText={errors.FullName} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField size="small" fullWidth label="Phone (07…, 2547…, or +2547…)" name="Phone" value={form.Phone} onChange={onChange} error={!!errors.Phone} helperText={errors.Phone} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField size="small" fullWidth label="Email (optional)" name="Email" value={form.Email} onChange={onChange} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField size="small" fullWidth label="ID Number" name="IDNumber" value={form.IDNumber} onChange={onChange} error={!!errors.IDNumber} helperText={errors.IDNumber} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField size="small" fullWidth type="date" label="Move-in Date" name="MoveInDate" value={form.MoveInDate} onChange={onChange} error={!!errors.MoveInDate} helperText={errors.MoveInDate} InputLabelProps={{ shrink: true }} sx={fieldNeumorphSx} />
                </Grid>
            </Grid>

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                <Button onClick={handleAssign} disabled={saving} variant="contained" startIcon={<PeopleIcon />} sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                    {saving ? "Assigning…" : "Assign Tenant"}
                </Button>
            </Stack>
        </ModalShell>
    );
}

function VacateNoticeDialog({ open, onClose, unit, tenantId, api, onCreated }) {
    const [form, setForm] = useState({
        ExpectedVacateDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
        DaysBefore: 3,
        InspectionDate: "",
        Reason: "",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!open) {
            setForm({
                ExpectedVacateDate: dayjs().add(30, "day").format("YYYY-MM-DD"),
                DaysBefore: 3,
                InspectionDate: "",
                Reason: "",
            });
            setErrors({});
        }
    }, [open]);

    const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.ExpectedVacateDate) e.ExpectedVacateDate = "Vacate date required";
        const db = Number(form.DaysBefore);
        if (Number.isNaN(db) || db < 0 || db > 60) e.DaysBefore = "0–60 days accepted";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleCreate = async () => {
        if (!tenantId || !validate()) return;
        try {
            setSaving(true);
            const payload = {
                ExpectedVacateDate: form.ExpectedVacateDate,
                Reason: form.Reason || undefined,
                InspectionDate: form.InspectionDate || undefined,
                DaysBefore: Number(form.DaysBefore)
            };
            const { data } = await api.post(`/vacate-notice/${tenantId}`, payload);
            onCreated?.(data, null, payload);
            onClose?.();
        } catch (e) {
            onCreated?.(null, e?.response?.data?.message || "Failed to create vacate notice.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <ModalShell
            open={open}
            onClose={saving ? () => { } : onClose}
            title={`Vacate Notice — ${unit?.ApartmentName} / ${unit?.Label}`}
            width="min(560px, 92vw)"
        >
            <Grid container spacing={1.25}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        size="small"
                        fullWidth
                        type="date"
                        label="Expected Vacate Date"
                        name="ExpectedVacateDate"
                        value={form.ExpectedVacateDate}
                        onChange={onChange}
                        error={!!errors.ExpectedVacateDate}
                        helperText={errors.ExpectedVacateDate}
                        InputLabelProps={{ shrink: true }}
                        sx={fieldNeumorphSx}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        size="small"
                        fullWidth
                        type="number"
                        label="Reminder — Days Before"
                        name="DaysBefore"
                        value={form.DaysBefore}
                        onChange={onChange}
                        error={!!errors.DaysBefore}
                        helperText={errors.DaysBefore || "We’ll text the tenant automatically"}
                        InputLabelProps={{ shrink: true }}
                        sx={fieldNeumorphSx}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        size="small"
                        fullWidth
                        type="date"
                        label="Inspection Date (optional)"
                        name="InspectionDate"
                        value={form.InspectionDate}
                        onChange={onChange}
                        InputLabelProps={{ shrink: true }}
                        sx={fieldNeumorphSx}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        size="small"
                        fullWidth
                        multiline
                        minRows={3}
                        label="Reason (optional)"
                        name="Reason"
                        value={form.Reason}
                        onChange={onChange}
                        InputLabelProps={{ shrink: true }}
                        sx={fieldNeumorphSx}
                    />
                </Grid>
            </Grid>

            <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>Cancel</Button>
                <Button
                    onClick={handleCreate}
                    disabled={saving}
                    variant="contained"
                    startIcon={<EventBusyIcon />}
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}
                >
                    {saving ? "Saving…" : "Create Notice"}
                </Button>
            </Stack>
        </ModalShell>
    );
}

function ExportDialog({ open, onClose, rows, defaultCols, onExported, monthKey }) {
    const STORAGE_KEY = "prop_export_cols_v1";
    const [cols, setCols] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) { try { return JSON.parse(saved); } catch { } }
        return defaultCols.reduce((acc, c) => ({ ...acc, [c.key]: c.default }), {});
    });
    const [downloadUrl, setDownloadUrl] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            const init = defaultCols.reduce((acc, c) => ({ ...acc, [c.key]: c.default }), {});
            setCols(init);
        }
        return () => { if (downloadUrl) URL.revokeObjectURL(downloadUrl); };
        // eslint-disable-next-line
    }, [open]);

    const toggle = (key) => setCols((c) => ({ ...c, [key]: !c[key] }));

    const buildAndDownload = () => {
        const selected = defaultCols.filter((c) => cols[c.key]);
        if (selected.length === 0) return;

        const head = selected.map((c) => c.header).join(",");
        const body = rows
            .map((r) =>
                selected
                    .map((c) => {
                        const val = typeof c.get === "function" ? c.get(r) : r[c.key];
                        return `"${String(val ?? "").replace(/"/g, '""')}"`;
                    })
                    .join(",")
            )
            .join("\n");

        const blob = new Blob([head + "\n" + body], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));

        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        a.click();

        onExported?.();
    };

    const requestExport = () => {
        const selected = defaultCols.filter((c) => cols[c.key]).length;
        if (selected === 0) return;
        setConfirmOpen(true);
    };
    const confirmExport = () => { setConfirmOpen(false); buildAndDownload(); };

    return (
        <>
            <ModalShell open={open} onClose={onClose} title={`Export — ${monthKey}`} width="min(520px, 92vw)">
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8, fontFamily: FONTS.subhead }}>
                    Choose which columns to include in your download. The export respects the current view and filters.
                </Typography>
                <FormGroup>
                    {defaultCols.map((c) => (
                        <FormControlLabel
                            key={c.key}
                            control={<Checkbox checked={!!cols[c.key]} onChange={() => toggle(c.key)} sx={{ color: "#fff" }} />}
                            label={c.header}
                        />
                    ))}
                </FormGroup>
                {downloadUrl ? (
                    <Typography variant="caption" sx={{ mt: 1, display: "block", opacity: 0.8 }}>
                        If your download didn’t start,{" "}
                        <a href={downloadUrl} download={`export_${dayjs().format("YYYYMMDD_HHmmss")}.csv`} style={{ color: "#9ae6b4" }}>
                            click here to download
                        </a>.
                    </Typography>
                ) : null}

                <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1.5 }}>
                    <Button onClick={onClose} sx={{ textTransform: "none" }}>Close</Button>
                    <Button onClick={requestExport} variant="contained" startIcon={<FileDownloadOutlinedIcon />} sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}>
                        Export CSV
                    </Button>
                </Stack>
            </ModalShell>

            <ConfirmDialog
                open={confirmOpen}
                onCancel={() => setConfirmOpen(false)}
                onConfirm={confirmExport}
                title="Export CSV?"
                content="We’ll export the current table with your selected columns. Continue?"
                confirmText="Export"
            />
        </>
    );
}

/* ---------------------------------- Page ----------------------------------- */
export default function Properties() {
    const [loading, setLoading] = useState(true);
    const [apartments, setApartments] = useState([]);
    const [tenants, setTenants] = useState([]);
    const [collectedThisMonth, setCollectedThisMonth] = useState(0);
    const [overdueThisMonth, setOverdueThisMonth] = useState(0);
    const [expensesMonthTotal, setExpensesMonthTotal] = useState(0);
    const [expensesByApartment, setExpensesByApartment] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [unitsOpen, setUnitsOpen] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);

    const [statusList, setStatusList] = useState([]);
    const [categoryList, setCategoryList] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitsLoading, setUnitsLoading] = useState(false);
    const [filterAptId, setFilterAptId] = useState(null);
    const tableRef = useRef(null);

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [delta, setDelta] = useState(null);
    const [flashIds, setFlashIds] = useState(new Set());
    const hasLoadedRef = useRef(false);
    const refreshingRef = useRef(false);
    const prevMapRef = useRef(new Map());
    const lastClickRef = useRef(0);

    const [exportOpen, setExportOpen] = useState(false);

    const [editUnitOpen, setEditUnitOpen] = useState(false);
    const [editUnit, setEditUnit] = useState(null);
    const [assignOpen, setAssignOpen] = useState(false);
    const [assignUnit, setAssignUnit] = useState(null);

    const [vacateOpen, setVacateOpen] = useState(false);
    const [vacateUnit, setVacateUnit] = useState(null);
    const [vacateTenantId, setVacateTenantId] = useState(null);

    const [selectedIds, setSelectedIds] = useState([]);
    const [bulkStatusId, setBulkStatusId] = useState("");
    const [bulkConfirmOpen, setBulkConfirmOpen] = useState(false);

    const [expenseHL, setExpenseHL] = useState({
        paidAmt: 0, paidCount: 0, unpaidAmt: 0, unpaidCount: 0, count: 0,
        topCategory: null, topCategoryPct: 0, topApartment: null, topApartmentAmt: 0,
        avgPerApt: 0, momPct: null, latest: null, lastMonthKey: "", lastMonthTotal: 0
    });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    useEffect(() => { setPage(0); }, [units]);

    const [twilioOk, setTwilioOk] = useState(null);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = axios.create({ baseURL: API, headers: token ? { Authorization: `Bearer ${token}` } : {} });

    // --- helpers to read statuses
    const getStatusIdByName = React.useCallback((name) => {
        const n = String(name || "").toLowerCase();
        const hit = statusList.find(s => String(s.StatusName || "").toLowerCase() === n);
        return hit?.StatusID || null;
    }, [statusList]);

    const ensureOccupied = React.useCallback(async (unitId) => {
        const occId = getStatusIdByName("occupied");
        if (!occId) return;
        try { await api.put(`/rental-units/update/${unitId}`, { StatusID: Number(occId) }); } catch { }
    }, [api, getStatusIdByName]);

    // --- rows diff/snapshot for flashing
    const snapshotRow = (r) => ({
        id: `${r.ApartmentID}-${r.UnitID}`,
        tenant: r.TenantName || "",
        status: r.StatusID || r.StatusName || "",
        arrears: Number(r.Arrears || 0),
        moveIn: r.MoveIn || ""
    });
    const diffUnits = (newRows) => {
        const prev = prevMapRef.current;
        const next = new Map();
        let added = 0, updated = 0, removed = 0;
        const flashes = new Set();
        for (const r of newRows) {
            const snap = snapshotRow(r);
            next.set(snap.id, snap);
            const old = prev.get(snap.id);
            if (!old) { added++; flashes.add(snap.id); }
            else if (old.tenant !== snap.tenant || old.status !== snap.status || old.arrears !== snap.arrears || old.moveIn !== snap.moveIn) {
                updated++; flashes.add(snap.id);
            }
        }
        for (const id of prev.keys()) { if (!next.has(id)) removed++; }
        return { added, updated, removed, flashes, next };
    };

    // ----------------------- SMS helpers (Twilio via backend) -----------------------
    const [smsConfirm, setSmsConfirm] = useState({ open: false, unit: null, body: "" });
    const [smsSending, setSmsSending] = useState(false);
    const [bulkSmsConfirm, setBulkSmsConfirm] = useState(false);

    const toE164 = (p) => {
        if (!p) return "";
        const s = String(p).trim();
        return s.startsWith("+") ? s : `+${s}`;
    };
    const firstName = (n) => (n || "").split(" ")[0] || "";
    const notifySMS = async ({ to, body }) => {
        // Prefer message queue endpoint when available; fallback to direct send
        try {
            return await api.post("/messages/queue", { to: toE164(to), body });
        } catch {
            return await api.post("/twilio/sms", { to: toE164(to), body });
        }
    };
    const buildArrearsBody = (u) => {
        const amt = fmtNum(u.Arrears || 0);
        return `Hi ${firstName(u.TenantName)}, your rent balance for ${u.ApartmentName} ${u.Label} is KES ${amt} as of ${monthKey}. Please settle to avoid penalties. Reply HELP for assistance.`;
    };

    // --- Load units (all or per apartment)
    const loadUnits = async (apartmentId = null, opts = {}) => {
        const apartmentsSrc = opts.apartments ?? apartments;
        const tenantsSrc = opts.tenants ?? tenants;
        const statusListSrc = opts.statusList ?? statusList;

        try {
            setUnitsLoading(true);
            let rows = [];
            if (apartmentId) {
                const apt = apartmentsSrc.find((a) => a.ApartmentID === apartmentId);
                if (!apt) return;
                const { data } = await api.get(`/apartments/${apartmentId}/units`);
                rows = (data || []).map((u) => ({ ...u, ApartmentID: apartmentId, ApartmentName: apt.ApartmentName }));
            } else {
                const results = await Promise.allSettled(
                    apartmentsSrc.map(async (apt) => {
                        const { data } = await api.get(`/apartments/${apt.ApartmentID}/units`);
                        return (data || []).map((u) => ({ ...u, ApartmentID: apt.ApartmentID, ApartmentName: apt.ApartmentName }));
                    })
                );
                rows = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
            }

            const tIndex = new Map((tenantsSrc || []).map((t) => [`${t.Apartment || ""}||${t.RentalUnit || ""}`.toLowerCase(), t]));
            const statusMap = Object.fromEntries((statusListSrc || []).map((s) => [s.StatusID, s.StatusName]));

            const joined = rows.map((r) => {
                const key = `${r.ApartmentName || ""}||${r.Label || ""}`.toLowerCase();
                const ten = tIndex.get(key);
                return {
                    ...r,
                    StatusName: statusMap[r.StatusID] || "Unknown",
                    TenantName: ten?.FullName || "",
                    TenantPhone: ten?.Phone || "",
                    MoveIn: ten?.MoveInDate || "",
                    Arrears: ten?.Arrears || 0,
                    TenantID: ten?.TenantID || null
                };
            });

            setUnits(joined);

            if (refreshingRef.current && hasLoadedRef.current) {
                const { added, updated, removed, flashes, next } = diffUnits(joined);
                setDelta({ added, updated, removed });
                setFlashIds(flashes);
                prevMapRef.current = next;
                setTimeout(() => setFlashIds(new Set()), 2500);
            } else {
                const baseline = new Map(joined.map(r => [snapshotRow(r).id, snapshotRow(r)]));
                prevMapRef.current = baseline;
            }

            if (tableRef.current) tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: "Failed to load units.", severity: "error" });
        } finally {
            setUnitsLoading(false);
        }
    };

    // --- Fetch all dashboard data
    const fetchAll = async () => {
        try {
            setLoading(true);
            const [
                aptsRes, tenantsRes, billsMonthRes, unpaidRes, partialRes,
                expByAptRes, expByMonthRes, statusesRes, catsRes, twilioHealthRes
            ] = await Promise.all([
                api.get("/myapartments"),
                api.get("/tenants"),
                api.get(`/bills/month/${encodeURIComponent(monthKey)}`).catch(() => ({ data: { bills: [] } })),
                api.get("/bills/status/Unpaid").catch(() => ({ data: { bills: [] } })),
                api.get("/bills/status/Partially%20Paid").catch(() => ({ data: { bills: [] } })),
                api.get("/landlord-expenses/by-apartment").catch(() => ({ data: { expenses: {} } })),
                api.get("/landlord-expenses/by-month").catch(() => ({ data: { expenses: {} } })),
                api.get("/rental-unit-statuses").catch(() => ({ data: { RentalUnitStatuses: [] } })),
                api.get("/unit-categories").catch(() => ({ data: { UnitCategories: [] } })),
                api.get("/health/twilio").catch(() => ({ data: { has_twilio_client: false } })),
            ]);

            const apts = (aptsRes.data?.Apartments || []).map((a) => ({
                ...a,
                Stats: a.Stats || { TotalUnits: 0, OccupiedUnits: 0, VacantUnits: 0, ReservedUnits: 0, VacancyRate: 0 }
            }));
            setApartments(apts);
            setTenants(tenantsRes.data?.items || tenantsRes.data?.tenants || []);
            setStatusList(statusesRes.data?.RentalUnitStatuses || []);
            setCategoryList(catsRes.data?.UnitCategories || []);
            setTwilioOk(Boolean(twilioHealthRes?.data?.has_twilio_client));

            const monthBills = billsMonthRes.data?.bills || [];
            const collected = monthBills
                .filter((b) => b.BillStatus === "Paid")
                .reduce((acc, b) => acc + Number(b.TotalAmountDue || 0), 0);
            setCollectedThisMonth(collected);

            const overdue =
                (unpaidRes.data?.bills || []).reduce((a, b) => a + Number(b.TotalAmountDue || 0), 0) +
                (partialRes.data?.bills || []).reduce((a, b) => a + Number(b.TotalAmountDue || 0), 0);
            setOverdueThisMonth(overdue);

            const byApt = expByAptRes.data?.expenses || {};
            const byMonth = expByMonthRes.data?.expenses || {};
            const monthList = byMonth[monthKey] || [];
            const totalThisMonth = monthList.reduce((sum, r) => sum + Number(r.Amount || 0), 0);
            setExpensesMonthTotal(totalThisMonth);

            const byApartmentMonth = Object.entries(byApt)
                .map(([aptName, arr]) => {
                    const totalMonth = (arr || [])
                        .filter((e) => dayjs(e.ExpenseDate || e.ExpensePaymentDate, "YYYY-MM-DD").format("MMMM YYYY") === monthKey)
                        .reduce((sum, e) => sum + Number(e.Amount || 0), 0);
                    return { apartment: aptName, totalMonth };
                })
                .sort((a, b) => b.totalMonth - a.totalMonth);
            setExpensesByApartment(byApartmentMonth);

            const paidList = monthList.filter(e => !!e.ExpensePaymentDate);
            const unpaidList = monthList.filter(e => !e.ExpensePaymentDate);
            const paidAmt = paidList.reduce((a, e) => a + Number(e.Amount || 0), 0);
            const unpaidAmt = unpaidList.reduce((a, e) => a + Number(e.Amount || 0), 0);

            const catMap = new Map();
            for (const e of monthList) {
                const k = e.ExpenseType || "Other";
                catMap.set(k, (catMap.get(k) || 0) + Number(e.Amount || 0));
            }
            let topCategory = null, topCategoryAmt = 0;
            for (const [k, v] of catMap.entries()) { if (v > topCategoryAmt) { topCategoryAmt = v; topCategory = k; } }
            const topCategoryPct = totalThisMonth ? Math.round((topCategoryAmt / totalThisMonth) * 100) : 0;

            const topApt = byApartmentMonth[0] || null;
            const topApartment = topApt?.apartment || null;
            const topApartmentAmt = topApt?.totalMonth || 0;

            const activeApts = byApartmentMonth.filter(x => x.totalMonth > 0).length || 0;
            const avgPerApt = activeApts ? Math.round(totalThisMonth / activeApts) : 0;

            const prevMonthKey = dayjs().subtract(1, "month").format("MMMM YYYY");
            const prevList = byMonth[prevMonthKey] || [];
            const prevTotal = prevList.reduce((s, r) => s + Number(r.Amount || 0), 0);
            const momPct = prevTotal ? Math.round(((totalThisMonth - prevTotal) / prevTotal) * 100) : null;

            const latest = [...monthList].sort((a, b) => {
                const da = new Date(a.ExpensePaymentDate || a.ExpenseDate || 0);
                const db = new Date(b.ExpensePaymentDate || b.ExpenseDate || 0);
                return db - da;
            })[0] || null;

            setExpenseHL({
                paidAmt, paidCount: paidList.length,
                unpaidAmt, unpaidCount: unpaidList.length,
                count: monthList.length,
                topCategory, topCategoryPct,
                topApartment, topApartmentAmt,
                avgPerApt, momPct,
                latest: latest ? {
                    date: dayjs(latest.ExpensePaymentDate || latest.ExpenseDate).format("YYYY-MM-DD"),
                    type: latest.ExpenseType, amount: Number(latest.Amount || 0), apartment: latest.Apartment || latest.ApartmentName || ""
                } : null,
                lastMonthKey: prevMonthKey, lastMonthTotal: prevTotal
            });

            await loadUnits(
                filterAptId || null,
                {
                    apartments: apts,
                    tenants: tenantsRes.data?.items || tenantsRes.data?.tenants || [],
                    statusList: statusesRes.data?.RentalUnitStatuses || []
                }
            );

            if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                setLastSync(new Date());
            }
        } catch (e) {
            console.error(e);
            setSnackbar({ open: true, message: "Failed to load data. Check API/token.", severity: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); /* eslint-disable-line */ }, []);

    const kpi = useMemo(() => {
        const totals = apartments.reduce((acc, a) => {
            const s = a.Stats || {};
            acc.units += s.TotalUnits || 0;
            acc.occ += s.OccupiedUnits || 0;
            acc.vac += s.VacantUnits || 0;
            return acc;
        }, { units: 0, occ: 0, vac: 0 });
        const occRate = totals.units ? Math.round((totals.occ / totals.units) * 100) : 0;
        return {
            totalApartments: apartments.length,
            totalUnits: totals.units,
            occupied: totals.occ,
            vacant: totals.vac,
            occupancyRate: occRate
        };
    }, [apartments]);

    const handleOpenApartment = async (apt) => {
        setFilterAptId(apt.ApartmentID);
        setSelectedIds([]);
        await loadUnits(apt.ApartmentID);
    };

    const handleAddCreated = (res) => {
        if (res?.error) { setSnackbar({ open: true, message: res.error, severity: "error" }); return; }
        const a = res?.Apartment;
        if (a) {
            setApartments((prev) => [{
                ApartmentID: a.ApartmentID, ApartmentName: a.ApartmentName, Location: a.Location, Description: a.Description,
                CreatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                Stats: { TotalUnits: 0, OccupiedUnits: 0, VacantUnits: 0, ReservedUnits: 0, VacancyRate: 0 },
            }, ...prev]);
        }
        setSnackbar({ open: true, message: (res?.message || "Apartment created.") + " (Owner SMS queued)", severity: "success" });
        fetchAll();
    };

    const handleUpdatedApartment = (updated, message) => {
        if (!updated) { setSnackbar({ open: true, message, severity: "error" }); return; }
        setApartments((prev) => prev.map((p) => (p.ApartmentID === updated.ApartmentID ? { ...p, ...updated } : p)));
        setSnackbar({ open: true, message: message || "Apartment updated.", severity: "success" });
        fetchAll();
    };

    const handleUnitsDone = ({ ok, fail, total }) => {
        const msg = `Created ${ok}/${total} unit(s)` + (fail ? ` — ${fail} failed` : "");
        setSnackbar({ open: true, message: msg, severity: fail ? "warning" : "success" });
        if (filterAptId) loadUnits(filterAptId);
        fetchAll();
    };

    const statusChip = (name) => {
        const n = (name || "").toLowerCase();
        let bg = "rgba(255,255,255,.1)";
        if (n === "occupied") bg = "rgba(110,231,183,.2)";
        else if (n === "vacant") bg = "rgba(251,113,133,.2)";
        else if (n === "reserved") bg = "rgba(253,230,138,.2)";
        return <Chip size="small" label={name || "—"} sx={{ bgcolor: bg, color: "#fff", border: "1px solid rgba(255,255,255,.18)" }} />;
    };

    const clearFilter = async () => { setFilterAptId(null); setSelectedIds([]); await loadUnits(null); };

    const handleRefresh = async () => {
        const now = Date.now();
        if (now - lastClickRef.current < 1500) { setSnackbar({ open: true, message: "Please wait a moment…", severity: "info" }); return; }
        lastClickRef.current = now;
        try {
            setIsRefreshing(true);
            refreshingRef.current = true;
            await fetchAll();
            setLastSync(new Date());
            setSelectedIds([]);
        } finally {
            refreshingRef.current = false;
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        const onFocus = () => { if (hasLoadedRef.current) handleRefresh(); };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
        // eslint-disable-next-line
    }, []);

    const exportColumns = useMemo(() => ([
        { key: "ApartmentName", header: "Property", default: true },
        { key: "Label", header: "Rental Unit", default: true },
        { key: "TenantName", header: "Tenant", default: true },
        { key: "TenantPhone", header: "Tenant Phone", default: false },
        { key: "StatusName", header: "Status", default: true },
        { key: "MoveIn", header: "Move In", default: true, get: (r) => r.MoveIn ? dayjs(r.MoveIn).format("YYYY-MM-DD") : "" },
        { key: "Arrears", header: "Arrears", default: true, get: (r) => String(Number(r.Arrears || 0)) },
    ]), []);

    const openEditUnit = (u) => { setEditUnit(u); setEditUnitOpen(true); };
    const openAssignTenant = (u) => { setAssignUnit(u); setAssignOpen(true); };
    const openVacate = (u) => {
        if (!u?.TenantID) {
            setSnackbar({ open: true, message: "No active tenant to schedule vacate.", severity: "info" });
            return;
        }
        setVacateUnit(u);
        setVacateTenantId(u.TenantID);
        setVacateOpen(true);
    };

    const onUnitUpdated = (updated, msg) => {
        if (!updated) { setSnackbar({ open: true, message: msg || "Failed to update unit.", severity: "error" }); return; }
        setSnackbar({ open: true, message: msg || "Unit updated.", severity: "success" });
        if (filterAptId) loadUnits(filterAptId); else loadUnits(null);
        fetchAll();
    };

    const onTenantAssigned = async (data, err /* , payload */) => {
        if (err) { setSnackbar({ open: true, message: err, severity: "error" }); return; }
        if (assignUnit?.UnitID) await ensureOccupied(assignUnit.UnitID);
        setSnackbar({
            open: true,
            message: (data?.message || "Tenant assigned.") + " (Welcome SMS queued)",
            severity: "success"
        });
        if (filterAptId) await loadUnits(filterAptId); else await loadUnits(null);
        fetchAll();
    };

    // selection helpers
    const toggleSelect = (unitId) =>
        setSelectedIds((ids) => (ids.includes(unitId) ? ids.filter((id) => id !== unitId) : [...ids, unitId]));
    const allUnitIds = units.map((u) => u.UnitID);
    const allSelected = selectedIds.length > 0 && selectedIds.length === allUnitIds.length;
    const anySelected = selectedIds.length > 0;
    const toggleSelectAll = () =>
        setSelectedIds((ids) => (ids.length === allUnitIds.length ? [] : [...allUnitIds]));

    const requestBulkApply = () => { if (!bulkStatusId || !anySelected) return; setBulkConfirmOpen(true); };
    const handleBulkApply = async () => {
        setBulkConfirmOpen(false);
        try {
            const payloads = selectedIds.map((id) => api.put(`/rental-units/update/${id}`, { StatusID: Number(bulkStatusId) }));
            const results = await Promise.allSettled(payloads);
            const ok = results.filter((r) => r.status === "fulfilled").length;
            const fail = results.length - ok;
            setSnackbar({ open: true, message: `Applied status to ${ok}/${results.length} unit(s)` + (fail ? ` — ${fail} failed` : ""), severity: fail ? "warning" : "success" });
            setSelectedIds([]);
            if (filterAptId) loadUnits(filterAptId); else loadUnits(null);
            fetchAll();
        } catch {
            setSnackbar({ open: true, message: "Bulk update failed.", severity: "error" });
        }
    };

    // Bulk SMS
    const sendBulkArrearsSms = async () => {
        setBulkSmsConfirm(false);
        const targets = units.filter(
            (u) => selectedIds.includes(u.UnitID) && u.Arrears > 0 && !!u.TenantPhone
        );
        if (targets.length === 0) {
            setSnackbar({ open: true, message: "No selected tenants with phone & arrears.", severity: "info" });
            return;
        }
        try {
            setIsRefreshing(true); // slim progress bar
            const results = await Promise.allSettled(
                targets.map((u) => notifySMS({ to: u.TenantPhone, body: buildArrearsBody(u) }))
            );
            const ok = results.filter((r) => r.status === "fulfilled").length;
            const fail = results.length - ok;
            setSnackbar({
                open: true,
                message: `Sent ${ok}/${results.length} SMS` + (fail ? ` — ${fail} failed` : ""),
                severity: fail ? "warning" : "success",
            });
        } finally {
            setIsRefreshing(false);
        }
    };

    // One-off SMS dialog helpers
    const [smsConfirmState, setSmsConfirmState] = useState({ open: false, unit: null, body: "" });
    const openArrearsSms = (u) => setSmsConfirmState({ open: true, unit: u, body: buildArrearsBody(u) });
    const sendOneSms = async () => {
        const u = smsConfirmState.unit;
        if (!u) return;
        try {
            setSmsSending(true);
            await notifySMS({ to: u.TenantPhone, body: smsConfirmState.body });
            setSnackbar({ open: true, message: "SMS sent.", severity: "success" });
        } catch (e) {
            setSnackbar({ open: true, message: e?.response?.data?.message || "Failed to send SMS.", severity: "error" });
        } finally {
            setSmsSending(false);
            setSmsConfirmState({ open: false, unit: null, body: "" });
        }
    };

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh", position: "relative" }}>
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
                        letterSpacing: 0.5
                    }}
                >
                    Properties
                </Typography>
                <Chip
                    size="small"
                    icon={<SmsOutlinedIcon sx={{ color: twilioOk ? "#6EE7B7" : "#FB7185" }} />}
                    label={twilioOk === null ? "SMS: Checking…" : twilioOk ? "SMS: Ready" : "SMS: Unavailable"}
                    sx={{
                        ml: 1,
                        color: "#fff",
                        bgcolor: twilioOk ? "rgba(110,231,183,.15)" : "rgba(251,113,133,.15)",
                        border: "1px solid rgba(255,255,255,.18)",
                        fontFamily: FONTS.subhead
                    }}
                />
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title={lastSync ? `Refresh • Last sync ${dayjs(lastSync).format("HH:mm:ss")}` : "Refresh"}>
                    <span>
                        <IconButton onClick={handleRefresh} sx={{ color: "#fff" }} disabled={isRefreshing}>
                            {isRefreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
                        </IconButton>
                    </span>
                </Tooltip>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                        "&:hover": { boxShadow: BRAND.glow }
                    }}
                    onClick={() => setAddOpen(true)}
                >
                    Add Property
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard icon={<ApartmentIcon fontSize="small" />} label="Total Apartments" value={fmtNum(kpi.totalApartments)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard icon={<PeopleIcon fontSize="small" />} label="Occupancy Rate" value={`${kpi.occupancyRate}%`} sublabel={`${fmtNum(kpi.occupied)} occupied`} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard icon={<HomeWorkIcon fontSize="small" />} label="Total Units" value={fmtNum(kpi.totalUnits)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard icon={<CheckCircleOutlineIcon fontSize="small" />} label="Occupied" value={fmtNum(kpi.occupied)} />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard icon={<CancelOutlinedIcon fontSize="small" />} label="Vacant" value={fmtNum(kpi.vacant)} />
                </Grid>
            </Grid>

            {/* Money row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <RectCard icon={<LocalAtmOutlinedIcon sx={{ color: "#6EE7B7" }} />} label={`Collected — ${monthKey}`} value={fmtKES(collectedThisMonth)} help="Sum of Paid bills" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <RectCard icon={<WarningAmberOutlinedIcon sx={{ color: "#FB7185" }} />} label="Overdue (unpaid & partial)" value={fmtKES(overdueThisMonth)} help="Outstanding before payments" />
                </Grid>
                <Grid item xs={12} md={4}>
                    <RectCard icon={<ReceiptLongOutlinedIcon sx={{ color: "#A78BFA" }} />} label={`Expenses — ${monthKey}`} value={fmtKES(expensesMonthTotal)} help="Across all apartments" />
                </Grid>
            </Grid>

            {/* Expenses by Apartment + Highlights */}
            <Paper elevation={0} sx={{ ...softCard, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Expenses — {monthKey}
                </Typography>
                {expenseHL.count === 0 ? (
                    <>
                        <Typography variant="body2" sx={{ opacity: 0.72, fontFamily: FONTS.subhead }}>No expenses recorded this month.</Typography>
                        {expenseHL.lastMonthTotal > 0 ? (
                            <Typography variant="caption" sx={{ display: "block", mt: 0.5, opacity: 0.8, fontFamily: FONTS.subhead }}>
                                Last month ({expenseHL.lastMonthKey}): {fmtKES(expenseHL.lastMonthTotal)}
                            </Typography>
                        ) : null}
                    </>
                ) : (
                    <>
                        <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}><StatChip icon={<LocalAtmOutlinedIcon sx={{ color: "#6EE7B7" }} />} label="Paid" value={fmtKES(expenseHL.paidAmt)} help={`${expenseHL.paidCount} item(s)`} /></Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}><StatChip icon={<WarningAmberOutlinedIcon sx={{ color: "#FB7185" }} />} label="Unpaid" value={fmtKES(expenseHL.unpaidAmt)} help={`${expenseHL.unpaidCount} item(s)`} /></Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}><StatChip icon={<CategoryIcon />} label="Top Category" value={expenseHL.topCategory || "—"} help={expenseHL.topCategory ? `${expenseHL.topCategoryPct}%` : ""} /></Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}><StatChip icon={<BusinessIcon />} label="Top Apartment" value={fmtKES(expenseHL.topApartmentAmt)} help={expenseHL.topApartment || "—"} /></Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}><StatChip icon={<ReceiptLongOutlinedIcon />} label="Avg / Apt" value={fmtKES(expenseHL.avgPerApt)} help="with spend" /></Grid>
                            <Grid item xs={12} sm={6} md={4} lg={2.4}>
                                <StatChip
                                    icon={expenseHL.momPct === null ? <TrendingUpIcon /> : expenseHL.momPct >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                    label="MoM Change"
                                    value={expenseHL.momPct === null ? "—" : `${expenseHL.momPct >= 0 ? "↑" : "↓"} ${Math.abs(expenseHL.momPct)}%`}
                                    help={`vs ${expenseHL.lastMonthKey}`}
                                />
                            </Grid>
                        </Grid>
                        {expenseHL.latest ? (
                            <Typography variant="caption" sx={{ display: "block", mb: 1.5, opacity: 0.8, fontFamily: FONTS.subhead }}>
                                <ScheduleIcon fontSize="inherit" style={{ verticalAlign: "middle", marginRight: 6 }} />
                                Last expense on {expenseHL.latest.date} • {expenseHL.latest.type} {fmtKES(expenseHL.latest.amount)}{expenseHL.latest.apartment ? ` at ${expenseHL.latest.apartment}` : ""}
                            </Typography>
                        ) : null}
                        <Grid container spacing={1.5}>
                            {expensesByApartment.map((e) => (
                                <Grid key={e.apartment} item xs={12} sm={6} md={4} lg={3}>
                                    <Paper elevation={0} sx={{ ...softCard, p: 1.5, borderRadius: 2, height: 72, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                                        <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.25, fontFamily: FONTS.subhead }}>{e.apartment}</Typography>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: FONTS.number }}>{fmtKES(e.totalMonth)}</Typography>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </>
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
                            <PropertyCard
                                p={p}
                                onOpen={handleOpenApartment}
                                onEdit={(apt) => { setSelectedApt(apt); setEditOpen(true); }}
                                onAddUnits={(apt) => { setSelectedApt(apt); setUnitsOpen(true); }}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Rental Units & Tenants */}
            <Paper ref={tableRef} elevation={0} sx={{ ...softCard }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff", fontFamily: FONTS.subhead }}>
                            Rental Units & Tenants
                        </Typography>
                        {filterAptId ? (
                            <Chip
                                label={`Filtered: ${apartments.find((a) => a.ApartmentID === filterAptId)?.ApartmentName || ""}`}
                                onDelete={clearFilter}
                                sx={{ bgcolor: "rgba(255,255,255,.08)", color: "#fff", border: "1px solid rgba(255,255,255,.18)" }}
                            />
                        ) : null}
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<FileDownloadOutlinedIcon />}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                color: "#fff",
                                borderColor: "rgba(255,255,255,0.35)",
                                "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" }
                            }}
                            onClick={() => setExportOpen(true)}
                        >
                            Export
                        </Button>
                    </Stack>
                </Stack>

                {selectedIds.length > 0 && (
                    <Paper
                        elevation={0}
                        sx={{
                            ...softCard,
                            p: 1.5,
                            mb: 1.5,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            background: "linear-gradient(#0e0a17,#0e0a17) padding-box, " + BRAND.gradient + " border-box",
                            border: "1px solid transparent"
                        }}
                    >
                        <Typography sx={{ fontFamily: FONTS.subhead, fontWeight: 700 }}>
                            {selectedIds.length} selected
                        </Typography>
                        <TextField
                            select size="small" label="Set Status" value={bulkStatusId}
                            onChange={(e) => setBulkStatusId(e.target.value)}
                            InputLabelProps={{ shrink: true }} sx={{ ...fieldNeumorphSx, minWidth: 220 }}
                        >
                            {statusList.map((s) => <MenuItem key={s.StatusID} value={s.StatusID}>{s.StatusName}</MenuItem>)}
                        </TextField>
                        <Button
                            size="small"
                            variant="contained"
                            onClick={requestBulkApply}
                            sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}
                        >
                            Apply to Selected
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<SendOutlinedIcon />}
                            onClick={() => setBulkSmsConfirm(true)}
                            sx={{
                                textTransform: "none",
                                borderColor: "rgba(255,255,255,0.35)",
                                color: "#fff",
                                "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" }
                            }}
                        >
                            SMS arrears to selected
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button size="small" onClick={() => setSelectedIds([])} sx={{ textTransform: "none", color: "#fff" }}>
                            Clear
                        </Button>
                    </Paper>
                )}

                {delta && (delta.added || delta.updated || delta.removed) ? (
                    <Typography variant="caption" sx={{ mb: 1, opacity: 0.8, fontFamily: FONTS.subhead }}>
                        {delta.added ? `+${delta.added} new ` : ""}{delta.updated ? `• ${delta.updated} updated ` : ""}{delta.removed ? `• ${delta.removed} removed` : ""}
                    </Typography>
                ) : null}

                {isRefreshing ? (
                    <LinearProgress
                        sx={{
                            mb: 1,
                            height: 3,
                            borderRadius: 1,
                            bgcolor: "rgba(255,255,255,0.06)",
                            "& .MuiLinearProgress-bar": { transition: "transform 200ms linear" }
                        }}
                    />
                ) : null}

                <Table size="small" sx={{ "& th, & td": { borderColor: "rgba(255,255,255,0.08)", color: "#fff", fontFamily: FONTS.subhead } }}>
                    <TableHead>
                        <TableRow>
                            <TableCell padding="checkbox">
                                <Checkbox
                                    indeterminate={selectedIds.length > 0 && !allSelected}
                                    checked={allSelected}
                                    onChange={toggleSelectAll}
                                    sx={{ color: "#fff" }}
                                />
                            </TableCell>
                            <TableCell>Property</TableCell>
                            <TableCell>Rental Unit</TableCell>
                            <TableCell>Tenant</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Move In</TableCell>
                            <TableCell align="right">Arrears</TableCell>
                            <TableCell align="center">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unitsLoading ? (
                            <TableRow><TableCell colSpan={8}><LinearProgress /></TableCell></TableRow>
                        ) : units.length === 0 ? (
                            <TableRow><TableCell colSpan={8} sx={{ opacity: 0.8 }}>No units to display.</TableCell></TableRow>
                        ) : (
                            units.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((u) => {
                                const rowId = `${u.ApartmentID}-${u.UnitID}`;
                                const isFlash = flashIds.has(rowId);
                                const isChecked = selectedIds.includes(u.UnitID);
                                const hasTenant = !!u.TenantName && !!u.TenantID;
                                const isVacant = (u.StatusName || "").toLowerCase() === "vacant";
                                return (
                                    <TableRow key={rowId} sx={{ backgroundColor: isFlash ? "rgba(255, 255, 0, 0.08)" : "transparent", transition: "background-color 600ms ease" }}>
                                        <TableCell padding="checkbox">
                                            <Checkbox checked={isChecked} onChange={() => toggleSelect(u.UnitID)} sx={{ color: "#fff" }} />
                                        </TableCell>
                                        <TableCell>{u.ApartmentName}</TableCell>
                                        <TableCell>{u.Label}</TableCell>
                                        <TableCell>{u.TenantName || "—"}</TableCell>
                                        <TableCell>{statusChip(u.StatusName)}</TableCell>
                                        <TableCell>{u.MoveIn ? dayjs(u.MoveIn).format("YYYY-MM-DD") : "—"}</TableCell>
                                        <TableCell align="right">{fmtKES(u.Arrears || 0)}</TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit Unit">
                                                <IconButton onClick={() => openEditUnit(u)} size="small" sx={{ color: "#fff" }}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {isVacant && (
                                                <Tooltip title="Assign Tenant">
                                                    <IconButton onClick={() => openAssignTenant(u)} size="small" sx={{ color: "#6EE7B7" }}>
                                                        <PeopleIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            {hasTenant && (
                                                <Tooltip title="Schedule Vacate Notice">
                                                    <span>
                                                        <IconButton onClick={() => openVacate(u)} size="small" sx={{ color: "#FDE68A", ml: 0.5 }}>
                                                            <EventBusyIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}
                                            {u.Arrears > 0 && !!u.TenantPhone && (
                                                <Tooltip title="SMS arrears reminder">
                                                    <span>
                                                        <IconButton onClick={() => openArrearsSms(u)} size="small" sx={{ color: "#A7F3D0", ml: 0.5 }}>
                                                            <SmsOutlinedIcon fontSize="small" />
                                                        </IconButton>
                                                    </span>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={units.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                />
            </Paper>

            {/* Dialogs */}
            <AddApartmentDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={handleAddCreated} api={api} />
            <EditApartmentDialog open={editOpen} onClose={() => setEditOpen(false)} apartment={selectedApt} api={api} onUpdated={handleUpdatedApartment} />
            <AddUnitsDialog open={unitsOpen} onClose={() => setUnitsOpen(false)} apartment={selectedApt} api={api} onDone={handleUnitsDone} />
            <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} rows={units} defaultCols={exportColumns} onExported={() => setSnackbar({ open: true, message: "CSV exported.", severity: "success" })} monthKey={monthKey} />

            {/* Unit actions */}
            <EditUnitDialog open={editUnitOpen} onClose={() => setEditUnitOpen(false)} unit={editUnit} api={api} categories={categoryList} statuses={statusList} onUpdated={onUnitUpdated} />
            <AssignTenantDialog open={assignOpen} onClose={() => setAssignOpen(false)} unit={assignUnit} api={api} onAssigned={onTenantAssigned} />
            <VacateNoticeDialog open={vacateOpen} onClose={() => setVacateOpen(false)} unit={vacateUnit} api={api} tenantId={vacateTenantId} onCreated={(res, err) => {
                if (err) setSnackbar({ open: true, message: err, severity: "error" });
                else setSnackbar({ open: true, message: res?.message || "Vacate notice created (reminder scheduled).", severity: "success" });
                if (filterAptId) loadUnits(filterAptId); else loadUnits(null);
            }} />

            {/* Bulk status confirm */}
            <ConfirmDialog
                open={bulkConfirmOpen}
                onCancel={() => setBulkConfirmOpen(false)}
                onConfirm={handleBulkApply}
                title="Apply status to selected units?"
                content={`This will set ${statusList.find(s => s.StatusID === Number(bulkStatusId))?.StatusName || "the chosen status"} for ${selectedIds.length} unit(s).`}
                confirmText="Apply"
            />
            {/* SMS one-off confirm */}
            <ConfirmDialog
                open={smsConfirmState.open}
                onCancel={() => setSmsConfirmState({ open: false, unit: null, body: "" })}
                onConfirm={sendOneSms}
                loading={smsSending}
                title="Send SMS to tenant?"
                content={
                    smsConfirmState.unit
                        ? `To: ${smsConfirmState.unit.TenantName} — ${toE164(smsConfirmState.unit.TenantPhone)} • "${smsConfirmState.body}"`
                        : ""
                }
                confirmText="Send SMS"
            />
            {/* Bulk SMS confirm */}
            <ConfirmDialog
                open={bulkSmsConfirm}
                onCancel={() => setBulkSmsConfirm(false)}
                onConfirm={sendBulkArrearsSms}
                title="Send SMS to selected tenants?"
                content={`We'll text an arrears reminder to tenants with a phone & unpaid balance in the ${selectedIds.length} selected unit(s).`}
                confirmText="Send"
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity || "info"} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
