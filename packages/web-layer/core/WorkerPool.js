/**
 * @author Deepkolos / https://github.com/deepkolos
 */
export class WorkerPool {
    limit;
    queue = [];
    workers = [];
    workersResolve = [];
    workerStatus = 0;
    workerCreator;
    constructor(pool = 4) {
        this.limit = pool;
    }
    _initWorker(workerId) {
        if (!this.workers[workerId]) {
            const worker = this.workerCreator();
            worker.addEventListener('message', this._onMessage.bind(this, workerId));
            this.workers[workerId] = worker;
        }
    }
    _getIdleWorker() {
        for (let i = 0; i < this.limit; i++)
            if (!(this.workerStatus & (1 << i)))
                return i;
        return -1;
    }
    _onMessage(workerId, msg) {
        const resolve = this.workersResolve[workerId];
        resolve && resolve(msg);
        if (this.queue.length) {
            const { resolve, msg, transfer } = this.queue.shift();
            this.workersResolve[workerId] = resolve;
            this.workers[workerId].postMessage(msg, transfer);
        }
        else {
            this.workerStatus ^= 1 << workerId;
        }
    }
    setWorkerCreator(workerCreator) {
        this.workerCreator = workerCreator;
    }
    setWorkerLimit(pool) {
        this.limit = pool;
    }
    postMessage(msg, transfer) {
        return new Promise((resolve) => {
            const workerId = this._getIdleWorker();
            if (workerId !== -1) {
                this._initWorker(workerId);
                this.workerStatus |= 1 << workerId;
                this.workersResolve[workerId] = resolve;
                this.workers[workerId].postMessage(msg, transfer);
            }
            else {
                this.queue.push({ resolve, msg, transfer });
            }
        });
    }
    dispose() {
        this.workers.forEach((worker) => worker.terminate());
        this.workersResolve.length = 0;
        this.workers.length = 0;
        this.queue.length = 0;
        this.workerStatus = 0;
    }
}
