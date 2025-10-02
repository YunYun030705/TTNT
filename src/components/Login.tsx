import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { User } from "../types";

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let userCredential;

      if (isRegister) {
        // Validate inputs
        if (!name.trim()) {
          alert("Vui lòng nhập họ tên!");
          setLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const userData: User = {
          uid: userCredential.user.uid,
          email,
          name: name.trim(),
          role,
        };

        await setDoc(doc(db, "users", userCredential.user.uid), userData);
        onLogin(userData);
      } else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Lấy thông tin user từ Firestore
        const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
        if (userDoc.exists()) {
          onLogin(userDoc.data() as User);
        } else {
          const defaultUserData: User = {
            uid: userCredential.user.uid,
            email: userCredential.user.email || email,
            name: userCredential.user.displayName || "User",
            role: "student",
          };
          await setDoc(
            doc(db, "users", userCredential.user.uid),
            defaultUserData
          );
          onLogin(defaultUserData);
        }
      }
    } catch (error: any) {
      console.error("Error:", error);
      let errorMessage = isRegister
        ? "Đăng ký thất bại!"
        : "Đăng nhập thất bại!";

      // Provide more specific error messages
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email này đã được sử dụng!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Mật khẩu quá yếu! Vui lòng nhập ít nhất 6 ký tự.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Email không hợp lệ!";
      } else if (error.code === "auth/user-not-found") {
        errorMessage = "Không tìm thấy tài khoản này!";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mật khẩu không đúng!";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Thông tin đăng nhập không hợp lệ!";
      }

      alert(errorMessage);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>{isRegister ? "Đăng Ký" : "Đăng Nhập"}</h2>

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <div className="form-group">
                <label>Họ tên:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Vai trò:</label>
                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as "teacher" | "student")
                  }
                >
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : isRegister ? "Đăng Ký" : "Đăng Nhập"}
          </button>
        </form>

        <p>
          {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
          <button
            className="link-button"
            onClick={() => setIsRegister(!isRegister)}
            type="button"
          >
            {isRegister ? "Đăng nhập" : "Đăng ký"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
