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

/* Brand */
const BRAND = {
  pink: "#FF0080",
  magenta: "#D4124E",
  purple: "#7E00A6",
  blue: "#2979FF",
  textStrong: "#F3F4F6",
  textSoft: "rgba(227,229,236,.82)",
  bgViolet: "#140A1E",
  bgNavy: "#0E1220",
  bgDeep: "#0A0D16",
};
const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.purple}, ${BRAND.blue})`;
const darkGradient = `
  radial-gradient(900px 700px at 10% -10%, rgba(255,46,196,0.14), transparent 60%),
  radial-gradient(900px 700px at 90% 0%, rgba(0,200,255,0.12), transparent 60%),
  linear-gradient(180deg, ${BRAND.bgViolet} 0%, ${BRAND.bgNavy} 45%, ${BRAND.bgDeep} 100%)
`;

const logoUrl =
  "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* Load Orbitron once */
(() => {
  const href =
    "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap";
  if (typeof document !== "undefined" && !document.head.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }
})();

/* Reusable link (emoji + subtle hover) */
function FooterLink({ href, label, emoji }) {
  return (
    <Tooltip title={`${emoji} ${label}`} arrow placement="top">
      <MUILink
        href={href}
        underline="none"
        sx={{
          color: BRAND.textSoft,
          fontSize: 14,
          transition: "color .2s ease, transform .2s ease",
          "&:hover": { color: BRAND.pink, transform: "translateY(-1px)" },
          "&::before": { content: `"${emoji} "`, opacity: 0.9, marginRight: 4 },
        }}
      >
        {label}
      </MUILink>
    </Tooltip>
  );
}

/* Back to top */
function BackToTopFab() {
  const trigger = useScrollTrigger({ threshold: 120 });
  return (
    <Fab
      size="small"
      aria-label="scroll back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      sx={{
        position: "fixed",
        right: 22,
        bottom: 30,
        opacity: trigger ? 1 : 0,
        transform: trigger ? "scale(1)" : "scale(.92)",
        transition: "all .25s ease",
        background: brandGradient,
        color: "#fff",
        boxShadow: "0 10px 24px rgba(212,18,78,0.28)",
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
      {/* thin accent line */}
      <Box sx={{ height: 4, background: brandGradient, width: "100%" }} />

      {/* SINGLE full-width wrapper (no rounded corners, no inset card) */}
      <Box
        component="footer"
        sx={{
          width: "100%",
          background: darkGradient,
          color: BRAND.textStrong,
          pb: { xs: 4, md: 5 },
          pt: { xs: 3, md: 4 },
        }}
      >
        <Box sx={{ maxWidth: 1300, mx: "auto", px: { xs: 2, md: 3 } }}>
          {/* TOP ROW */}
          <Grid
            container
            columns={12}
            columnSpacing={{ xs: 3, md: 6 }}
            rowSpacing={{ xs: 3, md: 4 }}
            alignItems="flex-start"
            justifyContent="space-between"
            sx={{ mb: { xs: 2, md: 3 } }}
          >
            {/* Brand + slogan */}
            <Grid item xs={12} md={4}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.25} alignItems="center">
                  <Box
                    component="img"
                    src={logoUrl}
                    alt="PayNest"
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 1.5,
                      boxShadow:
                        "0 10px 20px rgba(255,0,128,0.18), inset 0 0 0 1px rgba(255,255,255,0.6)",
                    }}
                  />
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 900,
                      letterSpacing: 0.6,
                      background: brandGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    PayNest
                  </Typography>
                </Stack>

                <Typography variant="body2" sx={{ color: BRAND.textSoft }}>
                  Smart Homes, Smarter Payments.
                </Typography>

                <Stack direction="row" spacing={1}>
                  {[TwitterIcon, InstagramIcon, LinkedInIcon, FacebookIcon].map((Icon, i) => (
                    <IconButton
                      key={i}
                      size="small"
                      sx={{
                        color: BRAND.textSoft,
                        transition: "transform .2s, color .2s, filter .2s",
                        "&:hover": {
                          color: "#fff",
                          transform: "translateY(-2px)",
                          filter:
                            "drop-shadow(0 0 8px rgba(255,0,128,.35)) drop-shadow(0 0 12px rgba(41,121,255,.25))",
                        },
                      }}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Quick links */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1.25}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 800,
                    letterSpacing: 0.4,
                  }}
                >
                  Quick Links
                </Typography>
                <FooterLink href="/" label="Home" emoji="🏠" />
                <FooterLink href="#features" label="Features" emoji="✨" />
                <FooterLink href="#services" label="Services" emoji="🧰" />
                <FooterLink href="#contact" label="Contact" emoji="📬" />
              </Stack>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={4}>
              <Stack spacing={1.25}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontWeight: 800,
                    letterSpacing: 0.4,
                  }}
                >
                  Get in touch
                </Typography>
                <FooterLink href="mailto:support@paynest.app" label="support@paynest.app" emoji="✉️" />
                <Typography variant="body2" sx={{ color: BRAND.textSoft }}>
                  Mon–Fri · 9:00–17:00
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ borderColor: "rgba(255,255,255,.08)" }} />

          {/* Bottom bar */}
          <Stack spacing={1} alignItems="center" sx={{ mt: { xs: 2.5, md: 3 } }}>
            <Typography variant="body2" sx={{ color: BRAND.textSoft }} align="center">
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
