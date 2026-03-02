import { Material, RoomType, Reference } from './types';

export const MATERIALS: Material[] = [
  // Floors
  { id: 'concrete', name: 'Concrete / Tile', alpha: 0.02, category: 'floor' },
  { id: 'wood', name: 'Hardwood Floor', alpha: 0.10, category: 'floor' },
  { id: 'carpet-thin', name: 'Thin Carpet', alpha: 0.25, category: 'floor' },
  { id: 'carpet-thick', name: 'Thick Carpet / Rug', alpha: 0.50, category: 'floor' },
  
  // Walls
  { id: 'plasterboard', name: 'Plasterboard / Drywall', alpha: 0.05, category: 'wall' },
  { id: 'brick', name: 'Brick / Stone', alpha: 0.03, category: 'wall' },
  { id: 'glass', name: 'Large Windows / Glass', alpha: 0.18, category: 'wall' },
  { id: 'curtains-light', name: 'Light Curtains', alpha: 0.15, category: 'wall' },
  { id: 'curtains-heavy', name: 'Heavy Drapes', alpha: 0.50, category: 'wall' },
  { id: 'acoustic-panel', name: 'Acoustic Panels', alpha: 0.85, category: 'wall' },
  
  // Ceilings
  { id: 'ceiling-plaster', name: 'Plaster / Concrete', alpha: 0.02, category: 'ceiling' },
  { id: 'ceiling-tiles', name: 'Acoustic Ceiling Tiles', alpha: 0.70, category: 'ceiling' },
  { id: 'ceiling-wood', name: 'Wood Slats', alpha: 0.15, category: 'ceiling' },
];

export const ROOM_TYPES: RoomType[] = [
  { 
    id: 'bedroom', 
    name: 'Bedroom / Living Room', 
    targetRT60: [0.4, 0.6], 
    description: 'Needs a cozy, quiet atmosphere with minimal echo for speech clarity.' 
  },
  { 
    id: 'office', 
    name: 'Home Office / Studio', 
    targetRT60: [0.3, 0.5], 
    description: 'Focus on high speech intelligibility and low background noise.' 
  },
  { 
    id: 'theater', 
    name: 'Home Theater', 
    targetRT60: [0.2, 0.4], 
    description: 'Requires a "dead" room to let the speakers define the soundstage.' 
  },
  { 
    id: 'hall', 
    name: 'Large Open Space', 
    targetRT60: [0.8, 1.2], 
    description: 'A bit more liveliness is acceptable, but avoid excessive booming.' 
  },
];

export const REFERENCES: Reference[] = [
  {
    id: 'sabine',
    title: 'Collected Papers on Acoustics',
    author: 'Wallace Clement Sabine',
    year: '1922'
  },
  {
    id: 'knudsen',
    title: 'Architectural Acoustics',
    author: 'Vern O. Knudsen',
    year: '1932'
  },
  {
    id: 'everest',
    title: 'Master Handbook of Acoustics',
    author: 'F. Alton Everest & Ken C. Pohlmann',
    year: '2014'
  }
];
