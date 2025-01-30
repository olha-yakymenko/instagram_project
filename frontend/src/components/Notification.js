import React, { useState, useEffect } from 'react';
import { useNotifications } from './NotificationContext';
import api from '../services/api';
import { useAuth } from './AuthContext';
import './CSS/Notification.css'

const Notifications = () => {
  const { notifications: contextNotifications } = useNotifications();
  const [dbNotifications, setDbNotifications] = useState([]); 
  const { user } = useAuth();
  if (user.id=='underfined'){
    console.log("nieznaleziono uzytkownika")
  }
  useEffect(() => {    
    const fetchNotificationsFromDb = async () => {
      try {
        const response = await api.get(`/notifications/${user.id}`);
        setDbNotifications(response.data); 
      } catch (error) {
        console.error('Error fetching notifications from DB:', error);
      }
    };

    fetchNotificationsFromDb();
  }, [user.id]);

  const allNotifications = [...dbNotifications, ...contextNotifications];

  return (
    <div className="notifications">
      <h3>Notifications</h3>
      {allNotifications.length > 0 ? (
        allNotifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification ${notification.type}`}
            style={{
              animation: 'slideIn 1s', 
            }}
          >
            <p>{notification.content}</p>
          </div>
        ))
      ) : (
        <p>No new notifications.</p>
      )}
    </div>
  );
};

export default Notifications;
