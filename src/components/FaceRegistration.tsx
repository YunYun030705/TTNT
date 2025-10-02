import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";
import { User, Class, Student } from "../types";

interface FaceRegistrationProps {
  user: User;
}

const FaceRegistration: React.FC<FaceRegistrationProps> = ({ user }) => {
  const webcamRef = useRef<Webcam>(null);
  const [classCode, setClassCode] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const findClass = async () => {
    if (!classCode.trim()) return;

    setLoading(true);
    try {
      const q = query(
        collection(db, "classes"),
        where("code", "==", classCode.toUpperCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("Không tìm thấy lớp học với mã này!");
        return;
      }

      const classDoc = querySnapshot.docs[0];
      const classData = { id: classDoc.id, ...classDoc.data() } as Class;

      // Kiểm tra xem sinh viên đã đăng ký lớp này chưa
      const studentQuery = query(
        collection(db, "students"),
        where("email", "==", user.email),
        where("classId", "==", classData.id)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (!studentSnapshot.empty) {
        const studentData = studentSnapshot.docs[0].data() as Student;
        if (studentData.faceEncoding) {
          setIsRegistered(true);
          alert("Bạn đã đăng ký khuôn mặt cho lớp này rồi!");
        }
      }

      setSelectedClass(classData);
    } catch (error) {
      console.error("Error finding class:", error);
      alert("Lỗi khi tìm lớp học!");
    }
    setLoading(false);
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const registerFace = async () => {
    if (!capturedImage || !selectedClass) return;

    setLoading(true);
    try {
      // Upload ảnh lên Firebase Storage
      const imageRef = ref(
        storage,
        `faces/${user.uid}_${selectedClass.id}.jpg`
      );
      await uploadString(imageRef, capturedImage, "data_url");
      const imageUrl = await getDownloadURL(imageRef);

      // Kiểm tra xem sinh viên đã có trong lớp này chưa
      const studentQuery = query(
        collection(db, "students"),
        where("email", "==", user.email),
        where("classId", "==", selectedClass.id)
      );
      const studentSnapshot = await getDocs(studentQuery);

      if (studentSnapshot.empty) {
        // Tạo record sinh viên mới
        const studentData: Omit<Student, "id"> = {
          name: user.name,
          email: user.email,
          classId: selectedClass.id,
          faceEncoding: imageUrl,
          registeredAt: new Date(),
        };

        await addDoc(collection(db, "students"), studentData);
      } else {
        const studentDoc = studentSnapshot.docs[0];
        await updateDoc(studentDoc.ref, {
          faceEncoding: imageUrl,
          registeredAt: new Date(),
        });
      }

      alert("Đăng ký khuôn mặt thành công!");
      setIsRegistered(true);
      setCapturedImage(null);
    } catch (error) {
      console.error("Error registering face:", error);
      alert("Đăng ký khuôn mặt thất bại!");
    }
    setLoading(false);
  };

  return (
    <div className="face-registration">
      <h2>Đăng Ký Khuôn Mặt - {user.name}</h2>

      {!selectedClass ? (
        <div className="class-finder">
          <h3>Nhập Mã Lớp Học</h3>
          <div className="form-group">
            <input
              type="text"
              placeholder="Nhập mã lớp (6 ký tự)"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              maxLength={6}
            />
            <button onClick={findClass} disabled={loading}>
              {loading ? "Đang tìm..." : "Tìm Lớp"}
            </button>
          </div>
        </div>
      ) : (
        <div className="registration-section">
          <div className="class-info">
            <h3>Lớp: {selectedClass.name}</h3>
            <p>Giảng viên: {selectedClass.teacherName}</p>
            <p>Mã lớp: {selectedClass.code}</p>
          </div>

          <div className="face-capture">
            <h4>
              {isRegistered ? "Chụp Lại Khuôn Mặt" : "Chụp Ảnh Khuôn Mặt"}
            </h4>

            {!capturedImage ? (
              <div className="webcam-container">
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  className="webcam"
                  videoConstraints={{
                    width: 640,
                    height: 480,
                    facingMode: "user",
                  }}
                />
                <div className="capture-controls">
                  <button onClick={capturePhoto} className="capture-btn">
                    Chụp Ảnh
                  </button>
                </div>
              </div>
            ) : (
              <div className="captured-image">
                <img src={capturedImage} alt="Captured face" />
                <div className="image-controls">
                  <button onClick={retakePhoto} className="secondary-btn">
                    Chụp Lại
                  </button>
                  <button
                    onClick={registerFace}
                    disabled={loading}
                    className="primary-btn"
                  >
                    {loading ? "Đang đăng ký..." : "Đăng Ký Khuôn Mặt"}
                  </button>
                </div>
              </div>
            )}

            <div className="instructions">
              <h5>Hướng dẫn:</h5>
              <ul>
                <li>Nhìn thẳng vào camera</li>
                <li>Đảm bảo ánh sáng đủ</li>
                <li>Không đeo kính râm hoặc khẩu trang</li>
                <li>Khuôn mặt hiện rõ trong khung hình</li>
                {isRegistered && (
                  <li>
                    <strong>Bạn có thể chụp lại để cập nhật khuôn mặt</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {isRegistered && (
            <div className="registration-status">
              <div className="success-message">
                <h4>✅ Đã đăng ký khuôn mặt thành công!</h4>
                <p>Bạn có thể chụp lại để cập nhật hoặc tiến hành điểm danh.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setSelectedClass(null);
              setClassCode("");
              setIsRegistered(false);
            }}
            className="back-btn"
          >
            Quay lại
          </button>
        </div>
      )}
    </div>
  );
};

export default FaceRegistration;
