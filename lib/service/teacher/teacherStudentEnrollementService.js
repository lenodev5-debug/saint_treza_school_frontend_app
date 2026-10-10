
import api from "../api";

const BASE_URL = "/api/teacher/students";

const teacherStudentEnrollmentService = {
    // GET: Fetch students belonging to the logged-in teacher's assignments
    getMyStudents: async (params = {}) => {
        try {
            const response = await api.get(BASE_URL, {
                params,
            });

            return response.data;
        } catch (error) {
            console.error(
                "Failed to fetch teacher's students:",
                error.response?.data || error.message
            );

            throw error;
        }
    },
};

export default teacherStudentEnrollmentService;
