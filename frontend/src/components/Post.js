import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import CommentSection from './CommentSection';
import { useAuth } from './AuthContext';
import { useMqtt } from './MqttContext';
import './CSS/Post.css';
import { useNotifications } from './NotificationContext';

const Post = ({ post }) => {
  const { mqttClient } = useMqtt();
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState(post.description);
  const [showMenu, setShowMenu] = useState(false);
  const postId = post.id;
  const userId = user?.id || 0;
  const menuRef = useRef(null);
  const [imageError, setImageError] = useState(false);


  useEffect(() => {
    if (mqttClient) {
      mqttClient.subscribe(`posts/${postId}/likes`, (err) => {
        if (err) {
          console.warn('MQTT subscribe error for likes:', err);
        }
      });

      mqttClient.on('message', (topic, message) => {
        if (topic === `posts/${postId}/likes`) {
          const { likes } = JSON.parse(message.toString());
          console.log("AKTUALIZACJA", likes)
          setLikes(likes);  
        }
      });
    }

    return () => {
      if (mqttClient) {
        mqttClient.unsubscribe(`posts/${postId}/likes`);
      }
    };
  }, [mqttClient, postId]);

  useEffect(() => {
    fetchLikes();
    fetchComments();
    checkIfUserLiked();
  }, [postId, user]);

  const checkIfUserLiked = async () => {
    if (!user?.id) return;

    try {
      const { data } = await api.get(`/posts/user/${user.id}/liked-posts`);
      const userLiked = data.some(likedPost => likedPost.id === post.id);
      setUserHasLiked(userLiked);
    } catch (error) {
      console.error('Error checking if user liked post:', error);
    }
  };

  const fetchLikes = async () => {
    try {
      const { data } = await api.get(`/posts/${post.id}/likes`);
      setLikes(data.likes); 
    } catch (error) {
      console.error('Error fetching likes:', error);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/posts/${post.id}/comments`);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (userHasLiked) {
        await api.delete(`/posts/${post.id}/likes`, { data: { userId: user.id } });
        setUserHasLiked(false);
      } else {
        await api.post(`/posts/${post.id}/likes`, { userId: user.id });
        setUserHasLiked(true);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentIconClick = () => {
    setShowComments(prevState => !prevState);
  };

  const editPost = async () => {
    try {
      const response = await api.put(`/posts/${post.id}`, { description: newDescription });
      setNewDescription(response.data.description); 
      setIsEditing(false); 
    } catch (error) {
      console.error('Error editing post:', error);
      setNewDescription(post.description); 
      setIsEditing(false);
    }
  };

    const deletePost = async () => {
      console.log("im", post.image)
    try {
      console.log("im", post.image)
      await api.delete(`/posts/${postId}`);
      console.log("im", post.image)
      console.log("Post deleted successfully");
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  if (!post.id) {
    return <p>Loading...</p>;
  }
  console.log("POST", post)

  const handleImageError = () => {
    setImageError(true);
  };
  return (
    <div className="post">
      {!imageError ? (
        <img
          src={post.image}  
          alt="photo"
          onError={handleImageError}  
          style={{ width: '100%', height: 'auto' }} 
        />
      ) : (
        //<p>0</p>  
        <img
        src="http://localhost:5007/uploads/egg.jpg"  
          alt="photo"
          onError={handleImageError}  
          style={{ width: '100%', height: 'auto' }} 
        />
      )}

      <div className="post-header">
        <p>Author: {post.User?.username || 'Unknown'}</p>
        {user?.id === post.User?.id && (
          <i
            className="fas fa-ellipsis-h post-menu-icon"
            onClick={() => setShowMenu((prev) => !prev)} // Toggling menu
          ></i>
        )}
        {showMenu && (
          <div className="post-menu" ref={menuRef}>
            <button onClick={() => deletePost(post.id)}>Delete</button>
            <button onClick={() => setIsEditing(true)}>Edit</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <button onClick={editPost}>Save</button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <h3>{post.description}</h3>
      )}

      <div className="like-com">
        <i 
          className={`fa${userHasLiked ? 's' : 'r'} fa-heart like-button`} 
          onClick={handleLike}
          style={{ color: userHasLiked ? 'red' : 'black', transition: 'color 0.3s ease' }}
        ></i>
        <p>{likes} Likes</p>

        <i 
          className="far fa-comment comment-icon"
          onClick={handleCommentIconClick}
        ></i>
        <p>{comments.length} Comments</p>
      </div>

      {showComments && (
        <CommentSection 
          postId={post.id} 
          comments={comments} 
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Post;

