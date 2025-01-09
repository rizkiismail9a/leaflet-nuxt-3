<script setup lang="ts">
type LayerMapItem = L.LatLngExpression[][];

const { $leaflet } = useNuxtApp();

const layerAmount = ref<number>(1);
const myLayerMap = reactive<LayerMapItem>([]);
const oldPointPosition = ref();
const polygonKey = ref<number>(0);

// const markers = reactive<L.Marker[][]>([]);

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

const onDragStart = (e: L.DragEndEvent) => {
  const oldLatLng = e.target.getLatLng();

  oldPointPosition.value = [oldLatLng.lat, oldLatLng.lng];
  console.log("titik lama", oldPointPosition.value);
};

const onDragEnd = (event: L.DragEndEvent) => {
  // dragTarget.value = event.target._latlng;
  const marker = event.target;
  const newMarker = marker.getLatLng();

  // Cari layer dan titik yang sesuai
  // for (let i = 0; i < myLayerMap.length; i++) {
  //   for (let j = 0; j < myLayerMap[i].length; j++) {
  //     console.log("old point", oldPointPosition.value[0]);
  //     console.log(myLayerMap[i][j]);
  //     if (oldPointPosition.value[0] === (myLayerMap[i][j] as number[])[0]) {
  //       (myLayerMap[i][j] as number[])[0] = newMarker.lat;
  //     }
  //     if (oldPointPosition.value[1] === (myLayerMap[i][j] as number[])[1]) {
  //       (myLayerMap[i][j] as number[])[1] = newMarker.lng;
  //     }
  //   }
  // }

  for (let i = 0; i < myLayerMap.length; i++) {
    const pointIndex = myLayerMap[i].findIndex(
      (point) =>
        (point as number[])[0] === oldPointPosition.value[0] &&
        (point as number[])[1] === oldPointPosition.value[1]
    );

    if (pointIndex !== -1) {
      myLayerMap[i][pointIndex] = [newMarker.lat, newMarker.lng];
      break;
    }
  }
  polygonKey.value++;
};
</script>

<template>
  <div class="myMap">
    <LMap
      style="height: 100vh; width: 520px; cursor: pointer"
      ref="map"
      :zoom="15"
      :center="[-6.81789079877179, 107.1339085287504]"
      :use-global-leaflet="false"
      @click="onClickMap"
      :max-zoom="22"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        :max-zoom="25"
      ></LTileLayer>
      <LPolygon
        :key="polygonKey"
        v-for="layer in myLayerMap"
        :lat-lngs="layer"
        color="#41b782"
        :fill="true"
        :fillOpacity="0.3"
        fillColor="#41b782"
      >
        <LMarker
          v-for="l in layer"
          :lat-lng="l"
          draggable
          @dragStart="onDragStart"
          @dragend="onDragEnd"
        >
          <LIcon
            :icon-size="[30, 30]"
            :shadow-size="[0, 0]"
            icon-url="/cat-marker.png"
          >
          </LIcon>
        </LMarker>
      </LPolygon>
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
