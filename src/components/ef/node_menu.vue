<template>
  <div class="flow-menu" ref="tool" style="height: 45px;display: flex">
    <!--    <el-button type="text" icon="el-icon-download" size="large" @click="requestDownloadData"></el-button>-->
    <div>
      <el-button style="margin-left: 16px" type="text" icon="el-icon-upload" size="large"
                 @click="requestDownloadData"></el-button>
      <el-divider direction="vertical"></el-divider>
      <el-button type="text" icon="el-icon-caret-right" size="large" @click="startFlow"></el-button>
    </div>
    <div style="width: 90%;display:inline-block">
      <draggable @end="end" @start="move" v-model="nodeMenuList" :options="draggableOptions"
                 style="display: flex;overflow-x: auto;">
                    <span v-for="subMenu in nodeMenuList" class="ef-node-menu-li" :key="subMenu.id"
                          :type="subMenu.type" style="margin-left: 16px">
                        <i :class="subMenu.icon"></i> {{subMenu.name}}
                    </span>
      </draggable>
    </div>
    <!--    <span v-for="menu  in  nodeMenuList" :key="menu.id">-->
    <!--          <draggable @end="end" @start="move" v-model="menu.children" :options="draggableOptions"-->
    <!--                     style="display: inline-block;margin-top: 16px">-->
    <!--                    <span v-for="subMenu in menu.children" class="ef-node-menu-li" :key="subMenu.id"-->
    <!--                          :type="subMenu.type" style="margin-left: 16px">-->
    <!--                        <i :class="subMenu.icon"></i> {{subMenu.name}}-->
    <!--                    </span>-->
    <!--                </draggable>-->
    <!--    </span>-->
  </div>
</template>
<script>
    import draggable from 'vuedraggable'
    import metaNode from './node-meta.js'

    var mousePosition = {
        left: -1,
        top: -1
    }

    export default {
        data() {
            return {
                activeNames: '1',
                // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
                draggableOptions: {
                    preventOnFilter: false,
                    sort: false,
                    disabled: false,
                    ghostClass: 'tt',
                    // 不使用H5原生的配置
                    forceFallback: true,
                    // 拖拽的时候样式
                    // fallbackClass: 'flow-node-draggable'
                },
                // 默认打开的左侧菜单的id
                defaultOpeneds: ['1', '2'],
                tplNode: null,
                nodeMenuList: null,
                nodeMenu: {}
            }
        },
        components: {
            draggable
        },
        created() {
            let meta = metaNode();
            this.nodeMenuList = meta.nodeList;
            this.tplNode = meta.template;
            /**
             * 以下是为了解决在火狐浏览器上推拽时弹出tab页到搜索问题
             * @param event
             */
            if (this.isFirefox()) {
                document.body.ondrop = function (event) {
                    // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
                    mousePosition.left = event.layerX;
                    mousePosition.top = event.clientY - 50;
                    event.preventDefault();
                    event.stopPropagation();
                }
            }
        },
        methods: {
            // 根据类型获取左侧菜单对象
            getMenuByType(type) {
                for (let j = 0; j < this.nodeMenuList.length; j++) {
                    if (this.nodeMenuList[j].type === type) {
                        return this.nodeMenuList[j]
                    }
                }
            },
            // 拖拽开始时触发
            move(evt, a, b, c) {
                var type = evt.item.attributes.type.nodeValue
                this.nodeMenu = this.getMenuByType(type)
            },
            // 拖拽结束时触发
            end(evt, e) {
                // 先复制模板
                let node = Object.assign({}, this.tplNode);
                //再复制填充的属性
                node = Object.assign(node, this.nodeMenu);
                this.$emit('addNode', evt, node, mousePosition)
            },
            // 是否是火狐浏览器
            isFirefox() {
                var userAgent = navigator.userAgent
                if (userAgent.indexOf("Firefox") > -1) {
                    return true
                }
                return false
            },
            startFlow() {
                this.$emit('startFlow');
            },
            requestDownloadData() {
                this.$emit('onDownloadData');
            }
        }
    }
</script>
<style scoped>
  .flow-menu {
    height: 47px;
  }
</style>
