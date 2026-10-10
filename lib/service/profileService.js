import api from "./api";
import teacherService from "./admin/teacherService";
import studentService from "./admin/studentService";

const ENDPOINTS = {
  Teacher: "/api/teacher",
  Student: "/api/student",
  Parent: "/api/parent",
  Librarian: "/api/librarian",
  Admin: "/api/admin",
  User: "/api/user",
};

const ROLE_PROFILE_KEY = {
  Teacher: "teacherProfile",
  Student: "studentProfile",
  Parent: "parentProfile",
  Librarian: "librarianProfile",
  Admin: "adminProfile",
};

// ------------------------------------------------------------
// Normalize the backend shape → flat user object with nested roleProfile
// ------------------------------------------------------------
const normalizeProfile = (raw, role) => {
  if (!raw) return null;

  // Case A: { _id, userId: {User}, ...roleFields }
  if (raw.userId && typeof raw.userId === "object") {
    const { userId: user, ...roleData } = raw;
    const key = ROLE_PROFILE_KEY[role];

    return {
      _id: user._id,
      id: user._id,
      profileId: roleData._id,          // the profile record's _id
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role ?? role,
      status: roleData.status ?? user.status,
      image: user.image,
      createdAt: roleData.createdAt ?? user.createdAt,
      updatedAt: roleData.updatedAt ?? user.updatedAt,
      ...(key ? { [key]: { ...roleData, userId: user } } : {}),
    };
  }

  // Case B: { user: {...}, profile: {...} }
  if (raw.user && raw.profile) {
    const key = ROLE_PROFILE_KEY[role];
    return {
      _id: raw.user._id,
      id: raw.user._id,
      profileId: raw.profile._id,
      name: raw.user.name,
      email: raw.user.email,
      phone: raw.user.phone,
      role: raw.user.role ?? role,
      status: raw.profile.status ?? raw.user.status,
      image: raw.user.image,
      ...(key ? { [key]: { ...raw.profile, userId: raw.user } } : {}),
    };
  }

  // Case C: already flat
  return { ...raw, role: raw.role ?? role };
};

const profileService = {
  list: async (role, params = {}) => {
    const url = ENDPOINTS[role] ?? ENDPOINTS.User;
    const response = await api.get(url, { params });
    const payload = response.data;

    const arr =
      payload?.data?.data ??
      payload?.data ??
      (Array.isArray(payload) ? payload : []);

    return {
      ...payload,
      data: arr.map((p) => normalizeProfile(p, role)),
    };
  },

  getById: async (role, id) => {
    const url = ENDPOINTS[role] ?? ENDPOINTS.User;
    const response = await api.get(`${url}/${id}`);
    const payload = response.data;
    const raw = payload?.data ?? payload;
    return { ...payload, data: normalizeProfile(raw, role) };
  },

  // ----------------------------------------------------------
  // Unified detail fetch — routes to the right role service
  // ----------------------------------------------------------
  getFullProfile: async (role, id) => {
  switch (role) {
    case "Teacher": {
      const res = await teacherService.getTeacherById(id);
      const raw = res?.data ?? res;
      return normalizeProfile(raw, "Teacher");
    }
    case "Student": {
      const res = await studentService.getStudent(id);
      const raw = res?.data ?? res;
      return normalizeProfile(raw, "Student");
    }
    default: {
      const res = await profileService.getById(role, id);
      return res.data;
    }
  }
  },

  update: async (role, id, data) => {
    const url = ENDPOINTS[role] ?? ENDPOINTS.User;
    const response = await api.patch(`${url}/${id}`, data);
    return response.data;
  },

  changeStatus: async (role, id, status) => {
    const url = ENDPOINTS[role] ?? ENDPOINTS.User;
    const response = await api.patch(`${url}/${id}/status`, { status });
    return response.data;
  },

  remove: async (role, id) => {
    const url = ENDPOINTS[role] ?? ENDPOINTS.User;
    const response = await api.delete(`${url}/${id}`);
    return response.data;
  },
};

export { normalizeProfile };
export default profileService;