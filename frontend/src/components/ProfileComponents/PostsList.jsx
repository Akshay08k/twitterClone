import Post from "../Posts";

const PostsList = ({ tweets, user, editable = false, onPostDeleted }) => {
  if (!Array.isArray(tweets) || tweets.length === 0) {
    return <p className="text-gray-500 p-6 text-center text-sm">No posts to display</p>;
  }

  return (
    <div className="divide-y divide-[#24272c]">
      {tweets.map((post) => {
        const postWithUser = { ...post, user: post.user || user };
        return (
          <Post
            key={post._id}
            post={postWithUser}
            editable={editable}
            onPostDeleted={onPostDeleted}
          />
        );
      })}
    </div>
  );
};

export default PostsList;
