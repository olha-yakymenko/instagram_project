import React, { useEffect, useState } from 'react';
import Post from '../components/Post';
import axios from '../services/api';
import mqtt from 'mqtt';
import './CSS/Home.css'


const Home = () => {
    const [posts, setPosts] = useState([]);
    const [currentAd, setCurrentAd] = useState(null);
    const [mqttClient, setMqttClient] = useState(null);
    const [sseConnection, setSseConnection] = useState(null); 

    const setupSSE = () => {
        if (sseConnection) {
            sseConnection.close(); 
        }

        const eventSource = new EventSource('https://localhost:5007/api/ads/ads-stream');

        eventSource.onmessage = (event) => {
            const ad = JSON.parse(event.data);
            console.log("AD", ad);
            setCurrentAd(ad); 
        };

        eventSource.onerror = () => {
            console.error('Połączenie SSE zakończyło się błędem');
            eventSource.close();
        };

        setSseConnection(eventSource);
    };

    const fetchPosts = async () => {
        try {
            const { data } = await axios.get('/posts');
            setPosts(data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const setupMqtt = () => {
        const client = mqtt.connect('ws://localhost:9001'); 

        client.on('connect', () => {
            console.log('MQTT client connected');
            client.subscribe('new-posts', (err) => {
                if (err) {
                    console.error('Error subscribing to new-posts topic:', err);
                } else {
                    console.log('Subscribed to new-posts topic');
                }
            });
        });

        client.on('message', (topic, message) => {
            if (topic === 'new-posts') {
                const newPost = JSON.parse(message.toString());
                setPosts((prevPosts) => [newPost, ...prevPosts]); 
            }
        });

        setMqttClient(client); 
    };

    const mixAdsWithPosts = (posts, ad, interval = 3) => {
        const mixedContent = [];
        posts.forEach((post, index) => {
            mixedContent.push(post);
            if ((index + 1) % interval === 0 && ad) {
                mixedContent.push({ type: 'ad', content: ad });
            }
        });
        return mixedContent;
    };

    useEffect(() => {
        setupSSE(); 
        fetchPosts(); 
        setupMqtt(); 

        return () => {
            if (mqttClient) {
                mqttClient.end(); 
            }
            if (sseConnection) {
                sseConnection.close(); 
            }
        };
    }, []); 

    const mixedContent = mixAdsWithPosts(posts, currentAd);
    const handlePostUpdate = (updatedPost) => {
        setPosts(posts.map(post => post.id === updatedPost.id ? updatedPost : post));
        console.log(posts)
      };
    
      const handlePostDelete = (postId) => {
        setPosts(posts.filter(post => post.id !== postId));
      };
    
    return (
        <div>
            {mixedContent.map((item, index) => {
                if (item.type === 'ad') {
                    return (
                        <div key={`ad-${index}`} className="ad-container">
                            <a href={item.content.link} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={`https://localhost:5007/ads${item.content.imageUrl}`}
                                    alt="Advertisement"
                                />
                            </a>
                        </div>
                    );
                }
                return <Post key={item.id} post={item} onUpdate={handlePostUpdate} onDelete={handlePostDelete}/>;
            })}
        </div>
    );
};

export default Home;
