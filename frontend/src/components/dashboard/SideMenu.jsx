import React from "react";
import {
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,

} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import HomeIcon from "@mui/icons-material/Home";
import SettingsIcon from "@mui/icons-material/Settings";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AssessmentIcon from "@mui/icons-material/Assessment"; // Reports
import HistoryIcon from "@mui/icons-material/History"; // Logs / History
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"; // Expenses
import { styled } from "@mui/material/styles";

const NeumorphicBox = styled(Box)({
    width: 240,
    padding: "1rem",
    marginTop: "64px",
    minHeight: "calc(100vh - 64px)",
    background: "rgba(255, 255, 255, 0.25)",
    backdropFilter: "blur(10px)",
    borderRadius: "0 20px 20px 0",
    boxShadow: "8px 8px 16px #bebebe, -8px -8px 16px #ffffff",
    borderRight: "1px solid rgba(255, 255, 255, 0.3)",
    transition: "all 0.3s ease-in-out",
});

const NeumorphicListItemButton = styled(ListItemButton)({
    borderRadius: "10px",
    padding: "10px 14px",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
        backgroundColor: "rgba(69, 107, 188, 0.1)",
        transform: "scale(1.03)",
        boxShadow: "inset 4px 4px 6px #bebebe, inset -4px -4px 6px #ffffff",
    },
});

function SideMenu() {
    const menuItems = [
        { text: "Dashboard", icon: <DashboardIcon /> },
        { text: "Properties", icon: <HomeIcon /> },
        { text: "Tenants", icon: <PeopleIcon /> },
        { text: "Billing", icon: <ReceiptIcon /> },
        { text: "Payments", icon: <PaymentIcon /> },
        { text: "Expenses", icon: <AttachMoneyIcon /> },
        { text: "Reports", icon: <AssessmentIcon /> },
        { text: "Logs / History", icon: <HistoryIcon /> },
        { text: "Notifications", icon: <NotificationsIcon /> },
        { text: "Settings", icon: <SettingsIcon /> },
    ];

    return (
        <NeumorphicBox>
            <List>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                        <NeumorphicListItemButton>
                            <ListItemIcon sx={{ color: "#456BBC", minWidth: 40 }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    fontSize: "0.95rem",
                                    fontWeight: 500,
                                    color: "#333",
                                }}
                            />
                        </NeumorphicListItemButton>
                    </ListItem>
                ))}
            </List>
        </NeumorphicBox>
    );
}

export default SideMenu;
