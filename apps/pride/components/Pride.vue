
<template>
    <div id="pride" xr-pixel-ratio="0.01" v-bind:class="{xr:immersiveMode}">
        <div xr-layer id="procedure"><img xr-layer class="logo" :src="logo"/>Procedure: {{pride.procedure}}</div>
        <div id="flex"> 
            <div xr-layer id="content">
                <div id="step" xr-layer>Step: <span id="type">{{pride.elementSubType}}</span> {{pride.step}}</div>
                <div id="instruction" xr-layer>{{pride.instruction}}</div>
            </div>
            <div xr-layer xr-pixel-ratio="0.1" id="media">
                <video xr-layer id="video" loop webkit-playsinline playsinline="true" crossorigin="anonymous" muted v-show="pride.video" :src="pride.video"/>
                <img xr-layer id="image" crossorigin="anonymous" v-show="pride.image" :src="pride.image"/>
            </div>
            <div xr-layer id="model">
            </div>
        </div>
        <div id="controls">
            <div xr-layer class="button" id="back">Back</div>
            <div xr-layer class="button" id="done" v-show="['ManualInstruction', 'ClarifyingInfo', 'VerifyInstruction'].indexOf(pride.elementSubType) > -1">Done</div>
            <div xr-layer class="button" id="yes" v-show="pride.elementSubType === 'Conditional'">Yes</div>
            <div xr-layer class="button" id="no" v-show="pride.elementSubType === 'Conditional'">No</div>
            <div xr-layer class="button" id="no" v-show="pride.elementSubType === 'Bla'">Record</div>
            <div xr-layer class="button" id="immersive-toggle"><b>{{immersiveMode ? 'Flat' : 'Immersive'}}</b></div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import {useState} from './State'
export default defineComponent({
    setup() {
        return useState()
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
        :not(.xr) #flex {
            flex-direction: row;
        }
        :not(.xr) #content {
            flex: 2;
        }
        :not(.xr) #media {
            flex: 3;
        }
        :not(.xr) #model {
            flex: 3;
        }
    }

    .xr #model {
        flex: 0 0 0;
    }

    .logo {
        width: 40px;
        height: 40px;
        margin-right: 8px;
    }

    .button {
        float: left;
        font-size: 1.4em;
        border: 2px black solid;
        border-radius: 10px;
        box-sizing: border-box;
        background-color:white;
        padding: 5px;
        margin: 5px;
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
        border-radius: 10px;
        min-height: 0;
        margin: 5px;
    }
    
    #flex {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        margin: 5px;
        align-self: stretch;
    }
    
    #model {
        flex: 1;
        background-color: rgba(0,0,255,0.1);
        border-radius: 10px;
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
        border-radius: 10px;
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
    }
    
    #controls :hover {
        background-color: grey;
    }
    
    #immersive-toggle {
        float: right;
        background-color: black;
        color: white;
    }
</style>