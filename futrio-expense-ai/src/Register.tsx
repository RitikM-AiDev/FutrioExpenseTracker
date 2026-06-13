import React, { useState, useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
}

interface InteractiveParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  size: number;
}

export const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isMoving: false });
  const mouseTimeoutRef = useRef<number | null>(null);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    // Simulate login API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Welcome back! Launching workspace...');
    }, 1500);
  };

  // Starfield and Mouse Interactive Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Resize Handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Track Mouse
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse coordinates from -1 to 1 (centered)
      mouseRef.current.targetX = (e.clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - height / 2) / (height / 2);
      mouseRef.current.isMoving = true;

      // Reset isMoving state after mouse stops moving
      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = window.setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);

      // Add a couple of active glowing dust particles at mouse position
      if (Math.random() < 0.6) {
        createMouseParticle(e.clientX, e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 3D Stars
    const numStars = 180;
    const stars: Star[] = [];
    const colors = ['#ffffff'];
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 2,
        y: (Math.random() - 0.5) * height * 2,
        z: Math.random() * width,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 1.5 + 0.5,
      });
    }

    // Interactive Mouse Particles
    const mouseParticles: InteractiveParticle[] = [];
    const createMouseParticle = (x: number, y: number) => {
      const pColors = ['#ffffff'];
      mouseParticles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        alpha: 1.0,
        color: pColors[Math.floor(Math.random() * pColors.length)],
        size: Math.random() * 2 + 1,
      });
    };

    // Animation Loop
    const animate = () => {
      // Clear canvas with a very soft alpha trails to create space depth
      ctx.fillStyle = 'rgba(3, 3, 3, 0.2)';
      ctx.fillRect(0, 0, width, height);

      // Smoothly interpolate mouse positions for dampening effect
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const steerX = mouseRef.current.x;
      const steerY = mouseRef.current.y;

      // Draw and Update Stars
      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Move stars closer (decrease z)
        // Adjust speed dynamically based on mouse velocity/steering offset
        const speed = 2.5 + Math.sqrt(steerX * steerX + steerY * steerY) * 2;
        star.z -= speed;

        // Apply mouse steering displacement (parallax drift)
        // Move stars opposite to the mouse steering direction
        star.x -= steerX * speed * 0.4;
        star.y -= steerY * speed * 0.4;

        // If star passes the screen, reset to far background
        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        // Project 3D coordinate to 2D Screen Space
        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        // Render star only if it is visible on canvas
        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          // Stars closer look brighter and larger
          const sizeFactor = (1 - star.z / width);
          const size = star.size * sizeFactor * 2;
          const alpha = sizeFactor;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);

          // Apply radial glow for colored stars
          if (star.color !== '#ffffff' && star.color !== '#cbd5e1') {
            ctx.shadowBlur = size * 3;
            ctx.shadowColor = star.color;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = star.color;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      // Restore shadows/alphas for other rendering
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // Update and Draw Interactive Mouse Particles
      for (let i = mouseParticles.length - 1; i >= 0; i--) {
        const p = mouseParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02; // Fade out slowly

        if (p.alpha <= 0) {
          mouseParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      // Draw constellation links near mouse pointer
      // If mouse is moving, connect close stars with light lines to create constellation feeling
      const actualMouseX = (mouseRef.current.targetX * (width / 2)) + width / 2;
      const actualMouseY = (mouseRef.current.targetY * (height / 2)) + height / 2;

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 0.15;
      ctx.strokeStyle = '#06b6d4';

      stars.forEach(star => {
        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        const dx = px - actualMouseX;
        const dy = py - actualMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // If star is near mouse, draw dynamic neon link
        if (distance < 120) {
          ctx.beginPath();
          ctx.moveTo(actualMouseX, actualMouseY);
          ctx.lineTo(px, py);
          ctx.lineWidth = 0.5 * (1 - distance / 120);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="app-container">
      {/* Dynamic Starfield Background Canvas */}
      <canvas ref={canvasRef} className="starfield-canvas" />

  

      {/* Glassmorphic Login Card */}
      <div className="login-card-wrapper">
        <div className="login-card">
          <div className="login-header">
            
            <h1 className="login-title">Futrio - AI</h1>
            <p className="login-subtitle">Your AI Powered Expence Tracker</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {errorMessage && <div className="form-feedback error-msg">{errorMessage}</div>}
            {successMessage && <div className="form-feedback success-msg">{successMessage}</div>}

            {/* Email Input */}
            <div className="input-container">
              <input
                type="email"
                id="email"
                className="input-field"
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                required
              />
              <label htmlFor="email" className="input-label">Set a Email Address</label>
            </div>

            {/* Password Input */}
            <div className="input-container">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="input-field"
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label htmlFor="password" className="input-label">Password</label>
              
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  /* Eye Off Icon */
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  /* Eye Icon */
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Launch Session'}
            </button>
          </form>

          <div className="signup-redirect">
            Already Registered?
            <a href="#signup" className="signup-link">Login Futrio-expence tracker</a>
          </div>
        </div>
      </div>
    </div>
  );
};
