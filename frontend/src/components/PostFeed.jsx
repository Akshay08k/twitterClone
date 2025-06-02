import React, { useEffect, useState } from "react";
import axios from "../contexts/axios";
import usePostSocketSync from "../utils/usePostSync.js";
import Posts from "./Posts"; // adjust the path as needed
import { useSelector } from "react-redux";
import socket from "../utils/socket.js";
const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const reduxUser = useSelector((state) => state.user);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("/posts");
        if (response.status === 200) {
          setPosts(response.data.data); // Adjust depending on actual structure
        } else {
          console.error("Unexpected response:", response);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  usePostSocketSync({
    onNewPost: (newPost) => setPosts((prev) => [newPost, ...prev]),
    onPostDeleted: (deletedPostId) =>
      setPosts((prev) => prev.filter((post) => post._id !== deletedPostId)),
  });

  return (
    <div className="max-w-2xl mx-auto bg-black pt-20 border-l border-r border-gray-800">
      {posts.length === 0 ? (
        <p className="text-gray-400 text-center">Loading....</p>
      ) : (
        posts.map((post) => (
          <Posts key={post._id} post={post} currentUser={reduxUser} />
        ))
      )}

      {loading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1DA1F2]"></div>
        </div>
      )}
    </div>
  );
};

export default PostList;
