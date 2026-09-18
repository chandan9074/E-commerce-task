import Link from "next/link";
import { TbCompass } from "react-icons/tb";

import { buttonClasses } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/States";

export default function NotFound() {
  return (
    <div className="container-page py-24">
      <EmptyState
        icon={<TbCompass className="size-7" aria-hidden />}
        title="Page not found"
        description="That page does not exist, or it moved. The catalogue is still where you left it."
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/products" className={buttonClasses("primary")}>
              Browse products
            </Link>
            <Link href="/" className={buttonClasses("outline")}>
              Go home
            </Link>
          </div>
        }
        className="mx-auto max-w-2xl"
      />
    </div>
  );
}
