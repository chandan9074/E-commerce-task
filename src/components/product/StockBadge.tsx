import { TbAlertTriangle, TbCircleCheck, TbCircleX } from "react-icons/tb";

import { Badge } from "@/components/ui/Badge";
import { getStockStatus } from "@/helpers/product.helpers";

/** Single source of truth for how stock is communicated across the app. */
export function StockBadge({ stock, className }: { stock: number; className?: string }) {
  const status = getStockStatus(stock);

  if (status.level === "out-of-stock") {
    return (
      <Badge tone="danger" className={className} icon={<TbCircleX className="size-3.5" aria-hidden />}>
        {status.label}
      </Badge>
    );
  }

  if (status.level === "low-stock") {
    return (
      <Badge tone="accent" className={className} icon={<TbAlertTriangle className="size-3.5" aria-hidden />}>
        {status.label}
      </Badge>
    );
  }

  return (
    <Badge tone="success" className={className} icon={<TbCircleCheck className="size-3.5" aria-hidden />}>
      {status.label}
    </Badge>
  );
}
