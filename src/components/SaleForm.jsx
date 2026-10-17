import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Trash2,
  Search,
  ChevronDown,
  X,
  User,
  Phone,
  CreditCard,
  ShoppingCart,
  Package,
  Minus,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useStore } from "../context/StoreContext";
import Invoice from "./Invoice";

const newItem = () => ({
  productId: "",
  quantity: 1,
  discount: 0,
});

export default function SaleForm({
  open,
  onClose,
  onCompleted,
}) {
  const {
    products = [],
    createSale,
    saving,
    settings,
  } = useStore();

  const [items, setItems] = useState([newItem()]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [error, setError] = useState("");

  const [searchOpen, setSearchOpen] = useState(null);
  const [searchText, setSearchText] = useState("");

  const searchRef = useRef(null);

  /* =====================================================
     RESET
  ===================================================== */

  useEffect(() => {
    if (open) {
      setItems([newItem()]);
      setCustomerName("");
      setCustomerPhone("");
      setPaymentMethod("Cash");
      setError("");
      setSearchOpen(null);
      setSearchText("");
    }
  }, [open]);

  // Lock the page behind the sale dialog while it is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
    };
  }, [open]);

  /* =====================================================
     CLOSE SEARCH ON OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(null);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =====================================================
     PRODUCT FINDER
  ===================================================== */

  function getProduct(id) {
    if (!id) return null;

    return products.find(
      (p) =>
        String(p.productId).trim() ===
        String(id).trim()
    );
  }

  const capitalizeWords = (value) =>
    String(value || "").replace(/(^|\s)([a-z])/g, (_, space, letter) =>
      `${space}${letter.toUpperCase()}`
    );

  /* =====================================================
     PRODUCT SEARCH
  ===================================================== */

  function getFilteredProducts() {
    const search = searchText
      .trim()
      .toLowerCase();

    if (!search) {
      return products.slice(0, 50);
    }

    return products
      .filter((product) => {
        const name = String(
          product.productName || ""
        ).toLowerCase();

        const sku = String(
          product.sku || ""
        ).toLowerCase();

        const id = String(
          product.productId || ""
        ).toLowerCase();

        return (
          name.includes(search) ||
          sku.includes(search) ||
          id.includes(search)
        );
      })
      .slice(0, 50);
  }

  /* =====================================================
     CHANGE PRODUCT
  ===================================================== */

  function changeProduct(index, productId) {
    setItems((old) =>
      old.map((item, i) =>
        i === index
          ? {
              ...item,
              productId,
              quantity: 1,
              discount: 0,
            }
          : item
      )
    );

    setSearchOpen(null);
    setSearchText("");
    setError("");
  }

  /* =====================================================
     CHANGE ITEM
  ===================================================== */

  function changeItem(index, key, value) {
    setItems((old) =>
      old.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: value,
            }
          : item
      )
    );

    setError("");
  }

  /* =====================================================
     QUANTITY
  ===================================================== */

  function increaseQuantity(index) {
    setItems((old) =>
      old.map((item, i) => {
        if (i !== index) return item;

        const product = getProduct(
          item.productId
        );

        const stock =
          Number(product?.currentStock) || 0;

        const current =
          Number(item.quantity) || 0;

        if (current >= stock) {
          return item;
        }

        return {
          ...item,
          quantity: current + 1,
        };
      })
    );
  }

  function decreaseQuantity(index) {
    setItems((old) =>
      old.map((item, i) => {
        if (i !== index) return item;

        const current =
          Number(item.quantity) || 1;

        return {
          ...item,
          quantity: Math.max(
            1,
            current - 1
          ),
        };
      })
    );
  }

  /* =====================================================
     ADD PRODUCT
  ===================================================== */

  function addProduct() {
    setItems((old) => [
      ...old,
      newItem(),
    ]);

    setError("");
    setSearchOpen(null);
    setSearchText("");
  }

  /* =====================================================
     REMOVE PRODUCT
  ===================================================== */

  function removeProduct(index) {
    if (items.length === 1) {
      setError(
        "At least one product is required."
      );
      return;
    }

    setItems((old) =>
      old.filter((_, i) => i !== index)
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
    let discount = 0;

    items.forEach((item) => {
      const product = getProduct(
        item.productId
      );

      if (!product) return;

      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(product.sellingPrice) || 0;

      const itemDiscount =
        Number(item.discount) || 0;

      subtotal +=
        quantity * price;

      discount += itemDiscount;
    });

    return {
      subtotal,
      discount,
      grandTotal: Math.max(
        0,
        subtotal - discount
      ),
    };
  }, [items, products]);

  /* =====================================================
     TOTAL ITEM COUNT
  ===================================================== */

  const totalQuantity = useMemo(() => {
    return items.reduce(
      (total, item) =>
        total +
        (Number(item.quantity) || 0),
      0
    );
  }, [items]);

  /* =====================================================
     SAVE SALE
  ===================================================== */

  async function submit(e) {
    e.preventDefault();

    setError("");

    const selectedItems =
      items.filter(
        (item) =>
          item.productId &&
          String(item.productId).trim()
      );

    if (selectedItems.length === 0) {
      setError(
        "Please select at least one product."
      );
      return;
    }

    const invoiceNo = undefined;

    const now =
      new Date().toISOString();

    try {
      const saleProducts =
        selectedItems.map((item) => {
          const product =
            getProduct(
              item.productId
            );

          if (!product) {
            throw new Error(
              "Selected product could not be found."
            );
          }

          const quantity =
            Number(item.quantity);

          const sellingPrice =
            Number(
              product.sellingPrice
            ) || 0;

          const discount =
            Number(item.discount) || 0;

          const stock =
            Number(
              product.currentStock
            ) || 0;

          if (quantity <= 0) {
            throw new Error(
              `Enter valid quantity for ${product.productName}.`
            );
          }

          if (quantity > stock) {
            throw new Error(
              `${product.productName}: only ${stock} available in stock.`
            );
          }

          if (discount < 0) {
            throw new Error(
              `Invalid discount for ${product.productName}.`
            );
          }

          const productAmount =
            quantity * sellingPrice;

          if (
            discount >
            productAmount
          ) {
            throw new Error(
              `Discount is greater than product amount for ${product.productName}.`
            );
          }

          const total =
            Math.max(
              0,
              productAmount -
                discount
            );

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

            discount,

            total,
          };
        });

      const salePayload = {
        saleId:
          `SALE-${Date.now()}-${Math.floor(
            Math.random() * 99999
          )}`,

        invoiceNo,

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

        subtotal:
          totals.subtotal,

        discount:
          totals.discount,

        total:
          totals.grandTotal,

        totalAmount:
          totals.grandTotal,
      };

      await createSale(
        salePayload
      );

      const invoice = {
        invoiceNo,

        saleId:
          salePayload.saleId,

        date: now,
        time: now,

        customerName,
        customerPhone,
        paymentMethod,

        items:
          saleProducts,

        subtotal:
          totals.subtotal,

        discount:
          totals.discount,

        total:
          totals.grandTotal,

        totalAmount:
          totals.grandTotal,
      };

      onCompleted?.(invoice);
      onClose?.();
    } catch (err) {
      console.error(
        "SALE SAVE ERROR:",
        err
      );

      setError(
        err?.message ||
          "Sale save nahi ho saki."
      );
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="sale-dialog fixed inset-0 z-50 flex h-[100dvh] w-full items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4 lg:p-5">

      <div className="sale-dialog-panel flex h-full w-full max-w-[1800px] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl ring-1 ring-white/10 sm:h-[calc(100dvh-2rem)] lg:h-[calc(100dvh-2.5rem)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex shrink-0 items-center justify-between border-b bg-white px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <ShoppingCart
                size={21}
              />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                Create New Sale
              </h2>

              <p className="text-xs text-slate-500 sm:text-sm">
                Create invoice and update stock
                automatically.
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
            FORM BODY
        ================================================= */}

        <form
          onSubmit={submit}
          className="flex min-h-0 flex-1 flex-col"
        >

          <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-3 lg:p-4">

            <div className="sale-workspace grid h-full min-h-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(360px,440px)] xl:grid-cols-[minmax(0,1fr)_minmax(400px,500px)]">

              {/* =================================================
                  LEFT SIDE
              ================================================= */}

              <div className="sale-form-scroll min-h-0 overflow-y-auto overscroll-contain pr-1 space-y-4">

                {/* PRODUCTS HEADER */}

                <div className="flex items-center justify-between">

                  <div>

                    <h3 className="font-bold text-slate-900">
                      Products
                    </h3>

                    <p className="text-xs text-slate-500">
                      {items.length} product line
                      {items.length !== 1
                        ? "s"
                        : ""}
                    </p>

                  </div>

                  <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                    {totalQuantity} item
                    {totalQuantity !== 1
                      ? "s"
                      : ""}
                  </div>

                </div>

                {/* PRODUCT LIST */}

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

                      const discount =
                        Number(
                          item.discount || 0
                        );

                      const itemTotal =
                        Math.max(
                          0,
                          quantity *
                            price -
                            discount
                        );

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                        >

                          {/* PRODUCT TOP */}

                          <div className="mb-4 flex items-start justify-between">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                <Package
                                  size={18}
                                />
                              </div>

                              <div>

                                <p className="text-sm font-bold text-slate-800">
                                  Product #
                                  {index + 1}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Select product
                                  and quantity
                                </p>

                              </div>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                removeProduct(
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

                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-12">

                            {/* PRODUCT */}

                            <div
                              className="relative sm:col-span-2 xl:col-span-5"
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
                                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-blue-400 hover:bg-white focus:border-blue-500 disabled:opacity-60"
                              >

                                <div className="min-w-0">

                                  {product ? (
                                    <>
                                      <p className="truncate text-sm font-semibold text-slate-800">
                                        {
                                          product.productName
                                        }
                                      </p>

                                      <p className="mt-0.5 text-xs text-slate-400">
                                        {product.sku
                                          ? `SKU: ${product.sku}`
                                          : "No SKU"}
                                      </p>
                                    </>
                                  ) : (
                                    <p className="text-sm text-slate-400">
                                      Search & select
                                      product
                                    </p>
                                  )}

                                </div>

                                <ChevronDown
                                  size={18}
                                  className="ml-2 shrink-0 text-slate-400"
                                />

                              </button>

                              {/* SEARCH DROPDOWN */}

                              {searchOpen ===
                                index && (
                                <div className="absolute left-0 right-0 top-full z-[200] mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                                  <div className="border-b bg-white p-2">

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
                                          e
                                        ) =>
                                          setSearchText(
                                            e
                                              .target
                                              .value
                                          )
                                        }
                                        placeholder="Search product, SKU..."
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

                                  <div className="max-h-64 overflow-y-auto">

                                    {getFilteredProducts()
                                      .length >
                                    0 ? (
                                      getFilteredProducts().map(
                                        (
                                          p
                                        ) => {
                                          const stock =
                                            Number(
                                              p.currentStock ||
                                                0
                                            );

                                          const selected =
                                            String(
                                              item.productId
                                            ) ===
                                            String(
                                              p.productId
                                            );

                                          return (
                                            <button
                                              type="button"
                                              key={
                                                p.productId
                                              }
                                              disabled={
                                                stock <=
                                                0
                                              }
                                              onClick={() =>
                                                changeProduct(
                                                  index,
                                                  p.productId
                                                )
                                              }
                                              className={`flex w-full items-center justify-between border-b px-3 py-3 text-left transition last:border-0 ${
                                                selected
                                                  ? "bg-blue-50"
                                                  : "hover:bg-slate-50"
                                              } ${
                                                stock <=
                                                0
                                                  ? "cursor-not-allowed opacity-50"
                                                  : ""
                                              }`}
                                            >

                                              <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                  {
                                                    p.productName
                                                  }
                                                </p>

                                                <div className="mt-1 flex gap-3 text-xs text-slate-400">

                                                  {p.sku && (
                                                    <span>
                                                      SKU:{" "}
                                                      {
                                                        p.sku
                                                      }
                                                    </span>
                                                  )}

                                                  {p.category && (
                                                    <span>
                                                      {
                                                        p.category
                                                      }
                                                    </span>
                                                  )}

                                                </div>

                                              </div>

                                              <span
                                                className={`ml-3 shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${
                                                  stock >
                                                  0
                                                    ? "bg-green-50 text-green-600"
                                                    : "bg-red-50 text-red-600"
                                                }`}
                                              >
                                                {stock >
                                                0
                                                  ? `${stock} in stock`
                                                  : "Out of stock"}
                                              </span>

                                            </button>
                                          );
                                        }
                                      )
                                    ) : (
                                      <div className="px-4 py-10 text-center text-sm text-slate-400">
                                        <Search
                                          size={
                                            28
                                          }
                                          className="mx-auto mb-2 opacity-40"
                                        />
                                        No product
                                        found
                                      </div>
                                    )}

                                  </div>

                                </div>
                              )}

                            </div>

                            {/* QUANTITY */}

                            <div className="xl:col-span-3">

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Quantity
                              </label>

                              <div className="flex h-[46px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

                                <button
                                  type="button"
                                  disabled={
                                    saving ||
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
                                    size={
                                      16
                                    }
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
                                    saving
                                  }
                                  onChange={(
                                    e
                                  ) =>
                                    changeItem(
                                      index,
                                      "quantity",
                                      e
                                        .target
                                        .value
                                    )
                                  }
                                  className="w-full bg-transparent text-center text-sm font-semibold outline-none"
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
                                    size={
                                      16
                                    }
                                  />
                                </button>

                              </div>

                            </div>

                            {/* PRICE */}

                            <div className="xl:col-span-2">

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Sell Price
                              </label>

                              <div className="flex h-[46px] items-center rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-700">
                                ₹
                                {price.toLocaleString(
                                  "en-IN"
                                )}
                              </div>

                            </div>

                            {/* DISCOUNT */}

                            <div className="xl:col-span-2">

                              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                                Discount
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={
                                  item.discount
                                }
                                disabled={
                                  saving
                                }
                                onChange={(
                                  e
                                ) =>
                                  changeItem(
                                    index,
                                    "discount",
                                    e
                                      .target
                                      .value
                                  )
                                }
                                className="h-[46px] w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                              />

                            </div>

                          </div>

                          {/* ITEM FOOTER */}

                          <div className="mt-4 flex items-center justify-between border-t pt-3">

                            <div className="text-xs text-slate-400">

                              {product
                                ? `Available stock: ${stock}`
                                : "Please select a product"}

                            </div>

                            <div className="text-sm text-slate-500">

                              Item Total:

                              <span className="ml-2 text-base font-bold text-slate-900">
                                ₹
                                {itemTotal.toLocaleString(
                                  "en-IN"
                                )}
                              </span>

                            </div>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ADD PRODUCT */}

                <button
                  type="button"
                  onClick={addProduct}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                >
                  <Plus size={18} />
                  Add Another Product
                </button>

                {/* CUSTOMER */}

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <div className="mb-4 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <User size={19} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-800">
                        Customer Information
                      </h3>

                      <p className="text-xs text-slate-400">
                        Optional customer details
                      </p>
                    </div>

                  </div>

                  <div className="grid gap-4 md:grid-cols-2">

                    <div className="relative">

                      <User
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        placeholder="Customer Name"
                        value={
                          customerName
                        }
                        onBlur={() => setCustomerName(capitalizeWords(customerName))}
                        disabled={
                          saving
                        }
                        onChange={(e) =>
                          setCustomerName(
                            e.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                    <div className="relative">

                      <Phone
                        size={17}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        type="tel"
                        placeholder="Customer Mobile"
                        value={
                          customerPhone
                        }
                        disabled={
                          saving
                        }
                        onChange={(e) =>
                          setCustomerPhone(
                            e.target.value
                          )
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                      />

                    </div>

                  </div>

                  {/* PAYMENT */}

                  <div className="mt-5">

                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
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
                            key={
                              method
                            }
                            type="button"
                            disabled={
                              saving
                            }
                            onClick={() =>
                              setPaymentMethod(
                                method
                              )
                            }
                            className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                              paymentMethod ===
                              method
                                ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-600/20"
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
                  LIVE BILL PREVIEW
              ================================================= */}

              <div className="sale-preview min-w-0 min-h-0 flex h-full max-h-full flex-col overflow-hidden">
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">BILL PREVIEW</p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-800">Live invoice preview</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">{paymentMethod}</div>
                  </div>

                  <div className="sale-preview-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain p-2 sm:p-3">
                    <div className="sale-receipt mx-auto w-full max-w-[430px] overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                      <Invoice
                        sale={{
                          invoiceNo: "DRAFT-INVOICE",
                          saleId: "DRAFT-INVOICE",
                          date: new Date().toISOString(),
                          time: new Date().toISOString(),
                          customerName: customerName || "Walk-in Customer",
                          customerPhone,
                          paymentMethod,
                          items: items.map((item) => {
                            const product = getProduct(item.productId);
                            const quantity = Number(item.quantity) || 0;
                            const sellingPrice = Number(product?.sellingPrice) || 0;
                            const discount = Number(item.discount) || 0;
                            return {
                              ...item,
                              productId: product?.productId || item.productId,
                              productName: product?.productName || "Select product",
                              category: product?.category || "",
                              sku: product?.sku || "",
                              quantity,
                              sellingPrice,
                              discount,
                              total: Math.max(0, quantity * sellingPrice - discount),
                            };
                          }),
                          subtotal: totals.subtotal,
                          discount: totals.discount,
                          total: totals.grandTotal,
                          totalAmount: totals.grandTotal,
                        }}
                        settings={settings}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
                    <button
                      type="submit"
                      disabled={saving || totals.grandTotal <= 0}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Saving Sale...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={18} />
                          Save & Generate Bill
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={saving}
                      className="mt-2 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50"
                    >Cancel</button>
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

/* =====================================================
   RECEIPT ICON
===================================================== */

function ReceiptIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l3-2 3 2 3-2 3 2 4-2V2l-4 2-3-2-3 2-3-2-3 2Z" />
      <path d="M8 8h8" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </svg>
  );
}