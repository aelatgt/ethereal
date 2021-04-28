declare class State {
    logo: string;
    pride: {
        json: string;
        procedure: string;
        step: string;
        instruction: string;
        image: string;
        video: string;
        elementType: "Info" | "Instruction";
        elementSubType: "ManualInstruction" | "Conditional";
        objects: {
            [name: string]: import("./PrideAPI").LabelAugmentation | import("./PrideAPI").BoxAugmentation | import("./PrideAPI").SphereAugmentation | import("./PrideAPI").HighlightAugmentation;
        };
    };
    immersiveMode: boolean;
    getPrideData(): Promise<void>;
    start(): this;
}
export declare function createState(): State;
export declare const STATE: unique symbol;
export declare function provideState(): void;
export declare function useState(): {
    readonly logo: string;
    readonly pride: {
        readonly json: string;
        readonly procedure: string;
        readonly step: string;
        readonly instruction: string;
        readonly image: string;
        readonly video: string;
        readonly elementType: "Info" | "Instruction";
        readonly elementSubType: "ManualInstruction" | "Conditional";
        readonly objects: {
            readonly [x: string]: {
                readonly type: "label";
                readonly text: string;
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
                readonly rotation: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
            } | {
                readonly type: "box";
                readonly size: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
                readonly rotation: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
            } | {
                readonly type: "sphere";
                readonly radius: number;
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
                readonly rotation: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
            } | {
                readonly type: "highlight";
                readonly position: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
                readonly rotation: {
                    readonly x: number;
                    readonly y: number;
                    readonly z: number;
                };
            };
        };
    };
    readonly immersiveMode: boolean;
    readonly getPrideData: () => Promise<void>;
    readonly start: () => State;
};
export type { State };
