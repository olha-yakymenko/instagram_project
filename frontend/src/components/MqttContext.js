import React, { createContext, useContext, useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const MqttContext = createContext();

export const MqttProvider = ({ children }) => {
  const [mqttClient, setMqttClient] = useState(null);
  const { addNotification } = useNotifications();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) {
      console.warn('User is not defined. MQTT client will not subscribe.');
      return;
    }
  
    const client = mqtt.connect('ws://localhost:9001');
    setMqttClient(client);

    client.on('connect', () => {
      console.log('MQTT client connected');
      client.subscribe(`user/${user.id}/notifications`);
      client.subscribe(`user/+/notifications`);
      client.subscribe(`user/+/subscribers`)
    });

    client.on('message', (topic, message) => {
      const parsedMessage = JSON.parse(message.toString());
      console.log(`MQTT message received: ${topic}`, parsedMessage);

      if (topic.includes(`user/${user.id}`)) {
        console.log("mq", parsedMessage)
        addNotification({
          id: parsedMessage.id,
          contentText: parsedMessage.contentText,
          type: parsedMessage.type, 
          postId: parsedMessage.postId || 0,
        });
      }
    });

    return () => {
      client.end();
    };
  }, [addNotification, user]);
  return (
    <MqttContext.Provider value={{ mqttClient }}>
      {children}
    </MqttContext.Provider>
  );
};

export const useMqtt = () => useContext(MqttContext);
