

import { useCallback, useState } from "react";
import FloatingMenu from "../../shared/ui/FloatingMenu";
import { ProfileList, UserProfileCard } from '../../components/profile'
import TeacherAssignmentList from "../teacher/teacherAssignmentList";

const ROLE_TABS = [
  { key: "User", label: "All Users" },
  { key: "Student", label: "Students" },
  { key: "Teacher", label: "Teachers" },
  { key: "Parent", label: "Parents" },
  { key: "Librarian", label: "Librarians" },
  { key: "Admin", label: "Admins" },
];

export default function AdminUserDashboard() {
  const [role, setRole] = useState("User");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [view, setView] = useState("list");

  const handleView = useCallback((profile) => {
    if (!profile || (!profile._id && !profile.id)) return;
    setSelectedProfile(profile);
    setView("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    setView("list");
    setSelectedProfile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEdit = useCallback((p) => console.log("Edit:", p), []);

  const handleDeleted = useCallback(
    (id) => {
      if (selectedProfile && (selectedProfile._id || selectedProfile.id) === id) {
        handleBack();
      }
    },
    [selectedProfile, handleBack]
  );

  const handleStatusChanged = useCallback((id, status) => {
    setSelectedProfile((prev) =>
      prev && (prev._id || prev.id) === id ? { ...prev, status } : prev
    );
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#f3f3f3] px-4 py-6 dark:bg-[#111111] relative top-12">
      <div className="mx-auto w-[96%]">
        {view === "detail" && selectedProfile ? (
          <div className="space-y-4">
            <button
              onClick={handleBack}
              className="text-sm font-medium text-[#14b8a6] hover:underline"
            >
              ← Back to list
            </button>

            <UserProfileCard
              profile={selectedProfile}
              variant="card"
              onEdit={handleEdit}
              onDeleted={handleDeleted}
              onStatusChanged={handleStatusChanged}
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  User Management
                </h1>
                <p className="text-sm text-gray-500">
                  Browse, edit, and manage user accounts.
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ROLE_TABS.map((tab) => {
                  const active = role === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setRole(tab.key)}
                      className={`h-8 rounded px-3 text-xs font-medium transition ${
                        active
                          ? "bg-[#14b8a6] text-white"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-gray-200 dark:hover:bg-[#262626]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <ProfileList
              key={role}
              role={role}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
              onStatusChanged={handleStatusChanged}
              onView={handleView}
            />
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1">
          <TeacherAssignmentList />
      </div>

      <FloatingMenu />
    </div>
  );
}