import * as THREE from 'three';
import * as ethereal from 'ethereal';
import { App } from '../main';
import { UpdateEvent } from '../app';
import Treadmill from './Treadmill';
export default class UI {
    private app;
    private treadmill;
    augmentations: {
        [name: string]: THREE.Object3D;
    };
    state: {
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
    prideVue: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, string>>;
    pride: ethereal.WebLayer3D;
    procedure: ethereal.WebLayer3DBase;
    step: ethereal.WebLayer3DBase;
    instruction: ethereal.WebLayer3DBase;
    content: ethereal.WebLayer3DBase;
    media: ethereal.WebLayer3DBase;
    image: ethereal.WebLayer3DBase;
    video: ethereal.WebLayer3DBase;
    model: ethereal.WebLayer3DBase;
    controls: ethereal.WebLayer3DBase;
    backButton: ethereal.WebLayer3DBase;
    doneButton: ethereal.WebLayer3DBase;
    yesButton: ethereal.WebLayer3DBase;
    noButton: ethereal.WebLayer3DBase;
    immersiveButton: ethereal.WebLayer3DBase;
    immersiveAnchor: THREE.Object3D;
    box: THREE.BoxHelper;
    constructor(app: App, treadmill: Treadmill);
    updateAugmentations(): void;
    update(event: UpdateEvent): void;
}
