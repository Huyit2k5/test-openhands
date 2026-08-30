/**
 * Development seed for the Tech Training Center schema.
 *
 * Idempotent: wipes all data (leaf tables first, respecting FK order) then
 * rebuilds a small, realistic dataset. Dates are deterministic (fixed base)
 * so repeated runs produce the same data.
 *
 * Run with:  npm run db:seed   (or:  npx prisma db seed)
 */
import {
  PrismaClient,
  Role,
  EnrollmentStatus,
  AttendanceStatus,
  SubmissionStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

// --- Deterministic date helpers (fixed base for stable re-runs) -------------
const BASE = new Date("2026-01-05T00:00:00Z");
const addDays = (n: number) => new Date(BASE.getTime() + n * 86_400_000);
const at = (day: number, hour: number, minute = 0) =>
  new Date(BASE.getTime() + day * 86_400_000 + hour * 3_600_000 + minute * 60_000);

async function main() {
  // --------------------------------------------------------------------------
  // Reset — leaf tables first so FK constraints are never violated
  // --------------------------------------------------------------------------
  await prisma.submission.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.session.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // --------------------------------------------------------------------------
  // Users + Profiles
  // --------------------------------------------------------------------------
  const mkUser = (data: {
    email: string;
    role: Role;
    fullName: string;
    phone?: string;
    bio?: string;
  }) =>
    prisma.user.create({
      data: {
        email: data.email,
        passwordHash: "$2b$10$seed_hash_placeholder",
        role: data.role,
        profile: {
          create: { fullName: data.fullName, phone: data.phone, bio: data.bio },
        },
      },
    });

  const admin = await mkUser({
    email: "admin@tts.edu",
    role: Role.ADMIN,
    fullName: "Nguyen Van Quan",
    phone: "+84 900 000 001",
    bio: "System administrator of the training center.",
  });

  const lan = await mkUser({
    email: "lan.hoang@tts.edu",
    role: Role.INSTRUCTOR,
    fullName: "Hoang Thi Lan",
    phone: "+84 900 000 002",
    bio: "Backend & Python instructor.",
  });

  const minh = await mkUser({
    email: "minh.tran@tts.edu",
    role: Role.INSTRUCTOR,
    fullName: "Tran Van Minh",
    phone: "+84 900 000 003",
    bio: "Fullstack & Robotics instructor.",
  });

  const quan = await mkUser({ email: "a.quan@tts.edu", role: Role.STUDENT, fullName: "Le Minh Quan", phone: "+84 910 000 010" });
  const ha = await mkUser({ email: "b.ha@tts.edu", role: Role.STUDENT, fullName: "Pham Thi Ha", phone: "+84 910 000 011" });
  const dung = await mkUser({ email: "c.dung@tts.edu", role: Role.STUDENT, fullName: "Bui Van Dung", phone: "+84 910 000 012" });
  const thao = await mkUser({ email: "d.thao@tts.edu", role: Role.STUDENT, fullName: "Nguyen Thi Thao", phone: "+84 910 000 013" });

  // --------------------------------------------------------------------------
  // Courses (catalog)
  // --------------------------------------------------------------------------
  const python = await prisma.course.create({
    data: { name: "Python", description: "Programming fundamentals with Python 3.", createdBy: admin.id, updatedBy: admin.id },
  });
  const webDev = await prisma.course.create({
    data: { name: "Web Development", description: "Frontend + backend web engineering.", createdBy: admin.id, updatedBy: admin.id },
  });
  const robotics = await prisma.course.create({
    data: { name: "Robotics", description: "Introduction to robotics and embedded control.", createdBy: admin.id, updatedBy: admin.id },
  });

  // --------------------------------------------------------------------------
  // Classes
  // --------------------------------------------------------------------------
  const py101 = await prisma.class.create({
    data: {
      name: "Python Fundamental",
      code: "PY-101-2026",
      courseId: python.id,
      instructorId: lan.id,
      maxStudents: 30,
      startDate: at(0, 8),
      endDate: at(60, 17),
      createdBy: lan.id,
      updatedBy: lan.id,
    },
  });

  const web201 = await prisma.class.create({
    data: {
      name: "Fullstack Web Bootcamp",
      code: "WEB-201-2026",
      courseId: webDev.id,
      instructorId: minh.id,
      maxStudents: 25,
      startDate: at(0, 13),
      endDate: at(45, 17),
      createdBy: minh.id,
      updatedBy: minh.id,
    },
  });

  const rob101 = await prisma.class.create({
    data: {
      name: "Intro to Robotics",
      code: "ROB-101-2026",
      courseId: robotics.id,
      instructorId: minh.id,
      maxStudents: 20,
      startDate: at(2, 8),
      endDate: at(50, 17),
      createdBy: minh.id,
      updatedBy: minh.id,
    },
  });

  // --------------------------------------------------------------------------
  // Enrollments (Student n-n Class)
  // --------------------------------------------------------------------------
  const enroll = (classId: string, userId: string) =>
    prisma.enrollment.create({ data: { classId, userId, status: EnrollmentStatus.ACTIVE } });

  const pyEnrolls = [await enroll(py101.id, quan.id), await enroll(py101.id, ha.id), await enroll(py101.id, dung.id)];
  const webEnrolls = [await enroll(web201.id, quan.id), await enroll(web201.id, thao.id)];
  const robEnrolls = [await enroll(rob101.id, ha.id), await enroll(rob101.id, dung.id)];

  // --------------------------------------------------------------------------
  // Sessions
  // --------------------------------------------------------------------------
  const mkSession = (classId: string, owner: string, number: number, title: string, day: number, startHour: number) =>
    prisma.session.create({
      data: {
        classId,
        sessionNumber: number,
        title,
        location: `Room ${["A", "B", "C"][number % 3]}`,
        startsAt: at(day, startHour, 0),
        endsAt: at(day, startHour + 2, 0),
        createdBy: owner,
        updatedBy: owner,
      },
    });

  // status pattern cycled per student for a realistic mix of PRESENT/LATE/ABSENT
  const statusCycle = [AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.PRESENT, AttendanceStatus.ABSENT];
  const checkIn = (day: number, hour: number, minute = 0) => at(day, hour, minute);

  const mkAttendance = (sessionId: string, enrollmentId: string, status: AttendanceStatus, day: number, startHour: number) =>
    prisma.attendance.create({
      data: {
        sessionId,
        enrollmentId,
        status,
        checkInAt: status === AttendanceStatus.ABSENT ? null : checkIn(day, startHour, status === AttendanceStatus.LATE ? 15 : 0),
        checkOutAt: status === AttendanceStatus.ABSENT ? null : at(day, startHour + 2, 0),
      },
    });

  const seedAttendance = async (
    sessions: { id: string; day: number; startHour: number }[],
    enrollIds: string[],
  ) => {
    let i = 0;
    for (const s of sessions) {
      for (const eid of enrollIds) {
        await mkAttendance(s.id, eid, statusCycle[i % statusCycle.length], s.day, s.startHour);
        i++;
      }
    }
  };

  const pySessions = [
    await mkSession(py101.id, lan.id, 1, "Variables & Data Types", 0, 8),
    await mkSession(py101.id, lan.id, 2, "Control Flow & Loops", 7, 8),
    await mkSession(py101.id, lan.id, 3, "Functions & Modules", 14, 8),
  ];
  const webSessions = [
    await mkSession(web201.id, minh.id, 1, "HTML/CSS Refresher", 0, 13),
    await mkSession(web201.id, minh.id, 2, "React Fundamentals", 7, 13),
  ];
  const robSessions = [await mkSession(rob101.id, minh.id, 1, "Robot Kinematics", 2, 8)];

  const dayOf = (s: { startsAt: Date }) => Math.round((s.startsAt.getTime() - BASE.getTime()) / 86_400_000);
  const hourOf = (s: { startsAt: Date }) => new Date(s.startsAt).getUTCHours();

  await seedAttendance(
    pySessions.map((s) => ({ id: s.id, day: dayOf(s), startHour: hourOf(s) })),
    pyEnrolls.map((e) => e.id),
  );
  await seedAttendance(
    webSessions.map((s) => ({ id: s.id, day: dayOf(s), startHour: hourOf(s) })),
    webEnrolls.map((e) => e.id),
  );
  await seedAttendance(
    robSessions.map((s) => ({ id: s.id, day: dayOf(s), startHour: hourOf(s) })),
    robEnrolls.map((e) => e.id),
  );

  // --------------------------------------------------------------------------
  // Assignments
  // --------------------------------------------------------------------------
  const pyAssignment = await prisma.assignment.create({
    data: { classId: py101.id, title: "Python Final Project", description: "Build a CLI tool with at least 3 modules.", dueAt: at(40, 23, 59), maxScore: 100, createdBy: lan.id, updatedBy: lan.id },
  });
  const webAssignment = await prisma.assignment.create({
    data: { classId: web201.id, title: "Portfolio Website", description: "Deploy a responsive portfolio using React.", dueAt: at(30, 23, 59), maxScore: 100, createdBy: minh.id, updatedBy: minh.id },
  });
  const robAssignment = await prisma.assignment.create({
    data: { classId: rob101.id, title: "Line-Following Robot", description: "Program a line-following robot and record a demo video.", dueAt: at(45, 23, 59), maxScore: 100, createdBy: minh.id, updatedBy: minh.id },
  });

  // --------------------------------------------------------------------------
  // Submissions (githubUrl OR fileUrl)
  // --------------------------------------------------------------------------
  await prisma.submission.create({
    data: { assignmentId: pyAssignment.id, userId: quan.id, githubUrl: "https://github.com/a-quan/cli-tool", status: SubmissionStatus.GRADED, score: 88, feedback: "Good modular structure; improve error handling." },
  });
  await prisma.submission.create({
    data: { assignmentId: pyAssignment.id, userId: ha.id, githubUrl: "https://github.com/b-ha/cli-tool", status: SubmissionStatus.GRADED, score: 92, feedback: "Excellent use of type hints and tests." },
  });
  await prisma.submission.create({
    data: { assignmentId: pyAssignment.id, userId: dung.id, fileUrl: "https://storage.tts.edu/submissions/dung-project.zip", status: SubmissionStatus.PENDING },
  });

  await prisma.submission.create({
    data: { assignmentId: webAssignment.id, userId: quan.id, githubUrl: "https://github.com/a-quan/portfolio", status: SubmissionStatus.GRADED, score: 85, feedback: "Responsive layout is solid; add semantic HTML." },
  });
  await prisma.submission.create({
    data: { assignmentId: webAssignment.id, userId: thao.id, fileUrl: "https://storage.tts.edu/submissions/thao-portfolio.zip", status: SubmissionStatus.REJECTED, feedback: "Build failed — fix TypeScript errors and resubmit." },
  });

  await prisma.submission.create({
    data: { assignmentId: robAssignment.id, userId: ha.id, githubUrl: "https://github.com/b-ha/line-follower", status: SubmissionStatus.GRADED, score: 90, feedback: "Smooth following; document PID tuning better." },
  });
  await prisma.submission.create({
    data: { assignmentId: robAssignment.id, userId: dung.id, fileUrl: "https://storage.tts.edu/submissions/dung-robot.zip", status: SubmissionStatus.PENDING },
  });

  // --------------------------------------------------------------------------
  // Summary
  // --------------------------------------------------------------------------
  const counts = {
    users: await prisma.user.count(),
    courses: await prisma.course.count(),
    classes: await prisma.class.count(),
    enrollments: await prisma.enrollment.count(),
    sessions: await prisma.session.count(),
    attendances: await prisma.attendance.count(),
    assignments: await prisma.assignment.count(),
    submissions: await prisma.submission.count(),
  };
  console.log("Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });