"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import useMeasure from "react-use-measure";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { ForceGraphMethods } from "react-force-graph-2d";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

export default function Graph() {
  const [ref, bounds] = useMeasure();
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);

  // const [counts, setCounts] = useState({
  //   openBugs: 0,
  //   services: 0,
  //   developers: 0,
  //   customers: 0,
  // });
  async function fetchCounts() {
    const { data: { openBugs, services, developers, customers } = {} } =
      await axios.get("/api/dashboard");
    return {
      openBugs,
      services,
      developers,
      customers,
    };
  }

  async function fetchNodes() {
    const res = await fetch("/api/graph");
    return await res.json();
  }

  const {
    data: counts = { openBugs: 0, services: 0, developers: 0, customers: 0 },
    isLoading: isLoadingCounts,
  } = useQuery({
    queryKey: ["counts"],
    queryFn: () => fetchCounts(),
  });

  const {
    isLoading,
    data: graph = {
      nodes: [],
      links: [],
    },
  } = useQuery({
    queryKey: ["nodes"],
    queryFn: () => fetchNodes(),
  });

  return (
    <div
      ref={ref}
      className="w-full relative h-full flex items-center justify-center"
    >
      <div className="absolute left-6 top-6 z-10 grid grid-cols-4 gap-4">
        <StatCard
          isLoadingCounts={isLoadingCounts}
          title="Open Bugs"
          value={counts.openBugs}
          color="text-red-400"
        />
        <StatCard
          isLoadingCounts={isLoadingCounts}
          title="Services"
          value={counts.services}
          color="text-cyan-400"
        />
        <StatCard
          isLoadingCounts={isLoadingCounts}
          title="Developers"
          value={counts.developers}
          color="text-green-400"
        />
        <StatCard
          isLoadingCounts={isLoadingCounts}
          title="Customers"
          value={counts.customers}
          color="text-yellow-400"
        />
      </div>
      {bounds.width > 0 && (
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() * 1.2, 400)}
            className="h-10 w-10 rounded-lg border bg-stone-700 shadow hover:bg-stone-500"
          >
            +
          </button>

          <button
            onClick={() => fgRef.current?.zoom(fgRef.current.zoom() / 1.2, 400)}
            className="h-10 w-10 rounded-lg border bg-stone-700 shadow hover:bg-stone-500"
          >
            −
          </button>

          <button
            onClick={() => fgRef.current?.zoomToFit(500, 40)}
            className="rounded-lg border bg-stone-700 px-3 py-2 text-sm shadow hover:bg-stone-500"
          >
            Fit
          </button>
        </div>
      )}
      {isLoading && (
        <LoaderCircle
          color="#3f3f46"
          className="size-10 animate-spin absolute"
        />
      )}
      {bounds.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={bounds.width}
          height={bounds.height}
          graphData={graph}
          enableNodeDrag
          nodeAutoColorBy="type"
          nodeLabel={(node: any) => `${node.name} (${node.type})`}
          linkLabel={(link: any) => link.label}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.2}
          maxZoom={8}
        />
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
  isLoadingCounts,
}: {
  title: string;
  value: number;
  color: string;
  isLoadingCounts: boolean;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-5 py-4 backdrop-blur">
      <p className="text-xs text-zinc-300">{title}</p>
      <h3 className={`mt-1 text-2xl font-bold ${color}`}>
        {isLoadingCounts ? (
          <div className="animate-pulse bg-stone-50 size-5 w-full rounded-full"></div>
        ) : (
          value
        )}
      </h3>
    </div>
  );
}
