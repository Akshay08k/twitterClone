import Post from "../Posts";

const PostsList = ({ tweets, user, editable = false }) => {
  if (!Array.isArray(tweets) || tweets.length === 0) {
    return <p className="text-gray-500 p-4">No posts to display</p>;
  }

  return tweets.map((post) => {
    const postWithUser = { ...post, user };
    return <Post key={post._id} post={postWithUser} editable={editable} />;
  });
};

export default PostsList;
