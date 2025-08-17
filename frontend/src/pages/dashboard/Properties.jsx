// src/pages/Properties.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box, Paper, Typography, Grid, Chip, Button, IconButton, Tooltip,
    Snackbar, Alert, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, LinearProgress, MenuItem, Checkbox, FormGroup, FormControlLabel
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

import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import dayjs from "dayjs";

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

// ---- Shared TextField styling ----
const fieldNeumorphSx = {
    "& .MuiInputLabel-root": {
        color: "rgba(255,255,255,0.92)",
        fontFamily: FONTS.subhead,
        whiteSpace: "nowrap",
        overflow: "visible",
        textOverflow: "clip",
        maxWidth: "none",
    },
    "& .MuiInputLabel-root.MuiInputLabel-shrink": {
        maxWidth: "none",
    },

    "& .MuiInputBase-input": {
        color: "#fff",
        fontFamily: FONTS.subhead
    },
    "& .MuiInputBase-input::placeholder": {
        color: "rgba(255,255,255,0.7)",
        opacity: 1
    },
    "& .MuiOutlinedInput-root": {
        background: "rgba(255,255,255,0.03)",
        borderRadius: 2,
        boxShadow:
            "inset 6px 6px 12px rgba(0,0,0,.45), inset -6px -6px 12px rgba(255,255,255,.03)",
    },
    "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.22)"
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(255,255,255,0.45)"
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: BRAND.start
    }
};

/* -------------------------- Centered Confirm Dialog -------------------------- */
function ConfirmDialog({
    open,
    title,
    content,
    onCancel,
    onConfirm,
    confirmText = "Confirm",
    loading = false,
}) {
    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onCancel}
            fullWidth
            maxWidth="sm"
            sx={{
                "& .MuiDialog-container": {
                    alignItems: "center",
                    justifyContent: "center",
                },
                "& .MuiDialog-paper": {
                    borderRadius: 3,
                    width: { md: "min(680px, 96vw)" },
                },
            }}
            PaperProps={{ sx: { ...softCard, p: 0 } }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                {title}
            </DialogTitle>
            <DialogContent sx={{ pt: 0.5 }}>
                <Typography
                    variant="body2"
                    sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}
                >
                    {content}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onCancel} disabled={loading} sx={{ textTransform: "none" }}>
                    Cancel
                </Button>
                <Button
                    onClick={onConfirm}
                    disabled={loading}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                    }}
                >
                    {loading ? "Working…" : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ------------------------------ Add Apartment ------------------------------ */
function AddApartmentDialog({ open, onClose, onCreated, api }) {
    const [form, setForm] = React.useState({
        ApartmentName: "",
        Location: "",
        Description: "",
    });
    const [saving, setSaving] = React.useState(false);
    const [errors, setErrors] = React.useState({});
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    useEffect(() => {
        if (!open) setForm({ ApartmentName: "", Location: "", Description: "" });
    }, [open]);

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const validate = () => {
        const e = {};
        if (!form.ApartmentName.trim())
            e.ApartmentName = "Apartment name is required";
        if (!form.Location.trim()) e.Location = "Location is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const requestSave = () => {
        if (!validate()) return;
        setConfirmOpen(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await api.post("/apartments/create", form);
            onCreated?.(data);
            setForm({ ApartmentName: "", Location: "", Description: "" });
            onClose?.();
        } catch (err) {
            const msg =
                err?.response?.data?.message || "Failed to create apartment.";
            onCreated?.({ error: msg });
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={saving ? undefined : onClose}
                fullWidth
                maxWidth="md"
                sx={{
                    "& .MuiDialog-container": {
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        width: { md: "min(900px, 96vw)" },
                    },
                }}
                PaperProps={{ sx: { ...softCard, p: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                    Add Property
                </DialogTitle>
                <DialogContent sx={{ pt: 0.5, overflow: "visible" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Apartment Name"
                                name="ApartmentName"
                                placeholder="e.g., Blue House Apartment"
                                value={form.ApartmentName}
                                onChange={onChange}
                                error={!!errors.ApartmentName}
                                helperText={errors.ApartmentName}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="Location"
                                placeholder="e.g., Kileleshwa, Nairobi"
                                value={form.Location}
                                onChange={onChange}
                                error={!!errors.Location}
                                helperText={errors.Location}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Description (optional)"
                                name="Description"
                                placeholder="Short description of the property"
                                value={form.Description}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={requestSave}
                        disabled={saving}
                        variant="contained"
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: BRAND.gradient,
                            boxShadow: "none",
                        }}
                    >
                        {saving ? "Saving…" : "Create Apartment"}
                    </Button>
                </DialogActions>
            </Dialog>

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

/* ------------------------------ Edit Apartment ----------------------------- */
function EditApartmentDialog({ open, onClose, apartment, api, onUpdated }) {
    const [form, setForm] = React.useState({
        ApartmentName: "",
        Location: "",
        Description: "",
    });
    const [saving, setSaving] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    React.useEffect(() => {
        if (open && apartment) {
            setForm({
                ApartmentName: apartment.ApartmentName || "",
                Location: apartment.Location || "",
                Description: apartment.Description || "",
            });
        }
        if (!open) {
            setForm({ ApartmentName: "", Location: "", Description: "" });
        }
    }, [open, apartment]);

    const onChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const requestSave = () => setConfirmOpen(true);

    const handleSave = async () => {
        try {
            setSaving(true);
            const { data } = await api.put(
                `/apartments/update/${apartment.ApartmentID}`,
                form
            );
            onUpdated?.(data?.Apartment, data?.message);
            onClose?.();
        } catch (err) {
            onUpdated?.(
                null,
                err?.response?.data?.message || "Failed to update apartment."
            );
        } finally {
            setSaving(false);
            setConfirmOpen(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={saving ? undefined : onClose}
                fullWidth
                maxWidth="md"
                sx={{
                    "& .MuiDialog-container": {
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        width: { md: "min(900px, 96vw)" },
                    },
                }}
                PaperProps={{ sx: { ...softCard, p: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                    Edit Apartment — {apartment?.ApartmentName}
                </DialogTitle>
                <DialogContent sx={{ pt: 0.5, overflow: "visible" }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Apartment Name"
                                name="ApartmentName"
                                placeholder="e.g., Blue House Apartment"
                                value={form.ApartmentName}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="Location"
                                placeholder="e.g., Kileleshwa, Nairobi"
                                value={form.Location}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Description (optional)"
                                name="Description"
                                placeholder="Short description"
                                value={form.Description}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={requestSave}
                        disabled={saving}
                        variant="contained"
                        startIcon={<EditIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: BRAND.gradient,
                            boxShadow: "none",
                        }}
                    >
                        {saving ? "Saving…" : "Save Changes"}
                    </Button>
                </DialogActions>
            </Dialog>

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

/* -------------------------------- Add Units -------------------------------- */
function AddUnitsDialog({ open, onClose, apartment, api, onDone }) {
    const defaults = {
        prefix: "",
        startAt: 1,
        count: 1,
        pad: 0,
        MonthlyRent: "",
        CategoryID: "",
        StatusID: "",
        Description: "",
    };
    const [form, setForm] = React.useState(defaults);

    const [cats, setCats] = React.useState([]);
    const [statuses, setStatuses] = React.useState([]);
    const [saving, setSaving] = React.useState(false);
    const [confirmOpen, setConfirmOpen] = React.useState(false);

    useEffect(() => {
        if (!open) setForm(defaults);
    }, [open]); // clear on close

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    useEffect(() => {
        if (!open) return;
        (async () => {
            try {
                const [cRes, sRes] = await Promise.all([
                    api.get("/unit-categories"),
                    api.get("/rental-unit-statuses"),
                ]);
                setCats(cRes.data?.UnitCategories || []);
                const sts = sRes.data?.RentalUnitStatuses || [];
                setStatuses(sts);
                const vacant = sts.find(
                    (x) => x.StatusName?.toLowerCase() === "vacant"
                );
                setForm((f) => ({
                    ...f,
                    StatusID: f.StatusID || vacant?.StatusID || "",
                }));
            } catch {
                /* ignore */
            }
        })();
    }, [open]); // eslint-disable-line

    const labelsPreview = useMemo(() => {
        const start = Number(form.startAt) || 1;
        const count = Math.max(1, Number(form.count) || 1);
        const pad = Math.max(0, Number(form.pad) || 0);
        const first = `${form.prefix || ""}${String(start).padStart(pad, "0")}`;
        const last = `${form.prefix || ""}${String(start + count - 1).padStart(
            pad,
            "0"
        )}`;
        return { first, last, count };
    }, [form.prefix, form.startAt, form.count, form.pad]);

    const requestCreate = () => {
        if (!form.MonthlyRent || !form.CategoryID || !form.StatusID) return;
        setConfirmOpen(true);
    };

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
            const results = await Promise.allSettled(
                payloads.map((p) => api.post("/rental-units/create", p))
            );
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
            <Dialog
                open={open}
                onClose={saving ? undefined : onClose}
                fullWidth
                maxWidth="md"
                sx={{
                    "& .MuiDialog-container": {
                        alignItems: "center",
                        justifyContent: "center",
                    },
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        width: { md: "min(920px, 96vw)" },
                    },
                }}
                PaperProps={{ sx: { ...softCard, p: 0 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                    Add Units — {apartment?.ApartmentName}
                </DialogTitle>

                <DialogContent sx={{ pt: 0.5, overflow: "visible" }}>
                    {/* Row 1 */}
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                fullWidth
                                label="Prefix"
                                name="prefix"
                                placeholder="e.g., A- or BlkB-"
                                value={form.prefix}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                label="Start at"
                                name="startAt"
                                type="number"
                                placeholder="e.g., 1"
                                value={form.startAt}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                label="Count"
                                name="count"
                                type="number"
                                placeholder="How many?"
                                value={form.count}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <TextField
                                fullWidth
                                label="Pad"
                                name="pad"
                                type="number"
                                placeholder="Digits (0 for none)"
                                value={form.pad}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                select
                                fullWidth
                                label="Category"
                                name="CategoryID"
                                placeholder="Select category"
                                value={form.CategoryID}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            >
                                {cats.map((c) => (
                                    <MenuItem key={c.CategoryID} value={c.CategoryID}>
                                        {c.CategoryName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Typography
                        variant="caption"
                        sx={{
                            display: "block",
                            mt: 1,
                            opacity: 0.9,
                            fontFamily: FONTS.subhead,
                        }}
                    >
                        Example: {labelsPreview.first} … {labelsPreview.last} ({labelsPreview.count} unit{labelsPreview.count > 1 ? "s" : ""})
                    </Typography>

                    {/* Row 2 */}
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Monthly Rent"
                                name="MonthlyRent"
                                type="number"
                                placeholder="e.g., 25000"
                                value={form.MonthlyRent}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label="Status"
                                name="StatusID"
                                placeholder="Select status"
                                value={form.StatusID}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            >
                                {statuses.map((s) => (
                                    <MenuItem key={s.StatusID} value={s.StatusID}>
                                        {s.StatusName}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Row 3 */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Description (optional)"
                                name="Description"
                                placeholder="Any notes that apply to all generated units"
                                value={form.Description}
                                onChange={onChange}
                                InputLabelProps={{ shrink: true }}
                                sx={fieldNeumorphSx}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={requestCreate}
                        disabled={saving}
                        variant="contained"
                        startIcon={<AddHomeWorkIcon />}
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            background: BRAND.gradient,
                            boxShadow: "none",
                        }}
                    >
                        {saving ? "Creating…" : "Create Units"}
                    </Button>
                </DialogActions>
            </Dialog>

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

/* -------------------------- KPI & Donut Components -------------------------- */
function KpiCard({ icon, label, value, sublabel }) {
    return (
        <Paper elevation={0} sx={{ ...softCard, height: 120 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                {icon}
                <Typography
                    variant="body2"
                    sx={{
                        opacity: 0.88,
                        fontFamily: FONTS.subhead,
                        letterSpacing: 0.2,
                    }}
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
                gap: 0.25,
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
                    <Pie data={data} dataKey="value" innerRadius={size / 2 - 12} outerRadius={size / 2} paddingAngle={1} stroke="none">
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
                    fontFamily: FONTS.number,
                }}
            >
                {occRate}%
            </Box>
        </Box>
    );
}

/* ------------------------------ Property Card ------------------------------ */
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
                "&:hover .donut": { transform: "scale(1.06)" },
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
                        fontFamily: FONTS.subhead,
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
                                fontFamily: FONTS.subhead,
                            }}
                        />
                        <Chip
                            size="small"
                            label={`Occupied: ${fmtNum(s.OccupiedUnits)}`}
                            icon={<CheckCircleOutlineIcon sx={{ color: OCCUPIED_COLOR }} />}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.14)",
                                fontFamily: FONTS.subhead,
                            }}
                        />
                        <Chip
                            size="small"
                            label={`Vacant: ${fmtNum(s.VacantUnits)}`}
                            icon={<CancelOutlinedIcon sx={{ color: VACANT_COLOR }} />}
                            sx={{
                                color: "#fff",
                                border: "1px solid rgba(255,255,255,0.14)",
                                fontFamily: FONTS.subhead,
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
                    onClick={(e) => {
                        e.stopPropagation();
                        onOpen?.(p);
                    }}
                    size="small"
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        borderRadius: 2,
                        background: BRAND.gradient,
                        boxShadow: "none",
                    }}
                    startIcon={<OpenInNewIcon />}
                >
                    View
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(p);
                    }}
                    startIcon={<EditIcon />}
                    sx={{
                        textTransform: "none",
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": {
                            borderColor: BRAND.start,
                            background: "rgba(255,0,128,.08)",
                        },
                    }}
                >
                    Edit
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    onClick={(e) => {
                        e.stopPropagation();
                        onAddUnits?.(p);
                    }}
                    startIcon={<AddHomeWorkIcon />}
                    sx={{
                        textTransform: "none",
                        borderColor: "rgba(255,255,255,0.35)",
                        color: "#fff",
                        "&:hover": { borderColor: BRAND.end, background: "rgba(126,0,166,.08)" },
                    }}
                >
                    Add Units
                </Button>
            </Stack>
        </Paper>
    );
}

/* ------------------------------ Export Dialog ------------------------------ */
function ExportDialog({ open, onClose, rows, defaultCols, onExported, monthKey }) {
    const STORAGE_KEY = "prop_export_cols_v1";
    const [cols, setCols] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try { return JSON.parse(saved); } catch { /* ignore */ }
        }
        return defaultCols.reduce((acc, c) => ({ ...acc, [c.key]: c.default }), {});
    });
    const [downloadUrl, setDownloadUrl] = useState(null);

    useEffect(() => {
        // keep in sync if defaults change
        if (!open) return;
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            const init = defaultCols.reduce((acc, c) => ({ ...acc, [c.key]: c.default }), {});
            setCols(init);
        }
        // cleanup blob url when closing
        return () => {
            if (downloadUrl) URL.revokeObjectURL(downloadUrl);
        };
        // eslint-disable-next-line
    }, [open]);

    const toggle = (key) => setCols((c) => ({ ...c, [key]: !c[key] }));

    const handleExport = () => {
        const selected = defaultCols.filter((c) => cols[c.key]);
        if (selected.length === 0) return;

        // Build CSV from provided rows (already the "current view")
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

        const blob = new Blob([head + "\n" + body], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        setDownloadUrl(url);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cols));

        // Auto-trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = `export_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        a.click();

        onExported?.();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            PaperProps={{ sx: { ...softCard, p: 0 } }}
        >
            <DialogTitle sx={{ fontWeight: 800, fontFamily: FONTS.subhead }}>
                Export — {monthKey}
            </DialogTitle>
            <DialogContent sx={{ pt: 0.5 }}>
                <Typography variant="body2" sx={{ mb: 1, opacity: 0.8, fontFamily: FONTS.subhead }}>
                    Choose which columns to include in your download. The export respects the current view and filters.
                </Typography>
                <FormGroup>
                    {defaultCols.map((c) => (
                        <FormControlLabel
                            key={c.key}
                            control={
                                <Checkbox
                                    checked={!!cols[c.key]}
                                    onChange={() => toggle(c.key)}
                                    sx={{ color: "#fff" }}
                                />
                            }
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
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} sx={{ textTransform: "none" }}>Close</Button>
                <Button
                    onClick={handleExport}
                    variant="contained"
                    startIcon={<FileDownloadOutlinedIcon />}
                    sx={{ textTransform: "none", borderRadius: 2, background: BRAND.gradient, boxShadow: "none" }}
                >
                    Export CSV
                </Button>
            </DialogActions>
        </Dialog>
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
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [unitsOpen, setUnitsOpen] = useState(false);
    const [selectedApt, setSelectedApt] = useState(null);

    // for table filtering/units loading
    const [statusList, setStatusList] = useState([]); // for status names in table
    const [units, setUnits] = useState([]);
    const [unitsLoading, setUnitsLoading] = useState(false);
    const [filterAptId, setFilterAptId] = useState(null);
    const tableRef = useRef(null);

    // 🔄 Refresh UX state/refs
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [delta, setDelta] = useState(null);          // {added, updated, removed}
    const [flashIds, setFlashIds] = useState(new Set());
    const hasLoadedRef = useRef(false);
    const refreshingRef = useRef(false);
    const prevMapRef = useRef(new Map());
    const lastClickRef = useRef(0);

    // Export dialog
    const [exportOpen, setExportOpen] = useState(false);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = axios.create({
        baseURL: API,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    // Diff helpers
    const snapshotRow = (r) => ({
        id: `${r.ApartmentID}-${r.UnitID}`,
        tenant: r.TenantName || "",
        status: r.StatusID || r.StatusName || "",
        arrears: Number(r.Arrears || 0),
        moveIn: r.MoveIn || "",
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
            else if (
                old.tenant !== snap.tenant ||
                old.status !== snap.status ||
                old.arrears !== snap.arrears ||
                old.moveIn !== snap.moveIn
            ) { updated++; flashes.add(snap.id); }
        }
        for (const id of prev.keys()) {
            if (!next.has(id)) removed++;
        }
        return { added, updated, removed, flashes, next };
    };

    const fetchAll = async () => {
        try {
            setLoading(true);
            const [
                aptsRes,
                tenantsRes,
                billsMonthRes,
                unpaidRes,
                partialRes,
                expByAptRes,
                expByMonthRes,
                statusesRes,
            ] = await Promise.all([
                api.get("/myapartments"),
                api.get("/tenants"),
                api
                    .get(`/bills/month/${encodeURIComponent(monthKey)}`)
                    .catch(() => ({ data: { bills: [] } })),
                api.get("/bills/status/Unpaid").catch(() => ({ data: { bills: [] } })),
                api
                    .get("/bills/status/Partially%20Paid")
                    .catch(() => ({ data: { bills: [] } })),
                api
                    .get("/landlord-expenses/by-apartment")
                    .catch(() => ({ data: { expenses: {} } })),
                api
                    .get("/landlord-expenses/by-month")
                    .catch(() => ({ data: { expenses: {} } })),
                api.get("/rental-unit-statuses").catch(() => ({
                    data: { RentalUnitStatuses: [] },
                })),
            ]);

            const apts = (aptsRes.data?.Apartments || []).map((a) => ({
                ...a,
                Stats:
                    a.Stats || {
                        TotalUnits: 0,
                        OccupiedUnits: 0,
                        VacantUnits: 0,
                        ReservedUnits: 0,
                        VacancyRate: 0,
                    },
            }));
            setApartments(apts);
            setTenants(tenantsRes.data?.tenants || []);
            setStatusList(statusesRes.data?.RentalUnitStatuses || []);

            const monthBills = billsMonthRes.data?.bills || [];
            const collected = monthBills
                .filter((b) => b.BillStatus === "Paid")
                .reduce((acc, b) => acc + Number(b.TotalAmountDue || 0), 0);
            setCollectedThisMonth(collected);

            const overdue =
                (unpaidRes.data?.bills || []).reduce(
                    (a, b) => a + Number(b.TotalAmountDue || 0),
                    0
                ) +
                (partialRes.data?.bills || []).reduce(
                    (a, b) => a + Number(b.TotalAmountDue || 0),
                    0
                );
            setOverdueThisMonth(overdue);

            const byApt = expByAptRes.data?.expenses || {};
            const byMonth = expByMonthRes.data?.expenses || {};
            const monthList = byMonth[monthKey] || [];
            setExpensesMonthTotal(
                monthList.reduce((sum, r) => sum + Number(r.Amount || 0), 0)
            );

            const byApartmentMonth = Object.entries(byApt)
                .map(([aptName, arr]) => {
                    const totalMonth = arr
                        .filter(
                            (e) =>
                                dayjs(e.ExpenseDate, "YYYY-MM-DD").format("MMMM YYYY") ===
                                monthKey
                        )
                        .reduce((sum, e) => sum + Number(e.Amount || 0), 0);
                    return { apartment: aptName, totalMonth };
                })
                .sort((a, b) => b.totalMonth - a.totalMonth);
            setExpensesByApartment(byApartmentMonth);

            // Always populate units table after fetching everything
            await loadUnits(filterAptId || null, {
                apartments: apts,
                tenants: tenantsRes.data?.tenants || [],
                statusList: statusesRes.data?.RentalUnitStatuses || [],
            });

            if (!hasLoadedRef.current) {
                hasLoadedRef.current = true;
                setLastSync(new Date());
            }
        } catch (e) {
            console.error(e);
            setSnackbar({
                open: true,
                message: "Failed to load data. Check API/token.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
        // eslint-disable-next-line
    }, []);

    // Load units for table (supports fresh datasets passed in)
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
                rows = (data || []).map((u) => ({
                    ...u,
                    ApartmentID: apartmentId,
                    ApartmentName: apt.ApartmentName,
                }));
            } else {
                const results = await Promise.allSettled(
                    apartmentsSrc.map(async (apt) => {
                        const { data } = await api.get(
                            `/apartments/${apt.ApartmentID}/units`
                        );
                        return (data || []).map((u) => ({
                            ...u,
                            ApartmentID: apt.ApartmentID,
                            ApartmentName: apt.ApartmentName,
                        }));
                    })
                );
                rows = results
                    .filter((r) => r.status === "fulfilled")
                    .flatMap((r) => r.value);
            }

            // join with tenants (best-effort by Apartment + Unit label)
            const tIndex = new Map(
                (tenantsSrc || []).map((t) => [
                    `${t.Apartment || ""}||${t.RentalUnit || ""}`.toLowerCase(),
                    t,
                ])
            );

            const statusMap = Object.fromEntries(
                (statusListSrc || []).map((s) => [s.StatusID, s.StatusName])
            );

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
                };
            });

            setUnits(joined);

            // Delta + highlights only during manual refresh (not first mount)
            if (refreshingRef.current && hasLoadedRef.current) {
                const { added, updated, removed, flashes, next } = diffUnits(joined);
                setDelta({ added, updated, removed });
                setFlashIds(flashes);
                prevMapRef.current = next;
                setTimeout(() => setFlashIds(new Set()), 2500);
            } else {
                const baseline = new Map(joined.map(r => {
                    const s = snapshotRow(r);
                    return [s.id, s];
                }));
                prevMapRef.current = baseline;
            }

            if (tableRef.current) {
                tableRef.current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }
        } catch (e) {
            console.error(e);
            setSnackbar({
                open: true,
                message: "Failed to load units.",
                severity: "error",
            });
        } finally {
            setUnitsLoading(false);
        }
    };

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
        const occRate = totals.units
            ? Math.round((totals.occ / totals.units) * 100)
            : 0;
        return {
            totalApartments: apartments.length,
            totalUnits: totals.units,
            occupied: totals.occ,
            vacant: totals.vac,
            occupancyRate: occRate,
        };
    }, [apartments]);

    const handleOpenApartment = async (apt) => {
        setFilterAptId(apt.ApartmentID);
        await loadUnits(apt.ApartmentID);
    };

    const handleAddCreated = (res) => {
        if (res?.error) {
            setSnackbar({ open: true, message: res.error, severity: "error" });
            return;
        }
        const a = res?.Apartment;
        if (a) {
            setApartments((prev) => [
                {
                    ApartmentID: a.ApartmentID,
                    ApartmentName: a.ApartmentName,
                    Location: a.Location,
                    Description: a.Description,
                    CreatedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
                    Stats: {
                        TotalUnits: 0,
                        OccupiedUnits: 0,
                        VacantUnits: 0,
                        ReservedUnits: 0,
                        VacancyRate: 0,
                    },
                },
                ...prev,
            ]);
        }
        setSnackbar({
            open: true,
            message: res?.message || "Apartment created.",
            severity: "success",
        });
        fetchAll();
    };

    const handleUpdatedApartment = (updated, message) => {
        if (!updated) {
            setSnackbar({ open: true, message, severity: "error" });
            return;
        }
        setApartments((prev) =>
            prev.map((p) =>
                p.ApartmentID === updated.ApartmentID ? { ...p, ...updated } : p
            )
        );
        setSnackbar({
            open: true,
            message: message || "Apartment updated.",
            severity: "success",
        });
        fetchAll();
    };

    const handleUnitsDone = ({ ok, fail, total }) => {
        const msg =
            `Created ${ok}/${total} unit(s)` + (fail ? ` — ${fail} failed` : "");
        setSnackbar({
            open: true,
            message: msg,
            severity: fail ? "warning" : "success",
        });
        if (filterAptId) loadUnits(filterAptId);
        fetchAll();
    };

    // table helpers
    const statusChip = (name) => {
        const n = (name || "").toLowerCase();
        let bg = "rgba(255,255,255,.1)";
        if (n === "occupied") bg = "rgba(110,231,183,.2)";
        else if (n === "vacant") bg = "rgba(251,113,133,.2)";
        else if (n === "reserved") bg = "rgba(253,230,138,.2)";
        return (
            <Chip
                size="small"
                label={name || "—"}
                sx={{
                    bgcolor: bg,
                    color: "#fff",
                    border: "1px solid rgba(255,255,255,.18)",
                }}
            />
        );
    };

    const clearFilter = async () => {
        setFilterAptId(null);
        await loadUnits(null);
    };

    // Smart Refresh handler (rate-limited, spinner, last sync)
    const handleRefresh = async () => {
        const now = Date.now();
        if (now - lastClickRef.current < 1500) {
            setSnackbar({ open: true, message: "Please wait a moment…", severity: "info" });
            return;
        }
        lastClickRef.current = now;

        try {
            setIsRefreshing(true);
            refreshingRef.current = true;       // enable diff mode inside loadUnits
            await fetchAll();                    // respects current filterAptId
            setLastSync(new Date());
        } finally {
            refreshingRef.current = false;
            setIsRefreshing(false);
        }
    };

    // Focus-aware auto-refresh
    useEffect(() => {
        const onFocus = () => {
            if (hasLoadedRef.current) handleRefresh();
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Exportable columns definition (table & export share the same data source: units)
    const exportColumns = useMemo(() => ([
        { key: "ApartmentName", header: "Property", default: true },
        { key: "Label", header: "Rental Unit", default: true },
        { key: "TenantName", header: "Tenant", default: true },
        { key: "TenantPhone", header: "Tenant Phone", default: false },
        { key: "StatusName", header: "Status", default: true },
        { key: "MoveIn", header: "Move In", default: true, get: (r) => r.MoveIn ? dayjs(r.MoveIn).format("YYYY-MM-DD") : "" },
        { key: "Arrears", header: "Arrears", default: true, get: (r) => String(Number(r.Arrears || 0)) },
    ]), []);

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
                        letterSpacing: 0.5,
                    }}
                >
                    Properties
                </Typography>
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
                        "&:hover": { boxShadow: BRAND.glow },
                    }}
                    onClick={() => setAddOpen(true)}
                >
                    Add Property
                </Button>
            </Stack>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 1 }}>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard
                        icon={<ApartmentIcon fontSize="small" />}
                        label="Total Apartments"
                        value={fmtNum(kpi.totalApartments)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard
                        icon={<PeopleIcon fontSize="small" />}
                        label="Occupancy Rate"
                        value={`${kpi.occupancyRate}%`}
                        sublabel={`${fmtNum(kpi.occupied)} occupied`}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard
                        icon={<HomeWorkIcon fontSize="small" />}
                        label="Total Units"
                        value={fmtNum(kpi.totalUnits)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard
                        icon={<CheckCircleOutlineIcon fontSize="small" />}
                        label="Occupied"
                        value={fmtNum(kpi.occupied)}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3} lg={2.4}>
                    <KpiCard
                        icon={<CancelOutlinedIcon fontSize="small" />}
                        label="Vacant"
                        value={fmtNum(kpi.vacant)}
                    />
                </Grid>
            </Grid>

            {/* Money row */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <RectCard
                        icon={<LocalAtmOutlinedIcon sx={{ color: "#6EE7B7" }} />}
                        label={`Collected — ${monthKey}`}
                        value={fmtKES(collectedThisMonth)}
                        help="Sum of Paid bills"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <RectCard
                        icon={<WarningAmberOutlinedIcon sx={{ color: "#FB7185" }} />}
                        label="Overdue (unpaid & partial)"
                        value={fmtKES(overdueThisMonth)}
                        help="Outstanding before payments"
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <RectCard
                        icon={<ReceiptLongOutlinedIcon sx={{ color: "#A78BFA" }} />}
                        label={`Expenses — ${monthKey}`}
                        value={fmtKES(expensesMonthTotal)}
                        help="Across all apartments"
                    />
                </Grid>
            </Grid>

            {/* Expenses by Apartment */}
            <Paper elevation={0} sx={{ ...softCard, mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}
                >
                    Expenses by Apartment — {monthKey}
                </Typography>
                {expensesByApartment.length === 0 ? (
                    <Typography
                        variant="body2"
                        sx={{ opacity: 0.72, fontFamily: FONTS.subhead }}
                    >
                        No expenses recorded this month.
                    </Typography>
                ) : (
                    <Grid container spacing={1.5}>
                        {expensesByApartment.map((e) => (
                            <Grid key={e.apartment} item xs={12} sm={6} md={4} lg={3}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        ...softCard,
                                        p: 1.5,
                                        borderRadius: 2,
                                        height: 72,
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ opacity: 0.85, mb: 0.25, fontFamily: FONTS.subhead }}
                                    >
                                        {e.apartment}
                                    </Typography>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: 800, fontFamily: FONTS.number }}
                                    >
                                        {fmtKES(e.totalMonth)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Paper>

            {/* Properties grid */}
            <Typography
                variant="h6"
                sx={{ color: "#fff", mb: 1, fontWeight: 800, fontFamily: FONTS.subhead }}
            >
                Your Properties
            </Typography>
            {loading ? (
                <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : apartments.length === 0 ? (
                <Paper elevation={0} sx={{ ...softCard, textAlign: "center", mb: 3 }}>
                    <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 700, mb: 1, fontFamily: FONTS.subhead }}
                    >
                        No properties found
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ opacity: 0.8, fontFamily: FONTS.subhead }}
                    >
                        Try adding your first property.
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {apartments.map((p) => (
                        <Grid key={p.ApartmentID} item xs={12} sm={6} md={4} lg={3}>
                            <PropertyCard
                                p={p}
                                onOpen={handleOpenApartment}
                                onEdit={(apt) => {
                                    setSelectedApt(apt);
                                    setEditOpen(true);
                                }}
                                onAddUnits={(apt) => {
                                    setSelectedApt(apt);
                                    setUnitsOpen(true);
                                }}
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Rental Units & Tenants */}
            <Paper ref={tableRef} elevation={0} sx={{ ...softCard }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1 }}
                >
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, color: "#fff", fontFamily: FONTS.subhead }}
                        >
                            Rental Units & Tenants
                        </Typography>
                        {filterAptId ? (
                            <Chip
                                label={`Filtered: ${apartments.find((a) => a.ApartmentID === filterAptId)
                                    ?.ApartmentName || ""
                                    }`}
                                onDelete={clearFilter}
                                sx={{
                                    bgcolor: "rgba(255,255,255,.08)",
                                    color: "#fff",
                                    border: "1px solid rgba(255,255,255,.18)",
                                }}
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
                                "&:hover": {
                                    borderColor: BRAND.start,
                                    background: "rgba(255,0,128,.08)",
                                },
                            }}
                            onClick={() => setExportOpen(true)}
                        >
                            Export
                        </Button>
                        {/* Generate Bills removed as requested */}
                    </Stack>
                </Stack>

                {/* Delta summary banner */}
                {delta && (delta.added || delta.updated || delta.removed) ? (
                    <Typography variant="caption" sx={{ mb: 1, opacity: 0.8, fontFamily: FONTS.subhead }}>
                        {delta.added ? `+${delta.added} new ` : ""}
                        {delta.updated ? `• ${delta.updated} updated ` : ""}
                        {delta.removed ? `• ${delta.removed} removed` : ""}
                    </Typography>
                ) : null}

                {/* Slim refresh bar (shows only during manual refresh) */}
                {isRefreshing ? (
                    <LinearProgress
                        sx={{
                            mb: 1,
                            height: 3,
                            borderRadius: 1,
                            bgcolor: "rgba(255,255,255,0.06)",
                            "& .MuiLinearProgress-bar": { transition: "transform 200ms linear" },
                        }}
                    />
                ) : null}

                <Table
                    size="small"
                    sx={{
                        "& th, & td": {
                            borderColor: "rgba(255,255,255,0.08)",
                            color: "#fff",
                            fontFamily: FONTS.subhead,
                        },
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell>Property</TableCell>
                            <TableCell>Rental Unit</TableCell>
                            <TableCell>Tenant</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Move In</TableCell>
                            <TableCell align="right">Arrears</TableCell>
                            {/* Actions column removed */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {unitsLoading ? (
                            <TableRow>
                                <TableCell colSpan={6}>
                                    <LinearProgress />
                                </TableCell>
                            </TableRow>
                        ) : units.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} sx={{ opacity: 0.8 }}>
                                    No units to display.
                                </TableCell>
                            </TableRow>
                        ) : (
                            units.map((u) => {
                                const rowId = `${u.ApartmentID}-${u.UnitID}`;
                                const isFlash = flashIds.has(rowId);
                                return (
                                    <TableRow
                                        key={rowId}
                                        sx={{
                                            backgroundColor: isFlash ? "rgba(255, 255, 0, 0.08)" : "transparent",
                                            transition: "background-color 600ms ease",
                                        }}
                                    >
                                        <TableCell>{u.ApartmentName}</TableCell>
                                        <TableCell>{u.Label}</TableCell>
                                        <TableCell>{u.TenantName || "—"}</TableCell>
                                        <TableCell>{statusChip(u.StatusName)}</TableCell>
                                        <TableCell>
                                            {u.MoveIn ? dayjs(u.MoveIn).format("YYYY-MM-DD") : "—"}
                                        </TableCell>
                                        <TableCell align="right">{fmtKES(u.Arrears || 0)}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialogs */}
            <AddApartmentDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                onCreated={handleAddCreated}
                api={api}
            />
            <EditApartmentDialog
                open={editOpen}
                onClose={() => setEditOpen(false)}
                apartment={selectedApt}
                api={api}
                onUpdated={handleUpdatedApartment}
            />
            <AddUnitsDialog
                open={unitsOpen}
                onClose={() => setUnitsOpen(false)}
                apartment={selectedApt}
                api={api}
                onDone={handleUnitsDone}
            />

            {/* Export dialog */}
            <ExportDialog
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                rows={units}
                defaultCols={exportColumns}
                onExported={() => setSnackbar({ open: true, message: "CSV exported.", severity: "success" })}
                monthKey={monthKey}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity || "info"}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
