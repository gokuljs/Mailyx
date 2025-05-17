declare module "lz4js" {
  /**
   * Compresses data using LZ4 algorithm
   * @param input - Input data as Uint8Array
   * @returns Compressed data as Uint8Array
   */
  export function compress(input: Uint8Array): Uint8Array;

  /**
   * Decompresses data that was compressed with LZ4 algorithm
   * @param input - Compressed data as Uint8Array
   * @returns Decompressed data as Uint8Array
   */
  export function decompress(input: Uint8Array): Uint8Array;
}
