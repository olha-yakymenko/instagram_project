import React from 'react';
import { useNotifications } from './NotificationContext';
import './CSS/NotificationList.css';

const NotificationList = () => {
  const { notifications } = useNotifications();
  return (
    <div className="notification-container">
      {notifications.map((notification) => {
        return (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
          >
            <p>{notification.contentText}</p>
          </div>
        )
      })}
    </div>
  );
};

export default NotificationList;
