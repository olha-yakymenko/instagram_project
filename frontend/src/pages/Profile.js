import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import Cookies from 'js-cookie';
import Followers from '../components/Followers';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import './CSS/Profile.css';

const Profile = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const { user } = useAuth();
  const { userId } = useParams();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = Cookies.get(`auth_token_${user.username}`);

        if (!token) {
          throw new Error('Brak tokenu uwierzytelniającego');
        }

        const [postsRes, countRes, subscriptionRes] = await Promise.all([
          axios.get(`/posts/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/followers/${userId}/count`),
          axios.get(`/followers/subscriptions/${user.id}/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setPosts(postsRes.data);

        if (subscriptionRes && subscriptionRes.data) {
          setIsSubscribed(subscriptionRes.data.isSubscribed);
        } else {
          throw new Error('Brak informacji o subskrypcji');
        }

        setFollowersCount(countRes.data.followersCount);
        setFollowingCount(countRes.data.followingCount);
        setUserName(userId);
        try {
          const profilePicRes = await axios.get(`/auth/user/${user.id}/profile-picture`, { responseType: 'blob' });
          const imgUrl = URL.createObjectURL(profilePicRes.data);
          setProfilePicture(imgUrl);
        } catch (picError) {
          console.log("Błąd pobierania zdjęcia profilowego:", picError.response?.data);
          setProfilePicture(null);
        }
        

        setLoading(false);
      } catch (error) {
        console.error('Błąd pobierania danych profilu:', error);
        setError('Wystąpił błąd podczas pobierania danych profilu. Spróbuj ponownie później.');
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const toggleSubscription = async () => {
    const token = Cookies.get(`auth_token_${userId}`);
    try {
      if (isSubscribed) {
        await axios.delete(`/followers/unsubscribe/${user.id}/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsSubscribed(false);
        setFollowersCount((prevCount) => prevCount - 1);
      } else {
        await axios.post(
          '/followers/subscribe',
          { followingUsername: userName },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setIsSubscribed(true);
        setFollowersCount((prevCount) => prevCount + 1);
      }
    } catch (error) {
      console.error('Błąd podczas aktualizacji subskrypcji:', error);
      setError('Wystąpił błąd podczas aktualizacji subskrypcji.');
    }
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const token = Cookies.get(`auth_token_${user.username}`);
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await axios.put(`/auth/user/${user.id}/profile-picture`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      const profilePicRes = await axios.get(`/auth/user/${user.id}/profile-picture`, { responseType: 'blob' });
      const imgUrl = URL.createObjectURL(profilePicRes.data);
      setProfilePicture(imgUrl);
    } catch (error) {
      console.error('Błąd podczas przesyłania zdjęcia profilowego:', error);
      setError('Wystąpił błąd podczas przesyłania zdjęcia profilowego.');
    }
  };

  return (
    <div className="profile">
      <h2>Profil użytkownika {userName}</h2>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Ładowanie danych...</p>
      ) : (
        <>
          <div className="profile-info">
          <div className="profile-picture-section">
              <div className="profile-picture-wrapper">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="profile-picture" />
                ) : (
                  <div className="placeholder-picture">+</div>
                )}
                {user.username === userId && (
                  <label className="upload-button">
                    <span className="plus-icon">+</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePictureUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                )}
              </div>
            </div>
            <div className="profile-stats">
              <p><strong>{posts.length}</strong> posty</p>
              <p onClick={() => setShowFollowersModal(true)}><strong>{followersCount}</strong> subskrybenci</p>
              <p onClick={() => setShowFollowingModal(true)}><strong>{followingCount}</strong> subskrybowani</p>
            </div>

            {Cookies.get(`auth_token_${userId}`) && user.username !== userId && (
              <button onClick={toggleSubscription}>
                {isSubscribed ? 'Usuń subskrypcję' : 'Subskrybuj'}
              </button>
            )}
          </div>
          <div className="posts-grid">
            {posts.length === 0 ? (
              <p>Brak postów do wyświetlenia.</p>
            ) : (
              posts.map((post) => <Post key={post.id} post={post} />)
            )}
          </div>

          {showFollowersModal && (
            <div className="modal">
              <button onClick={() => setShowFollowersModal(false)}>Zamknij</button>
              <Followers type="followers" userName={userId} />
            </div>
          )}

          {showFollowingModal && (
            <div className="modal">
              <button onClick={() => setShowFollowingModal(false)}>Zamknij</button>
              <Followers type="following" userName={userId} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;
