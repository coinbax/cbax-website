// Simple password protection for presentation
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
  
  // Prompt for password 
  function promptPassword() {
    const password = prompt("Please enter the password to access this presentation:", "");
    
    if (password === correctPassword) {
      setAuthenticated(true);
      return true;
    } else {
      if (password !== null) { // Only show error if they actually attempted a password
        alert("Incorrect password. Access denied.");
      }
      return false;
    }
  }
  
  // Main authentication flow
  function checkAuth() {
    // Skip auth check if we're in PDF print mode
    if (window.location.search.includes('print-pdf')) {
      return true;
    }
    
    if (!isAuthenticated()) {
      // If not authenticated, prompt for password
      if (!promptPassword()) {
        // If authentication failed, redirect to login page
        window.location.href = "login.html";
        return false;
      }
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
    }
  };
})(); 