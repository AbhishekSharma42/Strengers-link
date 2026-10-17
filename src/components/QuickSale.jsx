import { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Package,
  User,
  Phone,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

import { useStore } from "../context/StoreContext";

const createItem = () => ({
  productId: "",
  quantity: 1,
});

export default function QuickSale({
  open,
  onClose,
  onCompleted,
}) {
  const {
    products = [],
    createSale,
    saving,
  } = useStore();

  const [items, setItems] = useState([createItem()]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");

  const searchRef = useRef(null);

  /* =====================================================
     RESET
  ===================================================== */

  useEffect(() => {
    if (open) {
      setItems([createItem()]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("Cash");
      setSearchOpen(null);
      setSearchText("");
      setError("");
    }
  }, [open]);

  /* =====================================================
     OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =====================================================
     PRODUCT FINDER
  ===================================================== */

  function getProduct(productId) {
    if (!productId) return null;

    return products.find(
      (product) =>
        String(product.productId).trim() ===
        String(productId).trim()
    );
  }

  /* =====================================================
     SEARCH PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    let result = products.filter(
      (product) =>
        Number(product.currentStock || 0) > 0
    );

    if (query) {
      result = result.filter((product) => {
        const name = String(
          product.productName || ""
        ).toLowerCase();

        const sku = String(
          product.sku || ""
        ).toLowerCase();

        const category = String(
          product.category || ""
        ).toLowerCase();

        const id = String(
          product.productId || ""
        ).toLowerCase();

        return (
          name.includes(query) ||
          sku.includes(query) ||
          category.includes(query) ||
          id.includes(query)
        );
      });
    }

    return result.slice(0, 100);
  }, [products, searchText]);

  /* =====================================================
     CHANGE PRODUCT
  ===================================================== */

  function selectProduct(index, productId) {
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              productId,
              quantity: 1,
            }
          : item
      )
    );

    setSearchOpen(null);
    setSearchText("");
    setError("");
  }

  /* =====================================================
     CHANGE QUANTITY
  ===================================================== */

  function changeQuantity(index, value) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const product = getProduct(
          item.productId
        );

        const stock =
          Number(product?.currentStock) || 0;

        let quantity = Number(value);

        if (!Number.isFinite(quantity)) {
          quantity = 1;
        }

        quantity = Math.floor(quantity);

        if (quantity < 1) {
          quantity = 1;
        }

        if (stock > 0 && quantity > stock) {
          quantity = stock;
        }

        return {
          ...item,
          quantity,
        };
      })
    );

    setError("");
  }

  function increaseQuantity(index) {
    const item = items[index];

    if (!item) return;

    const product = getProduct(
      item.productId
    );

    if (!product) {
      setError("Please select a product first.");
      return;
    }

    const stock =
      Number(product.currentStock) || 0;

    const current =
      Number(item.quantity) || 1;

    if (current >= stock) {
      setError(
        `${product.productName}: only ${stock} available in stock.`
      );
      return;
    }

    changeQuantity(
      index,
      current + 1
    );
  }

  function decreaseQuantity(index) {
    const item = items[index];

    if (!item) return;

    const current =
      Number(item.quantity) || 1;

    changeQuantity(
      index,
      Math.max(1, current - 1)
    );
  }

  /* =====================================================
     ADD ITEM
  ===================================================== */

  function addItem() {
    setItems((current) => [
      ...current,
      createItem(),
    ]);

    setSearchOpen(null);
    setSearchText("");
    setError("");
  }

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  function removeItem(index) {
    if (items.length === 1) {
      setError(
        "At least one product is required."
      );
      return;
    }

    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );

    setSearchOpen(null);
    setSearchText("");
    setError("");
  }

  /* =====================================================
     TOTALS
  ===================================================== */

  const totals = useMemo(() => {
    let subtotal = 0;
    let quantity = 0;

    items.forEach((item) => {
      const product = getProduct(
        item.productId
      );

      if (!product) return;

      const itemQuantity =
        Number(item.quantity) || 0;

      const price =
        Number(product.sellingPrice) || 0;

      quantity += itemQuantity;
      subtotal +=
        itemQuantity * price;
    });

    return {
      subtotal,
      quantity,
      total: subtotal,
    };
  }, [items, products]);

  /* =====================================================
     CURRENCY
  ===================================================== */

  function currency(value) {
    return `₹${Number(value || 0).toLocaleString(
      "en-IN"
    )}`;
  }

  /* =====================================================
     QUICK SALE INVOICE NUMBER
  ===================================================== */

  function generateQuickSaleInvoice() {
    const now = new Date();

    const year =
      now.getFullYear();

    const month =
      String(now.getMonth() + 1).padStart(
        2,
        "0"
      );

    const day =
      String(now.getDate()).padStart(
        2,
        "0"
      );

    const time =
      String(now.getTime()).slice(-6);

    return `QS-${year}${month}${day}-${time}`;
  }

  /* =====================================================
     SAVE QUICK SALE
  ===================================================== */

  async function submit(event) {
    event.preventDefault();

    if (saving) return;

    setError("");

    const selectedItems = items.filter(
      (item) =>
        item.productId &&
        String(item.productId).trim()
    );

    if (!selectedItems.length) {
      setError(
        "Please select at least one product."
      );
      return;
    }

    try {
      const invoiceNo =
        generateQuickSaleInvoice();

      const now =
        new Date().toISOString();

      const saleProducts =
        selectedItems.map((item) => {
          const product =
            getProduct(item.productId);

          if (!product) {
            throw new Error(
              "Selected product could not be found."
            );
          }

          const quantity =
            Number(item.quantity);

          const stock =
            Number(product.currentStock) || 0;

          const sellingPrice =
            Number(product.sellingPrice) || 0;

          if (quantity <= 0) {
            throw new Error(
              `Invalid quantity for ${product.productName}.`
            );
          }

          if (quantity > stock) {
            throw new Error(
              `${product.productName}: only ${stock} available in stock.`
            );
          }

          return {
            productId:
              product.productId,

            productName:
              product.productName,

            category:
              product.category || "",

            sku:
              product.sku || "",

            quantity,

            sellingPrice,

            discount: 0,

            total:
              quantity * sellingPrice,
          };
        });

      const subtotal =
        saleProducts.reduce(
          (sum, item) =>
            sum +
            Number(item.total || 0),
          0
        );

      const saleId =
        `QS-SALE-${Date.now()}-${Math.floor(
          Math.random() * 99999
        )}`;

      /*
       * IMPORTANT:
       * Existing createSale() is used.
       * No new database/API is introduced.
       */

      const salePayload = {
        saleId,

        invoiceNo,

        saleType: "QUICK_SALE",

        isQuickSale: true,

        quickSale: true,

        saleDate: now,

        date: now,

        saleTime: now,

        customerName:
          customerName.trim(),

        customerPhone:
          customerPhone.trim(),

        paymentMethod,

        products:
          saleProducts,

        subtotal,

        discount: 0,

        total: subtotal,

        totalAmount: subtotal,
      };

      await createSale(
        salePayload
      );

      const invoice = {
        invoiceNo,

        saleId,

        saleType: "QUICK_SALE",

        isQuickSale: true,

        quickSale: true,

        date: now,

        time: now,

        saleDate: now,

        saleTime: now,

        customerName:
          customerName.trim(),

        customerPhone:
          customerPhone.trim(),

        paymentMethod,

        items:
          saleProducts,

        subtotal,

        discount: 0,

        total: subtotal,

        totalAmount: subtotal,
      };

      onCompleted?.(invoice);

      onClose?.();
    } catch (err) {
      console.error(
        "QUICK SALE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Quick Sale save nahi ho saki."
      );
    }
  }

  if (!open) {
    return null;
  }

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">

      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b bg-white px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
              <ShoppingCart
                size={21}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">

                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Quick Sale
                </h2>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                  Fast Billing
                </span>

              </div>

              <p className="text-xs text-slate-500 sm:text-sm">
                Add products directly and generate
                the bill quickly.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <X size={20} />
          </button>

        </div>

        {/* =================================================
            BODY
        ================================================= */}

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">

            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">

              {/* =================================================
                  PRODUCTS
              ================================================= */}

              <div className="space-y-4">

                <div className="flex items-center justify-between">

                  <div>
                    <h3 className="font-bold text-slate-900">
                      Quick Products
                    </h3>

                    <p className="text-xs text-slate-500">
                      Search product and enter quantity.
                    </p>
                  </div>

                  <div className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                    {totals.quantity} items
                  </div>

                </div>

                {/* =================================================
                    ITEM LIST
                ================================================= */}

                <div className="space-y-3">

                  {items.map(
                    (item, index) => {
                      const product =
                        getProduct(
                          item.productId
                        );

                      const price =
                        Number(
                          product?.sellingPrice ||
                            0
                        );

                      const stock =
                        Number(
                          product?.currentStock ||
                            0
                        );

                      const quantity =
                        Number(
                          item.quantity || 0
                        );

                      const total =
                        quantity * price;

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="flex min-w-0 items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <Package
                                  size={18}
                                />
                              </div>

                              <div className="min-w-0">

                                <p className="text-sm font-bold text-slate-800">
                                  Product{" "}
                                  {index + 1}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Select item
                                </p>

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeItem(
                                  index
                                )
                              }
                              disabled={
                                saving
                              }
                              className="rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_170px_130px]">

                            {/* PRODUCT SELECT */}

                            <div
                              className="relative"
                              ref={
                                searchOpen ===
                                index
                                  ? searchRef
                                  : null
                              }
                            >

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Product
                              </label>

                              <button
                                type="button"
                                disabled={
                                  saving
                                }
                                onClick={() => {
                                  setSearchOpen(
                                    searchOpen ===
                                      index
                                      ? null
                                      : index
                                  );

                                  setSearchText(
                                    ""
                                  );
                                }}
                                className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 text-left transition hover:border-emerald-400 hover:bg-white"
                              >

                                <div className="min-w-0">

                                  {product ? (
                                    <>
                                      <p className="truncate text-sm font-semibold text-slate-800">
                                        {
                                          product.productName
                                        }
                                      </p>

                                      <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {product.sku
                                          ? `SKU: ${product.sku}`
                                          : `Stock: ${stock}`}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-slate-400">
                                      Search product...
                                    </p>
                                  )}

                                </div>

                                <ChevronDown
                                  size={17}
                                  className="ml-2 shrink-0 text-slate-400"
                                />

                              </button>

                              {/* SEARCH DROPDOWN */}

                              {searchOpen ===
                                index && (
                                <div className="absolute left-0 right-0 top-full z-[300] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                                  <div className="border-b p-2">

                                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                                      <Search
                                        size={17}
                                        className="text-slate-400"
                                      />

                                      <input
                                        autoFocus
                                        value={
                                          searchText
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          setSearchText(
                                            event
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Search name, SKU or category..."
                                        className="w-full bg-transparent py-3 text-sm outline-none"
                                      />

                                      {searchText && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSearchText(
                                              ""
                                            )
                                          }
                                          className="text-slate-400 hover:text-slate-700"
                                        >
                                          <X
                                            size={
                                              16
                                            }
                                          />
                                        </button>
                                      )}

                                    </div>

                                  </div>

                                  <div className="max-h-72 overflow-y-auto">

                                    {filteredProducts.length >
                                    0 ? (
                                      filteredProducts.map(
                                        (
                                          productItem
                                        ) => {
                                          const itemStock =
                                            Number(
                                              productItem.currentStock ||
                                                0
                                            );

                                          const selected =
                                            String(
                                              item.productId
                                            ) ===
                                            String(
                                              productItem.productId
                                            );

                                          return (
                                            <button
                                              type="button"
                                              key={
                                                productItem.productId
                                              }
                                              onClick={() =>
                                                selectProduct(
                                                  index,
                                                  productItem.productId
                                                )
                                              }
                                              className={`flex w-full items-center justify-between gap-3 border-b px-3 py-3 text-left transition last:border-0 ${
                                                selected
                                                  ? "bg-emerald-50"
                                                  : "hover:bg-slate-50"
                                              }`}
                                            >

                                              <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                  {
                                                    productItem.productName
                                                  }
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">

                                                  {productItem.sku && (
                                                    <span>
                                                      SKU:{" "}
                                                      {
                                                        productItem.sku
                                                      }
                                                    </span>
                                                  )}

                                                  {productItem.category && (
                                                    <span>
                                                      {
                                                        productItem.category
                                                      }
                                                    </span>
                                                  )}

                                                </div>

                                              </div>

                                              <div className="shrink-0 text-right">

                                                <p className="text-sm font-bold text-slate-800">
                                                  {currency(
                                                    productItem.sellingPrice
                                                  )}
                                                </p>

                                                <span className="text-[11px] font-semibold text-emerald-600">
                                                  {
                                                    itemStock
                                                  }{" "}
                                                  in stock
                                                </span>

                                              </div>

                                            </button>
                                          );
                                        }
                                      )
                                    ) : (
                                      <div className="px-4 py-10 text-center text-sm text-slate-400">

                                        <Package
                                          size={
                                            28
                                          }
                                          className="mx-auto mb-2 opacity-40"
                                        />

                                        No available
                                        product found.

                                      </div>
                                    )}

                                  </div>

                                </div>
                              )}

                            </div>

                            {/* QUANTITY */}

                            <div>

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Quantity
                              </label>

                              <div className="flex h-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                                <button
                                  type="button"
                                  disabled={
                                    saving ||
                                    !product ||
                                    quantity <=
                                      1
                                  }
                                  onClick={() =>
                                    decreaseQuantity(
                                      index
                                    )
                                  }
                                  className="flex w-11 items-center justify-center border-r text-slate-500 hover:bg-white disabled:opacity-40"
                                >
                                  <Minus
                                    size={16}
                                  />
                                </button>

                                <input
                                  type="number"
                                  min="1"
                                  max={
                                    stock ||
                                    undefined
                                  }
                                  value={
                                    item.quantity
                                  }
                                  disabled={
                                    saving ||
                                    !product
                                  }
                                  onChange={(
                                    event
                                  ) =>
                                    changeQuantity(
                                      index,
                                      event
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full bg-transparent text-center text-sm font-bold outline-none"
                                />

                                <button
                                  type="button"
                                  disabled={
                                    saving ||
                                    !product ||
                                    quantity >=
                                      stock
                                  }
                                  onClick={() =>
                                    increaseQuantity(
                                      index
                                    )
                                  }
                                  className="flex w-11 items-center justify-center border-l text-slate-500 hover:bg-white disabled:opacity-40"
                                >
                                  <Plus
                                    size={16}
                                  />
                                </button>

                              </div>

                            </div>

                            {/* TOTAL */}

                            <div>

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Total
                              </label>

                              <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-bold text-slate-800">
                                {currency(
                                  total
                                )}
                              </div>

                            </div>

                          </div>

                          {/* STOCK INFO */}

                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">

                            <span className="text-xs text-slate-400">

                              {product
                                ? `Available stock: ${stock}`
                                : "Select a product"}

                            </span>

                            {product && (
                              <span className="text-xs text-slate-500">
                                {currency(
                                  price
                                )} / unit
                              </span>
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ADD ITEM */}

                <button
                  type="button"
                  onClick={addItem}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-4 py-3 text-sm font-bold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50 disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add Another Product
                </button>

                {/* =================================================
                    CUSTOMER
                ================================================= */}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <User size={18} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Customer
                      </h3>

                      <p className="text-xs text-slate-400">
                        Optional
                      </p>
                    </div>

                  </div>

                  <div className="grid gap-3 md:grid-cols-2">

                    <div className="relative">

                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="text"
                        value={
                          customerName
                        }
                        disabled={saving}
                        onChange={(event) =>
                          setCustomerName(
                            event.target.value
                          )
                        }
                        placeholder="Customer name"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                      />

                    </div>

                    <div className="relative">

                      <Phone
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        value={
                          customerPhone
                        }
                        disabled={saving}
                        onChange={(event) =>
                          setCustomerPhone(
                            event.target.value
                          )
                        }
                        placeholder="Mobile number"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white"
                      />

                    </div>

                  </div>

                  {/* PAYMENT */}

                  <div className="mt-4">

                    <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-600">

                      <CreditCard
                        size={15}
                      />

                      Payment Method

                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                      {[
                        "Cash",
                        "UPI",
                        "Card",
                        "Other",
                      ].map(
                        (method) => (
                          <button
                            type="button"
                            key={method}
                            disabled={saving}
                            onClick={() =>
                              setPaymentMethod(
                                method
                              )
                            }
                            className={`rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                              paymentMethod ===
                              method
                                ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white"
                            }`}
                          >
                            {method}
                          </button>
                        )
                      )}

                    </div>

                  </div>

                </div>

                {/* ERROR */}

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                    <AlertCircle
                      size={19}
                      className="mt-0.5 shrink-0"
                    />

                    <span>
                      {error}
                    </span>

                  </div>
                )}

              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="lg:sticky lg:top-0 lg:h-fit">

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                  <div className="bg-emerald-700 px-5 py-5 text-white">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-semibold text-emerald-200">
                          QUICK BILL
                        </p>

                        <h3 className="mt-1 text-xl font-black">
                          Sale Summary
                        </h3>
                      </div>

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                        <ShoppingCart
                          size={19}
                        />
                      </div>

                    </div>

                  </div>

                  <div className="p-5">

                    <div className="space-y-3">

                      <div className="flex justify-between text-sm text-slate-500">
                        <span>
                          Products
                        </span>

                        <span className="font-bold text-slate-800">
                          {
                            items.filter(
                              (item) =>
                                item.productId
                            ).length
                          }
                        </span>
                      </div>

                      <div className="flex justify-between text-sm text-slate-500">
                        <span>
                          Quantity
                        </span>

                        <span className="font-bold text-slate-800">
                          {
                            totals.quantity
                          }
                        </span>
                      </div>

                      <div className="flex justify-between text-sm text-slate-500">
                        <span>
                          Subtotal
                        </span>

                        <span className="font-bold text-slate-800">
                          {currency(
                            totals.subtotal
                          )}
                        </span>
                      </div>

                    </div>

                    <div className="my-5 border-t border-dashed border-slate-200" />

                    <div className="rounded-2xl bg-emerald-50 p-4">

                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                        Grand Total
                      </p>

                      <p className="mt-1 text-3xl font-black text-emerald-700">
                        {currency(
                          totals.total
                        )}
                      </p>

                    </div>

                    <div className="mt-4 rounded-xl bg-slate-50 p-3">

                      <div className="flex items-center justify-between text-sm">

                        <span className="text-slate-500">
                          Payment
                        </span>

                        <span className="font-bold text-slate-800">
                          {paymentMethod}
                        </span>

                      </div>

                    </div>

                    <div className="mt-4 flex gap-2 text-xs text-slate-400">

                      <CheckCircle2
                        size={15}
                        className="shrink-0 text-emerald-500"
                      />

                      <span>
                        Stock will be updated automatically
                        after the sale is saved.
                      </span>

                    </div>

                  </div>

                  <div className="border-t bg-slate-50 p-4">

                    <button
                      type="submit"
                      disabled={
                        saving ||
                        totals.total <= 0
                      }
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving Quick Sale...
                        </>
                      ) : (
                        <>
                          <CheckCircle2
                            size={18}
                          />
                          Save & Generate Bill
                        </>
                      )}

                    </button>

                    <button
                      type="button"
                      onClick={onClose}
                      disabled={saving}
                      className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-white hover:text-slate-800 disabled:opacity-50"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}