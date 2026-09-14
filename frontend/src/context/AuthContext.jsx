import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  function login({ email, password }) {
    if (!email || !password) {
      return {
        success: false,
        message: 'Enter both your email address and password.',
      }
    }

    const demoUser = {
      id: 1,
      name: 'Dr. Jordan Miller',
      email,
      role: 'Clinician',
    }

    setUser(demoUser)

    return {
      success: true,
      user: demoUser,
    }
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}