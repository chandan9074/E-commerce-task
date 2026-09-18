import { TbCreditCard, TbHeadset, TbRefresh, TbTruck } from "react-icons/tb";

const PROPS = [
  { icon: TbTruck, title: "Free delivery over $75", description: "Dispatched same day on orders before 3pm." },
  { icon: TbRefresh, title: "30-day returns", description: "Changed your mind? Send it back, no questions." },
  { icon: TbCreditCard, title: "Secure checkout", description: "Validated client and server side, every time." },
  { icon: TbHeadset, title: "Real support", description: "Humans, not scripts, seven days a week." },
];

export function ValueProps() {
  return (
    <section className="border-y border-[var(--border)] bg-surface">
      <div className="container-page grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {PROPS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-600/10 text-brand-600">
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="mt-0.5 text-xs text-muted">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
