import { defineNuxtPlugin } from "#app";
import type { Plugin } from "vue";
import OpenLayersMap, {
  Map,
  Layers,
  Sources,
  MapControls,
  Interactions,
} from "vue3-openlayers";
import "vue3-openlayers/styles.css";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(OpenLayersMap as unknown as Plugin);
  //   nuxtApp.vueApp.use(MapControls as unknown as Plugin);
  //   nuxtApp.vueApp.use(Map as unknown as Plugin);
  //   nuxtApp.vueApp.use(Layers as unknown as Plugin);
  //   nuxtApp.vueApp.use(Sources as unknown as Plugin);
  //   nuxtApp.vueApp.use(Interactions as unknown as Plugin);
});
