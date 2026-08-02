export const futurescapingHeroShellConfig = {
  brand: {
    name: "FutureScaping Labs",
    sublabel: "Monitoring System"
  },
  hero: {
    eyebrow: "Visual Change Monitoring",
    title: "Monitoring System",
    summary: "Visual change monitoring for coastal landscapes.",
    imagePath: "./assets/example-hero.png",
    imageAlt: "Project hero image"
  },
  pills: [
    {
      label: "Survey Dates",
      value: "18-19 April 2026"
    },
    {
      label: "Survey Area",
      value: "A1 - Example Area",
      subtext: "Outer zone / west side"
    }
  ],
  summaryDock: {
    enabled: false,
    text: "Optional longer summary text can sit in the bottom-right dock when the image needs extra support for readability."
  },
  navigation: [
    { id: "overview", label: "Overview", icon: "home", href: "#overview", active: true },
    { id: "areas", label: "Survey Areas", icon: "grid", href: "#areas" },
    { id: "weather", label: "Weather", icon: "cloud", href: "#weather" },
    { id: "volume", label: "Volume Change", icon: "bars", href: "#volume" },
    { id: "compare", label: "Compare", icon: "split", href: "#compare" },
    { id: "sections", label: "Sections", icon: "columns", href: "#sections" }
  ]
};
