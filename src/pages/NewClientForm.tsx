import { Navigate, useLocation, useParams } from "react-router-dom";

// Keep old bookmarks and client-side links working without rendering the retired form.
const NewClientForm = () => {
  const { agentSlug } = useParams();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  if (agentSlug) query.set('agent', agentSlug);
  const suffix = query.toString();
  return <Navigate to={`/contact${suffix ? '?' + suffix : ''}`} state={location.state} replace />;
};

export default NewClientForm;
