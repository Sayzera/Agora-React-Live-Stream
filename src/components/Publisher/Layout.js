import React from "react"
import { Outlet } from "react-router-dom"
import Nav from "./Nav"

export default function PublisherLayout() {
  return (
    <div>
      <div>
        <Nav />
      </div>
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <Outlet />
      </div>
    </div>
  )
}
