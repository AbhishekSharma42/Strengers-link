import { ArrowUpRight } from "lucide-react";

export default function StatCard({
  title,
  value,
  icon: Icon,
}) {
  return (
    <div
      className="
        group relative overflow-hidden
        rounded-2xl border border-slate-200/80
        bg-white p-5
        shadow-sm
        transition-all duration-300
        hover:-translate-y-1
        hover:shadow-xl
        hover:shadow-slate-200/60
      "
    >
      {/* Background Decoration */}
      <div
        className="
          pointer-events-none absolute
          -right-8 -top-8
          h-24 w-24
          rounded-full
          bg-blue-50
          opacity-70
          transition-transform duration-500
          group-hover:scale-150
        "
      />

      <div className="relative">

        {/* TOP */}
        <div className="flex items-start justify-between gap-4">

          {/* TITLE */}
          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm font-medium
                text-slate-500
              "
            >
              {title}
            </p>

            {/* VALUE */}
            <h3
              className="
                mt-2
                break-words
                text-2xl font-bold
                tracking-tight
                text-slate-900
                sm:text-3xl
              "
            >
              {value}
            </h3>
          </div>

          {/* ICON */}
          {Icon && (
            <div
              className="
                flex h-11 w-11
                shrink-0
                items-center justify-center
                rounded-xl
                bg-blue-50
                text-blue-600
                ring-1 ring-blue-100
                transition-all duration-300
                group-hover:scale-110
                group-hover:bg-blue-600
                group-hover:text-white
              "
            >
              <Icon size={21} strokeWidth={2} />
            </div>
          )}
        </div>

        {/* BOTTOM */}
        <div
          className="
            mt-5
            flex items-center
            justify-between
            border-t border-slate-100
            pt-3
          "
        >
          <span
            className="
              text-xs font-medium
              text-slate-400
            "
          >
            Store overview
          </span>

          <div
            className="
              flex h-7 w-7
              items-center justify-center
              rounded-lg
              bg-slate-50
              text-slate-400
              transition-all duration-300
              group-hover:bg-blue-50
              group-hover:text-blue-600
            "
          >
            <ArrowUpRight size={15} />
          </div>
        </div>

      </div>
    </div>
  );
}