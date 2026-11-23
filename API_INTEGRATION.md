# Integración con la API del colegio

Documento de referencia para conectar este frontend con tu servidor. Todo el consumo de datos
pasa por una capa de servicios con la misma interfaz en modo `mock` y en modo `api`: ninguna
pantalla cambia cuando conectas tu backend.

---

## 1. Configuración

Archivo: `src/config/appConfig.js`

```js
export const API_CONFIG = {
  baseUrl: import.meta.env.VITE_API_BASE_URL || "https://api.colegiomonteverde.mx/v1",
  mode: import.meta.env.VITE_DATA_MODE === "api" ? "api" : "mock",
  timeoutMs: 20000,
  auth: {
    strategy: "bearer",              // "bearer" (token en cabecera) o "cookie" (HttpOnly)
    tokenStorageKey: "cm.session.token",
    loginPath: "/auth/login",
    mePath: "/auth/me",
    logoutPath: "/auth/logout",
    forgotPasswordPath: "/auth/password/forgot",
    resetPasswordPath: "/auth/password/reset",
  },
};
```

Variables de entorno (`.env` o panel de configuración del hosting):

| Variable | Valores | Descripción |
| --- | --- | --- |
| `VITE_DATA_MODE` | `mock` \| `api` | `mock` usa datos ficticios en memoria; `api` usa tu servidor. |
| `VITE_API_BASE_URL` | URL | Base de la API, sin barra final. |

**Nunca coloques secretos del servidor en este archivo**: todo lo que está en `src/` viaja al navegador.

### Cambiar de demostración a tu API

1. Define `VITE_DATA_MODE=api` y `VITE_API_BASE_URL=https://tu-servidor/api/v1`.
2. Ajusta rutas y mapeos en `src/services/apiServices.js` si tu API usa otros nombres.
3. Verifica el mecanismo de sesión (sección 3).
4. Revisa que las respuestas de listas incluyan paginación (sección 4).

---

## 2. Ubicación de los servicios

```
src/services/
  index.js          → elige mock o api y exporta `services` (único punto de acceso)
  httpClient.js     → URL base, token, timeout, traducción de errores HTTP
  apiServices.js    → rutas y mapeos de tu API (archivo a adaptar)
  mockServices.js   → implementación de demostración con la misma interfaz
  mockData.js       → datos ficticios de la sesión
  errors.js         → ApiError, manejo de 401/403 y errores por campo
```

Las pantallas siempre llaman `services.<módulo>.<acción>()`:

```js
import { services } from "@/services";

const page = await services.students.list({ levelId: "lvl-pri", page: 1, pageSize: 10 });
await services.payments.registerPayment({ studentId, amount: 1500, method: "efectivo" });
```

Módulos disponibles: `auth`, `publicSite`, `admissions`, `students`, `catalog`, `attendance`,
`incidents`, `grades`, `payments`, `announcements`, `calendar`, `reports`, `users`, `settings`,
`audit`, `dashboard`, `portal` y `demo` (solo demostración).

---

## 3. Sesión

La interfaz espera este contrato (ajustable en `apiServices.js` y `httpClient.js`):

| Acción | Ruta propuesta | Respuesta |
| --- | --- | --- |
| Iniciar sesión | `POST /auth/login` | `{ token, user }` |
| Sesión actual | `GET /auth/me` | `user` |
| Cerrar sesión | `POST /auth/logout` | `204` |
| Solicitar recuperación | `POST /auth/password/forgot` | `{ ok: true }` |
| Restablecer contraseña | `POST /auth/password/reset` | `{ ok: true }` |

Objeto `user`:

```json
{
  "id": "usr-doc",
  "name": "Daniela Ríos",
  "email": "docente@colegiomonteverde.edu.mx",
  "role": "docente",
  "title": "Docente de matemáticas",
  "status": "activo",
  "teacherId": "tch-1",
  "tutorId": null
}
```

Roles: `admin`, `direccion`, `control_escolar`, `docente`, `caja`, `tutor`.

- Con `strategy: "bearer"` el cliente envía `Authorization: Bearer <token>` y guarda el token en
  `localStorage` con la llave `cm.session.token`.
- Con `strategy: "cookie"` el cliente hace `fetch` con `credentials: "include"` y no envía cabecera;
  tu servidor debe emitir una cookie `HttpOnly`.
- El frontend **no** implementa autenticación: solo guarda y presenta la sesión que devuelve tu API.
- Cada operación se autoriza en el servidor. Ocultar un menú o botón es solo experiencia de uso.

### Manejo de errores de sesión

- **401**: se limpia la sesión local y se redirige a `/login?expirada=1&returnTo=<ruta>`.
- **403**: se muestra «Acceso denegado» en la pantalla y se conserva la ruta.
- **422**: se muestran los errores por campo sin perder lo capturado.

Forma de error esperada:

```json
{
  "message": "El grupo 2° A no tiene cupo disponible (25/25).",
  "code": "CUPO_INSUFICIENTE",
  "field_errors": { "phone": "El teléfono debe tener 10 dígitos." }
}
```

También se acepta `errors` o `fieldErrors` como objeto de errores por campo.

---

## 4. Paginación, filtros y formatos

Toda lista devuelve:

```json
{
  "items": [],
  "page": 1,
  "page_size": 10,
  "total": 117,
  "total_pages": 12
}
```

Se aceptan también `data` en lugar de `items`. El cliente normaliza en `normalizePage()`.

Parámetros de consulta estándar: `page`, `page_size`, más los filtros de cada módulo.
Valores vacíos, `null` y `"todos"` no se envían.

Formatos: fechas `YYYY-MM-DD` y marcas de tiempo ISO 8601; moneda MXN; español de México.

---

## 5. Rutas propuestas

### Sitio público

| Método | Ruta | Notas |
| --- | --- | --- |
| GET | `/public/site-content` | Contenido institucional editable (textos, fotos, contacto, niveles). |
| POST | `/public/admissions/inquiries` | Solicitud de informes. |

`POST /public/admissions/inquiries`

```json
{
  "full_name": "Andrea Solís Márquez",
  "phone": "222 315 7742",
  "email": "familia.solis@correo.mx",
  "level_id": "lvl-pri",
  "grade_id": "g-pri-3",
  "message": "Nos interesa ingresar en enero.",
  "source": "sitio_web"
}
```

Respuesta: `{ "id": "adm-0009", "folio": "SOL-2026-0009" }`

Contenido esperado en `GET /public/site-content`:

```json
{
  "institution": { "name": "", "city": "", "state": "", "address": "", "phone": "", "whatsapp": "", "email": "", "hours": "", "mapUrl": "", "founded": 1998 },
  "hero": { "eyebrow": "", "title": "", "titleAccent": "", "lead": "", "primaryCta": "", "secondaryCta": "", "marks": [] },
  "about": { "eyebrow": "", "title": "", "paragraphs": [], "quote": "", "quoteSource": "", "image": "", "stats": [] },
  "values": [{ "title": "", "description": "", "icon": "heart" }],
  "levels": [{ "id": "lvl-pri", "name": "Primaria", "ages": "6 a 11 años", "description": "", "image": "", "highlights": [] }],
  "facilities": [{ "name": "", "description": "" }],
  "gallery": [{ "src": "", "alt": "", "caption": "" }],
  "admissions": { "eyebrow": "", "title": "", "lead": "", "steps": [], "requirements": [], "note": "" },
  "contact": { "heading": "", "note": "", "whatsappMessage": "" },
  "privacy": { "title": "", "updatedAt": "", "body": [] }
}
```

### Admisiones

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/admissions` | `level_id`, `stage`, `owner_id`, `q`, `page`, `page_size` |
| GET | `/admissions/:id` | — |
| POST | `/admissions/:id/follow-ups` | `note`, `stage`, `next_action`, `next_action_date` |
| POST | `/admissions/:id/conversions` | `cycle_id`, `grade_id`, `group_id`, `student_mode`, `student_id` |
| GET | `/admissions/owners` | Responsables asignables |

Errores de conversión esperados: `409 CUPO_INSUFICIENTE` y `409 EXPEDIENTE_DUPLICADO`
(este último con `payload.studentId` para enlazar al expediente existente).

### Alumnos y catálogos

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/students` | `level_id`, `grade_id`, `group_id`, `status`, `cycle_id`, `q`, paginación |
| GET | `/students/:id` | Devuelve alumno + tutores + documentos + inscripciones + incidencias |
| POST | `/students` | Alta |
| PATCH | `/students/:id` | Edición |
| POST | `/students/:id/enrollments` | `cycle_id`, `group_id` (inscripción o reinscripción) |
| PATCH | `/students/:id/group` | `group_id` |
| POST | `/students/:id/withdrawals` | `reason`, `effective_date` |
| POST | `/students/:id/documents` | Metadatos del documento (`name`, `type`, `file_name`) |
| DELETE | `/students/:id/documents/:documentId` | — |
| GET | `/students/:id/documents/:documentId` | Descarga binaria |
| GET | `/catalogs` | Ciclos, niveles, grados, grupos, materias, docentes, periodos, conceptos |
| POST | `/catalogs/:kind` | `kind`: cycles, groups, subjects, teachers, periods, concepts |
| PATCH | `/catalogs/:kind/:id` | — |
| GET | `/teaching-assignments?group_id=` | Materias con docente y horario |
| PUT | `/teaching-assignments` | `group_id`, `subject_id`, `teacher_id`, `schedule` |

### Asistencia e incidencias

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/attendance/sheet` | `group_id`, `date`, `subject_id` (opcional) |
| PUT | `/attendance/sheet` | `group_id`, `date`, `subject_id`, `records[]` |
| GET | `/attendance/students/:id` | Historial |
| GET | `/attendance/reports` | `group_id`, `from`, `to` |
| GET | `/incidents` | `student_id`, `group_id`, `type`, paginación |
| POST | `/incidents` | `student_id`, `date`, `type`, `description`, `visibility` |
| POST | `/incidents/:id/follow-ups` | `note`, `status` |

Estados de asistencia: `presente`, `falta`, `retardo`, `justificado`.

### Calificaciones y boletas

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/grades/sheet` | `group_id`, `subject_id`, `period_id` |
| PUT | `/grades/sheet` | `group_id`, `subject_id`, `period_id`, `action`, `entries[]` |
| GET | `/grades/report-cards/:studentId` | `period_id` |
| GET | `/grade-corrections` | `student_id` |
| POST | `/grade-corrections` | `student_id`, `period_id`, `subject_id`, `reason` |
| PATCH | `/grade-corrections/:id` | `decision`: `autorizar` \| `rechazar` |

`action` de la hoja: `draft` (borrador), `review` (revisión), `publish` (publicar), `close` (cerrar).
**Un campo vacío se envía como `null` (sin captura); `0` es una calificación válida.**

Escalas: numérica 0–10 (primaria y secundaria) y cualitativa `A`/`S`/`B`/`R` (preescolar).

### Colegiaturas y caja

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/billing/concepts` | Catálogo de conceptos |
| GET | `/billing/charges` | `student_id`, `status`, `q`, paginación |
| GET | `/billing/students/:id/statement` | Estado de cuenta |
| POST | `/billing/charges` | `concept_id`, `student_ids[]`, `amount`, `due_date`, `cycle_id` |
| POST | `/billing/payments` | `student_id`, `amount`, `method`, `date`, `reference`, `allocations[]` |
| POST | `/billing/payments/:id/cancellation` | `reason` |
| POST | `/billing/charges/:id/discount` | `percent`, `reason` |
| GET | `/billing/cash-cuts` | `from`, `to`, `user_id`, `method` |
| GET | `/billing/receipts/:paymentId` | Recibo imprimible |

Respuesta de `POST /billing/payments`:

```json
{
  "payment": {
    "id": "pay-0451",
    "folio": "REC-2026-0451",
    "studentId": "stu-001",
    "amount": 2000,
    "method": "efectivo",
    "date": "2026-11-18",
    "status": "vigente",
    "cashierName": "Miguel Ángel Torres",
    "allocations": [{ "chargeId": "chg-0120", "conceptName": "Colegiatura mensual", "amount": 2000 }]
  },
  "statement": { "summary": { "total": 4200, "paid": 2000, "balance": 2200, "overdue": 0 } }
}
```

El estado de cuenta debe regresar `summary`, `charges[]` (con `netAmount` y `balance`) y `payments[]`.
El frontend **no** calcula saldos definitivos: los muestra tal como llegan.

### Comunicación, reportes y administración

| Método | Ruta | Parámetros |
| --- | --- | --- |
| GET | `/announcements` | `level_id`, `status`, `q`, paginación |
| POST/PATCH | `/announcements[/:id]` | `title`, `body`, `audience_level_id`, `audience_group_id`, `publish_at`, `status` |
| POST | `/announcements/:id/publish` | — |
| DELETE | `/announcements/:id` | — |
| GET | `/calendar/events` | `from`, `to`, `level_id` |
| POST | `/calendar/events` | Evento nuevo |
| GET | `/reports/:type` | `matricula` \| `asistencia` \| `calificaciones` \| `cobranza`; `from`, `to`, `level_id`, `period_id` |
| GET | `/reports/:type/export` | CSV binario |
| GET | `/users` | `role`, `q` |
| POST | `/users/invitations` | `name`, `email`, `role` |
| PATCH | `/users/:id` | `status`, `role` |
| GET | `/settings` | Institución, contenido y ciclos |
| PUT | `/settings` | `{ institution, content }` |
| GET | `/audit-log` | `user_id`, `from`, `to`, paginación |
| GET | `/dashboard/overview` | Tarjetas del inicio según rol |

Reporte (`GET /reports/:type`):

```json
{
  "title": "Reporte de matrícula",
  "columns": ["nivel", "grupos", "alumnos", "capacidad", "ocupacion"],
  "rows": [{ "nivel": "Primaria", "grupos": 12, "alumnos": 48, "capacidad": 300, "ocupacion": "16%" }],
  "summary": [{ "label": "Alumnos activos", "value": 117 }]
}
```

### Portal familiar

| Método | Ruta |
| --- | --- |
| GET | `/portal/students` (alumnos vinculados al tutor) |
| GET | `/portal/students/:id/summary` |
| GET | `/portal/students/:id/attendance` |
| GET | `/portal/students/:id/incidents` (solo visibles para tutores) |
| GET | `/portal/students/:id/grades` (solo publicadas) |
| GET | `/portal/students/:id/statement` |
| GET | `/portal/students/:id/announcements` |
| GET | `/portal/students/:id/events` |

El servidor debe validar que el alumno pertenezca al tutor autenticado y responder `403` si no.

---

## 6. Contratos pendientes de definir

Pantallas que hoy funcionan en demostración y requieren confirmación de tu API:

1. **Documentos del expediente**: se envían metadatos; falta definir si la carga es multipart,
   URL firmada o base64, y el formato de descarga.
2. **Exportaciones**: se espera un CSV binario. Si tu API entrega una URL temporal, ajusta
   `reports.export()` para devolver `{ url }` y descargarla.
3. **Dashboard**: `/dashboard/overview` devuelve `kpis[]`, `activity[]` y, según el rol,
   `myGroups[]` o `recentPayments[]`. Puede calcularse en el servidor con tus propias consultas.
4. **Calendario**: creación de eventos existe en servicios pero la interfaz solo consulta.
5. **Notificaciones por correo o WhatsApp**: no incluidas; se resuelven en el servidor.
6. **Firma electrónica de boletas y recibos**: la impresión usa el navegador.
7. **Paginación de catálogos**: hoy llegan completos; si crecen, conviene paginar.

---

## 7. Modo demostración

`VITE_DATA_MODE=mock` (predeterminado) levanta datos ficticios en memoria:

- Los cambios viven en la sesión del navegador; al recargar se reinician.
- El panel muestra un aviso permanente de «Modo demostración».
- El cambio de rol, la simulación de sesión vencida y el error de validación del servidor
  solo existen en este modo (`services.demo.supported`).
- Usuarios de prueba (contraseña `demo1234`):

| Correo | Rol |
| --- | --- |
| admin@colegiomonteverde.edu.mx | Administrador general |
| direccion@colegiomonteverde.edu.mx | Dirección |
| control@colegiomonteverde.edu.mx | Control escolar |
| docente@colegiomonteverde.edu.mx | Docente |
| caja@colegiomonteverde.edu.mx | Caja |
| tutor@colegiomonteverde.edu.mx | Tutor (Sofía y Mateo Salgado) |

Nunca se sustituye una respuesta fallida de la API por datos ficticios: en modo `api` un error se
muestra al usuario y el formulario conserva lo capturado.
