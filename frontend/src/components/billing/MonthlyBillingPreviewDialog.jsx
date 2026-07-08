import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Stack,
    IconButton,
    Box,
    Divider,

    Grid,
    TextField,
    MenuItem,
    Checkbox,
    FormControlLabel,

} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
const BRAND = {
    start: "#FF0080",
    end: "#7E00A6",
    gradient: "linear-gradient(90deg,#FF0080 0%, #7E00A6 100%)",
    glow: "0 14px 30px rgba(255,0,128,.22), 0 8px 20px rgba(126,0,166,.18)"
};

const MonthlyBillingPreviewDialog = ({
    open,
    onClose,
    onGenerate,
}) => {
    const [config, setConfig] = useState({
        billingMonth: "2026-07",
        apartment: "all",
        dueDate: "2026-08-05",

        includeWater: true,
        includeElectricity: true,
        includeGarbage: true,
        includeInternet: true,
    });
    const summary = [
        {
            title: "Apartments",
            value: 5,
            color: "#2563EB",
        },
        {
            title: "Occupied Units",
            value: 123,
            color: "#16A34A",
        },
        {
            title: "Active Tenants",
            value: 121,
            color: "#7E00A6",
        },
        {
            title: "Bills to Generate",
            value: 121,
            color: "#FF0080",
        },
        {
            title: "Vacant Units",
            value: 12,
            color: "#F59E0B",
        },
    ];
    const financialPreview = [
        {
            label: "Expected Rent",
            amount: "KES 2,850,000",
        },
        {
            label: "Utility Charges",
            amount: "KES 145,000",
        },
        {
            label: "Total Expected Revenue",
            amount: "KES 2,995,000",
            total: true,
        },
    ];
    const validations = [
        {
            status: "success",
            message: "No duplicate bills found.",
        },
        {
            status: "success",
            message: "All occupied units have assigned tenants.",
        },
        {
            status: "warning",
            message: "2 tenants have incomplete contact details.",
        },
        {
            status: "success",
            message: "Billing configuration is ready.",
        },
    ];
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: "blur(4px)",
                        backgroundColor: "rgba(15,23,42,.35)",
                    },
                },
            }}
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: "28px",
                    overflow: "hidden",

                    bgcolor: "#F8FAFC",

                    border: "1px solid rgba(255,255,255,0.65)",

                    boxShadow:
                        "0 28px 70px rgba(15,23,42,.18)",

                    backdropFilter: "blur(12px)",

                    transition: "all .3s ease",
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 4,
                    py: 3,
                    bgcolor: "#F8FAFC",
                    borderBottom: "1px solid #E2E8F0",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Box
                            sx={{
                                width: 54,
                                height: 54,
                                borderRadius: "16px",
                                display: "grid",
                                placeItems: "center",

                                background: BRAND.gradient,

                                color: "#fff",

                                boxShadow: BRAND.glow,
                            }}
                        >
                            <CalendarMonthRoundedIcon />
                        </Box>

                        <Box>

                            <Typography
                                sx={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 800,
                                    fontSize: "1.2rem",
                                    color: "#0F172A",
                                    letterSpacing: 0.6,
                                }}
                            >
                                Monthly Billing Preview
                            </Typography>

                            <Typography
                                sx={{
                                    fontSize: ".80rem",
                                    color: "#64748B",
                                    mt: .5,
                                    fontFamily: "'Nunito', sans-serif",
                                }}
                            >
                                Review billing information before generating monthly bills.
                            </Typography>

                        </Box>
                    </Box>

                    <IconButton
                        onClick={onClose}
                        sx={{
                            bgcolor: "#F8FAFC",

                            boxShadow:
                                "inset 3px 3px 6px #d1d9e6, inset -3px -3px 6px #ffffff",

                            "&:hover": {
                                color: BRAND.start,
                                bgcolor: "#FFF1F7",
                            }
                        }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <Divider />

            <DialogContent
                sx={{
                    bgcolor: "#F8FAFC",
                    py: 3,
                }}
            >

                <Grid container spacing={3}>

                    {/* Billing Configuration */}
                    <Grid item xs={12} lg={6}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: "22px",
                                bgcolor: "#F8FAFC",
                                boxShadow:
                                    "inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 800,
                                    mb: 3,
                                }}
                            >
                                Billing Configuration
                            </Typography>

                            <Grid container spacing={3}>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Billing Month"
                                        value={config.billingMonth}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                billingMonth: e.target.value,
                                            })
                                        }
                                    >
                                        <MenuItem value="2026-07">July 2026</MenuItem>
                                        <MenuItem value="2026-08">August 2026</MenuItem>
                                        <MenuItem value="2026-09">September 2026</MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Apartment"
                                        value={config.apartment}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                apartment: e.target.value,
                                            })
                                        }
                                    >
                                        <MenuItem value="all">
                                            All Apartments
                                        </MenuItem>

                                        <MenuItem value="A">
                                            Apartment A
                                        </MenuItem>

                                        <MenuItem value="B">
                                            Apartment B
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth
                                        type="date"
                                        label="Due Date"
                                        value={config.dueDate}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                dueDate: e.target.value,
                                            })
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontWeight: 600,
                                                color: "#334155",
                                            },
                                        }}
                                        control={
                                            <Checkbox
                                                sx={{
                                                    color: "#CBD5E1",

                                                    "&.Mui-checked": {
                                                        color: BRAND.start,
                                                    },
                                                }}
                                                checked={config.includeWater}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        includeWater: e.target.checked,
                                                    })
                                                }
                                            />
                                        }
                                        label="Include Water"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontWeight: 600,
                                                color: "#334155",
                                            },
                                        }}
                                        control={
                                            <Checkbox
                                                sx={{
                                                    color: "#CBD5E1",

                                                    "&.Mui-checked": {
                                                        color: BRAND.start,
                                                    },
                                                }}
                                                checked={config.includeElectricity}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        includeElectricity: e.target.checked,
                                                    })
                                                }
                                            />
                                        }
                                        label="Include Electricity"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontWeight: 600,
                                                color: "#334155",
                                            },
                                        }}
                                        control={
                                            <Checkbox
                                                sx={{
                                                    color: "#CBD5E1",

                                                    "&.Mui-checked": {
                                                        color: BRAND.start,
                                                    },
                                                }}
                                                checked={config.includeGarbage}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        includeGarbage: e.target.checked,
                                                    })
                                                }
                                            />
                                        }
                                        label="Include Garbage"
                                    />
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControlLabel
                                        sx={{
                                            "& .MuiFormControlLabel-label": {
                                                fontWeight: 600,
                                                color: "#334155",
                                            },
                                        }}
                                        control={
                                            <Checkbox
                                                sx={{
                                                    color: "#CBD5E1",

                                                    "&.Mui-checked": {
                                                        color: BRAND.start,
                                                    },
                                                }}
                                                checked={config.includeInternet}
                                                onChange={(e) =>
                                                    setConfig({
                                                        ...config,
                                                        includeInternet: e.target.checked,
                                                    })
                                                }
                                            />
                                        }
                                        label="Include Internet"
                                    />
                                </Grid>

                            </Grid>

                        </Box>
                    </Grid>

                    {/* Billing Summary */}
                    <Grid item xs={12} lg={6}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: "22px",
                                bgcolor: "#F8FAFC",
                                boxShadow:
                                    "inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 800,
                                    mb: 3,
                                    color: "#0F172A",
                                }}
                            >
                                Billing Summary
                            </Typography>

                            <Grid container spacing={2}>
                                {summary.map((item) => (
                                    <Grid item xs={12} sm={6} md={4} key={item.title}>
                                        <Box
                                            sx={{
                                                p: 2,
                                                borderRadius: "16px",
                                                background: "#FFFFFF",
                                                textAlign: "center",
                                                border: "1px solid #E2E8F0",
                                                transition: "0.25s ease",

                                                "&:hover": {
                                                    transform: "translateY(-3px)",
                                                    boxShadow:
                                                        "0 12px 24px rgba(15,23,42,0.08)",
                                                },
                                            }}
                                        >
                                            <Typography
                                                sx={{
                                                    fontSize: "0.75rem",
                                                    color: "#64748B",
                                                    mb: 1,
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {item.title}
                                            </Typography>

                                            <Typography
                                                sx={{
                                                    fontFamily: "'Orbitron', sans-serif",
                                                    fontWeight: 800,
                                                    fontSize: "1.5rem",
                                                    color: item.color,
                                                }}
                                            >
                                                {item.value}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    </Grid>

                    {/* Financial Preview */}
                    <Grid item xs={12} lg={6}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: "22px",
                                bgcolor: "#F8FAFC",
                                boxShadow:
                                    "inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 800,
                                    mb: 3,
                                    color: "#0F172A",
                                }}
                            >
                                Financial Preview
                            </Typography>

                            {financialPreview.map((item) => (
                                <Box
                                    key={item.label}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        py: 1.5,
                                        borderBottom: item.total ? "none" : "1px solid #E2E8F0",
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            color: "#475569",
                                            fontWeight: item.total ? 700 : 500,
                                        }}
                                    >
                                        {item.label}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            fontFamily: "'Orbitron', sans-serif",
                                            fontWeight: 800,
                                            color: item.total ? BRAND.start : "#0F172A",
                                        }}
                                    >
                                        {item.amount}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Grid>

                    {/* Validation */}
                    <Grid item xs={12} lg={6}>
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: "22px",
                                bgcolor: "#F8FAFC",
                                boxShadow:
                                    "inset 6px 6px 12px #d1d9e6, inset -6px -6px 12px #ffffff",
                            }}
                        >
                            <Typography
                                sx={{
                                    fontFamily: "'Orbitron', sans-serif",
                                    fontWeight: 800,
                                    mb: 3,
                                    color: "#0F172A",
                                }}
                            >
                                Validation Checks
                            </Typography>

                            <Stack spacing={2}>
                                {validations.map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            p: 1.5,
                                            borderRadius: "12px",
                                            bgcolor: "#FFFFFF",
                                            border: "1px solid #E2E8F0",
                                        }}
                                    >
                                        {item.status === "success" ? (
                                            <CheckCircleRoundedIcon
                                                sx={{ color: "#16A34A" }}
                                            />
                                        ) : (
                                            <WarningAmberRoundedIcon
                                                sx={{ color: "#F59E0B" }}
                                            />
                                        )}

                                        <Typography
                                            sx={{
                                                color: "#334155",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            {item.message}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Grid>
                </Grid>

            </DialogContent>

            <Divider />

            <DialogActions
                sx={{
                    px: 4,
                    py: 3,
                    bgcolor: "#FFFFFF",
                    borderTop: "1px solid #E2E8F0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        px: 3,
                        py: 1,
                        borderRadius: "14px",
                        textTransform: "none",
                        fontWeight: 700,
                        color: "#64748B",

                        "&:hover": {
                            bgcolor: "#F8FAFC",
                        },
                    }}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    onClick={onGenerate}
                    sx={{
                        px: 4,
                        py: 1.3,
                        borderRadius: "16px",
                        textTransform: "none",
                        fontWeight: 700,
                        background: BRAND.gradient,
                        boxShadow: BRAND.glow,

                        "&:hover": {
                            background: BRAND.gradient,
                            transform: "translateY(-2px)",
                            boxShadow: "0 18px 36px rgba(255,0,128,.28)",
                        },
                    }}
                >
                    Generate Bills
                </Button>
            </DialogActions>

        </Dialog>
    );
};

export default MonthlyBillingPreviewDialog;