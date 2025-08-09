import React from "react";
import {
    Box,
    Grid,
    Typography,
    Link as MUILink,
    IconButton,
    Divider,
    Stack,
    Fab,
    Tooltip,
    useScrollTrigger,
} from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import FacebookIcon from "@mui/icons-material/Facebook";

const BRAND = {
    pink: "#FF0080",
    magenta: "#D4124E",
    purple: "#7E00A6",
    blue: "#2979FF",
};
const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.purple})`;

/* Reusable link with emoji tooltip + hover motion */
function FooterLink({ href, label, emoji, ...props }) {
    return (
        <Tooltip title={`${emoji} ${label}`} arrow placement="top">
            <MUILink
                href={href}
                underline="none"
                color="inherit"
                sx={{
                    position: "relative",
                    fontSize: 14,
                    transition: "transform .2s ease, color .2s ease",
                    "&:hover": {
                        transform: "translateY(-1px) scale(1.02)",
                        color: BRAND.pink,
                    },
                    "&::before": {
                        content: `"${emoji} "`,
                        opacity: 0.9,
                    },
                }}
                {...props}
            >
                {label}
            </MUILink>
        </Tooltip>
    );
}

function BackToTopFab() {
    const trigger = useScrollTrigger({ threshold: 120 });
    return (
        <Fab
            size="small"
            aria-label="scroll back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            sx={{
                position: "fixed",
                right: 20,
                bottom: 28,
                opacity: trigger ? 1 : 0,
                transform: trigger ? "scale(1)" : "scale(0.9)",
                transition: "all .25s ease",
                background: brandGradient,
                color: "#fff",
                boxShadow: "0 10px 24px rgba(212,18,78,0.3)",
                zIndex: 1100,
                "&:hover": { filter: "brightness(1.05)" },
            }}
        >
            <KeyboardArrowUpIcon />
        </Fab>
    );
}

export default function Footer() {
    return (
        <>
            {/* Accent line */}
            <Box sx={{ height: 4, background: brandGradient, width: "100%" }} />

            {/* Footer surface */}
            <Box
                component="footer"
                sx={{
                    bgcolor: "rgba(255,255,255,0.6)",
                    borderTop: "1px solid rgba(0,0,0,0.06)",
                    backdropFilter: "blur(8px)",
                    boxShadow:
                        "0 -6px 18px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)",
                }}
            >
                <Box
                    sx={{
                        maxWidth: 1300,
                        mx: "auto",
                        px: { xs: 2, md: 3 },
                        py: { xs: 3, md: 4 },
                    }}
                >
                    {/* TOP ROW — evenly distributed */}
                    <Grid
                        container
                        columns={12}
                        columnSpacing={{ xs: 3, md: 6 }}   // horizontal spacing between the 3 blocks
                        rowSpacing={{ xs: 3, md: 4 }}
                        alignItems="flex-start"
                        justifyContent="space-between"
                        sx={{ mb: { xs: 2, md: 3 } }}
                    >
                        {/* Brand + blurb */}
                        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                            <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 900,
                                        background: brandGradient,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                    }}
                                >
                                    PayNest
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Smart Homes, Smarter Payments.
                                </Typography>

                                <Stack direction="row" spacing={1}>
                                    {[TwitterIcon, InstagramIcon, LinkedInIcon, FacebookIcon].map(
                                        (Icon, idx) => (
                                            <IconButton
                                                key={idx}
                                                size="small"
                                                color="inherit"
                                                sx={{
                                                    transition: "transform .2s, box-shadow .2s",
                                                    "&:hover": {
                                                        transform: "translateY(-2px)",
                                                        boxShadow: "0 6px 14px rgba(212,18,78,0.25)",
                                                        color: BRAND.pink,
                                                    },
                                                }}
                                            >
                                                <Icon fontSize="small" />
                                            </IconButton>
                                        )
                                    )}
                                </Stack>
                            </Stack>
                        </Grid>

                        {/* Quick links */}
                        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                            <Stack spacing={1.25} sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    Quick Links
                                </Typography>
                                <FooterLink href="/" label="Home" emoji="🏠" />
                                <FooterLink href="#features" label="Features" emoji="✨" />
                                <FooterLink href="#services" label="Services" emoji="🧰" />
                                <FooterLink href="#contact" label="Contact" emoji="📬" />
                            </Stack>
                        </Grid>

                        {/* Contact */}
                        <Grid item xs={12} md={4} sx={{ display: "flex" }}>
                            <Stack spacing={1.25} sx={{ flex: 1 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    Get in touch
                                </Typography>
                                <FooterLink
                                    href="mailto:support@paynest.app"
                                    label="support@paynest.app"
                                    emoji="✉️"
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Mon–Fri · 9:00–17:00
                                </Typography>
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider />

                    {/* BOTTOM BAR — centered alignment */}
                    <Stack
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ mt: { xs: 2.5, md: 3 } }}
                    >
                        <Typography variant="body2" color="text.secondary" align="center">
                            © {new Date().getFullYear()} PayNest. All rights reserved.
                        </Typography>
                        <Stack direction="row" spacing={2}>
                            <FooterLink href="/privacy" label="Privacy" emoji="🔒" />
                            <FooterLink href="/terms" label="Terms" emoji="📄" />
                            <FooterLink href="/cookies" label="Cookies" emoji="🍪" />
                        </Stack>
                    </Stack>
                </Box>
            </Box>

            <BackToTopFab />
        </>
    );
}
