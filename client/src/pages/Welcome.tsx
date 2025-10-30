import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

/**
 * Welcome/Landing Page
 * Mix Reference Analyzer - Compare your mixes against professional reference tracks
 */
const Welcome = () => {
  return (
    <div className="welcome-page">
      <h1>Mix Reference Analyzer</h1>
      <p>Compare your mixes against professional reference tracks</p>

      {/* Temporary: Showing auth forms directly for testing */}
      <div>
        <h2>Register</h2>
        <RegisterForm />
      </div>

      <div>
        <h2>Login</h2>
        <LoginForm />
      </div>
    </div>
  );
};

export default Welcome;
