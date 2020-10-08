
<template>
    <div id="pride" data-layer-pixel-ratio="1" v-bind:class="{xr:immersiveMode}">
        <div id="procedure" data-layer><img data-layer class="logo" :src="logo"/>Procedure: {{pride.procedure}}</div>
        <div id="step" data-layer>Step: <span id="type">{{pride.elementSubType}}</span> {{pride.step}}</div>
        <div data-layer id="content">
            <div id="instruction" data-layer>{{pride.instruction}}</div>
            <div data-layer data-layer-pixel-ratio="0.5" id="media">
                <video id="video" loop webkit-playsinline playsinline="true" crossorigin="anonymous" muted data-layer v-show="pride.video" :src="pride.video"/>
                <img id="image" crossorigin="anonymous" data-layer v-show="pride.image" :src="pride.image"/>
            </div>
            <div id="model" data-layer data-layer-pixel-ratio="0.5">
            </div>
        </div>
        <div id="controls">
            <div data-layer data-layer-hover-depth="1" class="button" id="back">Back</div>
            <div data-layer v-show="['ManualInstruction', 'ClarifyingInfo', 'VerifyInstruction'].indexOf(pride.elementSubType) > -1" data-layer-hover-depth="1" class="button" id="done">Done</div>
            <div data-layer v-show="pride.elementSubType === 'Conditional'" data-layer-hover-depth="1" class="button" id="yes">Yes</div>
            <div data-layer v-show="pride.elementSubType === 'Conditional'" data-layer-hover-depth="1" class="button" id="no">No</div>
            <div data-layer v-show="pride.elementSubType === 'Bla'" data-layer-hover-depth="1" class="button" id="no">Record</div>
            <div data-layer data-layer-hover-depth="1" id="immersive-toggle"><b>{{immersiveMode ? 'Flat' : 'Immersive'}}</b></div>
        </div>
    </div>
</template>

<script>
import {defineComponent, reactive} from 'vue'
import state from './state'
export default defineComponent({
    setup() {
        return reactive(state)
    }
})
</script>

<style scoped>
    #pride {
        padding: 5px;
        padding-top: calc(env(safe-area-inset-top) + 10px);
        padding-left: calc(env(safe-area-inset-left) + 5px);
        padding-right: calc(env(safe-area-inset-right) + 5px);
        padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
        display: flex;
        align-items: flex-start;
        flex-direction: column;
        min-height: 100%;
        /* background-color:rgba(255,255,255,0.7); */
        font-family: 'Inconsolata', monospace;
        background: linear-gradient(#bef67dcc, #7aece2cc);
        overflow: hidden;
        box-sizing: border-box;
        position: relative;
    }

    @media (min-width: 640px) {
        :not(.xr) #content {
            flex-direction: row;
        }
        :not(.xr) #instruction {
            flex: 2;
        }
        :not(.xr) #media {
            flex: 3;
        }
        :not(.xr) #model {
            flex: 3;
        }
    }

    /* .xr #content {
        flex-direction: row;
    }
    .xr #instruction {
        flex: 2;
    }
    .xr #media {
        flex: 3;
    }
    */
    .xr #model {
        flex: 0 0 0;
    }

    .logo {
        width: 40px;
        height: 40px;
        margin-right: 8px;
    }
    #procedure {
        /* background-color: transparent; */
        font-size: 26px;
        color:red;
        margin: 10px;
        margin-top: 0;
        margin-bottom:0;
    }
    #step {
        font-size: 16px;
        font-weight: bold;
        padding: 10px;
    }
    #type {
        background-color: rgb(0, 174, 255, 0.8);
        border-radius: 5px;
        display:inline;
        padding: 3px 5px;
    }
    #instruction {
        margin: 10px;
        padding: 10px;
        background-color: white;
        color: black;
        border-radius: 5px;
        min-height: 0;
        margin: 5px;
    }
    #content {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        margin: 5px;
        align-self: stretch;
    }
    #model {
        flex: 1;
        background-color: rgba(0,0,255,0.1);
        border-radius: 5px;
        margin: 5px;
    }
    #media {
        flex: 1;
        position: relative;
        margin: 5px;
        background-color: black;
        border-radius: 5px;
    }
    #video {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        margin: auto;
    }
    #controls {
        margin: 5px;
        align-self: stretch;
        --font-size: 1.4em;
    }
    #controls :hover {
        background-color: grey;
    }
    #immersive-toggle {
        float: right;
        background-color: black;
        color: white;
        border-radius: 10px;
        font-size: var(--font-size);
        margin: 5px;
        padding: 5px;
    }
    .button {
        float: left;
        font: var(--font-size) bold;
        font-family: 'Inconsolata', monospace;
        border: 2px black solid;
        border-radius: 10px;
        box-sizing: border-box;
        background-color:white;
        padding: 5px;
        margin: 5px;
    }
</style>