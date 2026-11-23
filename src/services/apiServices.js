import { API_CONFIG, APP_CONFIG } from "@/config/appConfig";
import { http } from "./httpClient";

/**
 * Adaptadores HTTP de la API real.
 * Cada método es una traducción delgada: parámetros de entrada → ruta y query,
 * respuesta del servidor → forma que esperan las pantallas.
 *
 * Si tu API usa otros nombres o estructuras, este es el único archivo que hay
 * que ajustar. Ver API_INTEGRATION.md para el contrato propuesto.
 */

const AUTH = API_CONFIG.auth;
const pageSize = APP_CONFIG.pagination.pageSize;

const clean = (params = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""));

const paging = ({ page, pageSize: size } = {}) => clean({ page, page_size: size || pageSize });

function normalizePage(response, size = pageSize) {
  if (Array.isArray(response)) {
    return { items: response, page: 1, pageSize: response.length, total: response.length, totalPages: 1 };
  }
  const items = response?.items || response?.data || [];
  const total = response?.total ?? items.length;
  const page = response?.page ?? 1;
  const pageSizeValue = response?.page_size ?? size;
  return {
    items,
    page,
    pageSize: pageSizeValue,
    total,
    totalPages: response?.total_pages ?? Math.max(1, Math.ceil(total / pageSizeValue)),
  };
}

export function createApiServices() {
  const auth = {
    async login({ email, password }) {
      const response = await http.post(AUTH.loginPath, { email, password });
      return { token: response.token || response.access_token || null, user: response.user || response.data };
    },
    me: () => http.get(AUTH.mePath),
    logout: () => http.post(AUTH.logoutPath, {}),
    requestPasswordReset: ({ email }) => http.post(AUTH.forgotPasswordPath, { email }),
    resetPassword: ({ token, password }) => http.post(AUTH.resetPasswordPath, { token, password }),
  };

  const publicSite = {
    getContent: () => http.get("/public/site-content"),
    createInquiry: (payload) =>
      http.post("/public/admissions/inquiries", {
        full_name: payload.fullName,
        phone: payload.phone,
        email: payload.email,
        level_id: payload.levelId,
        grade_id: payload.gradeId || null,
        message: payload.message,
        source: "sitio_web",
      }),
  };

  const admissions = {
    async list(params = {}) {
      const response = await http.get(
        "/admissions",
        clean({ level_id: params.levelId, stage: params.stage, owner_id: params.ownerId, q: params.q, ...paging(params) }),
      );
      return normalizePage(response, params.pageSize);
    },
    get: (id) => http.get(`/admissions/${id}`),
    addFollowUp: (id, payload) =>
      http.post(`/admissions/${id}/follow-ups`, {
        note: payload.note,
        stage: payload.stage,
        next_action: payload.nextAction,
        next_action_date: payload.nextActionDate,
      }),
    owners: () => http.get("/admissions/owners"),
    convert: (id, payload) =>
      http.post(`/admissions/${id}/conversions`, {
        cycle_id: payload.cycleId,
        grade_id: payload.gradeId,
        group_id: payload.groupId,
        student_mode: payload.studentMode,
        student_id: payload.studentId || null,
        birth_date: payload.birthDate || null,
        curp: payload.curp || null,
      }),
  };

  const students = {
    async list(params = {}) {
      const response = await http.get(
        "/students",
        clean({
          level_id: params.levelId,
          grade_id: params.gradeId,
          group_id: params.groupId,
          status: params.status,
          q: params.q,
          ...paging(params),
        }),
      );
      return normalizePage(response, params.pageSize);
    },
    get: (id) => http.get(`/students/${id}`),
    create: (payload) =>
      http.post("/students", {
        first_name: payload.firstName,
        last_name: payload.lastName,
        group_id: payload.groupId,
        cycle_id: payload.cycleId,
        gender: payload.gender,
        birth_date: payload.birthDate,
        curp: payload.curp,
        address: payload.address,
        blood_type: payload.bloodType,
        allergies: payload.allergies,
        notes: payload.notes,
        tutor: payload.tutorName
          ? {
              name: payload.tutorName,
              email: payload.tutorEmail,
              phone: payload.tutorPhone,
              relationship: payload.tutorRelationship,
            }
          : null,
      }),
    update: (id, payload) => http.patch(`/students/${id}`, payload),
    enroll: (id, payload) => http.post(`/students/${id}/enrollments`, { cycle_id: payload.cycleId, group_id: payload.groupId }),
    changeGroup: (id, payload) => http.patch(`/students/${id}/group`, { group_id: payload.groupId }),
    withdraw: (id, payload) => http.post(`/students/${id}/withdrawals`, { reason: payload.reason, effective_date: payload.effectiveDate }),
    addDocument: (id, payload) =>
      http.post(`/students/${id}/documents`, { name: payload.name, type: payload.type, file_name: payload.fileName }),
    removeDocument: (id, documentId) => http.del(`/students/${id}/documents/${documentId}`),
    downloadDocument: (id, documentId) => http.download(`/students/${id}/documents/${documentId}`),
  };

  const catalog = {
    get: () => http.get("/catalogs"),
    create: (kind, payload) => http.post(`/catalogs/${kind}`, payload),
    update: (kind, id, payload) => http.patch(`/catalogs/${kind}/${id}`, payload),
    assignments: ({ groupId }) => http.get("/teaching-assignments", { group_id: groupId }),
    saveAssignment: ({ groupId, subjectId, teacherId, schedule }) =>
      http.put("/teaching-assignments", {
        group_id: groupId,
        subject_id: subjectId,
        teacher_id: teacherId,
        schedule,
      }),
  };

  const attendance = {
    sheet: ({ groupId, date, subjectId }) =>
      http.get("/attendance/sheet", clean({ group_id: groupId, date, subject_id: subjectId })),
    save: ({ groupId, date, subjectId, records }) =>
      http.put("/attendance/sheet", {
        group_id: groupId,
        date,
        subject_id: subjectId || null,
        records: records.map((r) => ({ student_id: r.studentId, status: r.status, note: r.note })),
      }),
    history: ({ studentId }) => http.get(`/attendance/students/${studentId}`).then((r) => normalizePage(r)),
    report: ({ groupId, from, to }) => http.get("/attendance/reports", clean({ group_id: groupId, from, to })),
  };

  const incidents = {
    async list(params = {}) {
      const response = await http.get(
        "/incidents",
        clean({ student_id: params.studentId, group_id: params.groupId, type: params.type, ...paging(params) }),
      );
      return normalizePage(response, params.pageSize);
    },
    create: (payload) =>
      http.post("/incidents", {
        student_id: payload.studentId,
        date: payload.date,
        type: payload.type,
        description: payload.description,
        visibility: payload.visibility,
      }),
    addFollowUp: (id, payload) => http.post(`/incidents/${id}/follow-ups`, { note: payload.note, status: payload.status }),
  };

  const grades = {
    sheet: ({ groupId, subjectId, periodId }) =>
      http.get("/grades/sheet", clean({ group_id: groupId, subject_id: subjectId, period_id: periodId })),
    save: ({ groupId, subjectId, periodId, entries, action }) =>
      http.put("/grades/sheet", {
        group_id: groupId,
        subject_id: subjectId,
        period_id: periodId,
        action,
        entries: entries.map((e) => ({
          student_id: e.studentId,
          value: e.value === "" || e.value === undefined ? null : Number(e.value),
          qualitative: e.qualitative || null,
        })),
      }),
    reportCard: ({ studentId, periodId }) => http.get(`/grades/report-cards/${studentId}`, { period_id: periodId }),
    requestCorrection: (payload) =>
      http.post("/grade-corrections", {
        student_id: payload.studentId,
        period_id: payload.periodId,
        subject_id: payload.subjectId,
        reason: payload.reason,
      }),
    listCorrections: ({ studentId } = {}) =>
      http.get("/grade-corrections", clean({ student_id: studentId })).then((r) => normalizePage(r, 50)),
    authorizeCorrection: (id, payload) => http.patch(`/grade-corrections/${id}`, { decision: payload.decision, note: payload.note }),
  };

  const payments = {
    concepts: () => http.get("/billing/concepts"),
    async charges(params = {}) {
      const response = await http.get(
        "/billing/charges",
        clean({ student_id: params.studentId, status: params.status, q: params.q, ...paging(params) }),
      );
      return { ...normalizePage(response, params.pageSize), summary: response?.summary || { total: 0, paid: 0, balance: 0 } };
    },
    statement: ({ studentId }) => http.get(`/billing/students/${studentId}/statement`),
    createCharges: (payload) =>
      http.post("/billing/charges", {
        concept_id: payload.conceptId,
        student_ids: payload.studentIds,
        amount: Number(payload.amount),
        due_date: payload.dueDate,
        cycle_id: payload.cycleId,
      }),
    registerPayment: (payload) =>
      http.post("/billing/payments", {
        student_id: payload.studentId,
        amount: Number(payload.amount),
        method: payload.method,
        date: payload.date,
        reference: payload.reference,
        allocations: payload.allocations,
      }),
    cancelPayment: (id, payload) => http.post(`/billing/payments/${id}/cancellation`, { reason: payload.reason }),
    applyDiscount: (payload) =>
      http.post(`/billing/charges/${payload.chargeId}/discount`, { percent: Number(payload.percent), reason: payload.reason }),
    cashCut: ({ from, to, userId, method } = {}) =>
      http.get("/billing/cash-cuts", clean({ from, to, user_id: userId, method })),
    receipt: ({ paymentId }) => http.get(`/billing/receipts/${paymentId}`),
  };

  const announcements = {
    async list(params = {}) {
      const response = await http.get(
        "/announcements",
        clean({ level_id: params.levelId, status: params.status, q: params.q, ...paging(params) }),
      );
      return normalizePage(response, params.pageSize);
    },
    save: (payload) =>
      payload.id
        ? http.patch(`/announcements/${payload.id}`, {
            title: payload.title,
            body: payload.body,
            audience_level_id: payload.audienceLevelId,
            audience_group_id: payload.audienceGroupId,
            publish_at: payload.publishAt,
            status: payload.status,
          })
        : http.post("/announcements", {
            title: payload.title,
            body: payload.body,
            audience_level_id: payload.audienceLevelId,
            audience_group_id: payload.audienceGroupId,
            publish_at: payload.publishAt,
            status: payload.status,
          }),
    publish: (id) => http.post(`/announcements/${id}/publish`, {}),
    remove: (id) => http.del(`/announcements/${id}`),
  };

  const calendar = {
    list: ({ from, to, levelId } = {}) => http.get("/calendar/events", clean({ from, to, level_id: levelId })),
    create: (payload) =>
      http.post("/calendar/events", {
        title: payload.title,
        date: payload.date,
        start_time: payload.startTime,
        end_time: payload.endTime,
        level_id: payload.levelId,
        type: payload.type,
        description: payload.description,
      }),
  };

  const reports = {
    get: ({ type, params = {} } = {}) =>
      http.get(`/reports/${type}`, clean({ from: params.from, to: params.to, level_id: params.levelId, period_id: params.periodId })),
    async export({ type, params = {} } = {}) {
      const blob = await http.download(
        `/reports/${type}/export`,
        clean({ from: params.from, to: params.to, level_id: params.levelId, period_id: params.periodId }),
      );
      return { blob, filename: `${type}.csv` };
    },
  };

  const users = {
    list: ({ role, q } = {}) => http.get("/users", clean({ role, q })).then((r) => normalizePage(r, 50)),
    invite: ({ name, email, role }) => http.post("/users/invitations", { name, email, role }),
    update: (id, payload) => http.patch(`/users/${id}`, payload),
    roles: () =>
      Promise.resolve([
        { id: "admin", name: "Administrador general" },
        { id: "direccion", name: "Dirección" },
        { id: "control_escolar", name: "Control escolar" },
        { id: "docente", name: "Docente" },
        { id: "caja", name: "Caja" },
        { id: "tutor", name: "Tutor" },
      ]),
  };

  const settings = {
    get: () => http.get("/settings"),
    save: (patch) => http.put("/settings", patch),
  };

  const audit = {
    async list(params = {}) {
      const response = await http.get("/audit-log", clean({ user_id: params.userId, from: params.from, to: params.to, ...paging(params) }));
      return normalizePage(response, params.pageSize);
    },
  };

  const dashboard = { overview: () => http.get("/dashboard/overview") };

  const portal = {
    children: () => http.get("/portal/students"),
    summary: (studentId) => http.get(`/portal/students/${studentId}/summary`),
    attendance: (studentId) => http.get(`/portal/students/${studentId}/attendance`),
    incidents: (studentId) => http.get(`/portal/students/${studentId}/incidents`),
    grades: (studentId) => http.get(`/portal/students/${studentId}/grades`),
    statement: (studentId) => http.get(`/portal/students/${studentId}/statement`),
    announcements: (studentId) => http.get(`/portal/students/${studentId}/announcements`),
    events: (studentId) => http.get(`/portal/students/${studentId}/events`),
    receipt: ({ paymentId }) => http.get(`/billing/receipts/${paymentId}`),
  };

  const unsupported = async () => {
    throw new Error("Las utilidades de demostración no están disponibles en modo api.");
  };

  return {
    auth,
    publicSite,
    admissions,
    students,
    catalog,
    attendance,
    incidents,
    grades,
    payments,
    announcements,
    calendar,
    reports,
    users,
    settings,
    audit,
    dashboard,
    portal,
    demo: {
      supported: false,
      expireSession: unsupported,
      forceValidationError: unsupported,
      forceDuplicateError: unsupported,
      switchRole: unsupported,
      reset: unsupported,
    },
  };
}