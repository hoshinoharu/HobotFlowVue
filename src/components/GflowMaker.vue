<template @keydown.native="onKeyDown">
  <div style="display: block;height:calc(100vh - 32px);padding: 16px" ref="container">
    <el-button @click="showDialog">上传</el-button>
    <div ref="screenContainer" style="width: 100%;height: 50%;outline: none" tabindex="0" @keydown="onKeyDown">
      <canvas ref="screenCanvas"
              :style="'transform: scale('+screenScale+') translate('+screenXRatio+'px,'+screenYRatio+'px);transform-origin:top left;position:absolute;'"
      ></canvas>
      <canvas ref="screenCanvasMask"
              :style="'transform: scale('+screenScale+') translate('+screenXRatio+'px,'+screenYRatio+'px);transform-origin:top left;position:absolute;'"
              @mousedown="onMouseDown"
              @mousemove="onMouseMove"
              @mouseup="onMouseUp"
      ></canvas>
    </div>
    <div ref="captureContainer" style="width: 100%;height:calc(50% - 16px);margin-top: 16px">
      <canvas ref="captureCanvas"
              :style="'transform: scale('+captureScale+') translate('+captureXRatio+'px,'+captureYRatio+'px);transform-origin:top left;'"
      >
      </canvas>
    </div>

    <el-dialog
      title="上传屏幕截图"
      :visible.sync="dialogVisible"
      width="30%">
      <el-form :model="screenPart" @keyup.enter.native="uploadData">
        <el-form-item label="统一名称" label-width="80px">
          <el-input v-model="screenPart.uniqueName"></el-input>
        </el-form-item>
        <el-form-item label="屏幕宽度" label-width="80px">
          <el-input-number v-model="screenPart.resolutionWidth" :precision="2" :step="0.1"
                           disabled></el-input-number>
        </el-form-item>
        <el-form-item label="屏幕高度" label-width="80px">
          <el-input-number v-model="screenPart.resolutionHeight" :precision="2" :step="0.1"
                           disabled></el-input-number>
        </el-form-item>
        <el-form-item label="截屏宽度" label-width="80px">
          <el-input-number v-model="screenPart.width" :precision="2" :step="0.1" disabled></el-input-number>
        </el-form-item>
        <el-form-item label="截屏高度" label-width="80px">
          <el-input-number v-model="screenPart.height" :precision="2" :step="0.1" disabled></el-input-number>
        </el-form-item>
        <el-form-item label="x" label-width="80px">
          <el-input-number v-model="screenPart.x" :precision="2" :step="0.1" disabled></el-input-number>
        </el-form-item>
        <el-form-item label="y" label-width="80px">
          <el-input-number v-model="screenPart.y" :precision="2" :step="0.1" disabled></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="uploadData">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
    import {uuid} from 'vue-uuid'

    export default {
        name: 'GflowMaker',
        data() {
            return {
                dialogVisible: false,

                appSocket: null,
                screenCanvas: null,
                screenCanvasMask: null,
                screenCanvasMaskContext: null,
                screenCanvasContext: null,
                captureContext: null,
                screenContainer: null,
                screenScale: 1.0,
                screenXRatio: 0,
                screenYRatio: 0,
                touching: false,
                touchStart: {},
                touchNow: null,
                touchPre: {},
                screenImage: null,

                captureCanvas: null,
                captureCanvasContext: null,
                captureScale: 1.0,
                captureXRatio: 0,
                captureYRatio: 0,
                captureContainer: null,

                screenPart: {},
            }
        },
        methods: {
            // DataURL转canvas
            dataURLToCanvas(dataUrl) {
                if (this.screenCanvasContext == null) {
                    this.screenCanvasContext = this.screenCanvas.getContext('2d')
                }
                let img = new Image();
                let self = this;
                img.onload = () => {
                    let width = img.width;
                    let height = img.height;
                    let containerWidth = self.screenContainer.offsetWidth;
                    let containerHeight = self.screenContainer.offsetHeight;
                    let scale = 1;
                    let x_ratio = 0;
                    let y_ratio = 0;
                    //如果图片长度比例小于预设的长宽比
                    if (img.width / img.height < (containerWidth / containerHeight)) {
                        scale = containerHeight / img.height;
                        x_ratio = (containerWidth - width * scale) / 2 / scale
                    } else {
                        scale = containerWidth / img.width;
                        y_ratio = (containerHeight - height * scale) / 2 / scale
                    }
                    self.screenCanvas.width = width;
                    self.screenCanvas.height = height;
                    self.screenCanvasMask.width = width;
                    self.screenCanvasMask.height = height;
                    self.screenImage = img;
                    self.screenCanvasContext.drawImage(img, 0, 0, width, height);
                    self.screenScale = scale;
                    self.screenXRatio = x_ratio;
                    self.screenYRatio = y_ratio;
                    self.drawCaptureFrame();
                };
                img.src = dataUrl;
            },
            fileOrBlobToDataURL(obj, callback) {
                // let imgData = new Blob([obj], {type:"image/jpeg"});
                // let url = URL.createObjectURL(imgData);
                // callback(url);
                let a = new FileReader();
                a.readAsDataURL(obj);
                a.onload = function (e) {
                    callback(e.target.result);
                };
            },
            // Blob转canvas
            blobToCanvas(blob) {
                this.fileOrBlobToDataURL(blob, dataUrl => {
                    this.dataURLToCanvas(dataUrl);
                });
            },
            onMessage(msg) {
                if (typeof (msg.data) == 'string') {
                    let operation = JSON.parse(msg.data)
                    let operate = operation.operate;
                    let content = operation.content;
                    switch (operate) {
                        case 'initFlowData':
                            this.$emit('initFlowData', content);
                            break;
                        case 'uploadFlowData':
                            this.$message.success("上传节点数据成功");
                            break;
                        case 'onNodeUpdate':
                            if (content.actionRecognizeResult != null) {
                                content.actionRecognizeResult.image = content.actionRecognizeResult.image + '?t=' + new Date().getTime();
                            }
                            if (content.landmarkRecognizeResult != null) {
                                for (let i = 0; i < content.landmarkRecognizeResult.length; i++) {
                                    content.landmarkRecognizeResult[i].image = content.landmarkRecognizeResult[i].image + '?t=' + new Date().getTime();
                                }
                            }
                            this.$emit('flowNodeUpdate', content);
                            break;
                    }
                } else {
                    this.blobToCanvas(msg.data);
                    this.appSocket.send("1");
                }
            },
            onError(e) {
                if (this.appSocket != null) {
                    this.appSocket.close();
                }
                console.log('error', e)
            },
            onClose(e) {
                console.log(e);
                this.initWebSocket();
            },
            initWebSocket() {
                let url = 'ws://127.0.0.1:8080/device/screen';
                this.appSocket = new WebSocket(url);
                if (this.appSocket) {
                    this.appSocket.onmessage = this.onMessage;
                    this.appSocket.onerror = this.onError;
                    this.appSocket.onclose = this.onClose;
                    this.appSocket.onopen = () => {
                        this.appSocket.send("1");
                    };
                }
            },
            drawCaptureFrame() {
                if (this.screenCanvasMaskContext == null) {
                    this.screenCanvasMaskContext = this.screenCanvasMask.getContext('2d');
                }
                this.screenCanvasMaskContext.lineWidth = 10;
                this.screenCanvasMaskContext.strokeStyle = 'red';
                this.screenCanvasMaskContext.clearRect(0, 0, this.screenCanvasMask.width, this.screenCanvasMask.height);
                if (this.touchNow != null) {
                    this.screenCanvasMaskContext.strokeRect(this.touchStart.x, this.touchStart.y,
                        this.touchNow.x - this.touchStart.x, this.touchNow.y - this.touchStart.y);
                }
                this.drawCapture();
            },
            onKeyDown(e) {
                let unit = 1;
                let offsetX = 0;
                let offsetY = 0;
                switch (e.key) {
                    case 'ArrowUp':
                        offsetY = -unit;
                        break;
                    case 'ArrowDown':
                        offsetY = unit;
                        break;
                    case 'ArrowLeft':
                        offsetX = -unit;
                        break;
                    case 'ArrowRight':
                        offsetX = unit;
                        break;
                }
                this.touchNow.x += offsetX;
                this.touchNow.y += offsetY;
                if (!e.shiftKey) {
                    this.touchStart.x += offsetX;
                    this.touchStart.y += offsetY;
                }
            },
            onMouseDown(e) {
                this.touching = true;
                this.touchStart = {
                    x: e.offsetX,
                    y: e.offsetY,
                }
                this.onMouseDrag(e)
            },
            onMouseMove(e) {
                if (this.touching) {
                    this.onMouseDrag(e)
                }
            },
            onMouseUp(e) {
                this.touching = false;
                this.onMouseDrag(e)
            },
            onMouseDrag(e) {
                this.touchNow = {
                    x: e.offsetX,
                    y: e.offsetY,
                };
                this.drawCaptureFrame();
                this.touchPre = this.touchNow;
            },
            drawCapture() {
                if (this.touchNow == null || this.touchNow.y == this.touchStart.y) {
                    return;
                }
                if (this.captureCanvasContext == null) {
                    this.captureCanvasContext = this.captureCanvas.getContext('2d');
                    this.captureCanvas.width = this.captureContainer.offsetWidth;
                    this.captureCanvas.height = this.captureContainer.offsetHeight;
                }

                let img = this.screenImage;
                let width = (this.touchNow.x - this.touchStart.x) / this.screenCanvas.width * img.width;
                let height = (this.touchNow.y - this.touchStart.y) / this.screenCanvas.height * img.height;
                let x = this.touchStart.x;
                let y = this.touchStart.y;
                let containerWidth = this.captureContainer.offsetWidth;
                let containerHeight = this.captureContainer.offsetHeight;
                let scale = 1;
                let x_ratio = 0;
                let y_ratio = 0;
                //如果图片长度比例小于预设的长宽比
                if (width / height < (containerWidth / containerHeight)) {
                    scale = containerHeight / height;
                    x_ratio = (containerWidth - width * scale) / 2 / scale
                } else {
                    scale = containerWidth / width;
                    y_ratio = (containerHeight - height * scale) / 2 / scale

                }
                if (width < 0) {
                    width = 0;
                }
                if (height < 0) {
                    height = 0;
                }
                this.captureCanvas.width = width;
                this.captureCanvas.height = height;
                this.captureCanvasContext.drawImage(this.screenImage, x, y, width, height,
                    0, 0, width, height);
                this.captureScale = scale;
                this.captureXRatio = x_ratio;
                this.captureYRatio = y_ratio;
            },
            getScreenCapture() {
                let base64 = this.captureCanvas.toDataURL('image/png');
                let capture = {
                    id: uuid.v1(),
                    src: base64,
                    resolutionWidth: this.screenImage.width,
                    resolutionHeight: this.screenImage.height,
                    width: this.captureCanvas.width,
                    height: this.captureCanvas.height,
                    x: this.touchStart.x,
                    y: this.touchStart.y,
                };
                return capture;
            },
            showDialog() {
                this.screenPart = this.getScreenCapture();
                if (this.screenPart == null) {
                    this.screenPart = {};
                }
                this.dialogVisible = true;
            },
            uploadData() {
                this.$http.post("/screen/part", this.screenPart).then(res => {
                    this.dialogVisible = false;
                });
            },
        },
        mounted() {
            this.screenCanvas = this.$refs.screenCanvas;
            this.screenCanvasMask = this.$refs.screenCanvasMask;
            this.screenContainer = this.$refs.screenContainer;
            this.captureCanvas = this.$refs.captureCanvas;
            this.captureContainer = this.$refs.captureContainer;
            this.initWebSocket();
        },
        created() {
        }
    }
</script>
