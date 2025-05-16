import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { AuthProvider } from '../auths/AuthContext';
import { useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const route = useNavigate()
  const [showLoginPage, setShowLoginPage] = useState(false);

  const handleLoginClick = () => {
    route("/Login")

  };

  const handleCloseLoginPage = () => {
    setShowLoginPage(false);
  };

  return (
    <AuthProvider>
      <Header onLoginClick={handleLoginClick} />
      <main>{children}</main>
      <Footer />
    </AuthProvider>
  );
}

export default Layout;
