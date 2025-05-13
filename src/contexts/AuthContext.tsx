import React, { createContext, useContext, useState } from 'react'

interface UserData {
  id: string
  vereador_id: number | null
  nome: string
  email: string
}

interface AuthContextType {
  userData: UserData | null
  setUserData: (data: UserData | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(() => {
    const stored = localStorage.getItem('userData')
    return stored ? JSON.parse(stored) : null
  })

  return (
    <AuthContext.Provider value={{ userData, setUserData }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}