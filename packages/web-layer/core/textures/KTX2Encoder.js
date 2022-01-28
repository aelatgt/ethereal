import KTX2WorkerBody from './KTX2Worker.bundle.txt?raw';
import { WorkerPool } from '../WorkerPool';
const workerBlob = new Blob([KTX2WorkerBody], { type: "text/javascript" });
const workerURL = URL.createObjectURL(workerBlob);
export class KTX2Encoder {
    pool = new WorkerPool(2);
    constructor() {
        this.pool.setWorkerCreator(() => new Worker(workerURL));
    }
    async encode(imageData) {
        const responseMessage = await this.pool.postMessage(imageData, [imageData.data.buffer]);
        if (responseMessage.data.error)
            throw new Error(responseMessage.data.error);
        if (!responseMessage.data.texture)
            throw new Error('Encoding failed');
        return responseMessage.data.texture;
    }
}
