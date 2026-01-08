import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Card,
  Chip,
  Grid,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { apiService, PortfolioHolding } from '../services/api';
export default function Portfolio() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const data = await apiService.getPortfolio();
        setHoldings(data);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 10000);
    return () => clearInterval(interval);
  }, []);
  const totalValue = holdings.reduce((sum, holding) => sum + holding.currentValue, 0);
  const totalInvested = holdings.reduce(
    (sum, holding) => sum + holding.quantity * (holding.averageBuyPrice || holding.averagePrice),
    0
  );
  const totalRealizedPnL = holdings.reduce((sum, holding) => sum + (holding.realizedPnL || 0), 0);
  const totalUnrealizedPnL = holdings.reduce((sum, holding) => sum + (holding.unrealizedPnL || 0), 0);
  const totalPnL = totalRealizedPnL + totalUnrealizedPnL;
  const totalPnLPercent = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Portfolio Holdings
      </Typography>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Total Portfolio Value
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  ₹{totalValue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Total Invested
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  ₹{totalInvested.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Realized P&L
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 600,
                    color: totalRealizedPnL >= 0 ? 'success.main' : 'error.main',
                  }}
                >
                  ₹{totalRealizedPnL.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </Typography>
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <Box sx={{ p: 3 }}>
                <Typography color="textSecondary" variant="body2" gutterBottom>
                  Unrealized P&L
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {totalUnrealizedPnL >= 0 ? (
                    <TrendingUpIcon color="success" />
                  ) : (
                    <TrendingDownIcon color="error" />
                  )}
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 600,
                      color: totalUnrealizedPnL >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    ₹{totalUnrealizedPnL.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Typography>
                  <Chip
                    label={`${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`}
                    color={totalPnL >= 0 ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Avg Buy Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Current Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Current Value
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Realized P&L
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Unrealized P&L
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Total P&L
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holdings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No holdings found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                holdings.map((holding) => {
                  const unrealizedPnL = holding.unrealizedPnL || 0;
                  const realizedPnL = holding.realizedPnL || 0;
                  const totalPnL = holding.totalPnL || (realizedPnL + unrealizedPnL);
                  const unrealizedPnLPercent = holding.unrealizedPnLPercent || 0;
                  return (
                    <TableRow key={holding.symbol} hover>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {holding.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{holding.quantity}</TableCell>
                      <TableCell align="right">
                        ₹{(holding.averageBuyPrice || holding.averagePrice).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ₹{(holding.currentMarketPrice || holding.currentValue / holding.quantity).toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ₹{holding.currentValue.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            color: realizedPnL >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {realizedPnL >= 0 ? '+' : ''}
                          ₹{realizedPnL.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                          {unrealizedPnL >= 0 ? (
                            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                          ) : (
                            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 18 }} />
                          )}
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: unrealizedPnL >= 0 ? 'success.main' : 'error.main',
                            }}
                          >
                            {unrealizedPnL >= 0 ? '+' : ''}
                            ₹{unrealizedPnL.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </Typography>
                          <Chip
                            label={`${unrealizedPnLPercent >= 0 ? '+' : ''}${unrealizedPnLPercent.toFixed(2)}%`}
                            color={unrealizedPnL >= 0 ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 700,
                            color: totalPnL >= 0 ? 'success.main' : 'error.main',
                          }}
                        >
                          {totalPnL >= 0 ? '+' : ''}
                          ₹{totalPnL.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}