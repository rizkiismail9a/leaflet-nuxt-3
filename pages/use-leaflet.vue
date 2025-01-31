<script setup lang="ts">
import type { Feature, Polygon, Position } from "geojson";
import { area } from "@turf/area";

type LayerMapItem = L.LatLngExpression[][];

const { $leaflet } = useNuxtApp();

const layerAmount = ref<number>(1);
const myLayerMap = reactive<LayerMapItem>([]);
const oldPointPosition = ref();
const polygonKey = ref<number>(0);
const activeLayer = ref<number>(0);
const myArea = ref<number>(0);

// const markers = reactive<L.Marker[][]>([]);

const onClickMap = (e: L.LeafletMouseEvent) => {
  const newCoordinates: L.LatLngExpression = [e.latlng.lat, e.latlng.lng];

  if (!myLayerMap[activeLayer.value]) {
    myLayerMap[activeLayer.value] = [];
  }

  // referensi harus diperbaharui setiap kali ada perubahan. Jadi, harus di-reassign, gak bisa push atau splice
  myLayerMap[activeLayer.value] = [
    ...myLayerMap[activeLayer.value],
    newCoordinates,
  ];

  if (myLayerMap[activeLayer.value].length > 2) {
    const newPolygon: Feature<Polygon> = {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [
          [...myLayerMap[activeLayer.value], myLayerMap[activeLayer.value][0]],
        ] as Position[][],
      },
      properties: {},
    };

    myArea.value = area(newPolygon);
  }
};

const addLayer = () => {
  if (myLayerMap[layerAmount.value - 1].length) {
    layerAmount.value++;
    activeLayer.value++;
  }
};

const undo = () => {
  const currentLayerLength = myLayerMap[activeLayer.value].length;

  if (!currentLayerLength) return;

  myLayerMap[activeLayer.value].pop();
  polygonKey.value++;
};

// const clearLayer = (layerNumber: number) => {
//   myLayerMap[layerNumber - 1] = [];
//   myLayerMap.splice(layerNumber - 1, 1);
// };

const selectLayer = (layerNumber: number) => {
  activeLayer.value = layerNumber;
};

const onDragStart = (e: L.DragEndEvent) => {
  const oldLatLng = e.target.getLatLng();

  oldPointPosition.value = [oldLatLng.lat, oldLatLng.lng];
  // console.log("titik lama", oldPointPosition.value);
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
      class="LHMap"
      ref="map"
      :zoom="18"
      :center="[-6.81789079877179, 107.1339085287504]"
      @click="onClickMap"
      :options="{
        attributionControl: false,
        zoomSnap: 0.5,
        maxZoom: 22,
        zoomControl: false,
      }"
    >
      <LTileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
        :options="{
          maxNativeZoom: 19, // OSM max available zoom is at 19.
          maxZoom: 22,
        }"
      ></LTileLayer>

      <LControlAttribution position="topleft" prefix="LindungiHutan" />

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

      <LControl
        class="layer-menu leaflet-control leaflet-demo-control"
        position="topright"
      >
        <div class="layer-wrapper">
          <button @click="undo">undo</button>
          <button
            v-for="(layer, index) in layerAmount"
            @click.stop="selectLayer(index)"
          >
            Pilih Layer {{ layer }}
          </button>
        </div>
      </LControl>

      <!-- <LControl class="footer-menu leaflet-demo-control" position="bottomleft">
      </LControl> -->
    </LMap>
    <div class="actionButton">
      <p>{{ myArea / 1e6 }} km2</p>
      <button @click.stop="addLayer" class="button-add-layer">
        Tambah Layer
      </button>
    </div>
  </div>
</template>

<style scoped>
.myMap {
  width: 100%;
  max-width: 520px;
  margin: auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0;
  background-color: gray;
}

.LHMap {
  height: 90vh !important;
  width: 100%;
  cursor: pointer;
}

/* Untuk menghapus garis-garis antar tile */
:deep(.leaflet-container img.leaflet-tile) {
  /* See: https://bugs.chromium.org/p/chromium/issues/detail?id=600120 */
  mix-blend-mode: normal;
}

.footer-menu {
  width: 500px; /* gak bisa dinamis, paling kasih breakpoint */
  /* height: 200px; */
  border-radius: 8px;
  padding: 16px;
}

.layer-menu {
  width: 100px;
  background-color: white;
}

.layer-wrapper {
  background-color: white;
  padding: 12px;
  width: fit-content;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.actionButton {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 10vh;
  gap: 12px;
  background-color: white;
  padding: 8px;
  width: 100%;
}

.button-add-layer {
  height: 100%;
}
</style>
