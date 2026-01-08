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
  TextField,
  MenuItem,
  Grid,
  Button,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { apiService, Trade } from '../services/api';
import { format } from 'date-fns';
export default function Trades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    symbol: '',
    side: '' as 'BUY' | 'SELL' | '',
    fromDate: '',
    toDate: '',
  });
  const fetchTrades = async () => {
    try {
      setLoading(true);
      const data = await apiService.getTradesFiltered({
        symbol: filters.symbol || undefined,
        side: filters.side || undefined,
        fromDate: filters.fromDate || undefined,
        toDate: filters.toDate || undefined,
      });
      setTrades(data);
    } catch (error) {
      console.error('Error fetching trades:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchTrades();
  }, []);
  const handleFilterChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };
  const handleApplyFilters = () => {
    fetchTrades();
  };
  const handleClearFilters = () => {
    setFilters({ symbol: '', side: '', fromDate: '', toDate: '' });
    setTimeout(() => fetchTrades(), 100);
  };
  if (loading && trades.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Executed Trades
      </Typography>
      <Card sx={{ mb: 3, p: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <FilterListIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filters
          </Typography>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Symbol"
              value={filters.symbol}
              onChange={(e) => handleFilterChange('symbol', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">All Symbols</MenuItem>
              <MenuItem value="RELIANCE">RELIANCE</MenuItem>
              <MenuItem value="TCS">TCS</MenuItem>
              <MenuItem value="INFY">INFY</MenuItem>
              <MenuItem value="HDFCBANK">HDFCBANK</MenuItem>
              <MenuItem value="ICICIBANK">ICICIBANK</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Side"
              value={filters.side}
              onChange={(e) => handleFilterChange('side', e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="BUY">BUY</MenuItem>
              <MenuItem value="SELL">SELL</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="From Date"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              label="To Date"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              fullWidth
              size="small"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={2}>
            <Box display="flex" gap={1}>
              <Button variant="contained" onClick={handleApplyFilters} size="small">
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="small"
                startIcon={<ClearIcon />}
              >
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Card>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Trade ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Exchange</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Price
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Total Value
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Executed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No trades found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                trades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {trade.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {trade.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={trade.exchange} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={trade.orderType}
                        size="small"
                        color={trade.orderType === 'BUY' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="right">{trade.quantity}</TableCell>
                    <TableCell align="right">
                      ₹{trade.price.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        ₹{(trade.quantity * trade.price).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {format(new Date(trade.executedAt), 'dd MMM yyyy HH:mm:ss')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}