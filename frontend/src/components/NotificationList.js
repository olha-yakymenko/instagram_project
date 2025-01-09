import React from 'react';
import { useNotifications } from './NotificationContext';
import './CSS/NotificationList.css';

const NotificationList = () => {
  const { notifications } = useNotifications();
  return (
    <div className="notification-container">
      {notifications.map((notification, index) => {
        return (
          <div
            key={notification.id || index}
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
