
import {reactive, inject, readonly, provide, createApp} from 'vue'
import PrideVue from './Pride.vue'
import PrideAPI from './API'

class State {
    logo = './public/pride-view.png'
    pride = {...PrideAPI.data}
    immersiveMode = false
    worldInteraction = false

    async get() {
        // await PrideAPI.get()
        this.pride = {...PrideAPI.data}
    }

    async back() {
        await PrideAPI.back()
        this.get()
    }

    async done(message?:string) {
        // await PrideAPI.done(message)
        this.get()
    }

    start() {
        this.get()
        return this
    }
}

export type {State}

const STATE = Symbol('state')

export function useState() {
    return readonly(inject(STATE) as State)
}

export function createPrideUI() {
    const state = reactive(new State).start()
    const vue = createApp(PrideVue).provide(STATE, state).mount(document.createElement('div'))
    return {state, vue}
}