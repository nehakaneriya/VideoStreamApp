import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { ToastContainer } from "react-toastify";

import Login from "./pages/public/Login"
import Registration from "./pages/public/Registration"
import WatchVideo from "./pages/public/WatchVideo"
import Upload from "./pages/users/Upload"
import MyVideos from "./pages/users/Myvideos"
import Home from "./pages/public/Home"
import RootLayout from "./pages/public/RootLayout"
import UserHome from "./pages/users/UserHome"
import UserLayout from "./pages/users/UserLayout"
import AdminLayout from "./components/layout/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminVideos from "./pages/admin/AdminVideos"
import AdminFeedback from "./pages/admin/AdminFeedback"
import UserProfile from "./pages/users/UserProfile"
import UserFeedback from "./pages/users/UserFeedback"
import OAuthSuccess from "./pages/public/OAuthSuccess"
import OAuthFailure from "./pages/public/OAuthFailure"
import Adminlogin from "./pages/admin/Adminlogin";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
  <BrowserRouter>
    <Routes>

       {/* Public + User */}
  <Route path="/" element={<RootLayout />}>
    <Route index element={<Home />} />

    <Route path="login" element={<Login />} />
    <Route path="register" element={<Registration />} />
    <Route path="watch/:videoId" element={<WatchVideo />} />

    <Route path="UserHome" element={<UserLayout />}>
      <Route index element={<UserHome />} />
      <Route path="profile" element={<UserProfile />} />
      <Route path="upload" element={<Upload />} />
      <Route path="myvideos" element={<MyVideos />} />
      <Route path="feedback" element={<UserFeedback />} />
    </Route>

    <Route path="oauth/success" element={<OAuthSuccess />} />
    <Route path="oauth/failure" element={<OAuthFailure />} />
  </Route>

   <Route path="admin-login" element={<Adminlogin />} />

  {/* ADMIN ROUTES OUTSIDE ROOTLAYOUT */}
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="users" element={<AdminUsers />} />
    <Route path="videos" element={<AdminVideos />} />
    <Route path="feedbacks" element={<AdminFeedback />} />
  </Route>

</Routes>
     <ToastContainer
        position="top-right"
        autoClose={2000}
        theme="dark"
      />
    
  </BrowserRouter>
  </StrictMode>
);