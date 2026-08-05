"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

async function getBugs() {
  const { data } = await axios.get("/api/bugs");
  return data;
}

function BugsPage() {
  const { data = [] } = useQuery({ queryKey: ["bugs"], queryFn: getBugs });
  const router = useRouter();
  return (
    <div className="flex-1 overflow-auto p-8">
      <div className="overflow-auto max-h-[80vh] rounded-xl border border-zinc-800 bg-zinc-900">
        {/* Header */}
        <div className="grid sticky top-0 grid-cols-6 border-b border-zinc-800 bg-zinc-950 px-6 py-4 text-sm font-semibold uppercase tracking-wide text-zinc-400">
          <p>Bug</p>
          <p>Severity</p>
          <p>Status</p>
          <p>Service</p>
          <p>Team</p>
          <p>Impact</p>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800">
          {data.map(
            (bug: {
              id: string;
              title: string;
              severity: string;
              status: string;
              service: string;
              team: string;
              impact: number;
            }) => (
              <button
                onClick={() => router.push(`/bugs/${bug.id}`)}
                key={bug.id}
                className="grid w-full grid-cols-6 items-center px-6 py-4 text-left transition hover:bg-zinc-800/70"
              >
                <div>
                  <p className="font-medium text-white">{bug.title}</p>
                  <p className="text-xs text-zinc-500">{bug.id}</p>
                </div>

                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold
                ${
                  bug.severity === "Critical"
                    ? "bg-red-500/20 text-red-400"
                    : bug.severity === "High"
                      ? "bg-orange-500/20 text-orange-400"
                      : bug.severity === "Medium"
                        ? "bg-yellow-500/20 text-yellow-400"
                        : "bg-green-500/20 text-green-400"
                }`}
                  >
                    {bug.severity}
                  </span>
                </div>

                <div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs
                ${
                  bug.status === "Open"
                    ? "bg-blue-500/20 text-blue-400"
                    : "bg-zinc-700 text-zinc-300"
                }`}
                  >
                    {bug.status}
                  </span>
                </div>

                <p className="text-zinc-300">{bug.service}</p>

                <p className="text-zinc-400">{bug.team}</p>

                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-700">
                    <div
                      className={`h-full rounded-full ${
                        bug.impact >= 80
                          ? "bg-red-500"
                          : bug.impact >= 60
                            ? "bg-orange-500"
                            : bug.impact >= 40
                              ? "bg-yellow-500"
                              : "bg-green-500"
                      }`}
                      style={{ width: `${bug.impact}%` }}
                    />
                  </div>

                  <span className="w-10 text-right text-sm font-semibold text-white">
                    {bug.impact}%
                  </span>
                </div>
              </button>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

export default BugsPage;
