import React, { useState, useEffect } from "react";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import { Class, User, Student, Attendance } from "../types";

// Helper function to safely format dates from Firestore
const formatFirestoreDate = (date: any): string => {
  try {
    if (!date) return "N/A";
    if (date instanceof Date) return date.toLocaleDateString();
    if (typeof date === "object" && date.seconds)
      return new Date(date.seconds * 1000).toLocaleDateString();
    if (
      typeof date === "object" &&
      date.toDate &&
      typeof date.toDate === "function"
    ) {
      return date.toDate().toLocaleDateString();
    }
    if (typeof date === "string" || typeof date === "number") {
      return new Date(date).toLocaleDateString();
    }
    return "N/A";
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};

interface TeacherDashboardProps {
  user: User;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const q = query(
          collection(db, "classes"),
          where("teacherId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const classesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Class[];
        setClasses(classesData);
      } catch (error) {
        console.error("Error fetching classes:", error);

        setClasses([]);
      }
    };
    fetchClasses();
  }, [user.uid]);

  const createClass = async () => {
    if (!newClassName.trim()) return;

    setLoading(true);
    try {
      const classCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const newClass: Omit<Class, "id"> = {
        name: newClassName,
        code: classCode,
        teacherId: user.uid,
        teacherName: user.name,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, "classes"), newClass);
      setClasses([...classes, { id: docRef.id, ...newClass }]);
      setNewClassName("");
      alert(`Lớp học đã được tạo với mã: ${classCode}`);
    } catch (error) {
      console.error("Error creating class:", error);
      alert("Tạo lớp học thất bại!");
    }
    setLoading(false);
  };

  const loadStudentsAndAttendance = async (classData: Class) => {
    setSelectedClass(classData);

    try {
      const studentsQuery = query(
        collection(db, "students"),
        where("classId", "==", classData.id)
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];
      setStudents(studentsData);
    } catch (error) {
      console.error("Error loading students:", error);
      setStudents([]);
    }

    try {
      const attendanceQuery = query(
        collection(db, "attendance"),
        where("classId", "==", classData.id)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceData = attendanceSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          timestamp: data.timestamp?.toDate
            ? data.timestamp.toDate()
            : new Date(data.timestamp),
        };
      }) as Attendance[];
      setAttendances(attendanceData);
    } catch (error) {
      console.error("Error loading attendance:", error);
      setAttendances([]);
    }
  };

  const getAttendanceStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayAttendance = attendances.filter((att) => {
      const attDate = new Date(att.timestamp);
      attDate.setHours(0, 0, 0, 0);
      return attDate.getTime() === today.getTime();
    });

    return {
      totalStudents: students.length,
      presentToday: todayAttendance.length,
      totalAttendance: attendances.length,
    };
  };

  return (
    <div className="teacher-dashboard">
      <h2>Dashboard Giảng Viên - {user.name}</h2>

      {/* Tạo lớp học mới */}
      <div className="create-class-section">
        <h3>Tạo Lớp Học Mới</h3>
        <div className="form-group">
          <input
            type="text"
            placeholder="Tên lớp học"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
          <button onClick={createClass} disabled={loading}>
            {loading ? "Đang tạo..." : "Tạo Lớp"}
          </button>
        </div>
      </div>

      {/* Danh sách lớp học */}
      <div className="classes-section">
        <h3>Danh Sách Lớp Học</h3>
        {classes.length === 0 ? (
          <p>Chưa có lớp học nào.</p>
        ) : (
          <div className="classes-grid">
            {classes.map((classItem) => (
              <div key={classItem.id} className="class-card">
                <h4>{classItem.name}</h4>
                <p>
                  <strong>Mã lớp:</strong> {classItem.code}
                </p>
                <p>
                  <strong>Tạo lúc:</strong>{" "}
                  {formatFirestoreDate(classItem.createdAt)}
                </p>
                <button onClick={() => loadStudentsAndAttendance(classItem)}>
                  Xem Chi Tiết
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedClass && (
        <div className="class-details">
          <h3>
            Lớp: {selectedClass.name} (Mã: {selectedClass.code})
          </h3>

          {/* Thống kê */}
          <div className="stats">
            <div className="stat-card">
              <h4>Tổng SV</h4>
              <p>{getAttendanceStats().totalStudents}</p>
            </div>
            <div className="stat-card">
              <h4>Có mặt hôm nay</h4>
              <p>{getAttendanceStats().presentToday}</p>
            </div>
            <div className="stat-card">
              <h4>Tổng lượt điểm danh</h4>
              <p>{getAttendanceStats().totalAttendance}</p>
            </div>
          </div>

          <div className="students-list">
            <h4>Danh Sách Sinh Viên</h4>
            {students.length === 0 ? (
              <p>Chưa có sinh viên nào đăng ký.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Đã đăng ký face</th>
                    <th>Ngày đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td>{student.name}</td>
                      <td>{student.email}</td>
                      <td>{student.faceEncoding ? "Có" : "Chưa"}</td>
                      <td>{formatFirestoreDate(student.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="attendance-history">
            <h4>Lịch Sử Điểm Danh</h4>
            {attendances.length === 0 ? (
              <p>Chưa có lượt điểm danh nào.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Sinh viên</th>
                    <th>Thời gian</th>
                    <th>Độ tin cậy</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.slice(0, 20).map((attendance) => (
                    <tr key={attendance.id}>
                      <td>{attendance.studentName}</td>
                      <td>
                        {attendance.timestamp instanceof Date
                          ? attendance.timestamp.toLocaleString()
                          : formatFirestoreDate(attendance.timestamp)}
                      </td>
                      <td>
                        {attendance.confidence
                          ? `${(attendance.confidence * 100).toFixed(1)}%`
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
