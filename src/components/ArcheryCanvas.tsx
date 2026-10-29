import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Obstacle, Arrow, Particle, FloatingText, LevelConfig } from '../types';
import { sounds } from '../utils/audio';

interface ArcheryCanvasProps {
  levelConfig: LevelConfig;
  onLevelComplete: (stats: { score: number; arrowsLeft: number; accuracy: number }) => void;
  onGameOver: (finalScore: number) => void;
  onScoreUpdate: (score: number, combo: number, arrowsLeft: number, targetsLeft: number) => void;
  isPaused: boolean;
  lang: 'bn' | 'en';
}

// Logical coordinates for fixed aspect ratio
const VIRTUAL_WIDTH = 1200;
const VIRTUAL_HEIGHT = 700;
const GRAVITY = 0.28;
const BOW_POS = { x: 130, y: 440 };

export const ArcheryCanvas: React.FC<ArcheryCanvasProps> = ({
  levelConfig,
  onLevelComplete,
  onGameOver,
  onScoreUpdate,
  isPaused,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Gameplay state refs to avoid closure stalls in requestAnimationFrame
  const targetsRef = useRef<Target[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const arrowsRef = useRef<Arrow[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Player state refs
  const arrowsLeftRef = useRef<number>(levelConfig.arrowsAllowed);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const totalShotsRef = useRef<number>(0);
  const totalHitsRef = useRef<number>(0);

  // Dragging / Aiming refs
  const isAimingRef = useRef<boolean>(false);
  const aimStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const aimCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const bowAngleRef = useRef<number>(0);
  const drawPowerRef = useRef<number>(0); // 0 to 1

  // Background images cache
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  // Preload background images
  useEffect(() => {
    const img = new Image();
    img.src =
      levelConfig.backgroundTheme === 'meadow'
        ? '/src/assets/images/archery_scenic_meadow_1793206843183.jpg'
        : '/src/assets/images/archery_sunset_fortress_1793206843366.jpg';
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, [levelConfig.backgroundTheme]);

  // Initialize Level
  const initLevel = useCallback(() => {
    arrowsLeftRef.current = levelConfig.arrowsAllowed;
    arrowsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];

    // Map targets with base positions
    targetsRef.current = levelConfig.targets.map((t, idx) => ({
      ...t,
      id: `target_${levelConfig.levelNumber}_${idx}`,
      baseX: t.x,
      baseY: t.y,
      isHit: false,
      hitX: undefined,
      hitY: undefined,
      fadeTimer: undefined,
    }));

    // Map obstacles with base positions
    obstaclesRef.current = levelConfig.obstacles.map((o, idx) => ({
      ...o,
      id: `obstacle_${levelConfig.levelNumber}_${idx}`,
      baseY: o.y,
    }));

    onScoreUpdate(
      scoreRef.current,
      comboRef.current,
      arrowsLeftRef.current,
      targetsRef.current.filter((t) => !t.isHit).length
    );
  }, [levelConfig, onScoreUpdate]);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  // Convert client mouse/touch coords to virtual canvas coords
  const getVirtualCoords = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = VIRTUAL_WIDTH / rect.width;
    const scaleY = VIRTUAL_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Particles generator
  const spawnParticles = (x: number, y: number, color: string, count = 16, size = 3) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        color,
        size: Math.random() * size + 2,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 25 + 20,
      });
    }
  };

  // Floating text generator
  const addFloatingText = (x: number, y: number, text: string, color = '#fef08a') => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      scale: 1.2,
    });
  };

  // Check end of round conditions
  const checkRoundStatus = useCallback(() => {
    const unhitTargets = targetsRef.current.filter((t) => !t.isHit);
    const flyingArrows = arrowsRef.current.filter((a) => a.state === 'flying');

    if (unhitTargets.length === 0) {
      // LEVEL CLEARED!
      sounds.playLevelWin();
      // Bonus for remaining arrows
      const arrowBonus = arrowsLeftRef.current * 75;
      if (arrowBonus > 0) {
        scoreRef.current += arrowBonus;
        addFloatingText(BOW_POS.x + 60, BOW_POS.y - 40, `+${arrowBonus} বোনাছ!`, '#38bdf8');
      }
      const accuracy =
        totalShotsRef.current > 0
          ? Math.round((totalHitsRef.current / totalShotsRef.current) * 100)
          : 100;

      setTimeout(() => {
        onLevelComplete({
          score: scoreRef.current,
          arrowsLeft: arrowsLeftRef.current,
          accuracy,
        });
      }, 700);
    } else if (arrowsLeftRef.current <= 0 && flyingArrows.length === 0) {
      // OUT OF ARROWS - GAME OVER!
      sounds.playGameOver();
      setTimeout(() => {
        onGameOver(scoreRef.current);
      }, 900);
    }
  }, [onGameOver, onLevelComplete]);

  // Fire Arrow Handler
  const fireArrow = useCallback(() => {
    if (arrowsLeftRef.current <= 0 || drawPowerRef.current < 0.12) {
      isAimingRef.current = false;
      drawPowerRef.current = 0;
      return;
    }

    arrowsLeftRef.current -= 1;
    totalShotsRef.current += 1;

    // Arrow velocity based on draw power and angle
    const speed = drawPowerRef.current * 25 + 10;
    const vx = Math.cos(bowAngleRef.current) * speed;
    const vy = Math.sin(bowAngleRef.current) * speed;

    arrowsRef.current.push({
      id: Math.random().toString(),
      x: BOW_POS.x + Math.cos(bowAngleRef.current) * 45,
      y: BOW_POS.y + Math.sin(bowAngleRef.current) * 45,
      vx,
      vy,
      angle: bowAngleRef.current,
      state: 'flying',
      trail: [],
    });

    sounds.playRelease();

    // Reset aiming
    isAimingRef.current = false;
    drawPowerRef.current = 0;

    onScoreUpdate(
      scoreRef.current,
      comboRef.current,
      arrowsLeftRef.current,
      targetsRef.current.filter((t) => !t.isHit).length
    );
  }, [onScoreUpdate]);

  // Pointer event listeners
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isPaused || arrowsLeftRef.current <= 0) return;
    const coords = getVirtualCoords(e.clientX, e.clientY);
    isAimingRef.current = true;
    aimStartRef.current = coords;
    aimCurrentRef.current = coords;
    sounds.playDraw();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isAimingRef.current) return;
    const coords = getVirtualCoords(e.clientX, e.clientY);
    aimCurrentRef.current = coords;

    // Vector from current drag point to start drag point
    const dx = coords.x - BOW_POS.x;
    const dy = coords.y - BOW_POS.y;

    // Invert if user is pulling backwards (Angry Birds style) or aiming forward
    const pullDist = Math.hypot(coords.x - aimStartRef.current.x, coords.y - aimStartRef.current.y);

    // Natural archer pull: dragging opposite to target OR dragging towards target
    // We support intuitive drag:
    // If dragging backwards from bow: pull angle is forwards
    let aimAngle = Math.atan2(dy, dx);
    if (coords.x < BOW_POS.x) {
      // Pulling backward: aim forward!
      aimAngle = Math.atan2(BOW_POS.y - coords.y, BOW_POS.x - coords.x);
    }

    bowAngleRef.current = aimAngle;
    const maxPull = 160;
    drawPowerRef.current = Math.min(1, Math.max(0.1, pullDist / maxPull));
  };

  const handlePointerUp = () => {
    if (isAimingRef.current) {
      fireArrow();
    }
  };

  // Main Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;

      if (!isPaused) {
        // 1. UPDATE TARGETS POSITIONS
        targetsRef.current.forEach((t) => {
          if (t.isHit) {
            if (t.fadeTimer !== undefined) {
              t.fadeTimer -= 0.02;
            }
            return;
          }

          if (t.movement === 'vertical') {
            t.y = t.baseY + Math.sin(tick * 0.03 * t.speed + t.phase) * t.range;
          } else if (t.movement === 'horizontal') {
            t.x = t.baseX + Math.cos(tick * 0.03 * t.speed + t.phase) * t.range;
          } else if (t.movement === 'sine') {
            t.y = t.baseY + Math.sin(tick * 0.035 * t.speed + t.phase) * t.range;
            t.x = t.baseX + Math.cos(tick * 0.02 * t.speed + t.phase) * (t.range * 0.4);
          } else if (t.movement === 'pendulum') {
            const pivotX = t.pivotX ?? t.baseX;
            const pivotY = t.pivotY ?? 80;
            const ropeLen = t.ropeLength ?? 180;
            const maxAngle = t.maxSwingAngle ?? 0.5;
            const swingAngle = Math.sin(tick * 0.035 * t.speed + t.phase) * maxAngle;

            t.x = pivotX + Math.sin(swingAngle) * ropeLen;
            t.y = pivotY + Math.cos(swingAngle) * ropeLen;
          }
        });

        // 2. UPDATE OBSTACLES POSITIONS
        obstaclesRef.current.forEach((o) => {
          if (o.speed && o.range) {
            const dir = o.direction || 1;
            o.y = o.baseY + Math.sin(tick * 0.03 * o.speed) * o.range * dir;
          }
        });

        // 3. UPDATE ARROWS
        arrowsRef.current.forEach((arrow) => {
          if (arrow.state === 'flying') {
            // Apply wind and gravity
            arrow.vy += GRAVITY;
            arrow.vx += levelConfig.wind * 0.035;
            arrow.x += arrow.vx;
            arrow.y += arrow.vy;
            arrow.angle = Math.atan2(arrow.vy, arrow.vx);

            // Add trail
            arrow.trail.push({ x: arrow.x, y: arrow.y, alpha: 0.6 });
            if (arrow.trail.length > 8) {
              arrow.trail.shift();
            }

            // Check collision with obstacles
            const tipX = arrow.x + Math.cos(arrow.angle) * 35;
            const tipY = arrow.y + Math.sin(arrow.angle) * 35;

            for (const obs of obstaclesRef.current) {
              if (
                tipX >= obs.x &&
                tipX <= obs.x + obs.width &&
                tipY >= obs.y &&
                tipY <= obs.y + obs.height
              ) {
                arrow.state = 'stuck_obstacle';
                arrow.vx = 0;
                arrow.vy = 0;
                sounds.playObstacleHit();
                comboRef.current = 0;
                spawnParticles(tipX, tipY, '#94a3b8', 12, 2.5);
                addFloatingText(tipX, tipY - 15, 'বাধা! (Blocked)', '#f87171');
                checkRoundStatus();
                break;
              }
            }

            // Check collision with targets
            if (arrow.state === 'flying') {
              for (const target of targetsRef.current) {
                if (target.isHit) continue;
                const dist = Math.hypot(tipX - target.x, tipY - target.y);

                if (dist <= target.radius + 6) {
                  // HIT!
                  target.isHit = true;
                  target.hitX = tipX;
                  target.hitY = tipY;
                  target.fadeTimer = 1.0;

                  totalHitsRef.current += 1;
                  comboRef.current += 1;

                  arrow.state = 'stuck_target';
                  arrow.stuckTargetId = target.id;
                  arrow.stuckOffset = {
                    x: tipX - target.x,
                    y: tipY - target.y,
                    relAngle: arrow.angle,
                  };

                  // Check if Bullseye (within 28% of center for bullseye target)
                  const isBullseye = target.type === 'bullseye' && dist <= target.radius * 0.32;
                  let gainedPoints = target.points;

                  if (isBullseye) {
                    gainedPoints += 50;
                  }

                  // Combo multiplier
                  const multiplier = comboRef.current > 1 ? 1 + (comboRef.current - 1) * 0.3 : 1;
                  const finalEarned = Math.round(gainedPoints * multiplier);
                  scoreRef.current += finalEarned;

                  sounds.playHit(finalEarned, isBullseye);

                  // Colors and texts
                  const sparkColor =
                    target.type === 'apple'
                      ? '#ef4444'
                      : target.type === 'balloon'
                      ? '#ec4899'
                      : target.type === 'bell' || target.type === 'star'
                      ? '#fbbf24'
                      : '#38bdf8';

                  spawnParticles(tipX, tipY, sparkColor, 24, 4);

                  const bonusLabel = isBullseye
                    ? `বুলসআই! +${finalEarned}`
                    : comboRef.current > 1
                    ? `কম্বো x${multiplier.toFixed(1)}! +${finalEarned}`
                    : `+${finalEarned}`;

                  addFloatingText(target.x, target.y - 20, bonusLabel, sparkColor);

                  onScoreUpdate(
                    scoreRef.current,
                    comboRef.current,
                    arrowsLeftRef.current,
                    targetsRef.current.filter((t) => !t.isHit).length
                  );

                  checkRoundStatus();
                  break;
                }
              }
            }

            // Missed bounds check
            if (arrow.y > VIRTUAL_HEIGHT - 35 || arrow.x > VIRTUAL_WIDTH + 80 || arrow.x < -40) {
              if (arrow.y > VIRTUAL_HEIGHT - 35) {
                arrow.y = VIRTUAL_HEIGHT - 35;
                arrow.state = 'missed';
                arrow.vx = 0;
                arrow.vy = 0;
                sounds.playMiss();
                spawnParticles(arrow.x, arrow.y, '#78350f', 8, 2);
              } else {
                arrow.state = 'missed';
              }
              comboRef.current = 0;
              checkRoundStatus();
            }
          }
        });

        // 4. UPDATE PARTICLES
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.15; // particle gravity
          p.life++;
          p.alpha = 1 - p.life / p.maxLife;
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

        // 5. UPDATE FLOATING TEXTS
        floatingTextsRef.current.forEach((ft) => {
          ft.y -= 1.1;
          ft.alpha -= 0.02;
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.alpha > 0);
      }

      // ==================== RENDERING ====================
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // A. DRAW BACKGROUND
      if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
        // Atmospheric gradient overlay for contrast and depth
        const grad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
        grad.addColorStop(0, 'rgba(15, 23, 42, 0.25)');
        grad.addColorStop(0.7, 'rgba(15, 23, 42, 0.1)');
        grad.addColorStop(1, 'rgba(15, 23, 42, 0.6)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      } else {
        // Fallback procedural sky & mountains
        const skyGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
        if (levelConfig.backgroundTheme === 'meadow') {
          skyGrad.addColorStop(0, '#38bdf8');
          skyGrad.addColorStop(0.6, '#bae6fd');
          skyGrad.addColorStop(1, '#4ade80');
        } else {
          skyGrad.addColorStop(0, '#312e81');
          skyGrad.addColorStop(0.5, '#c026d3');
          skyGrad.addColorStop(1, '#f97316');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);
      }

      // Ground plane
      ctx.fillStyle = levelConfig.backgroundTheme === 'meadow' ? '#166534' : '#451a03';
      ctx.fillRect(0, VIRTUAL_HEIGHT - 40, VIRTUAL_WIDTH, 40);
      ctx.fillStyle = levelConfig.backgroundTheme === 'meadow' ? '#15803d' : '#78350f';
      ctx.fillRect(0, VIRTUAL_HEIGHT - 44, VIRTUAL_WIDTH, 4);

      // B. DRAW OBSTACLES
      obstaclesRef.current.forEach((obs) => {
        ctx.save();
        if (obs.type === 'stone_wall' || obs.type === 'moving_pillar') {
          // Stone Castle Wall / Pillar
          const wallGrad = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
          wallGrad.addColorStop(0, '#475569');
          wallGrad.addColorStop(0.3, '#64748b');
          wallGrad.addColorStop(0.8, '#475569');
          wallGrad.addColorStop(1, '#334155');
          ctx.fillStyle = wallGrad;
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Brick outlines
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 1.5;
          const brickH = 24;
          for (let by = obs.y; by < obs.y + obs.height; by += brickH) {
            ctx.beginPath();
            ctx.moveTo(obs.x, by);
            ctx.lineTo(obs.x + obs.width, by);
            ctx.stroke();
          }
          // Border
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Top crenellation / cap
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x - 4, obs.y - 6, obs.width + 8, 8);
        } else if (obs.type === 'wooden_barrier') {
          // Timber Barrier
          ctx.fillStyle = '#78350f';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#451a03';
          ctx.lineWidth = 2;
          ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

          // Planks
          const plankH = 28;
          for (let py = obs.y; py < obs.y + obs.height; py += plankH) {
            ctx.beginPath();
            ctx.moveTo(obs.x, py);
            ctx.lineTo(obs.x + obs.width, py);
            ctx.stroke();
            // Iron studs
            ctx.fillStyle = '#1e293b';
            ctx.beginPath();
            ctx.arc(obs.x + 6, py + 14, 3, 0, Math.PI * 2);
            ctx.arc(obs.x + obs.width - 6, py + 14, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (obs.type === 'iron_gate') {
          // Iron Portcullis Gate
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 3;
          // Vertical bars
          const barGap = obs.width / 3;
          for (let bx = obs.x + barGap / 2; bx < obs.x + obs.width; bx += barGap) {
            ctx.beginPath();
            ctx.moveTo(bx, obs.y);
            ctx.lineTo(bx, obs.y + obs.height);
            ctx.stroke();
            // Pointed spike at bottom
            ctx.beginPath();
            ctx.moveTo(bx - 4, obs.y + obs.height);
            ctx.lineTo(bx, obs.y + obs.height + 12);
            ctx.lineTo(bx + 4, obs.y + obs.height);
            ctx.fillStyle = '#cbd5e1';
            ctx.fill();
          }
          // Horizontal cross ties
          for (let hy = obs.y + 20; hy < obs.y + obs.height; hy += 40) {
            ctx.strokeRect(obs.x, hy, obs.width, 5);
          }
        }
        ctx.restore();
      });

      // C. DRAW TARGET ATTACHMENTS & SUPPORTS
      targetsRef.current.forEach((t) => {
        if (t.isHit && (t.fadeTimer ?? 0) <= 0) return;
        ctx.save();
        ctx.globalAlpha = t.isHit ? Math.max(0, t.fadeTimer ?? 1) : 1;

        if (t.attachedTo === 'hanging' || t.attachedTo === 'rope') {
          // Hanging chain / rope from ceiling or pivot
          const px = t.pivotX ?? t.baseX;
          const py = t.pivotY ?? 60;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(t.x, t.y - t.radius);
          ctx.strokeStyle = t.attachedTo === 'hanging' ? '#94a3b8' : '#d97706';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Anchor ring at top
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fill();
        } else if (t.attachedTo === 'balloon_string') {
          // Balloon string curving down
          ctx.beginPath();
          ctx.moveTo(t.x, t.y + t.radius);
          ctx.quadraticCurveTo(t.x - 8, t.y + t.radius + 30, t.x + 4, t.y + t.radius + 60);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (t.attachedTo === 'pillar' || t.attachedTo === 'post') {
          // Stand/post holding the target
          ctx.fillStyle = '#5c3a21';
          ctx.fillRect(t.x - 4, t.y + t.radius * 0.7, 8, VIRTUAL_HEIGHT - (t.y + t.radius * 0.7));
          ctx.strokeStyle = '#29180b';
          ctx.lineWidth = 1;
          ctx.strokeRect(t.x - 4, t.y + t.radius * 0.7, 8, VIRTUAL_HEIGHT - (t.y + t.radius * 0.7));
        } else if (t.attachedTo === 'wall') {
          // Bracket connecting to nearby wall
          ctx.fillStyle = '#334155';
          ctx.fillRect(t.x - t.radius - 8, t.y - 4, 12, 8);
        }
        ctx.restore();
      });

      // D. DRAW TARGETS
      targetsRef.current.forEach((t) => {
        if (t.isHit && (t.fadeTimer ?? 0) <= 0) return;
        ctx.save();
        ctx.globalAlpha = t.isHit ? Math.max(0, t.fadeTimer ?? 1) : 1;

        if (t.type === 'bullseye') {
          // Archery Bullseye Rings
          const r = t.radius;
          // Wood backboard
          ctx.beginPath();
          ctx.arc(t.x, t.y, r + 3, 0, Math.PI * 2);
          ctx.fillStyle = '#b45309';
          ctx.fill();
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.stroke();

          // White ring (10 pts)
          ctx.beginPath();
          ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
          ctx.fillStyle = '#f8fafc';
          ctx.fill();
          ctx.strokeStyle = '#cbd5e1';
          ctx.stroke();

          // Black ring (20 pts)
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = '#1e293b';
          ctx.fill();

          // Blue ring (30 pts)
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = '#0284c7';
          ctx.fill();

          // Red ring (40 pts)
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = '#dc2626';
          ctx.fill();

          // Gold center bullseye (50 pts)
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = '#eab308';
          ctx.fill();

          // Center crosshair
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(t.x - 4, t.y);
          ctx.lineTo(t.x + 4, t.y);
          ctx.moveTo(t.x, t.y - 4);
          ctx.lineTo(t.x, t.y + 4);
          ctx.stroke();
        } else if (t.type === 'apple') {
          // Glossy Red Apple
          const r = t.radius;
          const appleGrad = ctx.createRadialGradient(
            t.x - r * 0.3,
            t.y - r * 0.3,
            2,
            t.x,
            t.y,
            r
          );
          appleGrad.addColorStop(0, '#f87171');
          appleGrad.addColorStop(0.6, '#dc2626');
          appleGrad.addColorStop(1, '#991b1b');

          ctx.beginPath();
          ctx.arc(t.x, t.y, r, 0, Math.PI * 2);
          ctx.fillStyle = appleGrad;
          ctx.fill();

          // Apple stem
          ctx.beginPath();
          ctx.moveTo(t.x, t.y - r + 3);
          ctx.quadraticCurveTo(t.x + 3, t.y - r - 6, t.x + 6, t.y - r - 9);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Leaf
          ctx.beginPath();
          ctx.ellipse(t.x + 7, t.y - r - 6, 5, 2.5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = '#22c55e';
          ctx.fill();
        } else if (t.type === 'balloon') {
          // Translucent floating balloon
          const r = t.radius;
          const balloonGrad = ctx.createRadialGradient(
            t.x - r * 0.3,
            t.y - r * 0.3,
            3,
            t.x,
            t.y,
            r
          );
          balloonGrad.addColorStop(0, '#f472b6');
          balloonGrad.addColorStop(0.7, '#db2777');
          balloonGrad.addColorStop(1, '#9d174d');

          ctx.beginPath();
          ctx.ellipse(t.x, t.y, r * 0.85, r * 1.05, 0, 0, Math.PI * 2);
          ctx.fillStyle = balloonGrad;
          ctx.fill();

          // Shine spot
          ctx.beginPath();
          ctx.ellipse(t.x - r * 0.35, t.y - r * 0.4, r * 0.22, r * 0.35, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.fill();

          // Tie knot
          ctx.beginPath();
          ctx.moveTo(t.x - 4, t.y + r * 1.05);
          ctx.lineTo(t.x + 4, t.y + r * 1.05);
          ctx.lineTo(t.x, t.y + r * 1.05 + 5);
          ctx.fillStyle = '#9d174d';
          ctx.fill();
        } else if (t.type === 'shield') {
          // Medieval Shield Crest
          const r = t.radius;
          ctx.beginPath();
          ctx.moveTo(t.x - r, t.y - r * 0.8);
          ctx.lineTo(t.x + r, t.y - r * 0.8);
          ctx.lineTo(t.x + r, t.y);
          ctx.quadraticCurveTo(t.x + r * 0.8, t.y + r, t.x, t.y + r * 1.2);
          ctx.quadraticCurveTo(t.x - r * 0.8, t.y + r, t.x - r, t.y);
          ctx.closePath();

          ctx.fillStyle = '#1e3a8a';
          ctx.fill();
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.stroke();

          // Emblem in center
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * 0.35, 0, Math.PI * 2);
          ctx.fill();
        } else if (t.type === 'bell') {
          // Golden Bell
          const r = t.radius;
          const bellGrad = ctx.createRadialGradient(
            t.x - r * 0.3,
            t.y - r * 0.3,
            2,
            t.x,
            t.y,
            r
          );
          bellGrad.addColorStop(0, '#fef08a');
          bellGrad.addColorStop(0.6, '#eab308');
          bellGrad.addColorStop(1, '#a16207');

          ctx.beginPath();
          ctx.moveTo(t.x, t.y - r);
          ctx.quadraticCurveTo(t.x + r, t.y - r * 0.2, t.x + r * 0.9, t.y + r * 0.6);
          ctx.lineTo(t.x - r * 0.9, t.y + r * 0.6);
          ctx.quadraticCurveTo(t.x - r, t.y - r * 0.2, t.x, t.y - r);
          ctx.fillStyle = bellGrad;
          ctx.fill();
          ctx.strokeStyle = '#713f12';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Bell clapper
          ctx.beginPath();
          ctx.arc(t.x, t.y + r * 0.8, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#713f12';
          ctx.fill();
        } else if (t.type === 'star') {
          // Shimmering Golden Star
          const r = t.radius;
          ctx.save();
          ctx.translate(t.x, t.y);
          ctx.rotate(tick * 0.02);
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            ctx.lineTo(
              Math.cos(((18 + i * 72) * Math.PI) / 180) * r,
              -Math.sin(((18 + i * 72) * Math.PI) / 180) * r
            );
            ctx.lineTo(
              Math.cos(((54 + i * 72) * Math.PI) / 180) * (r * 0.45),
              -Math.sin(((54 + i * 72) * Math.PI) / 180) * (r * 0.45)
            );
          }
          ctx.closePath();
          ctx.fillStyle = '#fbbf24';
          ctx.fill();
          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      });

      // E. DRAW ARROWS
      arrowsRef.current.forEach((arrow) => {
        // Draw trail
        if (arrow.trail.length > 1) {
          ctx.save();
          for (let i = 0; i < arrow.trail.length - 1; i++) {
            const p1 = arrow.trail[i];
            const p2 = arrow.trail[i + 1];
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(254, 240, 138, ${(i / arrow.trail.length) * 0.45})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
          ctx.restore();
        }

        // Draw arrow body
        ctx.save();
        ctx.translate(arrow.x, arrow.y);
        ctx.rotate(arrow.angle);

        // Shaft (wooden)
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Arrowhead (steel tip)
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-12, -5);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-12, 5);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Fletching (red/yellow feathers)
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-40, 0);
        ctx.lineTo(-48, -7);
        ctx.lineTo(-32, -2);
        ctx.lineTo(-40, 0);
        ctx.lineTo(-48, 7);
        ctx.lineTo(-32, 2);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // F. DRAW PARTICLES
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // G. DRAW FLOATING TEXTS
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = 'bold 22px "Hind Siliguri", "Cinzel", sans-serif';
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        ctx.textAlign = 'center';
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // H. DRAW ARCHER & BOW
      ctx.save();
      ctx.translate(BOW_POS.x, BOW_POS.y);

      // Archer silhouette / stand
      ctx.fillStyle = '#1e293b';
      // Feet & body stance
      ctx.fillRect(-18, 0, 24, VIRTUAL_HEIGHT - BOW_POS.y - 40);

      // Bow rotation
      ctx.rotate(bowAngleRef.current);

      const drawDistance = drawPowerRef.current * 32;

      // Bow wood limb
      ctx.strokeStyle = '#854d0e';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, 48, -Math.PI / 2.3, Math.PI / 2.3);
      ctx.stroke();

      // Golden bow tips
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, 48, -Math.PI / 2.3, -Math.PI / 2.3 + 0.15);
      ctx.arc(0, 0, 48, Math.PI / 2.3 - 0.15, Math.PI / 2.3);
      ctx.stroke();

      // Bow string
      const tipTopX = Math.cos(-Math.PI / 2.3) * 48;
      const tipTopY = Math.sin(-Math.PI / 2.3) * 48;
      const tipBottomX = Math.cos(Math.PI / 2.3) * 48;
      const tipBottomY = Math.sin(Math.PI / 2.3) * 48;

      ctx.strokeStyle = '#f8fafc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tipTopX, tipTopY);
      // Pulled back string
      ctx.lineTo(-drawDistance, 0);
      ctx.lineTo(tipBottomX, tipBottomY);
      ctx.stroke();

      // Nocked arrow if aiming or ready
      if (arrowsLeftRef.current > 0) {
        ctx.save();
        ctx.translate(-drawDistance + 35, 0);

        // Shaft
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-35, 0);
        ctx.lineTo(0, 0);
        ctx.stroke();

        // Tip
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(-10, -4);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-10, 4);
        ctx.closePath();
        ctx.fill();

        // Feathers
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(-35, 0);
        ctx.lineTo(-42, -5);
        ctx.lineTo(-28, -2);
        ctx.lineTo(-35, 0);
        ctx.lineTo(-42, 5);
        ctx.lineTo(-28, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();

      // I. DRAW TRAJECTORY PREDICTION (when user is aiming)
      if (isAimingRef.current && drawPowerRef.current > 0.1) {
        ctx.save();
        const simSpeed = drawPowerRef.current * 25 + 10;
        let simX = BOW_POS.x + Math.cos(bowAngleRef.current) * 45;
        let simY = BOW_POS.y + Math.sin(bowAngleRef.current) * 45;
        let simVx = Math.cos(bowAngleRef.current) * simSpeed;
        let simVy = Math.sin(bowAngleRef.current) * simSpeed;

        const maxSteps = 35;
        for (let step = 0; step < maxSteps; step++) {
          simVy += GRAVITY;
          simVx += levelConfig.wind * 0.035;
          simX += simVx;
          simY += simVy;

          if (simY > VIRTUAL_HEIGHT - 40 || simX > VIRTUAL_WIDTH) break;

          ctx.fillStyle = `rgba(250, 204, 21, ${1 - step / maxSteps})`;
          ctx.beginPath();
          ctx.arc(simX, simY, Math.max(1.5, 4.5 * (1 - step / maxSteps)), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [isPaused, levelConfig.wind, levelConfig.backgroundTheme, checkRoundStatus, onScoreUpdate]);

  return (
    <div className="relative w-full aspect-[12/7] max-w-[1200px] mx-auto rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-950">
      <canvas
        ref={canvasRef}
        width={VIRTUAL_WIDTH}
        height={VIRTUAL_HEIGHT}
        className="w-full h-full cursor-crosshair block"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    </div>
  );
};
