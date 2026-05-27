import { createFileRoute } from "@tanstack/react-router";
import { HomeItemsManager } from "@/components/admin/home-items-manager";

export const Route = createFileRoute("/admin/home-items")({ component: AdminHomeItems });

function AdminHomeItems() {
  return <HomeItemsManager />;
}

