
import {reactive, inject, readonly, provide} from 'vue'
import PrideAPI from '../lib/PrideAPI'

class State {
    logo = './public/pride-view.png'
    pride = {...PrideAPI.data}
    immersiveMode = false

    async getPrideData() {
        await PrideAPI.get()
        this.pride = {...PrideAPI.data}
    }

    start() {
        this.getPrideData()
        setInterval(() => {
            this.getPrideData()
        }, 5000)
        return this
    }
}

export function createState() {
    return reactive(new State).start()
}

export const STATE = Symbol('state')
export function provideState() {
    return provide(STATE, createState())
}

export function useState() {
    return readonly(inject(STATE) as State)
}

export type {State}