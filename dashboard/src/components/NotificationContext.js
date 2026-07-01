import React, { createContext, useState, useCallback, useContext } from "react";

const NotificationContext = createContext({
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAllRead: () => {},
  clearAll: () => {},
});

export const NotificationContextProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notif) => {
    const newNotif = {
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      read: false,
      ...notif,
    };
    setNotifications((prev) => [newNotif, ...prev].slice(0, 50)); // Keep max 50
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true }))
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, addNotification, markAllRead, clearAll }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
