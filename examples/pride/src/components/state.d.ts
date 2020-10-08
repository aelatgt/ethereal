declare const _default: {
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
            [name: string]: import("../lib/PrideAPI").LabelAugmentation | import("../lib/PrideAPI").BoxAugmentation | import("../lib/PrideAPI").SphereAugmentation | import("../lib/PrideAPI").HighlightAugmentation;
        };
    };
    immersiveMode: boolean;
};
export default _default;
