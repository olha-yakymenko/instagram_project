

import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {useAuth} from './AuthContext'
const CommentSection = ({ postId, comments, currentUser, mqttClient }) => {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const { user } = useAuth();
  useEffect(() => {
    setLocalComments(comments); 
  }, [comments]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleAddComment = async () => {
    if (newComment.trim() === '') return; 
    if (!user) return 
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: newComment });
      setLocalComments((prevComments) => [...prevComments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <div className="comments-list">
  {localComments.map((comment, index) => (
    <div key={comment?.id || index} className="comment">
      <p>{comment?.content || ' '}</p> {/* Jeśli content jest undefined, wyświetl "No content available" */}
    </div>
  ))}
</div>


      <div className="comment-input">
        <textarea
          value={newComment}
          onChange={handleCommentChange}
          placeholder="Add a comment..."
        ></textarea>
        <button onClick={handleAddComment}>Post Comment</button>
      </div>
    </div>
  );
};

export default CommentSection;
