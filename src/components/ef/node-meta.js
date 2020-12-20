import th from "element-ui/src/locale/lang/th";

export default function metaNode() {
  let meta = {
    nodeList: [
      {
        type: 'generic',
        icon: 'el-icon-magic-stick',
        //流程所需属性
        name: '通用节点',
      }, {
        type: 'break',
        icon: 'el-icon-error',
        //流程所需属性
        name: '中断节点',
        repaint: false,
      }, {
        type: 'verify',
        icon: 'el-icon-question',
        name: '验证节点',
      }, {
        type: 'switch',
        icon: 'el-icon-guide',
        //流程所需属性
        name: '分支节点',
      }, {
        type: 'list',
        icon: 'el-icon-tickets',
        //流程所需属性
        name: '列表节点',
        listAction: {
          listArea: null,
          itemArea: null,
          itemLandmarkImageGroups: [],
        }
      },
      {
        type: 'failed',
        icon: 'el-icon-warning-outline',
        //流程所需属性
        name: '失败节点',
        order: 99,
      },
      {
        type: 'finished',
        icon: 'el-icon-finished',
        //流程所需属性
        name: '结束节点',
        order: 99,
      }
    ],
    template: {
      type: 'generic',
      icon: 'el-icon-magic-stick',
      //流程所需属性
      name: '通用节点',
      // 自定义覆盖样式
      style: {},
      timeout: 10,//超时时间
      actionImage: null,//节点行为图片
      actionMarkIndex: -1,//与节点行为图片相同，这里是直接从标识图片中获取
      enable: true,
      order: 0,
      repaint: true,//是否会更新ui页面，默认每个操作都会触发节点的更新
      confirmSleep:500,//默认确认执行超时
    },
  };
  let id = 0;
  for (let i in meta.nodeList) {
    meta.nodeList[i].id = id++;
  }
  meta.getOptions = function () {
    let options = [];
    for (let i = 0; i < this.nodeList.length; i++) {
      let node = this.nodeList[i];
      options.push({
        label: node.name,
        value: node.type,
        icon: node.icon,
      });
    }
    return options;
  };
  meta.getByType = function (type) {
    for (let i = 0; i < this.nodeList.length; i++) {
      if (this.nodeList[i].type == type) {
        return this.nodeList[i];
      }
    }
    return null;
  }
  return meta;
};
