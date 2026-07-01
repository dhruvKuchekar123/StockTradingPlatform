import React from "react";
import OrderActionWindow from "./OrderActionWindow";

const BuyActionWindow = ({ uid }) => {
  // Delegate entirely to the unified OrderActionWindow
  return <OrderActionWindow uid={uid} mode="BUY" />;
};

export default BuyActionWindow;