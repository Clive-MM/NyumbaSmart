import React, { useState } from "react";
import {
    Box,
    Typography,
    Grid,
    Card,
    CardHeader,
    CardContent,
    Avatar,
    IconButton,
    Collapse,
    CardActions,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import PaymentsIcon from "@mui/icons-material/Payments";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { styled } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { motion } from "framer-motion";

const ExpandMore = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
})(({ theme, expand }) => ({
    marginLeft: "auto",
    transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
    transition: theme.transitions.create("transform", {
        duration: theme.transitions.duration.shortest,
    }),
}));

const features = [
    {
        icon: <PeopleIcon fontSize="large" color="primary" />,
        title: "Tenant & Unit Management",
        description:
            "Assign tenants to units, manage lease info, and handle vacate or transfer notices with ease.",
    },
    {
        icon: <PaymentsIcon fontSize="large" color="success" />,
        title: "Rent & Billing",
        description:
            "Track rent payments, manage utility bills, and send tenants monthly summaries via SMS.",
    },
    {
        icon: <AssessmentIcon fontSize="large" color="warning" />,
        title: "Reporting & Analytics",
        description:
            "View real-time income reports, track expenses, and export summaries for KRA tax filing.",
    },
    {
        icon: <NotificationsActiveIcon fontSize="large" color="error" />,
        title: "Accessibility & Notifications",
        description:
            "Access the system on mobile and notify tenants automatically via SMS or email.",
    },
];

const FeaturesSection = () => {
    const [expanded, setExpanded] = useState(null);

    const handleExpandClick = (index) => {
        setExpanded(expanded === index ? null : index);
    };

    return (
        <Box sx={{ py: 8, px: 2, backgroundColor: "#f9f9f9" }}>
            <Typography
                variant="h4"
                align="center"
                gutterBottom
                sx={{ fontWeight: "bold", textTransform: "uppercase" }}
            >
                Key Features of PayNest
            </Typography>
            <Typography
                variant="subtitle1"
                align="center"
                sx={{ maxWidth: 700, mx: "auto", mb: 6 }}
            >
                Manage your rental properties efficiently — everything in one place.
            </Typography>

            <Grid container spacing={4} justifyContent="center">
                {features.map((feature, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                        >
                            <Card sx={{ maxWidth: 345, mx: "auto" }}>
                                <CardHeader
                                    avatar={
                                        <Avatar sx={{ bgcolor: red[500] }} aria-label="feature">
                                            {feature.title.charAt(0)}
                                        </Avatar>
                                    }
                                    action={
                                        <IconButton aria-label="settings">
                                            <MoreVertIcon />
                                        </IconButton>
                                    }
                                    title={feature.title}
                                />

                                <CardContent>
                                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                        {feature.description}
                                    </Typography>
                                </CardContent>
                                <CardActions disableSpacing>
                                    <IconButton aria-label="add to favorites">
                                        <FavoriteIcon />
                                    </IconButton>
                                    <IconButton aria-label="share">
                                        <ShareIcon />
                                    </IconButton>
                                    <ExpandMore
                                        expand={expanded === index}
                                        onClick={() => handleExpandClick(index)}
                                        aria-expanded={expanded === index}
                                        aria-label="show more"
                                    >
                                        <ExpandMoreIcon />
                                    </ExpandMore>
                                </CardActions>
                                <Collapse in={expanded === index} timeout="auto" unmountOnExit>
                                    <CardContent>
                                        <Typography paragraph>More Info:</Typography>
                                        <Typography paragraph>
                                            Detailed walkthroughs or use-case examples for: {feature.title}.
                                        </Typography>
                                    </CardContent>
                                </Collapse>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FeaturesSection;