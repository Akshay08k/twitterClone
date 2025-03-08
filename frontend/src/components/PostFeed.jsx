// components/PostFeed.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Post from "./Posts";

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const handleCommentUpdate = (postId, newComment) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post._id === postId) {
          return {
            ...post,
            comments: [newComment, ...(post.comments || [])],
            commentsCount: (post.commentsCount || 0) + 1,
          };
        }
        return post;
      })
    );
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/posts`, {
        withCredentials: true,
      });
      if (response.data.success) {
        const newPosts = response.data.data;
        setPosts(newPosts);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [page]);

  return (
    <div className="max-w-2xl mx-auto bg-black pt-20 border-l border-r border-gray-800">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DA1F2]"></div>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
