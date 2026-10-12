
import { useCallback, useEffect, useMemo, useState } from "react";

import teacherStudentEnrollmentService from "../../../../lib/service/teacher/teacherStudentEnrollementService";

const getObject = (value) =>
    value && typeof value === "object" ? value : {};

const getStudent = (enrollment) =>
    getObject(enrollment?.student ?? enrollment?.studentId);

const getGrade = (enrollment) =>
    getObject(enrollment?.grade ?? enrollment?.gradeId);

const getUser = (student) =>
    getObject(student?.user ?? student?.userId);

export default function MyStudents() {
    const [students, setStudents] = useState([]);
    const [academicYear, setAcademicYear] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const loadStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await teacherStudentEnrollmentService.getMyStudents();

            const result = response?.data ?? response;

            const studentList = Array.isArray(result)
                ? result
                : result?.students ??
                  result?.enrollments ??
                  result?.data?.students ??
                  [];

            setStudents(Array.isArray(studentList) ? studentList : []);
            setAcademicYear(result?.academicYear ?? null);
        } catch (err) {
            console.error("LOAD MY STUDENTS ERROR:", err);

            setError(
                err?.response?.data?.message ||
                    "Unable to load your students."
            );

            setStudents([]);
            setAcademicYear(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStudents();
    }, [loadStudents]);

    const filteredStudents = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) return students;

        return students.filter((enrollment) => {
            const student = getStudent(enrollment);
            const user = getUser(student);
            const grade = getGrade(enrollment);

            return [
                user.name,
                user.email,
                student.admissionNumber,
                grade.gradeName,
                grade.sectionName,
            ]
                .filter(Boolean)
                .some((value) =>
                    String(value).toLowerCase().includes(query)
                );
        });
    }, [students, search]);

    const yearName =
        academicYear?.name ||
        academicYear?.yearName ||
        academicYear?.label ||
        "";

    return (
        <section className="overflow-hidden border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 min-h-screen pt-12">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
                <div>
                    <h2 className="text-lg font-semibold">My Students</h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {yearName
                            ? `Enrolled students — ${yearName}`
                            : "Students in your assigned grades and sections"}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadStudents}
                    disabled={loading}
                    className="rounded-xl border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-800 text-white"
                >
                    {loading ? "Loading..." : "Refresh"}
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3 p-5">
                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    <p className="text-sm text-black dark:text-white">Total students</p>
                    <p className="mt-1 text-2xl font-semibold text-white">
                        {loading ? "—" : students.length}
                    </p>
                </div>

                <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900">
                    <p className="text-sm text-zinc-500">Search results</p>
                    <p className="mt-1 text-2xl font-semibold text-black dark:text-white">
                        {loading ? "—" : filteredStudents.length}
                    </p>
                </div>
            </div>

            <div className="px-5 pb-4">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, admission number, grade, or section..."
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900"
                />
            </div>

            {error && (
                <div className="m-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={loadStudents}
                        className="mt-2 font-semibold underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {loading ? (
                <div className="space-y-3 p-5">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
                        />
                    ))}
                </div>
            ) : !error && filteredStudents.length === 0 ? (
                <div className="p-10 text-center">
                    <h3 className="font-medium">No students found</h3>
                    <p className="mt-2 text-sm text-zinc-500">
                        {search
                            ? "Try a different search term."
                            : "Students will appear here when they are enrolled."}
                    </p>
                </div>
            ) : !error ? (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900">
                            <tr className="text-xs uppercase text-zinc-500">
                                <th className="px-5 py-4">Student name</th>
                                <th className="px-5 py-4">Admission number</th>
                                <th className="px-5 py-4">Grade</th>
                                <th className="px-5 py-4">Section</th>
                                <th className="px-5 py-4">Email</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredStudents.map((enrollment, index) => {
                                const student = getStudent(enrollment);
                                const user = getUser(student);
                                const grade = getGrade(enrollment);

                                return (
                                    <tr
                                        key={
                                            enrollment._id ||
                                            student._id ||
                                            index
                                        }
                                        className="border-t border-zinc-100 hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                                    >
                                        <td className="px-5 py-4 text-black font-medium dark:text-white">
                                            {user.name || "—"}
                                        </td>

                                        <td className="px-5 py-4 black dark:text-white">
                                            {student.admissionNumber || "—"}
                                        </td>

                                        <td className="px-5 py-4 black dark:text-white">
                                            {grade.gradeName ||
                                                grade.name ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4 black dark:text-white">
                                            {grade.sectionName ||
                                                grade.section ||
                                                "—"}
                                        </td>

                                        <td className="px-5 py-4 black dark:text-white">
                                            {user.email || "—"}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            ) : null}
        </section>
    );
}
