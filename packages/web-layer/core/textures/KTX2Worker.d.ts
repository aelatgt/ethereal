import type { ImageDataType } from '@loaders.gl/images';
/**
 * Encodes image to Basis Universal Supercompressed GPU Texture.
 * @param image
 * @param options
 */
export declare function encodeKTX2BasisTexture(image: ImageDataType, options?: {
    useSRGB?: boolean;
    qualityLevel?: number;
    encodeUASTC?: boolean;
    mipmaps?: boolean;
}): Promise<ArrayBuffer>;
