export interface Tooth3DAssets {
  objUrl: string;
  textureUrl?: string;
  mirrorX?: boolean;
}

/** Canino superior Dundee — original em tmp/maxillary-canine (Sketchfab). */
const MAXILLARY_CANINE: Tooth3DAssets = {
  objUrl: "/tmp/maxillary-canine/extracted/UL3sketch1_1.OBJ",
  textureUrl: "/tmp/maxillary-canine/textures/UL3sketch1_1-TM.png",
};

export function getTooth3DAssets(toothNumber: number): Tooth3DAssets {
  if (toothNumber === 13) return MAXILLARY_CANINE;
  if (toothNumber === 23) return { ...MAXILLARY_CANINE, mirrorX: true };
  return { objUrl: `/models/${toothNumber}.obj` };
}
