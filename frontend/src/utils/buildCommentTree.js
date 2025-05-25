// src/utils/buildCommentTree.js

export function buildCommentTree(comments) {
  const map = {};
  const roots = [];

  // Create a map of id to comment and initialize replies
  comments.forEach((comment) => {
    map[comment._id] = { ...comment, replies: [] };
  });

  // Assign replies to their parent comment
  comments.forEach((comment) => {
    if (comment.parentComment) {
      const parent = map[comment.parentComment];
      if (parent) {
        parent.replies.push(map[comment._id]);
      }
    } else {
      roots.push(map[comment._id]);
    }
  });

  return roots;
}
