import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';

import Header from './components/shared/header';
import Sidebar from './components/shared/sidebar';
import CustomHome from './CustemHome';
import Loading from './components/shared/ui/Loading';

import Login from './components/auth/login';
import ProtectedRoute from './components/auth/ProtectedRoute';

import AdminDashboard from './components/components/admin/adminDashboard';
import TeacherDashboard from './components/components/teacher/TeacherDashboard';
import ParentDashboard from './components/components/parent/parentDashboard';
import StudentDashboard from './components/components/student/StudentDashboard';
import AdminUserDashboard from './components/components/admin/AdminUserDashboard';
import AdminDepartmentsDashboard from './components/components/admin/AdminDepartmentsDashboard';
import AdminFormDashboard from './components/components/admin/adminFormDashboard';
import AboutHome from './components/pages/about/aboutHome';
import AboutUs from './components/pages/about/aboutUs';
import AboutFuture from './components/pages/about/aboutFuture';
import AboutInspire from './components/pages/about/aboutInspire';
import AboutVideo from './components/pages/about/aboutVideo';
import StartFuture from './components/pages/about/startFuture';
import NotFound from './components/pages/notFound/pageNotFound';
import NewsHome from './components/pages/news/NewHome';
import BookHome from './components/pages/books/bookHome';
import BookstoreSections from './components/pages/books/BookstoreSections';
import BookstoreServices from './components/pages/books/BookService';
import Footer from './components/pages/footer';

// Visit tracking hook
import useTrackVisit from './hooks/useTrackingVisit';
import LibrarianDashboard from './components/components/librarian/LibrarianDashboard';
import LibrarianBookStore from './components/components/librarian/LibrarianBookStore'
import BorrowedBookDashboard from './components/components/librarian/BorrowedBookDashboard';
import LibrarianMembers from './components/components/librarian/librarianMembers';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track every route visit (fires once per path change)
  useTrackVisit();

  /*
   * Close sidebar
   */
  useEffect(() => {
    const closeSidebar = () => {
      setSidebarOpen(false);
    };

    window.addEventListener('close-sidebar', closeSidebar);

    return () => {
      window.removeEventListener('close-sidebar', closeSidebar);
    };
  }, []);

  /*
   * Application loading
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  /*
   * Show loading screen
   */
  if (loading) {
    return <Loading />;
  }

  return (
    <Routes>
      {/* ========================================= */}
      {/* HOME PAGE */}
      {/* ========================================= */}

      <Route
        path="/"
        element={
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Header
              onMenuClick={() => setSidebarOpen((prev) => !prev)}
              sidebarOpen={sidebarOpen}
            />
            <Sidebar isOpen={sidebarOpen} />
            <main className="min-h-screen pl-0 transition-all duration-300">
              <CustomHome />
            </main>
          </div>
        }
      />

      {/* ========================================= */}
      {/* LOGIN */}
      {/* ========================================= */}

      <Route path="/login" element={<Login />} />

      {/* ========================================= */}
      {/* ABOUT */}
      {/* ========================================= */}

      <Route
        path="/about"
        element={
          <>
            <Header />
            <AboutHome />
            <AboutUs />
            <AboutFuture />
            <AboutInspire />
            <AboutVideo />
            <StartFuture />
          </>
        }
      />

      {/* ========================================= */}
      {/* News */}
      {/* ========================================= */}

      <Route
        path="/news"
        element={
          <>
            <Header />
            <NewsHome />
            <Footer />
          </>
        }
      />

      {/* ========================================= */}
      {/* books store */}
      {/* ========================================= */}

      <Route
        path="/books"
        element={
          <>
            <Header />
            <BookHome />
            <BookstoreSections />
            <BookstoreServices />
            <Footer />
          </>
        }
      />

      {/* ========================================= */}
      {/* ADMIN DASHBOARD */}
      {/* ========================================= */}

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
              <Header
                onMenuClick={() => setSidebarOpen((prev) => !prev)}
                sidebarOpen={sidebarOpen}
              />
              <Sidebar isOpen={sidebarOpen} />
              <AdminDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/manage"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
              <Header
                onMenuClick={() => setSidebarOpen((prev) => !prev)}
                sidebarOpen={sidebarOpen}
              />
              <Sidebar isOpen={sidebarOpen} />
              <AdminUserDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/departments/manage"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
              <Header
                onMenuClick={() => setSidebarOpen((prev) => !prev)}
                sidebarOpen={sidebarOpen}
              />
              <Sidebar isOpen={sidebarOpen} />
              <AdminDepartmentsDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/forms/manage"
        element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 relative">
              <Header
                onMenuClick={() => setSidebarOpen((prev) => !prev)}
                sidebarOpen={sidebarOpen}
              />
              <Sidebar isOpen={sidebarOpen} />
              <AdminFormDashboard />
            </div>
          </ProtectedRoute>
        }
      />

      {/* ========================================= */}
      {/* TEACHER DASHBOARD */}
      {/* ========================================= */}

      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Teacher']}>
            <Header
              onMenuClick={() => setSidebarOpen((prev) => !prev)}
              sidebarOpen={sidebarOpen}
              />
            <Sidebar isOpen={sidebarOpen} />
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      

      {/* ========================================= */}
      {/* PARENT DASHBOARD */}
      {/* ========================================= */}

      <Route
        path="/user/parent/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Parent']}>
            <ParentDashboard />
          </ProtectedRoute>
        }
      />

      {/* ========================================= */}
      {/* STUDENT DASHBOARD */}
      {/* ========================================= */}

      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['Student']}>
            <Header
              onMenuClick={() => setSidebarOpen((prev) => !prev)}
              sidebarOpen={sidebarOpen}
              />
            <Sidebar isOpen={sidebarOpen} />
            <StudentDashboard />
          </ProtectedRoute>
        }
        />

        {/* ========================================= */}
        {/* LIBRARIAN DASHBOARD */}
        {/* ========================================= */}
      <Route path="/librarian/dashboard"
             element={
              <ProtectedRoute allowedRoles={['Librarian']}>
                <Header
                  onMenuClick={() => setSidebarOpen((prev) => !prev)}
                  sidebarOpen={sidebarOpen}
                  />
                <Sidebar isOpen={sidebarOpen} />
                <LibrarianDashboard />
              </ProtectedRoute>
             }
      />

      <Route path="/librarian/books"
             element={
              <ProtectedRoute allowedRoles={['Librarian']}>
                <Header
                  onMenuClick={() => setSidebarOpen((prev) => !prev)}
                  sidebarOpen={sidebarOpen}
                  />
                <Sidebar isOpen={sidebarOpen} />
                <LibrarianBookStore />
              </ProtectedRoute>
             }
      />

      <Route path="/librarian/borrowed"
            element={
              <ProtectedRoute allowedRoles={['Librarian']}>
                <Header
                  onMenuClick={() => setSidebarOpen((pre) => !pre)}
                  sidebarOpen={sidebarOpen} />
                  <Sidebar isOpen={sidebarOpen} />
                  <BorrowedBookDashboard />
              </ProtectedRoute>
            }
      />

      <Route path="/librarian/members"
            element={
              <ProtectedRoute allowedRoles={['Librarian']}>
                <Header
                  onMenuClick={() => setSidebarOpen((pre) => !pre)}
                  sidebarOpen={sidebarOpen} />
                  <Sidebar isOpen={sidebarOpen} />
                  <LibrarianMembers />
              </ProtectedRoute>
            }
      />



      {/* page doesn't exist */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;