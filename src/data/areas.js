export const areaSettings = {
  count: 8,
  idPrefix: "area",
  codePrefix: "A",
  defaultDay: "Day 1",
  defaultZone: "Monitoring area",
  defaultStatusLabel: "Monitoring area",
  defaultStatusNote: "Prototype assets are available. Future survey rounds should attach new outputs to this same area key.",
  defaultDeliverables: "High-resolution aerial image, surface height model, 3D ground model, future comparison views",
  defaultTags: ["Ortho", "DSM", "Contours", "Sections"]
};

export const layerSettings = {
  ortho: {
    label: "Aerial View",
    fileType: "PNG / JPG",
    fileName: "ortho.jpg",
    description: "Base aerial imagery"
  },
  dsm: {
    label: "Colour Elevation",
    fileType: "PNG",
    fileName: "dsm.png",
    description: "Colour elevation map"
  },
  contours: {
    label: "Contours",
    fileType: "PNG",
    fileName: "contour.png",
    description: "Contour overlay"
  },
  sections: {
    label: "Section Lines",
    fileType: "PNG",
    fileName: "section_lines.png",
    description: "Section-line overlay"
  }
};

export const assetSettings = {
  surveyRoot: "survey-data",
  sharedRoot: "shared-data",
  expectedSurveyAssets: [
    { key: "ortho", inputId: "uploadOrtho", fileName: "ortho.jpg", label: "ortho.png or ortho.jpg", description: "Aerial view export for the selected survey and area." },
    { key: "dsm", inputId: "uploadDsm", fileName: "dsm.png", label: "dsm.png", description: "Colour elevation export for the selected survey and area." },
    { key: "contours", inputId: "uploadContour", fileName: "contour.png", label: "contour.png or contours.png", description: "Contour overlay for the selected survey and area." },
    { key: "sections", inputId: "uploadSectionLines", fileName: "section_lines.png", label: "section_lines.png or section-lines.svg", description: "Section-line overlay for the selected survey and area." },
    { key: "sectionProfiles", inputId: "uploadSectionCsv", fileName: "section_profiles.csv", label: "section_profiles.csv", description: "CSV-backed section profile data for the selected survey and area." }
  ],
  variants: {
    "ortho.jpg": ["ortho.png"],
    "contour.png": ["contours.png"],
    "section_lines.png": ["section-lines.png", "section-lines.svg", "section_lines.svg"],
    "section_profiles.csv": ["{areaId}_section_profiles.csv"]
  },
  areaSpecificVariants: {
    area7: {
      "section_profiles.csv": ["area8_section_profiles.csv"]
    }
  }
};
