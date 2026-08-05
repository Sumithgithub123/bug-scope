import { SidebarItem } from "@/components/Dashboard/SidebarItem";
import {
  AlertTriangle,
  Bell,
  Bug,
  LayoutDashboard,
  Search,
  Server,
  Users,
  Activity,
} from "lucide-react";
import { ReactNode } from "react";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-900">
        <div className="flex h-20 items-center px-6 border-b border-zinc-800">
          <div>
            <h1 className="text-2xl font-bold text-red-500">BugScope</h1>
            <p className="text-xs text-zinc-400">
              Software Dependency Explorer
            </p>
          </div>
        </div>

        <nav className="mt-6 space-y-2 px-4">
          <SidebarItem
            path="/dashboard"
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
          />
          <SidebarItem path="/bugs" icon={<Bug size={18} />} label="Bugs" />
          <SidebarItem
            path="/services"
            icon={<Server size={18} />}
            label="Services"
          />
          <SidebarItem path="/teams" icon={<Users size={18} />} label="Teams" />
          {/* <SidebarItem icon={<Activity size={18} />} label="Analytics" /> */}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex relative flex-1 flex-col">
        {/* Header */}
        <header className="flex h-20 items-center justify-between border-b border-zinc-800 bg-zinc-900 px-8">
          <div>
            <h2 className="text-xl font-semibold">Bug Dependency Graph</h2>
            <p className="text-sm text-zinc-400">
              Visualize bug propagation across microservices
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center rounded-lg bg-zinc-800 px-3 py-2">
              <Search size={18} className="text-zinc-400" />
              <input
                placeholder="Search bug, service..."
                className="ml-2 bg-transparent text-sm outline-none placeholder:text-zinc-500"
              />
            </div>

            <button className="rounded-lg bg-zinc-800 p-2 hover:bg-zinc-700">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Graph */}
        <main className=" flex-1 overflow-y-auto bg-slate-50">{children}</main>

        {/* Footer */}
      </div>
    </div>
  );
}
