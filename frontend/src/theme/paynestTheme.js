// src/theme/paynestTheme.js
import { createTheme } from "@mui/material/styles";

const BRAND = {
    start: "#FF0080",
    end: "#7E00A6",
    gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
};

export const paynestTheme = createTheme({
    palette: {
        mode: "dark",
        background: { default: "#0b0714", paper: "#0e0a17" },
        text: { primary: "#fff", secondary: "rgba(237,237,241,.72)" },
        divider: "rgba(255,255,255,0.08)",
    },
    typography: {
        fontFamily: `"Nunito", system-ui, -apple-system, Segoe UI, Roboto, Arial`,
        h4: { fontFamily: `"Cinzel", Georgia, serif`, fontWeight: 800, letterSpacing: .5 },
        button: { textTransform: "none", fontWeight: 700 },
    },
    shape: { borderRadius: 12 },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    color: "#fff",
                    background: "#0e0a17",
                    border: "1px solid rgba(255,255,255,0.06)",
                    boxShadow: "9px 9px 18px rgba(0,0,0,.55), -9px -9px 18px rgba(255,255,255,.03)",
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: BRAND.gradient,
                    boxShadow: "none",
                    "&:hover": { filter: "brightness(1.05)" },
                    borderRadius: 10,
                },
                outlined: {
                    color: "#fff",
                    borderColor: "rgba(255,255,255,0.35)",
                    borderRadius: 10,
                    "&:hover": { borderColor: BRAND.start, background: "rgba(255,0,128,.08)" },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 10 },
            },
        },
        MuiTableCell: {
            styleOverrides: { head: { color: "rgba(237,237,241,.9)", fontWeight: 700 } },
        },
    },
});
