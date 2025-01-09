import React, { useState, useEffect } from 'react';
import axios from '../services/api';
import Cookies from 'js-cookie';
import Followers from '../components/Followers';
import Post from '../components/Post';
import { useParams } from 'react-router-dom';
import {useAuth} from '../components/AuthContext'
import './CSS/Profile.css'

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
  const {user}=useAuth()
  const { userId } = useParams(); 
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = Cookies.get(`auth_token_${user.username}`);

        if (!token) {
          throw new Error('Brak tokenu uwierzytelniającego');
        }

        const [postsRes, countRes,subscriptionRes] = await Promise.all([
          axios.get(`/posts/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`/followers/${userId}/count`),
          axios.get(`/followers/subscriptions/${user.id}/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
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
  

  return (
    <div className="profile">
      <h2>Profil użytkownika {userName}</h2>
      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Ładowanie danych...</p>
      ) : (
        <>
          <div className="profile-info">
          <div className="profile-stats">
  <p><strong>{posts.length}</strong> posty</p>
  <p 
    onClick={() => setShowFollowersModal(true)} 
  >
    <strong>{followersCount}</strong> subskrybenci
  </p>
  <p 
    onClick={() => setShowFollowingModal(true)} 
  >
    <strong>{followingCount}</strong> subskrybowani
  </p>
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
              {console.log("P", userId)}
              <Followers type="followers" userName={userId} />
            </div>
          )}

          {showFollowingModal && (
            <div className="modal">
              <button onClick={() => setShowFollowingModal(false)}>Zamknij</button>
              {console.log("P", userId)}
              <Followers type="following" userName={userId} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Profile;




// import React, { useState, useEffect } from 'react';
// import axios from '../services/api';
// import Cookies from 'js-cookie';
// import Followers from '../components/Followers';
// import Post from '../components/Post';
// import { useParams } from 'react-router-dom';
// import { useAuth } from '../components/AuthContext';
// import './CSS/Profile.css';

// const Profile = () => {
//   const [posts, setPosts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userName, setUserName] = useState('');
//   const [followersCount, setFollowersCount] = useState(0);
//   const [followingCount, setFollowingCount] = useState(0);
//   const [showFollowersModal, setShowFollowersModal] = useState(false);
//   const [showFollowingModal, setShowFollowingModal] = useState(false);
//   const [isSubscribed, setIsSubscribed] = useState(false);
//   const [error, setError] = useState('');
//   const { user } = useAuth();
//   const { userId } = useParams(); 

//   useEffect(() => {
//     const fetchProfileData = async () => {
//       try {
//         // Bezpośredni dostęp do ciasteczek `httpOnly` jest niemożliwy w JS
//         // Token będzie automatycznie przesyłany przez przeglądarkę (withCredentials)
        
//         const [postsRes, countRes, subscriptionRes] = await Promise.all([
//           axios.get(`/posts/${userId}`, { withCredentials: true }),
//           axios.get(`/followers/${userId}/count`, { withCredentials: true }),
//           axios.get(`/followers/subscriptions/${user.id}/${userId}`, { withCredentials: true })
//         ]);

//         setPosts(postsRes.data);
//         if (subscriptionRes && subscriptionRes.data) {
//           setIsSubscribed(subscriptionRes.data.isSubscribed);
//         } else {
//           throw new Error('Brak informacji o subskrypcji');
//         }
//         setFollowersCount(countRes.data.followersCount);
//         setFollowingCount(countRes.data.followingCount);
//         setUserName(userId); 
//         setLoading(false);
//       } catch (error) {
//         console.error('Błąd pobierania danych profilu:', error);
//         setError('Wystąpił błąd podczas pobierania danych profilu. Spróbuj ponownie później.');
//         setLoading(false);
//       }
//     };

//     fetchProfileData();
//   }, [userId, user.id]);

//   const toggleSubscription = async () => {
//     try {
//       // Używamy ciasteczek httpOnly i nie musimy już odczytywać tokena bezpośrednio
//       const [subscriptionRes, subscriptionCountRes] = await Promise.all([
//         isSubscribed 
//           ? axios.delete(`/followers/unsubscribe/${user.id}/${userId}`, { withCredentials: true })
//           : axios.post('/followers/subscribe', { followingUsername: userName }, { withCredentials: true }),
        
//         axios.get(`/followers/${userId}/count`, { withCredentials: true })
//       ]);

//       // Zaktualizuj UI
//       setIsSubscribed(!isSubscribed);
//       setFollowersCount(subscriptionCountRes.data.followersCount);
//     } catch (error) {
//       console.error('Błąd podczas aktualizacji subskrypcji:', error);
//       setError('Wystąpił błąd podczas aktualizacji subskrypcji.');
//     }
//   };

//   return (
//     <div className="profile">
//       <h2>Profil użytkownika {userName}</h2>
//       {error && <p className="error">{error}</p>}

//       {loading ? (
//         <p>Ładowanie danych...</p>
//       ) : (
//         <>
//           <div className="profile-info">
//             <div className="profile-stats">
//               <p><strong>{posts.length}</strong> posty</p>
//               <p onClick={() => setShowFollowersModal(true)}>
//                 <strong>{followersCount}</strong> subskrybenci
//               </p>
//               <p onClick={() => setShowFollowingModal(true)}>
//                 <strong>{followingCount}</strong> subskrybowani
//               </p>
//             </div>

//             {Cookies.get('auth_token') && user.username !== userId && (
//               <button onClick={toggleSubscription}>
//                 {isSubscribed ? 'Usuń subskrypcję' : 'Subskrybuj'}
//               </button>
//             )}
//           </div>

//           <div className="posts-grid">
//             {posts.length === 0 ? (
//               <p>Brak postów do wyświetlenia.</p>
//             ) : (
//               posts.map((post) => <Post key={post.id} post={post} />)
//             )}
//           </div>

//           {showFollowersModal && (
//             <div className="modal">
//               <button onClick={() => setShowFollowersModal(false)}>Zamknij</button>
//               <Followers type="followers" userName={userId} />
//             </div>
//           )}

//           {showFollowingModal && (
//             <div className="modal">
//               <button onClick={() => setShowFollowingModal(false)}>Zamknij</button>
//               <Followers type="following" userName={userId} />
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default Profile;
