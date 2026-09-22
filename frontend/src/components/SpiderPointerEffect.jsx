import React, { useEffect, useRef } from 'react';

/**
 * SpiderPointerEffect
 * 
 * Reconstructed subtle cyber-spider / robotic probe pointer layer.
 * - 5 organic cyber-spider nodes follow the user pointer with spring kinematics
 * - Articulated legs step dynamically as body moves
 * - Subtle glowing cyber-strands connect to cursor
 * - High-DPI canvas, pointer-events: none, GPU-friendly
 * - Disables automatically under prefers-reduced-motion
 */
export default function SpiderPointerEffect() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Check reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Do not animate for reduced motion
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse with smooth fallbacks
    const mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      active: false,
      lastMoveTime: Date.now(),
    };

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const handleMouseMove = (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
      mouse.lastMoveTime = Date.now();
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
        mouse.active = true;
        mouse.lastMoveTime = Date.now();
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    handleResize();

    // Configuration for spider swarm
    const SPIDER_COUNT = 4;
    const spiders = [];

    for (let i = 0; i < SPIDER_COUNT; i++) {
      const angleOffset = (i / SPIDER_COUNT) * Math.PI * 2;
      const distOffset = 45 + (i % 2) * 35;
      spiders.push({
        id: i,
        x: width * 0.5 + Math.cos(angleOffset) * 100,
        y: height * 0.5 + Math.sin(angleOffset) * 100,
        vx: 0,
        vy: 0,
        angle: angleOffset,
        speed: 0.04 + (i * 0.008),
        orbitAngle: angleOffset,
        orbitDist: distOffset,
        bodySize: 3.5 + (i % 2),
        legCount: 6,
        legs: Array.from({ length: 6 }, (_, legIdx) => {
          const side = legIdx % 2 === 0 ? 1 : -1;
          const pair = Math.floor(legIdx / 2); // 0 (front), 1 (mid), 2 (back)
          const baseAngle = (pair === 0 ? -0.7 : pair === 1 ? 0 : 0.8) * side;
          return {
            side,
            pair,
            baseAngle,
            currentFootX: 0,
            currentFootY: 0,
            targetFootX: 0,
            targetFootY: 0,
            stepProgress: 1,
            legLength1: 10 + (pair === 1 ? 2 : 0),
            legLength2: 12 + (pair === 1 ? 3 : 0),
          };
        }),
      });
    }

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Ambient wandering when idle
      const now = Date.now();
      const isIdle = now - mouse.lastMoveTime > 3000;
      let targetCenterX = mouse.x;
      let targetCenterY = mouse.y;

      if (isIdle) {
        targetCenterX = width * 0.5 + Math.sin(time * 0.0008) * (width * 0.25);
        targetCenterY = height * 0.4 + Math.cos(time * 0.001) * (height * 0.18);
      }

      // Draw subtle cursor attraction hub
      if (mouse.active && !isIdle) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Update and draw each spider
      spiders.forEach((s, idx) => {
        // Compute target orbiting position around mouse
        s.orbitAngle += (0.6 + idx * 0.15) * dt;
        const targetX = targetCenterX + Math.cos(s.orbitAngle) * s.orbitDist;
        const targetY = targetCenterY + Math.sin(s.orbitAngle) * (s.orbitDist * 0.65);

        // Spring acceleration
        const dx = targetX - s.x;
        const dy = targetY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Smooth velocity damping
        s.vx = (s.vx + dx * s.speed) * 0.86;
        s.vy = (s.vy + dy * s.speed) * 0.86;
        s.x += s.vx;
        s.y += s.vy;

        // Orient toward velocity or target
        if (dist > 2) {
          const moveAngle = Math.atan2(s.vy, s.vx);
          // Angle smoothing
          let angleDiff = moveAngle - s.angle;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          s.angle += angleDiff * 0.12;
        }

        // Draw web filament to cursor
        if (mouse.active && !isIdle) {
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          // Curved silk strand
          const midX = (s.x + mouse.x) * 0.5 + Math.sin(time * 0.002 + idx) * 10;
          const midY = (s.y + mouse.y) * 0.5 + Math.cos(time * 0.002 + idx) * 10;
          ctx.quadraticCurveTo(midX, midY, mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${Math.max(0.04, 0.18 - dist * 0.0006)})`;
          ctx.lineWidth = 0.75;
          ctx.stroke();
        }

        // Update and draw articulated legs
        const cosA = Math.cos(s.angle);
        const sinA = Math.sin(s.angle);

        s.legs.forEach((leg, _legI) => {
          // Relative leg base on body
          const bodyOffsetForward = (1 - leg.pair) * 2.5;
          const bodyOffsetSide = leg.side * (s.bodySize * 0.9);
          const rootX = s.x + cosA * bodyOffsetForward - sinA * bodyOffsetSide;
          const rootY = s.y + sinA * bodyOffsetForward + cosA * bodyOffsetSide;

          // Ideal foot position relative to body
          const legReach = leg.legLength1 + leg.legLength2;
          const restAngle = s.angle + leg.baseAngle;
          const idealFootX = rootX + Math.cos(restAngle) * (legReach * 0.75);
          const idealFootY = rootY + Math.sin(restAngle) * (legReach * 0.75);

          // If current foot is too far from ideal, trigger a step
          const footDist = Math.hypot(leg.currentFootX - idealFootX, leg.currentFootY - idealFootY);
          if (footDist > 14 && leg.stepProgress >= 1) {
            leg.targetFootX = idealFootX + s.vx * 4;
            leg.targetFootY = idealFootY + s.vy * 4;
            leg.stepProgress = 0;
          }

          // Advance step animation
          if (leg.stepProgress < 1) {
            leg.stepProgress = Math.min(1, leg.stepProgress + dt * 10);
            leg.currentFootX += (leg.targetFootX - leg.currentFootX) * 0.4;
            leg.currentFootY += (leg.targetFootY - leg.currentFootY) * 0.4;
          } else if (leg.currentFootX === 0 && leg.currentFootY === 0) {
            leg.currentFootX = idealFootX;
            leg.currentFootY = idealFootY;
          }

          // Two-segment inverse kinematics for knee joint
          const fdx = leg.currentFootX - rootX;
          const fdy = leg.currentFootY - rootY;
          const d = Math.min(Math.hypot(fdx, fdy), leg.legLength1 + leg.legLength2 - 0.5);
          const baseFootAngle = Math.atan2(fdy, fdx);

          // Law of cosines for knee angle
          const l1 = leg.legLength1;
          const l2 = leg.legLength2;
          const cosKnee = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
          const kneeAngleOffset = Math.acos(cosKnee) * (leg.side > 0 ? -1 : 1);
          const jointAngle = baseFootAngle + kneeAngleOffset;

          const kneeX = rootX + Math.cos(jointAngle) * l1;
          const kneeY = rootY + Math.sin(jointAngle) * l1;

          // Draw leg segment 1 & 2
          ctx.beginPath();
          ctx.moveTo(rootX, rootY);
          ctx.lineTo(kneeX, kneeY);
          ctx.lineTo(leg.currentFootX, leg.currentFootY);
          ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.28)' : 'rgba(16, 185, 129, 0.25)';
          ctx.lineWidth = 0.9;
          ctx.stroke();

          // Tiny foot contact point
          ctx.beginPath();
          ctx.arc(leg.currentFootX, leg.currentFootY, 1, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
          ctx.fill();
        });

        // Draw body
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);

        // Abdomen (rear)
        ctx.beginPath();
        ctx.ellipse(-s.bodySize * 0.9, 0, s.bodySize * 1.1, s.bodySize * 0.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.strokeStyle = idx % 2 === 0 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(16, 185, 129, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Cephalothorax (front)
        ctx.beginPath();
        ctx.ellipse(s.bodySize * 0.4, 0, s.bodySize * 0.75, s.bodySize * 0.65, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#1e293b';
        ctx.fill();
        ctx.stroke();

        // Glowing optics / eyes
        ctx.beginPath();
        ctx.arc(s.bodySize * 0.9, -1.2, 0.9, 0, Math.PI * 2);
        ctx.arc(s.bodySize * 0.9, 1.2, 0.9, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? '#00f0ff' : '#10b981';
        ctx.shadowColor = idx % 2 === 0 ? '#00f0ff' : '#10b981';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 25,
      }}
    />
  );
}
