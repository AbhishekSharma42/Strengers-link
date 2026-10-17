export const num = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// =====================================================
// STOCK STATUS
// =====================================================

export function stockStatus(stock, min) {
  const s = num(stock);
  const m = num(min);

  if (s <= 0) {
    return "Out of Stock";
  }

  if (s <= m) {
    return "Low Stock";
  }

  return "In Stock";
}

// =====================================================
// SALE TOTAL
// =====================================================

export function calculateSaleTotal(
  quantity,
  price,
  discount = 0
) {
  return Math.max(
    0,
    num(quantity) * num(price) -
      num(discount)
  );
}

// =====================================================
// PROFIT
// =====================================================

export function calculateProfit(
  sale,
  product
) {
  const sellingPrice =
    num(sale?.sellingPrice);

  const purchasePrice =
    num(
      product?.purchasePrice
    );

  const quantity =
    num(sale?.quantity);

  const discount =
    num(sale?.discount);

  return Math.max(
    0,
    (
      sellingPrice -
      purchasePrice
    ) *
      quantity -
      discount
  );
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export function dashboardStats(
  products = [],
  sales = []
) {
  const safeProducts =
    Array.isArray(products)
      ? products
      : [];

  const safeSales =
    Array.isArray(sales)
      ? sales
      : [];

  // ===================================================
  // TOTAL PRODUCTS
  // ===================================================

  const totalProducts =
    safeProducts.length;

  // ===================================================
  // TOTAL CATEGORIES
  // ===================================================

  const totalCategories =
    new Set(
      safeProducts
        .map(
          (product) =>
            String(
              product?.category || ""
            ).trim()
        )
        .filter(Boolean)
    ).size;

  // ===================================================
  // CURRENT STOCK
  // ===================================================

  const totalStock =
    safeProducts.reduce(
      (total, product) =>
        total +
        num(
          product?.currentStock
        ),
      0
    );

  // ===================================================
  // ITEMS SOLD
  //
  // IMPORTANT:
  // Google Sheets Sales sheet uses quantity
  // ===================================================

  const totalSold =
    safeSales.reduce(
      (total, sale) =>
        total +
        num(sale?.quantity),
      0
    );

  // ===================================================
  // TOTAL SALES
  //
  // New Code.gs stores amount in "total"
  // ===================================================

  const totalSales =
    safeSales.reduce(
      (total, sale) => {
        const amount =
          sale?.total ??
          sale?.totalAmount ??
          0;

        return (
          total +
          num(amount)
        );
      },
      0
    );

  // ===================================================
  // TODAY
  // ===================================================

  const today =
    new Date();

  const todayStart =
    new Date(today);

  todayStart.setHours(
    0,
    0,
    0,
    0
  );

  const tomorrow =
    new Date(todayStart);

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  // ===================================================
  // MONTH
  // ===================================================

  const currentMonth =
    today.getMonth();

  const currentYear =
    today.getFullYear();

  // ===================================================
  // TODAY'S SALES
  // ===================================================

  const todaysSales =
    safeSales.reduce(
      (total, sale) => {
        const saleDate =
          sale?.saleDate ||
          sale?.date ||
          sale?.createdAt;

        if (!saleDate) {
          return total;
        }

        const date =
          new Date(saleDate);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return total;
        }

        if (
          date >= todayStart &&
          date < tomorrow
        ) {
          const amount =
            sale?.total ??
            sale?.totalAmount ??
            0;

          return (
            total +
            num(amount)
          );
        }

        return total;
      },
      0
    );

  // ===================================================
  // MONTHLY SALES
  // ===================================================

  const monthlySales =
    safeSales.reduce(
      (total, sale) => {
        const saleDate =
          sale?.saleDate ||
          sale?.date ||
          sale?.createdAt;

        if (!saleDate) {
          return total;
        }

        const date =
          new Date(saleDate);

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          return total;
        }

        if (
          date.getMonth() ===
            currentMonth &&
          date.getFullYear() ===
            currentYear
        ) {
          const amount =
            sale?.total ??
            sale?.totalAmount ??
            0;

          return (
            total +
            num(amount)
          );
        }

        return total;
      },
      0
    );

  // ===================================================
  // TOTAL PROFIT
  // ===================================================

  const totalProfit =
    safeSales.reduce(
      (total, sale) => {
        const product =
          safeProducts.find(
            (product) =>
              String(
                product?.productId
              ) ===
              String(
                sale?.productId
              )
          );

        if (!product) {
          return total;
        }

        return (
          total +
          calculateProfit(
            sale,
            product
          )
        );
      },
      0
    );

  // ===================================================
  // LOW STOCK PRODUCTS
  // ===================================================

  const lowStockProducts =
    safeProducts.filter(
      (product) => {
        const currentStock =
          num(
            product?.currentStock
          );

        const minimumStock =
          num(
            product?.minStock ??
              product?.minimumStock
          );

        return (
          currentStock <=
          minimumStock
        );
      }
    );

  // ===================================================
  // LOW STOCK COUNT
  // ===================================================

  const lowStock =
    lowStockProducts.length;

  // ===================================================
  // RETURN ALL STATS
  // ===================================================

  return {
    totalProducts,

    totalCategories,

    totalStock,

    totalSold,

    remainingStock:
      totalStock,

    totalSales,

    totalProfit,

    todaysSales,

    monthlySales,

    lowStock,

    lowStockProducts,
  };
}