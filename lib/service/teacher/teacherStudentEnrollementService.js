
import api from "../api";

const BASE_URL = "/api/teacher/assignments";

const teacherStudentEnrollmentService = {
    // GET: Fetch students enrolled in the logged-in
    // teacher's assigned grades and academic year.
    getMyStudents: async () => {
        try {
            const response = await api.get(
                `${BASE_URL}/students`
            );

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
