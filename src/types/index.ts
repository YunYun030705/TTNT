export interface User {
  uid: string;
  email: string;
  role: "teacher" | "student";
  name: string;
}

export interface Class {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  teacherName: string;
  createdAt: Date | any; // Firestore timestamp
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  faceEncoding?: string; // Base64 encoded face data
  registeredAt: Date | any; // Firestore timestamp
}

export interface Attendance {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  timestamp: Date | any; // Firestore timestamp
  confidence?: number;
}
