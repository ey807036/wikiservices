import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/fia-preparation")({
  head: () => ({
    meta: [
      { title: "FIA Preparation by Wiki — Verified MCQs & Posts" },
      { name: "description", content: "FIA Preparation by Wiki — verified MCQs, posts and study material for FIA, PPSC, FPSC, NTS, ASF and Police." },
    ],
  }),
  component: () => <Outlet />,
});
