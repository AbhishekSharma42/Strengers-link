import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Package,
  IndianRupee,
  CalendarDays,
  AlertTriangle,
  ShoppingCart,
  Layers3,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useStore } from "../context/StoreContext";
import { formatCurrency } from "../utils/formatCurrency";
import Pagination from "../components/Pagination";

export default function Reports() {
  const {
    sales = [],
    products = [],
    settings = {},
  } = useStore();

  const [range, setRange] = useState("all");

  /* =====================================================
     SAFE NUMBER
  ===================================================== */

  const num = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  /* =====================================================
     SAFE DATE
  ===================================================== */

  const getSaleDate = (sale) => {
    const value =
      sale?.saleDate ||
      sale?.date ||
      sale?.createdAt;

    if (!value) return null;

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date;
  };

  /* =====================================================
     SALE TOTAL
  ===================================================== */

  const getSaleTotal = (sale) => {
    if (
      sale?.totalAmount !== undefined &&
      sale?.totalAmount !== ""
    ) {
      return num(sale.totalAmount);
    }

    if (
      sale?.total !== undefined &&
      sale?.total !== ""
    ) {
      return num(sale.total);
    }

    const quantity = num(sale?.quantity);
    const price = num(sale?.sellingPrice);
    const discount = num(sale?.discount);

    return Math.max(
      0,
      quantity * price - discount
    );
  };

  /* =====================================================
     FILTER SALES
  ===================================================== */

  const filteredSales = useMemo(() => {
    if (range === "all") {
      return sales;
    }

    const now = new Date();
    let startDate = new Date(now);

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "7days") {
      startDate.setDate(
        now.getDate() - 6
      );
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "30days") {
      startDate.setDate(
        now.getDate() - 29
      );
      startDate.setHours(0, 0, 0, 0);
    }

    if (range === "month") {
      startDate = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );
    }

    return sales.filter((sale) => {
      const date = getSaleDate(sale);

      if (!date) return false;

      return date >= startDate;
    });
  }, [sales, range]);

  const outsideSales = useMemo(() => filteredSales.filter(s => String(s?.saleType || "").toLowerCase() === "outside sale"), [filteredSales]);
  const outsideInvoices = useMemo(() => new Set(outsideSales.map(s=>s.invoiceNo||s.saleId)).size,[outsideSales]);
  const outsideItems = useMemo(() => outsideSales.reduce((t,s)=>t+num(s.quantity),0),[outsideSales]);
  const outsideRevenue = useMemo(() => outsideSales.reduce((t,s)=>t+getSaleTotal(s),0),[outsideSales]);
  const [outsidePageSize, setOutsidePageSize] = useState(() => { const n=Number(localStorage.getItem("page-size:reports-outside-sales")); return [10,20,50].includes(n)?n:10; });
  const [outsidePage, setOutsidePage] = useState(1);
  useEffect(()=>{localStorage.setItem("page-size:reports-outside-sales",String(outsidePageSize));setOutsidePage(1)},[outsidePageSize]);
  useEffect(()=>{const max=Math.max(1,Math.ceil(outsideSales.length/outsidePageSize));if(outsidePage>max)setOutsidePage(max)},[outsideSales.length,outsidePageSize,outsidePage]);
  const pagedOutsideSales = useMemo(()=>outsideSales.slice((outsidePage-1)*outsidePageSize,outsidePage*outsidePageSize),[outsideSales,outsidePage,outsidePageSize]);

  /* =====================================================
     TOTAL SALES
  ===================================================== */

  const totalSales = useMemo(() => {
    return filteredSales.reduce(
      (total, sale) =>
        total + getSaleTotal(sale),
      0
    );
  }, [filteredSales]);

  /* =====================================================
     TOTAL ITEMS SOLD
  ===================================================== */

  const totalItemsSold = useMemo(() => {
    return filteredSales.reduce(
      (total, sale) =>
        total + num(sale?.quantity),
      0
    );
  }, [filteredSales]);

  /* =====================================================
     CATEGORY SALES
  ===================================================== */

  const categorySales = useMemo(() => {
    const map = {};

    filteredSales.forEach((sale) => {
      const product = products.find(
        (p) =>
          String(p?.productId) ===
          String(sale?.productId)
      );

      const category =
        sale?.category ||
        product?.category ||
        "Uncategorized";

      if (!map[category]) {
        map[category] = {
          category,
          sales: 0,
          items: 0,
        };
      }

      map[category].sales +=
        getSaleTotal(sale);

      map[category].items +=
        num(sale?.quantity);
    });

    return Object.values(map).sort(
      (a, b) => b.sales - a.sales
    );
  }, [filteredSales, products]);

  /* =====================================================
     DAILY SALES
  ===================================================== */

  const dailySales = useMemo(() => {
    const map = {};

    filteredSales.forEach((sale) => {
      const date = getSaleDate(sale);

      if (!date) return;

      const key = date
        .toISOString()
        .slice(0, 10);

      if (!map[key]) {
        map[key] = {
          date: key,
          sales: 0,
          items: 0,
        };
      }

      map[key].sales +=
        getSaleTotal(sale);

      map[key].items +=
        num(sale?.quantity);
    });

    return Object.values(map)
      .sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      )
      .map((item) => ({
        ...item,
        name: new Date(
          item.date
        ).toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        ),
      }));
  }, [filteredSales]);

  /* =====================================================
     TOP PRODUCTS
  ===================================================== */

  const topProducts = useMemo(() => {
    const map = {};

    filteredSales.forEach((sale) => {
      const productId =
        sale?.productId ||
        sale?.productName ||
        "unknown";

      const product = products.find(
        (p) =>
          String(p?.productId) ===
          String(sale?.productId)
      );

      const name =
        sale?.productName ||
        product?.productName ||
        "Unknown Product";

      if (!map[productId]) {
        map[productId] = {
          productId,
          productName: name,
          quantity: 0,
          sales: 0,
        };
      }

      map[productId].quantity +=
        num(sale?.quantity);

      map[productId].sales +=
        getSaleTotal(sale);
    });

    return Object.values(map)
      .sort(
        (a, b) => b.sales - a.sales
      )
      .slice(0, 10);
  }, [filteredSales, products]);

  /* =====================================================
     LOW STOCK
  ===================================================== */

  const lowStockProducts = useMemo(() => {
    return products
      .map((product) => {
        const currentStock = num(
          product?.currentStock
        );

        const minimumStock = num(
          product?.minStock ??
            product?.minimumStock ??
            0
        );

        return {
          ...product,
          currentStock,
          minimumStock,
        };
      })
      .filter(
        (product) =>
          product.currentStock <=
          product.minimumStock
      )
      .sort(
        (a, b) =>
          a.currentStock -
          b.currentStock
      );
  }, [products]);

  /* =====================================================
     CURRENCY
  ===================================================== */

  const currency =
    settings?.currency || "INR";

  /* =====================================================
     MAX VALUES
  ===================================================== */

  const maxCategorySales = Math.max(
    ...categorySales.map(
      (item) => item.sales
    ),
    1
  );

  const maxProductSales = Math.max(
    ...topProducts.map(
      (item) => item.sales
    ),
    1
  );

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="space-y-6 pb-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <BarChart3 size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Sales Reports
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Analyze sales, products and inventory performance.
              </p>
            </div>

          </div>
        </div>

        <div className="relative">

          <CalendarDays
            size={17}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <select
            value={range}
            onChange={(event) =>
              setRange(event.target.value)
            }
            className="h-11 min-w-[170px] appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm font-semibold text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
          >
            <option value="all">
              All Time
            </option>

            <option value="today">
              Today
            </option>

            <option value="7days">
              Last 7 Days
            </option>

            <option value="30days">
              Last 30 Days
            </option>

            <option value="month">
              This Month
            </option>
          </select>

        </div>

      </div>

      {/* =================================================
          SUMMARY CARDS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <ReportCard
          title="Total Sales"
          value={formatCurrency(
            totalSales,
            currency
          )}
          subtitle={
            filteredSales.length +
            " transactions"
          }
          icon={IndianRupee}
          iconClass="bg-blue-100 text-blue-600"
        />

        <ReportCard
          title="Items Sold"
          value={totalItemsSold}
          subtitle="Total units sold"
          icon={ShoppingCart}
          iconClass="bg-emerald-100 text-emerald-600"
        />

        <ReportCard
          title="Categories Sold"
          value={categorySales.length}
          subtitle="Active categories"
          icon={Layers3}
          iconClass="bg-violet-100 text-violet-600"
        />

        <ReportCard
          title="Low Stock"
          value={lowStockProducts.length}
          subtitle="Need attention"
          icon={AlertTriangle}
          iconClass="bg-orange-100 text-orange-600"
        />

      </div>

      {/* =================================================
          SALES OVERVIEW
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-2 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Sales Overview
            </h2>

            <p className="text-xs text-slate-500">
              Revenue generated during selected period.
            </p>
          </div>

          <div className="w-fit rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
            {filteredSales.length} Transactions
          </div>

        </div>

        {dailySales.length === 0 ? (

          <Empty text="No sales data available." />

        ) : (

          <div className="h-[320px] w-full p-4 sm:p-5">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={dailySales}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  tick={{
                    fontSize: 12,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  cursor={{
                    fill: "rgba(148,163,184,0.08)",
                  }}
                  formatter={(value) =>
                    formatCurrency(
                      value,
                      currency
                    )
                  }
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow:
                      "0 10px 30px rgba(15,23,42,0.10)",
                  }}
                />

                <Bar
                  dataKey="sales"
                  radius={[
                    7,
                    7,
                    2,
                    2,
                  ]}
                  maxBarSize={42}
                />

              </BarChart>
            </ResponsiveContainer>

          </div>

        )}

      </section>

      {/* =================================================
          CATEGORY + TOP PRODUCTS
      ================================================= */}

      <div className="grid items-start gap-6 xl:grid-cols-2">

        {/* =================================================
            CATEGORY SALES
        ================================================= */}

        <section className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Category Sales
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Revenue performance by category.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Layers3 size={19} />
            </div>

          </div>

          {categorySales.length === 0 ? (

            <Empty text="No category sales found." />

          ) : (

            <div className="space-y-3">

              {categorySales.map(
                (item, index) => {

                  const percentage =
                    Math.min(
                      (item.sales /
                        maxCategorySales) *
                        100,
                      100
                    );

                  return (
                    <div
                      key={item.category}
                      className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-slate-500 shadow-sm">
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-3">

                            <div className="min-w-0">

                              <p className="truncate font-semibold text-slate-800">
                                {item.category}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-500">
                                {item.items} items sold
                              </p>

                            </div>

                            <p className="shrink-0 text-sm font-bold text-slate-900">
                              {formatCurrency(
                                item.sales,
                                currency
                              )}
                            </p>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className="h-full rounded-full bg-violet-500 transition-all duration-500"
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            TOP SELLING PRODUCTS
        ================================================= */}

        <section className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Top Selling Products
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Best performing products.
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <TrendingUp size={19} />
            </div>

          </div>

          {topProducts.length === 0 ? (

            <Empty text="No product sales found." />

          ) : (

            <div className="space-y-3">

              {topProducts.map(
                (item, index) => {

                  const percentage =
                    Math.min(
                      (item.sales /
                        maxProductSales) *
                        100,
                      100
                    );

                  return (
                    <div
                      key={item.productId}
                      className="rounded-xl border border-slate-100 p-3.5 transition hover:border-slate-200 hover:bg-slate-50"
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                            index === 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {index + 1}
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex items-center justify-between gap-3">

                            <p className="truncate font-semibold text-slate-800">
                              {item.productName}
                            </p>

                            <span className="shrink-0 text-sm font-bold text-slate-900">
                              {formatCurrency(
                                item.sales,
                                currency
                              )}
                            </span>

                          </div>

                          <div className="mt-1 flex items-center justify-between">

                            <span className="text-xs text-slate-500">
                              {item.quantity} units sold
                            </span>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                              style={{
                                width:
                                  `${percentage}%`,
                              }}
                            />

                          </div>

                        </div>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          )}

        </section>

      </div>

      {/* =================================================
          LOW STOCK
      ================================================= */}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <AlertTriangle size={20} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Low Stock Products
              </h2>

              <p className="text-xs text-slate-500">
                Products that need restocking.
              </p>
            </div>

          </div>

          {lowStockProducts.length > 0 && (
            <span className="w-fit rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
              {lowStockProducts.length} Products
            </span>
          )}

        </div>

        {lowStockProducts.length === 0 ? (

          <div className="p-8 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Package size={25} />
            </div>

            <p className="mt-3 font-semibold text-slate-700">
              Inventory looks good
            </p>

            <p className="mt-1 text-xs text-slate-400">
              No products are currently below minimum stock.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full min-w-[700px] text-sm">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left">

                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Product
                  </th>

                  <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                    Category
                  </th>

                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    Current
                  </th>

                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    Minimum
                  </th>

                  <th className="px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody>

                {lowStockProducts.map(
                  (product) => {

                    const outOfStock =
                      product.currentStock <= 0;

                    return (
                      <tr
                        key={
                          product.productId
                        }
                        className="border-b border-slate-100 last:border-0 transition hover:bg-slate-50"
                      >

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                              <Package size={17} />
                            </div>

                            <div>

                              <p className="font-semibold text-slate-800">
                                {product.productName ||
                                  "-"}
                              </p>

                              {product.sku && (
                                <p className="text-xs text-slate-400">
                                  SKU:{" "}
                                  {product.sku}
                                </p>
                              )}

                            </div>

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {product.category ||
                              "-"}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center">

                          <span
                            className={
                              `font-bold ${
                                outOfStock
                                  ? "text-red-600"
                                  : "text-orange-600"
                              }`
                            }
                          >
                            {
                              product.currentStock
                            }
                          </span>

                        </td>

                        <td className="px-5 py-4 text-center font-semibold text-slate-700">
                          {
                            product.minimumStock
                          }
                        </td>

                        <td className="px-5 py-4 text-center">

                          {outOfStock ? (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                              Out of Stock
                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold text-orange-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                              Low Stock
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      <section className="reports-outside-section rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="text-lg font-bold text-slate-900">Outside Sale Report</h2><p className="mt-0.5 text-xs text-slate-500">Outside sales for the selected reporting period.</p></div><div className="grid grid-cols-3 gap-3"><div className="rounded-xl bg-white px-4 py-3"><p className="text-[11px] font-semibold uppercase text-slate-400">Invoices</p><p className="text-lg font-bold">{outsideInvoices}</p></div><div className="rounded-xl bg-white px-4 py-3"><p className="text-[11px] font-semibold uppercase text-slate-400">Items</p><p className="text-lg font-bold">{outsideItems}</p></div><div className="rounded-xl bg-white px-4 py-3"><p className="text-[11px] font-semibold uppercase text-slate-400">Revenue</p><p className="text-lg font-bold">{formatCurrency(outsideRevenue,settings?.currency||"INR")}</p></div></div></div><div className="reports-table-wrap mt-5 overflow-x-auto rounded-xl border border-emerald-100 bg-white"><table className="w-full min-w-[760px] text-sm"><thead><tr className="reports-table-head bg-slate-50 text-left"><th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Invoice</th><th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Product</th><th className="px-4 py-3 text-center text-xs font-bold uppercase text-slate-500">Qty</th><th className="px-4 py-3 text-right text-xs font-bold uppercase text-slate-500">Amount</th><th className="px-4 py-3 text-xs font-bold uppercase text-slate-500">Payment</th></tr></thead><tbody>{outsideSales.length?pagedOutsideSales.map((sale,i)=><tr key={`${sale.invoiceNo}-${sale.productId}-${i}`} className="reports-table-row border-t border-slate-100"><td className="px-4 py-3 font-semibold">{sale.invoiceNo||sale.saleId||"-"}</td><td className="px-4 py-3">{sale.productName||"-"}</td><td className="px-4 py-3 text-center">{num(sale.quantity)}</td><td className="px-4 py-3 text-right font-semibold">{formatCurrency(getSaleTotal(sale),settings?.currency||"INR")}</td><td className="px-4 py-3">{sale.paymentMethod||"Cash"}</td></tr>):<tr><td colSpan="5" className="px-4 py-8 text-center text-slate-400">No outside sales for this period.</td></tr>}</tbody></table></div><Pagination page={outsidePage} pageSize={outsidePageSize} total={outsideSales.length} onPageChange={setOutsidePage} onPageSizeChange={setOutsidePageSize} storageKey="reports-outside-sales" /></section>
    </div>
  );
}

/* =====================================================
   REPORT CARD
===================================================== */

function ReportCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
}) {
  return (
    <div className="reports-card group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {subtitle}
          </p>

        </div>

        <div
          className={
            `shrink-0 rounded-xl p-3 ${iconClass}`
          }
        >
          <Icon size={21} />
        </div>

      </div>

    </div>
  );
}

/* =====================================================
   EMPTY STATE
===================================================== */

function Empty({ text }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center p-6 text-center">

      <div>

        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
          <BarChart3
            size={21}
            className="text-slate-400"
          />
        </div>

        <p className="mt-3 text-sm font-medium text-slate-500">
          {text}
        </p>

      </div>



    </div>
  );
}