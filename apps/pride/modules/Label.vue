
<template>
    <div class="label">
        <link rel="stylesheet" href="./modules/Label.css"/>
        <link crossorigin="anonymous" href="https://fonts.googleapis.com/css?family=Inconsolata:400,700" rel="stylesheet"/>
        <span>{{message}}</span>
    </div>
</template>

<script>
import {defineComponent} from 'vue'
import {useState} from './LabelUI'
export default defineComponent({
    setup() {
        return useState()
    }
})
</script>