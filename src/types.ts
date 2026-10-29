export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'LEVEL_SELECT'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'LEADERBOARD'
  | 'HOW_TO_PLAY';


export type TargetType = 'bullseye' | 'apple' | 'balloon' | 'shield' | 'bell' | 'star';

export type TargetAttachment = 'wall' | 'pillar' | 'rope' | 'hanging' | 'post' | 'balloon_string';

export type TargetMovementType = 'vertical' | 'horizontal' | 'pendulum' | 'sine' | 'static';

export interface Target {
  id: string;
  type: TargetType;
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  points: number;
  attachedTo: TargetAttachment;
  movement: TargetMovementType;
  speed: number;
  range: number;
  phase: number;
  // Pendulum specific
  pivotX?: number;
  pivotY?: number;
  ropeLength?: number;
  maxSwingAngle?: number;
  // State
  isHit: boolean;
  hitX?: number;
  hitY?: number;
  fadeTimer?: number;
}

export type ObstacleType = 'stone_wall' | 'wooden_barrier' | 'moving_pillar' | 'iron_gate';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  baseY: number;
  width: number;
  height: number;
  speed?: number;
  range?: number;
  phase?: number;
  direction?: 1 | -1;
  hasSpikesOrEmblem?: boolean;
}

export interface Arrow {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  state: 'flying' | 'stuck_target' | 'stuck_obstacle' | 'missed';
  stuckTargetId?: string;
  stuckOffset?: { x: number; y: number; relAngle: number };
  stuckObstacleId?: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
}

export interface LevelConfig {
  levelNumber: number;
  nameBn: string;
  nameEn: string;
  subtitleBn: string;
  subtitleEn: string;
  backgroundTheme: 'meadow' | 'sunset';
  arrowsAllowed: number;
  wind: number; // -3 to +3
  targets: Array<Omit<Target, 'id' | 'isHit' | 'baseX' | 'baseY'>>;
  obstacles: Array<Omit<Obstacle, 'id' | 'baseY'>>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  levelReached: number;
  accuracy: number;
  date: string;
}
