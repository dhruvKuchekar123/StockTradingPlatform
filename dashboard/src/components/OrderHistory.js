import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Table, TableBody, TableCell, TableHead, TableRow, 
  TablePagination, TextField, MenuItem, Button 
} from "@mui/material";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0); // MUI uses 0-indexed page
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterSide, setFilterSide] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');

  const fetchHistory = async () => {
    try {
      // Backend uses 1-indexed page
      const res = await axios.get(`http://localhost:3002/api/orders/history`, {
        params: {
          page: page + 1,
          limit: rowsPerPage,
          symbol: filterSymbol,
          side: filterSide,
          type: filterType
        },
        withCredentials: true
      });
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalRecords(res.data.totalRecords);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, rowsPerPage, filterSymbol, filterSide, filterType]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return;
    
    const headers = "Symbol,Type,Side,Qty,Executed Price,Status,Date\n";
    const rows = orders.map(o => 
      `${o.symbol},${o.orderType},${o.side},${o.qty},${o.executedPrice || 0},${o.status},${new Date(o.placedAt).toLocaleString()}`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order_history_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white/5 rounded-lg border border-white/10 p-4 mt-4 text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="m-0">Order History</h3>
        <Button variant="outlined" color="primary" onClick={handleExportCSV}>Export CSV</Button>
      </div>

      <div className="flex gap-4 mb-4">
        <TextField 
          label="Search Symbol" 
          size="small" 
          value={filterSymbol}
          onChange={e => setFilterSymbol(e.target.value)}
          InputLabelProps={{ style: { color: '#ccc' } }} 
          InputProps={{ style: { color: '#fff' } }}
        />
        <TextField
          select
          label="Side"
          size="small"
          value={filterSide}
          onChange={e => setFilterSide(e.target.value)}
          InputLabelProps={{ style: { color: '#ccc' } }} 
          InputProps={{ style: { color: '#fff' } }}
          sx={{ minWidth: 100 }}
        >
          <MenuItem value="ALL">ALL</MenuItem>
          <MenuItem value="BUY">BUY</MenuItem>
          <MenuItem value="SELL">SELL</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          size="small"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          InputLabelProps={{ style: { color: '#ccc' } }} 
          InputProps={{ style: { color: '#fff' } }}
          sx={{ minWidth: 120 }}
        >
          <MenuItem value="ALL">ALL</MenuItem>
          <MenuItem value="MARKET">MARKET</MenuItem>
          <MenuItem value="LIMIT">LIMIT</MenuItem>
          <MenuItem value="SL">SL</MenuItem>
          <MenuItem value="GTT">GTT</MenuItem>
        </TextField>
      </div>

      <Table sx={{ minWidth: 650 }} aria-label="history table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: '#ccc' }}>Symbol</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Type</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Side</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Qty</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Executed Price</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Total</TableCell>
            <TableCell sx={{ color: '#ccc' }}>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order._id}>
              <TableCell sx={{ color: '#fff' }}>{order.symbol}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{order.orderType}</TableCell>
              <TableCell sx={{ color: order.side === 'BUY' ? '#0052fe' : '#ff4d4d' }}>{order.side}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{order.qty}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{order.executedPrice ? `₹${order.executedPrice}` : '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{order.executedPrice ? `₹${(order.executedPrice * order.qty).toFixed(2)}` : '-'}</TableCell>
              <TableCell sx={{ color: '#fff' }}>{new Date(order.executedAt || order.placedAt).toLocaleString()}</TableCell>
            </TableRow>
          ))}
          {orders.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ color: '#888' }}>No records found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      <TablePagination
        component="div"
        count={totalRecords}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{ color: '#fff' }}
      />
    </div>
  );
};

export default OrderHistory;
