import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthProvider, AuthContext } from "./AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Polaznici from "./pages/Polaznici";
import Radionice from "./pages/Radionice";
import Prisustva from "./pages/Prisustva";
import RadionicaDetalji from "./pages/RadionicaDetalji";

function ProtectedRoute({ children, adminOnly }) {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" />;
  return children;
}

function Navbar() {
  const { user, setToken } = useContext(AuthContext);
  return (
    <nav>
      <Link to="/">Početna</Link>
      <Link to="/radionice">Radionice</Link>
      <Link to="/polaznici">Polaznici</Link>
      <Link to="/prisustva">Prisustva</Link>
      {!user && <Link to="/login">Prijava</Link>}
      {!user && <Link to="/register">Registracija</Link>}
      {user && <span style={{ marginLeft: 24 }}>{user.email} ({user.role})</span>}
      {user && <button onClick={() => { setToken(""); }}>Odjava</button>}
    </nav>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/radionice" element={
          <ProtectedRoute><Radionice/></ProtectedRoute>
        }/>
        <Route path="/polaznici" element={
          <ProtectedRoute><Polaznici/></ProtectedRoute>
        }/>
        <Route path="/prisustva" element={
          <ProtectedRoute><Prisustva/></ProtectedRoute>
        }/>
        <Route path="/radionice/:id" element={
          <ProtectedRoute><RadionicaDetalji/></ProtectedRoute>
        }/>
        {/* Admin only example */}
        {/* <Route path="/admin" element={
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard/>
          </ProtectedRoute>
        }/> */}
      </Routes>
    </AuthProvider>
  );
}
