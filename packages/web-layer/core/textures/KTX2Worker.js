import { KTX2BasisUniversalTextureWriter } from '@loaders.gl/textures';
const worker = self;
worker.onmessage = async (msg) => {
    try {
        const texture = await KTX2BasisUniversalTextureWriter.encode(msg.data, {
            useSRGB: true,
            encodeUASTC: true,
            mipmaps: true
        });
        const response = { texture };
        worker.postMessage(response, [texture]);
    }
    catch (err) {
        worker.postMessage({ error: err.message });
    }
};
