import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PublicFeeds = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get('http://localhost:5001/api/posts');
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
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Browse public journal entries shared by other travelers.
      </p>

      {loading && <p>Loading posts...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && posts.length === 0 && (
        <p>No public posts yet. Be the first to share a journey!</p>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex flex-col gap-2"
          >
            <h3 className="text-xl font-semibold">{post.title}</h3>
            {post.placeName && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                📍 {post.placeName}
              </p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-200 line-clamp-3">
              {post.description}
            </p>
            <p className="text-xs text-gray-400 mt-2">
              {post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PublicFeeds;