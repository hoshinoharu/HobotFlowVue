<template>
  <div>
    <el-popover
      placement="left"
      trigger="hover"
    >
      <div style="display: flex">
        <el-image :src="targetImage.src" fit="contain" style="width: 60vw;height: 80vh">
        </el-image>
        <div style="display: flex;flex-direction: column;padding: 16px">
          <el-form :model="targetImage" label-width="80px">
            <el-form-item label="直接判过">
              <el-switch
                v-model="targetImage.directlyRecognizeTrue"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item label="判断缺失">
              <el-switch
                v-model="targetImage.notExists"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item label="降噪">
              <el-switch
                v-model="targetImage.denoise"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item label="判断阈值">
              <el-input-number v-model="targetImage.possibility"  :precision="2" :step="0.01" :max="1">
              </el-input-number>
            </el-form-item>
            <el-form-item label="数值验证">
              <el-input-number v-model="targetImage.decimalValue"  :precision="2" :step="0.01" :max="1">
              </el-input-number>
            </el-form-item>
            <el-form-item label="匹配X">
              <el-switch
                v-model="targetImage.compareXWhenNotMatch"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
            <el-form-item label="匹配Y">
              <el-switch
                v-model="targetImage.compareYWhenNotMatch"
                active-color="#13ce66"
                inactive-color="#ff4949"
              >
              </el-switch>
            </el-form-item>
          </el-form>
          <el-button
            type="danger" icon="el-icon-delete" @click="deleteImage"
          ></el-button>
        </div>
      </div>
      <el-image :src="targetImage.src" lazy
                style="width: 45px;height: 45px"
                fit="cover"
                slot="reference"
      >
      </el-image>
    </el-popover>
  </div>
</template>

<script>
    export default {
        name: "TargetImage",
        props: {
            image: {
                type: Object,
                default: function () {
                    return null;
                },
            }
        },
        data() {
            return {
                targetImage: null,
            };
        },
        mounted() {
        },
        created() {
            console.log(this.image)
            this.targetImage = this.image;
        },
        methods: {
            deleteImage() {
                this.$emit('onDeleteTargetImage', this.targetImage)
            },
            saveImage() {
                this.$emit('onSaveTargetImage', this.targetImage)
            }
        },
    }
</script>

<style scoped>

</style>
