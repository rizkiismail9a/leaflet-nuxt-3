declare module "vue3-openlayers" {
  import { DefineComponent } from "vue";
  export const OlMap: DefineComponent<{}, {}, any>;
  export const OlView: DefineComponent<{}, {}, any>;
  export const OlTileLayer: DefineComponent<{}, {}, any>;
  export const OlSourceOsm: DefineComponent<{}, {}, any>;
  export const MapControls: DefineComponent<{}, {}, any>;
  export const Map: DefineComponent<{}, {}, any>;
  export const Layers: DefineComponent<{}, {}, any>;
  export const Sources: DefineComponent<{}, {}, any>;
  export const Interactions: DefineComponent<{}, {}, any>;
}
