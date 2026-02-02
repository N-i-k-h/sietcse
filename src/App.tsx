import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './pages/Login';
import { Unauthorized } from './pages/Unauthorized';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AdminDashboard } from './pages/admin/Dashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { Academics } from './pages/admin/Academics';
import { HodDashboard } from './pages/hod/Dashboard';
import { MySchedule } from './pages/staff/MySchedule';
import { Attendance } from './pages/staff/Attendance';
import { MarksEntry } from './pages/staff/MarksEntry';
import { StudentDashboard } from './pages/student/Dashboard';
import { DeptOverview } from './pages/hod/DeptOverview';
import { FacultySearch } from './pages/hod/FacultySearch';
import { FacultyList } from './pages/admin/FacultyList';
import { StudentList } from './pages/admin/StudentList';
import { Settings } from './pages/admin/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/faculty" element={<FacultyList />} />
              <Route path="admin/students" element={<StudentList />} />
              <Route path="admin/academics" element={<Academics />} />
              <Route path="admin/settings" element={<Settings />} />
            </Route>

            {/* HOD Routes */}
            <Route element={<ProtectedRoute allowedRoles={['hod']} />}>
              <Route path="hod" element={<HodDashboard />} />
              <Route path="hod/overview" element={<DeptOverview />} />
              <Route path="hod/faculty" element={<FacultySearch />} />
            </Route>

            {/* Staff Routes */}
            <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
              <Route path="staff" element={<MySchedule />} />
              <Route path="staff/schedule" element={<MySchedule />} />
              <Route path="staff/attendance" element={<Attendance />} />
              <Route path="staff/marks" element={<MarksEntry />} />
            </Route>

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="student" element={<StudentDashboard />} />
              <Route path="student/profile" element={<StudentDashboard />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
