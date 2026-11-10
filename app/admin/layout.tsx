import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Admin — The Item Box",
  description: "Manage The Item Box catalog and homepage merchandising.",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
