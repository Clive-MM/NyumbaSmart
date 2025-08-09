// src/components/FeedbackRatingSection.jsx
import React, { useState } from "react";
import {
    Box, Paper, Typography, TextField, Button, Alert,
    Stack, Grid, CircularProgress
} from "@mui/material";
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

/* ---------- Feedback Form ---------- */
function FeedbackForm({ onSuccess, setLoading }) {
    const [form, setForm] = useState({ Email: "", Subject: "", Message: "" });
    const [local, setLocal] = useState({ type: "info", msg: "", show: false });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setLocal({ ...local, show: false });
        try {
            await axios.post(`${API_URL}/feedback`, form);
            setLocal({ type: "success", msg: "Thanks! Your feedback was submitted.", show: true });
            onSuccess?.();
            setForm({ Email: "", Subject: "", Message: "" });
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to submit feedback.";
            setLocal({ type: "error", msg, show: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                background: "#eef0f5",
                boxShadow: "8px 8px 16px #c8cdd6, -8px -8px 16px #ffffff, 0 0 18px rgba(255,0,128,0.08)",
                transition: "transform .2s, box-shadow .2s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "12px 12px 24px #c1c6d0, -12px -12px 24px #ffffff, 0 0 26px rgba(255,0,128,0.12)",
                },
            }}
        >
            {/* Inline alert ABOVE the form */}

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

                {/* Shorter, glowing button with loading state */}
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!!setLoading.loading}
                    sx={{
                        alignSelf: "flex-start",
                        minWidth: 160,
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                        background: brandGradient,
                        boxShadow: "0 6px 14px rgba(212,18,78,0.25)",
                        animation: "glow 2.2s ease-in-out infinite",
                        "&:hover": { background: brandGradient, filter: "brightness(1.05)" },
                        "@keyframes glow": {
                            "0%": { boxShadow: "0 6px 14px rgba(212,18,78,0.25)" },
                            "50%": { boxShadow: "0 8px 22px rgba(212,18,78,0.40)" },
                            "100%": { boxShadow: "0 6px 14px rgba(212,18,78,0.25)" },
                        },
                    }}
                >
                    {setLoading.loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "SUBMIT FEEDBACK"}
                </Button>
                {local.show && (
                    <Alert severity={local.type} onClose={() => setLocal({ ...local, show: false })}>
                        {local.msg}
                    </Alert>
                )}
            </Box>
        </Paper>
    );
}

/* ---------- Rating Form ---------- */
function RatingForm({ onSuccess, setLoading, onRated }) {
    const [stars, setStars] = useState(0);
    const [comment, setComment] = useState("");
    const [local, setLocal] = useState({ type: "info", msg: "", show: false });

    const submit = async (e) => {
        e.preventDefault();
        if (!stars) {
            setLocal({ type: "warning", msg: "Please select a star rating.", show: true });
            return;
        }
        setLoading(true);
        setLocal({ ...local, show: false });
        try {
            await axios.post(`${API_URL}/ratings`, { RatingValue: stars, Comment: comment || null });
            setLocal({ type: "success", msg: "Thanks for rating!", show: true });
            setStars(0);
            setComment("");
            onRated?.();
            onSuccess?.();
        } catch (err) {
            const msg = err?.response?.data?.error || "Failed to submit rating.";
            setLocal({ type: "error", msg, show: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                background: "#eef0f5",
                boxShadow: "8px 8px 16px #c8cdd6, -8px -8px 16px #ffffff, 0 0 18px rgba(41,121,255,0.10)",
                transition: "transform .2s, box-shadow .2s",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "12px 12px 24px #c1c6d0, -12px -12px 24px #ffffff, 0 0 26px rgba(41,121,255,0.16)",
                },
            }}
        >
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

                {/* Shorter, glowing button with loading state */}
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        alignSelf: "flex-start",
                        minWidth: 160,
                        px: 2.5,
                        py: 1,
                        fontWeight: 700,
                        background: brandGradient,
                        boxShadow: "0 6px 14px rgba(126,0,166,0.25)",
                        animation: "glow 2.2s ease-in-out infinite",
                        "&:hover": { background: brandGradient, filter: "brightness(1.05)" },
                        "@keyframes glow": {
                            "0%": { boxShadow: "0 6px 14px rgba(126,0,166,0.25)" },
                            "50%": { boxShadow: "0 8px 22px rgba(126,0,166,0.40)" },
                            "100%": { boxShadow: "0 6px 14px rgba(126,0,166,0.25)" },
                        },
                    }}
                >
                    {setLoading.loading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "SUBMIT RATING"}
                </Button>

                {/* Inline alert BELOW the button */}
                {local.show && (
                    <Alert severity={local.type} onClose={() => setLocal({ ...local, show: false })}>
                        {local.msg}
                    </Alert>
                )}
            </Box>
        </Paper>
    );
}

/* ---------- Parent (summary removed) ---------- */
export default function FeedbackRatingSection() {
    const [loading, setLoading] = useState(false);

    return (
        <Box sx={{ position: "relative", my: 7, px: 2 }}>
            {/* Glass wrapper */}
            <Box
                sx={{
                    maxWidth: 1300,
                    mx: "auto",
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 4,
                    background: "rgba(255,255,255,0.45)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    backdropFilter: "blur(8px)",
                    position: "relative",
                    overflow: "hidden",
                    opacity: loading ? 0.85 : 1,
                    transition: "opacity .2s",
                }}
            >
                {/* Header (kept title only; removed average stars & chip) */}
                <Stack spacing={1} alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight={900}>We’d love your thoughts</Typography>
                </Stack>

                {/* Two cards */}
                <Grid
                    container
                    spacing={{ xs: 28, md: 28 }}
                    alignItems="stretch"
                    columns={12}
                >
                    <Grid item xs={12} md={6}>
                        <FeedbackForm setLoading={(v) => setLoading(v)} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <RatingForm setLoading={(v) => setLoading(v)} />
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
