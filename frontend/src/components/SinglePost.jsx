import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Post from "../components/Posts";
import Navbar from "./Navbar";

const SinglePost = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:3000/posts/post/${postId}`,
        { withCredentials: true }
      );
      setPost(response.data.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch post");
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!post) return <div className="text-center p-4">Post not found</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto my-16">
        <Post post={post} onCommentUpdate={fetchPost} />
      </div>
    </>
  );
};

export default SinglePost;
