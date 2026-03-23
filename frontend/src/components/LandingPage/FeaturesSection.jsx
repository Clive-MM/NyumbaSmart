import * as React from 'react';
import { Box, Card,  Typography, CardActionArea } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { alpha } from "@mui/material/styles";

const BRAND = {
  magenta: "#D4124E",
  slate: "#0F172A",
  muted: "#64748B",
  bgSoft: "#F8FAFC", 
  insetDark: "rgba(0, 0, 0, 0.12)",  
  insetLight: "rgba(255, 255, 255, 1)", 
};

const features = [
  { id: 1, tag: "MANAGEMENT", title: "Tenant & Unit Management", description: "Assign tenants to units, manage lease info, and handle vacate or transfer notices with ease.", image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754586644/ChatGPT_Image_Aug_7_2025_08_10_26_PM_ok7tfd.png" },
  { id: 2, tag: "FINANCE", title: "Rent & Billing", description: "Track rent payments, manage utility bills, and send tenants monthly summaries via SMS.", image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754585467/ChatGPT_Image_Aug_7_2025_07_50_50_PM_kzutsg.png" },
  { id: 3, tag: "ANALYTICS", title: "Reporting & Analytics", description: "View real-time income reports, track expenses, and export summaries for KRA tax filing.", image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754579312/ChatGPT_Image_Aug_7_2025_06_08_10_PM_emqb8t.png" },
  { id: 4, tag: "MOBILE", title: "Accessibility & Notifications", description: "Access the system on mobile and notify tenants automatically via SMS or email.", image: "https://res.cloudinary.com/djydkcx01/image/upload/v1754579128/ChatGPT_Image_Aug_7_2025_06_00_21_PM_itikc7.png" },
];

export default function FeaturesSection() {
  const [selectedCard, setSelectedCard] = React.useState(0);

  return (
    <Box sx={{ backgroundColor: BRAND.bgSoft, minHeight: '100vh', display: 'flex', alignItems: 'center', py: 12, px: { xs: 2, md: 8 } }}>
      <Box sx={{ maxWidth: '1400px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 8 }}>
        
        {/* LEFT: Feature Grid */}
        <Box sx={{ flex: 1.1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3.5 }}>
          {features.map((feature, index) => (
            <Card key={feature.id} elevation={0} sx={{ borderRadius: '48px', backgroundColor: 'transparent', overflow: 'visible' }}>
              <CardActionArea
                onMouseEnter={() => setSelectedCard(index)}
                data-active={selectedCard === index ? '' : undefined}
                sx={{
                  height: '320px', p: 4, borderRadius: '48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                  transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: `inset 6px 6px 14px ${BRAND.insetDark}, inset -6px -6px 14px ${BRAND.insetLight}`,
                  '&[data-active]': {
                    backgroundColor: '#ffffff',
                    transform: 'translateY(-12px) scale(1.02)',
                    boxShadow: `0 30px 60px -12px ${alpha(BRAND.slate, 0.2)}, 0 10px 20px -5px ${alpha(BRAND.magenta, 0.1)}`,
                  },
                }}
              >
                {/* TAG: Orbitron + Bold + Spaced */}
                <Typography sx={{ 
                  color: BRAND.magenta, 
                  fontWeight: 900, 
                  fontSize: '0.8rem', 
                  letterSpacing: '0.2em', 
                  mb: 2,
                  fontFamily: "'Orbitron', sans-serif" 
                }}>
                  {feature.tag}
                </Typography>

                {/* TITLE: Orbitron + Extra Bold (900) + Slate */}
                <Typography variant="h5" sx={{ 
                  fontWeight: 900, 
                  color: BRAND.slate, 
                  mb: 2.5, 
                  fontFamily: "'Orbitron', sans-serif", 
                  lineHeight: 1.2,
                  fontSize: '1.4rem',
                  textShadow: selectedCard === index ? `1px 1px 0px ${alpha(BRAND.magenta, 0.2)}` : 'none'
                }}>
                  {feature.title}
                </Typography>

                {/* DESCRIPTION: Orbitron + Semi-Bold (600) + Muted */}
                <Typography variant="body2" sx={{ 
                  color: BRAND.muted, 
                  fontSize: '1rem', 
                  lineHeight: 1.7, 
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 600
                }}>
                  {feature.description}
                </Typography>
              </CardActionArea>
            </Card>
          ))}
        </Box>

        {/* RIGHT: Image Stage */}
        <Box sx={{ flex: 0.9, position: 'relative', display: { xs: 'none', lg: 'block' } }}>
          <Box
            sx={{
              position: 'sticky', top: '15vh', height: '620px', width: '100%',
              borderRadius: '56px', backgroundColor: '#ffffff', overflow: 'hidden',
              boxShadow: '0 40px 80px -20px rgba(15, 23, 42, 0.15)',
              border: `2px solid ${alpha(BRAND.magenta, 0.05)}`
            }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedCard}
                src={features[selectedCard].image}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ width: '100%', height: '100%', objectPosition: 'top', objectFit: 'cover' }}
              />
            </AnimatePresence>
            
            {/* Subtle Gradient Overlay */}
            <Box sx={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${alpha(BRAND.slate, 0.1)}, transparent)` }} />
          </Box>
        </Box>

      </Box>
    </Box>
  );
}