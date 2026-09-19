import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

/** Keeps crawlers out of the API and the cart/checkout routes. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/cart", "/checkout"],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
