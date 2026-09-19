"use client";

import { useCallback } from "react";

import { FilterPanel } from "./FilterPanel";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { mobileFiltersToggled } from "@/store/slices/ui.slice";
import type { ProductFacets } from "@/types";

/** The same `FilterPanel`, presented as a sheet below the `lg` breakpoint. */
export function MobileFilterDrawer({ facets }: { facets: ProductFacets }) {
  const open = useAppSelector((state) => state.ui.mobileFiltersOpen);
  const dispatch = useAppDispatch();

  const close = useCallback(() => dispatch(mobileFiltersToggled(false)), [dispatch]);

  return (
    <Drawer
      open={open}
      onClose={close}
      side="left"
      title="Filters"
      footer={
        <Button className="w-full" onClick={close}>
          Show results
        </Button>
      }
    >
      <div className="px-5 pb-6">
        <FilterPanel facets={facets} hideHeading />
      </div>
    </Drawer>
  );
}
