import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./services/firebase";
import { User } from "./types";

// Components
import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import FaceRegistration from "./components/FaceRegistration";
import AttendanceCheck from "./components/AttendanceCheck";

import "./App.css";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "register" | "attendance"
  >("dashboard");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setCurrentView("dashboard");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <header className="app-header">
        <h1>Hệ Thống Điểm Danh Sinh Viên</h1>
        <div className="user-info">
          <span>
            Xin chào, {user.name} (
            {user.role === "teacher" ? "Giảng viên" : "Sinh viên"})
          </span>
          <button onClick={handleLogout} className="logout-btn">
            Đăng xuất
          </button>
        </div>
      </header>
      <nav className="navigation">
        {user.role === "teacher" ? (
          <button
            className={currentView === "dashboard" ? "active" : ""}
            onClick={() => setCurrentView("dashboard")}
          >
            <span className="material-icons">dashboard</span>
            Dashboard
          </button>
        ) : (
          <>
            <button
              className={currentView === "register" ? "active" : ""}
              onClick={() => setCurrentView("register")}
            >
              <span className="material-icons">face</span>
              Đăng Ký Khuôn Mặt
            </button>
            <button
              className={currentView === "attendance" ? "active" : ""}
              onClick={() => setCurrentView("attendance")}
            >
              <span className="material-icons">how_to_reg</span>
              Điểm Danh
            </button>
          </>
        )}
      </nav>{" "}
      <main className="main-content">
        {user.role === "teacher" ? (
          <TeacherDashboard user={user} />
        ) : (
          <>
            {currentView === "register" && <FaceRegistration user={user} />}
            {currentView === "attendance" && <AttendanceCheck user={user} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
