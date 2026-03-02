import { RoomState, AcousticResults, Material } from '../types';
import { MATERIALS, ROOM_TYPES } from '../constants';

export function calculateAcoustics(state: RoomState): AcousticResults {
  const { length, width, height } = state.dimensions;
  const volume = length * width * height;
  
  const floorArea = length * width;
  const ceilingArea = length * width;
  const wallArea = 2 * (length * height) + 2 * (width * height);
  
  const floorMaterial = MATERIALS.find(m => m.id === state.surfaces.floor)!;
  const wallMaterial = MATERIALS.find(m => m.id === state.surfaces.walls)!;
  const ceilingMaterial = MATERIALS.find(m => m.id === state.surfaces.ceiling)!;
  
  const totalAbsorption = 
    (floorArea * floorMaterial.alpha) + 
    (wallArea * wallMaterial.alpha) + 
    (ceilingArea * ceilingMaterial.alpha);
    
  // Sabine's Formula: RT60 = 0.161 * V / A
  const rt60 = totalAbsorption > 0 ? (0.161 * volume) / totalAbsorption : 0;
  
  const roomType = ROOM_TYPES.find(t => t.id === state.typeId)!;
  const [min, max] = roomType.targetRT60;
  
  let status: 'good' | 'fair' | 'poor' = 'good';
  const recommendations: string[] = [];
  
  if (rt60 > max) {
    status = rt60 > max * 1.5 ? 'poor' : 'fair';
    recommendations.push("The room is too 'live' (echoey). Add more soft materials.");
    if (state.surfaces.floor === 'concrete' || state.surfaces.floor === 'wood') {
      recommendations.push("Consider adding a large, thick rug to the floor.");
    }
    if (state.surfaces.walls !== 'acoustic-panel' && state.surfaces.walls !== 'curtains-heavy') {
      recommendations.push("Add heavy drapes or acoustic wall panels to reduce reflections.");
    }
    if (state.surfaces.ceiling === 'ceiling-plaster') {
      recommendations.push("Installing acoustic ceiling clouds or tiles would significantly help.");
    }
  } else if (rt60 < min) {
    status = rt60 < min * 0.5 ? 'poor' : 'fair';
    recommendations.push("The room is too 'dead'. It might feel oppressive or unnatural.");
    recommendations.push("Remove some absorption or add hard surfaces like wood or glass.");
  } else {
    recommendations.push("Great job! The acoustics are well-balanced for this room type.");
    recommendations.push("Maintain the current balance of hard and soft surfaces.");
  }

  return {
    volume,
    surfaceArea: floorArea + ceilingArea + wallArea,
    totalAbsorption,
    rt60,
    status,
    recommendations
  };
}
