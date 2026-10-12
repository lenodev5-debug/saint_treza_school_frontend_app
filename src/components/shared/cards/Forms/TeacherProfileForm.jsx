
import { useEffect, useMemo, useState } from "react";

import teacherService from "../../../../../lib/service/admin/teacherService";
import studentService from "../../../../../lib/service/admin/studentService";
import userService from "../../../../../lib/service/admin/userService";

const PROFILE_TYPES = {
    TEACHER: "teacher",
    STUDENT: "student",
};

const TEACHER_STATUSES = [
    "active",
    "inactive",
    "suspended",
    "resigned",
];

const STUDENT_STATUSES = [
    "active",
    "inactive",
    "graduated",
    "transferred",
];

const INITIAL_TEACHER_FORM = {
    userId: "",
    employeeNumber: "",
    specialization: "",
    hireDate: "",
    status: "active",
};

const INITIAL_STUDENT_FORM = {
    userId: "",
    admissionNumber: "",
    dateOfBirth: "",
    gender: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    profileCompleted: false,
    status: "active",
};

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#0f0f0f] px-4 py-3 text-sm text-white outline-none transition focus:border-white/30 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass =
    "mb-2 block text-sm font-medium text-white/80";

function getList(response, keys = []) {
    if (Array.isArray(response)) return response;

    for (const key of keys) {
        if (Array.isArray(response?.[key])) {
            return response[key];
        }
    }

    if (Array.isArray(response?.data)) {
        return response.data;
    }

    return [];
}

function getId(value) {
    const id =
        value?._id ??
        value?.id ??
        value ??
        "";

    return id ? String(id) : "";
}

function formatDate(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
}

export default function TeacherProfileForm({
    teacher = null,
    student = null,
    profileType: initialProfileType,
    onSuccess,
    onCancel,
}) {
    const editingProfile = teacher || student || null;

    const isEditMode = Boolean(
        editingProfile?._id
    );
    
    const initialType =
    initialProfileType === PROFILE_TYPES.STUDENT || student
        ? PROFILE_TYPES.STUDENT
        : PROFILE_TYPES.TEACHER;

    const [profileType, setProfileType] = useState(initialType);

    const [formData, setFormData] = useState(() =>
        initialType === PROFILE_TYPES.STUDENT
            ? { ...INITIAL_STUDENT_FORM }
            : { ...INITIAL_TEACHER_FORM }
    );

    const [users, setUsers] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState("");

    const isTeacher = profileType === PROFILE_TYPES.TEACHER;

    /*
     * Load existing User accounts and profiles.
     * Each profile is associated with an existing User.
     */
    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            setLoadingData(true);
            setError("");

            try {
                const usersResponse = await userService.getAllUsers();

                if (cancelled) return;

                setUsers(getList(usersResponse, ["users"]));
            } catch (err) {
                if (cancelled) return;

                console.error("Failed to load users:", err);

                setError(
                    err?.response?.data?.message ||
                        "Failed to load user accounts."
                );
            }

            try {
                const teachersResponse =
                    await teacherService.getAllTeachers();

                if (!cancelled) {
                    setTeachers(
                        getList(teachersResponse, ["teachers"])
                    );
                }
            } catch (err) {
                console.error("Failed to load teacher profiles:", err);
            }

            try {
                const studentsResponse =
                    await studentService.getStudents();

                if (!cancelled) {
                    setStudents(
                        getList(studentsResponse, ["students"])
                    );
                }
            } catch (err) {
                console.error("Failed to load student profiles:", err);
            }

            if (!cancelled) {
                setLoadingData(false);
            }
        }

        loadData();

        return () => {
            cancelled = true;
        };
    }, []);

    /*
     * Populate the correct form when editing.
     */
    useEffect(() => {
        if (teacher) {
            setProfileType(PROFILE_TYPES.TEACHER);

            setFormData({
                userId: getId(teacher.userId),
                employeeNumber: teacher.employeeNumber || "",
                specialization: teacher.specialization || "",
                hireDate: formatDate(teacher.hireDate),
                status: teacher.status || "active",
            });

            return;
        }

        if (student) {
            setProfileType(PROFILE_TYPES.STUDENT);

            setFormData({
                userId: getId(student.userId),
                admissionNumber: student.admissionNumber || "",
                dateOfBirth: formatDate(student.dateOfBirth),
                gender: student.gender || "",
                address: student.address || "",
                emergencyContactName:
                    student.emergencyContactName || "",
                emergencyContactPhone:
                    student.emergencyContactPhone || "",
                enrollmentDate: formatDate(
                    student.enrollmentDate
                ),
                profileCompleted:
                    student.profileCompleted ?? false,
                status: student.status || "active",
            });

            return;
        }

        if (!isEditMode) {
            setFormData(
                profileType === PROFILE_TYPES.TEACHER
                    ? INITIAL_TEACHER_FORM
                    : INITIAL_STUDENT_FORM
            );
        }
    }, [teacher, student, isEditMode, profileType]);

    /*
     * A user can only have one profile of each type.
     * Existing profiles of the opposite type do not
     * prevent the user from being selected.
     */
    const availableUsers = useMemo(() => {
        const profiles = isTeacher ? teachers : students;

        const existingUserIds = new Set(
            profiles
                .map((profile) => getId(profile.userId))
                .filter(Boolean)
        );

        const expectedRole = isTeacher ? "Teacher" : "Student";

        return users.filter((user) => {
            if (user.role !== expectedRole) {
                return false;
            }

            const userId = getId(user);

            if (!userId) return false;

            if (
                isEditMode &&
                userId === String(formData.userId)
            ) {
                return true;
            }

            return !existingUserIds.has(userId);
        });
    }, [
        users,
        teachers,
        students,
        isTeacher,
        isEditMode,
        formData.userId,
    ]);

    const selectedUser = useMemo(
        () =>
            users.find(
                (user) => getId(user) === String(formData.userId)
            ),
        [users, formData.userId]
    );

   function handleProfileTypeChange(nextType) {
        if (isEditMode || loading) return;

        setProfileType(nextType);

        setFormData(
            nextType === PROFILE_TYPES.TEACHER
                ? { ...INITIAL_TEACHER_FORM }
                : { ...INITIAL_STUDENT_FORM }
        );

        setError("");
    }

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: type === "checkbox" ? checked : value,
        }));

        setError("");
    }

    function validateForm() {
        if (!formData.userId) {
            return `Please select a ${isTeacher ? "teacher" : "student"}.`;
        }

        if (isTeacher) {
            if (!formData.employeeNumber.trim()) {
                return "Employee number is required.";
            }

            if (!TEACHER_STATUSES.includes(formData.status)) {
                return "Invalid teacher status.";
            }
        } else {
            if (!formData.admissionNumber.trim()) {
                return "Admission number is required.";
            }

            if (
                formData.gender &&
                !["male", "female", "other"].includes(formData.gender)
            ) {
                return "Invalid gender.";
            }

            if (!STUDENT_STATUSES.includes(formData.status)) {
                return "Invalid student status.";
            }
        }

        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);
            setError("");

            let response;

            if (isTeacher) {
                const payload = {
                    userId: formData.userId,
                    employeeNumber:
                        formData.employeeNumber.trim().toUpperCase(),
                    specialization:
                        formData.specialization.trim() || null,
                    hireDate: formData.hireDate || undefined,
                    status: formData.status,
                };

                response = isEditMode
                    ? await teacherService.updateTeacher(
                          teacher._id,
                          payload
                      )
                    : await teacherService.createTeacher(payload);
            } else {
                const payload = {
                    userId: formData.userId,
                    admissionNumber:
                        formData.admissionNumber.trim().toUpperCase(),
                    dateOfBirth: formData.dateOfBirth || null,
                    gender: formData.gender || null,
                    address: formData.address.trim() || null,
                    emergencyContactName:
                        formData.emergencyContactName.trim() || null,
                    emergencyContactPhone:
                        formData.emergencyContactPhone.trim() || null,
                    enrollmentDate:
                        formData.enrollmentDate || undefined,
                    profileCompleted: formData.profileCompleted,
                    status: formData.status,
                };

                response = isEditMode
                    ? await studentService.updateStudent(
                          student._id,
                          payload
                      )
                    : await studentService.createStudentProfile(payload);
            }

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err) {
            console.error("Profile save error:", err);

            setError(
                err?.response?.data?.message ||
                `Failed to ${isEditMode ? "update" : "create"} ${
                    isTeacher ? "teacher" : "student"
                } profile.`
            );
        } finally {
            setLoading(false);
        }
    }

    if (loadingData) {
        return (
            <div className="w-full rounded-2xl border border-white/10 bg-[#151515] p-6 text-white">
                <div className="flex items-center gap-3">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                    <span className="text-sm text-white/70">
                        Loading users and profiles...
                    </span>
                </div>
            </div>
        );
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full rounded-2xl border border-white/10 bg-[#151515] p-6 text-white shadow-xl"
        >
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    {isEditMode
                        ? `Edit ${isTeacher ? "Teacher" : "Student"} Profile`
                        : "Create Profile"}
                </h2>

                <p className="mt-1 text-sm text-white/50">
                    Create a profile for an existing{" "}
                    {isTeacher ? "Teacher" : "Student"} user.
                </p>
            </div>

            {/* Profile type switch */}
            {!isEditMode && (
                <div className="mb-6">
                    <label className={labelClass}>
                        Profile Type
                    </label>

                    <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#0f0f0f] p-1">
                        <button
                            type="button"
                            onClick={() =>
                                handleProfileTypeChange(
                                    PROFILE_TYPES.TEACHER
                                )
                            }
                            disabled={loading}
                            aria-pressed={isTeacher}
                            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                isTeacher
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            Teacher
                        </button>

                        <button
                            type="button"
                            onClick={() =>
                                handleProfileTypeChange(
                                    PROFILE_TYPES.STUDENT
                                )
                            }
                            disabled={loading}
                            aria-pressed={!isTeacher}
                            className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                                !isTeacher
                                    ? "bg-white text-black"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            Student
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div
                    role="alert"
                    className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {/* User selection */}
                <div className="md:col-span-2">
                    <label htmlFor="userId" className={labelClass}>
                        {isTeacher ? "Teacher User" : "Student User"}
                    </label>

                    <select
                        id="userId"
                        name="userId"
                        value={formData.userId}
                        onChange={handleChange}
                        disabled={isEditMode || loading}
                        required
                        className={inputClass}
                    >
                        <option value="">
                            Select a {isTeacher ? "teacher" : "student"}
                        </option>

                        {availableUsers.map((user) => (
                            <option
                                key={getId(user)}
                                value={getId(user)}
                            >
                                {user.name || user.fullName || user.email}
                                {user.email ? ` — ${user.email}` : ""}
                            </option>
                        ))}
                    </select>

                    {availableUsers.length === 0 && (
                        <p className="mt-2 text-xs text-amber-400">
                            {isTeacher
                                ? "No eligible Teacher users are available."
                                : "No eligible Student users are available."}
                        </p>
                    )}

                    {selectedUser && (
                        <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3">
                            <p className="text-xs text-white/40">
                                Selected user
                            </p>

                            <p className="mt-1 text-sm font-medium">
                                {selectedUser.name ||
                                    selectedUser.fullName ||
                                    "User"}
                            </p>

                            {selectedUser.email && (
                                <p className="mt-1 text-xs text-white/50">
                                    {selectedUser.email}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {isTeacher ? (
                    <>
                        <div>
                            <label htmlFor="employeeNumber" className={labelClass}>
                                Employee Number
                            </label>
                            <input
                                id="employeeNumber"
                                name="employeeNumber"
                                value={formData.employeeNumber}
                                onChange={handleChange}
                                placeholder="e.g. TCH-0001"
                                disabled={loading}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="specialization" className={labelClass}>
                                Specialization
                            </label>
                            <input
                                id="specialization"
                                name="specialization"
                                value={formData.specialization}
                                onChange={handleChange}
                                placeholder="e.g. Mathematics"
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="hireDate" className={labelClass}>
                                Hire Date
                            </label>
                            <input
                                id="hireDate"
                                name="hireDate"
                                type="date"
                                value={formData.hireDate}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="status" className={labelClass}>
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            >
                                {TEACHER_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <label htmlFor="admissionNumber" className={labelClass}>
                                Admission Number
                            </label>
                            <input
                                id="admissionNumber"
                                name="admissionNumber"
                                value={formData.admissionNumber}
                                onChange={handleChange}
                                placeholder="e.g. STD-0001"
                                disabled={loading}
                                required
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="dateOfBirth" className={labelClass}>
                                Date of Birth
                            </label>
                            <input
                                id="dateOfBirth"
                                name="dateOfBirth"
                                type="date"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className={labelClass}>
                                Gender
                            </label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            >
                                <option value="">Select gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="enrollmentDate" className={labelClass}>
                                Enrollment Date
                            </label>
                            <input
                                id="enrollmentDate"
                                name="enrollmentDate"
                                type="date"
                                value={formData.enrollmentDate}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="address" className={labelClass}>
                                Address
                            </label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Student address"
                                disabled={loading}
                                rows={2}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="emergencyContactName"
                                className={labelClass}
                            >
                                Emergency Contact Name
                            </label>
                            <input
                                id="emergencyContactName"
                                name="emergencyContactName"
                                value={formData.emergencyContactName}
                                onChange={handleChange}
                                placeholder="Parent or guardian name"
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="emergencyContactPhone"
                                className={labelClass}
                            >
                                Emergency Contact Phone
                            </label>
                            <input
                                id="emergencyContactPhone"
                                name="emergencyContactPhone"
                                type="tel"
                                value={formData.emergencyContactPhone}
                                onChange={handleChange}
                                placeholder="Phone number"
                                disabled={loading}
                                className={inputClass}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="flex items-center gap-3 text-sm text-white/80">
                                <input
                                    type="checkbox"
                                    name="profileCompleted"
                                    checked={formData.profileCompleted}
                                    onChange={handleChange}
                                    disabled={loading}
                                    className="h-4 w-4 accent-white"
                                />
                                Mark student profile as completed
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="status" className={labelClass}>
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                disabled={loading}
                                className={inputClass}
                            >
                                {STUDENT_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                        {status.charAt(0).toUpperCase() +
                                            status.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </div>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading || availableUsers.length === 0}
                    className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Saving..."
                        : `${isEditMode ? "Update" : "Create"} ${
                              isTeacher ? "Teacher" : "Student"
                          } Profile`}
                </button>
            </div>
        </form>
    );
}
