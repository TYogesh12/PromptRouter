import { Metadata } from "next";
import CostSavingsClient from "./CostSavingsClient";

export const metadata: Metadata = {
  title: "Financial Savings | PromptRouter",
  description: "Detailed financial audit of LLM cost efficiency and ROI.",
};

export default function Page() {
  return <CostSavingsClient />;
}
