import { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | NexusAI",
  description: "Monitor routing performance, costs, and model efficiency.",
};

export default function Page() {
  return <DashboardClient />;
}
