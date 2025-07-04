export const handleLogout = (navigate: (to: string) => void) => {
  // Clear all auth-related items from localStorage
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  
  // Use the navigate function to redirect
  navigate('/login');
      navigate("/home");
        setTimeout(() => {
        window.location.reload();
      }, 100);
};
