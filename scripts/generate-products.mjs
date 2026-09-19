/**
 * Generates `src/lib/data/products.json` from a fixed seed, so the dataset is
 * identical on every machine.
 *
 *   npm run data:generate
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/lib/data/products.json");
const TARGET_COUNT = 520;

// --- rng
function mulberry32(a) {
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260918);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const pickMany = (arr, n) => {
  const pool = [...arr];
  const out = [];
  while (out.length < n && pool.length) out.push(...pool.splice(Math.floor(rand() * pool.length), 1));
  return out;
};
const int = (min, max) => Math.floor(rand() * (max - min + 1)) + min;
const float = (min, max, dp = 1) => Number((rand() * (max - min) + min).toFixed(dp));
const chance = (p) => rand() < p;

// --- taxonomy
const CATALOGUE = [
  {
    slug: "electronics",
    name: "Electronics",
    icon: "TbDeviceLaptop",
    brands: ["Auralux", "Nexovia", "Kiroshi", "Voltra", "Helion", "Mireo"],
    subcategories: [
      { slug: "headphones", name: "Headphones", nouns: ["Wireless Headphones", "Noise-Cancelling Earbuds", "Studio Monitor Headset", "Open-Back Headphones"], price: [59, 549] },
      { slug: "laptops", name: "Laptops", nouns: ["Ultrabook 14", "Creator Laptop 16", "Everyday Notebook 15", "Compact Laptop 13"], price: [549, 2899] },
      { slug: "smartphones", name: "Smartphones", nouns: ["Smartphone Pro", "Smartphone Lite", "Foldable Phone", "Rugged Phone"], price: [249, 1499] },
      { slug: "wearables", name: "Wearables", nouns: ["Fitness Watch", "Smart Ring", "GPS Sport Watch", "Health Band"], price: [79, 699] },
      { slug: "cameras", name: "Cameras", nouns: ["Mirrorless Camera", "Action Camera", "Vlogging Kit", "Instant Camera"], price: [149, 2499] },
      { slug: "audio", name: "Home Audio", nouns: ["Bookshelf Speaker Pair", "Portable Speaker", "Soundbar", "Turntable"], price: [89, 1299] },
    ],
  },
  {
    slug: "fashion",
    name: "Fashion",
    icon: "TbShirt",
    brands: ["Norr & Ash", "Palo Verde", "Studio Marchetti", "Everthread", "Loomfolk"],
    subcategories: [
      { slug: "mens-clothing", name: "Men's Clothing", nouns: ["Merino Crew Sweater", "Oxford Shirt", "Selvedge Denim Jeans", "Quilted Overshirt"], price: [39, 289] },
      { slug: "womens-clothing", name: "Women's Clothing", nouns: ["Silk Slip Dress", "Relaxed Linen Blazer", "Ribbed Knit Cardigan", "Pleated Midi Skirt"], price: [45, 349] },
      { slug: "footwear", name: "Footwear", nouns: ["Leather Chelsea Boots", "Retro Court Sneakers", "Trail Runners", "Suede Loafers"], price: [59, 399] },
      { slug: "bags", name: "Bags & Luggage", nouns: ["Weekender Duffel", "Leather Tote", "Technical Backpack", "Cabin Roller Case"], price: [49, 549] },
      { slug: "accessories", name: "Accessories", nouns: ["Wool Scarf", "Minimalist Wallet", "Polarised Sunglasses", "Woven Belt"], price: [19, 189] },
    ],
  },
  {
    slug: "home-living",
    name: "Home & Living",
    icon: "TbHome",
    brands: ["Hearthway", "Osmo Living", "Terra Nine", "Casa Lumen", "Blyth & Co"],
    subcategories: [
      { slug: "kitchen", name: "Kitchen", nouns: ["Cast Iron Dutch Oven", "Espresso Machine", "Chef Knife Set", "Stand Mixer"], price: [29, 899] },
      { slug: "furniture", name: "Furniture", nouns: ["Oak Side Table", "Ergonomic Desk Chair", "Boucle Accent Chair", "Floating Shelf Set"], price: [79, 1299] },
      { slug: "decor", name: "Decor", nouns: ["Ceramic Vase", "Linen Cushion Cover", "Arc Floor Lamp", "Framed Print"], price: [15, 429] },
      { slug: "bedding", name: "Bedding", nouns: ["Sateen Duvet Set", "Linen Sheet Set", "Down Alternative Pillow", "Waffle Blanket"], price: [39, 399] },
    ],
  },
  {
    slug: "beauty",
    name: "Beauty & Care",
    icon: "TbSparkles",
    brands: ["Aeris Skin", "Botanique", "Lume Lab", "Verdant Ritual"],
    subcategories: [
      { slug: "skincare", name: "Skincare", nouns: ["Vitamin C Serum", "Ceramide Moisturiser", "Gentle Cleansing Gel", "Retinol Night Cream"], price: [14, 159] },
      { slug: "fragrance", name: "Fragrance", nouns: ["Eau de Parfum", "Cedar Body Mist", "Amber Roll-On Oil", "Neroli Cologne"], price: [29, 249] },
      { slug: "haircare", name: "Haircare", nouns: ["Repair Shampoo", "Bond Treatment Mask", "Leave-In Conditioner", "Scalp Serum"], price: [12, 89] },
      { slug: "tools", name: "Beauty Tools", nouns: ["Ionic Hair Dryer", "Facial Cleansing Device", "Precision Trimmer", "Heated Styling Brush"], price: [25, 329] },
    ],
  },
  {
    slug: "sports-outdoors",
    name: "Sports & Outdoors",
    icon: "TbMountain",
    brands: ["Ridgeline", "Kestrel Co", "Altus Field", "Northpine"],
    subcategories: [
      { slug: "fitness", name: "Fitness", nouns: ["Adjustable Dumbbell Set", "Yoga Mat Pro", "Resistance Band Kit", "Foam Roller"], price: [19, 549] },
      { slug: "camping", name: "Camping", nouns: ["2-Person Tent", "Down Sleeping Bag", "Camp Stove", "Insulated Flask"], price: [24, 649] },
      { slug: "cycling", name: "Cycling", nouns: ["Gravel Helmet", "Bike Computer", "Hydration Pack", "Clipless Shoes"], price: [39, 499] },
      { slug: "running", name: "Running", nouns: ["Carbon Race Shoes", "Reflective Windbreaker", "Running Vest", "Compression Tights"], price: [29, 289] },
    ],
  },
  {
    slug: "gaming",
    name: "Gaming",
    icon: "TbDeviceGamepad2",
    brands: ["Hexbyte", "Pulsegrid", "Nocturne Labs", "Aether Play"],
    subcategories: [
      { slug: "consoles", name: "Consoles & Handhelds", nouns: ["Handheld Console", "Retro Console Mini", "Console Pro Bundle"], price: [149, 799] },
      { slug: "peripherals", name: "Peripherals", nouns: ["Mechanical Keyboard", "Lightweight Gaming Mouse", "Pro Controller", "Streaming Microphone"], price: [39, 349] },
      { slug: "monitors", name: "Monitors", nouns: ["27-inch QHD 165Hz Monitor", "34-inch Ultrawide Monitor", "24-inch Esports Monitor"], price: [179, 1199] },
      { slug: "chairs", name: "Gaming Chairs", nouns: ["Ergonomic Gaming Chair", "Racing Style Chair", "Mesh Task Chair"], price: [149, 799] },
    ],
  },
  {
    slug: "workspace",
    name: "Workspace",
    icon: "TbBriefcase",
    brands: ["Mono Desk", "Papershift", "Fieldnote", "Orbit Works"],
    subcategories: [
      { slug: "desk-setup", name: "Desk Setup", nouns: ["Standing Desk", "Monitor Arm", "Desk Mat", "Cable Management Tray"], price: [19, 899] },
      { slug: "stationery", name: "Stationery", nouns: ["Hardcover Notebook", "Fineliner Set", "Planner 2026", "Leather Pen Case"], price: [8, 129] },
      { slug: "office-tech", name: "Office Tech", nouns: ["USB-C Docking Station", "Wireless Presenter", "Document Scanner", "Conference Speakerphone"], price: [35, 549] },
    ],
  },
];

const MATERIALS = ["Aero", "Nova", "Terra", "Halo", "Lumen", "Vertex", "Onyx", "Cirrus", "Atlas", "Solace", "Orbit", "Vesper", "Quartz", "Drift", "Meridian", "Ember", "Frost", "Pulse"];
const EDITIONS = ["", "", "", " Pro", " Max", " Mini", " Plus", " Studio Edition", " 2026", " Signature"];
const COLORS = ["Midnight Black", "Arctic White", "Sandstone", "Forest Green", "Cobalt", "Graphite", "Rose Clay", "Ivory", "Deep Plum"];
const TAGS = ["new-arrival", "bestseller", "limited", "eco-friendly", "premium", "value-pick", "staff-favourite", "gift-idea", "bundle-deal"];

const DESC_OPENERS = [
  "Engineered for people who notice the details.",
  "Built to last, designed to disappear into everyday life.",
  "A considered upgrade over the thing you already own.",
  "Quietly premium, without the premium theatrics.",
  "Made with materials chosen for feel first, spec sheet second.",
  "Tested hard, refined twice, shipped only when it earned it.",
];
const DESC_BODIES = [
  "Every component is chosen for durability, from the reinforced stress points to the hardware that still moves smoothly after a thousand cycles.",
  "The finish resists scuffs and fingerprints, so it looks the same in month twelve as it did on day one.",
  "Weight is balanced so it feels lighter in use than it does on paper, which matters more than the number on the box.",
  "It works out of the box with no setup ritual, and it keeps working when conditions get inconvenient.",
  "Serviceable by design: the parts that wear out first are the parts you can replace yourself.",
];
const DESC_CLOSERS = [
  "Backed by a two-year warranty and a returns process that does not fight you.",
  "Ships carbon-neutral in plastic-free packaging.",
  "Free 30-day returns, no restocking fee.",
  "Covered by our lifetime repair programme.",
];

const REVIEW_TITLES_HI = ["Exceeded expectations", "Worth every penny", "Would buy again", "Genuinely impressed", "Best purchase this year", "Exactly as described"];
const REVIEW_TITLES_MID = ["Good, with caveats", "Solid but not perfect", "Does the job", "Happy overall", "Decent value"];
const REVIEW_TITLES_LO = ["Not for me", "Expected more", "Disappointing", "Returned it"];
const REVIEW_BODIES_HI = [
  "Arrived two days early and the build quality is noticeably better than the one it replaced. Three weeks in and no complaints at all.",
  "I was sceptical at this price but the finish and the feel are excellent. My partner immediately ordered a second one.",
  "Does exactly what the listing says. Setup took under five minutes and it has been faultless since.",
  "Have put this through daily use and it still looks new. The attention to detail on the small parts is what sells it.",
];
const REVIEW_BODIES_MID = [
  "Very good overall, though the instructions could be clearer. Once set up it works well and I have no real regrets.",
  "Quality is there but I wish it came in more colours. Performance is exactly what I expected for the money.",
  "Slightly smaller than I pictured from the photos. Still a good buy, just measure first.",
  "Works well for everyday use. Not sure it justifies the premium over the cheaper model, but I do not regret it.",
];
const REVIEW_BODIES_LO = [
  "Mine developed a rattle after a fortnight. Support were responsive but I would not order again.",
  "Feels less substantial in person than the photos suggest. Returned it without much hassle, at least.",
  "It is fine, but for this price I expected the finish to be better than it is.",
];
const FIRST_NAMES = ["Ayesha", "Marcus", "Priya", "Tom", "Lena", "Chandan", "Sofia", "Daniel", "Noor", "Elliot", "Mei", "Jonas", "Rina", "Oscar", "Farah", "Isaac", "Yuki", "Grace", "Hassan", "Clara", "Dmitri", "Anika", "Leo", "Maya"];
const LAST_INITIALS = ["A.", "B.", "C.", "D.", "H.", "K.", "M.", "N.", "P.", "R.", "S.", "T.", "V.", "W."];

// --- helpers
const slugify = (s) =>
  s
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const priceIn = ([min, max]) => {
  const raw = rand() * (max - min) + min;
  const rounded = raw > 200 ? Math.round(raw / 10) * 10 : Math.round(raw);
  return Number((rounded - 0.01).toFixed(2));
};

const daysAgo = (n) => new Date(Date.parse("2026-09-18T09:00:00.000Z") - n * 86400000).toISOString();

function buildDescription(name, brand, sub) {
  return [
    `${pick(DESC_OPENERS)} The ${name} from ${brand} sits at the top of our ${sub.name.toLowerCase()} range.`,
    pick(DESC_BODIES),
    pick(DESC_BODIES),
    pick(DESC_CLOSERS),
  ].join(" ");
}

function buildSpecs(category, color) {
  const base = [
    { label: "Colour", value: color },
    { label: "Warranty", value: pick(["1 year", "2 years", "3 years", "Lifetime"]) },
    { label: "Ships from", value: pick(["London, UK", "Rotterdam, NL", "Dhaka, BD", "Austin, US"]) },
  ];
  const extra = {
    electronics: [
      { label: "Battery life", value: `${int(6, 40)} hours` },
      { label: "Connectivity", value: pick(["Bluetooth 5.3", "Wi-Fi 6E", "USB-C / 3.5mm", "Bluetooth 5.4 + LE Audio"]) },
      { label: "Weight", value: `${int(120, 2400)} g` },
    ],
    fashion: [
      { label: "Material", value: pick(["100% merino wool", "Organic cotton", "Full-grain leather", "Recycled polyester"]) },
      { label: "Care", value: pick(["Machine wash cold", "Dry clean only", "Hand wash, dry flat"]) },
      { label: "Fit", value: pick(["Regular", "Relaxed", "Slim", "Oversized"]) },
    ],
    "home-living": [
      { label: "Dimensions", value: `${int(20, 120)} x ${int(20, 80)} x ${int(5, 90)} cm` },
      { label: "Material", value: pick(["Solid oak", "Stoneware", "Enamelled cast iron", "Brushed steel"]) },
      { label: "Assembly", value: pick(["None required", "Tool-free, 10 min", "Two-person assembly"]) },
    ],
    beauty: [
      { label: "Volume", value: `${pick([30, 50, 100, 150, 250])} ml` },
      { label: "Skin type", value: pick(["All skin types", "Dry & dehydrated", "Oily & combination", "Sensitive"]) },
      { label: "Free from", value: "Parabens, sulphates, synthetic fragrance" },
    ],
    "sports-outdoors": [
      { label: "Weight", value: `${int(150, 4200)} g` },
      { label: "Season", value: pick(["3-season", "4-season", "All-year"]) },
      { label: "Water resistance", value: pick(["IPX4", "IPX7", "10,000 mm HH", "DWR coated"]) },
    ],
    gaming: [
      { label: "Refresh / polling", value: pick(["165 Hz", "240 Hz", "1000 Hz polling", "8000 Hz polling"]) },
      { label: "Switch / panel", value: pick(["Linear hot-swap", "Tactile brown", "Fast IPS", "OLED"]) },
      { label: "Connection", value: pick(["Wired USB-C", "2.4 GHz + BT", "Tri-mode"]) },
    ],
    workspace: [
      { label: "Load capacity", value: `${int(5, 120)} kg` },
      { label: "Adjustment range", value: `${int(60, 125)} cm` },
      { label: "Material", value: pick(["Powder-coated steel", "Bamboo veneer", "Recycled aluminium"]) },
    ],
  }[category];
  return [...extra, ...base];
}

function buildReviews(productId, rating, count) {
  const sample = Math.min(count, int(0, 7));
  const reviews = [];
  for (let i = 0; i < sample; i += 1) {
    // Cluster individual scores around the aggregate rating.
    const drift = float(-1.4, 1.1, 1);
    const score = Math.min(5, Math.max(1, Math.round(rating + drift)));
    const [titles, bodies] =
      score >= 4
        ? [REVIEW_TITLES_HI, REVIEW_BODIES_HI]
        : score === 3
          ? [REVIEW_TITLES_MID, REVIEW_BODIES_MID]
          : [REVIEW_TITLES_LO, REVIEW_BODIES_LO];
    reviews.push({
      id: `${productId}-r${i + 1}`,
      author: `${pick(FIRST_NAMES)} ${pick(LAST_INITIALS)}`,
      rating: score,
      title: pick(titles),
      body: pick(bodies),
      createdAt: daysAgo(int(1, 540)),
      verified: chance(0.78),
      helpfulCount: int(0, 96),
    });
  }
  return reviews.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

// --- generate
const products = [];
const usedSlugs = new Set();
let n = 0;

while (products.length < TARGET_COUNT) {
  const category = CATALOGUE[n % CATALOGUE.length];
  const sub = pick(category.subcategories);
  const brand = pick(category.brands);
  const noun = pick(sub.nouns);
  const name = `${pick(MATERIALS)} ${noun}${pick(EDITIONS)}`;
  const title = `${brand} ${name}`;

  let slug = slugify(title);
  if (usedSlugs.has(slug)) slug = `${slug}-${products.length + 1}`;
  usedSlugs.add(slug);

  const id = `p-${String(products.length + 1).padStart(4, "0")}`;
  const price = priceIn(sub.price);
  const onSale = chance(0.42);
  const compareAtPrice = onSale ? Number((price * float(1.12, 1.65, 2)).toFixed(2)) : null;
  const rating = Number(Math.min(5, Math.max(3.1, float(3.4, 5.05, 2))).toFixed(2));
  const reviewCount = Math.round(int(3, 900) * (rating / 5));
  const stock = chance(0.08) ? 0 : chance(0.16) ? int(1, 6) : int(7, 140);
  const color = pick(COLORS);

  products.push({
    id,
    slug,
    title,
    brand,
    category: category.slug,
    categoryName: category.name,
    subcategory: sub.slug,
    subcategoryName: sub.name,
    price,
    compareAtPrice,
    discountPercent: compareAtPrice ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) : 0,
    currency: "USD",
    rating,
    reviewCount,
    stock,
    sku: `${category.slug.slice(0, 3).toUpperCase()}-${slugify(brand).slice(0, 3).toUpperCase()}-${String(products.length + 1).padStart(4, "0")}`,
    color,
    tags: pickMany(TAGS, int(1, 3)),
    images: Array.from({ length: int(3, 4) }, (_, i) => ({
      url: `https://picsum.photos/seed/${slug}-${i + 1}/900/900`,
      alt: `${title} - view ${i + 1}`,
    })),
    thumbnail: `https://picsum.photos/seed/${slug}-1/600/600`,
    shortDescription: `${noun} in ${color.toLowerCase()} by ${brand}, built for everyday use.`,
    description: buildDescription(name, brand, sub),
    specs: buildSpecs(category.slug, color),
    unitsSold: int(0, 5200),
    featured: chance(0.06),
    freeShipping: price > 60 || chance(0.3),
    createdAt: daysAgo(int(1, 720)),
    reviews: buildReviews(id, rating, reviewCount),
  });
  n += 1;
}

const categories = CATALOGUE.map((c) => ({
  slug: c.slug,
  name: c.name,
  icon: c.icon,
  subcategories: c.subcategories.map(({ slug, name }) => ({ slug, name })),
  productCount: products.filter((p) => p.category === c.slug).length,
  image: `https://picsum.photos/seed/cat-${c.slug}/800/600`,
}));

const brands = [...new Set(products.map((p) => p.brand))].sort();

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(
  OUT,
  JSON.stringify({ generatedAt: "2026-09-18T09:00:00.000Z", products, categories, brands }),
);

console.log(`OK ${products.length} products - ${categories.length} categories - ${brands.length} brands`);
console.log(`OK ${products.reduce((a, p) => a + p.reviews.length, 0)} reviews -> ${OUT}`);
