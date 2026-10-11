import React, { useState, useEffect } from "react";
import axios from "../contexts/axios";
import { useParams, useNavigate } from "react-router-dom";
import Post from "../components/Posts";
import { ArrowLeft } from "lucide-react";
import { useSelector } from "react-redux";

const SinglePost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduxUser = useSelector((state) => state.user);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/posts/post/${id}`);
      setPost(response.data?.data || null);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch post");
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    fetchPost();
  }, [id]);

  return (
    <div className="w-full min-h-screen">
      {/* Sticky Top Header with Back Button */}
      <div className="sticky top-0 z-20 backdrop-blur-md bg-black/85 border-b border-[#24272c] px-4 py-3 flex items-center space-x-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/10 text-white transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white leading-tight">Post</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#1d9bf0] border-t-transparent"></div>
        </div>
      ) : error || !post ? (
        <div className="text-center py-20 px-4 space-y-2">
          <p className="text-red-400 font-semibold">{error || "Post not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="text-[#1d9bf0] hover:underline text-sm"
          >
            Go back to Home
          </button>
        </div>
      ) : (
        <div>
          <Post
            post={post}
            currentUser={reduxUser}
            onCommentUpdate={fetchPost}
            onPostDeleted={() => navigate("/")}
            defaultShowComments={true}
          />
        </div>
      )}
    </div>
  );
};

export default SinglePost;
