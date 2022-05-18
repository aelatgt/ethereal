// core/textures/KTX2Worker.bundle.txt?raw
var KTX2Worker_bundle_default = '(() => {\n  var __create = Object.create;\n  var __defProp = Object.defineProperty;\n  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;\n  var __getOwnPropNames = Object.getOwnPropertyNames;\n  var __getProtoOf = Object.getPrototypeOf;\n  var __hasOwnProp = Object.prototype.hasOwnProperty;\n  var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });\n  var __commonJS = (cb, mod) => function __require() {\n    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;\n  };\n  var __reExport = (target, module, copyDefault, desc) => {\n    if (module && typeof module === "object" || typeof module === "function") {\n      for (let key of __getOwnPropNames(module))\n        if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))\n          __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });\n    }\n    return target;\n  };\n  var __toESM = (module, isNodeMode) => {\n    return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);\n  };\n\n  // (disabled):../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/node/require-utils.node\n  var require_require_utils = __commonJS({\n    "(disabled):../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/node/require-utils.node"() {\n    }\n  });\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/utils/version.js\n  var VERSION = true ? "3.1.4" : "latest";\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/env-utils/assert.js\n  function assert(condition, message) {\n    if (!condition) {\n      throw new Error(message || "loaders.gl assertion failed.");\n    }\n  }\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/env-utils/globals.js\n  var globals = {\n    self: typeof self !== "undefined" && self,\n    window: typeof window !== "undefined" && window,\n    global: typeof global !== "undefined" && global,\n    document: typeof document !== "undefined" && document\n  };\n  var self_ = globals.self || globals.window || globals.global || {};\n  var window_ = globals.window || globals.self || globals.global || {};\n  var global_ = globals.global || globals.self || globals.window || {};\n  var document_ = globals.document || {};\n  var isBrowser = typeof process !== "object" || String(process) !== "[object process]" || process.browser;\n  var isWorker = typeof importScripts === "function";\n  var isMobile = typeof window !== "undefined" && typeof window.orientation !== "undefined";\n  var matches = typeof process !== "undefined" && process.version && /v([0-9]*)/.exec(process.version);\n  var nodeVersion = matches && parseFloat(matches[1]) || 0;\n\n  // ../../node_modules/@loaders.gl/worker-utils/dist/esm/lib/library-utils/library-utils.js\n  var node = __toESM(require_require_utils());\n  var VERSION2 = true ? "3.1.4" : LATEST;\n  var loadLibraryPromises = {};\n  async function loadLibrary(libraryUrl, moduleName = null, options = {}) {\n    if (moduleName) {\n      libraryUrl = getLibraryUrl(libraryUrl, moduleName, options);\n    }\n    loadLibraryPromises[libraryUrl] = loadLibraryPromises[libraryUrl] || loadLibraryFromFile(libraryUrl);\n    return await loadLibraryPromises[libraryUrl];\n  }\n  function getLibraryUrl(library, moduleName, options) {\n    if (library.startsWith("http")) {\n      return library;\n    }\n    const modules = options.modules || {};\n    if (modules[library]) {\n      return modules[library];\n    }\n    if (!isBrowser) {\n      return "modules/".concat(moduleName, "/dist/libs/").concat(library);\n    }\n    if (options.CDN) {\n      assert(options.CDN.startsWith("http"));\n      return "".concat(options.CDN, "/").concat(moduleName, "@").concat(VERSION2, "/dist/libs/").concat(library);\n    }\n    if (isWorker) {\n      return "../src/libs/".concat(library);\n    }\n    return "modules/".concat(moduleName, "/src/libs/").concat(library);\n  }\n  async function loadLibraryFromFile(libraryUrl) {\n    if (libraryUrl.endsWith("wasm")) {\n      const response2 = await fetch(libraryUrl);\n      return await response2.arrayBuffer();\n    }\n    if (!isBrowser) {\n      try {\n        return node && node.requireFromFile && await node.requireFromFile(libraryUrl);\n      } catch {\n        return null;\n      }\n    }\n    if (isWorker) {\n      return importScripts(libraryUrl);\n    }\n    const response = await fetch(libraryUrl);\n    const scriptSource = await response.text();\n    return loadLibraryFromString(scriptSource, libraryUrl);\n  }\n  function loadLibraryFromString(scriptSource, id) {\n    if (!isBrowser) {\n      return node.requireFromString && node.requireFromString(scriptSource, id);\n    }\n    if (isWorker) {\n      eval.call(global_, scriptSource);\n      return null;\n    }\n    const script = document.createElement("script");\n    script.id = id;\n    try {\n      script.appendChild(document.createTextNode(scriptSource));\n    } catch (e) {\n      script.text = scriptSource;\n    }\n    document.body.appendChild(script);\n    return null;\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/parsers/basis-module-loader.js\n  var VERSION3 = true ? "3.1.4" : "latest";\n  var BASIS_CDN_ENCODER_WASM = "https://unpkg.com/@loaders.gl/textures@".concat(VERSION3, "/dist/libs/basis_encoder.wasm");\n  var BASIS_CDN_ENCODER_JS = "https://unpkg.com/@loaders.gl/textures@".concat(VERSION3, "/dist/libs/basis_encoder.js");\n  var loadBasisEncoderPromise;\n  async function loadBasisEncoderModule(options) {\n    const modules = options.modules || {};\n    if (modules.basisEncoder) {\n      return modules.basisEncoder;\n    }\n    loadBasisEncoderPromise = loadBasisEncoderPromise || loadBasisEncoder(options);\n    return await loadBasisEncoderPromise;\n  }\n  async function loadBasisEncoder(options) {\n    let BASIS_ENCODER = null;\n    let wasmBinary = null;\n    [BASIS_ENCODER, wasmBinary] = await Promise.all([await loadLibrary(BASIS_CDN_ENCODER_JS, "textures", options), await loadLibrary(BASIS_CDN_ENCODER_WASM, "textures", options)]);\n    BASIS_ENCODER = BASIS_ENCODER || globalThis.BASIS;\n    return await initializeBasisEncoderModule(BASIS_ENCODER, wasmBinary);\n  }\n  function initializeBasisEncoderModule(BasisEncoderModule, wasmBinary) {\n    const options = {};\n    if (wasmBinary) {\n      options.wasmBinary = wasmBinary;\n    }\n    return new Promise((resolve) => {\n      BasisEncoderModule(options).then((module) => {\n        const {\n          BasisFile,\n          KTX2File,\n          initializeBasis,\n          BasisEncoder\n        } = module;\n        initializeBasis();\n        resolve({\n          BasisFile,\n          KTX2File,\n          BasisEncoder\n        });\n      });\n    });\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/lib/encoders/encode-ktx2-basis-texture.js\n  async function encodeKTX2BasisTexture(image, options = {}) {\n    const {\n      useSRGB = false,\n      qualityLevel = 10,\n      encodeUASTC = false,\n      mipmaps = false\n    } = options;\n    const {\n      BasisEncoder\n    } = await loadBasisEncoderModule(options);\n    const basisEncoder = new BasisEncoder();\n    try {\n      const basisFileData = new Uint8Array(image.width * image.height * 4);\n      basisEncoder.setCreateKTX2File(true);\n      basisEncoder.setKTX2UASTCSupercompression(true);\n      basisEncoder.setKTX2SRGBTransferFunc(true);\n      basisEncoder.setSliceSourceImage(0, image.data, image.width, image.height, false);\n      basisEncoder.setPerceptual(useSRGB);\n      basisEncoder.setMipSRGB(useSRGB);\n      basisEncoder.setQualityLevel(qualityLevel);\n      basisEncoder.setUASTC(encodeUASTC);\n      basisEncoder.setMipGen(mipmaps);\n      const numOutputBytes = basisEncoder.encode(basisFileData);\n      const actualKTX2FileData = basisFileData.subarray(0, numOutputBytes).buffer;\n      return actualKTX2FileData;\n    } catch (error) {\n      console.error("Basis Universal Supercompressed GPU Texture encoder Error: ", error);\n      throw error;\n    } finally {\n      basisEncoder.delete();\n    }\n  }\n\n  // ../../node_modules/@loaders.gl/textures/dist/esm/ktx2-basis-universal-texture-writer.js\n  var KTX2BasisUniversalTextureWriter = {\n    name: "Basis Universal Supercompressed GPU Texture",\n    id: "ktx2-basis-supercompressed-texture",\n    module: "textures",\n    version: VERSION,\n    extensions: ["ktx2"],\n    options: {\n      useSRGB: false,\n      qualityLevel: 10,\n      encodeUASTC: false,\n      mipmaps: false\n    },\n    encode: encodeKTX2BasisTexture\n  };\n\n  // core/textures/KTX2Worker.ts\n  var worker = self;\n  worker.onmessage = async (msg) => {\n    try {\n      const texture = await KTX2BasisUniversalTextureWriter.encode(msg.data, {\n        useSRGB: true,\n        encodeUASTC: true,\n        mipmaps: true\n      });\n      const response = { texture };\n      worker.postMessage(response, [texture]);\n    } catch (err) {\n      worker.postMessage({ error: err.message });\n    }\n  };\n})();\n';

// core/WorkerPool.ts
var WorkerPool = class {
  limit;
  queue = [];
  workers = [];
  workersResolve = [];
  workerStatus = 0;
  workerCreator;
  constructor(pool = 4) {
    this.limit = pool;
  }
  _initWorker(workerId) {
    if (!this.workers[workerId]) {
      const worker = this.workerCreator();
      worker.addEventListener("message", this._onMessage.bind(this, workerId));
      this.workers[workerId] = worker;
    }
  }
  _getIdleWorker() {
    for (let i = 0; i < this.limit; i++)
      if (!(this.workerStatus & 1 << i))
        return i;
    return -1;
  }
  _onMessage(workerId, msg) {
    const resolve = this.workersResolve[workerId];
    resolve && resolve(msg);
    if (this.queue.length) {
      const { resolve: resolve2, msg: msg2, transfer } = this.queue.shift();
      this.workersResolve[workerId] = resolve2;
      this.workers[workerId].postMessage(msg2, transfer);
    } else {
      this.workerStatus ^= 1 << workerId;
    }
  }
  setWorkerCreator(workerCreator) {
    this.workerCreator = workerCreator;
  }
  setWorkerLimit(pool) {
    this.limit = pool;
  }
  postMessage(msg, transfer) {
    return new Promise((resolve) => {
      const workerId = this._getIdleWorker();
      if (workerId !== -1) {
        this._initWorker(workerId);
        this.workerStatus |= 1 << workerId;
        this.workersResolve[workerId] = resolve;
        this.workers[workerId].postMessage(msg, transfer);
      } else {
        this.queue.push({ resolve, msg, transfer });
      }
    });
  }
  dispose() {
    this.workers.forEach((worker) => worker.terminate());
    this.workersResolve.length = 0;
    this.workers.length = 0;
    this.queue.length = 0;
    this.workerStatus = 0;
  }
};

// core/textures/KTX2Encoder.ts
var workerBlob = new Blob([KTX2Worker_bundle_default], { type: "text/javascript" });
var workerURL = URL.createObjectURL(workerBlob);
var KTX2Encoder = class {
  pool = new WorkerPool(1);
  constructor() {
    this.pool.setWorkerCreator(() => new Worker(workerURL));
  }
  setWorkerLimit(limit) {
    this.pool.setWorkerLimit(limit);
  }
  async encode(imageData) {
    const responseMessage = await this.pool.postMessage(imageData, [imageData.data.buffer]);
    if (responseMessage.data.error)
      throw new Error(responseMessage.data.error);
    if (!responseMessage.data.texture)
      throw new Error("Encoding failed");
    return responseMessage.data.texture;
  }
};
export {
  KTX2Encoder
};
