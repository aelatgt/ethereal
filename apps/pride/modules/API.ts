const MOCK_PROCEDURES = {

}

// const BASE_URL = 'http://defiant3.local:8025/AR_server/'
const BASE_URL = 'https://prideview-ar.traclabs.com:8025/AR_server/'


export class InstructionType {
    static ManualInstruction = 'ManualInstruction' // value: none
    static Conditional = 'Conditional' // value: yes or no
    static ClarifyingInstruction = 'ClarifyingInstruction' // value: none
    static VerifyInstruction = 'VerifyInstruction' // value: none
    static RecordInstruction = 'RecordInstruction' // value: number
    static CallProcedureInstruction = 'CallProcedureInstruction' // value: none
}

export interface Augmentation {
    type: string
    position: {x: number, y: number, z: number}  // "x y z"
    rotation: {x: number, y: number, z: number}  // "x y z"
}

export interface LabelAugmentation extends Augmentation {
    type: 'label',
    text: string
}

export interface BoxAugmentation extends Augmentation {
    type: 'box'
    size: {x: number, y: number, z: number} // "x y z"
}

export interface SphereAugmentation extends Augmentation {
    type: 'sphere'
    radius: number
}

export interface HighlightAugmentation extends Augmentation {
    type: 'highlight'
}

// annotation1 = `type: box; position: 5 5 5; rotation: 0 90 0; size: 2 4 1;`
// annotation2 = `type: sphere; position: 5 5 5; rotation: 0 90 0; radius: 2;`
// annotation3 = `type: label; position: 5 5 5; rotation: 0 90 0; text: "hello world";`
// annotation4 = `type: highlight; color: "blue";`


const TREADMILL_PROCEDURE_NAME = 'T2_Monthly_Maintenance_Top_Level'
    
const data = {
    json: '',
    procedure: 'Treadmill Monthly Maintenance',
    step: '',
    instruction: 'Loading...',
    image: '',
    video: './public/armWiggleDemonstrated.mov',
    elementType: '' as 'Info'|'Instruction',
    elementSubType: '' as 'ManualInstruction'|'Conditional'|'RecordInstruction',
    objects: {} as {[name: string]: LabelAugmentation|BoxAugmentation|SphereAugmentation|HighlightAugmentation}
}

async function get() : Promise<any> {
    const response = await fetch(BASE_URL + 'ARready', {mode: 'cors'}).catch()
    const json = await response.json().catch()
    const steplist = json && json.procedureElementInfo && json.procedureElementInfo.steplist
    if (!steplist) {
        // sometimes server still processing
        return await get()
    }
    if (json.text === 'continue procedure') {
        await done()
        return await get()
    }
    data.json = json
    data.step = steplist[steplist.length - 1].title
    data.instruction = json.text
    data.elementType = json.procedureElementInfo.elementType
    data.elementSubType = json.procedureElementInfo.elementData[data.elementType.toLowerCase()+'Type']
    const objectKeys = Object.keys(json).filter((key) => key.toLowerCase().includes('object'))
    for (const key of objectKeys) {
        const jsonObject = json[key]
        const object = data.objects[jsonObject.name] = {} as any
        const properties = jsonObject.properties
        for (const propertyKey in properties) {
            if (propertyKey === 'realityaugmentation') {
                const augmentationProperties = properties[propertyKey].split(';')
                for (const prop of augmentationProperties) {
                    if (!prop) { continue }
                    let [name, value] = prop.split(':')
                    name = name.trim()
                    value = value.trim()
                    if (name === 'position' || name === 'rotation' || name === 'size') {
                        const [x, y, z] = value.split(' ').map((v: string) => parseFloat(v))
                        object[name] = {x, y, z}
                    } else {
                        object[name] = isNaN(value as any) ? value : parseFloat(value)
                    }
                }
            } else {
                object[propertyKey] = properties[propertyKey]
            }
        }
    }
    return json
}


async function getText() {
    const response = await fetch(BASE_URL + 'ARready', {mode: 'cors'})
    return response.text()
}

async function done(value = 'none') {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'done',
            value,
        }),
    })
    get()
    return result.json()
}


async function startProcedure(name: string) {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: name,
        }),
    })
    return result.json()
}

async function back() {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'back',
            value: 'none',
        }),
    })
    return result.json()
}

async function skip() {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'skip',
            value: 'none',
        }),
    })
    return result.json()
}

async function comment(value: string) {
    const result = await fetch(BASE_URL + 'ARready', {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify({
            action: 'comment',
            value,
        }),
    })
    return result.json()
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
}