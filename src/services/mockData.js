/**
 * Datos ficticios de demostración (solo modo "mock").
 * Se generan una vez por sesión y viven en memoria: al recargar la página
 * el estado vuelve a su punto inicial.
 */

const TODAY = "2026-11-18";
const ACTIVE_CYCLE = "cyc-2026";

const IMAGES = {
  campus: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/96871d035_generated_image.png",
  classroom: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/a0665b018_generated_image.png",
  preschool: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/64b5211c8_generated_image.png",
  lab: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/be5fa98eb_generated_image.png",
  library: "https://media.base44.com/images/public/6afdde31503e92897bfa1175/e45b974b1_generated_image.png",
};

export const STAGE_LABELS = {
  nuevo: "Nuevo",
  contactado: "Contactado",
  visita: "Visita agendada",
  evaluacion: "En evaluación",
  aceptado: "Aceptado",
  inscrito: "Inscrito",
  descartado: "Descartado",
};

export const ATTENDANCE_LABELS = {
  presente: "Presente",
  falta: "Falta",
  retardo: "Retardo",
  justificado: "Justificado",
};

export const QUALITATIVE_LABELS = {
  A: "Avanzado",
  S: "Satisfactorio",
  B: "Básico",
  R: "Requiere apoyo",
};

export const CHARGE_STATUS_LABELS = {
  pagado: "Pagado",
  parcial: "Parcial",
  pendiente: "Pendiente",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

function rng(seed) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

const FEMALE = [
  "Ana Sofía", "María José", "Ximena", "Camila", "Valeria", "Renata", "Regina", "Fernanda",
  "Andrea", "Danna Paola", "Frida", "Jimena", "Paola", "Sofía", "Isabela", "Mariana", "Lucía",
  "Natalia", "Daniela", "Montserrat", "Alejandra", "Elena", "Gabriela", "Romina", "Victoria",
  "Paulina", "Miranda", "Itzel", "Alondra", "Constanza",
];
const MALE = [
  "Santiago", "Mateo", "Diego", "Leonardo", "Emiliano", "Sebastián", "Rodrigo", "Iker",
  "Alejandro", "Daniel", "Jesús", "Miguel Ángel", "Ángel Gabriel", "Luis Fernando", "Bruno",
  "Patricio", "Ricardo", "Tomás", "Emilio", "Andrés", "Joaquín", "Maximiliano", "Fabián",
  "Alonso", "Héctor", "Rubén", "Óscar", "Eduardo",
];
const LAST = [
  "Hernández", "García", "Martínez", "López", "Ramírez", "Sánchez", "Cruz", "Flores", "Gómez",
  "Vázquez", "Rojas", "Morales", "Jiménez", "Ortega", "Castillo", "Romero", "Aguilar", "Mendoza",
  "Rivera", "Salazar", "Núñez", "Ibarra", "Cabrera", "Trejo", "Cortés", "Palacios", "Fuentes",
  "Bautista", "Quintero", "Solís",
];
const STREETS = ["Av. del Roble", "Calle 5 de Mayo", "Priv. Los Cedros", "Av. Juárez", "Calle Hidalgo", "And. Las Flores"];

/** Nombres reservados para los prospectos de demostración (evita colisiones). */
const PROSPECT_NAMES = [
  "Andrea Solís Márquez",
  "Emiliano Rojas Peña",
  "Regina Fuentes Ibarra",
  "Luis Fernando Bautista Cruz",
  "Ximena Palacios Núñez",
  "Diego Ortega Mendoza",
  "Camila Trejo Rivera",
  "Santiago Aguilar Cortés",
];

function createSiteContent() {
  return {
    institution: {
      name: "Colegio Monteverde",
      shortName: "Monteverde",
      tagline: "Excelencia académica con corazón",
      city: "Puebla",
      state: "Puebla",
      address: "Av. del Roble 1450, Col. Jardines de San Manuel, Puebla, Pue.",
      phone: "222 123 4567",
      whatsapp: "222 987 6543",
      email: "admisiones@colegiomonteverde.edu.mx",
      hours: "Lunes a viernes · 7:30 a 15:30 h",
      mapUrl: "https://maps.google.com/?q=Colegio+Monteverde+Puebla",
      founded: 1998,
    },
    hero: {
      eyebrow: "Preescolar · Primaria · Secundaria — Puebla",
      title: "Excelencia académica",
      titleAccent: "que forma personas íntegras",
      lead:
        "Acompañamos a cada estudiante con un modelo académico riguroso, cercano y con sólida formación en valores cristianos, desde preescolar hasta secundaria.",
      primaryCta: "Solicitar informes",
      secondaryCta: "Acceso al portal",
      marks: ["Preescolar", "Primaria", "Secundaria", "Desde 1998", "Formación cristiana"],
    },
    about: {
      eyebrow: "Quiénes somos",
      title: "Un colegio de excelencia, con raíces y propósito",
      paragraphs: [
        "Desde 1998 formamos en Puebla a niñas, niños y adolescentes con un proyecto educativo que une la exigencia académica con el acompañamiento personal. Grupos pequeños, docentes especializados y un seguimiento cercano a cada familia.",
        "Nuestra propuesta integra el pensamiento crítico, las artes, el deporte y la formación cristiana, para que cada alumno descubra sus talentos y los ponga al servicio de los demás.",
      ],
      quote: "«Instruye al niño en su camino, y aun cuando fuere viejo no se apartará de él.»",
      quoteSource: "Proverbios 22:6",
      image: IMAGES.library,
      stats: [
        { value: "27", label: "años formando generaciones" },
        { value: "14:1", label: "alumnos por docente en promedio" },
        { value: "98%", label: "egresados que ingresan a su primera opción" },
        { value: "3", label: "niveles educativos en un mismo campus" },
      ],
    },
    values: [
      { title: "Fe y esperanza", description: "Una comunidad que crece en valores cristianos, gratitud y servicio.", icon: "heart" },
      { title: "Excelencia académica", description: "Rigor, método y altas expectativas para cada estudiante.", icon: "award" },
      { title: "Acompañamiento cercano", description: "Tutoría y orientación personal con seguimiento a cada familia.", icon: "users" },
      { title: "Pensamiento crítico", description: "Alumnos que investigan, argumentan y deciden con criterio.", icon: "lightbulb" },
      { title: "Comunidad y servicio", description: "Proyectos sociales que vinculan el aprendizaje con la realidad.", icon: "handshake" },
      { title: "Disciplina y responsabilidad", description: "Hábitos claros que sostienen el aprendizaje y la convivencia.", icon: "shield" },
    ],
    levels: [
      {
        id: "lvl-pre",
        name: "Preescolar",
        ages: "3 a 5 años",
        description:
          "Aprendizaje a través del juego, el asombro y el afecto. Ambientes preparados que desarrollan lenguaje, pensamiento matemático y vida en comunidad.",
        image: IMAGES.preschool,
        highlights: ["Grupos de 20 alumnos", "Inglés diario", "Música y motricidad"],
      },
      {
        id: "lvl-pri",
        name: "Primaria",
        ages: "6 a 11 años",
        description:
          "Bases académicas sólidas con lectura, escritura y matemáticas en el centro, complementadas con ciencias, arte, deporte y formación cristiana.",
        image: IMAGES.classroom,
        highlights: ["Proyectos interdisciplinarios", "Tutoría por grupo", "Talleres de lectura"],
      },
      {
        id: "lvl-sec",
        name: "Secundaria",
        ages: "12 a 14 años",
        description:
          "Rigor académico y acompañamiento adolescente: laboratorios, orientación vocacional y preparación para el bachillerato de su elección.",
        image: IMAGES.lab,
        highlights: ["Laboratorios equipados", "Orientación vocacional", "Certificación de inglés"],
      },
    ],
    facilities: [
      { name: "Biblioteca y mediateca", description: "Más de 9,000 volúmenes, sala de lectura y espacios de estudio silencioso." },
      { name: "Laboratorios de ciencias", description: "Biología, química y física con equipo para prácticas por nivel." },
      { name: "Capilla y pastoral", description: "Un espacio para la reflexión, la oración y el acompañamiento espiritual." },
      { name: "Canchas y área deportiva", description: "Cancha de usos múltiples, básquetbol y espacio de atletismo." },
      { name: "Arte, música y tecnología", description: "Talleres de plástica, coro, banda y sala de cómputo con internet seguro." },
      { name: "Comedor y enfermería", description: "Alimentación supervisada por nutrióloga y atención médica escolar." },
    ],
    gallery: [
      { src: IMAGES.campus, alt: "Fachada del campus principal", caption: "Campus principal" },
      { src: IMAGES.classroom, alt: "Salón de primaria con luz natural", caption: "Aulas de primaria" },
      { src: IMAGES.lab, alt: "Estudiantes en el laboratorio de ciencias", caption: "Laboratorio de ciencias" },
      { src: IMAGES.library, alt: "Biblioteca escolar", caption: "Biblioteca" },
      { src: IMAGES.preschool, alt: "Ambiente de preescolar", caption: "Preescolar" },
    ],
    admissions: {
      eyebrow: "Admisiones",
      title: "Un proceso claro, cercano y sin sorpresas",
      lead:
        "Recibimos solicitudes durante todo el ciclo. El cupo por grupo es limitado a 25 alumnos, por lo que te recomendamos iniciar con tiempo.",
      steps: [
        { title: "Solicita informes", description: "Déjanos tus datos y te contactamos en menos de 24 horas hábiles." },
        { title: "Visita el colegio", description: "Recorrido guiado por el campus y entrevista con dirección académica." },
        { title: "Evaluación y entrevista", description: "Diagnóstico académico y entrevista familiar sin costo." },
        { title: "Inscripción", description: "Entrega de documentos, firma de contrato y bienvenida al ciclo." },
      ],
      requirements: [
        "Acta de nacimiento original y copia",
        "CURP del alumno",
        "Boletas de los dos últimos grados",
        "Carta de buena conducta de la escuela de procedencia",
        "Identificación oficial del tutor y comprobante de domicilio",
      ],
      note: "Cupo limitado a 25 alumnos por grupo.",
    },
    contact: {
      heading: "Visítanos",
      note: "Con gusto te recibimos con cita previa para recorrer el campus y resolver tus dudas.",
      whatsappMessage: "Hola, me gustaría recibir informes sobre el Colegio Monteverde.",
    },
    privacy: {
      title: "Aviso de privacidad",
      updatedAt: "2026-08-01",
      body: [
        "El Colegio Monteverde, con domicilio en Av. del Roble 1450, Col. Jardines de San Manuel, Puebla, Pue., es responsable del tratamiento de los datos personales que usted proporcione a través de este sitio.",
        "Los datos solicitados (nombre del adulto responsable, teléfono, correo electrónico, nivel de interés y mensaje) se utilizan exclusivamente para atender su solicitud de informes, dar seguimiento al proceso de admisión y enviar información relacionada con el colegio.",
        "No transferimos sus datos a terceros sin su consentimiento, salvo las excepciones previstas en la Ley Federal de Protección de Datos Personales en Posesión de los Particulares. Puede ejercer sus derechos de acceso, rectificación, cancelación u oposición escribiendo a privacidad@colegiomonteverde.edu.mx.",
        "Este aviso puede actualizarse; cualquier cambio se publicará en esta misma sección.",
      ],
    },
  };
}

export function createSeedData() {
  const rand = rng(20261118);
  let seq = 0;
  const uid = (prefix) => `${prefix}-${String(++seq).padStart(4, "0")}`;

  const cycles = [
    { id: "cyc-2025", name: "2025-2026", startDate: "2025-08-18", endDate: "2026-07-10", status: "cerrado" },
    { id: ACTIVE_CYCLE, name: "2026-2027", startDate: "2026-08-24", endDate: "2027-07-09", status: "activo" },
    { id: "cyc-2027", name: "2027-2028", startDate: "2027-08-23", endDate: "2028-07-07", status: "planeado" },
  ];

  const levels = [
    { id: "lvl-pre", name: "Preescolar", gradingType: "cualitativa", order: 1 },
    { id: "lvl-pri", name: "Primaria", gradingType: "numerica", order: 2 },
    { id: "lvl-sec", name: "Secundaria", gradingType: "numerica", order: 3 },
  ];

  const gradePlan = [
    { levelId: "lvl-pre", suffix: "pre", names: ["1° de preescolar", "2° de preescolar", "3° de preescolar"] },
    {
      levelId: "lvl-pri",
      suffix: "pri",
      names: ["1° de primaria", "2° de primaria", "3° de primaria", "4° de primaria", "5° de primaria", "6° de primaria"],
    },
    { levelId: "lvl-sec", suffix: "sec", names: ["1° de secundaria", "2° de secundaria", "3° de secundaria"] },
  ];

  const grades = [];
  gradePlan.forEach((plan) => {
    plan.names.forEach((name, index) => {
      grades.push({
        id: `g-${plan.suffix}-${index + 1}`,
        levelId: plan.levelId,
        name,
        shortName: `${index + 1}°`,
        order: index + 1,
      });
    });
  });

  const groups = [];
  grades.forEach((grade) => {
    ["A", "B"].forEach((letter) => {
      groups.push({
        id: `grp-${grade.id}-${letter}`,
        cycleId: ACTIVE_CYCLE,
        gradeId: grade.id,
        levelId: grade.levelId,
        name: letter,
        displayName: `${grade.shortName} ${letter}`,
        capacity: 25,
        classroom: `Salón ${grade.order}${letter}`,
      });
    });
  });

  const subjectPlan = [
    {
      levelId: "lvl-pre",
      suffix: "pre",
      items: [
        ["leng", "Lenguaje y comunicación", "tch-7"],
        ["pens", "Pensamiento matemático", "tch-7"],
        ["expl", "Exploración del mundo natural y social", "tch-3"],
        ["socio", "Educación socioemocional", "tch-9"],
        ["arte", "Expresión artística", "tch-8"],
        ["fe", "Formación cristiana", "tch-9"],
        ["ef", "Educación física", "tch-6"],
      ],
    },
    {
      levelId: "lvl-pri",
      suffix: "pri",
      items: [
        ["esp", "Español", "tch-2"],
        ["mate", "Matemáticas", "tch-1"],
        ["cien", "Ciencias naturales", "tch-3"],
        ["hist", "Historia", "tch-4"],
        ["geo", "Geografía", "tch-4"],
        ["ing", "Inglés", "tch-5"],
        ["civ", "Formación cívica y ética", "tch-4"],
        ["fe", "Formación cristiana", "tch-9"],
        ["arte", "Educación artística", "tch-8"],
        ["ef", "Educación física", "tch-6"],
      ],
    },
    {
      levelId: "lvl-sec",
      suffix: "sec",
      items: [
        ["esp", "Español", "tch-2"],
        ["mate", "Matemáticas", "tch-1"],
        ["cien", "Ciencias y tecnología", "tch-3"],
        ["hist", "Historia", "tch-4"],
        ["geo", "Geografía", "tch-4"],
        ["ing", "Inglés", "tch-5"],
        ["civ", "Formación cívica y ética", "tch-4"],
        ["fe", "Formación cristiana", "tch-9"],
        ["tec", "Tecnología", "tch-3"],
        ["ef", "Educación física", "tch-6"],
      ],
    },
  ];

  const subjects = [];
  subjectPlan.forEach((plan) => {
    plan.items.forEach(([key, name, teacherId], index) => {
      subjects.push({
        id: `sub-${plan.suffix}-${key}`,
        levelId: plan.levelId,
        key,
        name,
        teacherId,
        weeklyHours: index < 4 ? 5 : 2,
      });
    });
  });

  const teachers = [
    { id: "tch-1", name: "Daniela Ríos", email: "daniela.rios@colegiomonteverde.edu.mx", specialty: "Matemáticas" },
    { id: "tch-2", name: "Jorge Alberto Medina", email: "jorge.medina@colegiomonteverde.edu.mx", specialty: "Español" },
    { id: "tch-3", name: "Claudia Pineda", email: "claudia.pineda@colegiomonteverde.edu.mx", specialty: "Ciencias" },
    { id: "tch-4", name: "Raúl Escobar", email: "raul.escobar@colegiomonteverde.edu.mx", specialty: "Ciencias sociales" },
    { id: "tch-5", name: "Mariana Lozano", email: "mariana.lozano@colegiomonteverde.edu.mx", specialty: "Inglés" },
    { id: "tch-6", name: "Pablo Serrano", email: "pablo.serrano@colegiomonteverde.edu.mx", specialty: "Educación física" },
    { id: "tch-7", name: "Ruth Álvarez", email: "ruth.alvarez@colegiomonteverde.edu.mx", specialty: "Educación preescolar" },
    { id: "tch-8", name: "Isaac Domínguez", email: "isaac.dominguez@colegiomonteverde.edu.mx", specialty: "Arte y música" },
    { id: "tch-9", name: "Elizabeth Campos", email: "elizabeth.campos@colegiomonteverde.edu.mx", specialty: "Formación cristiana" },
  ];

  const periods = [
    { id: "per-1", cycleId: ACTIVE_CYCLE, name: "Primer trimestre", order: 1, startDate: "2026-08-24", endDate: "2026-11-06", status: "publicado", publishedAt: "2026-11-10T18:00:00" },
    { id: "per-2", cycleId: ACTIVE_CYCLE, name: "Segundo trimestre", order: 2, startDate: "2026-11-09", endDate: "2027-02-19", status: "en_captura", publishedAt: null },
    { id: "per-3", cycleId: ACTIVE_CYCLE, name: "Tercer trimestre", order: 3, startDate: "2027-02-22", endDate: "2027-07-02", status: "pendiente", publishedAt: null },
  ];

  const concepts = [
    { id: "con-ins", name: "Inscripción", amount: 6500, kind: "unico" },
    { id: "con-col", name: "Colegiatura mensual", amount: 4200, kind: "mensual" },
    { id: "con-mat", name: "Material didáctico", amount: 1800, kind: "unico" },
    { id: "con-uni", name: "Uniforme y deportivo", amount: 2400, kind: "unico" },
    { id: "con-tal", name: "Taller extracurricular", amount: 950, kind: "mensual" },
    { id: "con-tra", name: "Transporte escolar", amount: 1600, kind: "mensual" },
  ];

  const users = [
    { id: "usr-admin", name: "Alejandra Sosa", email: "admin@colegiomonteverde.edu.mx", role: "admin", title: "Administradora general", status: "activo" },
    { id: "usr-dir", name: "Rodrigo Márquez", email: "direccion@colegiomonteverde.edu.mx", role: "direccion", title: "Director académico", status: "activo" },
    { id: "usr-ce", name: "Karla Fuentes", email: "control@colegiomonteverde.edu.mx", role: "control_escolar", title: "Control escolar", status: "activo" },
    { id: "usr-doc", name: "Daniela Ríos", email: "docente@colegiomonteverde.edu.mx", role: "docente", title: "Docente de matemáticas", status: "activo", teacherId: "tch-1" },
    { id: "usr-caja", name: "Miguel Ángel Torres", email: "caja@colegiomonteverde.edu.mx", role: "caja", title: "Cajero", status: "activo" },
    { id: "usr-tutor", name: "Verónica Salgado", email: "tutor@colegiomonteverde.edu.mx", role: "tutor", title: "Madre de familia", status: "activo", tutorId: "tut-1" },
    { id: "usr-baja", name: "Héctor Villalobos", email: "hector.villalobos@colegiomonteverde.edu.mx", role: "caja", title: "Cajero (baja)", status: "inactivo" },
  ];

  const tutors = [
    { id: "tut-1", name: "Verónica Salgado Ruiz", email: "tutor@colegiomonteverde.edu.mx", phone: "222 145 8890", relationship: "Madre", address: "Priv. Los Cedros 42, Puebla, Pue." },
  ];

  const students = [];
  const documents = [];
  const enrollments = [];
  const charges = [];
  const payments = [];
  const attendance = [];
  const gradeEntries = [];
  const levelAmount = { "lvl-pre": 3600, "lvl-pri": 4200, "lvl-sec": 4800 };

  let matricula = 0;
  let folio = 0;

  function addTutor(student) {
    if (student.tutorIds?.length) return;
    const tutorId = uid("tut");
    const lastName = student.lastName.split(" ")[0];
    tutors.push({
      id: tutorId,
      name: `${rand() > 0.5 ? "María" : "Jorge"} ${LAST[Math.floor(rand() * LAST.length)]} ${lastName}`,
      email: `familia${tutorId.replace("tut-", "")}@correo.mx`,
      phone: `222 ${100 + Math.floor(rand() * 899)} ${1000 + Math.floor(rand() * 8999)}`,
      relationship: rand() > 0.5 ? "Madre" : "Padre",
      address: `${STREETS[Math.floor(rand() * STREETS.length)]} ${100 + Math.floor(rand() * 900)}, Puebla, Pue.`,
    });
    student.tutorIds = [tutorId];
  }

  function addCharges(student, withHistory = true) {
    const amount = levelAmount[student.levelId];
    const push = (conceptId, conceptName, value, dueDate, status, paidAmount = 0) => {
      charges.push({
        id: uid("chg"),
        studentId: student.id,
        conceptId,
        conceptName,
        cycleId: ACTIVE_CYCLE,
        amount: value,
        discountPercent: 0,
        paidAmount,
        dueDate,
        status,
        createdAt: "2026-08-20T10:00:00",
      });
    };
    if (!withHistory) {
      push("con-col", "Colegiatura mensual", amount, "2026-11-10", "pendiente");
      return;
    }
    push("con-ins", "Inscripción", 6500, "2026-08-10", "pagado", 6500);
    push("con-mat", "Material didáctico", 1800, "2026-09-05", "pagado", 1800);
    ["2026-08-10", "2026-09-10", "2026-10-10"].forEach((due) =>
      push("con-col", "Colegiatura mensual", amount, due, "pagado", amount),
    );
    const november = charges[charges.length];
    const novemberPaid = rand() > 0.55;
    push(
      "con-col",
      "Colegiatura mensual",
      amount,
      "2026-11-10",
      novemberPaid ? "pagado" : "vencido",
      novemberPaid ? amount : 0,
    );
    if (november) november.dueDate = "2026-11-10";
  }

  groups.forEach((group) => {
    const grade = grades.find((g) => g.id === group.gradeId);
    const level = levels.find((l) => l.id === group.levelId);
    const count = group.id === "grp-g-sec-2-B" ? 25 : 4;
    for (let i = 0; i < count; i += 1) {
      const isFemale = rand() > 0.5;
      const firstName = (isFemale ? FEMALE : MALE)[Math.floor(rand() * 25)];
      let lastName = `${LAST[Math.floor(rand() * LAST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`;
      let nameAttempts = 0;
      while (PROSPECT_NAMES.includes(`${firstName} ${lastName}`) && nameAttempts < 6) {
        lastName = `${LAST[Math.floor(rand() * LAST.length)]} ${LAST[Math.floor(rand() * LAST.length)]}`;
        nameAttempts += 1;
      }
      matricula += 1;
      const student = {
        id: `stu-${String(matricula).padStart(3, "0")}`,
        matricula: `MV-2026-${String(matricula).padStart(4, "0")}`,
        firstName,
        lastName,
        levelId: level.id,
        gradeId: grade.id,
        groupId: group.id,
        cycleId: ACTIVE_CYCLE,
        status: matricula === 47 ? "baja" : "activo",
        gender: isFemale ? "F" : "M",
        birthDate: `${2026 - (level.id === "lvl-pre" ? 3 + grade.order : level.id === "lvl-pri" ? 5 + grade.order : 11 + grade.order)}-${String(1 + Math.floor(rand() * 12)).padStart(2, "0")}-${String(1 + Math.floor(rand() * 27)).padStart(2, "0")}`,
        curp: `XXXX${String(800000 + Math.floor(rand() * 199999))}HPLXXX0${Math.floor(rand() * 9)}`,
        enrollmentDate: "2026-08-24",
        address: `${STREETS[Math.floor(rand() * STREETS.length)]} ${100 + Math.floor(rand() * 900)}, Puebla, Pue.`,
        tutorIds: [],
        bloodType: ["O+", "A+", "B+", "O-"][Math.floor(rand() * 4)],
        allergies: rand() > 0.85 ? "Polen" : "Ninguna",
        notes: "",
      };
      students.push(student);
      enrollments.push({
        id: uid("enr"),
        studentId: student.id,
        cycleId: ACTIVE_CYCLE,
        gradeId: grade.id,
        groupId: group.id,
        status: "inscrito",
        date: "2026-08-24",
      });
      addTutor(student);
      addCharges(student, student.status === "activo");

      // Documentos del expediente
      ["Acta de nacimiento.pdf", "CURP.pdf", "Boleta del ciclo anterior.pdf"].forEach((name, index) => {
        documents.push({
          id: uid("doc"),
          studentId: student.id,
          name,
          type: ["acta", "curp", "boleta"][index],
          uploadedAt: "2026-08-26",
          size: `${(0.3 + rand()).toFixed(1)} MB`,
        });
      });
      if (rand() > 0.6) {
        documents.push({
          id: uid("doc"),
          studentId: student.id,
          name: "Comprobante de domicilio.pdf",
          type: "domicilio",
          uploadedAt: "2026-09-02",
          size: "0.6 MB",
        });
      }

      // Pagos de los cargos ya cubiertos
      charges
        .filter((c) => c.studentId === student.id && c.paidAmount > 0)
        .forEach((charge) => {
          folio += 1;
          payments.push({
            id: uid("pay"),
            folio: `REC-2026-${String(folio).padStart(4, "0")}`,
            studentId: student.id,
            amount: charge.paidAmount,
            method: ["efectivo", "transferencia", "tarjeta"][Math.floor(rand() * 3)],
            date: charge.dueDate,
            reference: charge.conceptName,
            cashierId: "usr-caja",
            cashierName: "Miguel Ángel Torres",
            status: "vigente",
            allocations: [{ chargeId: charge.id, conceptName: charge.conceptName, amount: charge.paidAmount }],
            createdAt: `${charge.dueDate}T11:00:00`,
          });
        });

      // Asistencia de los últimos días hábiles
      ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13", "2026-11-16", "2026-11-17", "2026-11-18"].forEach((date) => {
        const r = rand();
        const status = r > 0.94 ? "falta" : r > 0.9 ? "retardo" : r > 0.87 ? "justificado" : "presente";
        attendance.push({
          id: uid("att"),
          studentId: student.id,
          groupId: group.id,
          date,
          subjectId: null,
          status,
          note: status === "justificado" ? "Justificante entregado por la familia" : "",
          recordedBy: "Daniela Ríos",
          recordedAt: `${date}T08:15:00`,
        });
      });

      // Calificaciones del primer trimestre (publicadas)
      subjects
        .filter((s) => s.levelId === level.id)
        .forEach((subject) => {
          const numeric = level.gradingType === "numerica";
          gradeEntries.push({
            id: uid("grd"),
            studentId: student.id,
            groupId: group.id,
            subjectId: subject.id,
            periodId: "per-1",
            cycleId: ACTIVE_CYCLE,
            value: numeric ? Number((6.8 + rand() * 3.1).toFixed(1)) : null,
            qualitative: numeric ? null : ["A", "S", "B", "R"][Math.floor(rand() * 4)],
            status: "publicado",
            updatedBy: "Daniela Ríos",
            updatedAt: "2026-11-09T17:30:00",
          });
        });
    }
  });

  // Alumnos vinculados al tutor de demostración
  const sofia = students.find((s) => s.id === "stu-001");
  const mateo = students.find((s) => s.id === "stu-002");
  if (sofia) {
    sofia.firstName = "Sofía";
    sofia.lastName = "Salgado Ruiz";
    sofia.tutorIds = ["tut-1"];
    sofia.levelId = "lvl-pri";
    sofia.gradeId = "g-pri-4";
    sofia.groupId = "grp-g-pri-4-A";
    sofia.status = "activo";
  }
  if (mateo) {
    mateo.firstName = "Mateo";
    mateo.lastName = "Salgado Ruiz";
    mateo.tutorIds = ["tut-1"];
    mateo.levelId = "lvl-sec";
    mateo.gradeId = "g-sec-1";
    mateo.groupId = "grp-g-sec-1-B";
    mateo.status = "activo";
  }
  tutors[0].studentIds = [sofia?.id, mateo?.id].filter(Boolean);

  // Ajuste académico de los alumnos del tutor de demostración al nivel/grupo asignado
  [sofia, mateo].forEach((student) => {
    if (!student) return;
    const level = levels.find((l) => l.id === student.levelId);
    const enrollment = enrollments.find((e) => e.studentId === student.id);
    if (enrollment) {
      enrollment.groupId = student.groupId;
      enrollment.gradeId = student.gradeId;
    }
    attendance.filter((a) => a.studentId === student.id).forEach((a) => {
      a.groupId = student.groupId;
    });
    for (let i = gradeEntries.length - 1; i >= 0; i -= 1) {
      if (gradeEntries[i].studentId === student.id) gradeEntries.splice(i, 1);
    }
    subjects
      .filter((s) => s.levelId === level.id)
      .forEach((subject) => {
        const numeric = level.gradingType === "numerica";
        gradeEntries.push({
          id: uid("grd"),
          studentId: student.id,
          groupId: student.groupId,
          subjectId: subject.id,
          periodId: "per-1",
          cycleId: ACTIVE_CYCLE,
          value: numeric ? Number((7.6 + rand() * 2.2).toFixed(1)) : null,
          qualitative: numeric ? null : ["A", "S", "B"][Math.floor(rand() * 3)],
          status: "publicado",
          updatedBy: "Daniela Ríos",
          updatedAt: "2026-11-09T17:30:00",
        });
      });
  });

  // Asignaciones docentes
  const assignments = [];
  groups.forEach((group) => {
    const level = levels.find((l) => l.id === group.levelId);
    subjects
      .filter((s) => s.levelId === level.id)
      .forEach((subject, index) => {
        const teacherId =
          group.id === "grp-g-sec-1-B" && subject.key === "mate"
            ? "tch-1"
            : group.id === "grp-g-pri-6-A" && subject.key === "mate"
              ? "tch-1"
              : subject.teacherId;
        assignments.push({
          id: uid("asg"),
          cycleId: ACTIVE_CYCLE,
          groupId: group.id,
          subjectId: subject.id,
          teacherId,
          schedule: [
            { day: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][index % 5], start: "08:00", end: "08:50" },
            { day: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"][(index + 2) % 5], start: "10:10", end: "11:00" },
          ],
        });
      });
  });

  const admissions = [
    {
      id: "adm-0001",
      fullName: "Andrea Solís Márquez",
      levelId: "lvl-pri",
      gradeId: "g-pri-3",
      stage: "nuevo",
      ownerId: "usr-ce",
      phone: "222 315 7742",
      email: "familia.solis@correo.mx",
      message: "Nos interesa ingresar en enero; vivimos a cinco minutos del colegio.",
      source: "sitio_web",
      createdAt: "2026-11-17T09:24:00",
      nextAction: "Llamar para agendar visita",
      nextActionDate: "2026-11-19",
      followUps: [],
    },
    {
      id: "adm-0002",
      fullName: "Emiliano Rojas Peña",
      levelId: "lvl-sec",
      gradeId: "g-sec-1",
      stage: "contactado",
      ownerId: "usr-ce",
      phone: "222 118 9034",
      email: "rojas.pena@correo.mx",
      message: "Buscamos un colegio con buen nivel de matemáticas.",
      source: "sitio_web",
      createdAt: "2026-11-14T16:10:00",
      nextAction: "Enviar liga de agendado de visita",
      nextActionDate: "2026-11-20",
      followUps: [
        { id: "fol-1", at: "2026-11-15T10:05:00", byName: "Karla Fuentes", note: "Se realizó llamada de primer contacto. La familia solicita informes de costos.", stage: "contactado" },
      ],
    },
    {
      id: "adm-0003",
      fullName: "Regina Fuentes Ibarra",
      levelId: "lvl-pre",
      gradeId: "g-pre-1",
      stage: "visita",
      ownerId: "usr-ce",
      phone: "222 776 1188",
      email: "regina.fuentes@correo.mx",
      message: "Primera experiencia escolar de nuestra hija.",
      source: "recomendacion",
      createdAt: "2026-11-10T11:40:00",
      nextAction: "Confirmar asistencia a la visita del 21 de noviembre",
      nextActionDate: "2026-11-21",
      followUps: [
        { id: "fol-2", at: "2026-11-11T09:00:00", byName: "Karla Fuentes", note: "Visita guiada agendada para el viernes 21 a las 9:00 h.", stage: "visita" },
      ],
    },
    {
      id: "adm-0004",
      fullName: "Luis Fernando Bautista Cruz",
      levelId: "lvl-pri",
      gradeId: "g-pri-1",
      stage: "evaluacion",
      ownerId: "usr-dir",
      phone: "222 440 2211",
      email: "bautista.cruz@correo.mx",
      message: "Cambio de escuela por mudanza a Puebla.",
      source: "sitio_web",
      createdAt: "2026-11-03T13:15:00",
      nextAction: "Entregar resultado del diagnóstico",
      nextActionDate: "2026-11-19",
      followUps: [
        { id: "fol-3", at: "2026-11-06T12:00:00", byName: "Rodrigo Márquez", note: "Evaluación diagnóstica aplicada. Resultado sobresaliente en lectoescritura.", stage: "evaluacion" },
      ],
    },
    {
      id: "adm-0005",
      fullName: "Ximena Palacios Núñez",
      levelId: "lvl-sec",
      gradeId: "g-sec-2",
      stage: "aceptado",
      ownerId: "usr-ce",
      phone: "222 990 4433",
      email: "palacios.nunez@correo.mx",
      message: "Hermana de alumno egresado.",
      source: "recomendacion",
      createdAt: "2026-10-28T10:20:00",
      nextAction: "Cobrar inscripción y confirmar lugar",
      nextActionDate: "2026-11-22",
      followUps: [
        { id: "fol-4", at: "2026-11-02T09:30:00", byName: "Karla Fuentes", note: "Carta de aceptación enviada. La familia confirma interés.", stage: "aceptado" },
      ],
    },
    {
      id: "adm-0006",
      fullName: "Diego Ortega Mendoza",
      levelId: "lvl-pri",
      gradeId: "g-pri-5",
      stage: "inscrito",
      ownerId: "usr-ce",
      phone: "222 556 7788",
      email: "ortega.mendoza@correo.mx",
      message: "",
      source: "sitio_web",
      createdAt: "2026-10-02T08:45:00",
      nextAction: "Entregar uniformes",
      nextActionDate: "2026-08-20",
      followUps: [
        { id: "fol-5", at: "2026-10-10T10:00:00", byName: "Karla Fuentes", note: "Inscripción concluida. Expediente completo.", stage: "inscrito" },
      ],
    },
    {
      id: "adm-0007",
      fullName: "Camila Trejo Rivera",
      levelId: "lvl-pre",
      gradeId: "g-pre-2",
      stage: "descartado",
      ownerId: "usr-ce",
      phone: "222 301 9922",
      email: "trejo.rivera@correo.mx",
      message: "Consulta por costos.",
      source: "sitio_web",
      createdAt: "2026-09-22T15:05:00",
      nextAction: "Recontactar en el siguiente ciclo",
      nextActionDate: "2027-02-01",
      followUps: [
        { id: "fol-6", at: "2026-09-25T11:20:00", byName: "Karla Fuentes", note: "La familia elige una opción con menor colegiatura.", stage: "descartado" },
      ],
    },
    {
      id: "adm-0008",
      fullName: "Santiago Aguilar Cortés",
      levelId: "lvl-sec",
      gradeId: "g-sec-2",
      stage: "nuevo",
      ownerId: "usr-ce",
      phone: "222 883 5511",
      email: "aguilar.cortes@correo.mx",
      message: "Quisiera conocer el programa de inglés.",
      source: "sitio_web",
      createdAt: "2026-11-18T08:05:00",
      nextAction: "Enviar información por correo",
      nextActionDate: "2026-11-18",
      followUps: [],
    },
  ];

  const announcements = [
    {
      id: "ann-1",
      title: "Festival de Adviento 2026",
      body:
        "El viernes 4 de diciembre a las 17:00 h celebramos nuestro Festival de Adviento en el patio central. Cada grupo presentará un número musical. Los esperamos en familia.",
      audienceLevelId: null,
      audienceGroupId: null,
      publishAt: "2026-11-16T08:00:00",
      status: "publicado",
      authorName: "Rodrigo Márquez",
      createdAt: "2026-11-15T18:20:00",
    },
    {
      id: "ann-2",
      title: "Entrega de boletas del primer trimestre",
      body:
        "Las boletas del primer trimestre ya están disponibles en el portal familiar. La reunión de entrega con tutores será el jueves 26 de noviembre a las 8:00 h.",
      audienceLevelId: "lvl-pri",
      audienceGroupId: null,
      publishAt: "2026-11-12T08:00:00",
      status: "publicado",
      authorName: "Rodrigo Márquez",
      createdAt: "2026-11-11T16:00:00",
    },
    {
      id: "ann-3",
      title: "Salida pedagógica a la Biblioteca Palafoxiana",
      body:
        "Los grupos de 6° de primaria visitarán la Biblioteca Palafoxiana el martes 24 de noviembre. La salida es a las 8:30 h y el regreso a las 13:30 h. Se requiere autorización firmada.",
      audienceLevelId: "lvl-pri",
      audienceGroupId: "grp-g-pri-6-A",
      publishAt: "2026-11-18T07:30:00",
      status: "publicado",
      authorName: "Daniela Ríos",
      createdAt: "2026-11-17T19:10:00",
    },
    {
      id: "ann-4",
      title: "Campaña de acopio navideña",
      body:
        "Del 1 al 12 de diciembre recibimos alimentos no perecederos para la parroquia de San Manuel. La colecta la organiza el consejo estudiantil.",
      audienceLevelId: null,
      audienceGroupId: null,
      publishAt: "2026-12-01T08:00:00",
      status: "programado",
      authorName: "Elizabeth Campos",
      createdAt: "2026-11-17T12:00:00",
    },
  ];

  const events = [
    { id: "evt-1", title: "Reunión de tutores · Primaria", date: "2026-11-26", startTime: "08:00", endTime: "09:30", levelId: "lvl-pri", type: "reunion", description: "Entrega de boletas del primer trimestre." },
    { id: "evt-2", title: "Visita guiada para familias nuevas", date: "2026-11-21", startTime: "09:00", endTime: "10:30", levelId: null, type: "admision", description: "Recorrido por el campus con dirección académica." },
    { id: "evt-3", title: "Festival de Adviento", date: "2026-12-04", startTime: "17:00", endTime: "19:30", levelId: null, type: "festival", description: "Presentaciones musicales de todos los grupos." },
    { id: "evt-4", title: "Salida a la Biblioteca Palafoxiana", date: "2026-11-24", startTime: "08:30", endTime: "13:30", levelId: "lvl-pri", type: "salida", description: "Solo 6° A y 6° B." },
    { id: "evt-5", title: "Junta de consejo técnico", date: "2026-11-27", startTime: "14:00", endTime: "16:00", levelId: null, type: "interno", description: "Suspensión de clases para alumnos." },
    { id: "evt-6", title: "Posada de secundaria", date: "2026-12-16", startTime: "16:00", endTime: "20:00", levelId: "lvl-sec", type: "festival", description: "Posada y convivio por grupos." },
    { id: "evt-7", title: "Entrega de boletas · Secundaria", date: "2026-11-27", startTime: "08:00", endTime: "09:00", levelId: "lvl-sec", type: "reunion", description: "Reunión con tutores de secundaria." },
    { id: "evt-8", title: "Misa de Navidad", date: "2026-12-18", startTime: "10:00", endTime: "11:30", levelId: null, type: "pastoral", description: "Celebración en la capilla del colegio." },
  ];

  const incidents = [
    {
      id: "inc-1",
      studentId: "stu-001",
      date: "2026-11-12",
      type: "conducta",
      description: "Interrupción constante durante la clase de matemáticas; se habló con la alumna.",
      visibility: "tutores",
      status: "seguimiento",
      reportedBy: "Daniela Ríos",
      followUps: [
        { id: "ifu-1", at: "2026-11-13T09:00:00", byName: "Daniela Ríos", note: "Se acordó un plan de atención con la familia." },
      ],
    },
    {
      id: "inc-2",
      studentId: "stu-002",
      date: "2026-11-10",
      type: "salud",
      description: "Dolor de cabeza y náuseas; se atendió en enfermería y se avisó a la familia.",
      visibility: "tutores",
      status: "cerrado",
      reportedBy: "Pablo Serrano",
      followUps: [],
    },
    {
      id: "inc-3",
      studentId: "stu-005",
      date: "2026-11-14",
      type: "academica",
      description: "Trabajo pendiente de ciencias naturales.",
      visibility: "interno",
      status: "abierto",
      reportedBy: "Claudia Pineda",
      followUps: [],
    },
    {
      id: "inc-4",
      studentId: "stu-008",
      date: "2026-11-17",
      type: "asistencia",
      description: "Tercer retardo en la semana.",
      visibility: "tutores",
      status: "abierto",
      reportedBy: "Jorge Alberto Medina",
      followUps: [],
    },
  ];

  const audit = [
    { id: "aud-1", at: "2026-11-18T08:05:00", userId: "usr-ce", userName: "Karla Fuentes", action: "crear", entity: "Prospecto", entityId: "adm-0008", detail: "Registro de solicitud desde el sitio web" },
    { id: "aud-2", at: "2026-11-17T17:42:00", userId: "usr-doc", userName: "Daniela Ríos", action: "guardar", entity: "Calificaciones", entityId: "per-2", detail: "Borrador de segundo trimestre · 3° A secundaria" },
    { id: "aud-3", at: "2026-11-17T13:20:00", userId: "usr-caja", userName: "Miguel Ángel Torres", action: "registrar", entity: "Pago", entityId: "pay-0120", detail: "Pago parcial de colegiatura de noviembre" },
    { id: "aud-4", at: "2026-11-17T11:02:00", userId: "usr-admin", userName: "Alejandra Sosa", action: "actualizar", entity: "Usuario", entityId: "usr-baja", detail: "Baja de usuario de caja" },
    { id: "aud-5", at: "2026-11-16T09:15:00", userId: "usr-dir", userName: "Rodrigo Márquez", action: "publicar", entity: "Aviso", entityId: "ann-2", detail: "Aviso de entrega de boletas" },
    { id: "aud-6", at: "2026-11-15T18:30:00", userId: "usr-ce", userName: "Karla Fuentes", action: "actualizar", entity: "Prospecto", entityId: "adm-0002", detail: "Etapa cambiada a Contactado" },
    { id: "aud-7", at: "2026-11-14T10:10:00", userId: "usr-doc", userName: "Daniela Ríos", action: "guardar", entity: "Asistencia", entityId: "grp-g-sec-1-B", detail: "Pase de lista del 14 de noviembre" },
    { id: "aud-8", at: "2026-11-13T16:45:00", userId: "usr-caja", userName: "Miguel Ángel Torres", action: "cancelar", entity: "Pago", entityId: "pay-0098", detail: "Cancelación por error de captura" },
  ];

  const corrections = [
    {
      id: "cor-1",
      studentId: "stu-001",
      periodId: "per-1",
      subjectId: "sub-pri-cien",
      reason: "La calificación publicada no corresponde al examen final.",
      status: "solicitada",
      requestedBy: "Verónica Salgado",
      requestedAt: "2026-11-16T19:20:00",
      resolvedBy: null,
      resolvedAt: null,
      note: "",
    },
  ];

  // Resumen de inscritos por grupo
  groups.forEach((group) => {
    group.enrolled = students.filter((s) => s.groupId === group.id && s.status === "activo").length;
  });

  return {
    content: createSiteContent(),
    cycles,
    levels,
    grades,
    groups,
    subjects,
    teachers,
    periods,
    concepts,
    users,
    tutors,
    students,
    enrollments,
    documents,
    admissions,
    attendance,
    incidents,
    gradeEntries,
    charges,
    payments,
    announcements,
    events,
    audit,
    corrections,
    assignments,
    meta: { today: TODAY, activeCycleId: ACTIVE_CYCLE, demoPassword: "demo1234" },
  };
}