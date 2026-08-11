/**
 * mock-storefront.ts — Local mock of the Shopify Storefront API.
 *
 * Mirrors the GraphQL response shape so the same loaders can be
 * pointed at a real Shopify store later by changing the endpoint.
 *
 * Three products for CLUB 001 / VIRTU:
 * - private-club-tee (white, blue ink)
 * - air-ball-tee (brown, white type)
 * - less-talk-tee (black, magenta lips)
 */

export type Money = {
  amount: string;
  currencyCode: "BRL" | "USD";
};

export type Image = {
  url: string;
  altText: string;
  width: number;
  height: number;
};

export type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: { name: string; value: string }[];
};

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  shortDescription: string;
  collection: string;
  tags: string[];
  images: Image[];
  variants: Variant[];
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
};

// SVG placeholder generator — produces a black tee with the back-print
// motif rendered as text. Dark background = at-rest display.
function makeSvgPlaceholder({
  baseColor,
  printText,
  printColor,
  frontText,
  fontSize = 96,
}: {
  baseColor: string;
  printText: string;
  printColor: string;
  frontText?: string;
  fontSize?: number;
}): string {
  const front = frontText
    ? `<text x="120" y="120" font-family="Michroma, sans-serif" font-size="10" fill="#f5f5f0" text-anchor="middle">${frontText}</text>`
    : "";
  // Truncate long print text into multiple lines
  const words = printText.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).length > 10) {
      if (cur) lines.push(cur.trim());
      cur = w;
    } else {
      cur = (cur + " " + w).trim();
    }
  }
  if (cur) lines.push(cur);
  const lineH = fontSize * 1.05;
  const startY = 540 - (lines.length - 1) * (lineH / 2);
  const tshirt = `<path d="M 80 100 L 160 80 L 220 110 L 280 110 L 340 100 L 380 160 L 360 200 L 320 180 L 320 540 L 140 540 L 140 180 L 100 200 L 80 160 Z" fill="${baseColor}" stroke="#1a1a1a" stroke-width="1"/>`;
  const printLines = lines
    .map((l, i) => {
      const y = startY + i * lineH;
      return `<text x="230" y="${y}" font-family="Michroma, sans-serif" font-size="${fontSize}" font-weight="700" fill="${printColor}" text-anchor="middle" letter-spacing="-2">${l.toUpperCase()}</text>`;
    })
    .join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="460" height="600" viewBox="0 0 460 600">
    <rect width="460" height="600" fill="#0a0a0a"/>
    ${tshirt}
    ${front}
    ${printLines}
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SIZES = ["P", "M", " G", "GG"];

export const PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/private-club-tee",
    handle: "private-club-tee",
    title: "PRIVATE CLUB TEE",
    description:
      "A estampa traseira celebra as noites que se tornaram histórias: Absolut, palmeira, gelo e o lema que se tornou manifesto. Logo O PRÍNCIPE bordado no peito esquerdo.",
    shortDescription:
      "Branca. Logo O PRÍNCIPE no peito. Estampa traseira xerográfica azul — Absolut, palmeira, relógio, gelo + texto serifado.",
    collection: "club-001-virtu",
    tags: ["viridiana", "white", "streetwear", "club-001"],
    images: [
      {
        url: makeSvgPlaceholder({
          baseColor: "#f5f5f0",
          printText: "WE DONT REMEMBER EVERY NIGHT",
          printColor: "#1f4ad6",
          frontText: "O PRINCIPE",
        }),
        altText: "Private Club Tee — frente",
        width: 460,
        height: 600,
      },
      {
        url: makeSvgPlaceholder({
          baseColor: "#f5f5f0",
          printText: "ABSOLUT VODKA PARTY VIBES GOOD FRIENDS GOOD DRINKS GOOD STORIES",
          printColor: "#1f4ad6",
          frontText: "",
          fontSize: 28,
        }),
        altText: "Private Club Tee — traseira",
        width: 460,
        height: 600,
      },
    ],
    variants: SIZES.map((s, i) => ({
      id: `gid://shopify/ProductVariant/private-club-${s}`,
      title: s,
      availableForSale: true,
      price: { amount: "249.00", currencyCode: "BRL" },
      selectedOptions: [{ name: "Tamanho", value: s }],
    })),
    priceRange: {
      minVariantPrice: { amount: "249.00", currencyCode: "BRL" },
      maxVariantPrice: { amount: "249.00", currencyCode: "BRL" },
    },
  },
  {
    id: "gid://shopify/Product/air-ball-tee",
    handle: "air-ball-tee",
    title: "HOLY F*CKING AIR BALL TEE",
    description:
      "Tipografia display condensada em branco, maximalismo de rua, selo dourado como selo de autenticidade. Não peça desculpas pelo erro — vista a consequência.",
    shortDescription:
      "Marrom. Tipografia display gigante HOLY F*CKING AIR BALL em branco + selo dourado.",
    collection: "club-001-virtu",
    tags: ["maximalism", "brown", "streetwear", "club-001"],
    images: [
      {
        url: makeSvgPlaceholder({
          baseColor: "#3a261a",
          printText: "HOLY FCKING AIR BALL",
          printColor: "#f5f5f0",
          fontSize: 56,
        }),
        altText: "Air Ball Tee — traseira",
        width: 460,
        height: 600,
      },
      {
        url: makeSvgPlaceholder({
          baseColor: "#3a261a",
          printText: "",
          printColor: "#f5f5f0",
        }),
        altText: "Air Ball Tee — frente",
        width: 460,
        height: 600,
      },
    ],
    variants: SIZES.map((s) => ({
      id: `gid://shopify/ProductVariant/air-ball-${s}`,
      title: s,
      availableForSale: true,
      price: { amount: "269.00", currencyCode: "BRL" },
      selectedOptions: [{ name: "Tamanho", value: s }],
    })),
    priceRange: {
      minVariantPrice: { amount: "269.00", currencyCode: "BRL" },
      maxVariantPrice: { amount: "269.00", currencyCode: "BRL" },
    },
  },
  {
    id: "gid://shopify/Product/less-talk-tee",
    handle: "less-talk-tee",
    title: "LESS TALK MORE RESULTS TEE",
    description:
      "Boca magenta como troféu. Slogan curvado em volta como lei. Logo O PRÍNCIPE bordado no peito esquerdo + símbolos brancos discretos. Para quem não pede desculpa.",
    shortDescription:
      "Preta. Logo O PRINCIPE no peito. Estampa traseira com boca magenta gigante + LESS TALK MORE RESULTS.",
    collection: "club-001-virtu",
    tags: ["nightlife", "black", "streetwear", "club-001"],
    images: [
      {
        url: makeSvgPlaceholder({
          baseColor: "#0a0a0a",
          printText: "LESS TALK MORE RESULTS",
          printColor: "#c9148e",
          frontText: "O PRINCIPE",
          fontSize: 38,
        }),
        altText: "Less Talk Tee — frente",
        width: 460,
        height: 600,
      },
      {
        url: makeSvgPlaceholder({
          baseColor: "#0a0a0a",
          printText: "MORE RESULTS",
          printColor: "#c9148e",
          fontSize: 48,
        }),
        altText: "Less Talk Tee — traseira",
        width: 460,
        height: 600,
      },
    ],
    variants: SIZES.map((s) => ({
      id: `gid://shopify/ProductVariant/less-talk-${s}`,
      title: s,
      availableForSale: true,
      price: { amount: "259.00", currencyCode: "BRL" },
      selectedOptions: [{ name: "Tamanho", value: s }],
    })),
    priceRange: {
      minVariantPrice: { amount: "259.00", currencyCode: "BRL" },
      maxVariantPrice: { amount: "259.00", currencyCode: "BRL" },
    },
  },
];

export type CartLine = {
  id: string; // composite: variantId + "::" + size
  productId: string;
  productHandle: string;
  productTitle: string;
  variantTitle: string;
  image: string;
  price: Money;
  quantity: number;
};

export function getProductByHandle(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function getProductsByCollection(slug: string): Product[] {
  return PRODUCTS.filter((p) => p.collection === slug);
}


export function cartTotal(lines: CartLine[]): { subtotal: number; count: number } {
  const subtotal = lines.reduce((sum, l) => sum + Number(l.price.amount) * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  return { subtotal, count };
}

export function formatMoney(m: Money): string {
  const n = Number(m.amount);
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: m.currencyCode,
    minimumFractionDigits: 2,
  });
}