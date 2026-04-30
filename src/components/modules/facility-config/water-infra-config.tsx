"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, KPICard } from "@/components/shared";
import {
  Plus,
  Pencil,
  Trash2,
  Droplets,
  ChevronDown,
  ChevronUp,
  Container,
  Gauge,
  Activity,
} from "lucide-react";

interface WaterTank {
  id: string;
  name: string;
  location: string;
  capacity: number;
  type: "overhead" | "underground";
  initialReading: number;
  status: "active" | "inactive";
}

interface Borewell {
  id: string;
  name: string;
  location: string;
  depth: number;
  supply: number;
  initialReading: number;
  status: "active" | "inactive";
}

interface CavernSupply {
  id: string;
  name: string;
  supply: number;
  initialReading: number;
  status: "active" | "inactive";
}

interface TankerSupply {
  id: string;
  name: string;
  noOfTankers: number;
  tankerCapacity: number;
  totalCapacity: number;
  status: "active" | "inactive";
}

const mockTanks: WaterTank[] = [
  {
    id: "1",
    name: "Overhead Tank - Tower A",
    location: "Roof Top - Tower A",
    capacity: 1000,
    type: "overhead",
    initialReading: 120000,
    status: "active",
  },
  {
    id: "2",
    name: "Overhead Tank - Tower B",
    location: "Roof Top - Tower B",
    capacity: 1000,
    type: "overhead",
    initialReading: 115000,
    status: "active",
  },
  {
    id: "3",
    name: "Underground Tank - Main",
    location: "Basement 1 - Main Building",
    capacity: 2000,
    type: "underground",
    initialReading: 160000,
    status: "active",
  },
  {
    id: "4",
    name: "Overhead Tank - Tower B",
    location: "Roof Top - Tower B",
    capacity: 800,
    type: "overhead",
    initialReading: 115000,
    status: "active",
  },
  {
    id: "5",
    name: "Overhead Tank - Tower A",
    location: "Roof Top - Tower A",
    capacity: 700,
    type: "overhead",
    initialReading: 120000,
    status: "active",
  },
];

const mockBorewells: Borewell[] = [
  {
    id: "1",
    name: "BW-01",
    location: "Basement - East Side",
    depth: 180,
    supply: 600,
    initialReading: 0,
    status: "active",
  },
  {
    id: "2",
    name: "BW-02",
    location: "Basement - West Side",
    depth: 200,
    supply: 700,
    initialReading: 0,
    status: "active",
  },
  {
    id: "3",
    name: "BW-01",
    location: "Basement - East Side",
    depth: 180,
    supply: 600,
    initialReading: 0,
    status: "active",
  },
];

const mockCavern: CavernSupply[] = [
  {
    id: "1",
    name: "Facility Supply",
    supply: 500,
    initialReading: 0,
    status: "active",
  },
];

const mockTanker: TankerSupply[] = [
  {
    id: "1",
    name: "Tanker Supply",
    noOfTankers: 4,
    tankerCapacity: 20,
    totalCapacity: 80,
    status: "active",
  },
];

function CollapsibleSection({
  title,
  count,
  children,
  onAdd,
}: {
  title: string;
  count?: number;
  children: React.ReactNode;
  onAdd?: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-800 hover:text-slate-600"
        >
          {open ? (
            <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
          {title}
        </button>
        <Button
          variant="ghost"
          className="h-7 text-[11px] text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 px-2"
          onClick={onAdd}
        >
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>
      {open && children}
    </div>
  );
}

function InfraCard({
  title,
  status,
  details,
}: {
  title: string;
  status: string;
  details: { label: string; value: string }[];
}) {
  return (
    <Card className="shadow-none border-slate-200">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-[12px] font-semibold text-slate-800">{title}</h4>
          <StatusBadge status={status} />
        </div>
        <div className="space-y-0.5">
          {details.map((d) => (
            <p key={d.label} className="text-[11px] text-slate-500">
              <span className="text-slate-400">{d.label}:</span> {d.value}
            </p>
          ))}
        </div>
        <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

export function WaterInfraConfig() {
  const totalTankCapacity = mockTanks.reduce((sum, t) => sum + t.capacity, 0);
  const activeTanks = mockTanks.filter((t) => t.status === "active").length;
  const activeBorewells = mockBorewells.filter((b) => b.status === "active").length;

  return (
    <div className="space-y-4">
      <h2 className="text-[13px] font-semibold text-slate-800">
        Water Infrastructure Configuration
      </h2>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard
          title="Total Tank Capacity"
          value={`${totalTankCapacity.toLocaleString()} L`}
          icon={Droplets}
          color="blue"
        />
        <KPICard
          title="Active Tanks"
          value={`${activeTanks} / ${mockTanks.length}`}
          icon={Container}
          color="green"
        />
        <KPICard
          title="Active Borewells"
          value={`${activeBorewells} / ${mockBorewells.length}`}
          icon={Gauge}
          color="blue"
        />
        <KPICard
          title="Overall Status"
          value="Active"
          icon={Activity}
          color="green"
        />
      </div>

      {/* Water Tanks */}
      <CollapsibleSection title="Water Tanks">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockTanks.map((tank) => (
            <InfraCard
              key={tank.id}
              title={tank.name}
              status={tank.status}
              details={[
                { label: "Location", value: tank.location },
                { label: "Capacity", value: `${tank.capacity} L` },
                { label: "Type", value: tank.type },
                { label: "Initial Reading", value: `${tank.initialReading.toLocaleString()} L` },
              ]}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Borewells */}
      <CollapsibleSection title="Borewells">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockBorewells.map((bw) => (
            <InfraCard
              key={bw.id}
              title={bw.name}
              status={bw.status}
              details={[
                { label: "Location", value: bw.location },
                { label: "Depth", value: `${bw.depth} m` },
                { label: "Supply", value: `${bw.supply} L/hr` },
                { label: "Initial Reading", value: `${bw.initialReading} L` },
              ]}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Cavern / Municipal Supply */}
      <CollapsibleSection title="Cavern / Municipal Supply">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockCavern.map((c) => (
            <InfraCard
              key={c.id}
              title={c.name}
              status={c.status}
              details={[
                { label: "Supply", value: `${c.supply} L/day` },
                { label: "Initial Reading", value: `${c.initialReading} L` },
              ]}
            />
          ))}
        </div>
      </CollapsibleSection>

      {/* Tanker Supply */}
      <CollapsibleSection title="Tanker Supply">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {mockTanker.map((t) => (
            <InfraCard
              key={t.id}
              title={t.name}
              status={t.status}
              details={[
                { label: "No. of Tankers", value: String(t.noOfTankers) },
                { label: "Tanker Capacity (L)", value: String(t.tankerCapacity) },
                { label: "Total Capacity (L)", value: String(t.totalCapacity) },
              ]}
            />
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
