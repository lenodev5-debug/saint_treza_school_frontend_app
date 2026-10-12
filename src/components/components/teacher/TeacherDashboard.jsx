
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../../context/AuthContext";
import teacherAssignmentService from "../../../../lib/service/admin/teacherAssignmentService";

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const pickArray = (...candidates) =>
    candidates.find((candidate) => Array.isArray(candidate)) ?? [];

const matches = (query, ...values) =>
    values
        .filter(
            (value) =>
                value !== null &&
                value !== undefined &&
                value !== ""
        )
        .join(" ")
        .toLowerCase()
        .includes(query);

// ------------------------------------------------------------
// TEACHER DASHBOARD
// ------------------------------------------------------------

export default function TeacherDashboard() {
    const { user, loading: authLoading } = useAuth();

    const [assignments, setAssignments] = useState([]);
    const [assignmentsLoading, setAssignmentsLoading] = useState(true);
    const [assignmentsError, setAssignmentsError] = useState("");
    const [search, setSearch] = useState("");

    // --------------------------------------------------------
    // LOGGED-IN TEACHER INFORMATION
    // --------------------------------------------------------

    const userId = user?._id || user?.id || user?.userId;

    const teacherName = user?.name || "Teacher";
    const teacherEmail = user?.email || "";
    const teacherImage = user?.image;
    const status = user?.status || "active";
    const role = user?.role || "Teacher";

    const initials = teacherName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // --------------------------------------------------------
    // FETCH MY TEACHING ASSIGNMENTS
    // --------------------------------------------------------

    const loadMyAssignments = useCallback(async () => {
        if (!userId) {
            setAssignments([]);
            setAssignmentsLoading(false);
            return;
        }

        try {
            setAssignmentsLoading(true);
            setAssignmentsError("");

            const response =
                await teacherAssignmentService.getMyTeacherAssignments();

            const result =
                response?.data !== undefined
                    ? response.data
                    : response;

            setAssignments(
                pickArray(
                    result,
                    result?.assignments,
                    result?.data,
                    result?.data?.assignments
                )
            );
        } catch (error) {
            console.error(
                "LOAD MY TEACHER ASSIGNMENTS ERROR:",
                error
            );

            setAssignmentsError(
                error?.response?.data?.message ||
                    "Failed to load your teaching assignments."
            );

            setAssignments([]);
        } finally {
            setAssignmentsLoading(false);
        }
    }, [userId]);

    // --------------------------------------------------------
    // INITIAL LOAD
    // --------------------------------------------------------

    useEffect(() => {
        if (authLoading) return;

        loadMyAssignments();
    }, [authLoading, loadMyAssignments]);

    // --------------------------------------------------------
    // SEARCH ASSIGNMENTS
    // --------------------------------------------------------

    const query = search.trim().toLowerCase();

    const visibleAssignments = useMemo(() => {
        if (!query) return assignments;

        return assignments.filter((assignment) => {
            const grade = assignment.gradeId;
            const subject = assignment.subjectId;
            const year = assignment.academicYearId;

            return matches(
                query,
                grade?.gradeName,
                grade?.name,
                grade?.grade,
                grade?.sectionName,
                grade?.section,
                grade?.sectionLabel,
                subject?.name,
                subject?.subjectName,
                subject?.title,
                subject?.code,
                subject?.subjectCode,
                year?.name,
                year?.label,
                year?.yearName,
                year?.startYear,
                year?.endYear,
                assignment.status,
                assignment.isCoordinator ? "coordinator" : "subject teacher"
            );
        });
    }, [assignments, query]);

    // --------------------------------------------------------
    // STATISTICS
    // --------------------------------------------------------

    const activeAssignments = assignments.filter(
        (assignment) => assignment.status === "active"
    ).length;

    const inactiveAssignments = assignments.filter(
        (assignment) => assignment.status === "inactive"
    ).length;

    const assignedGrades = new Set(
        assignments
            .map((assignment) => {
                const grade = assignment.gradeId;

                return grade && typeof grade === "object"
                    ? grade._id
                    : grade;
            })
            .filter(Boolean)
            .map(String)
    ).size;

    // --------------------------------------------------------
    // RENDER
    // --------------------------------------------------------

    if (authLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#f7f6f5] text-zinc-600 dark:bg-[#0E0E0E] dark:text-zinc-300">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
                    <p className="mt-4 text-sm">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full overflow-hidden bg-[#f7f6f5] px-5 pb-10 pt-24 text-zinc-900 md:px-7 md:pt-28 dark:bg-[#0E0E0E] dark:text-zinc-100">
            {/* HEADER */}

            <section className="mb-8 flex flex-wrap items-center justify-between gap-5">
                <div className="flex min-w-0 items-center gap-4">
                    {teacherImage ? (
                        <img
                            src={teacherImage}
                            alt={teacherName}
                            className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-zinc-200 dark:ring-zinc-800"
                        />
                    ) : (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-xl font-semibold text-white dark:bg-white dark:text-black">
                            {initials || "T"}
                        </div>
                    )}

                    <div className="min-w-0">
                        <p className="mb-1 text-xs font-medium uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                            Teacher Dashboard
                        </p>

                        <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
                            Welcome, {teacherName}
                        </h1>

                        {teacherEmail && (
                            <p className="mt-1 truncate text-sm text-zinc-500 dark:text-zinc-400">
                                {teacherEmail}
                            </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-zinc-200 px-2.5 py-1 text-xs dark:border-zinc-700">
                                {role}
                            </span>

                            <StatusPill status={status} />
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={loadMyAssignments}
                    disabled={assignmentsLoading}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                    {assignmentsLoading ? "Refreshing..." : "Refresh"}
                </button>
            </section>

            {/* ASSIGNMENT STATISTICS */}

            <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                    label="Total Assignments"
                    value={assignments.length}
                    description="All assigned teaching subjects"
                    loading={assignmentsLoading}
                />

                <StatCard
                    label="Active Assignments"
                    value={activeAssignments}
                    description="Currently active assignments"
                    loading={assignmentsLoading}
                />

                <StatCard
                    label="Assigned Grades"
                    value={assignedGrades}
                    description="Distinct assigned grades or sections"
                    loading={assignmentsLoading}
                />
            </section>

            {/* ASSIGNMENT SEARCH */}

            <section className="mb-6">
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search grade, section, subject, academic year..."
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:ring-zinc-800"
                />
            </section>

            {/* MY TEACHING ASSIGNMENTS */}

            <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <div className="flex flex-col gap-4 border-b border-zinc-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
                    <div>
                        <h2 className="text-lg font-semibold">
                            My Teaching Assignments
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            View your assigned grades, sections, subjects,
                            and academic years.
                        </p>
                    </div>

                    <span className="rounded-full bg-zinc-100 px-3 py-1.5 text-xs font-medium text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {visibleAssignments.length} shown
                    </span>
                </div>

                {assignmentsError && (
                    <div className="m-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                        <p className="font-medium">
                            Unable to load assignments
                        </p>

                        <p className="mt-1">{assignmentsError}</p>

                        <button
                            type="button"
                            onClick={loadMyAssignments}
                            className="mt-3 font-semibold underline underline-offset-4"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {assignmentsLoading ? (
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-900"
                            />
                        ))}
                    </div>
                ) : !assignmentsError &&
                  visibleAssignments.length === 0 ? (
                    <EmptyState
                        title={
                            query
                                ? "No matching assignments"
                                : "No teaching assignments found"
                        }
                        message={
                            query
                                ? "Try another search term."
                                : "Your teaching assignments will appear here once they have been assigned to your teacher profile."
                        }
                        onClear={query ? () => setSearch("") : null}
                    />
                ) : !assignmentsError ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left text-sm">
                            <thead className="bg-zinc-50 dark:bg-zinc-900">
                                <tr className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                    <th className="px-5 py-4 font-medium">
                                        Grade / Section
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Subject
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Academic Year
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Assignment Role
                                    </th>
                                    <th className="px-5 py-4 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleAssignments.map((assignment, index) => {
                                    const grade = assignment.gradeId;
                                    const subject = assignment.subjectId;
                                    const year = assignment.academicYearId;

                                    const gradeIsObject =
                                        grade && typeof grade === "object";
                                    const subjectIsObject =
                                        subject && typeof subject === "object";
                                    const yearIsObject =
                                        year && typeof year === "object";

                                    const gradeName = gradeIsObject
                                        ? grade.gradeName ||
                                          grade.name ||
                                          grade.grade ||
                                          "—"
                                        : "—";

                                    const sectionName = gradeIsObject
                                        ? grade.sectionName ||
                                          grade.section ||
                                          grade.sectionLabel ||
                                          ""
                                        : "";

                                    const subjectName = subjectIsObject
                                        ? subject.name ||
                                          subject.subjectName ||
                                          subject.title ||
                                          "—"
                                        : "—";

                                    const subjectCode = subjectIsObject
                                        ? subject.code ||
                                          subject.subjectCode ||
                                          ""
                                        : "";

                                    let yearLabel = "—";

                                    if (yearIsObject) {
                                        yearLabel =
                                            year.name ||
                                            year.label ||
                                            year.yearName ||
                                            (year.startYear != null ||
                                            year.endYear != null
                                                ? `${year.startYear ?? ""}${
                                                      year.endYear != null
                                                          ? ` - ${year.endYear}`
                                                          : ""
                                                  }`
                                                : "—");
                                    }

                                    return (
                                        <tr
                                            key={
                                                assignment._id ||
                                                `${String(grade)}-${String(subject)}-${index}`
                                            }
                                            className="border-t border-zinc-100 transition hover:bg-zinc-50/70 dark:border-zinc-900 dark:hover:bg-zinc-900/50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {gradeName}
                                                </p>

                                                <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                    {sectionName
                                                        ? `Section ${sectionName}`
                                                        : "Section not specified"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4">
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                                                    {subjectName}
                                                </p>

                                                {subjectCode && (
                                                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                        {subjectCode}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="px-5 py-4 text-zinc-700 dark:text-zinc-300">
                                                {yearLabel}
                                            </td>

                                            <td className="px-5 py-4">
                                                {assignment.isCoordinator ? (
                                                    <span className="inline-flex rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
                                                        Coordinator
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        Subject Teacher
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-5 py-4">
                                                <StatusPill
                                                    status={assignment.status}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {!assignmentsLoading &&
                    !assignmentsError &&
                    assignments.length > 0 && (
                        <div className="border-t border-zinc-200 px-5 py-3 dark:border-zinc-800">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                Showing {visibleAssignments.length} of{" "}
                                {assignments.length} assignments
                                {inactiveAssignments > 0
                                    ? ` · ${inactiveAssignments} inactive`
                                    : ""}
                            </p>
                        </div>
                    )}
            </section>
        </div>
    );
}

// ------------------------------------------------------------
// STAT CARD
// ------------------------------------------------------------

function StatCard({ label, value, description, loading }) {
    return (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {label}
            </p>

            {loading ? (
                <div className="mt-3 h-9 w-16 animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-900" />
            ) : (
                <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {value}
                </p>
            )}

            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {description}
            </p>
        </div>
    );
}

// ------------------------------------------------------------
// STATUS PILL
// ------------------------------------------------------------

function StatusPill({ status }) {
    const isActive = status === "active";

    return (
        <span
            className={[
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                isActive
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
            ].join(" ")}
        >
            <span
                className={[
                    "h-1.5 w-1.5 rounded-full",
                    isActive ? "bg-emerald-500" : "bg-zinc-500",
                ].join(" ")}
            />

            {status || "unknown"}
        </span>
    );
}

// ------------------------------------------------------------
// EMPTY STATE
// ------------------------------------------------------------

function EmptyState({ title, message, onClear }) {
    return (
        <div className="px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 dark:bg-zinc-900">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-7 w-7 text-zinc-500"
                    aria-hidden="true"
                >
                    <path
                        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <path
                        d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20M8 7h8M8 10h6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            <h3 className="font-semibold">{title}</h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
                {message}
            </p>

            {onClear && (
                <button
                    type="button"
                    onClick={onClear}
                    className="mt-4 text-sm font-medium underline underline-offset-4"
                >
                    Clear search
                </button>
            )}
        </div>
    );
}
