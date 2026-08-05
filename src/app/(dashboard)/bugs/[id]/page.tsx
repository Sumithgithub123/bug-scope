import BugDetails from "@/components/bugs/BugDetails";
import React from "react";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return { title: `Bug - ${id}` };
}

function Page() {
  return <BugDetails />;
}

export default Page;
