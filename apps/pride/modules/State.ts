
import {reactive, inject, readonly, provide} from 'vue'
import PrideAPI from './PrideAPI'

class State {
    logo = './public/pride-view.png'
    pride = {...PrideAPI.data}
    immersiveMode = false

    async get() {
        await PrideAPI.get()
        this.pride = {...PrideAPI.data}
    }

    async back() {
        await PrideAPI.back()
        this.get()
    }

    async done(message?:string) {
        await PrideAPI.done(message)
        this.get()
    }

    start() {
        this.get()
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