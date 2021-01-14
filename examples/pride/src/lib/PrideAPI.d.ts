export declare class InstructionType {
    static ManualInstruction: string;
    static Conditional: string;
    static ClarifyingInstruction: string;
    static VerifyInstruction: string;
    static RecordInstruction: string;
    static CallProcedureInstruction: string;
}
export interface Augmentation {
    type: string;
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
    };
}
export interface LabelAugmentation extends Augmentation {
    type: 'label';
    text: string;
}
export interface BoxAugmentation extends Augmentation {
    type: 'box';
    size: {
        x: number;
        y: number;
        z: number;
    };
}
export interface SphereAugmentation extends Augmentation {
    type: 'sphere';
    radius: number;
}
export interface HighlightAugmentation extends Augmentation {
    type: 'highlight';
}
declare function get(): Promise<any>;
declare function getText(): Promise<string>;
declare function done(value?: string): Promise<any>;
declare function startProcedure(name: string): Promise<any>;
declare function back(): Promise<any>;
declare function skip(): Promise<any>;
declare function comment(value: string): Promise<any>;
declare const _default: {
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
            [name: string]: LabelAugmentation | BoxAugmentation | SphereAugmentation | HighlightAugmentation;
        };
    };
    get: typeof get;
    getText: typeof getText;
    done: typeof done;
    startProcedure: typeof startProcedure;
    back: typeof back;
    skip: typeof skip;
    comment: typeof comment;
};
export default _default;
