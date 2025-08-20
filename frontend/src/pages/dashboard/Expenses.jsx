// src/pages/dashboard/Expenses.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    Stack,
    Button,
    IconButton,
    Tooltip,
    Chip,
    Divider,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TextField,
    MenuItem,
    CircularProgress,
    InputAdornment,
    Link,
    TablePagination,
    Snackbar,
    Alert,
    Switch,
    FormControlLabel,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import AddIcon from "@mui/icons-material/Add";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import SearchIcon from "@mui/icons-material/Search";
import {
    LineChart,
    Line,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip as RTooltip,
    Legend,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    CartesianGrid,
} from "recharts";
import axios from "axios";
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
const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

/* ---------- Utils ---------- */
const fmtKES = (n) =>
    `KES ${new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(
        Number(n || 0)
    )}`;
const monthLabel = (d) => dayjs(d).format("MMMM YYYY");
const monthKeyNow = monthLabel(new Date());

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
        boxShadow:
            "12px 12px 24px rgba(0,0,0,.6), -12px -12px 24px rgba(255,255,255,.035)",
        borderColor: "transparent",
        background:
            "linear-gradient(#0e0a17,#0e0a17) padding-box, " +
            BRAND.gradient +
            " border-box",
        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
    },
};

/* ---------- Colors by type ---------- */
const TYPE_COLORS = {
    Repairs: "#A78BFA",
    Water: "#7C3AED",
    Electricity: "#60A5FA",
    Garbage: "#F59E0B",
    Internet: "#22D3EE",
    Other: "#F472B6",
};

/* ---------------------- Add Expense Dialog (centered & lowered) ---------------------- */
function AddExpenseDialog({
    open,
    onClose,
    apartments,
    onSaved,
    api,
    recentTypes = [],
}) {
    const defaultForm = {
        ApartmentID: apartments[1]?.id || "",
        ExpenseType: "",
        Amount: "",
        Description: "",
        ExpenseDate: dayjs().format("YYYY-MM-DD"),
        isPaid: false,
        ExpensePaymentDate: "",
        Payee: "",
        PaymentMethod: "Cash",
        PaymentRef: "",
    };
    const [form, setForm] = useState(defaultForm);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!open) {
            setForm(defaultForm);
            setErrors({});
        } else {
            if (!form.ApartmentID) {
                const first = apartments.find((a) => a.id);
                if (first) setForm((f) => ({ ...f, ApartmentID: first.id }));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, apartments?.length]);

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    };

    const setType = (t) => setForm((f) => ({ ...f, ExpenseType: t }));

    const togglePaid = (e) => {
        const checked = !!e.target.checked;
        setForm((f) => ({
            ...f,
            isPaid: checked,
            ExpensePaymentDate: checked ? dayjs().format("YYYY-MM-DD") : "",
            PaymentMethod: checked ? f.PaymentMethod : "Cash",
            PaymentRef: checked ? f.PaymentRef : "",
        }));
    };

    const validate = () => {
        const e = {};
        if (!form.ApartmentID) e.ApartmentID = "Choose a property";
        if (!form.ExpenseType.trim()) e.ExpenseType = "Type is required";
        if (!form.Amount || Number(form.Amount) <= 0) e.Amount = "Amount must be > 0";
        if (!form.ExpenseDate) e.ExpenseDate = "Expense date is required";
        if (form.isPaid) {
            if (!form.ExpensePaymentDate) e.ExpensePaymentDate = "Payment date required";
            if (dayjs(form.ExpensePaymentDate).isAfter(dayjs(), "day"))
                e.ExpensePaymentDate = "Payment date cannot be in the future";
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async (addAnother = false) => {
        if (!validate()) return;
        try {
            setSaving(true);
            const payload = {
                ApartmentID: Number(form.ApartmentID),
                ExpenseType: form.ExpenseType.trim(),
                Amount: Number(form.Amount),
                Description: form.Description || "",
                Payee: form.Payee || "Unknown",
                PaymentMethod: form.isPaid ? form.PaymentMethod || "Cash" : "Cash",
                PaymentRef: form.isPaid ? form.PaymentRef || "" : "",
                ExpenseDate: form.ExpenseDate,
                ExpensePaymentDate: form.isPaid ? form.ExpensePaymentDate : null,
            };

            const { data } = await api.post("/landlord-expenses/add", payload);

            const created = data?.expense || {
                ...payload,
                ExpenseID: Date.now(),
                Apartment:
                    apartments.find((a) => a.id === Number(form.ApartmentID))?.name || "",
            };
            onSaved?.(created);

            if (addAnother) {
                setForm((f) => ({
                    ...defaultForm,
                    ApartmentID: f.ApartmentID,
                    ExpenseType: f.ExpenseType,
                    PaymentMethod: f.PaymentMethod,
                    isPaid: f.isPaid,
                    ExpensePaymentDate: f.isPaid ? dayjs().format("YYYY-MM-DD") : "",
                }));
                setErrors({});
            } else {
                onClose?.();
            }
        } catch (err) {
            setErrors((e) => ({
                ...e,
                submit: err?.response?.data?.message || "Failed to save expense",
            }));
        } finally {
            setSaving(false);
        }
    };

    const quickTypes = Array.from(
        new Set([
            "Repairs",
            "Water",
            "Electricity",
            "Garbage",
            "Internet",
            "Other",
            ...recentTypes,
        ])
    ).slice(0, 8);

    /* ====== CENTERED + LOWERED DIALOG ====== */
    return (
        <Box
            sx={{
                position: "fixed",
                inset: 0,
                zIndex: 1400,
                display: open ? "grid" : "none",
                placeItems: "center",
            }}
            role="dialog"
            aria-modal="true"
        >
            {/* Backdrop */}
            <Box
                onClick={onClose}
                sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "rgba(0,0,0,.55)",
                    backdropFilter: "blur(2px)",
                }}
            />

            {/* Dialog card */}
            <Paper
                elevation={0}
                sx={{
                    ...softCard,
                    position: "relative",
                    width: "min(700px, 90vw)", // narrowed
                    maxHeight: "90vh",
                    overflow: "auto",
                    p: 2.25,
                    borderRadius: 3,
                    m: 0,
                    transform: "translateY(6vh)", // lowered (shukishwa kidogo)
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: FONTS.subhead }}>
                        Add Expense
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <Button onClick={onClose} sx={{ color: "#fff", textTransform: "none" }}>
                        Close
                    </Button>
                </Stack>

                {/* ---- Form ---- */}
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <TextField
                            select
                            fullWidth
                            label="Property"
                            name="ApartmentID"
                            value={form.ApartmentID}
                            onChange={onChange}
                            error={!!errors.ApartmentID}
                            helperText={errors.ApartmentID}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        >
                            {apartments
                                .filter((a) => a.id)
                                .map((a) => (
                                    <MenuItem key={a.id} value={a.id}>
                                        {a.name}
                                    </MenuItem>
                                ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Type"
                            name="ExpenseType"
                            value={form.ExpenseType}
                            onChange={onChange}
                            error={!!errors.ExpenseType}
                            helperText={errors.ExpenseType}
                            placeholder="e.g. Repairs"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Amount"
                            name="Amount"
                            value={form.Amount}
                            onChange={onChange}
                            error={!!errors.Amount}
                            helperText={errors.Amount}
                            InputProps={{ inputProps: { min: 0, step: "any" } }}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Expense Date (for)"
                            name="ExpenseDate"
                            value={form.ExpenseDate}
                            onChange={onChange}
                            error={!!errors.ExpenseDate}
                            helperText={errors.ExpenseDate}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Description (optional)"
                            name="Description"
                            value={form.Description}
                            onChange={onChange}
                            placeholder="Short note or vendor invoice details"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Typography variant="caption" sx={{ opacity: 0.85, display: "block", mb: 0.5 }}>
                            Quick Types:
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            {quickTypes.map((t) => (
                                <Chip
                                    key={t}
                                    size="small"
                                    label={t}
                                    onClick={() => setType(t)}
                                    sx={{
                                        color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        bgcolor:
                                            form.ExpenseType === t ? "rgba(126,0,166,.26)" : "transparent",
                                    }}
                                />
                            ))}
                        </Stack>
                    </Grid>

                    <Grid item xs={12}>
                        <FormControlLabel
                            control={<Switch checked={form.isPaid} onChange={togglePaid} />}
                            label={<Typography sx={{ fontFamily: FONTS.subhead }}>Mark as Paid</Typography>}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Payment Date"
                            name="ExpensePaymentDate"
                            value={form.ExpensePaymentDate}
                            onChange={onChange}
                            disabled={!form.isPaid}
                            error={!!errors.ExpensePaymentDate}
                            helperText={errors.ExpensePaymentDate}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            select
                            fullWidth
                            label="Payment Method"
                            name="PaymentMethod"
                            value={form.PaymentMethod}
                            onChange={onChange}
                            disabled={!form.isPaid}
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        >
                            {["Cash", "Bank Transfer", "M-Pesa", "Cheque", "Other"].map((m) => (
                                <MenuItem key={m} value={m}>
                                    {m}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Payment Ref"
                            name="PaymentRef"
                            value={form.PaymentRef}
                            onChange={onChange}
                            disabled={!form.isPaid}
                            placeholder="e.g., M-Pesa/Bank ref"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Payee (optional)"
                            name="Payee"
                            value={form.Payee}
                            onChange={onChange}
                            placeholder="Vendor/recipient"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                                "& .MuiInputBase-root": { color: "#fff" },
                                "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                            }}
                        />
                    </Grid>

                    {errors.submit ? (
                        <Grid item xs={12}>
                            <Alert severity="error" sx={{ borderRadius: 2 }}>
                                {errors.submit}
                            </Alert>
                        </Grid>
                    ) : null}

                    <Grid item xs={12}>
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button onClick={onClose} disabled={saving} sx={{ textTransform: "none" }}>
                                Cancel
                            </Button>
                            <Button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                variant="outlined"
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
                            >
                                {saving ? "Saving…" : "Save & Add Another"}
                            </Button>
                            <Button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                variant="contained"
                                startIcon={<AddIcon />}
                                sx={{
                                    textTransform: "none",
                                    borderRadius: 2,
                                    background: BRAND.gradient,
                                    boxShadow: "none",
                                }}
                            >
                                {saving ? "Saving…" : "Save Expense"}
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}

/* -------------------------------- Page -------------------------------- */
export default function Expenses() {
    /* Filters + pagination */
    const months = useMemo(
        () =>
            Array.from({ length: 12 }, (_, i) =>
                dayjs().subtract(i, "month").format("MMMM YYYY")
            ),
        []
    );
    const [filter, setFilter] = useState({
        q: "",
        month: monthKeyNow,
        apartment: "All",
        type: "All",
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    useEffect(() => setPage(0), [filter]);

    /* Data/state */
    const [loading, setLoading] = useState(true);
    const [all, setAll] = useState([]);
    const [apartments, setApartments] = useState([{ name: "All" }]);
    const [kpi, setKpi] = useState({ monthTotal: 0, highest: 0, avgPercent: 0 });
    const [trend, setTrend] = useState([]);
    const [byType, setByType] = useState([]);
    const [byApt, setByApt] = useState([]);
    const [insights, setInsights] = useState([]);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });
    const [addOpen, setAddOpen] = useState(false);

    const token = useMemo(() => localStorage.getItem("token"), []);
    const api = useMemo(
        () =>
            axios.create({
                baseURL: API,
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            }),
        [token]
    );

    /* Fetch once */
    const fetchAll = async () => {
        setLoading(true);
        try {
            const [byAptRes, aptsRes] = await Promise.all([
                api.get("/landlord-expenses/by-apartment"),
                api.get("/myapartments").catch(() => ({ data: { Apartments: [] } })),
            ]);

            const map = byAptRes.data?.expenses || {};
            const flat = Object.entries(map).flatMap(([apt, arr]) =>
                (arr || []).map((e) => ({
                    ...e,
                    ApartmentName: apt,
                    ExpenseDate:
                        e.ExpenseDate || e.expenseDate || e.PaymentDate || e.payment_date,
                    ExpensePaymentDate: e.ExpensePaymentDate || e.paymentDate || null,
                    Amount: Number(e.Amount || 0),
                    ExpenseType: e.ExpenseType || "Other",
                    Description: e.Description || "",
                    Payee: e.Payee || "",
                    PaymentMethod: e.PaymentMethod || "",
                    PaymentRef: e.PaymentRef || "",
                    ExpenseID: e.ExpenseID,
                }))
            );

            setAll(flat);

            const aptOptions = (aptsRes.data?.Apartments || [])
                .map((a) => ({ id: a.ApartmentID, name: a.ApartmentName }))
                .filter((a) => a.id && a.name);
            const fromMap = Object.keys(map).map((name) => ({
                id: undefined,
                name,
            }));
            const uniqueByName = new Map();
            [...aptOptions, ...fromMap].forEach((a) => uniqueByName.set(a.name, a));
            const aptList = [{ name: "All" }, ...Array.from(uniqueByName.values())];
            setApartments(aptList);

            computeDerived(flat, filter.month);
        } catch (err) {
            console.error(err);
            setSnackbar({
                open: true,
                message: "Failed to load expenses.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll(); // eslint-disable-line
    }, []);

    useEffect(() => {
        if (all.length === 0) return;
        computeDerived(all, filter.month);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter.month, all]);

    const [search, setSearch] = useState(filter.q);
    useEffect(() => {
        const t = setTimeout(() => setSearch(filter.q), 250);
        return () => clearTimeout(t);
    }, [filter.q]);

    function computeDerived(data, mKey) {
        const monthRows = data.filter((r) => monthLabel(r.ExpenseDate) === mKey);
        const monthTotal = monthRows.reduce((a, r) => a + r.Amount, 0);
        const highest = monthRows.reduce((a, r) => Math.max(a, r.Amount), 0);

        const totalsByMonth = new Map();
        data.forEach((r) => {
            const k = monthLabel(r.ExpenseDate);
            totalsByMonth.set(k, (totalsByMonth.get(k) || 0) + r.Amount);
        });
        const last12 = months.slice().reverse();
        const avg = last12.length
            ? Math.round(
                last12.reduce((acc, k) => acc + (totalsByMonth.get(k) || 0), 0) /
                last12.length
            )
            : 0;

        setKpi({
            monthTotal,
            highest,
            avgPercent: avg ? Math.round((monthTotal / avg) * 100) : 0,
        });

        const last6 = months.slice(0, 6).reverse();
        setTrend(
            last6.map((k) => ({
                m: k.split(" ")[0],
                total: Math.round((totalsByMonth.get(k) || 0) / 1000),
            }))
        );

        const typeMap = new Map();
        monthRows.forEach((r) =>
            typeMap.set(r.ExpenseType, (typeMap.get(r.ExpenseType) || 0) + r.Amount)
        );
        const total = Array.from(typeMap.values()).reduce((a, v) => a + v, 0) || 1;
        setByType(
            Array.from(typeMap.entries())
                .map(([name, amt]) => ({ name, value: Math.round((amt / total) * 100) }))
                .sort((a, b) => b.value - a.value)
        );

        const aptMap = new Map();
        monthRows.forEach((r) =>
            aptMap.set(r.ApartmentName, (aptMap.get(r.ApartmentName) || 0) + r.Amount)
        );
        setByApt(
            Array.from(aptMap.entries())
                .map(([name, totalApt]) => ({ name, total: Math.round(totalApt / 1000) }))
                .sort((a, b) => b.total - a.total)
                .slice(0, 5)
        );

        const prevKey = monthLabel(dayjs(mKey, "MMMM YYYY").subtract(1, "month"));
        const thisT = totalsByMonth.get(mKey) || 0;
        const prevT = totalsByMonth.get(prevKey) || 0;
        const deltaPct = prevT ? Math.round(((thisT - prevT) / prevT) * 100) : null;
        const topType = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1])[0]
            ?.[0];
        const ins = [];
        if (deltaPct !== null)
            ins.push(
                `Expenses are ${deltaPct >= 0 ? "up" : "down"} ${Math.abs(
                    deltaPct
                )}% vs ${prevKey}.`
            );
        if (topType) ins.push(`Top cost driver this month is ${topType}.`);
        setInsights(ins);
    }

    const currentTypes = useMemo(() => {
        const set = new Set(
            all
                .filter((r) => monthLabel(r.ExpenseDate) === filter.month)
                .map((r) => r.ExpenseType)
        );
        return ["All", ...Array.from(set).sort()];
    }, [all, filter.month]);

    const filteredRows = useMemo(() => {
        const q = (search || "").toLowerCase();
        return all
            .filter((r) => monthLabel(r.ExpenseDate) === filter.month)
            .filter((r) => filter.apartment === "All" || r.ApartmentName === filter.apartment)
            .filter((r) => filter.type === "All" || r.ExpenseType === filter.type)
            .filter(
                (r) =>
                    !q ||
                    `${r.ApartmentName} ${r.ExpenseType} ${r.Description} ${r.Payee} ${r.PaymentRef}`
                        .toLowerCase()
                        .includes(q)
            )
            .sort((a, b) => new Date(b.ExpenseDate) - new Date(a.ExpenseDate));
    }, [all, filter, search]);

    const refresh = () => fetchAll();

    const doExport = () => {
        const cols = [
            "Date",
            "Apartment",
            "Type",
            "Description",
            "Amount",
            "Paid On",
            "Payee",
            "Method",
            "Ref",
        ];
        const body = filteredRows
            .map((r) => [
                dayjs(r.ExpenseDate).format("YYYY-MM-DD"),
                r.ApartmentName || "",
                r.ExpenseType || "",
                (r.Description || "").replace(/"/g, '""'),
                r.Amount ?? 0,
                r.ExpensePaymentDate ? dayjs(r.ExpensePaymentDate).format("YYYY-MM-DD") : "",
                r.Payee || "",
                r.PaymentMethod || "",
                r.PaymentRef || "",
            ])
            .map((arr) => arr.map((v) => `"${String(v)}"`).join(","))
            .join("\n");

        const blob = new Blob([cols.join(",") + "\n" + body], {
            type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `expenses_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setSnackbar({ open: true, message: "CSV exported.", severity: "success" });
    };

    const doImport = () =>
        document.getElementById("import-expenses-input")?.click();
    const onFilePicked = (e) => {
        e.target.value = "";
    };

    const handleSavedExpense = (created) => {
        const aptName =
            created.Apartment ||
            created.ApartmentName ||
            apartments.find((a) => a.id === created.ApartmentID)?.name ||
            "";
        const normalized = {
            ExpenseID: created.ExpenseID,
            ApartmentName: aptName,
            ExpenseDate:
                created.ExpenseDate || created.PaymentDate || created.ExpensePaymentDate,
            ExpensePaymentDate: created.ExpensePaymentDate || created.PaymentDate || null,
            ExpenseType: created.ExpenseType,
            Amount: Number(created.Amount || 0),
            Description: created.Description || "",
            Payee: created.Payee || "",
            PaymentMethod: created.PaymentMethod || "",
            PaymentRef: created.PaymentRef || "",
        };
        setAll((prev) => [normalized, ...prev]);
        setSnackbar({ open: true, message: "Expense recorded.", severity: "success" });
    };

    const recentTypes = useMemo(() => {
        const m = new Map();
        all.slice(0, 50).forEach((r) => m.set(r.ExpenseType, true));
        return Array.from(m.keys());
    }, [all]);

    return (
        <Box sx={{ p: 3, bgcolor: "#0b0714", minHeight: "100vh" }}>
            {/* Hidden file input for import */}
            <input
                id="import-expenses-input"
                type="file"
                accept=".csv"
                style={{ display: "none" }}
                onChange={onFilePicked}
            />

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
                        letterSpacing: 0.5,
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
                    onClick={() => setAddOpen(true)}
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

            {/* KPI row */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}>
                            Expenses ({filter.month})
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, fontFamily: FONTS.number }}>
                            {fmtKES(kpi.monthTotal)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}>
                            Highest Expense
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, fontFamily: FONTS.number }}>
                            {fmtKES(kpi.highest)}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}>
                            Vs 12-mo Avg
                        </Typography>
                        <Typography variant="h5" sx={{ mt: 0.5, fontWeight: 900, fontFamily: FONTS.number }}>
                            {`${kpi.avgPercent}%`}
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ ...softCard, height: 118 }}>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: FONTS.subhead }}>
                            By Apartment (Top 3)
                        </Typography>
                        <Box sx={{ height: 68 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byApt.slice(0, 3)}>
                                    <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
                                    <XAxis dataKey="name" stroke="#aaa" />
                                    <YAxis hide />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                                        {byApt.slice(0, 3).map((a, i) => (
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

            {/* Insights */}
            {insights.length > 0 && (
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {insights.map((t, i) => (
                        <Grid key={i} item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    ...softCard,
                                    borderRadius: 2,
                                    height: 74,
                                    display: "flex",
                                    alignItems: "center",
                                    px: 2.25,
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{ fontFamily: FONTS.subhead, opacity: 0.92 }}
                                >
                                    {t}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Charts */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                    <Paper elevation={0} sx={{ ...softCard, height: 280 }}>
                        <Typography
                            variant="body2"
                            sx={{ fontFamily: FONTS.subhead, opacity: 0.9, mb: 1 }}
                        >
                            Trend by Month (K)
                        </Typography>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={trend}>
                                <XAxis dataKey="m" stroke="#aaa" />
                                <YAxis stroke="#aaa" />
                                <RTooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#7E00A6"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper
                        elevation={0}
                        sx={{ ...softCard, height: 280, display: "flex", flexDirection: "column" }}
                    >
                        <Typography
                            variant="body2"
                            sx={{ fontFamily: FONTS.subhead, opacity: 0.9, mb: 1 }}
                        >
                            By Type
                        </Typography>
                        <Box sx={{ flex: 1 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byType}
                                        dataKey="value"
                                        nameKey="name"
                                        innerRadius={70}
                                        outerRadius={100}
                                        stroke="none"
                                    >
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
                                    sx={{
                                        color: "#fff",
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        fontFamily: FONTS.subhead,
                                    }}
                                />
                            ))}
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={1.25}
                    alignItems="center"
                >
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
                        sx={{
                            flex: 1,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        }}
                    />
                    <TextField
                        select
                        size="small"
                        label="Month"
                        value={filter.month}
                        onChange={(e) => setFilter({ ...filter, month: e.target.value })}
                        sx={{
                            minWidth: 160,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        {months.map((m) => (
                            <MenuItem key={m} value={m}>
                                {m}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Apartment"
                        value={filter.apartment}
                        onChange={(e) => setFilter({ ...filter, apartment: e.target.value })}
                        sx={{
                            minWidth: 180,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        {apartments.map((a) => (
                            <MenuItem key={a.name} value={a.name}>
                                {a.name}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        size="small"
                        label="Type"
                        value={filter.type}
                        onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                        sx={{
                            minWidth: 180,
                            "& .MuiInputBase-root": { color: "#fff" },
                            "& fieldset": { borderColor: "rgba(255,255,255,0.25)" },
                        }}
                    >
                        {(() => {
                            const set = new Set(currentTypes);
                            return Array.from(set).map((t) => (
                                <MenuItem key={t} value={t}>
                                    {t}
                                </MenuItem>
                            ));
                        })()}
                    </TextField>
                </Stack>
            </Paper>

            {/* Ledger Table */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}
                >
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
                                    <TableCell>Date (For)</TableCell>
                                    <TableCell>Apartment</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                    <TableCell>Paid On</TableCell>
                                    <TableCell>Payee</TableCell>
                                    <TableCell>Method</TableCell>
                                    <TableCell>Ref</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredRows
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((r, idx) => {
                                        const paid = !!r.ExpensePaymentDate;
                                        return (
                                            <TableRow key={`${r.ExpenseID || idx}-${r.ApartmentName}`} hover>
                                                <TableCell>
                                                    {dayjs(r.ExpenseDate).format("DD MMM YYYY")}
                                                </TableCell>
                                                <TableCell>{r.ApartmentName}</TableCell>
                                                <TableCell>{r.ExpenseType}</TableCell>
                                                <TableCell>{r.Description || "—"}</TableCell>
                                                <TableCell align="right">{fmtKES(r.Amount)}</TableCell>
                                                <TableCell>
                                                    {paid ? (
                                                        <Chip
                                                            size="small"
                                                            label={dayjs(r.ExpensePaymentDate).format("YYYY-MM-DD")}
                                                            sx={{
                                                                bgcolor: "rgba(110,231,183,.18)",
                                                                color: "#fff",
                                                                border: "1px solid rgba(255,255,255,.18)",
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            size="small"
                                                            label="Unpaid"
                                                            sx={{
                                                                bgcolor: "rgba(251,113,133,.18)",
                                                                color: "#fff",
                                                                border: "1px solid rgba(255,255,255,.18)",
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell>{r.Payee || "—"}</TableCell>
                                                <TableCell>{r.PaymentMethod || "—"}</TableCell>
                                                <TableCell>
                                                    {r.PaymentRef ? (
                                                        <Link
                                                            component="button"
                                                            sx={{ color: "#fff" }}
                                                            onClick={() => navigator.clipboard.writeText(r.PaymentRef)}
                                                        >
                                                            {r.PaymentRef}
                                                        </Link>
                                                    ) : (
                                                        "—"
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>

                        <TablePagination
                            component="div"
                            count={filteredRows.length}
                            page={page}
                            onPageChange={(_, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(e) => {
                                setRowsPerPage(parseInt(e.target.value, 10));
                                setPage(0);
                            }}
                            rowsPerPageOptions={[10, 25, 50, 100]}
                        />
                    </>
                )}
            </Paper>

            {/* Add dialog */}
            <AddExpenseDialog
                open={addOpen}
                onClose={() => setAddOpen(false)}
                apartments={apartments.filter((a) => a.id || a.name === "All")}
                api={api}
                recentTypes={recentTypes}
                onSaved={handleSavedExpense}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    severity={snackbar.severity || "success"}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
