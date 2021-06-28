
<template>
    <div class="label">{{message}}</div>
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