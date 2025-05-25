import React, { useState, useEffect } from "react";
import axios from "../contexts/axios";
import { useParams } from "react-router-dom";
import Post from "../components/Posts";
import Navbar from "./Navbar";

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/post/${id}`);

      setPost(response.data);
      setLoading(false);
    } catch (error) {
      setError("Failed to fetch post");
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPost();
  }, [id]);

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;
  if (!post) return <div className="text-center p-4">Post not found</div>;

  return (
    <>
      <Navbar />
      <div className="max-w-2xl mx-auto my-16">
        <Post post={post.data} onCommentUpdate={fetchPost} />
      </div>
    </>
  );
};

export default SinglePost;
