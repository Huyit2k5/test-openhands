/**
 * Serializable data types shared between the Server Component (which reads
 * from Prisma) and the Client Component (which renders the roster + toggles).
 *
 * This file must stay dependency-free: it is imported by both server and
 * client code, so it must not import Prisma or any server-only module.
 */

export type AttendanceMark = "PRESENT" | "LATE" | "ABSENT" | null;

export type StudentRoster = {
  enrollmentId: string;
  name: string;
  email: string;
  phone: string | null;
  attendance: AttendanceMark;
};

export type RosterData = {
  classId: string;
  className: string;
  classCode: string;
  courseName: string;
  instructorName: string;
  session: { id: string; title: string; startsAt: string } | null;
  students: StudentRoster[];
};