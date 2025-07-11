
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Landing from './Landing';

const Index = () => {
  const navigate = useNavigate();

  // Redirect to landing page component
  useEffect(() => {
    // The Landing component is now our main index page
  }, []);

  return <Landing />;
};

export default Index;
