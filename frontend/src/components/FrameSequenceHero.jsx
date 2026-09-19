import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Terminal, Shield, ArrowDown, ChevronRight, CheckCircle2, Cpu, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Configurable folder path pointing to frame sequence assets.
 * Served from Vite public directory (/animation/).
 */
export const FRAME_FOLDER = '/animation/';

export default function FrameSequenceHero({ onStartReview }) {
  const containerRef = useRef(null);
  const pinTargetRef = useRef(null);
  const canvasRef = useRef(null);

  // Frame sequence state
  const [frames, setFrames] = useState([]);
  const [images, setImages] = useState([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  // Active scroll narrative phase (0, 1, 2, 3, 4)
  const [scrollPhase, setScrollPhase] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Current drawn frame index ref to avoid re-drawing the identical frame
  const currentFrameIndexRef = useRef(0);
  const triggerInstanceRef = useRef(null);

  // 1. Listen for prefers-reduced-motion changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setIsReducedMotion(e.matches);
    mq.addEventListener('change', handleChange);
    return () => mq.removeEventListener('change', handleChange);
  }, []);

  // 2. Discover frame filenames automatically
  useEffect(() => {
    let isCancelled = false;

    async function discoverFrames() {
      try {
        // Attempt to fetch manifest.json from FRAME_FOLDER
        const manifestRes = await fetch(`${FRAME_FOLDER}manifest.json`, { cache: 'no-cache' });
        if (manifestRes.ok) {
          const manifest = await manifestRes.json();
          if (manifest && Array.isArray(manifest.frames) && manifest.frames.length > 0) {
            if (!isCancelled) {
              setFrames(manifest.frames.map((f) => `${FRAME_FOLDER}${f}`));
            }
            return;
          }
        }
      } catch (err) {
        console.warn('Could not load manifest.json, attempting automatic sequence probe...', err);
      }

      // Fallback: probe sequence starting from frame 1
      const discovered = [];
      const probeExtensions = ['jpg', 'png', 'webp'];
      let foundPattern = null;

      // Test potential naming conventions
      for (const ext of probeExtensions) {
        const testUrl1 = `${FRAME_FOLDER}ezgif-frame-001.${ext}`;
        const testUrl2 = `${FRAME_FOLDER}frame_001.${ext}`;
        const testUrl3 = `${FRAME_FOLDER}0001.${ext}`;

        try {
          const r1 = await fetch(testUrl1, { method: 'HEAD' });
          if (r1.ok) {
            foundPattern = (i) => `${FRAME_FOLDER}ezgif-frame-${String(i).padStart(3, '0')}.${ext}`;
            break;
          }
          const r2 = await fetch(testUrl2, { method: 'HEAD' });
          if (r2.ok) {
            foundPattern = (i) => `${FRAME_FOLDER}frame_${String(i).padStart(3, '0')}.${ext}`;
            break;
          }
          const r3 = await fetch(testUrl3, { method: 'HEAD' });
          if (r3.ok) {
            foundPattern = (i) => `${FRAME_FOLDER}${String(i).padStart(4, '0')}.${ext}`;
            break;
          }
        } catch {
          // Continue probing
        }
      }

      if (foundPattern) {
        // Probe upwards until 404 or max limit
        for (let i = 1; i <= 600; i++) {
          const url = foundPattern(i);
          try {
            const probe = await fetch(url, { method: 'HEAD' });
            if (probe.ok) {
              discovered.push(url);
            } else {
              break;
            }
          } catch {
            break;
          }
        }
      }

      if (!isCancelled) {
        if (discovered.length > 0) {
          setFrames(discovered);
        } else {
          setLoadError(`No frame sequence found in "${FRAME_FOLDER}". Please ensure assets are present.`);
        }
      }
    }

    discoverFrames();

    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Preload discovered frames
  useEffect(() => {
    if (frames.length === 0) return;

    let isCancelled = false;
    const loadedImages = new Array(frames.length);
    let completed = 0;

    frames.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      img.onload = () => {
        if (isCancelled) return;
        loadedImages[index] = img;
        completed += 1;
        setLoadedCount(completed);

        if (completed === frames.length) {
          setImages(loadedImages);
          setIsPreloaded(true);
        }
      };

      img.onerror = () => {
        if (isCancelled) return;
        console.warn(`Failed to preload frame ${index}: ${src}`);
        completed += 1;
        setLoadedCount(completed);

        if (completed === frames.length) {
          setImages(loadedImages);
          setIsPreloaded(true);
        }
      };
    });

    return () => {
      isCancelled = true;
    };
  }, [frames]);

  // 4. Render frame to canvas with aspect-ratio preservation and high-DPI scaling
  const drawFrame = useCallback(
    (index) => {
      const canvas = canvasRef.current;
      if (!canvas || !images || images.length === 0) return;

      const safeIdx = Math.max(0, Math.min(index, images.length - 1));
      const img = images[safeIdx];
      if (!img || !img.complete || img.naturalWidth === 0) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Fill canvas background
      ctx.fillStyle = '#07090D';
      ctx.fillRect(0, 0, width, height);

      // Calculate cover / centered fit
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = width;
        drawHeight = width / imgRatio;
        offsetX = 0;
        offsetY = (height - drawHeight) / 2;
      } else {
        drawHeight = height;
        drawWidth = height * imgRatio;
        offsetX = (width - drawWidth) / 2;
        offsetY = 0;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();

      currentFrameIndexRef.current = safeIdx;
    },
    [images]
  );

  // 5. Initial draw once preloaded
  useEffect(() => {
    if (isPreloaded && images.length > 0) {
      drawFrame(0);
    }
  }, [isPreloaded, images, drawFrame]);

  // 6. Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isPreloaded && images.length > 0) {
        drawFrame(currentFrameIndexRef.current);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPreloaded, images, drawFrame]);

  // 7. GSAP ScrollTrigger setup
  useEffect(() => {
    if (!isPreloaded || frames.length === 0 || isReducedMotion) {
      return;
    }

    const container = containerRef.current;
    const pinTarget = pinTargetRef.current;
    if (!container || !pinTarget) return;

    // Clean up any existing trigger
    if (triggerInstanceRef.current) {
      triggerInstanceRef.current.kill();
    }

    const st = ScrollTrigger.create({
      trigger: container,
      pin: pinTarget,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.35,
      anticipatePin: 1,
      onUpdate: (self) => {
        const progress = self.progress;
        setScrollProgress(progress);

        // Map scroll progress to frame index
        const frameIndex = Math.min(
          Math.floor(progress * (frames.length - 1)),
          frames.length - 1
        );

        if (frameIndex !== currentFrameIndexRef.current) {
          drawFrame(frameIndex);
        }

        // Map scroll progress to narrative phase
        if (progress < 0.22) {
          setScrollPhase(0);
        } else if (progress < 0.48) {
          setScrollPhase(1);
        } else if (progress < 0.74) {
          setScrollPhase(2);
        } else if (progress < 0.92) {
          setScrollPhase(3);
        } else {
          setScrollPhase(4);
        }
      },
    });

    triggerInstanceRef.current = st;

    return () => {
      if (st) st.kill();
    };
  }, [isPreloaded, frames.length, isReducedMotion, drawFrame]);

  // Scroll smoothly down to the code review workspace
  const handleScrollToWorkspace = () => {
    if (onStartReview) {
      onStartReview();
      return;
    }
    const workspaceElem = document.getElementById('workspace');
    if (workspaceElem) {
      workspaceElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({
        top: containerRef.current ? containerRef.current.offsetHeight : window.innerHeight * 3,
        behavior: 'smooth',
      });
    }
  };

  // Compute scroll height proportional to frame count
  // 300 frames * 12px ~ 3600px scroll runway for smooth cinematic control
  const scrollContainerHeight = isReducedMotion
    ? '100vh'
    : `${Math.max(frames.length * 12, 2600)}px`;

  // Render ASCII progress bar
  const progressPercent = frames.length > 0 ? Math.floor((loadedCount / frames.length) * 100) : 0;
  const totalBlocks = 16;
  const filledBlocks = Math.floor((progressPercent / 100) * totalBlocks);
  const asciiBar = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <section
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: scrollContainerHeight,
        backgroundColor: '#07090D',
      }}
      aria-label="CodeGuard Cinematic Scroll Experience"
    >
      {/* Pinned Viewport Frame */}
      <div
        ref={pinTargetRef}
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#07090D',
        }}
      >
        {/* High-DPI Canvas Rendering Frame Sequence */}
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'cover',
          }}
        />

        {/* Ambient Dark Vignette & CRT Scanlines Overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'radial-gradient(circle at center, transparent 40%, rgba(7, 9, 13, 0.75) 100%), linear-gradient(to bottom, rgba(7, 9, 13, 0.4) 0%, transparent 25%, transparent 75%, rgba(7, 9, 13, 0.85) 100%)',
          }}
        />

        {/* --- Minimalist Preloading Screen --- */}
        {!isPreloaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#07090D',
              color: '#00f0ff',
              fontFamily: 'var(--font-mono)',
              zIndex: 30,
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                fontSize: '0.85rem',
                letterSpacing: '0.15em',
                marginBottom: '1rem',
                color: '#64748b',
              }}
            >
              <Terminal size={16} color="#00f0ff" />
              INITIALIZING CODEGUARD MATRIX
            </div>

            <h2
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                margin: '0 0 1.25rem',
                color: '#f8fafc',
              }}
            >
              LOADING CODEGUARD
            </h2>

            {loadError ? (
              <div
                style={{
                  color: '#ef4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  padding: '1rem 1.5rem',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  maxWidth: '480px',
                  fontSize: '0.875rem',
                }}
              >
                {loadError}
              </div>
            ) : (
              <>
                <div
                  style={{
                    fontSize: '1.25rem',
                    letterSpacing: '0.2em',
                    color: '#00f0ff',
                    marginBottom: '0.75rem',
                    textShadow: '0 0 12px rgba(0, 240, 255, 0.5)',
                  }}
                >
                  [{asciiBar}]
                </div>

                <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
                  {loadedCount} / {frames.length || '...'} FRAMES ({progressPercent}%)
                </div>

                <div
                  style={{
                    fontSize: '0.75rem',
                    color: '#475569',
                    letterSpacing: '0.05em',
                  }}
                >
                  CACHING 1080P IMAGE SEQUENCE FOR ZERO-LATENCY SCRUBBING
                </div>
              </>
            )}
          </div>
        )}

        {/* --- Top Minimalist Brand Header Bar --- */}
        <header
          style={{
            position: 'absolute',
            top: '1.5rem',
            left: '2rem',
            right: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 20,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              backgroundColor: 'rgba(12, 18, 30, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.45rem 0.95rem',
              borderRadius: '9999px',
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: isPreloaded ? '#10b981' : '#eab308',
                boxShadow: isPreloaded ? '0 0 8px #10b981' : '0 0 8px #eab308',
              }}
            />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.08em',
                color: '#f8fafc',
              }}
            >
              CODEGUARD AI
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>//</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#38bdf8' }}>
              {isPreloaded ? 'SYSTEM READY' : 'PRELOADING'}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'rgba(12, 18, 30, 0.65)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.35rem 0.85rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#94a3b8',
            }}
          >
            <span>AST SCAN</span>
            <span style={{ color: '#475569' }}>&bull;</span>
            <span>GEMINI REASONING</span>
            <span style={{ color: '#475569' }}>&bull;</span>
            <span style={{ color: '#10b981' }}>EMPIRICAL FIX</span>
          </div>
        </header>

        {/* --- Synchronized Narrative Overlays (Progress-Driven) --- */}
        {isPreloaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 20,
              pointerEvents: 'none',
              padding: '2rem',
            }}
          >
            {/* Phase 0: Retro Computer Exterior (0% - 22%) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '780px',
                opacity: scrollPhase === 0 ? 1 : 0,
                transform: `translateY(${scrollPhase === 0 ? 0 : -25}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollPhase === 0 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: '#38bdf8',
                  backgroundColor: 'rgba(15, 12, 28, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(56, 189, 248, 0.5)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(56, 189, 248, 0.25)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  marginBottom: '1.25rem',
                }}
              >
                <Shield size={14} />
                NEXT-GENERATION APPLICATION SECURITY ASSISTANT
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: '#ffffff',
                  marginBottom: '1rem',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                Code that survives review.
              </h1>

              <p
                style={{
                  fontSize: 'clamp(1rem, 1.8vw, 1.25rem)',
                  lineHeight: 1.6,
                  color: '#ffffff',
                  maxWidth: '620px',
                  marginBottom: '2rem',
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.98), 0 1px 4px rgba(0, 0, 0, 0.95)',
                  fontWeight: 500,
                }}
              >
                Deterministic Semgrep &amp; Bandit static analysis combined with a 3-agent Google
                Gemini reasoning pipeline for verified security fixes.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleScrollToWorkspace}
                  className="btn"
                  style={{
                    padding: '0.8rem 2rem',
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: '#5E4F98',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 4px 20px rgba(94, 79, 152, 0.5), 0 2px 6px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                  }}
                >
                  <Terminal size={18} />
                  START REVIEW
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.scrollBy({ top: window.innerHeight * 0.9, behavior: 'smooth' });
                  }}
                  className="btn"
                  style={{
                    padding: '0.8rem 1.8rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                    backgroundColor: 'rgba(24, 20, 36, 0.88)',
                    backdropFilter: 'blur(16px)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.35)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                    cursor: 'pointer',
                  }}
                >
                  ENTER THE MACHINE <ChevronRight size={16} />
                </button>
              </div>

              <div
                style={{
                  marginTop: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.8rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9)',
                  fontWeight: 600,
                }}
              >
                <ArrowDown size={14} className="animate-bounce" />
                <span>SCROLL TO ENTER THE MACHINE</span>
              </div>
            </div>

            {/* Phase 1: Approaching CRT Screen (22% - 48%) */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '680px',
                opacity: scrollPhase === 1 ? 1 : 0,
                transform: `translateY(${scrollPhase === 1 ? 0 : 25}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollPhase === 1 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#4ade80',
                  backgroundColor: 'rgba(15, 12, 28, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(74, 222, 128, 0.55)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(74, 222, 128, 0.25)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                <Cpu size={14} />
                PHASE 01 // ENTER THE MACHINE
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                Deterministic Ground Truth
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#ffffff',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.98), 0 1px 4px rgba(0, 0, 0, 0.95)',
                }}
              >
                Every code submission first undergoes static AST evaluation with Semgrep and Bandit.
                Zero hallucinations, rule-backed findings, and cryptographically fingerprinted issues.
              </p>
            </div>

            {/* Phase 2: Inside Circuit Tunnel (48% - 74%) */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '680px',
                opacity: scrollPhase === 2 ? 1 : 0,
                transform: `translateY(${scrollPhase === 2 ? 0 : 25}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollPhase === 2 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#22d3ee',
                  backgroundColor: 'rgba(15, 12, 28, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(34, 211, 238, 0.55)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(34, 211, 238, 0.25)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                <Sparkles size={14} />
                PHASE 02 // MULTI-AGENT REASONING
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                Contextual AI Triage
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#ffffff',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.98), 0 1px 4px rgba(0, 0, 0, 0.95)',
                }}
              >
                The AnalyzerAgent enriches raw findings, adjusts severity based on full code context,
                maps official CWE identifiers, and provides plain-language developer explanations.
              </p>
            </div>

            {/* Phase 3: Digital Core / Code Synthesis Chamber (74% - 92%) */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '680px',
                opacity: scrollPhase === 3 ? 1 : 0,
                transform: `translateY(${scrollPhase === 3 ? 0 : 25}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollPhase === 3 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#fbbf24',
                  backgroundColor: 'rgba(15, 12, 28, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(251, 191, 36, 0.55)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(251, 191, 36, 0.25)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                <CheckCircle2 size={14} />
                PHASE 03 // EMPIRICAL VERIFICATION
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.8vw, 3rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                Fix Generated &amp; Re-Scanned
              </h2>

              <p
                style={{
                  fontSize: '1.05rem',
                  color: '#ffffff',
                  fontWeight: 500,
                  lineHeight: 1.6,
                  maxWidth: '560px',
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.98), 0 1px 4px rgba(0, 0, 0, 0.95)',
                }}
              >
                The FixAgent generates targeted corrections, and the VerifierAgent re-runs static
                scans to mathematically prove the vulnerability is Resolved with Zero Regressions.
              </p>
            </div>

            {/* Phase 4: Final Transition into Workspace (92% - 100%) */}
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                maxWidth: '680px',
                opacity: scrollPhase === 4 ? 1 : 0,
                transform: `translateY(${scrollPhase === 4 ? 0 : 20}px)`,
                transition: 'opacity 0.4s ease, transform 0.4s ease',
                pointerEvents: scrollPhase === 4 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  color: '#38bdf8',
                  backgroundColor: 'rgba(15, 12, 28, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(56, 189, 248, 0.55)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 12px rgba(56, 189, 248, 0.25)',
                  padding: '0.35rem 0.95rem',
                  borderRadius: '9999px',
                  marginBottom: '1rem',
                }}
              >
                <Terminal size={14} />
                INSIDE THE MACHINE // READY
              </div>

              <h2
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  fontWeight: 800,
                  color: '#ffffff',
                  marginBottom: '0.75rem',
                  textShadow: '0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)',
                }}
              >
                What are you reviewing?
              </h2>

              <p
                style={{
                  fontSize: '1rem',
                  color: '#ffffff',
                  fontWeight: 500,
                  marginBottom: '1.5rem',
                  textShadow: '0 2px 14px rgba(0, 0, 0, 0.98), 0 1px 4px rgba(0, 0, 0, 0.95)',
                }}
              >
                You have reached the CodeGuard workspace. Enter or upload your code below.
              </p>

              <button
                type="button"
                onClick={handleScrollToWorkspace}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 1.8rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                GO TO EDITOR <ArrowDown size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Bottom subtle progress tracker bar */}
        {isPreloaded && !isReducedMotion && (
          <div
            style={{
              position: 'absolute',
              bottom: '1.5rem',
              left: '2rem',
              right: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 20,
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#64748b',
              pointerEvents: 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>SCROLL PROGRESS</span>
              <div
                style={{
                  width: '120px',
                  height: '4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '2px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.round(scrollProgress * 100)}%`,
                    height: '100%',
                    backgroundColor: '#00f0ff',
                    transition: 'width 0.1s linear',
                  }}
                />
              </div>
              <span style={{ color: '#00f0ff' }}>{Math.round(scrollProgress * 100)}%</span>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: scrollPhase === 0 ? '#ffffff' : '#64748b' }}>01 EXTERIOR</span>
              <span style={{ color: scrollPhase === 1 ? '#ffffff' : '#64748b' }}>02 AST SCAN</span>
              <span style={{ color: scrollPhase === 2 ? '#ffffff' : '#64748b' }}>03 REASONING</span>
              <span style={{ color: scrollPhase === 3 ? '#ffffff' : '#64748b' }}>04 VERIFICATION</span>
            </div>
          </div>
        )}
      </div>

      {/* Subtle bottom gradient blending canvas naturally into the CodeGuard review application */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '140px',
          background: 'linear-gradient(to bottom, transparent, #080c14)',
          pointerEvents: 'none',
          zIndex: 22,
        }}
      />
    </section>
  );
}
