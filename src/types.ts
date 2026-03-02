
export interface Reference {
  id: string;
  title: string;
  author: string;
  year: string;
}

export interface Material {
  id: string;
  name: string;
  alpha: number; // Absorption coefficient at 500Hz
  category: 'floor' | 'wall' | 'ceiling';
}

export interface RoomType {
  id: string;
  name: string;
  targetRT60: [number, number]; // [min, max] in seconds
  description: string;
}

export interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

export interface RoomState {
  dimensions: RoomDimensions;
  typeId: string;
  surfaces: {
    floor: string;
    walls: string;
    ceiling: string;
  };
}

export interface AcousticResults {
  volume: number;
  surfaceArea: number;
  totalAbsorption: number;
  rt60: number;
  status: 'good' | 'fair' | 'poor';
  recommendations: string[];
}
