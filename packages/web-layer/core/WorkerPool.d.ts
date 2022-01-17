/**
 * @author Deepkolos / https://github.com/deepkolos
 */
export declare class WorkerPool {
    pool: number;
    queue: {
        resolve: Function;
        msg: any;
        transfer: Transferable[];
    }[];
    workers: Worker[];
    workersResolve: Function[];
    workerStatus: number;
    private workerCreator?;
    constructor(pool?: number);
    _initWorker(workerId: number): void;
    _getIdleWorker(): number;
    _onMessage(workerId: number, msg: MessageEvent): void;
    setWorkerCreator(workerCreator: () => Worker): void;
    setWorkerLimit(pool: number): void;
    postMessage<T = any>(msg: any, transfer: Transferable[]): Promise<MessageEvent<T>>;
    dispose(): void;
}
