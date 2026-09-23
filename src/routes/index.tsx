import { createFileRoute } from "@tanstack/react-router";
import { ModelViewer } from "../components/waste-model/model-viewer";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Canteen Wet-Waste Recovery | 3D Engineering Model" },
      { name: "description", content: "Interactive 3D concept model of Techno India University's canteen wet-waste to biogas and micro-compost pipeline." },
      { property: "og:title", content: "Canteen Wet-Waste Recovery | 3D Engineering Model" },
      { property: "og:description", content: "Explore the decentralized 100 kg/day biogas and micro-compost process model." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <ModelViewer />;
}
