<template>
  <div style="height: 100%">
    <div class="ef-node-form" style="height: 100%">
      <div class="ef-node-form-header">
        编辑
      </div>
      <div class="ef-node-form-body" style="height: calc(100% - 32px);overflow: scroll">
        <el-form :model="node" ref="dataForm" label-width="80px" v-show="type === 'node'">
          <el-collapse v-model="activeName">
            <el-form-item label="名称">
              <el-input v-model="node.name"></el-input>
            </el-form-item>
            <el-form-item label="类型">
              <el-select v-model="node.type" placeholder="请选择" :value="node.type">
                <el-option
                  v-for="item in typeList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                  <i :class="item.icon"></i>
                  <span>{{item.label}}</span>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="可用">
              <el-switch
                v-model="node.enable"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
            <el-form-item label="触发重绘">
              <el-switch
                v-model="node.repaint"
                active-color="#13ce66"
                inactive-color="#ff4949">
              </el-switch>
            </el-form-item>
            <el-form-item label="超时秒数">
              <el-input-number v-model="node.timeout" :step="5">
              </el-input-number>
            </el-form-item>
            <el-form-item label="确认间隔">
              <el-input-number v-model="node.confirmSleep" :step="100">
              </el-input-number>
              <span>毫秒</span>
            </el-form-item>
            <el-form-item label="行为索引">
              <el-input-number v-model="node.actionMarkIndex" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="执行顺序">
              <el-input-number v-model="node.order" :step="1"></el-input-number>
            </el-form-item>
            <el-form-item label="行为图片">
              <!--              <el-image v-if="node.actionImage != null" :src="node.actionImage.src" fit="contain" style="height: 100px">-->
              <!--              </el-image>-->
              <target-image v-if="node.actionImage != null" :image="node.actionImage" :key="node.id">
              </target-image>
              <el-button type="danger" icon="el-icon-delete" circle @click="node.actionImage = null"></el-button>
              <el-button type="primary" icon="el-icon-scissors" circle @click="setActionImage"></el-button>
            </el-form-item>
            <el-collapse-item style="padding-left: 12px;background-color: transparent" title="列表行为" name="listAction"
                              v-if="node.type == 'list'">
              <el-form-item label="List区域">
                <el-image v-if="node.listAction.listArea != null" :src="node.listAction.listArea.src" fit="contain"
                          style="height: 100px">
                </el-image>
                <el-button type="danger" icon="el-icon-delete" circle
                           @click="node.listAction.listArea = null"></el-button>
                <el-button type="primary" icon="el-icon-scissors" circle @click="setListAreaImage"></el-button>
              </el-form-item>
              <el-form-item label="Item区域">
                <el-image v-if="node.listAction.itemArea != null" :src="node.listAction.itemArea.src" fit="contain"
                          style="height: 100px">
                </el-image>
                <el-button type="danger" icon="el-icon-delete" circle
                           @click="node.listAction.itemArea = null"></el-button>
                <el-button type="primary" icon="el-icon-scissors" circle @click="setItemAreaImage"></el-button>
              </el-form-item>

              <el-form-item label="Item标识">
                <div style="display: flex;flex-wrap: wrap">
                  <div v-for="(group, gIndex) in node.listAction.itemLandmarkImageGroups"
                       :key="'itemLandmarkGroup' + gIndex"
                       style="display: flex;width: 100%;flex-wrap: wrap">
                    <div v-for="(image, index) in group.images" :key="'itemMark' + index"
                         style="display: flex;margin: 2px"
                    >
                      <target-image :image="image"
                                    @onDeleteTargetImage="deleteImage(gIndex, index, 'listItem')"
                                    :key="image.id"
                      >
                      </target-image>
                    </div>
                    <div style="display: flex;flex-flow: column;width: 45px;height: 45px;margin:2px">
                      <el-button type="primary"
                                 style="padding: 0px;height: 50%;width: 100%"
                                 size="mini"
                                 plain
                                 icon="el-icon-plus" @click="addLandmarkImage(group)"></el-button>
                      <el-button type="danger"
                                 size="mini"
                                 plain
                                 style="margin-left: 0px;padding: 0px;height: 50%;width: 100%"
                                 icon="el-icon-delete" @click="deleteGroup(gIndex, 'listItem')"></el-button>
                    </div>
                  </div>
                </div>
                <el-button type="primary" icon="el-icon-plus" @click="addGroup('listItem')">增加条件组</el-button>
              </el-form-item>

            </el-collapse-item>
            <!--                    <el-form-item label="类型">-->
            <!--                        <el-input v-model="node.type" :disabled="true"></el-input>-->
            <!--                    </el-form-item>-->
            <!--                    <el-form-item label="left坐标">-->
            <!--                        <el-input v-model="node.left" :disabled="true"></el-input>-->
            <!--                    </el-form-item>-->
            <!--                    <el-form-item label="top坐标">-->
            <!--                        <el-input v-model="node.top" :disabled="true"></el-input>-->
            <!--                    </el-form-item>-->
            <!--                    <el-form-item label="ico图标">-->
            <!--                        <el-input v-model="node.ico"></el-input>-->
            <!--                    </el-form-item>-->
            <!--                    <el-form-item label="状态">-->
            <!--                        <el-select v-model="node.state" placeholder="请选择">-->
            <!--                            <el-option-->
            <!--                                    v-for="item in stateList"-->
            <!--                                    :key="item.state"-->
            <!--                                    :label="item.label"-->
            <!--                                    :value="item.state">-->
            <!--                            </el-option>-->
            <!--                        </el-select>-->
            <!--                    </el-form-item>-->
            <el-form-item>
              <!--                        <el-button icon="el-icon-close">重置</el-button>-->
              <el-button icon="el-icon-delete" type="danger" @click="deleteNode">删除</el-button>
              <el-button type="primary" icon="el-icon-check" @click="save">保存</el-button>
            </el-form-item>
          </el-collapse>
        </el-form>


        <el-form :model="line" ref="dataForm" label-width="0px" v-show="type === 'line'" style="padding: 16px">
          <el-form-item>
            <div style="display: flex;flex-wrap: wrap">
              <div v-for="(group, gIndex) in line.landmarkImageGroups" :key="'landmarkGroup' + gIndex"
                   style="display: flex;width: 100%;flex-wrap: wrap">
                <div v-for="(image, index) in group.images" :key="'lineMark' + index" style="display: flex;margin: 2px"
                >
                  <target-image :image="image"
                                @onDeleteTargetImage="deleteImage(gIndex, index)"
                                :key="image.id"
                  >
                  </target-image>
                </div>
                <div style="display: flex;flex-flow: column;width: 45px;height: 45px;margin:2px">
                  <el-button type="primary"
                             style="padding: 0px;height: 50%;width: 100%"
                             size="mini"
                             plain
                             icon="el-icon-plus" @click="addLandmarkImage(group)"></el-button>
                  <el-button type="danger"
                             size="mini"
                             plain
                             style="margin-left: 0px;padding: 0px;height: 50%;width: 100%"
                             icon="el-icon-delete" @click="deleteGroup(gIndex)"></el-button>
                </div>
              </div>
            </div>
            <el-button type="primary" icon="el-icon-plus" @click="addGroup">增加条件组</el-button>
          </el-form-item>
          <el-form-item>
            <!--            <el-button icon="el-icon-close">重置</el-button>-->
            <el-button type="primary" icon="el-icon-check" @click="saveLine">保存</el-button>
          </el-form-item>
        </el-form>
      </div>
      <!--            <div class="el-node-form-tag"></div>-->
    </div>
  </div>

</template>

<script>
    import {cloneDeep} from 'lodash'
    import TargetImage from "../TargetImage";
    import metaNode from "./node-meta";

    export default {
        components: {TargetImage},
        data() {
            return {
                visible: true,
                // node 或 line
                type: 'node',
                node: {},
                line: {},
                activeName: '',
                typeList: null,
                stateList: [{
                    state: 'success',
                    label: '成功'
                }, {
                    state: 'warning',
                    label: '警告'
                }, {
                    state: 'error',
                    label: '错误'
                }, {
                    state: 'running',
                    label: '运行中'
                }]
            }
        },
        created() {
            this.typeList = metaNode().getOptions();
        },
        methods: {
            /**
             * 表单修改，这里可以根据传入的ID进行业务信息获取
             * @param data
             * @param id
             */
            nodeInit(node) {
                this.type = 'node';
                this.node = cloneDeep(node);
            },
            lineInit(line) {
                this.type = 'line';
                this.line = line;
            },
            // 修改连线
            saveLine() {
                this.$emit('onSaveLine', this.line)
            },
            deleteNode() {
                this.$emit('onDeleteNode', this.node);
            },
            save() {
                this.node.icon = metaNode().getByType(this.node.type).icon;
                this.$emit('onSaveNode', this.node);
            },
            setActionImage() {
                if (this.node != null) {
                    this.requestActionImage((image) => {
                        this.node.actionImage = image;
                    });
                }
            },
            setListAreaImage() {
                if (this.node != null) {
                    this.requestActionImage((image) => {
                        this.node.listAction.listArea = image;
                    });
                }
            },
            setItemAreaImage() {
                if (this.node != null) {
                    this.requestActionImage((image) => {
                        this.node.listAction.itemArea = image;
                        this.$set(this.node, "listAction", this.node.listAction)
                    });
                }
            },
            requestActionImage(callback) {
                this.$emit('requestActionImage', callback);
            },
            addGroup(src) {
                let group = {
                    images: [],
                };
                if (src == 'listItem') {
                    this.node.listAction.itemLandmarkImageGroups.push(group)
                } else {
                    this.line.landmarkImageGroups.push(group);
                }
                this.addLandmarkImage(group);
            },
            addLandmarkImage(group) {
                this.requestActionImage(image => {
                    group.images.push(image);
                });
            },
            deleteGroup(groupIndex, src) {
                this.$confirm('确定删除条件组吗?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    if (src == 'listItem') {
                        this.node.listAction.itemLandmarkImageGroups.splice(groupIndex, 1);
                    } else {
                        this.line.landmarkImageGroups.splice(groupIndex, 1);
                    }
                });
            },
            deleteImage(groupIndex, index, src) {
                let group;
                if (src == 'listItem') {
                    group = this.node.listAction.itemLandmarkImageGroups[groupIndex];
                } else {
                    group = this.line.landmarkImageGroups[groupIndex];
                }
                let images = group.images;
                images.splice(index, 1);
                if (images.length == 0) {
                    if (src == 'listItem') {
                        this.node.listAction.itemLandmarkImageGroups.splice(groupIndex, 1);
                    } else {
                        this.line.landmarkImageGroups.splice(groupIndex, 1);
                    }
                }
            }
        }
    }
</script>

<style>
  .el-node-form-tag {
    position: absolute;
    top: 50%;
    margin-left: -15px;
    height: 40px;
    width: 15px;
    background-color: #fbfbfb;
    border: 1px solid rgb(220, 227, 232);
    border-right: none;
    z-index: 0;
  }
</style>
