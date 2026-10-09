
import api from "../api";

const BASE_URL = "/api/teacher/assignments";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== undefined &&
                value !== null &&
                value !== ""
        )
    );

const teacherAssignmentService = {
    // ADMIN: Retrieve assignments using optional filters.
    getAllTeacherAssignments: async (params = {}) => {
        const response = await api.get(BASE_URL, {
            params: cleanParams(params),
        });

        return response.data;
    },

    // TEACHER: Retrieve assignments belonging to the
    // authenticated teacher using the dedicated /my route.
    getMyTeacherAssignments: async (params = {}) => {
        const response = await api.get(`${BASE_URL}/my`, {
            params: cleanParams(params),
        });

        return response.data;
    },

    // ADMIN: Create an assignment.
    createTeacherAssignment: async (data) => {
        const payload = {
            teacherId: data.teacherId,
            academicYearId: data.academicYearId,
            gradeId: data.gradeId,
            subjectId: data.subjectId,
            departmentId: data.departmentId,
            status: data.status || "active",
        };

        const response = await api.post(BASE_URL, payload);
        return response.data;
    },

    // ADMIN: Get one assignment by ID.
    getTeacherAssignmentById: async (assignmentId) => {
        if (!assignmentId) {
            throw new Error("Assignment ID is required.");
        }

        const response = await api.get(
            `${BASE_URL}/${assignmentId}`
        );

        return response.data;
    },

    // ADMIN: Update an assignment.
    updateTeacherAssignment: async (assignmentId, data) => {
        if (!assignmentId) {
            throw new Error("Assignment ID is required.");
        }

        const response = await api.patch(
            `${BASE_URL}/${assignmentId}`,
            data
        );

        return response.data;
    },

    // ADMIN: Activate or deactivate an assignment.
    changeTeacherAssignmentStatus: async (
        assignmentId,
        { status }
    ) => {
        if (!assignmentId) {
            throw new Error("Assignment ID is required.");
        }

        if (!["active", "inactive"].includes(status)) {
            throw new Error(
                "Status must be active or inactive."
            );
        }

        const response = await api.patch(
            `${BASE_URL}/${assignmentId}/status`,
            { status }
        );

        return response.data;
    },

    // ADMIN: Delete or deactivate an assignment.
    deleteTeacherAssignment: async (assignmentId) => {
        if (!assignmentId) {
            throw new Error("Assignment ID is required.");
        }

        const response = await api.delete(
            `${BASE_URL}/${assignmentId}`
        );

        return response.data;
    },
};

export default teacherAssignmentService;
