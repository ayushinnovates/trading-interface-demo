import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import { apiService, Order, Instrument } from '../services/api';
import { format } from 'date-fns';
export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderForm, setOrderForm] = useState({
    symbol: '',
    exchange: 'NSE',
    orderType: 'BUY' as 'BUY' | 'SELL',
    orderStyle: 'MARKET' as 'MARKET' | 'LIMIT',
    quantity: '',
    price: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersData, instrumentsData] = await Promise.all([
          apiService.getOrders(),
          apiService.getInstruments(),
        ]);
        setOrders(ordersData);
        setInstruments(instrumentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        symbol: orderForm.symbol,
        exchange: orderForm.exchange,
        orderType: orderForm.orderType,
        orderStyle: orderForm.orderStyle,
        quantity: parseInt(orderForm.quantity),
        price: orderForm.orderStyle === 'LIMIT' ? parseFloat(orderForm.price) : undefined,
      };
      await apiService.placeOrder(orderData);
      const updatedOrders = await apiService.getOrders();
      setOrders(updatedOrders);
      setOpenDialog(false);
      setOrderForm({
        symbol: '',
        exchange: 'NSE',
        orderType: 'BUY',
        orderStyle: 'MARKET',
        quantity: '',
        price: '',
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXECUTED':
        return 'success';
      case 'PARTIALLY_EXECUTED':
        return 'warning';
      case 'PLACED':
        return 'info';
      case 'CANCELLED':
        return 'error';
      default:
        return 'warning';
    }
  };
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }
    try {
      await apiService.cancelOrder(orderId);
      const updatedOrders = await apiService.getOrders();
      setOrders(updatedOrders);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };
  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await apiService.getOrder(orderId);
      setSelectedOrder(order);
      setOpenDialog(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Orders
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedOrder(null);
            setOpenDialog(true);
          }}
        >
          Place Order
        </Button>
      </Box>
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Symbol</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Style</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Quantity
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Price
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Executed
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  Remaining
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography color="textSecondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {order.id.substring(0, 8)}...
                      </Typography>
                    </TableCell>
                    <TableCell>{order.symbol}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.orderType}
                        size="small"
                        color={order.orderType === 'BUY' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell>{order.orderStyle}</TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right">
                      {order.price
                        ? `₹${order.price.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        size="small"
                        color={getStatusColor(order.status) as any}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {order.executedQuantity || 0} / {order.quantity}
                    </TableCell>
                    <TableCell align="right">
                      {order.remainingQuantity !== undefined ? order.remainingQuantity : order.quantity - (order.executedQuantity || 0)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {(order.status === 'NEW' || order.status === 'PLACED' || order.status === 'PARTIALLY_EXECUTED') && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleCancelOrder(order.id)}
                            title="Cancel order"
                          >
                            <CancelIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
          }
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15), rgba(0, 78, 137, 0.15))',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            fontWeight: 600,
            py: 2.5,
          }}
        >
          {selectedOrder ? 'Order Details' : 'Place New Order'}
        </DialogTitle>
        <DialogContent
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            py: 3,
          }}
        >
          {selectedOrder ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="textSecondary">
                Order ID: {selectedOrder.id}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Status: {selectedOrder.status}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Executed Price: {selectedOrder.executedPrice || 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Executed Quantity: {selectedOrder.executedQuantity || 0}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <TextField
                select
                label="Symbol"
                value={orderForm.symbol}
                onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value })}
                fullWidth
              >
                {instruments.map((inst) => (
                  <MenuItem key={inst.symbol} value={inst.symbol}>
                    {inst.symbol} ({inst.exchange})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Exchange"
                value={orderForm.exchange}
                onChange={(e) => setOrderForm({ ...orderForm, exchange: e.target.value })}
                fullWidth
              >
                <MenuItem value="NSE">NSE</MenuItem>
                <MenuItem value="BSE">BSE</MenuItem>
              </TextField>
              <TextField
                select
                label="Order Type"
                value={orderForm.orderType}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, orderType: e.target.value as 'BUY' | 'SELL' })
                }
                fullWidth
              >
                <MenuItem value="BUY">BUY</MenuItem>
                <MenuItem value="SELL">SELL</MenuItem>
              </TextField>
              <TextField
                select
                label="Order Style"
                value={orderForm.orderStyle}
                onChange={(e) =>
                  setOrderForm({ ...orderForm, orderStyle: e.target.value as 'MARKET' | 'LIMIT' })
                }
                fullWidth
              >
                <MenuItem value="MARKET">MARKET</MenuItem>
                <MenuItem value="LIMIT">LIMIT</MenuItem>
              </TextField>
              <TextField
                label="Quantity"
                type="number"
                value={orderForm.quantity}
                onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                fullWidth
                inputProps={{ min: 1 }}
              />
              {orderForm.orderStyle === 'LIMIT' && (
                <TextField
                  label="Price"
                  type="number"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                  fullWidth
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          {!selectedOrder && (
            <Button
              variant="contained"
              onClick={handlePlaceOrder}
              disabled={
                !orderForm.symbol ||
                !orderForm.quantity ||
                (orderForm.orderStyle === 'LIMIT' && !orderForm.price)
              }
              sx={{
                background: 'linear-gradient(135deg, #FF6B35, #FF8C5A)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #E55A2B, #FF6B35)',
                },
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)',
              }}
            >
              Place Order
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}