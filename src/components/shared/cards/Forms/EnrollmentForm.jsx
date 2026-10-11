import { useEffect, useState } from "react";

import api from "../../../../../lib/service/api";
import enrollmentService from "../../../../../lib/service/admin/enrollmentService";

const INITIAL_FORM = {
    studentId: "",
    academicYearId: "",
    gradeId: "",
    enrollmentDate: new Date().toISOString().split("T")[0],
    status: "active",
};

function getList(response, keys = []) {
    if (Array.isArray(response)) return response;

    for (const key of keys) {
        if (Array.isArray(response?.[key])) return response[key];
    }

    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;

    return [];
}

function getId(item) {
    return String(item?._id ?? item?.id ?? "");
}

function getStudentName(student) {
    const user = student?.userId;

    return (
        user?.name ||
        student?.name ||
        student?.fullName ||
        student?.admissionNumber ||
        "Unnamed student"
    );
}

function getYearName(year) {
    return (
        year?.yearName ||
        year?.academicYearName ||
        year?.name ||
        (year?.startYear && year?.endYear
            ? `${year.startYear} - ${year.endYear}`
            : year?.startDate
              ? new Date(year.startDate).getFullYear().toString()
              : "Academic year")
    );
}

function getGradeName(grade) {
    return [grade?.gradeName, grade?.sectionName]
        .filter(Boolean)
        .join(" - ") || "Unnamed grade";
}

export default function EnrollmentForm({ onSuccess, onCancel }) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [students, setStudents] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        let cancelled = false;

        async function loadOptions() {
            setLoadingData(true);
            setError("");

        const results = await Promise.allSettled([
            api.get("/api/student"),
            api.get("/api/academic-year"),
            api.get("/api/grade"),
        ]);

            if (cancelled) return;

            const [studentResult, yearResult, gradeResult] = results;

            if (studentResult.status === "fulfilled") {
                setStudents(
                    getList(studentResult.value.data, [
                        "students",
                        "data",
                    ])
                );
            }

            if (yearResult.status === "fulfilled") {
                setAcademicYears(
                    getList(yearResult.value.data, [
                        "academicYears",
                        "years",
                        "data",
                    ])
                );
            }

            if (gradeResult.status === "fulfilled") {
                setGrades(
                    getList(gradeResult.value.data, [
                        "grades",
                        "data",
                    ])
                );
            }

            const failed = results.some(
                (result) => result.status === "rejected"
            );

            if (failed) {
                setError(
                    "Some enrollment options could not be loaded. Check the API routes and try again."
                );
            }

            setLoadingData(false);
        }

        loadOptions();

        return () => {
            cancelled = true;
        };
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (
            !formData.studentId ||
            !formData.academicYearId ||
            !formData.gradeId
        ) {
            setError(
                "Select a student, academic year, and grade."
            );
            return;
        }

        setSaving(true);

        try {
            const response =
                await enrollmentService.createEnrollment(formData);

            setSuccess(
                response?.message || "Enrollment created successfully."
            );

            setFormData({ ...INITIAL_FORM });

            if (onSuccess) {
                onSuccess(response);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    "Failed to create enrollment."
            );
        } finally {
            setSaving(false);
        }
    }

    const inputClass =
        "w-full rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-white/10 dark:bg-[#1b1b1b] dark:text-white";

    const labelClass =
        "mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300";

    if (loadingData) {
        return (
            <div className="p-6 text-sm text-gray-600 dark:text-gray-300">
                Loading students, academic years, and grades...
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Enroll Student
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Assign an existing student to an academic year
                    and grade/section.
                </p>
            </div>

            {error && (
                <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                >
                    {error}
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/30 dark:text-green-300"
                >
                    {success}
                </div>
            )}

            <div>
                <label className={labelClass} htmlFor="studentId">
                    Student
                </label>
                <select
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    required
                    className={inputClass}
                >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                        <option
                            key={getId(student)}
                            value={getId(student)}
                        >
                            {getStudentName(student)}
                            {student.admissionNumber
                                ? ` (${student.admissionNumber})`
                                : ""}
                        </option>
                    ))}
                </select>
                {students.length === 0 && (
                    <p className="mt-1 text-xs text-amber-600">
                        No student profiles were returned by the API.
                    </p>
                )}
            </div>

            <div>
                <label
                    className={labelClass}
                    htmlFor="academicYearId"
                >
                    Academic Year
                </label>
                <select
                    id="academicYearId"
                    name="academicYearId"
                    value={formData.academicYearId}
                    onChange={handleChange}
                    required
                    className={inputClass}
                >
                    <option value="">Select an academic year</option>
                    {academicYears.map((year) => (
                        <option key={getId(year)} value={getId(year)}>
                            {getYearName(year)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className={labelClass} htmlFor="gradeId">
                    Grade and Section
                </label>
                <select
                    id="gradeId"
                    name="gradeId"
                    value={formData.gradeId}
                    onChange={handleChange}
                    required
                    className={inputClass}
                >
                    <option value="">Select a grade/section</option>
                    {grades.map((grade) => (
                        <option key={getId(grade)} value={getId(grade)}>
                            {getGradeName(grade)}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label
                    className={labelClass}
                    htmlFor="enrollmentDate"
                >
                    Enrollment Date
                </label>
                <input
                    id="enrollmentDate"
                    name="enrollmentDate"
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={handleChange}
                    required
                    className={inputClass}
                />
            </div>

            <div>
                <label className={labelClass} htmlFor="status">
                    Enrollment Status
                </label>
                <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={inputClass}
                >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="transferred">Transferred</option>
                    <option value="withdrawn">Withdrawn</option>
                </select>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-4 dark:border-white/10">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={saving}
                        className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="submit"
                    disabled={
                        saving ||
                        students.length === 0 ||
                        academicYears.length === 0 ||
                        grades.length === 0
                    }
                    className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {saving ? "Enrolling..." : "Enroll Student"}
                </button>
            </div>
        </form>
    );
}