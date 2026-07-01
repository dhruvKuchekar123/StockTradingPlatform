import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Box, Typography, Avatar, Container, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton, Snackbar, Alert, Skeleton, Stack, Divider 
} from "@mui/material";
import { motion } from "framer-motion";
import LockIcon from "@mui/icons-material/Lock";
import ShareIcon from "@mui/icons-material/Share";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import axios from "axios";
import PrivacyToggle from "../components/PrivacyToggle";
import { DoughnutChart } from "../components/DoughnoutChart";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3002";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
};

const PortfolioPage = () => {
  const { username } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [shareSnackbar, setShareSnackbar] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/api/portfolio/${username}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        
        setData(res.data.portfolio);
        
        // Determine if viewer is owner by checking if we have token and checking response
        // We know they are owner if they can toggle (a bit of a heuristic, but works if we just let the backend handle auth for the toggle)
        // A better way is to decode JWT or hit a /me endpoint. We'll decode JWT simply or just assume if they hit their own username.
        if (token) {
           try {
             // We can check if username matches the logged in user's username if we stored it, 
             // but we'll just show the toggle and let backend protect it. 
             // For better UX, we'll try to fetch profile or parse token.
             // We'll set isOwner true if we have a token, and the toggle will fail gracefully if they aren't owner.
             // But let's fetch profile to be sure
             const profileRes = await axios.get(`${API_URL}/api/user/profile`, {
               headers: { Authorization: `Bearer ${token}` }
             });
             if (profileRes.data.username === username) {
               setIsOwner(true);
             }
           } catch(e) {}
        }

      } catch (err) {
        if (err.response && err.response.status === 403) {
          setError(403);
        } else {
          setError(500);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [username]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareSnackbar(true);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box display="flex" alignItems="center" gap={3} mb={6}>
          <Skeleton variant="circular" width={100} height={100} />
          <Box>
            <Skeleton variant="text" width={200} height={60} />
            <Skeleton variant="text" width={150} />
          </Box>
        </Box>
        <Grid container spacing={3}>
          {[1,2,3,4].map(i => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error === 403) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <LockIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>Private Portfolio</Typography>
          <Typography color="text.secondary">This portfolio is private. Only the owner can view these details.</Typography>
        </motion.div>
      </Container>
    );
  }

  if (error || !data) {
    return <Typography textAlign="center" mt={10}>Failed to load portfolio.</Typography>;
  }

  const { joinedDate, isPublic, totalInvested, currentValue, totalPnL, pnlPercent, topHoldings, sectorBreakdown, recentOrders } = data;
  const isPositive = totalPnL >= 0;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: i => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } })
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      
      {/* HERO SECTION */}
      <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" mb={6} gap={3}>
        <Box display="flex" alignItems="center" gap={3}>
          <Avatar sx={{ width: 100, height: 100, fontSize: 40, bgcolor: 'primary.main' }}>
            {username.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h3" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {username}
              {isPublic && (
                <IconButton onClick={handleShare} size="small" color="primary">
                  <ShareIcon />
                </IconButton>
              )}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Joined {new Date(joinedDate).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>
        
        <Box>
          {isOwner && (
            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <PrivacyToggle 
                isPublicInitial={isPublic} 
                onToggle={(newVal) => setData({...data, isPublic: newVal})}
              />
            </Paper>
          )}
        </Box>
      </Box>

      {/* SUMMARY CARDS */}
      <Grid container spacing={3} mb={6}>
        {[
          { title: "Total Invested", value: formatCurrency(totalInvested), color: 'text.primary' },
          { title: "Current Value", value: formatCurrency(currentValue), color: 'text.primary' },
          { title: "Total P&L", value: formatCurrency(Math.abs(totalPnL)), color: isPositive ? 'success.main' : 'error.main', prefix: isPositive ? '+' : '-' },
          { title: "P&L %", value: `${Math.abs(pnlPercent).toFixed(2)}%`, color: isPositive ? 'success.main' : 'error.main', icon: isPositive ? <ArrowUpwardIcon fontSize="small"/> : <ArrowDownwardIcon fontSize="small"/> }
        ].map((card, i) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <motion.div custom={i} initial="hidden" animate="visible" variants={cardVariants}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 3, borderLeft: `4px solid`, borderColor: card.color === 'text.primary' ? 'primary.main' : card.color }}>
                <Typography color="text.secondary" variant="overline">{card.title}</Typography>
                <Typography variant="h5" fontWeight="bold" color={card.color} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {card.prefix}{card.value} {card.icon}
                </Typography>
              </Paper>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* CHART & TOP HOLDINGS */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Portfolio Breakdown</Typography>
            <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems="center" gap={4}>
              <Box sx={{ width: { xs: '100%', md: '50%' }, maxWidth: 300 }}>
                <DoughnutChart data={sectorBreakdown} />
              </Box>
              <Box sx={{ width: { xs: '100%', md: '50%' } }}>
                <Typography variant="subtitle2" color="text.secondary" mb={2}>Top 5 Holdings</Typography>
                {topHoldings.map(h => (
                  <Box key={h.name} display="flex" justifyContent="space-between" mb={1.5}>
                    <Typography fontWeight="bold">{h.name}</Typography>
                    <Typography>{formatCurrency(h.currentValue)}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 3, overflowX: 'auto' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Detailed Top Holdings</Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Avg Cost</TableCell>
                    <TableCell align="right">LTP</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell align="right">P&L</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topHoldings.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell fontWeight="bold">{row.name}</TableCell>
                      <TableCell align="right">{row.qty}</TableCell>
                      <TableCell align="right">{formatCurrency(row.avg)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.price)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.currentValue)}</TableCell>
                      <TableCell align="right" sx={{ color: row.pnl >= 0 ? 'success.main' : 'error.main' }}>
                        {row.pnl >= 0 ? '+' : '-'}{formatCurrency(Math.abs(row.pnl))}
                        <Typography variant="caption" display="block">
                           ({row.pnlPercent.toFixed(2)}%)
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                  {topHoldings.length === 0 && (
                    <TableRow><TableCell colSpan={6} align="center">No holdings found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* TIMELINE / RECENT ORDERS */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>Recent Orders</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {recentOrders.map((order, i) => (
                <motion.div key={i} custom={i} initial="hidden" animate="visible" variants={cardVariants}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip 
                      label={order.mode} 
                      size="small" 
                      color={order.mode === 'BUY' ? 'success' : 'error'} 
                      sx={{ fontWeight: 'bold', minWidth: 60 }} 
                    />
                    <Box flexGrow={1}>
                      <Typography fontWeight="bold">{order.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {order.qty} @ {formatCurrency(order.price)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(order.date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </motion.div>
              ))}
              {recentOrders.length === 0 && (
                <Typography color="text.secondary" textAlign="center">No recent orders.</Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar 
        open={shareSnackbar} 
        autoHideDuration={3000} 
        onClose={() => setShareSnackbar(false)}
        message="Link copied to clipboard!"
      />
    </Container>
  );
};

export default PortfolioPage;
