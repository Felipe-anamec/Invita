/**
 * Server-side image sanitization and validation for Invita.
 * Ensures image buffers are valid, meet size constraints, and
 * strips privacy-sensitive EXIF/GPS segments from JPEG files.
 */

export interface DetectedImage {
  ext: string;
  mime: string;
}

export function detectImage(buffer: Buffer): DetectedImage | null {
  if (buffer.length < 4) return null;

  // JPEG (SOI: FF D8 FF)
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: ".jpg", mime: "image/jpeg" };
  }

  // PNG
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { ext: ".png", mime: "image/png" };
  }

  // WEBP (RIFF....WEBP)
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return { ext: ".webp", mime: "image/webp" };
  }

  return null;
}

/**
 * Strips EXIF (APP1), XMP, and IPTC (APP13) metadata segments from a JPEG buffer.
 * Preserves SOI, DQT (tables), DHT (huffman), SOF (frame), SOS (scan), and EOI.
 */
export function stripJpegMetadata(buffer: Buffer): Buffer {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return buffer;
  }

  const chunks: Buffer[] = [];
  // Add SOI (0xFF, 0xD8)
  chunks.push(buffer.subarray(0, 2));

  let offset = 2;
  const len = buffer.length;

  while (offset < len) {
    if (buffer[offset] !== 0xff) {
      // Corrupt or reached scan data
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Skip fill bytes
    while (offset < len && buffer[offset] === 0xff) {
      offset++;
    }

    if (offset >= len) break;
    const marker = buffer[offset++];

    // RST0-RST7 (D0-D7) or SOI (D8) have no length
    if (marker >= 0xd0 && marker <= 0xd7) {
      chunks.push(Buffer.from([0xff, marker]));
      continue;
    }

    // EOI (D9) - End of Image
    if (marker === 0xd9) {
      chunks.push(Buffer.from([0xff, 0xd9]));
      break;
    }

    // SOS (DA) - Start of Scan (image payload follows until EOI)
    if (marker === 0xda) {
      chunks.push(Buffer.from([0xff, 0xda]));
      chunks.push(buffer.subarray(offset));
      break;
    }

    // Read segment length (big-endian 16-bit, includes the 2 length bytes)
    if (offset + 1 >= len) break;
    const segmentLength = (buffer[offset] << 8) | buffer[offset + 1];

    if (segmentLength < 2 || offset + segmentLength > len) {
      // Invalid segment length, append remainder and stop
      chunks.push(buffer.subarray(offset - 2));
      break;
    }

    // Markers to strip:
    // 0xE1 = APP1 (Exif, XMP, TIFF headers containing GPS & metadata)
    // 0xE2 = APP2 (FlashPix, ICC profile if unwanted, etc)
    // 0xED = APP13 (Photoshop IPTC)
    // 0xFE = Comment marker
    const shouldStrip = marker === 0xe1 || marker === 0xed || marker === 0xfe;

    if (!shouldStrip) {
      chunks.push(buffer.subarray(offset - 2, offset + segmentLength));
    }

    offset += segmentLength;
  }

  return Buffer.concat(chunks);
}
