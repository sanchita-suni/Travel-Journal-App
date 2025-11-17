import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const PublicFeeds = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('http://localhost:5000/api/posts');
        setPosts(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError('Failed to load public posts');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-8 min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <h2 className="text-3xl font-bold mb-4">Public Feeds</h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">Browse public journal entries.</p>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {posts.map((post) => (
          <div
            key={post._id}
            // ⭐ KEY CHANGE: Pass mode: 'view'
            onClick={() => navigate(`/book/${post._id}`, { state: { mode: 'view' } })}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer transform hover:-translate-y-1"
          >
            <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {post.imageUrl ? (
                <img src={`http://localhost:5000${post.imageUrl}`} alt={post.title} className="w-full h-full object-cover"/>
              ) : post.bookData?.cover ? (
                <img src={post.bookData.cover} alt="Book Cover" className="w-full h-full object-cover"/>
              ) : (
                <div className="flex items-center justify-center h-full text-4xl">✈️</div>
              )}
            </div>
            <div className="p-5">
              <h3 className="text-xl font-bold mb-2 truncate">{post.title}</h3>
              {post.placeName && <p className="text-sm text-blue-500 font-semibold mb-2">📍 {post.placeName}</p>}
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">{post.description}</p>
              <div className="flex items-center gap-2 mt-2 border-t pt-2 border-gray-100">
                 <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">
                   {post.user?.name ? post.user.name[0].toUpperCase() : "?"}
                 </div>
                 <span className="text-xs text-gray-500">By {post.user?.name || "Unknown"}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicFeeds;