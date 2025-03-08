import React from "react";
import { Link } from "react-router-dom";
const PostContent = ({ post }) => {
  return (
    <>
      <Link to={`/posts/${post._id}`} className="block">
        <p className="text-white mt-1 text-[15px] whitespace-pre-wrap break-words">
          {post.description}
        </p>
        {post.attachements?.[0] && (
          <div className="mt-3 rounded-2xl overflow-hidden max-h-[510px] border border-gray-800">
            <img
              src={post.attachements[0]}
              alt="Post attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </Link>
    </>
  );
};

export default PostContent;
