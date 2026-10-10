import React from "react";
import { Link } from "react-router-dom";

export const renderFormattedText = (text) => {
  if (!text) return null;

  // Regex matching hashtags (#tag), mentions (@user), and web URLs
  const regex = /(#[a-zA-Z0-9_\u0080-\uFFFF]+|@[a-zA-Z0-9_]+|https?:\/\/[^\s]+)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Clickable Hashtag
    if (part.startsWith("#")) {
      return (
        <Link
          key={index}
          to={`/explore?q=${encodeURIComponent(part)}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[#1d9bf0] hover:underline font-medium inline-block"
        >
          {part}
        </Link>
      );
    }

    // Clickable Mention
    if (part.startsWith("@")) {
      const username = part.slice(1);
      return (
        <Link
          key={index}
          to={`/profile/${username}`}
          onClick={(e) => e.stopPropagation()}
          className="text-[#1d9bf0] hover:underline font-medium inline-block"
        >
          {part}
        </Link>
      );
    }

    // Clickable Web Link
    if (part.startsWith("http://") || part.startsWith("https://")) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-[#1d9bf0] hover:underline break-all"
        >
          {part}
        </a>
      );
    }

    return part;
  });
};

const PostContent = ({ post }) => {
  return (
    <div className="mt-1">
      <p className="text-white text-[15px] whitespace-pre-wrap break-words leading-relaxed">
        {renderFormattedText(post.description)}
      </p>

      {post.attachements?.[0] && (
        <div className="mt-3 rounded-2xl overflow-hidden max-h-[510px] border border-[#24272c]">
          <img
            src={post.attachements[0]}
            alt="Post attachment"
            className="w-full h-full object-cover hover:opacity-95 transition-opacity"
          />
        </div>
      )}
    </div>
  );
};

export default PostContent;
