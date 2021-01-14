const MOCK_PROCEDURES = {};
// const BASE_URL = 'http://defiant3.local:8025/AR_server/'
const BASE_URL = 'https://prideview-ar.traclabs.com:8025/AR_server/';
let InstructionType = /** @class */ (() => {
    class InstructionType {
    }
    InstructionType.ManualInstruction = 'ManualInstruction'; // value: none
    InstructionType.Conditional = 'Conditional'; // value: yes or no
    InstructionType.ClarifyingInstruction = 'ClarifyingInstruction'; // value: none
    InstructionType.VerifyInstruction = 'VerifyInstruction'; // value: none
    InstructionType.RecordInstruction = 'RecordInstruction'; // value: number
    InstructionType.CallProcedureInstruction = 'CallProcedureInstruction'; // value: none
    return InstructionType;
})();
export { InstructionType };
// annotation1 = `type: box; position: 5 5 5; rotation: 0 90 0; size: 2 4 1;`
// annotation2 = `type: sphere; position: 5 5 5; rotation: 0 90 0; radius: 2;`
// annotation3 = `type: label; position: 5 5 5; rotation: 0 90 0; text: "hello world";`
// annotation4 = `type: highlight; color: "blue";`
const TREADMILL_PROCEDURE_NAME = 'T2_Monthly_Maintenance_Top_Level';
const data = {
    json: '',
    procedure: 'Treadmill Monthly Maintenance',
    step: '',
    instruction: 'test',
    image: '',
    video: process.env.PUBLIC_URL + 'armWiggleDemonstrated.mov',
    elementType: '',
    elementSubType: '',
    // video: 'https://prideview-ar.traclabs.com/a7e79a1a-acff-43df-a1dc-f12f6bfcd6c9/4529_T2_Monthly_Maintenance_Top_Level_files/armWiggleDemonstrated.mov',
    objects: {}
};
async function get() {
    const response = await fetch(BASE_URL + 'ARready', { mode: 'cors' }).catch();
    const json = await response.json().catch();
    const steplist = json && json.procedureElementInfo && json.procedureElementInfo.steplist;
    if (!steplist) {
        // sometimes server still processing
        return await get();
    }
    if (json.text === 'continue procedure') {
        await done();
        return await get();
    }
    data.json = json;
    data.step = steplist[steplist.length - 1].title;
    data.instruction = json.text;
    data.elementType = json.procedureElementInfo.elementType;
    data.elementSubType = json.procedureElementInfo.elementData[data.elementType.toLowerCase() + 'Type'];
    const objectKeys = Object.keys(json).filter((key) => key.toLowerCase().includes('object'));
    for (const key of objectKeys) {
        const jsonObject = json[key];
        const realityAugmentation = jsonObject.properties.realityaugmentation;
        if (!realityAugmentation) {
            continue;
        }
        const object = data.objects[jsonObject.name] = {};
        const augmentationProperties = realityAugmentation.split(';');
        for (const prop of augmentationProperties) {
            if (!prop) {
                continue;
            }
            let [name, value] = prop.split(':');
            name = name.trim();
            value = value.trim();
            if (name === 'position' || name === 'rotation' || name === 'size') {
                const [x, y, z] = value.split(' ').map((v) => parseFloat(v));
                object[name] = { x, y, z };
            }
            else {
                object[name] = isNaN(value) ? value : parseFloat(value);
            }
        }
    }
    return json;
}
async function getText() {
    const response = await fetch(BASE_URL + 'ARready', { mode: 'cors' });
    return response.text();
}
async function done(value = 'none') {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'done',
            value,
        }),
    });
    return result.json();
}
async function startProcedure(name) {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: name,
        }),
    });
    return result.json();
}
async function back() {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'back',
            value: 'none',
        }),
    });
    return result.json();
}
async function skip() {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'skip',
            value: 'none',
        }),
    });
    return result.json();
}
async function comment(value) {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'comment',
            value,
        }),
    });
    return result.json();
}
export default {
    data,
    get,
    getText,
    done,
    startProcedure,
    back,
    skip,
    comment
};
