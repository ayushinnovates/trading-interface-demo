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
  Chip,
  Card,
  Alert,
  IconButton,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { apiService, Instrument } from '../services/api';
export default function Instruments() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const fetchInstruments = async () => {
    try {
      setRefreshing(true);
      const data = await apiService.getInstruments();
      setInstruments(data);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching instruments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  useEffect(() => {
    fetchInstruments();
    const interval = setInterval(fetchInstruments, 60000);
    return () => clearInterval(interval);
  }, []);
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  const hasRealData = instruments.some(inst => inst.change !== undefined);
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Available Instruments
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {lastUpdate && (
            <Typography variant="caption" color="textSecondary">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </Typography>
          )}
          <IconButton
            onClick={fetchInstruments}
            disabled={refreshing}
            color="primary"
            title="Refresh prices"
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      {hasRealData && (
        <Alert severity="info" sx={{ mb: 2 }}>
           Real-time market data enabled - Prices update automatically from live market
        </Alert>
      )}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Exchange</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Last Traded Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Change
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Volume
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {instruments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="textSecondary">No instruments available</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                instruments.map((instrument) => {
                  const isPositive = (instrument.change || 0) >= 0;
                  const changePercent = instrument.changePercent || 0;
                  return (
                    <TableRow key={`${instrument.symbol}-${instrument.exchange}`} hover>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {instrument.symbol}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={instrument.exchange} size="small" color="primary" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={instrument.instrumentType}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          ₹{instrument.lastTradedPrice.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {instrument.change !== undefined ? (
                          <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.5}>
                            {isPositive ? (
                              <TrendingUpIcon sx={{ color: 'success.main', fontSize: 18 }} />
                            ) : (
                              <TrendingDownIcon sx={{ color: 'error.main', fontSize: 18 }} />
                            )}
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: isPositive ? 'success.main' : 'error.main',
                              }}
                            >
                              {isPositive ? '+' : ''}
                              {changePercent.toFixed(2)}%
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {instrument.volume ? (
                          <Typography variant="body2" color="textSecondary">
                            {instrument.volume.toLocaleString('en-IN')}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
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