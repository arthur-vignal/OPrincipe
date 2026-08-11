/**
 * shopify.server.ts — Storefront API GraphQL client.
 *
 * Wraps fetch with the Storefront API token. Designed so the rest
 * of the app can stay typed on a local Product/Variant interface
 * identical to the old mock — swap the loader calls, keep the UI.
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN ?? "";
const TOKEN = process.env.SHOPIFY_STOREFRONT_API_TOKEN ?? "";
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-10";

export const STOREFRONT_API_ENDPOINT = `https://${DOMAIN}/api/${API_VERSION}/graphql.json`;

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; locations?: unknown[] }>;
};

export async function storefrontFetch<T>({
  query,
  variables,
  cache = "no-store",
}: {
  query: string;
  variables?: Record<string, unknown>;
  cache?: RequestCache;
}): Promise<T> {
  if (!DOMAIN || !TOKEN) {
    throw new Error(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_STOREFRONT_API_TOKEN env vars",
    );
  }
  const res = await fetch(STOREFRONT_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    cache,
  });
  if (!res.ok) {
    throw new Error(`Shopify fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(
      `Shopify GraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`,
    );
  }
  if (!json.data) {
    throw new Error("Shopify returned no data");
  }
  return json.data;
}

// ---------- Queries ----------

const PRODUCT_FRAGMENT = /* GraphQL */ `
  fragment ProductFields on Product {
    id
    handle
    title
    descriptionHtml
    productType
    tags
    featuredImage {
      url
      altText
      width
      height
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    variants(first: 25) {
      edges {
        node {
          id
          title
          availableForSale
          price {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
        }
      }
    }
    collections(first: 5) {
      edges {
        node {
          handle
          title
        }
      }
    }
  }
`;

export const ALL_PRODUCTS_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query AllProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          ...ProductFields
        }
      }
    }
  }
`;

export const PRODUCT_BY_HANDLE_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductByHandle($handle: String!) {
    product(handle: $handle) {
      ...ProductFields
    }
  }
`;

export const PRODUCTS_BY_COLLECTION_QUERY = /* GraphQL */ `
  ${PRODUCT_FRAGMENT}
  query ProductsByCollection($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      products(first: $first) {
        edges {
          node {
            ...ProductFields
          }
        }
      }
    }
  }
`;

// ---------- Adapter ----------
// Maps the Shopify response shape to the local Product/Variant types
// used by the existing UI (mock-storefront.ts). Keeps the route
// loaders identical to before — only the source changes.

import type { Product, Variant, Image, Money } from "./mock-storefront";

type ShopifyVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: Money;
  selectedOptions: Array<{ name: string; value: string }>;
};
type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};
type ShopifyProductNode = {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  productType: string | null;
  tags: string[];
  featuredImage: ShopifyImage | null;
  images: { edges: Array<{ node: ShopifyImage }> };
  priceRange: { minVariantPrice: Money; maxVariantPrice: Money };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  collections: { edges: Array<{ node: { handle: string; title: string } }> };
};

function adaptImage(node: ShopifyImage, fallbackTitle: string): Image {
  return {
    url: node.url,
    altText: node.altText ?? fallbackTitle,
    width: node.width ?? 800,
    height: node.height ?? 1000,
  };
}

function adaptVariant(node: ShopifyVariant): Variant {
  return {
    id: node.id,
    title: node.title,
    availableForSale: node.availableForSale,
    price: node.price,
    selectedOptions: node.selectedOptions,
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

function adaptProduct(node: ShopifyProductNode): Product {
  const images = node.images.edges.map((e) => adaptImage(e.node, node.title));
  const variants = node.variants.edges.map((e) => adaptVariant(e.node));
  const collectionHandle =
    node.collections.edges[0]?.node.handle ?? "all";
  return {
    id: node.id,
    handle: node.handle,
    title: node.title,
    description: stripHtml(node.descriptionHtml),
    shortDescription: stripHtml(node.descriptionHtml).slice(0, 240),
    collection: collectionHandle,
    tags: node.tags,
    images: images.length > 0 ? images : (node.featuredImage ? [adaptImage(node.featuredImage, node.title)] : []),
    variants,
    priceRange: node.priceRange,
  };
}

export async function fetchAllProducts(limit = 25): Promise<Product[]> {
  const data = await storefrontFetch<{
    products: { edges: Array<{ node: ShopifyProductNode }> };
  }>({
    query: ALL_PRODUCTS_QUERY,
    variables: { first: limit },
  });
  return data.products.edges.map((e) => adaptProduct(e.node));
}

export async function fetchProductByHandle(
  handle: string,
): Promise<Product | null> {
  const data = await storefrontFetch<{ product: ShopifyProductNode | null }>({
    query: PRODUCT_BY_HANDLE_QUERY,
    variables: { handle },
  });
  return data.product ? adaptProduct(data.product) : null;
}

export async function fetchProductsByCollection(
  handle: string,
  limit = 25,
): Promise<Product[]> {
  const data = await storefrontFetch<{
    collection: { products: { edges: Array<{ node: ShopifyProductNode }> } } | null;
  }>({
    query: PRODUCTS_BY_COLLECTION_QUERY,
    variables: { handle, first: limit },
  });
  return data.collection
    ? data.collection.products.edges.map((e) => adaptProduct(e.node))
    : [];
}