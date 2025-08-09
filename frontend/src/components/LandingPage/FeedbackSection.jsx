// src/components/FeedbackRatingSection.jsx
import React, { useState } from "react";
import {
    Box, Paper, Typography, TextField, Button,
    Stack, Grid, CircularProgress, Alert
} from "@mui/material";
import Collapse from "@mui/material/Collapse";
import MuiRating from "@mui/material/Rating";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    blue: "#2979FF",
    purple: "#7E00A6",
    yellow: "#FFB400",
};
const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.purple})`;

const cardSx = {
    p: { xs: 2.5, md: 3 },
    borderRadius: 4,
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 2,
    background: "rgba(255,255,255,0.55)",
    border: "1px solid rgba(255,255,255,0.35)",
    backdropFilter: "blur(10px)",
    boxShadow:
        "8px 8px 18px rgba(0,0,0,0.08), -6px -6px 16px rgba(255,255,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)",
};

/* ---------- Feedback Form ---------- */
function FeedbackForm() {
    const [form, setForm] = useState({ Email: "", Subject: "", Message: "" });
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

    const autoClose = () =>
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);

    const handleChange = (e) =>
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

    const submit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            await axios.post(`${API_URL}/feedback`, form);
            setToast({ open: true, type: "success", msg: "Thanks! Your feedback was submitted." });
            setForm({ Email: "", Subject: "", Message: "" });
            autoClose();
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to submit feedback.";
            setToast({ open: true, type: "error", msg });
            autoClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ ...cardSx, width: "100%" }}>
            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: brandGradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Say it Loud 🎤 — We’re All Ears
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Got 60 seconds? Tell us what to improve or double down on.
                </Typography>
            </Box>

            <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <TextField
                    label="Email"
                    name="Email"
                    type="email"
                    value={form.Email}
                    onChange={handleChange}
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.blue } }}
                />
                <TextField
                    label="Subject"
                    name="Subject"
                    value={form.Subject}
                    onChange={handleChange}
                    inputProps={{ maxLength: 200 }}
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.purple } }}
                />
                <TextField
                    label="Message"
                    name="Message"
                    value={form.Message}
                    onChange={handleChange}
                    rows={4}
                    multiline
                    required
                    fullWidth
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.magenta } }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                        alignSelf: "flex-start",
                        minWidth: 160,
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                        background: brandGradient,
                        boxShadow: "0 6px 14px rgba(212,18,78,0.25)",
                        animation: loading ? "none" : "glow 2.2s ease-in-out infinite",
                        "&:hover": { background: brandGradient, filter: "brightness(1.05)" },
                        "@keyframes glow": {
                            "0%": { boxShadow: "0 6px 14px rgba(212,18,78,0.25)" },
                            "50%": { boxShadow: "0 8px 22px rgba(212,18,78,0.40)" },
                            "100%": { boxShadow: "0 6px 14px rgba(212,18,78,0.25)" },
                        },
                    }}
                >
                    {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "SUBMIT FEEDBACK"}
                </Button>

                {/* Inline alert BELOW the button */}
                <Collapse in={toast.open} appear>
                    <Alert sx={{ mt: 1 }} severity={toast.type} variant="filled">
                        {toast.msg}
                    </Alert>
                </Collapse>
            </Box>
        </Paper>
    );
}

/* ---------- Rating Form ---------- */
function RatingForm() {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, type: "success", msg: "" });

    const autoClose = () =>
        setTimeout(() => setToast((t) => ({ ...t, open: false })), 2200);

    const submit = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (!stars) {
            setToast({ open: true, type: "warning", msg: "Please select a star rating." });
            autoClose();
            return;
        }
        setLoading(true);
        try {
            await axios.post(`${API_URL}/ratings`, { RatingValue: stars, Comment: comment || null });
            setToast({ open: true, type: "success", msg: "Thanks for rating!" });
            setStars(0);
            setComment("");
            autoClose();
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to submit rating.";
            setToast({ open: true, type: "error", msg });
            autoClose();
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ ...cardSx, width: "100%" }}>
            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 900,
                        lineHeight: 1.1,
                        background: "linear-gradient(90deg, #FFA000, #FF4081)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                    }}
                >
                    Tap Your Stars ⭐ — 5 Seconds Tops
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Quick pulse check: how did we do today?
                </Typography>
            </Box>

            <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <MuiRating
                        value={stars}
                        onChange={(_, v) => setStars(v || 0)}
                        size="large"
                        sx={{
                            "& .MuiRating-iconFilled": { color: BRAND.yellow },
                            "& .MuiRating-iconHover": { color: "#FFC447" },
                        }}
                    />
                    <Typography variant="body2">{stars || "-"}/5</Typography>
                </Stack>

                <TextField
                    label="Optional comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    sx={{ "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: BRAND.blue } }}
                />

                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{
                        alignSelf: "flex-start",
                        minWidth: 160,
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                        background: brandGradient,
                        boxShadow: "0 6px 14px rgba(126,0,166,0.25)",
                        animation: loading ? "none" : "glow 2.2s ease-in-out infinite",
                        "&:hover": { background: brandGradient, filter: "brightness(1.05)" },
                        "@keyframes glow": {
                            "0%": { boxShadow: "0 6px 14px rgba(126,0,166,0.25)" },
                            "50%": { boxShadow: "0 8px 22px rgba(126,0,166,0.40)" },
                            "100%": { boxShadow: "0 6px 14px rgba(126,0,166,0.25)" },
                        },
                    }}
                >
                    {loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "SUBMIT RATING"}
                </Button>

                {/* Inline alert BELOW the button */}
                <Collapse in={toast.open} appear>
                    <Alert sx={{ mt: 1 }} severity={toast.type} variant="filled">
                        {toast.msg}
                    </Alert>
                </Collapse>
            </Box>
        </Paper>
    );
}

/* ---------- Parent ---------- */
export default function FeedbackRatingSection() {
    return (
        <Box sx={{ position: "relative", mt: 0, mb: { xs: 3, md: 6 }, px: { xs: 1.5, md: 2 } }}>
            <Box
                sx={{
                    maxWidth: 1300,
                    mx: "auto",
                    p: { xs: 2, md: 3 },
                    borderRadius: 5,
                    background: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    backdropFilter: "blur(8px)",
                    position: "relative",
                    zIndex: 0,
                }}
            >
                <Stack spacing={0.5} alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={900}>We’d love your thoughts</Typography>
                </Stack>

                <Grid
                    container
                    columns={12}
                    columnSpacing={{ xs: 2, md: 4 }}   // horizontal gap between cards
                    rowSpacing={{ xs: 3, md: 4 }}      // vertical gap on small screens
                    alignItems="stretch"
                    justifyContent="space-between"
                >
                    <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                        <FeedbackForm />
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ display: "flex" }}>
                        <RatingForm />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
