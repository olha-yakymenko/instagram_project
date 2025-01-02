
import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import Cookies from 'js-cookie'; 

const CreatePost = () => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);  

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);  
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to create a post');
      return;
    }

    try {
      const token = Cookies.get('token'); 
      if (!token) {
        alert('You are not authenticated');
        return;
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('image', image); 

      const response = await axios.post(
        'http://localhost:5000/api/posts',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', 
            Authorization: `Bearer ${token}`, 
          },
        }
      );

      console.log('Post created:', response.data);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div>
      <h2>Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          onChange={handleImageChange}  
        />
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
