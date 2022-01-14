# ethereal

An integrated toolkit for building spatially adaptive immersive interfaces

Package exports:
- "ethereal" - all core ethereal tooling, rendering-library agnostic
- "ethereal/three" (wip) - all three.js specific wrappers for ethereal tooling
# @etherealjs/web-layer

A bridge from the traditional 2D-web, into the immersive web. 

This library rasterizes the DOM by allowing you to organize it into separate independently manipulable and interactive web layers, automatically directing immersive input back to the live DOM instance. A number of optimizations allow you to maintain a live link between the real DOM and it's counterpart within an immersive (i.e., webGL-backed) environment, including: individually hashed DOM layers and rasterized textures, real-time encoding to a compressed texture format w/ low memory footprint and fast GPU uploads, and persistence of compressed textures in client storage for quick retreival and minimal processing in subsequent sessions. 

# @etherealjs/spatial-optimizer (wip)

A library designed for metaheuristic optimization of spatial variables and objectives

# @etherealjs/spatial-adaptivity (wip)

