import React, { useState } from "react";
import { Tabs, Tab } from "@mui/material";
import OpenOrders from "./OpenOrders";
import OrderHistory from "./OrderHistory";

const Orders = () => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <div className="orders-container p-6">
      <h2 className="text-white mb-6">Orders Manager</h2>
      
      <Tabs 
        value={tabIndex} 
        onChange={handleTabChange} 
        textColor="inherit" 
        indicatorColor="primary" 
        className="mb-6"
        sx={{ color: '#fff', '& .MuiTab-root': { color: '#aaa' }, '& .Mui-selected': { color: '#fff' } }}
      >
        <Tab label="Open Orders" />
        <Tab label="Order History" />
      </Tabs>

      {tabIndex === 0 && <OpenOrders />}
      {tabIndex === 1 && <OrderHistory />}
    </div>
  );
};

export default Orders;
