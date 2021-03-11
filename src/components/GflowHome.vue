<template>
  <div style="width: 100vw;height: 100vh;overflow: hidden;">
    <div style="width: 229px;border-right: 1px solid #dce3e8;float: left">
      <GflowMaker ref="maker">

      </GflowMaker>
    </div>
    <div style="width: calc(100% - 230px);float: left">

    </div>
  </div>
</template>

<script>
    import FlowPanel from "./ef/flow-panel";
    import Maker from "./Maker";
    import {uuid} from 'vue-uuid'
    import GflowMaker from "./GflowMaker";

    export default {
        name: "GflowHome",
        components: {GflowMaker, Maker, FlowPanel},
        data() {
            return {
                dialogVisible: false,
                recognizeResult: null,
                data: null,
            };
        },
        mounted() {
        },
        methods: {
            onUploadFlowData(data) {
                this.data.flow = data;
                for (let i = 0; i < data.nodeList.length; i++) {
                    let node = data.nodeList[i];
                    this.beforeUploadImage(node.actionImage);
                    if (node.listAction != null) {
                        this.beforeUploadImage(node.listAction.listArea);
                        this.beforeUploadImage(node.listAction.itemArea);
                        let groups = node.listAction.itemLandmarkImageGroups;
                        if (groups != null) {
                            for (let j = 0; j < groups.length; j++) {
                                let group = groups[j];
                                for (let k = 0; k < group.images.length; k++) {
                                    let image = group.images[k];
                                    this.beforeUploadImage(image)
                                }
                            }
                        }
                    }
                }
                for (let i = 0; i < data.lineList.length; i++) {
                    let line = data.lineList[i];
                    for (let j = 0; j < line.landmarkImageGroups.length; j++) {
                        let group = line.landmarkImageGroups[j];
                        for (let k = 0; k < group.images.length; k++) {
                            let image = group.images[k];
                            this.beforeUploadImage(image)
                        }
                    }
                }
                this.$refs.maker.uploadFlowData(this.data);
            },
            beforeUploadImage(image) {
                if (image == null) {
                    return;
                }
                if (image.id == null) {
                    image.id = uuid.v1();
                }
                if (image.denoise == null) {
                    image.denoise = false;
                }

                if (this.data.measure == null) {
                    this.data.measure = {};
                }
                let key = image.resolution_width + 'x' + image.resolution_height;
                //判断当前分辨率有没有保存的image
                if (this.data.measure[key] == null) {
                    this.data.measure[key] = {};
                }
                //保存图片分辨率数据
                this.data.measure[key][image.id] = image;
            },
            onTest(data) {
                // for (let i = 0; i < data.nodeList.length; i++) {
                //     let node = data.nodeList[i];
                //     if (node.actionImage != null && node.actionImage.src.startsWith('data:image')) {
                //         return;
                //     }
                // }
                // for (let i = 0; i < data.lineList.length; i++) {
                //     let line = data.lineList[i];
                //     for (let j = 0; j < line.landmarkImages.length; j++) {
                //         let image = line.landmarkImages[j];
                //         if (image.src.startsWith('data:image')) {
                //             return;
                //         }
                //     }
                // }
                // this.onUploadFlowData(data);
            },
            onInitFlowData: function (data) {
                this.data = data;
                let flow = data.flow;
                for (let i = 0; i < flow.nodeList.length; i++) {
                    let node = flow.nodeList[i];
                    node.actionImage = this.handleImage(node.actionImage);
                }
                for (let i = 0; i < flow.lineList.length; i++) {
                    let line = flow.lineList[i];
                    for (let j = 0; j < line.landmarkImageGroups.length; j++) {
                        let group = line.landmarkImageGroups[j];
                        for (let k = 0; k < group.images.length; k++) {
                            let image = group.images[k];
                            group.images[k] = this.handleImage(image);
                        }
                    }
                }
                this.$refs.flowPanel.initFlowData(flow);
            },
            handleImage(image) {
                if (image == null) {
                    return null;
                }
                // let key = image.resolution_width + 'x' + image.resolution_height;
                // let src = {};
                // src[key] = image;
                let measureMap = this.data.measure[this.$displayKey()];
                return measureMap == null ? image : measureMap[image.id];
            },
            onFlowNodeUpdate(node) {
                this.$refs.flowPanel.updateFlowNoe(node);
            },
            onRequestScreenCapture(callback) {
                let base64 = this.$refs.maker.getScreenCapture();
                this.$http.post('/img/base64', {
                    content: base64.src,
                }).then(resp => {
                    resp = resp.data;
                    if (resp.success) {
                        base64.notExists = false;
                        base64.denoise = false;
                        base64.possibility = 0.96;
                        base64.compareXWhenNotMatch = false;
                        base64.compareYWhenNotMatch = false;
                        base64.directlyRecognizeTrue = false;
                        base64.src = resp.data;
                        callback(base64);
                    }
                });
            },
            onRequestStartFlow(data) {
                this.$refs.maker.startFlow(data);
            },
            onShowImagePreview(recognizeResult) {
                this.recognizeResult = recognizeResult;
                this.dialogVisible = true;
                // this.$nextTick(() => {
                // });
            },
            onPreviewLoad(e) {
                document.getElementById('preview').click();
            }
        }
    }
</script>

<style scoped>

</style>
