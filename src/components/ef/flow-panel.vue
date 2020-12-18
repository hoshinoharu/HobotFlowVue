<template>
  <div v-if="easyFlowVisible" style="height: calc(100vh);">
    <el-row>
      <!--顶部工具菜单-->
      <el-col :span="24">
        <div style="width: 100%; border-right: 1px solid #dce3e8;">
          <node-menu @addNode="addNode" ref="nodeMenu" @onDownloadData="downloadData"
                     @startFlow="requestStartFlow"></node-menu>
        </div>
      </el-col>
    </el-row>
    <div style="display: flex;height: calc(100% - 47px);">
      <div id="efContainer" ref="efContainer" class="container" v-flowDrag @keydown="handleKey" tabindex="0"
           style="outline: none">
        <template v-for="node in data.nodeList">
          <flow-node
            :id="node.id"
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode"
            ref="flowNode"
            @requestShowImagePreview="requestShowImagePreview"
          >
          </flow-node>
        </template>
        <!-- 给画布一个默认的宽度和高度 -->
        <div style="position:absolute;top: 2000px;left: 2000px;">nbsp;</div>
      </div>
      <!-- 右侧表单 -->
      <div style="width: 300px;height: 100%;border-left: 1px solid #dce3e8;background-color: #FBFBFB">
        <flow-node-form ref="nodeForm" @onSaveLine="onSaveLine"
                        @onSaveNode="onSaveNode"
                        @onDeleteNode="onDeleteNode"
                        @requestActionImage="onRequestActionImage"
        ></flow-node-form>
      </div>
    </div>
    <!-- 流程数据详情 -->
    <flow-info v-if="flowInfoVisible" ref="flowInfo" :data="data"></flow-info>
    <flow-help v-if="flowHelpVisible" ref="flowHelp"></flow-help>
  </div>

</template>

<script>

    import draggable from 'vuedraggable'
    // import { jsPlumb } from 'jsplumb'
    // 使用修改后的jsplumb
    import './jsplumb'
    import {easyFlowMixin} from '@/components/ef/mixins'
    import flowNode from '@/components/ef/node'
    import nodeMenu from '@/components/ef/node_menu'
    import FlowInfo from '@/components/ef/info'
    import FlowHelp from '@/components/ef/help'
    import FlowNodeForm from './node_form'
    import lodash from 'lodash'
    import {ForceDirected} from './force-directed'
    import {uuid} from 'vue-uuid'

    export default {
        name: 'flowPanel',
        data() {
            return {
                // jsPlumb 实例
                jsPlumb: null,
                // 控制画布销毁
                easyFlowVisible: true,
                // 控制流程数据显示与隐藏
                flowInfoVisible: false,
                // 是否加载完毕标志位
                loadEasyFlowFinish: false,
                flowHelpVisible: false,
                // 数据
                data: {},
                // 激活的元素、可能是节点、可能是连线
                activeElement: {
                    // 可选值 node 、line
                    type: undefined,
                    // 节点ID
                    nodeId: undefined,
                    // 连线ID
                    sourceId: undefined,
                    targetId: undefined
                },
                zoom: 0.5
            }
        },
        // 一些基础配置移动该文件中
        mixins: [easyFlowMixin],
        components: {
            draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
        },
        directives: {
            'flowDrag': {
                bind(el, binding, vnode, oldNode) {
                    if (!binding) {
                        return
                    }
                    el.onmousedown = (e) => {
                        if (e.button == 2) {
                            // 右键不管
                            return
                        }
                        //  鼠标按下，计算当前原始距离可视区的高度
                        let disX = e.clientX
                        let disY = e.clientY
                        el.style.cursor = 'move'

                        document.onmousemove = function (e) {
                            // 移动时禁止默认事件
                            e.preventDefault()
                            const left = e.clientX - disX
                            disX = e.clientX
                            el.scrollLeft += -left

                            const top = e.clientY - disY
                            disY = e.clientY
                            el.scrollTop += -top
                        }

                        document.onmouseup = function (e) {
                            el.style.cursor = 'auto'
                            document.onmousemove = null
                            document.onmouseup = null
                        }
                    }

                }
            }
        },
        mounted() {
            this.jsPlumb = jsPlumb.getInstance()
            this.$nextTick(() => {
                // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
                // this.dataReload({
                //     nodeList:[],
                //     lineList:[],
                // })
                // this.dataReload(getDataA());
            });
        },
        methods: {
            requestShowImagePreview(image){
              this.$emit('requestShowImagePreview', image);
            },
            updateFlowNoe(node) {
                for (let i = 0; i < this.data.nodeList.length; i++) {
                    let oldNode = this.data.nodeList[i];
                    if (oldNode.id == node.id) {
                        oldNode.newStatus = node;
                        console.log(oldNode.newStatus)
                        break;
                    }
                }
            },
            initFlowData(data) {
                this.$nextTick(() => {
                    this.dataReload(data);
                });
            },
            handleKey(e) {
                if (e.key == 'Delete') {
                    this.deleteElement()
                }
            },
            // 返回唯一标识
            getUUID() {
                return uuid.v1();
            },
            jsPlumbInit() {
                this.jsPlumb.ready(() => {
                    // 导入默认配置
                    this.jsPlumb.importDefaults(this.jsplumbSetting)
                    // 会使整个jsPlumb立即重绘。
                    this.jsPlumb.setSuspendDrawing(false, true);
                    // 初始化节点
                    this.loadEasyFlow()
                    // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
                    this.jsPlumb.bind('click', (conn, originalEvent) => {
                        this.activeElement.type = 'line'
                        this.activeElement.sourceId = conn.sourceId
                        this.activeElement.targetId = conn.targetId
                        let line = this.findLine(conn.sourceId, conn.targetId);
                        this.$refs.nodeForm.lineInit(line);
                    })
                    // 连线
                    this.jsPlumb.bind("connection", (evt) => {
                        let from = evt.source.id
                        let to = evt.target.id
                        if (this.loadEasyFlowFinish) {
                            this.data.lineList.push({
                                from: from,
                                to: to,
                                landmarkImageGroups: [],
                            });
                        }
                    })

                    // 删除连线回调
                    this.jsPlumb.bind("connectionDetached", (evt) => {
                        this.deleteLine(evt.sourceId, evt.targetId)
                    })

                    // 改变线的连接节点
                    this.jsPlumb.bind("connectionMoved", (evt) => {
                        this.changeLine(evt.originalSourceId, evt.originalTargetId)
                    })

                    // 连线右击
                    this.jsPlumb.bind("contextmenu", (evt) => {
                        console.log('contextmenu', evt)
                    })

                    // 连线
                    this.jsPlumb.bind("beforeDrop", (evt) => {
                        let from = evt.sourceId
                        let to = evt.targetId
                        if (from === to) {
                            this.$message.error('节点不支持连接自己')
                            return false
                        }
                        if (this.hasLine(from, to)) {
                            this.$message.error('该关系已存在,不允许重复创建')
                            return false
                        }
                        if (this.hashOppositeLine(from, to)) {
                            this.$message.error('不支持两个节点之间连线回环');
                            return false
                        }
                        this.$message.success('连接成功')
                        return true
                    })

                    // beforeDetach
                    this.jsPlumb.bind("beforeDetach", (evt) => {
                        console.log('beforeDetach', evt)
                    })
                    this.jsPlumb.setContainer(this.$refs.efContainer)
                })
            },
            // 加载流程图
            loadEasyFlow() {
                // 初始化节点
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    // 设置源点，可以拖出线连接其他节点
                    this.jsPlumb.makeSource(node.id, lodash.merge(this.jsplumbSourceOptions, {}))
                    // // 设置目标点，其他源点拖出的线可以连接该节点
                    this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
                    if (!node.viewOnly) {
                        this.jsPlumb.draggable(node.id, {
                            containment: 'parent',
                            stop: function (el) {
                                // 拖拽节点结束后的对调
                                console.log('拖拽结束: ', el)
                            }
                        })
                    }
                }
                // 初始化连线
                for (let i = 0; i < this.data.lineList.length; i++) {
                    let line = this.data.lineList[i];
                    let connParam = {
                        source: line.from,
                        target: line.to,
                        label: this.getLineLabel(line),
                        connector: line.connector ? line.connector : '',
                        anchors: line.anchors ? line.anchors : undefined,
                        paintStyle: line.paintStyle ? line.paintStyle : undefined,
                    };
                    let conn = this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
                }
                this.$nextTick(function () {
                    this.loadEasyFlowFinish = true
                })
            },
            // 设置连线条件
            onSaveLine(line) {
                let conn = this.jsPlumb.getConnections({
                    source: line.from,
                    target: line.to
                })[0];
                let label = '  ';
                if (!label || label === '') {
                    conn.removeClass('flowLabel')
                    conn.addClass('emptyFlowLabel')
                } else {
                    conn.addClass('flowLabel')
                }
                conn.setLabel({
                    label: this.getLineLabel(line),
                })
                let find = this.findLine(line.from, line.to);
                if (find) {
                    Object.assign(find, line);
                }
            },
            getLineLabel(line) {
                if (line.landmarkImageGroups == null || line.landmarkImageGroups.length == 0) {
                    return '设置标识图片';
                }
                return '<img src=' + line.landmarkImageGroups[0].images[0].src + ' style="width:40px;height:40px;object-fit: contain; "></img>';
            },
            findLine(from, to) {
                let find = this.data.lineList.find(l => {
                    return l.from == from && l.to == to;
                });
                return find;
            },
            // 删除激活的元素
            deleteElement() {
                if (this.activeElement.type === 'node') {
                    this.deleteNode(this.activeElement.node);
                } else if (this.activeElement.type === 'line') {
                    this.$confirm('确定删除所点击的线吗?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        var conn = this.jsPlumb.getConnections({
                            source: this.activeElement.sourceId,
                            target: this.activeElement.targetId
                        })[0]
                        this.jsPlumb.deleteConnection(conn)
                    }).catch(() => {
                    })
                }
            },
            // 删除线
            deleteLine(from, to) {
                this.data.lineList = this.data.lineList.filter(function (line) {
                    if (line.from == from && line.to == to) {
                        return false
                    }
                    return true
                })
            },
            // 改变连线
            changeLine(oldFrom, oldTo) {
                this.deleteLine(oldFrom, oldTo)
            },
            // 改变节点的位置
            changeNodeSite(data) {
                for (var i = 0; i < this.data.nodeList.length; i++) {
                    let node = this.data.nodeList[i]
                    if (node.id === data.nodeId) {
                        node.left = data.left
                        node.top = data.top
                    }
                }
            },
            /**
             * 拖拽结束后添加新的节点
             * @param evt
             * @param nodeMenu 被添加的节点对象
             * @param mousePosition 鼠标拖拽结束的坐标
             */
            addNode(evt, nodeMenu, mousePosition) {
                var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
                let efContainer = this.$refs.efContainer
                var containerRect = efContainer.getBoundingClientRect()
                var left = screenX, top = screenY
                // 计算是否拖入到容器中
                if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
                    this.$message.error("请把节点拖入到画布中")
                    return
                }
                left = left - containerRect.x + efContainer.scrollLeft
                top = top - containerRect.y + efContainer.scrollTop
                // 居中
                left -= 85
                top -= 16
                // 动态生成名字
                let node = nodeMenu;
                node.id = this.getUUID();
                node.left = left + 'px';
                node.top = top + 'px';
                node.state = 'success';
                let nodeId = node.id;
                /**
                 * 这里可以进行业务判断、是否能够添加该节点
                 */
                this.data.nodeList.push(node);
                this.$nextTick(() => {
                    this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions);
                    this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions);
                    this.jsPlumb.draggable(nodeId, {
                        containment: 'parent',
                        stop: function (el) {
                            // 拖拽节点结束后的对调
                            console.log('拖拽结束: ', el)
                        }
                    });
                    this.clickNode(node);
                })
            },
            /**
             * 删除节点
             * @param nodeId 被删除节点的ID
             */
            deleteNode(node) {
                let nodeId = node.id;
                this.$confirm('确定要删除节点' + node.name + '?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    closeOnClickModal: false
                }).then(() => {
                    /**
                     * 这里需要进行业务判断，是否可以删除
                     */
                    this.data.nodeList = this.data.nodeList.filter(function (node) {
                        if (node.id === nodeId) {
                            // 伪删除，将节点隐藏，否则会导致位置错位
                            // node.show = false
                            return false
                        }
                        return true
                    })
                    this.$nextTick(function () {
                        this.jsPlumb.removeAllEndpoints(nodeId);
                    })
                }).catch(() => {
                })
                return true
            },
            clickNode(node) {
                console.log(node);
                this.activeElement.type = 'node'
                this.activeElement.node = node;
                this.$refs.nodeForm.nodeInit(node)
            },
            // 是否具有该线
            hasLine(from, to) {
                for (var i = 0; i < this.data.lineList.length; i++) {
                    var line = this.data.lineList[i]
                    if (line.from === from && line.to === to) {
                        return true
                    }
                }
                return false
            },
            // 是否含有相反的线
            hashOppositeLine(from, to) {
                return this.hasLine(to, from)
            },
            nodeRightMenu(nodeId, evt) {
                this.menu.show = true
                this.menu.curNodeId = nodeId
                this.menu.left = evt.x + 'px'
                this.menu.top = evt.y + 'px'
            },
            onRequestActionImage(callback) {
                this.$emit('requestScreenCapture', callback);
            },
            onDeleteNode(node) {
                this.deleteNode(node);
            },
            onSaveNode(newNode) {
                let find = this.data.nodeList.find(node => {
                    return node.id == newNode.id;
                });
                if (find) {
                    Object.assign(find, newNode);
                } else {
                    return;
                }
                this.$notify({
                    message: '保存成功',
                    type: 'success'
                });
                this.jsPlumb.repaint()
            },
            // 流程数据信息
            dataInfo() {
                this.flowInfoVisible = true
                this.$nextTick(function () {
                    this.$refs.flowInfo.init()
                })
            },
            // 加载流程图
            dataReload(data) {
                this.easyFlowVisible = false;
                this.data.nodeList = [];
                this.data.lineList = [];
                this.$nextTick(() => {
                    data = lodash.cloneDeep(data);
                    this.easyFlowVisible = true;
                    this.data = data;
                    this.data.nodeList.forEach(node => {
                        if (node.enable == null) {
                            node.enable = true;
                        }
                    });
                    this.$nextTick(() => {
                        this.jsPlumb = jsPlumb.getInstance();
                        this.$nextTick(() => {
                            this.jsPlumbInit()
                        });
                    });
                });
            },
            // 模拟载入数据dataA
            dataReloadA() {
                this.dataReload(getDataA())
            },
            // 模拟载入数据dataB
            dataReloadB() {
                this.dataReload(getDataB())
            },
            // 模拟载入数据dataC
            dataReloadC() {
                this.dataReload(getDataC())
            },
            // 模拟载入数据dataD
            dataReloadD() {
                this.dataReload(getDataD())
            },
            // 模拟加载数据dataE，自适应创建坐标
            dataReloadE() {
                let dataE = getDataE()
                let tempData = lodash.cloneDeep(dataE)
                let data = ForceDirected(tempData)
                this.dataReload(data)
                this.$message({
                    message: '力导图每次产生的布局是不一样的',
                    type: 'warning'
                });
            },
            zoomAdd() {
                if (this.zoom >= 1) {
                    return
                }
                this.zoom = this.zoom + 0.1
                this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            zoomSub() {
                if (this.zoom <= 0) {
                    return
                }
                this.zoom = this.zoom - 0.1
                this.$refs.efContainer.style.transform = `scale(${this.zoom})`
                this.jsPlumb.setZoom(this.zoom)
            },
            // 下载数据
            downloadData() {
                this.$emit('uploadFlowData', this.data);
                // this.$confirm('确定要下载该流程数据吗？', '提示', {
                //     confirmButtonText: '确定',
                //     cancelButtonText: '取消',
                //     type: 'warning',
                //     closeOnClickModal: false
                // }).then(() => {
                // var datastr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.data, null, '\t'));
                // var downloadAnchorNode = document.createElement('a')
                // downloadAnchorNode.setAttribute("href", datastr);
                // downloadAnchorNode.setAttribute("download", 'data.json')
                // downloadAnchorNode.click();
                // downloadAnchorNode.remove();
                // this.$message.success("正在下载中,请稍后...")
                // }).catch(() => {
                // })
            },
            openHelp() {
                this.flowHelpVisible = true
                this.$nextTick(function () {
                    this.$refs.flowHelp.init()
                })
            },
            requestStartFlow() {
                this.$emit('requestStartFlow', this.data);
            }
        }
    }
</script>
