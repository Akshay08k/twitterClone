import React, { useState } from "react";
import axios from "../contexts/axios";
import { useSelector } from "react-redux";
import { MessageCircle, Trash2, ChevronDown, ChevronUp, CornerDownRight } from "lucide-react";
import toast from "react-hot-toast";
import { renderFormattedText } from "./post/PostContent";

// Helper to format dates
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

// Sub-component for an individual reply inside the flattened sub-thread
const ThreadReplyItem = ({
  reply,
  postId,
  rootCommentId,
  parentUser,
  onReplySubmit,
  onDelete,
  isLast,
}) => {
  const currentUser = useSelector((state) => state.user);
  const [showInput, setShowInput] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const isOwner =
    currentUser?._id &&
    reply.user?._id &&
    currentUser._id.toString() === reply.user._id.toString();

  const handleReply = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/comment/commentReply`, {
        content: text.trim(),
        postId,
        parentCommentId: reply._id,
      });

      if (response.data.success) {
        const newReply = {
          ...response.data.data,
          replies: [],
          parentUser: reply.user,
          user: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        };

        onReplySubmit?.(newReply, reply._id);
        setText("");
        setShowInput(false);
        toast.success("Reply posted!");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Instant optimistic delete
  const handleDelete = async () => {
    setIsDeleting(true);
    setTimeout(() => {
      if (onDelete) onDelete(reply._id);
      toast.success("Reply deleted");
    }, 180);

    try {
      await axios.delete(`/comment/${postId}/${reply._id}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div
      className={`relative flex items-start space-x-3 pt-2 transition-all duration-200 ${
        isDeleting ? "animate-collapse opacity-0 pointer-events-none" : ""
      }`}
    >
      {/* Left Column: Avatar + Vertical Thread Line to next reply */}
      <div className="flex flex-col items-center shrink-0 self-stretch">
        <img
          src={reply.user?.avatar || "/default-avatar.png"}
          alt={reply.user?.username || "User"}
          className="w-8 h-8 rounded-full object-cover border border-[#24272c] shrink-0"
        />
        {!isLast && (
          <div className="w-0.5 bg-[#333639] flex-1 my-1 rounded-full" />
        )}
      </div>

      {/* Right Column: User info, 'Replying to', content, actions */}
      <div className="flex-1 min-w-0 pb-2">
        <div className="flex items-center space-x-1.5 text-sm leading-snug">
          <span className="font-bold text-white hover:underline truncate cursor-pointer">
            {reply.user?.username || "User"}
          </span>
          <span className="text-gray-500 truncate">
            @{reply.user?.username?.toLowerCase() || "user"}
          </span>
          <span className="text-gray-500">·</span>
          <span className="text-gray-500 text-xs">{formatDate(reply.createdAt)}</span>
        </div>

        {/* Replying to indicator */}
        {parentUser?.username && (
          <p className="text-xs text-gray-500 mt-0.5">
            Replying to{" "}
            <span className="text-[#1d9bf0] hover:underline cursor-pointer">
              @{parentUser.username}
            </span>
          </p>
        )}

        {/* Content */}
        <p className="text-white text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
          {renderFormattedText(reply.content)}
        </p>

        {/* Actions */}
        <div className="flex items-center space-x-4 mt-1.5 text-gray-500">
          <button
            onClick={() => setShowInput(!showInput)}
            className="flex items-center space-x-1 text-xs hover:text-[#1d9bf0] transition-colors py-0.5"
            title="Reply"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>

          {isOwner && (
            <button
              onClick={handleDelete}
              className="flex items-center space-x-1 text-xs hover:text-red-500 transition-colors py-0.5"
              title="Delete reply"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>

        {/* Inline Reply Box for this reply */}
        {showInput && (
          <form onSubmit={handleReply} className="mt-2 pl-0.5 animate-fadeIn">
            <div className="flex space-x-2">
              <img
                src={currentUser?.avatar || "/default-avatar.png"}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-[#24272c]"
              />
              <div className="flex-1 bg-[#16181c] border border-[#24272c] rounded-xl p-2 focus-within:border-[#1d9bf0]">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={`Reply to @${reply.user?.username || "user"}...`}
                  className="w-full bg-transparent text-white text-xs resize-none focus:outline-none min-h-[45px] placeholder-gray-500"
                  rows="2"
                  autoFocus
                />
                <div className="flex justify-end items-center space-x-2 pt-1 border-t border-[#24272c]/40">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInput(false);
                      setText("");
                    }}
                    className="text-gray-400 hover:text-white text-xs px-2 py-0.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!text.trim() || isSubmitting}
                    className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold text-xs px-3 py-1 rounded-full"
                  >
                    {isSubmitting ? "Replying..." : "Reply"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Main CommentThread component for Root Comments
const CommentThread = ({ comment, postId, onReplySubmit, onDelete }) => {
  const currentUser = useSelector((state) => state.user);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recursively collect all descendant replies in a flat list so they never squish horizontally
  const getAllReplies = (node) => {
    let list = [];
    if (node.replies && node.replies.length > 0) {
      for (const r of node.replies) {
        list.push(r);
        list = list.concat(getAllReplies(r));
      }
    }
    return list;
  };

  const allDescendants = getAllReplies(comment);
  const totalRepliesCount = allDescendants.length;

  const isOwner =
    currentUser?._id &&
    comment.user?._id &&
    currentUser._id.toString() === comment.user._id.toString();

  const handleRootReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/comment/commentReply`, {
        content: replyText.trim(),
        postId,
        parentCommentId: comment._id,
      });

      if (response.data.success) {
        const newReply = {
          ...response.data.data,
          replies: [],
          parentUser: comment.user,
          user: {
            _id: currentUser._id,
            username: currentUser.username,
            avatar: currentUser.avatar,
          },
        };

        onReplySubmit?.(newReply, comment._id);
        setReplyText("");
        setShowReplyInput(false);
        setShowReplies(true);
        toast.success("Reply posted!");
      }
    } catch (error) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDeletingRoot, setIsDeletingRoot] = useState(false);

  const handleDeleteRoot = async () => {
    setIsDeletingRoot(true);
    setTimeout(() => {
      if (onDelete) onDelete(comment._id);
      toast.success("Comment deleted");
    }, 180);

    try {
      await axios.delete(`/comment/${postId}/${comment._id}`);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div
      className={`py-2.5 border-b border-[#24272c]/40 last:border-b-0 transition-all duration-200 ${
        isDeletingRoot ? "animate-collapse opacity-0 pointer-events-none" : ""
      }`}
    >
      {/* Root Comment Row */}
      <div className="flex items-start space-x-3">
        {/* Left Column: Avatar + Thread Connector Line */}
        <div className="flex flex-col items-center shrink-0 self-stretch">
          <img
            src={comment.user?.avatar || "/default-avatar.png"}
            alt={comment.user?.username || "User"}
            className="w-9 h-9 rounded-full object-cover border border-[#24272c] shrink-0"
          />
          {/* Thread line connecting down if replies or reply input are open */}
          {(showReplies || showReplyInput) && totalRepliesCount > 0 && (
            <div className="w-0.5 bg-[#333639] flex-1 my-1.5 rounded-full" />
          )}
        </div>

        {/* Right Column: Content and Actions */}
        <div className="flex-1 min-w-0 pb-1">
          {/* User header */}
          <div className="flex items-center space-x-1.5 text-sm leading-snug">
            <span className="font-bold text-white hover:underline truncate cursor-pointer">
              {comment.user?.username || "User"}
            </span>
            <span className="text-gray-500 truncate">
              @{comment.user?.username?.toLowerCase() || "user"}
            </span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-xs">
              {formatDate(comment.createdAt)}
            </span>
          </div>

          {/* Comment content */}
          <p className="text-white text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
            {renderFormattedText(comment.content)}
          </p>

          {/* Action buttons */}
          <div className="flex items-center space-x-5 mt-2 text-gray-500">
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="flex items-center space-x-1.5 text-xs hover:text-[#1d9bf0] transition-colors py-0.5 group/btn"
              title="Reply"
            >
              <div className="p-1 rounded-full group-hover/btn:bg-[#1d9bf0]/10 transition-colors">
                <MessageCircle className="w-3.5 h-3.5" />
              </div>
              <span>Reply</span>
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteRoot}
                className="flex items-center space-x-1.5 text-xs hover:text-red-500 transition-colors py-0.5 group/btn"
                title="Delete comment"
              >
                <div className="p-1 rounded-full group-hover/btn:bg-red-500/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </div>
                <span>Delete</span>
              </button>
            )}
          </div>

          {/* Inline Reply Input for Root Comment */}
          {showReplyInput && (
            <form onSubmit={handleRootReply} className="mt-2.5 mb-2 pl-0.5 animate-fadeIn">
              <div className="flex space-x-2.5">
                <img
                  src={currentUser?.avatar || "/default-avatar.png"}
                  alt="Avatar"
                  className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 border border-[#24272c]"
                />
                <div className="flex-1 bg-[#16181c] border border-[#24272c] rounded-xl p-2.5 focus-within:border-[#1d9bf0] transition-colors">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Reply to @${comment.user?.username || "user"}...`}
                    className="w-full bg-transparent text-white text-xs sm:text-sm resize-none focus:outline-none min-h-[50px] placeholder-gray-500"
                    rows="2"
                    autoFocus
                  />
                  <div className="flex justify-end items-center space-x-2 pt-1 border-t border-[#24272c]/40">
                    <button
                      type="button"
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText("");
                      }}
                      className="text-gray-400 hover:text-white text-xs px-2.5 py-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!replyText.trim() || isSubmitting}
                      className="bg-[#1d9bf0] hover:bg-[#1a8cd8] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-1 rounded-full"
                    >
                      {isSubmitting ? "Replying..." : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Twitter-style Sub-thread Branch for Child Replies */}
      {totalRepliesCount > 0 && (
        <div className="ml-4 pl-4 sm:ml-5 sm:pl-5 border-l-2 border-[#333639] mt-0.5">
          {/* Branch Toggle Button with Light Arrow/Chevron */}
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center space-x-2 text-xs font-semibold text-[#1d9bf0] hover:text-[#1a8cd8] transition-colors py-1.5 group/toggle"
          >
            <div className="flex items-center space-x-1 text-[#1d9bf0]">
              <CornerDownRight className="w-3.5 h-3.5 group-hover/toggle:translate-x-0.5 transition-transform" />
              {showReplies ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </div>

            <span>
              {showReplies
                ? "Hide replies"
                : `Show ${totalRepliesCount} ${
                    totalRepliesCount === 1 ? "reply" : "replies"
                  }`}
            </span>
          </button>

          {/* Flattened Replies List: All aligned along ONE thread line, full width, ZERO squishing */}
          {showReplies && (
            <div className="space-y-1 mt-1 animate-fadeIn">
              {allDescendants.map((r, idx) => (
                <ThreadReplyItem
                  key={r._id}
                  reply={r}
                  postId={postId}
                  rootCommentId={comment._id}
                  parentUser={r.parentUser || comment.user}
                  onReplySubmit={onReplySubmit}
                  onDelete={onDelete}
                  isLast={idx === allDescendants.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
