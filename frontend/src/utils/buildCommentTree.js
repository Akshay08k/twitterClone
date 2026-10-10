// src/utils/buildCommentTree.js

export function buildCommentTree(comments) {
  if (!Array.isArray(comments)) return [];

  const map = {};
  const roots = [];

  // Create a map of id to comment and initialize replies
  comments.forEach((comment) => {
    map[comment._id] = { ...comment, replies: [] };
  });

  // Assign replies to their parent comment and attach parentUser
  comments.forEach((comment) => {
    if (comment.parentComment) {
      const parent = map[comment.parentComment];
      if (parent) {
        map[comment._id].parentUser = parent.user;
        parent.replies.push(map[comment._id]);
      } else {
        roots.push(map[comment._id]);
      }
    } else {
      roots.push(map[comment._id]);
    }
  });

  return roots;
}
