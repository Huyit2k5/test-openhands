import { redirect } from "next/navigation";

/**
 * Root "/" — redirect straight into the dashboard so visitors land on the
 * working app rather than the starter placeholder.
 */
export default function Home() {
  redirect("/dashboard/attendance");
}