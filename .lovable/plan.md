# Decentralized Canteen Waste 3D Model

## Build
- Replace the blank first screen with an interactive 3D process model based on the supplied engineering blueprint.
- Model the sorting table, shredder and dilution feed, 7.5 m³ FRP digester, condensate trap, iron-sponge scrubber, gas holder, safety train, kitchen burner, separator, liquid recycle, rotary composter, curing crates, and final compost.
- Show directional flow for wet waste, slurry, biogas, digestate, recycled liquid, and compost with a clear legend.
- Add model controls for orbiting, zooming, selecting stages, resetting the camera, toggling labels, and switching between overview and gas/compost paths.
- Include the key design values and safety constraints from the research without presenting the visualization as fabrication-ready engineering drawings.

## Technical details
- Use Three.js through React Three Fiber with Drei controls and labels.
- Keep all color and material roles in the global design system.
- Build responsive desktop and mobile layouts, with reduced-motion support and route metadata.
- Validate compilation and rendered desktop/mobile views, including canvas visibility and interactions.
