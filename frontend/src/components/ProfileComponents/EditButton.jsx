const EditButton = ({ onClick }) => (
  <button
    className="mt-4 px-5 py-1.5 border border-gray-500 rounded-full font-bold hover:bg-gray-900/60 transition"
    onClick={onClick}
  >
    Edit profile
  </button>
);
export default EditButton;
