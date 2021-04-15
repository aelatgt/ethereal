import * as THREE from 'three'

export function makeTextSprite( message: string, parameters: {
      fontface?: string,
      fontsize?: number,
      padding?: number
      borderThickness?: number,
      borderColor?: string,
      backgroundColor?: string,
      pixelRatio?: number,
    } ) {
  if ( parameters === undefined ) { parameters = {} }

  const pixelRatio = parameters.pixelRatio !== undefined ?
    parameters.pixelRatio : window.devicePixelRatio

  const fontface = parameters.fontface !== undefined ?
    parameters.fontface : 'Arial'

  const fontsize = (parameters.fontsize !== undefined ?
    parameters.fontsize : 18) * pixelRatio

  const padding = (parameters.padding !== undefined ?
    parameters.padding : 3) * pixelRatio

  const borderThickness = (parameters.borderThickness !== undefined ?
    parameters.borderThickness : 2) * pixelRatio

  const borderColor = parameters.borderColor !== undefined ?
    parameters.borderColor : 'rgba(0,0,0,1)'

  const backgroundColor = parameters.backgroundColor !== undefined ?
    parameters.backgroundColor : 'rgba(255,255,255,1.0)'

  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')!
  context.font = 'Bold ' + fontsize + 'px ' + fontface

  // get size data (height depends only on font size)
  const metrics = context.measureText( message )
  const textWidth = metrics.width + padding * 2
  const textHeight = fontsize * 1.2 + padding * 2
  // 1.4 is extra height factor for text below baseline: g,j,p,q.

  canvas.width = textWidth + borderThickness * 2
  canvas.height = textHeight + borderThickness * 2

  // background color
  context.fillStyle   = backgroundColor
  // border color
  context.strokeStyle = borderColor

  context.lineWidth = borderThickness
  roundRect(context, borderThickness, borderThickness,
    canvas.width - 2 * borderThickness, canvas.height - 2 * borderThickness, 5)

  // draw text
  context.font = 'Bold ' + fontsize + 'px ' + fontface
  context.fillStyle = 'rgba(0, 0, 0, 1.0)'
  context.textAlign = 'center'
  context.textBaseline = 'top'
  context.fillText( message, canvas.width / 2, borderThickness + padding, canvas.width )

  // canvas contents will be used for a texture
  const texture = new THREE.Texture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.needsUpdate = true

  const geometry = new THREE.PlaneGeometry(0.001 * canvas.width, 0.001 * canvas.height, 2, 2) as THREE.Geometry
  const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5 })
  const mesh = new THREE.Mesh(geometry, material)
  return mesh
  // var spriteMaterial = new THREE.SpriteMaterial( { map: texture } );
  // var sprite = new THREE.Sprite( spriteMaterial );
  // sprite.scale.set(0.01 * canvas.width / pixelRatio, 0.01 * canvas.height / pixelRatio, 0.01)
  // sprite.center.set(0.5,0.5)
  // return sprite;
}

// function for drawing rounded rectangles
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number,
                   width: number, height: number, radius: any, fill= true, stroke= true) {
  if (typeof stroke === 'undefined') {
    stroke = true
  }
  if (typeof radius === 'undefined') {
    radius = 5
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius}
  } else {
    const defaultRadius: any = {tl: 0, tr: 0, br: 0, bl: 0}
    for (const side of Object.keys(defaultRadius)) {
      radius[side] = radius[side] || defaultRadius[side]
    }
  }
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
  if (fill) {
    ctx.fill()
  }
  if (stroke) {
    ctx.stroke()
  }

  }