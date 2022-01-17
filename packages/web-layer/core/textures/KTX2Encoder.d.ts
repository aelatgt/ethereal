import { WorkerPool } from '../WorkerPool';
import { ImageDataType } from '@loaders.gl/images';
export declare type EncodeResponse = {
    texture: ArrayBuffer;
    error?: string;
};
export declare class KTX2Encoder {
    pool: WorkerPool;
    constructor();
    encode(imageData: ImageDataType): Promise<ArrayBuffer>;
}
