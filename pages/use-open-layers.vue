<script setup lang="ts">
import { Collection, Feature, MapBrowserEvent } from "ol";
import { getArea } from "ol/sphere";
import type { Polygon } from "ol/geom";
import type { DrawEvent } from "ol/interaction/Draw";
import type { ObjectEvent } from "ol/Object";
import { ref } from "vue";
import markerIcon from "/assets/marker.png";
import type { SelectEvent } from "ol/interaction/Select";
import { click } from "ol/events/condition";

const center = ref<number[]>([107.13545776763256, -6.823527579118911]);
const projection = ref("EPSG:4326");
const zoom = ref(10);
const rotation = ref(0);
// const selectConditions = ref();
// const selectCondition = ref();
const currentCenter = ref(center.value);
const currentZoom = ref(zoom.value);
const currentRotation = ref(rotation.value);
const currentResolution = ref(0);
const layerList = ref([]);
const osmLayer = ref(null);
const jawgLayer = ref(null);
const googleLayer = ref(null);
const drawEnable = ref(false);
const modifyEnabled = ref(false);
const drawType = ref("Point");
const selectedFeatures = ref(new Collection());
const area = ref<number | null>(null);
const format = inject("ol-format");
const vectorSource = ref();

let geoJson;

onMounted(() => {
  if (osmLayer.value) {
    // layerList.value.push(osmLayer.value.tileLayer);
  }
  layerList.value.push(googleLayer.value.tileLayer);
  console.log("Ini layer list", layerList.value);
  //   selectConditions.value = inject("ol-selectconditions");
  //   selectCondition.value = selectConditions.value.click;
  geoJson = new format.GeoJSON();
});

const zones = ref([]);

const changeDrawType = (active: boolean, draw: string) => {
  console.log(active);

  drawEnable.value = active;
  drawType.value = draw;
};

const resolutionChanged = (event: ObjectEvent) => {
  currentResolution.value = event.target.getResolution();
  currentZoom.value = event.target.getZoom();
};

const centerChanged = (event: ObjectEvent) => {
  currentCenter.value = event.target.getCenter();
};

const rotationChanged = (event: ObjectEvent) => {
  currentRotation.value = event.target.getRotation();
};

const drawstart = (event: DrawEvent) => {
  console.log(event);
};

const drawend = (event: DrawEvent) => {
  const feature: Feature = event.feature;
  const geometry = feature.getGeometry() as Polygon;

  // Konversi ke EPSG:3857 jika peta menggunakan EPSG:4326
  const transformedGeometry = geometry
    .clone()
    .transform("EPSG:4326", "EPSG:3857");

  // Hitung luas dalam meter persegi
  area.value = getArea(transformedGeometry);

  console.log("Luas polygon:", area.value, "m²");
};

const featureSelected = (event: SelectEvent) => {
  console.log("select event", event);
};

const selectInteactionFilter = (feature) => {
  console.log("feature", feature.values_);
  console.log("feature boolean", feature.values_.name != undefined);

  return feature.values_.name != undefined;
};

// const onToggleCondition = (mbe) => {
//   console.log("jalan", mbe);

//   return mbe.type == "click";
// };

// const onSelectCondition = (event: MapBrowserEvent<UIEvent>) => {
//   console.log(event);
// };
</script>

<template>
  <ol-map loadTilesWhileAnimating class="my-map">
    <ol-view
      ref="view"
      :center="center"
      :rotation="rotation"
      :zoom="zoom"
      :projection="projection"
      @change:center="centerChanged"
      @change:resolution="resolutionChanged"
      @change:rotation="rotationChanged"
    />

    <!-- <ol-tile-layer title="OSM">
      <ol-source-osm />
    </ol-tile-layer> -->

    <ol-tile-layer ref="googleLayer" title="google">
      <ol-source-xyz url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}" />
    </ol-tile-layer>

    <!-- Ini peta layer warna gelap -->
    <!-- <ol-tile-layer ref="jawgLayer" title="JAWG">
      <ol-source-xyz
        crossOrigin="anonymous"
        url="https://c.tile.jawg.io/jawg-dark/{z}/{x}/{y}.png?access-token=87PWIbRaZAGNmYDjlYsLkeTVJpQeCfl2Y61mcHopxXqSdxXExoTLEv7dwqBwSWuJ"
      />
    </ol-tile-layer> -->

    <!-- Harus di luar ol-vector-layer -->
    <!-- Ini gunanya adalah ketika ada bagian polygon yang diklik, bakal ada event yang di-log -->
    <ol-interaction-select
      v-if="!drawEnable"
      @select="featureSelected"
      :condition="click"
    >
      <ol-style>
        <ol-style-stroke color="green" :width="10"></ol-style-stroke>
        <ol-style-fill color="rgba(255,255,255,0.5)"></ol-style-fill>
      </ol-style>
    </ol-interaction-select>

    <!-- Ini untuk hasil gambar polygon -->
    <ol-vector-layer>
      <ol-source-vector
        :format="geoJson"
        :projection="projection"
        ref="vectorSource"
      >
        <ol-interaction-draw
          v-if="drawEnable"
          :type="drawType"
          :source="vectorSource"
          @drawstart="drawstart"
        >
          <ol-style>
            <ol-style-stroke color="blue" :width="2"></ol-style-stroke>
            <ol-style-fill color="rgba(255, 255, 0, 0.4)"></ol-style-fill>
            <ol-style-circle :radius="5">
              <ol-style-fill color="#00dd11" />
              <ol-style-stroke color="blue" :width="2" />
            </ol-style-circle>
          </ol-style>
        </ol-interaction-draw>

        <ol-interaction-modify />

        <ol-interaction-snap v-if="drawEnable" />
      </ol-source-vector>

      <ol-style>
        <ol-style-stroke color="red" :width="2"></ol-style-stroke>
        <ol-style-fill color="rgba(0, 128, 0, 0.243)"></ol-style-fill>
      </ol-style>
    </ol-vector-layer>

    <ol-control-bar>
      <ol-toggle-control
        html="Buat Polygon"
        title="Polygon"
        :onToggle="(active: boolean) => changeDrawType(active, 'Polygon')"
      />
    </ol-control-bar>

    <!-- Ini untuk menambahkan menu switch, seperti mematikan tile atau mematikan polygon -->
    <ol-layerswitcherimage-control />
    <ol-fullscreen-control />

    <ol-rotate-control></ol-rotate-control>
    <ol-interaction-link />
  </ol-map>

  <ul>
    <li>center : {{ currentCenter }}</li>
    <li>resolution : {{ currentResolution }}</li>
    <li>zoom : {{ currentZoom }}</li>
    <li>rotation : {{ currentRotation }}</li>
  </ul>
</template>

<style scoped>
.my-map {
  height: 500px;
  width: 100%;
}

.ol-map {
  position: relative;
}
.ol-map-loading:after {
  content: "";
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 80px;
  height: 80px;
  margin-top: -40px;
  margin-left: -40px;
  border-radius: 50%;
  border: 5px solid rgba(180, 180, 180, 0.6); /* warna loading bisa diganti di sini */
  border-top-color: green; /* warna loading bisa diganti di sini */
  animation: spinner 0.6s linear infinite;
}

:deep(.ol-control.ol-bar button) {
  width: 400px !important;
}

@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

ul {
  position: absolute;
  background-color: aqua;
  padding: 12px;
  z-index: 10;
  top: 50%;
  left: 50%;
  transform: translateX(-50%);
}
</style>
