import { useState } from 'react';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate, useLocation } from 'react-router-dom';
const drawerWidth = 250;
interface LayoutProps {
  children: React.ReactNode;
}
const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Instruments', icon: <TrendingUpIcon />, path: '/instruments' },
  { text: 'Orders', icon: <ShoppingCartIcon />, path: '/orders' },
  { text: 'Trades', icon: <ReceiptIcon />, path: '/trades' },
  { text: 'Portfolio', icon: <AccountBalanceWalletIcon />, path: '/portfolio' },
];
export default function Layout({ children }: LayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const drawer = (
    <Box sx={{ height: '100%', backgroundColor: '#FFFFFF', borderRight: '1px solid rgba(0,0,0,0.08)' }}>
      <Toolbar
        sx={{
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          borderBottom: '1px solid rgba(0,0,0,0.05)',
        }}
      >
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
          Bajaj Broking
        </Typography>
      </Toolbar>
      <List sx={{ py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ px: 1 }}>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) {
                  setMobileOpen(false);
                }
              }}
              sx={{
                borderRadius: 8,
                px: 2,
                my: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255, 107, 53, 0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'white' : 'inherit',
                  minWidth: 36,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontWeight: location.pathname === item.path ? 600 : 500 }}
                primary={item.text}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: '#FFFFFF',
          color: theme.palette.text.primary,
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
            Trading Platform
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          backgroundColor: theme.palette.background.default,
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}