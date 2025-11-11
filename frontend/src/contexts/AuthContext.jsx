import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // OAuth2 format requires form data
      const formData = new FormData()
      formData.append('username', email)
      formData.append('password', password)

      const response = await axios.post('http://localhost:8000/api/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const { access_token, user: userData } = response.data
      
      setToken(access_token)
      setUser(userData)
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed'
      }
    }
  }

  const signup = async (email, password, fullName, accountType, companyName) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signup', {
        email,
        password,
        full_name: fullName,
        account_type: accountType,
        company_name: companyName
      })

      const { access_token, user: userData } = response.data
      
      setToken(access_token)
      setUser(userData)
      
      localStorage.setItem('token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Signup failed'
      }
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  }

  const updateUser = async (updates) => {
    try {
      const response = await axios.put('http://localhost:8000/api/auth/me', updates)
      const updatedUser = response.data
      
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Update failed'
      }
    }
  }

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
