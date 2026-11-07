import { describe, it, expect } from "vitest";
import { detectImage, stripJpegMetadata } from "@/lib/image-sanitize";

describe("image-sanitize", () => {
  it("correctly detects valid JPEG, PNG, and WebP", () => {
    const jpegBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    expect(detectImage(jpegBuffer)).toEqual({ ext: ".jpg", mime: "image/jpeg" });

    const pngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
    expect(detectImage(pngBuffer)).toEqual({ ext: ".png", mime: "image/png" });

    const webpBuffer = Buffer.from([
      0x52, 0x49, 0x46, 0x46, 0x20, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    expect(detectImage(webpBuffer)).toEqual({ ext: ".webp", mime: "image/webp" });

    const invalidBuffer = Buffer.from([0x00, 0x01, 0x02, 0x03]);
    expect(detectImage(invalidBuffer)).toBeNull();
  });

  it("strips APP1 (EXIF) and Comment markers from JPEG buffer", () => {
    // Construct minimal JPEG:
    // SOI (FF D8)
    // APP1 (FF E1, len 00 08, dummy exif payload: 42 42 42 42 42 42)
    // DQT (FF DB, len 00 04, 11 22)
    // SOS (FF DA, len 00 02)
    // Scan bytes: 99 88
    // EOI (FF D9)
    const jpegWithExif = Buffer.from([
      0xff, 0xd8, 0xff, 0xe1, 0x00, 0x08, 0x42, 0x42, 0x42, 0x42, 0x42, 0x42, 0xff, 0xdb, 0x00,
      0x04, 0x11, 0x22, 0xff, 0xda, 0x00, 0x02, 0x99, 0x88, 0xff, 0xd9,
    ]);

    const sanitized = stripJpegMetadata(jpegWithExif);

    // Verify APP1 marker (FF E1) is completely gone
    expect(sanitized.includes(Buffer.from([0xff, 0xe1]))).toBe(false);
    // Verify DQT (FF DB) is preserved
    expect(sanitized.includes(Buffer.from([0xff, 0xdb]))).toBe(true);
    // Verify SOI and EOI are intact
    expect(sanitized[0]).toBe(0xff);
    expect(sanitized[1]).toBe(0xd8);
    expect(sanitized[sanitized.length - 2]).toBe(0xff);
    expect(sanitized[sanitized.length - 1]).toBe(0xd9);
  });
});
