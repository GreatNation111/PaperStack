import { useRef, useCallback, useState } from 'react';

// ─── Apple Mail Swipe Gesture Hook ──────────────────────────────────────────
// Implements a physically interactive, interruptible, finger-driven gesture
// with progressive action reveal, multi-threshold behavior, and spring physics.

interface SwipeConfig {
  /** Pixels to reveal the action button area (partial reveal) */
  revealThreshold?: number;
  /** Pixels to trigger full-swipe auto-action */
  fullSwipeThreshold?: number;
  /** Whether right-to-left swipe is enabled */
  enableLeft?: boolean;
  /** Whether left-to-right swipe is enabled */
  enableRight?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export interface SwipeState {
  offsetX: number;
  isDragging: boolean;
  isRevealed: 'left' | 'right' | null; // which action panel is locked open
  didFullSwipe: boolean;
  direction: 'left' | 'right' | null;
  progress: number; // 0..1 progress toward full swipe threshold
}

const DEFAULTS = {
  revealThreshold: 80,
  fullSwipeThreshold: 200,
};

// Spring physics for release animation
function springAnimate(
  from: number,
  to: number,
  onUpdate: (value: number) => void,
  onComplete: () => void,
  velocity: number = 0
) {
  // Spring parameters tuned to match iOS UIKit
  const stiffness = 400;
  const damping = 35;
  const mass = 1;
  const precision = 0.5;

  let currentValue = from;
  let currentVelocity = velocity;
  let animationId: number | null = null;
  let lastTime: number | null = null;
  let cancelled = false;

  function step(timestamp: number) {
    if (cancelled) return;
    if (lastTime === null) {
      lastTime = timestamp;
      animationId = requestAnimationFrame(step);
      return;
    }

    // Cap delta to avoid huge jumps on tab switch
    const dt = Math.min((timestamp - lastTime) / 1000, 0.064);
    lastTime = timestamp;

    // Spring force: F = -k * (x - target) - c * v
    const displacement = currentValue - to;
    const springForce = -stiffness * displacement;
    const dampingForce = -damping * currentVelocity;
    const acceleration = (springForce + dampingForce) / mass;

    currentVelocity += acceleration * dt;
    currentValue += currentVelocity * dt;

    onUpdate(currentValue);

    // Check if settled
    if (
      Math.abs(currentValue - to) < precision &&
      Math.abs(currentVelocity) < precision
    ) {
      onUpdate(to);
      onComplete();
      return;
    }

    animationId = requestAnimationFrame(step);
  }

  animationId = requestAnimationFrame(step);

  // Return cancel function for gesture interruption
  return () => {
    cancelled = true;
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
    }
  };
}

export function useAppleMailSwipe(config: SwipeConfig = {}) {
  const {
    revealThreshold = DEFAULTS.revealThreshold,
    fullSwipeThreshold = DEFAULTS.fullSwipeThreshold,
    enableLeft = true,
    enableRight = true,
    onSwipeLeft,
    onSwipeRight,
  } = config;

  const cardRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<SwipeState>({
    offsetX: 0,
    isDragging: false,
    isRevealed: null,
    didFullSwipe: false,
    direction: null,
    progress: 0,
  });

  // Mutable refs for tracking gesture state without re-renders during drag
  const gestureRef = useRef({
    startX: 0,
    startY: 0,
    startOffsetX: 0,       // Offset when gesture started (for resumed drags)
    currentX: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    isTracking: false,
    directionLocked: false, // True once we've committed to horizontal scroll
    isVertical: false,      // True if initial gesture was vertical (let page scroll)
    cancelAnimation: null as (() => void) | null,
    wasSwipeAction: false,  // Prevents click after swipe
  });

  const cancelRunningAnimation = useCallback(() => {
    if (gestureRef.current.cancelAnimation) {
      gestureRef.current.cancelAnimation();
      gestureRef.current.cancelAnimation = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: number, velocity: number = 0, onDone?: () => void) => {
      cancelRunningAnimation();

      const startValue = gestureRef.current.currentX;
      gestureRef.current.cancelAnimation = springAnimate(
        startValue,
        target,
        (value) => {
          gestureRef.current.currentX = value;
          const dir = value > 0 ? 'right' : value < 0 ? 'left' : null;
          const absVal = Math.abs(value);
          setState({
            offsetX: value,
            isDragging: false,
            isRevealed:
              Math.abs(value - revealThreshold) < 2 || Math.abs(value + revealThreshold) < 2
                ? dir
                : null,
            didFullSwipe: absVal >= fullSwipeThreshold,
            direction: dir,
            progress: Math.min(absVal / fullSwipeThreshold, 1),
          });
        },
        () => {
          gestureRef.current.cancelAnimation = null;
          onDone?.();
        },
        velocity
      );
    },
    [cancelRunningAnimation, revealThreshold, fullSwipeThreshold]
  );

  const resetCard = useCallback(
    (velocity: number = 0) => {
      animateTo(0, velocity, () => {
        setState({
          offsetX: 0,
          isDragging: false,
          isRevealed: null,
          didFullSwipe: false,
          direction: null,
          progress: 0,
        });
      });
    },
    [animateTo]
  );

  // ─── Touch Handlers ───────────────────────────────────────────────────────

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      const g = gestureRef.current;

      // Interrupt any running animation immediately
      cancelRunningAnimation();

      g.startX = touch.clientX;
      g.startY = touch.clientY;
      g.startOffsetX = g.currentX; // Resume from wherever the card currently is
      g.lastX = touch.clientX;
      g.lastTime = Date.now();
      g.velocityX = 0;
      g.isTracking = true;
      g.directionLocked = false;
      g.isVertical = false;
      g.wasSwipeAction = false;
    },
    [cancelRunningAnimation]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const g = gestureRef.current;
      if (!g.isTracking) return;

      const touch = e.touches[0];
      const dx = touch.clientX - g.startX;
      const dy = touch.clientY - g.startY;

      // Lock direction on first significant movement
      if (!g.directionLocked) {
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);
        if (absDx < 5 && absDy < 5) return; // Dead zone

        if (absDy > absDx * 1.2) {
          // Vertical gesture — release to allow page scroll
          g.isVertical = true;
          g.isTracking = false;
          return;
        }
        g.directionLocked = true;
      }

      // Prevent page scroll during horizontal gesture
      e.preventDefault();

      // Track velocity (exponential moving average)
      const now = Date.now();
      const dt = Math.max(now - g.lastTime, 1);
      const instantVelocity = ((touch.clientX - g.lastX) / dt) * 1000;
      g.velocityX = 0.7 * instantVelocity + 0.3 * g.velocityX;
      g.lastX = touch.clientX;
      g.lastTime = now;

      // Calculate raw offset (1:1 finger tracking)
      let rawOffset = g.startOffsetX + dx;

      // Apply directional constraints
      if (!enableRight && rawOffset > 0) rawOffset = 0;
      if (!enableLeft && rawOffset < 0) rawOffset = 0;

      // Apply rubber-band resistance past the full swipe threshold
      const absOffset = Math.abs(rawOffset);
      if (absOffset > fullSwipeThreshold) {
        const overshoot = absOffset - fullSwipeThreshold;
        const dampened = fullSwipeThreshold + overshoot * 0.15;
        rawOffset = rawOffset > 0 ? dampened : -dampened;
      }

      g.currentX = rawOffset;
      g.wasSwipeAction = Math.abs(rawOffset) > 10;

      const dir = rawOffset > 0 ? 'right' : rawOffset < 0 ? 'left' : null;
      const absVal = Math.abs(rawOffset);

      setState({
        offsetX: rawOffset,
        isDragging: true,
        isRevealed: absVal >= revealThreshold ? dir : null,
        didFullSwipe: absVal >= fullSwipeThreshold,
        direction: dir,
        progress: Math.min(absVal / fullSwipeThreshold, 1),
      });
    },
    [enableLeft, enableRight, revealThreshold, fullSwipeThreshold]
  );

  const handleTouchEnd = useCallback(() => {
    const g = gestureRef.current;
    if (!g.isTracking || g.isVertical) {
      g.isTracking = false;
      return;
    }
    g.isTracking = false;

    const offset = g.currentX;
    const absOffset = Math.abs(offset);
    const velocity = g.velocityX;
    const direction = offset > 0 ? 'right' : 'left';

    // Full swipe threshold reached — execute action
    if (absOffset >= fullSwipeThreshold) {
      g.wasSwipeAction = true;
      // Animate card fully off-screen in swipe direction, then execute action
      const target = direction === 'right' ? window.innerWidth : -window.innerWidth;
      animateTo(target, velocity, () => {
        if (direction === 'right') {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        // Reset after action (card may be removed by parent)
        g.currentX = 0;
        setState({
          offsetX: 0,
          isDragging: false,
          isRevealed: null,
          didFullSwipe: false,
          direction: null,
          progress: 0,
        });
      });
      return;
    }

    // Velocity-based full swipe (fast flick)
    if (Math.abs(velocity) > 800 && absOffset > revealThreshold * 0.5) {
      g.wasSwipeAction = true;
      const target = velocity > 0 ? window.innerWidth : -window.innerWidth;
      animateTo(target, velocity, () => {
        if (velocity > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        g.currentX = 0;
        setState({
          offsetX: 0,
          isDragging: false,
          isRevealed: null,
          didFullSwipe: false,
          direction: null,
          progress: 0,
        });
      });
      return;
    }

    // Partial reveal threshold — lock open to show action button
    if (absOffset >= revealThreshold) {
      const lockTarget = direction === 'right' ? revealThreshold : -revealThreshold;
      animateTo(lockTarget, velocity);
      return;
    }

    // Below threshold — spring back
    resetCard(velocity);
  }, [revealThreshold, fullSwipeThreshold, animateTo, resetCard, onSwipeLeft, onSwipeRight]);

  // Close revealed panel when tapping elsewhere
  const closeRevealed = useCallback(() => {
    if (state.isRevealed) {
      resetCard();
    }
  }, [state.isRevealed, resetCard]);

  // Prevent clicks from firing after a swipe gesture
  const shouldPreventClick = useCallback(() => {
    return gestureRef.current.wasSwipeAction;
  }, []);

  return {
    cardRef,
    state,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    closeRevealed,
    resetCard,
    shouldPreventClick,
  };
}
