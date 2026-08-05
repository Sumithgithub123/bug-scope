"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, LoaderCircle } from "lucide-react";
import { ParamValue } from "next/dist/server/request/params";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import React, { useRef } from "react";
import { ForceGraphMethods } from "react-force-graph-2d";
import useMeasure from "react-use-measure";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

async function getBugDetails(id: ParamValue) {
  const { data } = await axios.get(`/api/bugs/${id}`);
  console.log(data);

  return data;
}

function BugDetails() {
  const [ref, bounds] = useMeasure();
  const [ref1, bounds1] = useMeasure();
  const fgRef = useRef<ForceGraphMethods | undefined>(undefined);
  const { id } = useParams();
  const { isLoading, data = { graph: { nodes: [], links: [] } } } = useQuery({
    queryKey: ["bug", id],
    queryFn: () => getBugDetails(id),
  });

  return (
    <div ref={ref} className="w-full h-full relative">
      {isLoading && (
        <LoaderCircle
          color="#3f3f46"
          className="left-[50%] size-10 animate-spin absolute top-[40%] "
        />
      )}
      {!isLoading && bounds.width > 0 && (
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
      {!isLoading && bounds.width > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={bounds.width}
          height={bounds.height - bounds1.height}
          graphData={data.graph}
          enableNodeDrag
          nodeAutoColorBy="type"
          nodeLabel={(node: any) => `${node.name} (${node.type})`}
          linkLabel={(link: any) => link.label}
          enableZoomInteraction={true}
          enablePanInteraction={true}
          minZoom={0.5}
          maxZoom={8}
        />
      )}
      <footer
        ref={ref1}
        className="absolute bottom-0 w-full grid h-24 grid-cols-4 border-t border-zinc-800 bg-zinc-900"
      >
        <FooterCard
          icon={<AlertTriangle className="text-red-400" size={18} />}
          title="Impact Score"
          value={isLoading ? "Loading..." : `${data?.stats?.impactScore}%`}
        />
        <FooterCard
          title="Affected Services"
          value={isLoading ? "Loading..." : `${data?.stats?.affectedServices}`}
        />
        <FooterCard
          title="Developers"
          value={
            isLoading ? "Loading..." : `${data?.stats?.affectedDevelopers}`
          }
        />
        <FooterCard
          title="Customers"
          value={isLoading ? "Loading..." : `${data?.stats?.affectedCustomers}`}
        />
      </footer>
    </div>
  );
}

function FooterCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center gap-3 border-r border-zinc-800 last:border-none">
      {icon}
      <div>
        <p className="text-xs text-zinc-400">{title}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}
export default BugDetails;
