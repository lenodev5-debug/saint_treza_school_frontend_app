const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const fmtLabel = (v) =>
  typeof v === "string" && v.includes("_") ? v.replace(/_/g, " ") : v;

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-800 capitalize dark:text-gray-200">
        {value ?? "—"}
      </p>
    </div>
  );
}

export default function ProfileFields({ profile }) {
  // Support both flat and nested userId shapes
  const user = profile?.userId ?? profile;
  const role = user?.role ?? profile?.role;

  // Backend puts role data at the top level of the profile doc
  const teacher = profile?.teacherProfile ?? profile;
  const student = profile?.studentProfile ?? profile;

  const renderRoleFields = () => {
    switch (role) {
      case "Teacher":
        return (
          <>
            <Field label="Employee #" value={teacher?.employeeNumber} />
            <Field label="Specialization" value={teacher?.specialization} />
            <Field label="Hire Date" value={fmtDate(teacher?.hireDate)} />
            <Field label="Status" value={teacher?.status} />
          </>
        );

      case "Student":
        return (
          <>
            <Field label="Admission #" value={student?.admissionNumber} />
            <Field label="Gender" value={student?.gender} />
            <Field label="Date of Birth" value={fmtDate(student?.dateOfBirth)} />
            <Field label="Address" value={student?.address} />
            <Field
              label="Emergency Contact"
              value={student?.emergencyContactName}
            />
            <Field
              label="Emergency Phone"
              value={student?.emergencyContactPhone}
            />
            <Field label="Enrollment Date" value={fmtDate(student?.enrollmentDate)} />
            <Field label="Status" value={student?.status} />
          </>
        );

      case "Parent":
        return profile?.parentProfile ? (
          <>
            <Field label="Occupation" value={profile.parentProfile.occupation} />
            <Field label="Address" value={profile.parentProfile.address} />
            <Field
              label="Emergency Phone"
              value={profile.parentProfile.emergencyPhone}
            />
          </>
        ) : null;

      case "Librarian":
        return profile?.librarianProfile ? (
          <>
            <Field
              label="Employee #"
              value={profile.librarianProfile.employeeNumber}
            />
            <Field
              label="Position"
              value={fmtLabel(profile.librarianProfile.position)}
            />
            <Field
              label="Hire Date"
              value={fmtDate(profile.librarianProfile.hireDate)}
            />
          </>
        ) : null;

      case "Admin":
        return profile?.adminProfile ? (
          <>
            <Field
              label="Employee #"
              value={profile.adminProfile.employeeNumber}
            />
            <Field
              label="Position"
              value={fmtLabel(profile.adminProfile.position)}
            />
            <Field
              label="Hire Date"
              value={fmtDate(profile.adminProfile.hireDate)}
            />
          </>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
      <Field label="Email" value={user?.email} />
      <Field label="Phone" value={user?.phone} />
      <Field label="Role" value={user?.role} />
      <Field label="Status" value={profile?.status ?? user?.status} />
      {renderRoleFields()}
    </div>
  );
}