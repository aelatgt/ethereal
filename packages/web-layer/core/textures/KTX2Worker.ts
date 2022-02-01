
import { KTX2BasisUniversalTextureWriter } from '@loaders.gl/textures';
import type { ImageDataType } from '@loaders.gl/images';
import type { EncodeResponse } from './KTX2Encoder'

const worker: Worker = self as any;

worker.onmessage = async (msg:MessageEvent<ImageDataType>) => {
    try {
        const texture = await KTX2BasisUniversalTextureWriter.encode(msg.data, {
            useSRGB: true,
            encodeUASTC: true,
            mipmaps: true
        })
        const response : EncodeResponse = {texture}
        worker.postMessage(response, [texture])
    } catch (err:any) {
        worker.postMessage({error:err.message})
    }
}
