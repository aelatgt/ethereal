import {reactive, inject, readonly, createApp} from 'vue'
import LabelVue from './Label.vue'

function createState() {
    return reactive({
        message:''
    })
}

const STATE = Symbol('state')

export function useState() {
    return readonly(inject(STATE) as ReturnType<typeof createState>)
}

export function createLabelUI(message='') {
    const state = createState()
    state.message = message
    const vue = createApp(LabelVue).provide(STATE, state).mount(document.createElement('div'))
    return {state, vue}
}