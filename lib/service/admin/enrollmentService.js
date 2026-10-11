import api from "../api";

const BASE_URL = "/api/enrollments";

const enrollmentService = {
    getAllEnrollments: async (params = {}) => {
        const response = await api.get(BASE_URL, { params });
        return response.data;
    },

    createEnrollment: async (data) => {
        const response = await api.post(BASE_URL, data);
        return response.data;
    },

    getEnrollmentById: async (id) => {
        const response = await api.get(`${BASE_URL}/${id}`);
        return response.data;
    },

    updateEnrollment: async (id, data) => {
        const response = await api.patch(`${BASE_URL}/${id}`, data);
        return response.data;
    },

    changeEnrollmentStatus: async (id, data) => {
        const response = await api.patch(
            `${BASE_URL}/${id}/status`,
            data
        );
        return response.data;
    },

    deleteEnrollment: async (id) => {
        const response = await api.delete(`${BASE_URL}/${id}`);
        return response.data;
    },
};

export default enrollmentService;