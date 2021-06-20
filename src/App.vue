<template>
  <Renderer
    ref="renderer"
    antialias
    :orbit-ctrl="{ enableDamping: true }"
    resize="window"
  >
    <Camera :position="{ z: 150 }" />
    <Scene background="#ffffff">
      <PointLight :position="{ y: 50, z: 50 }" />
      <PointLight :position="{ y: 100, z: 150 }" />
      <PointLight :position="{ x: -100, z: -150 }" />
      <GltfModel
        ref="model"
        src="./model/lego_astro_scooter/scene.gltf"
        @load="onReady"
        @progress="onProgress"
        @error="onError"
      />
    </Scene>
  </Renderer>
</template>

<script>
export default {
  mounted() {
    const renderer = this.$refs.renderer;
    const model = this.$refs.model;
    renderer.onBeforeRender(() => {
      model.rotation.x += 0.1;
    });
  },
};
</script>

<style>
body {
  margin: 0;
}
canvas {
  display: block;
}
</style>
