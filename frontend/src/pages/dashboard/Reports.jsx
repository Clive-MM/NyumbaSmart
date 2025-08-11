// src/pages/Reports.jsx
import React, { useMemo, useState } from "react";
import {
    Box, Grid, Paper, Typography, Stack, Button, IconButton, Tooltip,
    Chip, Divider, Table, TableHead, TableRow, TableCell, TableBody,
    TextField, MenuItem, CircularProgress, Menu, InputAdornment, Dialog, DialogContent
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import dayjs from "dayjs";

/* ---------- Brand + Fonts (same as other pages) ---------- */
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

/* ---------- Demo data ---------- */
const ALL_REPORTS = [
    {
        id: "payments-summary",
        name: "Payments Summary",
        desc: "Collected vs billed, payment methods, collection rate.",
        recommendedFormat: "PDF",
    },
    {
        id: "billing-monthly",
        name: "Monthly Billing Summary",
        desc: "Bills issued, paid, partials, arrears by month.",
        recommendedFormat: "PDF",
    },
    {
        id: "arrears-aging",
        name: "Arrears Aging",
        desc: "Outstanding balances by 0–30, 31–60, 61–90, 90+ days.",
        recommendedFormat: "XLSX",
    },
    {
        id: "expenses-by-apartment",
        name: "Expenses by Apartment",
        desc: "Landlord expenses split by apartment and type.",
        recommendedFormat: "PDF",
    },
    {
        id: "tenant-movement",
        name: "Tenant Movement (Transfers/Vacates)",
        desc: "Transfers, vacates, tenure and vacancy gaps.",
        recommendedFormat: "PDF",
    },
    {
        id: "sms-usage",
        name: "SMS Usage",
        desc: "Messages sent, delivery/read, total spend.",
        recommendedFormat: "CSV",
    },
];

/* ---------- Component ---------- */
export default function Reports() {
    const months = useMemo(
        () => Array.from({ length: 12 }, (_, i) => dayjs().subtract(i, "month").format("MMMM YYYY")),
        []
    );

    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState({
        q: "",
        period: months[0],
        apartment: "All",
        format: "PDF", // default download format
    });

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [menuRow, setMenuRow] = useState(null);
    const [previewSrc, setPreviewSrc] = useState(""); // objectURL for PDF/image; simple stub now

    const filtered = ALL_REPORTS.filter((r) =>
        r.name.toLowerCase().includes(filter.q.toLowerCase()) ||
        r.desc.toLowerCase().includes(filter.q.toLowerCase())
    );

    const refresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 600);
    };

    const openMenu = (e, row) => { setMenuAnchor(e.currentTarget); setMenuRow(row); };
    const closeMenu = () => { setMenuAnchor(null); setMenuRow(null); };

    const handlePreview = async () => {
        // Stub preview – show a simple HTML -> blob so UI flow works
        const html = `
      <html>
        <head><meta charset="utf-8"><title>Preview</title></head>
        <body style="font-family: Nunito, system-ui; padding:24px;">
          <h2 style="margin:0 0 6px;background:linear-gradient(90deg,#FF0080,#7E00A6);-webkit-background-clip:text;color:transparent;">
            ${menuRow?.name}
          </h2>
          <div style="opacity:.7">${filter.period} • Apartment: ${filter.apartment}</div>
          <hr style="margin:16px 0;border:0;border-top:1px solid #eee"/>
          <p>This is a placeholder preview for <b>${menuRow?.name}</b>. Wire to your /reports endpoint to render a real PDF or HTML.</p>
        </body>
      </html>`;
        const blob = new Blob([html], { type: "text/html" });
        setPreviewSrc(URL.createObjectURL(blob));
        closeMenu();
    };

    const handleDownload = async (fmt) => {
        // Stub download – saves a small CSV/HTML so UI flow works
        const filenameBase = `${menuRow?.id || "report"}_${filter.period.replace(/\s/g, "_").toLowerCase()}`;
        if (fmt === "CSV") {
            const csv = "col1,col2\nvalue1,value2\n";
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `${filenameBase}.csv`; a.click();
            URL.revokeObjectURL(url);
        } else if (fmt === "XLSX") {
            const fake = "This would be an .xlsx; replace with backend stream.";
            const blob = new Blob([fake], { type: "application/octet-stream" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `${filenameBase}.xlsx`; a.click();
            URL.revokeObjectURL(url);
        } else {
            // PDF/HTML preview fallback
            await handlePreview();
        }
        closeMenu();
    };

    const handleSchedule = () => {
        console.log("Open schedule modal for:", menuRow?.id, "with", filter);
        closeMenu();
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
                    Reports
                </Typography>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Refresh">
                    <IconButton onClick={refresh} sx={{ color: "#fff" }}>
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Stack>

            {/* Filters */}
            <Paper elevation={0} sx={{ ...softCard, borderRadius: 2, mb: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} alignItems="center">
                    <TextField
                        size="small"
                        placeholder="Search reports…"
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
                        select size="small" label="Period" value={filter.period}
                        onChange={(e) => setFilter({ ...filter, period: e.target.value })}
                        sx={{ minWidth: 190, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
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
                        select size="small" label="Format" value={filter.format}
                        onChange={(e) => setFilter({ ...filter, format: e.target.value })}
                        sx={{ minWidth: 140, "& .MuiInputBase-root": { color: "#fff" }, "& fieldset": { borderColor: "rgba(255,255,255,0.25)" } }}
                    >
                        {["PDF", "CSV", "XLSX"].map((f) => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                    </TextField>
                </Stack>
            </Paper>

            {/* Reports list */}
            <Paper elevation={0} sx={{ ...softCard }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: FONTS.subhead }}>
                    Available Reports
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
                                    <TableCell>Report</TableCell>
                                    <TableCell>Description</TableCell>
                                    <TableCell>Recommended</TableCell>
                                    <TableCell>Period</TableCell>
                                    <TableCell>Apartment</TableCell>
                                    <TableCell align="right">Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filtered.map((r) => (
                                    <TableRow key={r.id} hover>
                                        <TableCell sx={{ fontWeight: 700 }}>{r.name}</TableCell>
                                        <TableCell sx={{ opacity: .9 }}>{r.desc}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={r.recommendedFormat}
                                                sx={{ color: "#fff", border: "1px solid rgba(255,255,255,0.14)" }}
                                            />
                                        </TableCell>
                                        <TableCell>{filter.period}</TableCell>
                                        <TableCell>{filter.apartment}</TableCell>
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
                                                    "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" },
                                                }}
                                                onClick={(e) => openMenu(e, r)}
                                            >
                                                Actions
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Row Actions */}
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={closeMenu}
                            PaperProps={{ sx: { bgcolor: "#0e0a17", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" } }}
                        >
                            <MenuItem onClick={handlePreview}>
                                <VisibilityOutlinedIcon sx={{ mr: 1 }} /> Preview
                            </MenuItem>
                            <MenuItem onClick={() => handleDownload(filter.format)}>
                                <FileDownloadOutlinedIcon sx={{ mr: 1 }} /> Download ({filter.format})
                            </MenuItem>
                            <MenuItem onClick={handleSchedule}>
                                <AccessTimeOutlinedIcon sx={{ mr: 1 }} /> Schedule…
                            </MenuItem>
                        </Menu>
                    </>
                )}
            </Paper>

            {/* Preview Dialog */}
            <Dialog
                open={!!previewSrc}
                onClose={() => { URL.revokeObjectURL(previewSrc); setPreviewSrc(""); }}
                maxWidth="md"
                fullWidth
            >
                <DialogContent sx={{ p: 0, bgcolor: "#0b0714" }}>
                    {previewSrc && (
                        <iframe
                            title="report-preview"
                            src={previewSrc}
                            style={{ width: "100%", height: "70vh", border: 0, background: "#0b0714" }}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}
