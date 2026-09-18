import { ProductGridSkeleton, Skeleton } from "@/components/ui/Skeleton";

/** Route-level loading UI, streamed while the listing renders on the server. */
export default function ProductsLoading() {
  return (
    <div className="container-page py-8">
      <div className="mb-6 space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
        <Skeleton className="h-11 w-full max-w-xl rounded-pill" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="hidden space-y-4 lg:block">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-28 w-full" />
          ))}
        </div>

        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-40 rounded-pill" />
          </div>
          <ProductGridSkeleton count={12} />
        </div>
      </div>
    </div>
  );
}
