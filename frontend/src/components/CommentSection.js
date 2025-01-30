import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import './CSS/CommentSection.css';

const CommentSection = ({ postId, comments, currentUser, mqttClient }) => {
  const [newComment, setNewComment] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [editingCommentId, setEditingCommentId] = useState(null); 
  const [editedCommentContent, setEditedCommentContent] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleEditCommentChange = (e) => {
    setEditedCommentContent(e.target.value);
  };

  const handleAddComment = async () => {
    if (!user || !user.id) {
      console.log("Nie jesteś zalogowany.");
      return;
    }
    if (newComment.trim() === '') return;
    try {
      const { data } = await api.post(`/posts/${postId}/comments`, { content: newComment });
      setLocalComments((prevComments) => [...prevComments, data]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditingCommentId(commentId);
    setEditedCommentContent(content);
  };

  const handleSaveEditedComment = async () => {
    if (!editedCommentContent.trim()) return;

    try {
      const { data } = await api.put(`/posts/${postId}/comments/${editingCommentId}`, {
        content: editedCommentContent,
      });

      setLocalComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === editingCommentId ? { ...comment, content: data.content } : comment
        )
      );

      setEditingCommentId(null);
      setEditedCommentContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  return (
    <div className="comment-section">
      <div className="comments-list">
        {localComments.map((comment) => (
          <div key={comment?.id} className="comment">
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editedCommentContent}
                  onChange={handleEditCommentChange}
                  placeholder="Edit your comment..."
                />
                <button onClick={handleSaveEditedComment}>Save</button>
              </div>
            ) : (
              <div>
                <p>
                  {comment?.User?.username ? `${comment.User.username} ` : ''}: {comment?.content || ' '}
                </p>
                {user?.id === comment?.authorId && (
                  <button onClick={() => handleEditComment(comment.id, comment.content)}>Edit</button>
                )}
              </div>
            )}
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
