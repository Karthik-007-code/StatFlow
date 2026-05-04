import { Link } from "react-router-dom";
import "./Landing.css";

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing__hero">
        <h1 className="landing__title">
          Master Your Goals with <span className="text-gradient">StatFlow</span>
        </h1>
        <p className="landing__subtitle">
          Track your weekly progress, visualize your habits, and achieve more every day with our powerful analytics dashboard.
        </p>
        <div className="landing__ctas">
          <Link to="/register" className="btn btn--primary">Get Started for Free</Link>
          <Link to="/login" className="btn btn--secondary">Sign In</Link>
        </div>
      </div>

      <div className="landing__features">
        <div className="feature-card">
          <div className="feature-card__icon">📅</div>
          <h3>Weekly Planning</h3>
          <p>Organize your goals in a simple 7-day grid that keeps you focused.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">📊</div>
          <h3>Deep Insights</h3>
          <p>Visualize your progress with beautiful pie and bar charts.</p>
        </div>
        <div className="feature-card">
          <div className="feature-card__icon">🔔</div>
          <h3>Smart Reminders</h3>
          <p>Never miss a habit with custom notifications for every task.</p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
