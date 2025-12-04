// Authentication utility functions using localStorage

const AUTH_TOKEN_KEY = 'skope_auth_token'
const USER_KEY = 'skope_user'

export const authUtils = {
  // Check if user is logged in
  isAuthenticated: () => {
    try {
      const token = localStorage.getItem(AUTH_TOKEN_KEY)
      return !!token
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  },

  // Set authentication token and user data
  setAuth: (token, user = null) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      if (user) {
        localStorage.setItem(USER_KEY, JSON.stringify(user))
      }
    } catch (error) {
      console.error('Error setting authentication:', error)
    }
  },

  // Get current user data
  getUser: () => {
    try {
      const userStr = localStorage.getItem(USER_KEY)
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error getting user:', error)
      return null
    }
  },

  // Clear authentication
  clearAuth: () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    } catch (error) {
      console.error('Error clearing authentication:', error)
    }
  }
}

