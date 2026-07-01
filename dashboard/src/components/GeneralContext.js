import React, { useState } from "react";
import OrderActionWindow from "./OrderActionWindow";
import ChartModal from "./ChartModal";

const GeneralContext = React.createContext({
  openOrderWindow: (uid, mode) => {},
  closeOrderWindow: () => {},
  openChartModal: (symbol) => {},
  closeChartModal: () => {},
  chartSymbol: null,
  selectedStock: "RELIANCE",
  selectStock: (symbol) => {},
});

export const GeneralContextProvider = (props) => {
  const [isOrderWindowOpen, setIsOrderWindowOpen] = useState(false);
  const [selectedStockUID, setSelectedStockUID] = useState("");
  const [orderMode, setOrderMode] = useState("BUY");

  const [chartSymbol, setChartSymbol] = useState(null);
  const [selectedStock, setSelectedStock] = useState("RELIANCE");

  const handleOpenOrderWindow = (uid, mode) => {
    setIsOrderWindowOpen(true);
    setSelectedStockUID(uid);
    setOrderMode(mode || "BUY");
  };

  const handleCloseOrderWindow = () => {
    setIsOrderWindowOpen(false);
    setSelectedStockUID("");
  };

  const handleOpenChartModal = (symbol) => {
    setChartSymbol(symbol);
  };

  const handleCloseChartModal = () => {
    setChartSymbol(null);
  };

  return (
    <GeneralContext.Provider
      value={{
        openOrderWindow: handleOpenOrderWindow,
        closeOrderWindow: handleCloseOrderWindow,
        openChartModal: handleOpenChartModal,
        closeChartModal: handleCloseChartModal,
        chartSymbol,
        selectedStock,
        selectStock: setSelectedStock,
      }}
    >
      {props.children}

      {/* Order Action Window Modal */}
      {isOrderWindowOpen && (
        <>
          <div className="modal-backdrop" onClick={handleCloseOrderWindow} />
          <OrderActionWindow uid={selectedStockUID} mode={orderMode} />
        </>
      )}

      {/* Chart Modal */}
      <ChartModal />
    </GeneralContext.Provider>
  );
};

export default GeneralContext;
