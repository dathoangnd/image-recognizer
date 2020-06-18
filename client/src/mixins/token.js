module.exports = {
  methods: {
    storeToken(token) {
      try {
        let base64Url = token.split('.')[1];
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
  
        let payload = JSON.parse(jsonPayload);
        localStorage.irToken = token
        this.$store.dispatch('updateUser', payload)
      } catch(e) {
        // Silence is golden
      }
    },
    
    removeToken() {
      localStorage.irToken = undefined
      this.$store.dispatch('updateUser', {})
    }
  }
}