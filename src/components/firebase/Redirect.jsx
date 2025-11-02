import { Navigate } from "react-router-dom";

const Redirect = ({ url }) => {
  return <Navigate to={url} replace />;
};

export default Redirect;
