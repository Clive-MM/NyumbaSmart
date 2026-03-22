import { createTheme } from "@mui/material/styles";

const BRAND = {
    primary: "#D4124E", // Your signature Magenta
    secondary: "#7E00A6",
    background: "#F8FAFC", // Clean, soft background
    textMain: "#0F172A",    // Deep Slate (High visibility)
    textMuted: "#64748B",
    glass: "rgba(255, 255, 255, 0.8)",
};

export const paynestTheme = createTheme({
    palette: {
        mode: "light", // Switching to light mode for that clean UX
        primary: { main: BRAND.primary },
        background: { default: BRAND.background, paper: "#ffffff" },
        text: { primary: BRAND.textMain, secondary: BRAND.textMuted },
    },
    typography: {
        // Using Inter for body and Outfit for headings as discussed
        fontFamily: `'Inter', "Segoe UI", Roboto, sans-serif`,
        h4: { 
            fontFamily: `'Outfit', sans-serif`, 
            fontWeight: 800, 
            letterSpacing: -0.5,
            color: BRAND.textMain 
        },
        button: { textTransform: "none", fontWeight: 700 },
    },
    shape: { borderRadius: 16 }, // Larger radius for modern look
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    background: BRAND.glass,
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    boxShadow: "0 10px 40px -10px rgba(0, 0, 0, 0.05)", // Soft shadow from images
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: BRAND.primary,
                    borderRadius: 50, // Pill shape for modern buttons
                    padding: "10px 24px",
                    boxShadow: "0 8px 20px rgba(212, 18, 78, 0.2)",
                    "&:hover": { 
                        background: "#B10E41",
                        boxShadow: "0 12px 25px rgba(212, 18, 78, 0.3)" 
                    },
                },
                outlined: {
                    borderRadius: 50,
                    borderColor: "rgba(0,0,0,0.1)",
                    color: BRAND.textMain,
                    "&:hover": { borderColor: BRAND.primary, background: "rgba(212,18,78,0.04)" },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    color: BRAND.textMain,
                }
            }
        }
    },
});