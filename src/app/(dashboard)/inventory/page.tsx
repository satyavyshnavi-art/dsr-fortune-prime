"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/shared";
import { KPICard } from "@/components/shared/kpi-card";
import {
  InventoryList,
  TransactionModal,
  ItemDetail,
  UniformTracker,
} from "@/components/modules/inventory";
import { MOCK_ITEMS, MOCK_TRANSACTIONS, type InventoryItem } from "@/components/modules/inventory/mock-data";
import {
  Package,
  AlertTriangle,
  DollarSign,
  ArrowRightLeft,
  ListOrdered,
  Shirt,
} from "lucide-react";

type TabId = "inventory" | "uniforms";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "inventory", label: "Inventory Items", icon: ListOrdered },
  { id: "uniforms", label: "Uniform Tracker", icon: Shirt },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<TabId>("inventory");
  const [transactionItem, setTransactionItem] = useState<InventoryItem | null>(null);
  const [detailItem, setDetailItem] = useState<InventoryItem | null>(null);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  // KPI calculations from mock data
  const totalItems = MOCK_ITEMS.length;
  const lowStockItems = MOCK_ITEMS.filter(
    (i) => i.status === "low_stock" || i.status === "out_of_stock"
  ).length;
  const totalValue = MOCK_ITEMS.reduce(
    (sum, i) => sum + i.currentQty * i.unitCost,
    0
  );
  const todayTransactions = MOCK_TRANSACTIONS.filter(
    (t) => t.date === new Date().toISOString().split("T")[0]
  ).length;

  return (
    <div className="p-5 space-y-4">
      <PageHeader title="Inventory Management" />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          title="Total Items"
          value={totalItems}
          icon={Package}
          color="blue"
        />
        <KPICard
          title="Low Stock Items"
          value={lowStockItems}
          icon={AlertTriangle}
          color="red"
        />
        <KPICard
          title="Total Value"
          value={`₹${totalValue.toLocaleString("en-IN")}`}
          icon={DollarSign}
          color="green"
        />
        <KPICard
          title="Transactions Today"
          value={todayTransactions}
          icon={ArrowRightLeft}
          color="yellow"
        />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "inventory" && (
          <InventoryList
            onAddTransaction={(item) => {
              setTransactionItem(item);
              setShowTransaction(true);
            }}
            onViewDetail={(item) => {
              setDetailItem(item);
              setShowDetail(true);
            }}
          />
        )}
        {activeTab === "uniforms" && <UniformTracker />}
      </div>

      {/* Modals */}
      <TransactionModal
        open={showTransaction}
        onOpenChange={setShowTransaction}
        item={transactionItem}
      />
      <ItemDetail
        open={showDetail}
        onOpenChange={setShowDetail}
        item={detailItem}
      />
    </div>
  );
}
