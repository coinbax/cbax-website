// Enhanced password protection for presentation
(function() {
  // Password configuration
  const correctPassword = "trustcbax";
  
  // Check if already authenticated
  function isAuthenticated() {
    return sessionStorage.getItem('cbax_auth') === 'true';
  }
  
  // Set authentication state
  function setAuthenticated(value) {
    sessionStorage.setItem('cbax_auth', value ? 'true' : 'false');
  }
  
  // Main authentication flow
  function checkAuth() {
    // Skip auth check if we're in PDF print mode or on the login page
    if (window.location.search.includes('print-pdf') || 
        window.location.pathname.includes('login.html')) {
      return true;
    }
    
    if (!isAuthenticated()) {
      // Redirect to the full-screen login page
      window.location.href = "login.html";
      return false;
    }
    return true;
  }
  
  // Run auth check on page load
  window.addEventListener('DOMContentLoaded', function() {
    checkAuth();
  });
  
  // Expose to global scope for direct use
  window.cbaxAuth = {
    check: checkAuth,
    logout: function() {
      setAuthenticated(false);
      window.location.href = "login.html";
    },
    isAuthenticated: isAuthenticated
  };
})(); 