import {
  BRAND_RADIUS,
  brandPoints,
} from '../lib/brandGeometry.js';
import { MOTION_TIMING } from '../lib/motionTiming.js';
import { getDotOffsets } from '../lib/motionGeometry.js';

export default function DotMotion({ type = 'transition', onComplete }) {
  const isSplash = type === 'splash';
  const duration = isSplash ? MOTION_TIMING.splash : MOTION_TIMING.transition;

  function handleAnimationEnd(event) {
    if (event.target === event.currentTarget) onComplete?.();
  }

  return (
    <div
      className={`motion-screen motion-${type}`}
      style={{ '--motion-duration': `${duration}ms` }}
      role="status"
      aria-live="polite"
      aria-label={isSplash ? 'Abrindo o Ponto Público' : 'Mudando de página'}
      onAnimationEnd={handleAnimationEnd}
    >
      <div className="motion-content">
        <svg
          className="motion-points"
          viewBox="0 0 104 152"
          aria-hidden="true"
          focusable="false"
        >
          {brandPoints.map((point, index) => (
            <circle
              key={point.key}
              cx={point.x}
              cy={point.y}
              r={BRAND_RADIUS}
              style={getDotOffsets(point, index)}
            />
          ))}
        </svg>
        {isSplash && (
          <>
            <img
              className="motion-wordmark"
              src="/assets/splash-wordmark.svg"
              width="235"
              height="100"
              alt=""
              aria-hidden="true"
            />
            <p className="motion-tagline">Informação pública que faz sentido.</p>
          </>
        )}
      </div>
    </div>
  );
}
