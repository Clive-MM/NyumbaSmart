// src/components/SoftCard.jsx
import { Paper } from "@mui/material";

const BRAND = {
    gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
};

export default function SoftCard({ sx, hover = true, ...props }) {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.06)",
                transition:
                    "transform .2s ease, box-shadow .2s ease, border-color .2s ease, filter .2s ease",
                ...(hover && {
                    "&:hover": {
                        transform: "translateY(-3px)",
                        borderColor: "transparent",
                        background:
                            "linear-gradient(#0e0a17,#0e0a17) padding-box, " +
                            BRAND.gradient +
                            " border-box",
                        filter: "drop-shadow(0 18px 28px rgba(255,0,128,.16))",
                    },
                }),
                ...sx,
            }}
            {...props}
        />
    );
}
