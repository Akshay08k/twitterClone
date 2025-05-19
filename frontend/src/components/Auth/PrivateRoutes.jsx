import { useAuth } from "../../contexts/AuthContext";

const PrivateRoutes = ({ element }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="text-white p-4">Loading route...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return element;
};

export default PrivateRoutes;
