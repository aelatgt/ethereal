import AppBase from './App';
import Treadmill from './components/Treadmill';
import UI from './components/UI';
import * as ethereal from 'ethereal';
declare module 'three/src/core/BufferGeometry' {
    interface BufferGeometry {
        computeBoundsTree(): void;
        disposeBoundsTree(): void;
        boundsTree?: any;
    }
}
export declare class App extends AppBase {
    pride: {
        data: {
            json: string;
            procedure: string;
            step: string;
            instruction: string;
            image: string;
            video: string;
            elementType: "Info" | "Instruction";
            elementSubType: "ManualInstruction" | "Conditional";
            objects: {
                [name: string]: import("./lib/PrideAPI").LabelAugmentation | import("./lib/PrideAPI").BoxAugmentation | import("./lib/PrideAPI").SphereAugmentation | import("./lib/PrideAPI").HighlightAugmentation;
            };
        };
        get: () => Promise<any>;
        getText: () => Promise<string>;
        done: (value?: string) => Promise<any>;
        startProcedure: (name: string) => Promise<any>;
        back: () => Promise<any>;
        skip: () => Promise<any>;
        comment: (value: string) => Promise<any>;
    };
    system: ethereal.EtherealSystem<ethereal.Node3D>;
    treadmill: Treadmill;
    ui: UI;
    ethereal: typeof ethereal;
}
