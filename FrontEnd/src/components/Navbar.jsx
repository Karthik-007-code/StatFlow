import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import "./Navbar.css";

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        <span className="navbar__logo">📊</span>
        <span className="navbar__title">StatFlow</span>
      </Link>

      <div className="navbar__links">
        {user ? (
          <>
            <Link to="/dashboard" className="navbar__link">
              Dashboard
            </Link>
            <Link to="/report" className="navbar__link">
              Report
            </Link>
            <div className="navbar__user">
              <span className="navbar__greeting">Hi, {user.name}</span>
              <button onClick={handleLogout} className="navbar__logout-btn">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">
              Login
            </Link>
            <Link to="/register" className="navbar__link navbar__link--cta">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
