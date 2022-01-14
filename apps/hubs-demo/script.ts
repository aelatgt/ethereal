import * as THREE from 'three'
import {toDOM} from '@etherealjs/web-layer/core'
import {WebContainer3D} from '@etherealjs/web-layer/three'

const simpleDiv = toDOM('<div id="hello" style="width: 100px; height: 30px; background:red; position:absolute">Hi there!</div>')
const simpleLayer = new WebContainer3D(simpleDiv)
const simpleContainer = new THREE.Object3D
simpleContainer.position.set(3.16, 1.7, 34)
simpleContainer.matrixAutoUpdate = true
simpleContainer.add(simpleLayer)
simpleLayer.contentMesh.matrixAutoUpdate = true

var box = new THREE.Box3().setFromObject(simpleLayer)

declare const APP:any
const scene = APP.scene.object3D as THREE.Scene
scene.add(simpleContainer)

setInterval(() => {
    simpleLayer.update()
}, 50)


import Card from './Card.vue'
import {createApp} from 'vue'

const getURL = (path:string) => new URL(path, (document.currentScript as HTMLScriptElement).src).href;

const cardVue = createApp(Card, {
    data() {
        return {
            name: '10 Best Things to Do in Seattle',
            category: 'Travel',
            image: getURL('./pike-place.jpg'),
            author: 'Gheric Speiginer',
            desc: `Seattle is a seaport city on the west coast of the United States...`
        }
    }
}).mount(document.createElement('div'))


const cardLayer = new WebContainer3D(cardVue.$el)
scene.add(cardLayer)


setInterval(() => {
    cardLayer.update()
}, 50)