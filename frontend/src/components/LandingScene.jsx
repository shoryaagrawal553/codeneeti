import React from 'react';
import './LandingScene.css';

export default function LandingScene({ onEnter }) {
  return (
    <div className="landing-viewport">
      {/* 16:9 Pixel-Art Scene Canvas */}
      <div className="scene-canvas pixel-art">
        {/* Subtle Cloud Parallax Drift */}
        <div className="cloud-drift-layer" aria-hidden="true" />

        {/* Environmental Birds Flying in the Sky */}
        <div className="bird bird-1" aria-hidden="true">
          <svg width="22" height="12" viewBox="0 0 22 12" fill="none">
            <path
              d="M0 6 Q5 0 11 6 Q17 0 22 6 Q16 4 11 9 Q6 4 0 6 Z"
              fill="#1e3a5f"
              opacity="0.8"
            />
          </svg>
        </div>
        <div className="bird bird-2" aria-hidden="true">
          <svg width="18" height="10" viewBox="0 0 22 12" fill="none">
            <path
              d="M0 6 Q5 0 11 6 Q17 0 22 6 Q16 4 11 9 Q6 4 0 6 Z"
              fill="#1e3a5f"
              opacity="0.75"
            />
          </svg>
        </div>
        <div className="bird bird-3" aria-hidden="true">
          <svg width="14" height="8" viewBox="0 0 22 12" fill="none">
            <path
              d="M0 6 Q5 0 11 6 Q17 0 22 6 Q16 4 11 9 Q6 4 0 6 Z"
              fill="#1e3a5f"
              opacity="0.65"
            />
          </svg>
        </div>

        {/* Ambient Meadow Pollen Motes */}
        <div className="pollen-mote" style={{ top: '65%', left: '32%', animationDelay: '0s' }} aria-hidden="true" />
        <div className="pollen-mote" style={{ top: '70%', left: '62%', animationDelay: '2.5s' }} aria-hidden="true" />
        <div className="pollen-mote" style={{ top: '60%', left: '48%', animationDelay: '4.5s' }} aria-hidden="true" />
        <div className="pollen-mote" style={{ top: '78%', left: '20%', animationDelay: '1.2s' }} aria-hidden="true" />
        <div className="pollen-mote" style={{ top: '75%', left: '80%', animationDelay: '3.8s' }} aria-hidden="true" />

        {/* Subtle Swaying Wildflower Highlights */}
        <div className="swaying-flower" style={{ bottom: '7.5%', left: '8%', animationDelay: '0.2s' }} aria-hidden="true">
          <div style={{ width: '7px', height: '7px', backgroundColor: '#38bdf8', borderRadius: '1px', opacity: 0.75 }} />
        </div>
        <div className="swaying-flower" style={{ bottom: '11%', left: '14%', animationDelay: '1.4s' }} aria-hidden="true">
          <div style={{ width: '5px', height: '5px', backgroundColor: '#60a5fa', borderRadius: '1px', opacity: 0.7 }} />
        </div>
        <div className="swaying-flower" style={{ bottom: '5.5%', left: '55%', animationDelay: '0.8s' }} aria-hidden="true">
          <div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '1px', opacity: 0.8 }} />
        </div>
        <div className="swaying-flower" style={{ bottom: '8.5%', right: '12%', animationDelay: '2.1s' }} aria-hidden="true">
          <div style={{ width: '7px', height: '7px', backgroundColor: '#c084fc', borderRadius: '1px', opacity: 0.75 }} />
        </div>

        {/* Central Interactive CRT Monitor Gateway */}
        <div
          className="crt-interactive-zone"
          onClick={onEnter}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onEnter();
            }
          }}
          role="button"
          tabIndex={0}
          aria-label="Enter CodeGuard Application via CRT Monitor"
        >
          {/* CRT Screen Frame & Effects */}
          <div className="crt-screen">
            <div className="crt-phosphor-glow" aria-hidden="true" />
            <div className="crt-vignette" aria-hidden="true" />
            <div className="crt-scanlines" aria-hidden="true" />

            {/* Glowing Retro Terminal Text Inside Screen */}
            <div className="crt-content">
              <span className="crt-logo">&gt; CODEGUARD</span>
              <span className="crt-status">SYS: READY</span>
              <span className="crt-prompt">
                ENTER <span className="crt-cursor" />
              </span>
            </div>
          </div>

          {/* Hover Tooltip */}
          <span className="crt-hover-tooltip">
            Click to Initialize Reviewer
          </span>
        </div>

        {/* Minimalist Top-Left Identity */}
        <header className="minimal-overlay-header">
          <div className="minimal-brand-tag">
            <span className="brand-dot" aria-hidden="true" />
            <span>CODEGUARD // AI ASSISTANT</span>
          </div>
        </header>

        {/* Minimalist Bottom Entry Hint */}
        <footer className="minimal-overlay-footer">
          <div className="entry-hint">
            [ CLICK THE CRT COMPUTER TO BEGIN ]
          </div>
        </footer>
      </div>
    </div>
  );
}
