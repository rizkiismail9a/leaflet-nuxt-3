<script setup lang="ts">
type LayerMapItem = L.LatLngExpression[][];

const zoom = ref<number>(15);
const layerAmount = ref<number>(1);

const myLayerMap = reactive<LayerMapItem>([]);

const onClickMap = (e: L.LeafletMouseEvent) => {
  const newCoordinates: L.LatLngExpression = [e.latlng.lat, e.latlng.lng];

  if (!myLayerMap[layerAmount.value - 1]) {
    myLayerMap[layerAmount.value - 1] = [];
  }

  // referensi harus diperbaharui setiap kali ada perubahan. Jadi, harus di-reassign, gak bisa push atau splice
  myLayerMap[layerAmount.value - 1] = [
    ...myLayerMap[layerAmount.value - 1],
    newCoordinates,
  ];
};

const addLayer = () => {
  if (myLayerMap[layerAmount.value - 1].length) {
    layerAmount.value++;
  }
};

const clearLayer = (layerNumber: number) => {
  myLayerMap[layerNumber - 1] = [];
  myLayerMap.splice(layerNumber - 1, 1);
};
</script>

<template>
  <div class="myMap">
    <LMap
      style="height: 100vh; width: 520px; cursor: pointer"
      ref="map"
      v-model:zoom="zoom"
      :center="[-6.81789079877179, 107.1339085287504]"
      :use-global-leaflet="false"
      @click="onClickMap"
      :max-zoom="18"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></LTileLayer>
      <LPolygon
        v-for="layer in myLayerMap"
        :lat-lngs="layer"
        color="#41b782"
        :fill="true"
        :fillOpacity="0.3"
        fillColor="#41b782"
      ></LPolygon>
    </LMap>
    <div class="actionButton">
      <p>Anda ada di layer ke-{{ layerAmount }}</p>
      <button @click="addLayer">Tambah Layer</button>
      <button v-for="layer in myLayerMap.length" @click="clearLayer(layer)">
        Bersihkan Layer {{ layer }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.myMap {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.actionButton {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
