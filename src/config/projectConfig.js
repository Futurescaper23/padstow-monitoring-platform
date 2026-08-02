export const projectConfig = {
  productName: "Padstow Estuary Monitoring System",
  branding: {},
  deployment: {
    publicBaseUrl: "https://padstow-monitoring-platform.onrender.com/"
  },
  defaultState: {
    areaId: "area1",
    sectionId: "A1-01",
    layerKey: "ortho",
    primaryLayerKey: "ortho",
    secondaryLayerKey: "ortho",
    activeTab: "overview"
  },
  navigation: {
    tabs: ["overview", "areas", "weather", "panorama", "fixedpoints", "volume", "layers", "sections", "admin"]
  },
  terminology: {
    survey: "survey round",
    area: "monitoring area",
    aerialLayerClient: "Aerial View",
    aerialLayerTechnical: "orthomosaic",
    elevationLayerClient: "Colour Elevation",
    elevationLayerTechnical: "DSM",
    heightModelClient: "surface height model",
    comparison: "change comparison"
  },
  // Set to true for internal FutureScaping builds that need upload,
  // intake, survey management, and other admin tools.
  showAdminTools: true
};
