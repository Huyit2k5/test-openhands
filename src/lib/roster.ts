import { prisma } from "./db";
import type { RosterData, StudentRoster } from "./types";

/** Minimal class descriptor for the class switcher. */
export type ClassOption = { id: string; label: string };

/** List classes for the "which class" switcher. */
export async function getClasses(): Promise<ClassOption[]> {
  const classes = await prisma.class.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, code: true, course: { select: { name: true } } },
  });
  return classes.map((c) => ({ id: c.id, label: `${c.name} (${c.course.name})` }));
}

/**
 * Load a class's roster (students) and their current attendance for a session.
 * Server-only — depends directly on Prisma, so it must live in a Server
 * Component / Server Action context (never imported by a client component).
 */
export async function getRoster(classId?: string, sessionId?: string): Promise<RosterData> {
  const cls = await prisma.class.findFirst({
    where: classId ? { id: classId } : undefined,
    orderBy: { createdAt: "asc" },
    include: { course: true, instructor: { include: { profile: true } } },
  });
  if (!cls) throw new Error("Lớp học không tìm thấy");

  const sessions = await prisma.session.findMany({
    where: { classId: cls.id },
    orderBy: { sessionNumber: "asc" },
  });
  const session =
    (sessionId ? sessions.find((s) => s.id === sessionId) : undefined) ?? sessions[0] ?? null;

  const enrollments = await prisma.enrollment.findMany({
    where: { classId: cls.id },
    orderBy: { createdAt: "asc" },
    include: { user: { include: { profile: true } } },
  });

  const attendanceRows = session
    ? await prisma.attendance.findMany({
        where: { sessionId: session.id },
        select: { enrollmentId: true, status: true },
      })
    : [];
  const attMap = new Map(attendanceRows.map((a) => [a.enrollmentId, a.status]));

  const students: StudentRoster[] = enrollments.map((e) => ({
    enrollmentId: e.id,
    name: e.user.profile?.fullName ?? e.user.email,
    email: e.user.email,
    phone: e.user.profile?.phone ?? null,
    attendance: session ? (attMap.get(e.id) ?? null) : null,
  }));

  return {
    classId: cls.id,
    className: cls.name,
    classCode: cls.code,
    courseName: cls.course.name,
    instructorName: cls.instructor.profile?.fullName ?? cls.instructor.email,
    session: session
      ? { id: session.id, title: session.title, startsAt: session.startsAt.toISOString() }
      : null,
    students,
  };
}