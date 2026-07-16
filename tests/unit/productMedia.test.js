import { describe, it, expect } from "vitest";
import { resolveProductImages } from "../../src/utils/productMedia.js";

describe("resolveProductImages", () => {
  it("explicit images always win", () => {
    const product = {
      slug: "x",
      images: ["/assets/products/x/01.jpg", null, "/assets/products/x/02.jpg"],
      imageFolder: "/assets/products/x",
      imageCount: 5,
    };
    expect(resolveProductImages(product)).toEqual([
      "/assets/products/x/01.jpg",
      "/assets/products/x/02.jpg",
    ]);
  });

  it("returns [] when there is no folder or count", () => {
    expect(resolveProductImages({ slug: "x", images: [] })).toEqual([]);
    expect(resolveProductImages({ images: [], imageCount: 3 })).toEqual([]);
    expect(resolveProductImages(null)).toEqual([]);
  });

  it("builds zero-padded convention paths from the folder + count", () => {
    const paths = resolveProductImages({
      slug: "test-tee",
      images: [],
      imageFolder: "/assets/products/test-tee",
      imageCount: 2,
    });
    expect(paths).toHaveLength(2);
    expect(paths[0]).toMatch(/^\/assets\/products\/test-tee\/01\.\w+$/);
    expect(paths[1]).toMatch(/^\/assets\/products\/test-tee\/02\.\w+$/);
  });

  it("derives the folder from the slug when only a count is given", () => {
    const paths = resolveProductImages({ slug: "auto", images: [], imageCount: 1 });
    expect(paths[0].startsWith("/assets/products/auto/01.")).toBe(true);
  });
});
