
<template>
    <div id="pride" xr-pixel-ratio="0.8" v-bind:class="{ xr: immersiveMode }">
        <link crossorigin="anonymous" href="https://fonts.googleapis.com/css?family=Inconsolata:400,700" rel="stylesheet"/>
        <link rel="stylesheet" href="./modules/Pride.css"/>
        <div xr-layer id="procedure"><img xr-layer class="logo" :src="logo"/>Procedure: {{pride.procedure}}</div>
        <div id="flex">
            <div xr-layer id="content">
                <div id="step" xr-layer>Step: <span id="type" xr-layer>{{pride.elementSubType}}</span> {{pride.step}}</div>
                <div id="instruction" xr-layer>{{pride.instruction}}</div>
            </div>
            <div xr-layer id="media">
                <video xr-layer id="video" loop webkit-playsinline playsinline="true" crossorigin="anonymous" muted v-show="pride.video" :src="pride.video"/>
                <img xr-layer id="image" crossorigin="anonymous" v-show="pride.image" :src="pride.image"/>
            </div>
            <div xr-layer id="model">
            </div>
        </div>
        <div id="controls" v-bind:class="{ worldInteraction: worldInteraction }" xr-layer>
            <div xr-layer class="button" id="back">Back</div>
            <div xr-layer class="button" id="done" v-show="['ManualInstruction', 'ClarifyingInfo', 'VerifyInstruction'].indexOf(pride.elementSubType) > -1">Done</div>
            <div xr-layer class="button" id="yes" v-show="pride.elementSubType === 'Conditional'">Yes</div>
            <div xr-layer class="button" id="no" v-show="pride.elementSubType === 'Conditional'">No</div>
            <div xr-layer class="button" id="record" v-show="pride.elementSubType === 'RecordInstruction'">Record</div>
            <div xr-layer class="button" id="immersive-toggle"><b>{{immersiveMode ? 'Flat' : 'Immersive Enter'}}</b></div>
        </div>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import {useState} from './PrideUI'
export default defineComponent({
    setup() {
        return useState()
    }
})
</script>