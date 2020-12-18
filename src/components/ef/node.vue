<template>
  <div
    ref="node"
    @click="clickNode"
    @mouseup="changeNodeSite"
    :style="nodeContainerStyle"
    :class="nodeContainerClass"
  >
    <div style="position: absolute;transform: translateY(-50px);" class="ef-node-container"
         v-if="statusVisible">
      <el-image v-for="(result, index) in node.newStatus.landmarkRecognizeResult" :src="result.image" :key="index"
                style="width:32px;margin-left: 2px" lazy fit="contain" @click="showPreview(result)">
      </el-image>
      <el-image v-if="node.newStatus.actionRecognizeResult != null" :src="node.newStatus.actionRecognizeResult.image"
                style="width:32px;;margin-left: 2px" lazy fit="contain"
                @click="showPreview(node.newStatus.actionRecognizeResult)">
      </el-image>
    </div>
    <!-- 最左侧的那条竖线 -->
    <div class="ef-node-left"></div>
    <!-- 节点类型的图标 -->
    <div class="ef-node-left-ico flow-node-drag">
      <i :class="nodeIcoClass"></i>
    </div>
    <el-image :src="this.node.actionImage.src" v-if="this.node.actionImage" fit="contain" style="width: 80px">
    </el-image>
    <!-- 节点名称 -->
    <div class="ef-node-text" :show-overflow-tooltip="true">
      {{node.name}}
    </div>
    <!-- 节点状态图标 -->
    <div class="ef-node-right-ico">
      <i class="el-icon-circle-check el-node-state-success" v-show="node.state === 'success'"></i>
      <i class="el-icon-circle-close el-node-state-error" v-show="node.state === 'error'"></i>
      <i class="el-icon-warning-outline el-node-state-warning" v-show="node.state === 'warning'"></i>
      <i class="el-icon-loading el-node-state-running" v-show="node.state === 'running'"></i>
    </div>
  </div>
</template>

<script>
    export default {
        props: {
            node: Object,
            activeElement: Object
        },
        data() {
            return {
                statusVisible: false,
                recognizeResultList: [],
            }
        },
        watch: {
            node: {
                handler(newVal, oldVal) {
                    this.statusVisible = false;
                    if (newVal.newStatus != null) {
                        this.statusVisible = true;
                        this.recognizeResultList = [].concat(newVal.newStatus.landmarkRecognizeResult);
                        if (this.node.newStatus.actionRecognizeResult) {
                            this.recognizeResultList.push(node.newStatus.actionRecognizeResult)
                        }
                    }
                },
                deep: true
            }
        },
        computed: {
            nodeContainerClass() {
                return {
                    'ef-node-container': true,
                    'ef-node-active': this.activeElement.type == 'node' ? this.activeElement.nodeId === this.node.id : false,
                    'ef-node-has-image': this.node.actionImage != null,
                }
            },
            // 节点容器样式
            nodeContainerStyle() {
                return {
                    top: this.node.top,
                    left: this.node.left
                }
            },
            nodeIcoClass() {
                var nodeIcoClass = {}
                nodeIcoClass[this.node.icon] = true
                // 添加该class可以推拽连线出来，viewOnly 可以控制节点是否运行编辑
                nodeIcoClass['flow-node-drag'] = this.node.viewOnly ? false : true
                return nodeIcoClass
            }
        },
        methods: {
            // 点击节点
            clickNode() {
                this.$emit('clickNode', this.node)
            },
            // 鼠标移动后抬起
            changeNodeSite() {
                // 避免抖动
                if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
                    return;
                }
                this.$emit('changeNodeSite', {
                    nodeId: this.node.id,
                    left: this.$refs.node.style.left,
                    top: this.$refs.node.style.top,
                })
            },
            showPreview(image) {
                this.$emit('requestShowImagePreview', image);
            }
        },
        mounted() {
            this.$set(this.node, 'newStatus', null);
        }
    }
</script>
