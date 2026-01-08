import { useEffect, useState } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import WalletIcon from '@mui/icons-material/Wallet';
import { apiService, PortfolioHolding } from '../services/api';
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}
function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2" sx={{ fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: '12px',
              width: 56,
              height: 56,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInstruments: 0,
    totalOrders: 0,
    totalTrades: 0,
    portfolioValue: 0,
    availableBalance: 0,
  });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [instruments, orders, trades, portfolio, wallet] = await Promise.all([
          apiService.getInstruments(),
          apiService.getOrders(),
          apiService.getTrades(),
          apiService.getPortfolio(),
          apiService.getWallet().catch(() => ({ availableBalance: 0, totalInvested: 0 })),
        ]);
        const portfolioValue = portfolio.reduce(
          (sum: number, holding: PortfolioHolding) => sum + holding.currentValue,
          0
        );
        setStats({
          totalInstruments: instruments.length,
          totalOrders: orders.length,
          totalTrades: trades.length,
          portfolioValue,
          availableBalance: wallet.availableBalance || 0,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Available Balance"
            value={`₹${stats.availableBalance.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<WalletIcon />}
            color="#FF6B35"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Instruments"
            value={stats.totalInstruments}
            icon={<TrendingUpIcon />}
            color="#004E89"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<ShoppingCartIcon />}
            color="#9B59B6"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Executed Trades"
            value={stats.totalTrades}
            icon={<ReceiptIcon />}
            color="#00A86B"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Portfolio Value"
            value={`₹${stats.portfolioValue.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`}
            icon={<AccountBalanceWalletIcon />}
            color="#E67E22"
          />
        </Grid>
      </Grid>
    </Box>
  );
}