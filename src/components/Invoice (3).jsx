export default function Invoice({ sale, settings }) {
  if (!sale) return null;

  const items = sale.items?.length
    ? sale.items
    : [sale];

  const formatDate = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (
      Number.isNaN(d.getTime()) ||
      d.getFullYear() < 2000
    ) {
      return "-";
    }

    return d.toLocaleDateString("en-IN");
  };

  const formatTime = (value) => {
    if (!value) return "-";

    /*
     * Google Sheets time-only value
     * जैसे:
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

    return d.toLocaleTimeString("en-IN");
  };

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

  const subtotal = items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.sellingPrice || 0),
    0
  );

  const discount = items.reduce(
    (sum, item) =>
      sum + Number(item.discount || 0),
    0
  );

  const grandTotal =
    sale.total ??
    sale.totalAmount ??
    items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.total ??
            item.totalAmount ??
            0
        ),
      0
    );

  return (
    <div
      id="invoice"
      className="mx-auto max-w-3xl bg-white p-8 text-slate-900"
    >

      {/* SHOP HEADER */}

      <div className="border-b pb-5">

        <div className="text-center">

          <h1 className="text-3xl font-bold">
            {settings?.storeName ||
              "My Store"}
          </h1>

          {settings?.ownerName && (
            <p className="mt-1 text-sm">
              Owner: {settings.ownerName}
            </p>
          )}

          {settings?.storeAddress && (
            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">
              {settings.storeAddress}
            </p>
          )}

          {settings?.phone && (
            <p className="text-sm">
              Mobile: {settings.phone}
            </p>
          )}

          {settings?.email && (
            <p className="text-sm">
              Email: {settings.email}
            </p>
          )}

          {settings?.gstNumber && (
            <p className="mt-1 text-sm font-semibold">
              GSTIN: {settings.gstNumber}
            </p>
          )}

        </div>

      </div>

      {/* INVOICE INFORMATION */}

      <div className="grid grid-cols-2 gap-4 border-b py-5 text-sm">

        <div>
          <p>
            <b>Invoice No:</b>{" "}
            {invoiceNo}
          </p>

          <p>
            <b>Date:</b>{" "}
            {formatDate(date)}
          </p>

          <p>
            <b>Time:</b>{" "}
            {formatTime(time)}
          </p>
        </div>

        <div className="text-right">

          <p>
            <b>Payment:</b>{" "}
            {sale.paymentMethod ||
              "Cash"}
          </p>

          <p>
            <b>Customer:</b>{" "}
            {sale.customerName ||
              "Walk-in Customer"}
          </p>

          {sale.customerPhone && (
            <p>
              <b>Mobile:</b>{" "}
              {sale.customerPhone}
            </p>
          )}

        </div>

      </div>

      {/* ITEMS TABLE */}

      <div className="py-5">

        <table className="w-full border-collapse">

          <thead>

            <tr className="border-b-2">

              <th className="py-3 text-left">
                #
              </th>

              <th className="py-3 text-left">
                Item Name
              </th>

              <th className="py-3 text-center">
                Qty
              </th>

              <th className="py-3 text-right">
                Price
              </th>

              <th className="py-3 text-right">
                Discount
              </th>

              <th className="py-3 text-right">
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

                const itemDiscount =
                  Number(
                    item.discount || 0
                  );

                const total =
                  Number(
                    item.total ??
                      item.totalAmount ??
                      Math.max(
                        0,
                        qty * price -
                          itemDiscount
                      )
                  );

                return (
                  <tr
                    key={
                      item.productId ||
                      index
                    }
                    className="border-b"
                  >

                    <td className="py-3">
                      {index + 1}
                    </td>

                    <td className="py-3">
                      <b>
                        {item.productName ||
                          "-"}
                      </b>

                      {item.sku && (
                        <div className="text-xs text-slate-400">
                          SKU: {item.sku}
                        </div>
                      )}

                    </td>

                    <td className="py-3 text-center">
                      {qty}
                    </td>

                    <td className="py-3 text-right">
                      ₹
                      {price.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="py-3 text-right">
                      ₹
                      {itemDiscount.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td className="py-3 text-right font-semibold">
                      ₹
                      {total.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                  </tr>
                );
              }
            )}

          </tbody>

        </table>

      </div>

      {/* TOTAL */}

      <div className="ml-auto max-w-sm space-y-2 border-t pt-4">

        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>
            ₹
            {subtotal.toLocaleString(
              "en-IN"
            )}
          </span>
        </div>

        <div className="flex justify-between">

          <span>
            Discount
          </span>

          <span>
            ₹
            {discount.toLocaleString(
              "en-IN"
            )}
          </span>

        </div>

        <div className="flex justify-between border-t pt-3 text-xl font-bold">

          <span>
            Grand Total
          </span>

          <span>
            ₹
            {Number(
              grandTotal || 0
            ).toLocaleString(
              "en-IN"
            )}
          </span>

        </div>

      </div>

      {/* FOOTER */}

      <div className="mt-8 border-t pt-5 text-center text-sm text-slate-500">

        <p>
          Thank you for shopping with us!
        </p>

        <p className="mt-1">
          Please visit again.
        </p>

      </div>

    </div>
  );
}