import React from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AdminLayout from "../components/Admin/Layout"
import Layout from "../components/Layout"
import PublisherLayout from "../components/Publisher/Layout"
import AdminHome from "../views/admin"
import Pays from "../views/pays"
import PublisherHomeScreen from "../views/publisher/home"
import LiveStreams from "../views/publisher/liveStreams"

const Login = React.lazy(() => import("../views/login"))
const Register = React.lazy(() => import("../views/register"))
const UserHomeScreen = React.lazy(() => import("../views/user/home"))

export default function Navigation() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* suspense */}

          <Route element={<AdminLayout />}>
            <Route path="/admin-home" element={<AdminHome />} />
          </Route>

          <Route element={<PublisherLayout />}>
            <Route path="/publisher-home" element={<PublisherHomeScreen />} />
            <Route path="/live-streams/:id/:userId" element={<LiveStreams />} />
          </Route>

          <Route element={<Layout />}>
            <Route path="/user-home" element={<UserHomeScreen />} />
            <Route path="/add-money" element={<Pays />} />
          </Route>
        </Routes>
      </Router>
    </React.Suspense>
  )
}
