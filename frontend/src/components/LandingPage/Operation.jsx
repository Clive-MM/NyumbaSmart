// src/sections/Operation.jsx
import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { motion } from "framer-motion";

// Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import AccountBalanceWalletRoundedIcon from "@mui/icons-material/AccountBalanceWalletRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";

const Section = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(10, 0, 12),
  background:
    "radial-gradient(1200px 800px at 10% 0%, rgba(255,0,128,0.15), transparent 60%)," +
    "radial-gradient(900px 700px at 90% 10%, rgba(255,255,0,0.12), transparent 60%)," +
    "linear-gradient(180deg, #150416 0%, #1a0423 40%, #0f0618 100%)",
  color: "#fff",
}));

const TitleWrap = styled(Box)(({ theme }) => ({
  textAlign: "center",
  marginBottom: theme.spacing(6),
}));

const GradientText = styled(Typography)(({ theme }) => ({
  fontWeight: 800,
  letterSpacing: 0.5,
  background:
    "linear-gradient(90deg, #FFC22E 0%, #FF5A3D 30%, #FF0080 60%, #8A00D4 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
}));

const GlowButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  padding: theme.spacing(1.2, 3),
  borderRadius: 14,
  fontWeight: 700,
  textTransform: "uppercase",
  backdropFilter: "blur(8px)",
  background:
    "linear-gradient(90deg, #FFC22E, #FF5A3D, #FF0080)",
  color: "#1b001f",
  boxShadow:
    "0 0 10px rgba(255,0,128,0.5), 0 10px 24px rgba(255,0,128,0.25)",
  "&:hover": {
    boxShadow:
      "0 0 14px rgba(255,0,128,0.7), 0 14px 32px rgba(255,0,128,0.35)",
    transform: "translateY(-1px)",
    background:
      "linear-gradient(90deg, #FFE073, #FF6B4F, #FF2A9E)",
  },
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 18,
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.12)",
  backdropFilter: "blur(8px)",
  boxShadow:
    "inset 0 0 0 1px rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)",
  transition: "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
  "&:hover": {
    transform: "translateY(-4px)",
    borderColor: "rgba(255,0,128,0.35)",
    boxShadow:
      "0 12px 32px rgba(255,0,128,0.25), 0 4px 12px rgba(255,255,0,0.15)",
  },
}));

const IconWrap = styled(Box)(({ theme }) => ({
  width: 56,
  height: 56,
  borderRadius: 14,
  display: "grid",
  placeItems: "center",
  marginBottom: theme.spacing(2),
  background:
    "linear-gradient(135deg, #FFC22E 0%, #FF5A3D 35%, #FF0080 70%, #8A00D4 100%)",
  boxShadow: "0 8px 18px rgba(255,0,128,0.35)",
  color: "#1b001f",
}));

// Data
const SERVICES = [
  {
    icon: <HomeRoundedIcon fontSize="large" />,
    title: "Property & Unit Management",
    desc: "Manage properties and rental units.",
  },
  {
    icon: <PersonAddAlt1RoundedIcon fontSize="large" />,
    title: "Tenant Onboarding & Management",
    desc: "Onboard and manage tenants.",
  },
  {
    icon: <ReceiptLongRoundedIcon fontSize="large" />,
    title: "Billing & Rent Collection",
    desc: "Automate billing and track payments.",
  },
  {
    icon: <AccountBalanceWalletRoundedIcon fontSize="large" />,
    title: "Landlord Expense Tracking",
    desc: "Record and monitor expenses.",
  },
  {
    icon: <QueryStatsRoundedIcon fontSize="large" />,
    title: "Reports & Tax Filing Support",
    desc: "Generate reports and tax statements.",
  },
  {
    icon: <NotificationsActiveRoundedIcon fontSize="large" />,
    title: "Notifications & Alerts",
    desc: "Send rent reminders and alerts.",
  },
  {
    icon: <FolderRoundedIcon fontSize="large" />,
    title: "Document & Media Storage",
    desc: "Store tenancy documents securely.",
  },
  {
    icon: <LockRoundedIcon fontSize="large" />,
    title: "Secure Access & Role Management",
    desc: "Control access with user roles.",
  },
];

export default function Operation() {
  return (
    <Section id="services">
      <Container maxWidth="lg">
        <TitleWrap>
          <GradientText variant="h3" component="h2">
            OUR SERVICES
          </GradientText>

          <GlowButton
            size="large"
            component={motion.button}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            Get Started
          </GlowButton>
        </TitleWrap>

        <Grid container spacing={3}>
          {SERVICES.map((item, idx) => (
            <Grid key={idx} item xs={12} sm={6} md={3}>
              <ServiceCard
                component={motion.div}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                variant="outlined"
              >
                <CardContent>
                  <IconWrap>{item.icon}</IconWrap>

                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    {item.title}
                  </Typography>

                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    {item.desc}
                  </Typography>
                </CardContent>
              </ServiceCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}
