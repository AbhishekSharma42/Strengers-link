export default function Invoice({ sale, settings, compact = false }) {
  if (!sale) return null;

  const items = sale.items?.length ? sale.items : [sale];

  /* =====================================================
     DATE FORMAT
  ===================================================== */

  const formatDate = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (
      Number.isNaN(d.getTime()) ||
      d.getFullYear() < 2000
    ) {
      return "-";
    }

    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  /* =====================================================
     TIME FORMAT
  ===================================================== */

  const formatTime = (value) => {
    if (!value) return "-";

    /*
     * Google Sheets time-only value
     * Example:
     * 1899-12-30T09:53:47.000Z
     */

    if (
      typeof value === "string" &&
      (value.includes("1899") ||
        value.includes("1900"))
    ) {
      const match = value.match(
        /T(\d{2}:\d{2}(?::\d{2})?)/
      );

      return match ? match[1] : "-";
    }

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return value;
    }

    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  /* =====================================================
     BASIC DATA
  ===================================================== */

  const invoiceNo =
    sale.invoiceNo ||
    sale.saleId ||
    "-";

  const date =
    sale.date ||
    sale.saleDate;

  const time =
    sale.time ||
    sale.saleTime ||
    date;

  /* =====================================================
     CALCULATIONS
  ===================================================== */

  const subtotal = items.reduce(
    (sum, item) => {
      const qty =
        Number(item.quantity) || 0;

      const price =
        Number(item.sellingPrice) || 0;

      return sum + qty * price;
    },
    0
  );

  // Outside Sale uses one bill-level discount. New Sale keeps its
  // existing per-line discount behavior.
  const isOutsideSale = String(sale.saleType || "").toLowerCase() === "outside sale";
  const discount = isOutsideSale
    ? Math.min(subtotal, Math.max(0, Number(sale.discount) || 0))
    : items.reduce(
        (sum, item) => sum + (Number(item.discount) || 0),
        0
      );

  const calculatedTotal = Math.max(
    0,
    subtotal - discount
  );

  const grandTotal =
    sale.total ??
    sale.totalAmount ??
    calculatedTotal;

  /* =====================================================
     CURRENCY FORMAT
  ===================================================== */

  const formatMoney = (value) => {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  return (
    <div
      id="invoice"
      className={`invoice-container mx-auto w-full max-w-3xl bg-white text-slate-900 font-mono ${compact ? "p-3 text-[9px] leading-tight" : "p-8"}`}
    >

      {/* =================================================
          SHOP HEADER
      ================================================= */}

      <div className="border-b-2 border-slate-800 pb-5">

        <div className="text-center">

          <h1 className={`${compact ? "text-base" : "text-3xl"} font-bold tracking-wide break-words`}>
            {settings?.storeName ||
              "My Store"}
          </h1>

          {settings?.ownerName && (
            <p className={`mt-1 ${compact ? "text-[8px]" : "text-sm"} text-slate-600 break-words`}>
              Owner: {settings.ownerName}
            </p>
          )}

          {settings?.storeAddress && (
            <p className={`mt-2 whitespace-pre-line ${compact ? "text-[8px]" : "text-sm"} text-slate-600 break-words`}>
              {settings.storeAddress}
            </p>
          )}

          <div className={`mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 ${compact ? "text-[7px]" : "text-sm"}`}>

            {settings?.phone && (
              <span>
                <b>Mobile:</b>{" "}
                {settings.phone}
              </span>
            )}

            {settings?.email && (
              <span>
                <b>Email:</b>{" "}
                {settings.email}
              </span>
            )}

          </div>

          {settings?.gstNumber && (
            <p className={`mt-2 ${compact ? "text-[8px]" : "text-sm"} font-semibold break-words`}>
              GSTIN: {settings.gstNumber}
            </p>
          )}

        </div>

      </div>

      {/* =================================================
          INVOICE INFORMATION
      ================================================= */}

      <div className={`grid grid-cols-2 ${compact ? "gap-2 py-2 text-[8px]" : "gap-8 py-5 text-sm"} border-b`}>

        {/* LEFT */}

        <div className="space-y-1">

          <div>
            <span className="font-semibold">
              Invoice No:
            </span>{" "}
            {invoiceNo}
          </div>

          <div>
            <span className="font-semibold">
              Date:
            </span>{" "}
            {formatDate(date)}
          </div>

          <div>
            <span className="font-semibold">
              Time:
            </span>{" "}
            {formatTime(time)}
          </div>

        </div>

        {/* RIGHT */}

        <div className="text-right space-y-1">

          <div>
            <span className="font-semibold">
              Payment:
            </span>{" "}
            {sale.paymentMethod ||
              "Cash"}
          </div>

          <div>
            <span className="font-semibold">
              Customer:
            </span>{" "}
            {sale.customerName ||
              "Walk-in Customer"}
          </div>

          {sale.customerPhone && (
            <div>
              <span className="font-semibold">
                Mobile:
              </span>{" "}
              {sale.customerPhone}
            </div>
          )}

        </div>

      </div>

      {/* =================================================
          ITEMS TABLE
      ================================================= */}

      <div className={compact ? "py-3" : "py-6"}>

        <table
          className="w-full border-collapse text-[inherit]"
          style={{
            tableLayout: "fixed",
          }}
        >

          <thead>

            <tr className="border-b-2 border-slate-800">

              <th
                className={`${compact ? "w-[5%] py-2" : "w-[6%] py-3"} text-left`}
              >
                #
              </th>

              <th
                className={`${compact ? "w-[40%] py-2" : "w-[34%] py-3"} text-left break-words`}
              >
                Item Name
              </th>

              <th
                className={`${compact ? "w-[9%] py-2" : "w-[10%] py-3"} text-center`}
              >
                Qty
              </th>

              <th
                className={`${compact ? "w-[15%] py-2" : "w-[16%] py-3"} text-right whitespace-nowrap`}
              >
                Price
              </th>

              <th
                className={`${compact ? "w-[15%] py-2" : "w-[16%] py-3"} text-right whitespace-nowrap`}
              >
                Discount
              </th>

              <th
                className={`${compact ? "w-[16%] py-2" : "w-[18%] py-3"} text-right whitespace-nowrap`}
              >
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map(
              (item, index) => {

                const qty =
                  Number(
                    item.quantity || 0
                  );

                const price =
                  Number(
                    item.sellingPrice || 0
                  );

                const itemDiscount = isOutsideSale
                  ? 0
                  : Number(item.discount || 0);

                const calculatedItemTotal =
                  Math.max(
                    0,
                    qty * price -
                      itemDiscount
                  );

                const total =
                  item.total ??
                  item.totalAmount ??
                  calculatedItemTotal;

                return (
                  <tr
                    key={
                      item.productId ||
                      index
                    }
                    className="border-b border-slate-200"
                  >

                    {/* NUMBER */}

                    <td className={compact ? "py-2 align-top" : "py-3 align-top"}>
                      {index + 1}
                    </td>

                    {/* PRODUCT */}

                    <td className={compact ? "py-1 pr-1 align-top break-words" : "py-3 pr-2 align-top"}>

                      <div className="break-words font-semibold">
                        {item.productName ||
                          "-"}
                      </div>

                      {item.sku && (
                        <div className="mt-0.5 text-[9px] text-slate-400 break-words">
                          SKU: {item.sku}
                        </div>
                      )}

                    </td>

                    {/* QTY */}

                    <td className={compact ? "py-1 text-center align-top" : "py-3 text-center align-top"}>
                      {qty}
                    </td>

                    {/* PRICE */}

                    <td className={compact ? "py-1 text-right align-top whitespace-nowrap" : "py-3 text-right align-top whitespace-nowrap"}>
                      {formatMoney(price)}
                    </td>

                    {/* DISCOUNT */}

                    <td className={compact ? "py-1 text-right align-top whitespace-nowrap" : "py-3 text-right align-top whitespace-nowrap"}>
                      {formatMoney(
                        itemDiscount
                      )}
                    </td>

                    {/* TOTAL */}

                    <td className={compact ? "py-2 text-right align-top whitespace-nowrap font-semibold" : "py-3 text-right align-top whitespace-nowrap font-semibold"}>
                      {formatMoney(total)}
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      {/* =================================================
          BILL SUMMARY
      ================================================= */}

      <div className="flex justify-end">

        <div
          className={compact ? "w-full sm:w-[220px]" : "w-full sm:w-[340px]"}
          style={{
            marginLeft: "auto",
          }}
        >

          {/* SUBTOTAL */}

          <div
            className="grid grid-cols-[1fr_130px] items-center border-b border-slate-200 py-2"
          >

            <span className={`text-left ${compact ? "text-[8px]" : "text-sm"} text-slate-600`}>
              Subtotal
            </span>

            <span className={`text-right ${compact ? "text-[8px]" : "text-sm"} font-medium whitespace-nowrap`}>
              {formatMoney(subtotal)}
            </span>

          </div>

          {/* DISCOUNT */}

          <div
            className="grid grid-cols-[1fr_130px] items-center border-b border-slate-200 py-2"
          >

            <span className={`text-left ${compact ? "text-[8px]" : "text-sm"} text-slate-600`}>
              Discount
            </span>

            <span className={`text-right ${compact ? "text-[8px]" : "text-sm"} font-medium whitespace-nowrap`}>
              - {formatMoney(discount)}
            </span>

          </div>

          {/* GRAND TOTAL */}

          <div
            className="mt-2 grid grid-cols-[1fr_150px] items-center rounded-lg bg-slate-900 px-4 py-4"
          >

            <span className="text-left text-base font-bold text-white">
              Grand Total
            </span>

            <span className="text-right text-xl font-bold text-white whitespace-nowrap">
              {formatMoney(
                grandTotal
              )}
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          PAYMENT / THANK YOU
      ================================================= */}

      <div className={`border-t border-slate-200 text-center ${compact ? "mt-4 pt-3" : "mt-8 pt-5"}`}>

        <p className={`${compact ? "text-[8px]" : "text-sm"} font-semibold text-slate-700`}>
          Thank you for shopping with us!
        </p>

        <p className="mt-0.5 text-[9px] text-slate-500">
          Please visit again.
        </p>

      </div>

      {/* =================================================
          PRINT CSS
      ================================================= */}

      <style>
        {`
          @media print {

            #invoice {
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 20px !important;
              background: white !important;
            }

            #invoice table {
              width: 100% !important;
              table-layout: fixed !important;
            }

            #invoice th,
            #invoice td {
              vertical-align: top;
            }

            #invoice .invoice-container {
              width: 100%;
            }

            body {
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        `}
      </style>

    </div>
  );
}