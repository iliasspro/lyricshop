import type { GarmentId } from "./garments";

/** Flat garment measurements in inches (chest is pit to pit, laid flat). */
export type SizeRow = { size: string; chest: number; length: number; sleeve?: number };

export const SIZE_CHARTS: Partial<Record<GarmentId, SizeRow[]>> = {
  tee: [
    { size: "XS", chest: 20, length: 26.5 },
    { size: "S", chest: 21.5, length: 27.5 },
    { size: "M", chest: 23, length: 28.5 },
    { size: "L", chest: 24.5, length: 29.5 },
    { size: "XL", chest: 26, length: 30.5 },
    { size: "2XL", chest: 27.5, length: 31.5 },
  ],
  longsleeve: [
    { size: "XS", chest: 20, length: 27, sleeve: 32 },
    { size: "S", chest: 21.5, length: 28, sleeve: 33 },
    { size: "M", chest: 23, length: 29, sleeve: 34 },
    { size: "L", chest: 24.5, length: 30, sleeve: 35 },
    { size: "XL", chest: 26, length: 31, sleeve: 36 },
    { size: "2XL", chest: 27.5, length: 32, sleeve: 37 },
  ],
  hoodie: [
    { size: "XS", chest: 22, length: 26, sleeve: 33 },
    { size: "S", chest: 23.5, length: 27, sleeve: 34 },
    { size: "M", chest: 25, length: 28, sleeve: 35 },
    { size: "L", chest: 26.5, length: 29, sleeve: 36 },
    { size: "XL", chest: 28, length: 30, sleeve: 37 },
    { size: "2XL", chest: 29.5, length: 31, sleeve: 38 },
  ],
  crewneck: [
    { size: "XS", chest: 21.5, length: 25.5, sleeve: 32.5 },
    { size: "S", chest: 23, length: 26.5, sleeve: 33.5 },
    { size: "M", chest: 24.5, length: 27.5, sleeve: 34.5 },
    { size: "L", chest: 26, length: 28.5, sleeve: 35.5 },
    { size: "XL", chest: 27.5, length: 29.5, sleeve: 36.5 },
    { size: "2XL", chest: 29, length: 30.5, sleeve: 37.5 },
  ],
};

export const toCm = (inches: number) => Math.round(inches * 2.54);
