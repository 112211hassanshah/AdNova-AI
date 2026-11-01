import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Workspace } from "@/components/workspace";
const sections = [
  "data-studio",
  "campaigns",
  "ml-studio",
  "budget-optimizer",
  "big-data-lab",
  "ai-assistant",
  "commerce",
  "help",
];
export function generateStaticParams() {
  return sections.map((section) => ({ section }));
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ section: string }>;
}): Promise<Metadata> {
  const { section } = await params;
  const titles: Record<string, string> = {
    "data-studio": "Data Studio",
    campaigns: "Campaigns",
    "ml-studio": "ML Studio",
    "budget-optimizer": "Budget Optimizer",
    "big-data-lab": "Big Data Lab",
    "ai-assistant": "AI Assistant",
    commerce: "Commerce & Attribution",
    help: "Help & about",
  };
  return { title: `${titles[section] || "Page not found"} · Adwise` };
}
export default async function Section({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  if (!sections.includes(section)) notFound();
  return <Workspace section={section} />;
}
