import { useFullProfile } from "../../../hooks/useFullProfile";
import ProfileAvatar from "./ProfileAvatar";
import StatusBadge from "./StatusBadge";
import ProfileActions from "./ProfileActions";

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

const fmtLabel = (v) =>
  typeof v === "string" && v.includes("_") ? v.replace(/_/g, " ") : v;

function Field({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium text-gray-800 capitalize dark:text-gray-200">
        {value ?? "—"}
      </p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-[#2a2a2a] dark:bg-[#1A1A1A]">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {title}
      </h4>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">{children}</div>
    </div>
  );
}

export default function UserProfileDetail({
  profileId,
  role,
  onEdit,
  onDeleted,
  onStatusChanged,
}) {
  const { profile, loading, error, refetch } = useFullProfile(role, profileId);

  if (loading) {
    return (
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-[#1A1A1A]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#14b8a6] dark:border-[#2a2a2a]" />
          <p className="text-sm text-gray-500">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-400">
        {error}{" "}
        <button onClick={refetch} className="underline">
          Retry
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const currentStatus = profile.status ?? "inactive";
  const roleKey = `${role.toLowerCase()}Profile`;
  const roleData = profile[roleKey];

  const renderRoleDetails = () => {
    switch (role) {
      case "Teacher":
        return (
          <Section title="Teacher Information">
            <Field label="Employee #" value={roleData?.employeeNumber} />
            <Field label="Specialization" value={roleData?.specialization} />
            <Field label="Hire Date" value={fmtDate(roleData?.hireDate)} />
          </Section>
        );

      case "Student":
        return (
          <>
            <Section title="Academic Information">
              <Field label="Admission #" value={roleData?.admissionNumber} />
              <Field
                label="Enrollment Date"
                value={fmtDate(roleData?.enrollmentDate)}
              />
              <Field
                label="Profile Completed"
                value={roleData?.profileCompleted ? "Yes" : "No"}
              />
            </Section>

            <Section title="Personal Information">
              <Field label="Gender" value={roleData?.gender} />
              <Field
                label="Date of Birth"
                value={fmtDate(roleData?.dateOfBirth)}
              />
              <Field label="Address" value={roleData?.address} />
            </Section>

            <Section title="Emergency Contact">
              <Field label="Name" value={roleData?.emergencyContactName} />
              <Field label="Phone" value={roleData?.emergencyContactPhone} />
            </Section>
          </>
        );

      case "Parent":
        return roleData ? (
          <Section title="Parent Information">
            <Field label="Occupation" value={roleData.occupation} />
            <Field label="Address" value={roleData.address} />
            <Field label="Emergency Phone" value={roleData.emergencyPhone} />
          </Section>
        ) : null;

      case "Librarian":
        return roleData ? (
          <Section title="Librarian Information">
            <Field label="Employee #" value={roleData.employeeNumber} />
            <Field label="Position" value={fmtLabel(roleData.position)} />
            <Field label="Hire Date" value={fmtDate(roleData.hireDate)} />
          </Section>
        ) : null;

      case "Admin":
        return roleData ? (
          <Section title="Admin Information">
            <Field label="Employee #" value={roleData.employeeNumber} />
            <Field label="Position" value={fmtLabel(roleData.position)} />
            <Field label="Hire Date" value={fmtDate(roleData.hireDate)} />
          </Section>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-[#1A1A1A]">
        <div className="flex items-start gap-4">
          <ProfileAvatar user={profile} size={72} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {profile.name ?? "Unnamed User"}
                </h3>
                <p className="truncate text-sm text-gray-500">
                  {profile.email}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#d8f0f0] bg-[#eefafa] px-2.5 py-0.5 text-xs font-medium text-[#0f2424] dark:border-[#143232] dark:bg-[#0f2424] dark:text-[#7adcdc]">
                  {profile.role ?? role}
                </span>
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-gray-100 pt-4 dark:border-gray-800">
              <ProfileActions
                profile={{ ...profile, role }}
                onEdit={onEdit}
                onDeleted={onDeleted}
                onStatusChanged={onStatusChanged}
                showStatus
                showEdit
                showDelete
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact */}
      <Section title="Contact">
        <Field label="Email" value={profile.email} />
        <Field label="Phone" value={profile.phone} />
        <Field label="Account Status" value={profile.status} />
        <Field label="Member Since" value={fmtDate(profile.createdAt)} />
      </Section>

      {/* Role-specific */}
      {renderRoleDetails()}
    </div>
  );
}