import { onAuthStateChanged } from "firebase/auth"
import React from "react"
import { useNavigate } from "react-router-dom"
import { auth } from "../config/firebase"

export default function useAuth() {
  const navigate = useNavigate()
  const [user, setUser] = React.useState(null)
  React.useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) navigate("/")

      setUser(user)
    })
  }, [])

  return {
    user,
  }
}
