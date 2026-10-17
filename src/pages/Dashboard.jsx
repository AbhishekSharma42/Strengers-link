import {
  Boxes,
  FolderTree,
  Package,
  Receipt,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShoppingCart,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/formatCurrency";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import StatCard from "../components/StatCard";
import StockBadge from "../components/StockBadge";
import Pagination from "../components/Pagination";

export default function Dashboard() {
  const {
    stats,
    products = [],
    sales = [],
    settings,
    loading,
  } = useStore();

  const currency =
    settings?.currency || "INR";

  /* =====================================================
     LAST 7 DAYS SALES
  ===================================================== */

  const salesLast7Days = useMemo(() => {
    return Array.from(
      { length: 7 },
      (_, index) => {
        const date = new Date();

        date.setHours(
          0,
          0,
          0,
          0
        );

        date.setDate(
          date.getDate() -
            (6 - index)
        );

        const dayString =
          date.toDateString();

        const value = sales.reduce(
          (total, sale) => {
            const saleDate =
              sale?.saleDate ||
              sale?.date ||
              sale?.createdAt;

            if (!saleDate) {
              return total;
            }

            const parsedDate =
              new Date(
                saleDate
              );

            if (
              Number.isNaN(
                parsedDate.getTime()
              )
            ) {
              return total;
            }

            if (
              parsedDate.toDateString() !==
              dayString
            ) {
              return total;
            }

            const amount =
              sale?.total ??
              sale?.totalAmount ??
              0;

            return (
              total +
              Number(
                amount || 0
              )
            );
          },
          0
        );

        return {
          name:
            date.toLocaleDateString(
              "en-IN",
              {
                day: "2-digit",
                month: "short",
              }
            ),
          value,
        };
      }
    );
  }, [sales]);

  /* =====================================================
     LOW STOCK
  ===================================================== */

  const lowStockProducts =
    useMemo(() => {
      return products
        .filter((product) => {
          const currentStock =
            Number(
              product?.currentStock ||
                0
            );

          const minimumStock =
            Number(
              product?.minStock ??
                product?.minimumStock ??
                0
            );

          return (
            currentStock <=
            minimumStock
          );
        })
        .slice(0, 8);
    }, [products]);

  /* =====================================================
     DISPLAY STATS
  ===================================================== */

  const displayStats = {
    totalProducts:
      stats?.totalProducts ??
      0,

    totalCategories:
      stats?.totalCategories ??
      0,

    totalStock:
      stats?.totalStock ??
      0,

    totalSold:
      stats?.totalSold ??
      0,

    totalSales:
      stats?.totalSales ??
      0,

    todaysSales:
      stats?.todaysSales ??
      0,

    totalProfit:
      stats?.totalProfit ??
      0,

    lowStock:
      stats?.lowStock ??
      0,
  };

  const outsideSales = useMemo(() => sales.filter(s => String(s?.saleType || "").toLowerCase() === "outside sale"), [sales]);
  const outsideStats = useMemo(() => { const now=new Date(); const month=s=>{const d=new Date(s?.saleDate||s?.date||s?.createdAt);return !Number.isNaN(d.getTime())&&d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();}; return {invoices:new Set(outsideSales.map(s=>s.invoiceNo||s.saleId)).size,items:outsideSales.reduce((t,s)=>t+Number(s.quantity||0),0),revenue:outsideSales.reduce((t,s)=>t+Number(s.total??s.totalAmount??0),0),monthRevenue:outsideSales.filter(month).reduce((t,s)=>t+Number(s.total??s.totalAmount??0),0)}; },[outsideSales]);
  const outsideProducts = useMemo(() => { const m={}; outsideSales.forEach(s=>{const k=s.productId||s.productName||"unknown"; if(!m[k])m[k]={name:s.productName||"Unknown",quantity:0,revenue:0};m[k].quantity+=Number(s.quantity||0);m[k].revenue+=Number(s.total??s.totalAmount??0);});return Object.values(m).sort((a,b)=>b.revenue-a.revenue);},[outsideSales]);

  const [lowStockPageSize, setLowStockPageSize] = useState(() => { const n=Number(localStorage.getItem("page-size:dashboard-low-stock")); return [10,20,50].includes(n)?n:10; });
  const [lowStockPage, setLowStockPage] = useState(1);
  const [outsidePageSize, setOutsidePageSize] = useState(() => { const n=Number(localStorage.getItem("page-size:dashboard-outside-products")); return [10,20,50].includes(n)?n:10; });
  const [outsidePage, setOutsidePage] = useState(1);
  useEffect(()=>{localStorage.setItem("page-size:dashboard-low-stock",String(lowStockPageSize));setLowStockPage(1)},[lowStockPageSize]);
  useEffect(()=>{localStorage.setItem("page-size:dashboard-outside-products",String(outsidePageSize));setOutsidePage(1)},[outsidePageSize]);
  const pagedLowStockProducts = useMemo(()=>lowStockProducts.slice((lowStockPage-1)*lowStockPageSize,lowStockPage*lowStockPageSize),[lowStockProducts,lowStockPage,lowStockPageSize]);
  const pagedOutsideProducts = useMemo(()=>outsideProducts.slice((outsidePage-1)*outsidePageSize,outsidePage*outsidePageSize),[outsideProducts,outsidePage,outsidePageSize]);

  /* =====================================================
     TODAY
  ===================================================== */

  const today = new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());

  return (
    <div className="space-y-6">

      {/* =================================================
          WELCOME HEADER
      ================================================= */}

      <section
        className="
          relative overflow-hidden
          rounded-3xl
          border border-slate-200
          bg-gradient-to-br
          from-slate-950
          via-slate-900
          to-blue-950
          p-6
          text-white
          shadow-xl
          shadow-slate-200/50
          dashboard-welcome
          sm:p-7
        "
      >

        {/* Decorative circles */}

        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-48
            w-48
            rounded-full
            bg-blue-500/20
            blur-2xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            right-20
            h-40
            w-40
            rounded-full
            bg-indigo-500/10
            blur-3xl
          "
        />

        <div className="relative z-10">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div
                className="
                  mb-3
                  inline-flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-white/10
                  bg-white/10
                  px-3
                  py-1.5
                  text-xs
                  font-medium
                  text-blue-100
                  backdrop-blur-sm
                "
              >
                <Sparkles
                  size={14}
                />

                Store Overview
              </div>

              <h1
                className="
                  text-2xl
                  font-bold
                  tracking-tight
                  sm:text-3xl
                "
              >
                Welcome back 👋
              </h1>

              <p
                className="
                  mt-2
                  max-w-xl
                  text-sm
                  leading-6
                  text-slate-300
                "
              >
                Manage your products,
                inventory and sales
                from one place.
              </p>

              <p
                className="
                  mt-3
                  text-xs
                  font-medium
                  text-slate-400
                "
              >
                {today}
              </p>

            </div>

            {/* SYNC STATUS */}

            <div
              className="
                flex
                shrink-0
                items-center
                gap-3
                self-start
                rounded-2xl
                border
                border-white/10
                bg-white/10
                px-4
                py-3
                backdrop-blur-md
                sm:self-center
              "
            >

              <div
                className={`
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  ${
                    loading
                      ? "bg-blue-500/20 text-blue-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }
                `}
              >

                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

              </div>

              <div>

                <p className="text-xs text-slate-400">
                  Data status
                </p>

                <p className="text-sm font-semibold text-white">
                  {loading
                    ? "Syncing..."
                    : "All data synced"}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <section>

        <div className="mb-4 flex items-center justify-between">

          <div>

            <h2
              className="
                text-lg
                font-bold
                tracking-tight
                text-slate-900
              "
            >
              Store Summary
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-slate-500
              "
            >
              Your store performance at a glance
            </p>

          </div>

        </div>

        <div
          className="
            grid
            gap-4
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >

          <StatCard
            title="Total Products"
            value={
              displayStats.totalProducts
            }
            icon={Boxes}
          />

          <StatCard
            title="Categories"
            value={
              displayStats.totalCategories
            }
            icon={FolderTree}
          />

          <StatCard
            title="Current Stock"
            value={
              displayStats.totalStock
            }
            icon={Package}
          />

          <StatCard
            title="Items Sold"
            value={
              displayStats.totalSold
            }
            icon={Receipt}
          />

          <StatCard
            title="Total Sales"
            value={formatCurrency(
              displayStats.totalSales,
              currency
            )}
            icon={TrendingUp}
          />

          <StatCard
            title="Today's Sales"
            value={formatCurrency(
              displayStats.todaysSales,
              currency
            )}
            icon={ShoppingCart}
          />

          <StatCard
            title="Total Profit"
            value={formatCurrency(
              displayStats.totalProfit,
              currency
            )}
            icon={TrendingUp}
          />

          <StatCard
            title="Low Stock"
            value={
              displayStats.lowStock
            }
            icon={AlertTriangle}
          />

        </div>

      </section>

      {/* =================================================
          CHART + LOW STOCK
      ================================================= */}

      <section
        className="
          grid
          gap-6
          xl:grid-cols-[1.45fr_1fr]
        "
      >

        {/* =================================================
            SALES CHART
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          {/* Chart Header */}

          <div
            className="
              flex
              flex-col
              gap-3
              border-b
              border-slate-100
              p-5
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:p-6
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-50
                    text-blue-600
                  "
                >
                  <TrendingUp
                    size={18}
                  />
                </div>

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Sales Performance
                </h2>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-400
                "
              >
                Sales activity for the last 7 days
              </p>

            </div>

            <div
              className="
                flex
                items-center
                gap-2
                rounded-xl
                bg-slate-50
                px-3
                py-2
                text-xs
                font-medium
                text-slate-500
              "
            >
              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-blue-500
                "
              />

              Last 7 days
            </div>

          </div>

          {/* Chart */}

          <div className="h-[310px] p-4 sm:p-6">

            {sales.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={
                    salesLast7Days
                  }
                  margin={{
                    top: 10,
                    right: 5,
                    left: -15,
                    bottom: 5,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                    }}
                    dy={8}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: "rgba(59,130,246,0.05)",
                    }}
                    contentStyle={{
                      borderRadius:
                        "14px",
                      border:
                        "1px solid #e2e8f0",
                      boxShadow:
                        "0 10px 30px rgba(15,23,42,0.10)",
                    }}
                    labelStyle={{
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                    formatter={(value) =>
                      formatCurrency(
                        value,
                        currency
                      )
                    }
                  />

                  <Bar
                    dataKey="value"
                    radius={[
                      8,
                      8,
                      3,
                      3,
                    ]}
                    barSize={28}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div
                className="
                  flex
                  h-full
                  items-center
                  justify-center
                "
              >

                <div className="text-center">

                  <div
                    className="
                      mx-auto
                      mb-4
                      flex
                      h-14
                      w-14
                      items-center
                      justify-center
                      rounded-2xl
                      bg-slate-100
                      text-slate-400
                    "
                  >
                    <TrendingUp
                      size={24}
                    />
                  </div>

                  <p
                    className="
                      text-sm
                      font-semibold
                      text-slate-700
                    "
                  >
                    No sales data yet
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-slate-400
                    "
                  >
                    Sales will appear here automatically.
                  </p>

                </div>

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            LOW STOCK
        ================================================= */}

        <div
          className="
            overflow-hidden
            rounded-3xl
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >

          {/* Header */}

          <div
            className="
              flex
              items-center
              justify-between
              border-b
              border-slate-100
              p-5
              sm:p-6
            "
          >

            <div>

              <div className="flex items-center gap-2">

                <div
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    text-red-500
                  "
                >
                  <AlertTriangle
                    size={18}
                  />
                </div>

                <h2
                  className="
                    font-bold
                    text-slate-900
                  "
                >
                  Low Stock
                </h2>

              </div>

              <p
                className="
                  mt-2
                  text-xs
                  text-slate-400
                "
              >
                Products that need attention
              </p>

            </div>

            <span
              className="
                flex
                h-9
                min-w-9
                items-center
                justify-center
                rounded-xl
                bg-red-50
                px-3
                text-xs
                font-bold
                text-red-600
              "
            >
              {displayStats.lowStock}
            </span>

          </div>

          {/* Product List */}

          {lowStockProducts.length >
          0 ? (

            <div className="divide-y divide-slate-100">

              {pagedLowStockProducts.map(
                (product) => {
                  const currentStock =
                    Number(
                      product?.currentStock ||
                        0
                    );

                  const minimumStock =
                    Number(
                      product?.minStock ??
                        product?.minimumStock ??
                        0
                    );

                  return (
                    <div
                      key={
                        product.productId
                      }
                      className="
                        group
                        flex
                        items-center
                        justify-between
                        gap-3
                        px-5
                        py-4
                        transition
                        hover:bg-slate-50
                        sm:px-6
                      "
                    >

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >

                        {/* Product Icon */}

                        <div
                          className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            bg-slate-100
                            text-slate-500
                            transition
                            group-hover:bg-blue-50
                            group-hover:text-blue-600
                          "
                        >
                          <Package
                            size={18}
                          />
                        </div>

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-slate-800
                            "
                          >
                            {product.productName ||
                              "Unnamed Product"}
                          </p>

                          {product.sku && (
                            <p
                              className="
                                mt-0.5
                                truncate
                                text-xs
                                text-slate-400
                              "
                            >
                              SKU:{" "}
                              {
                                product.sku
                              }
                            </p>
                          )}

                        </div>

                      </div>

                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-2
                        "
                      >

                        <div className="text-right">

                          <p
                            className="
                              text-sm
                              font-bold
                              text-slate-800
                            "
                          >
                            {currentStock}
                          </p>

                          <p
                            className="
                              text-[10px]
                              text-slate-400
                            "
                          >
                            stock
                          </p>

                        </div>

                        <StockBadge
                          value={
                            currentStock
                          }
                          limit={
                            minimumStock
                          }
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          ) : (

            <div
              className="
                flex
                min-h-[260px]
                items-center
                justify-center
                p-6
              "
            >

              <div className="text-center">

                <div
                  className="
                    mx-auto
                    mb-4
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-2xl
                    bg-emerald-50
                    text-emerald-600
                  "
                >
                  <span
                    className="
                      text-2xl
                      font-bold
                    "
                  >
                    ✓
                  </span>
                </div>

                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-700
                  "
                >
                  Stock looks good
                </p>

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-xs
                    text-xs
                    leading-5
                    text-slate-400
                  "
                >
                  All your products
                  currently have
                  sufficient stock.
                </p>

              </div>

            </div>

          )}

        </div>

        <Pagination page={lowStockPage} pageSize={lowStockPageSize} total={lowStockProducts.length} onPageChange={setLowStockPage} onPageSizeChange={setLowStockPageSize} storageKey="dashboard-low-stock" />

      </section>

      {/* =================================================
          QUICK SUMMARY
      ================================================= */}

      <section
        className="
          grid
          gap-4
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >

        {/* TOTAL SALES */}

        <div
          className="
            group
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
              "
            >
              <Receipt
                size={19}
              />
            </div>

            <ArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-blue-500
              "
            />

          </div>

          <p
            className="
              mt-4
              text-xs
              font-medium
              text-slate-400
            "
          >
            Total Revenue
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
              text-slate-900
            "
          >
            {formatCurrency(
              displayStats.totalSales,
              currency
            )}
          </p>

        </div>

        {/* PROFIT */}

        <div
          className="
            group
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition
            hover:-translate-y-0.5
            hover:shadow-md
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-emerald-50
                text-emerald-600
              "
            >
              <TrendingUp
                size={19}
              />
            </div>

            <ArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-emerald-500
              "
            />

          </div>

          <p
            className="
              mt-4
              text-xs
              font-medium
              text-slate-400
            "
          >
            Total Profit
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
              text-slate-900
            "
          >
            {formatCurrency(
              displayStats.totalProfit,
              currency
            )}
          </p>

        </div>

        {/* INVENTORY */}

        <div
          className="
            group
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            transition
            hover:-translate-y-0.5
            hover:shadow-md
            sm:col-span-2
            lg:col-span-1
          "
        >

          <div className="flex items-center justify-between">

            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-xl
                bg-violet-50
                text-violet-600
              "
            >
              <Boxes
                size={19}
              />
            </div>

            <ArrowUpRight
              size={17}
              className="
                text-slate-300
                transition
                group-hover:text-violet-500
              "
            />

          </div>

          <p
            className="
              mt-4
              text-xs
              font-medium
              text-slate-400
            "
          >
            Inventory Items
          </p>

          <p
            className="
              mt-1
              text-xl
              font-bold
              text-slate-900
            "
          >
            {displayStats.totalStock}
          </p>

        </div>

      </section>


      {/* OUTSIDE SALE ANALYTICS */}
      <section className="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShoppingCart size={19} /></div><div><h2 className="text-lg font-bold text-slate-900">Outside Sale Analytics</h2><p className="text-xs text-slate-500">Product, quantity and revenue analysis for outside sales.</p></div></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 px-4 py-3"><p className="text-[11px] font-semibold uppercase text-emerald-600">Invoices</p><p className="mt-1 text-lg font-bold text-slate-900">{outsideStats.invoices}</p></div>
            <div className="rounded-xl bg-slate-50 px-4 py-3"><p className="text-[11px] font-semibold uppercase text-slate-500">Items Sold</p><p className="mt-1 text-lg font-bold text-slate-900">{outsideStats.items}</p></div>
            <div className="rounded-xl bg-emerald-50 px-4 py-3"><p className="text-[11px] font-semibold uppercase text-emerald-600">Revenue</p><p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(outsideStats.revenue, currency)}</p></div>
            <div className="rounded-xl bg-blue-50 px-4 py-3"><p className="text-[11px] font-semibold uppercase text-blue-600">This Month</p><p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(outsideStats.monthRevenue, currency)}</p></div>
          </div>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-slate-200"><div className="border-b border-slate-100 bg-slate-50 px-4 py-3"><h3 className="font-semibold text-slate-900">Product-wise Outside Sales</h3><p className="text-xs text-slate-500">Which product sold, how much, and for how much.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-sm"><thead><tr className="border-b border-slate-100 text-left"><th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Product</th><th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Qty</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Revenue</th></tr></thead><tbody>{pagedOutsideProducts.length ? pagedOutsideProducts.map((item) => (<tr key={item.name} className="border-b border-slate-100 last:border-0"><td className="px-4 py-3 font-medium text-slate-800">{item.name}</td><td className="px-4 py-3 text-center font-semibold text-slate-700">{item.quantity}</td><td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(item.revenue, currency)}</td></tr>)) : <tr><td colSpan="3" className="px-4 py-8 text-center text-sm text-slate-400">No outside sales recorded yet.</td></tr>}</tbody></table></div><Pagination page={outsidePage} pageSize={outsidePageSize} total={outsideProducts.length} onPageChange={setOutsidePage} onPageSizeChange={setOutsidePageSize} storageKey="dashboard-outside-products" /></div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-slate-900">Outside Sale Mix</h3><p className="mt-1 text-xs text-slate-500">Outside sales are counted in revenue analysis without reducing inventory stock.</p><div className="mt-5 space-y-3"><div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span className="text-sm text-slate-500">Average invoice</span><span className="font-bold text-slate-900">{formatCurrency(outsideStats.invoices ? outsideStats.revenue / outsideStats.invoices : 0, currency)}</span></div><div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span className="text-sm text-slate-500">Average / item</span><span className="font-bold text-slate-900">{formatCurrency(outsideStats.items ? outsideStats.revenue / outsideStats.items : 0, currency)}</span></div><div className="flex items-center justify-between rounded-xl bg-white px-4 py-3"><span className="text-sm text-slate-500">Revenue share</span><span className="font-bold text-emerald-600">{displayStats.totalSales ? `${((outsideStats.revenue / displayStats.totalSales) * 100).toFixed(1)}%` : '0.0%'}</span></div></div></div>
        </div>
      </section>
    </div>
  );
}