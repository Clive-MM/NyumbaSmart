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
  useScrollTrigger,
  Container,
  Tooltip,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TwitterIcon from "@mui/icons-material/Twitter"; // For X
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FacebookIcon from "@mui/icons-material/Facebook";

/* ---------- Brand Colors ---------- */
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
  success: "#10b981",
  whatsapp: "#25D366",
};

const brandGradient = `linear-gradient(90deg, ${BRAND.pink}, ${BRAND.magenta}, ${BRAND.purple}, ${BRAND.blue})`;
const darkGradient = `
  radial-gradient(900px 700px at 10% -10%, rgba(255,46,196,0.14), transparent 60%),
  radial-gradient(900px 700px at 90% 0%, rgba(0,200,255,0.12), transparent 60%),
  linear-gradient(180deg, ${BRAND.bgViolet} 0%, ${BRAND.bgNavy} 45%, ${BRAND.bgDeep} 100%)
`;

const logoUrl = "https://res.cloudinary.com/djydkcx01/image/upload/v1753818069/ChatGPT_Image_Jul_29_2025_10_40_50_PM_ttgxoo.png";

/* ---------- Styled Components ---------- */
const SocialIconButton = styled(IconButton)(({ hovercolor }) => ({
  color: BRAND.textSoft,
  padding: 10,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    color: "#fff",
    transform: "translateY(-5px) scale(1.1)",
    background: alpha(hovercolor, 0.15),
    filter: `drop-shadow(0 0 12px ${hovercolor})`,
  },
}));



/* ---------- Sub-components ---------- */
function FooterLink({ href, label, emoji }) {
  return (
    <MUILink
      href={href}
      underline="none"
      sx={{
        color: BRAND.textSoft,
        fontSize: "0.9rem",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        transition: "all 0.2s ease",
        "&:hover": { color: BRAND.pink, transform: "translateX(5px)" },
      }}
    >
      <span style={{ fontSize: "1.1rem" }}>{emoji}</span>
      {label}
    </MUILink>
  );
}

function BackToTopFab() {
  const trigger = useScrollTrigger({ threshold: 200 });
  return (
    <Fab
      size="medium"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      sx={{
        position: "fixed",
        right: 30,
        bottom: 30,
        opacity: trigger ? 1 : 0,
        transform: trigger ? "scale(1)" : "scale(0.5)",
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        background: brandGradient,
        color: "#fff",
        boxShadow: `0 10px 25px ${alpha(BRAND.magenta, 0.4)}`,
        zIndex: 1100,
        "&:hover": { transform: "translateY(-5px) scale(1.1)", filter: "brightness(1.1)" },
      }}
    >
      <KeyboardArrowUpIcon />
    </Fab>
  );
}

/* ---------- Main Footer Component ---------- */
export default function Footer() {
  const socialPlatforms = [
    { Icon: TwitterIcon, color: BRAND.blue, tooltip: "Follow us on X", href: "#" },
    { Icon: FacebookIcon, color: "#1877F2", tooltip: "Join our community", href: "#" },
    { Icon: WhatsAppIcon, color: BRAND.whatsapp, tooltip: "Chat with us", href: "#" },
    { Icon: InstagramIcon, color: BRAND.pink, tooltip: "See our latest stories", href: "#" },
  ];

  return (
    <>
      <Box sx={{ 
        height: 4, 
        background: brandGradient, 
        width: "100%", 
        boxShadow: `0 -4px 20px ${alpha(BRAND.magenta, 0.3)}`,
        position: "relative",
        zIndex: 2
      }} />

      <Box
        component="footer"
        sx={{
          width: "100%",
          background: darkGradient,
          color: BRAND.textStrong,
          pt: { xs: 6, md: 10 },
          pb: { xs: 4, md: 6 },
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} justifyContent="space-between">
            
            <Grid item xs={12} md={4}>
              <Stack spacing={4}>
                <Box display="flex" alignItems="center" gap={2}>
                  <Box
                    component="img"
                    src={logoUrl}
                    alt="PayNest"
                    sx={{ width: 50, height: 50, borderRadius: 2, boxShadow: "0 8px 16px rgba(0,0,0,0.4)" }}
                  />
                  <Typography
                    variant="h5"
                    sx={{
                      fontFamily: "'Orbitron', sans-serif",
                      fontWeight: 900,
                      letterSpacing: 1.5,
                      background: brandGradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    PayNest
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: BRAND.textSoft, lineHeight: 1.7 }}>
                  Empowering landlords with next-gen automation. 
                  <b> Smart Homes, Smarter Payments.</b>
                </Typography>
                
                {/* Social Media Section with Custom Tooltips */}
                <Stack direction="row" spacing={1}>
                  {socialPlatforms.map((platform, index) => (
                    <Tooltip key={index} title={platform.tooltip} arrow placement="top">
                      <SocialIconButton 
                        hovercolor={platform.color}
                        href={platform.href}
                        target="_blank"
                      >
                        <platform.Icon fontSize="small" />
                      </SocialIconButton>
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            <Grid item xs={6} md={2.5}>
              <Typography variant="subtitle1" sx={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, mb: 4, color: "#fff", fontSize: "0.85rem", textTransform: "uppercase" }}>
                Platform
              </Typography>
              <Stack spacing={2.5}>
                <FooterLink href="/" label="Home" emoji="🏠" />
                <FooterLink href="#features" label="Features" emoji="🚀" />
                <FooterLink href="#services" label="Services" emoji="🛠️" />
                <FooterLink href="#feedback" label="Feedback" emoji="💬" />
              </Stack>
            </Grid>

            <Grid item xs={6} md={3}>
              <Typography variant="subtitle1" sx={{ fontFamily: "'Orbitron', sans-serif", fontWeight: 800, mb: 4, color: "#fff", fontSize: "0.85rem", textTransform: "uppercase" }}>
                Get in touch
              </Typography>
              <Stack spacing={3}>
                <FooterLink href="mailto:support@paynest.app" label="support@paynest.app" emoji="✉️" />
                <Box>
                   <Typography variant="body2" sx={{ color: BRAND.textSoft, mb: 1 }}>
                    🕒 Mon–Fri · 9:00–17:00
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 2 }}>
                   
                    
                  </Box>
                </Box>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 6, borderColor: "rgba(255,255,255,0.06)" }} />

          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" spacing={2}>
            <Typography variant="caption" sx={{ color: BRAND.textSoft, opacity: 0.7 }}>
              © {new Date().getFullYear()} PayNest. All rights reserved.
            </Typography>
            
          </Stack>
        </Container>
      </Box>

      <BackToTopFab />
    </>
  );
}