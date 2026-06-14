import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';

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
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [dark, setDark] = useState(localStorage.getItem("darktheme") !== "false");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isMoving: false });
  const mouseTimeoutRef = useRef<number | null>(null);
  const isDarkRef = useRef(dark);

  useEffect(() => {
    isDarkRef.current = dark;
  }, [dark]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("darktheme", String(next));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    
    setIsLoading(true);
    const response = await fetch(
      "http://127.0.0.1:8000/futrio/register",
      {
        method : "POST",
        headers : {"Content-Type" : "application/json"},
        body : JSON.stringify({
          "email" : email,
          "password" : password
        })
      }
    );

    if (response.ok) {
      setSuccessMessage("Account created successfully! Redirecting...");
      setErrorMessage("");

      setTimeout(() => {
        setIsLoading(false);
        nav("/", { replace: true });
      }, 1500);
    } else {
      setIsLoading(false);
      setErrorMessage("User already exists or registration failed!");
      setSuccessMessage("");
    }
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
      mouseRef.current.targetX = (e.clientX - width / 2) / (width / 2);
      mouseRef.current.targetY = (e.clientY - height / 2) / (height / 2);
      mouseRef.current.isMoving = true;

      if (mouseTimeoutRef.current) {
        window.clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = window.setTimeout(() => {
        mouseRef.current.isMoving = false;
      }, 100);

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
      const pColors = isDarkRef.current ? ['#ffffff', '#818cf8'] : ['#6366f1', '#4f46e5'];
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
      const isDark = isDarkRef.current;
      ctx.fillStyle = isDark ? 'rgba(3, 3, 3, 0.2)' : 'rgba(241, 245, 249, 0.25)';
      ctx.fillRect(0, 0, width, height);

      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      const steerX = mouseRef.current.x;
      const steerY = mouseRef.current.y;

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];
        const speed = 2.5 + Math.sqrt(steerX * steerX + steerY * steerY) * 2;
        star.z -= speed;
        star.x -= steerX * speed * 0.4;
        star.y -= steerY * speed * 0.4;

        if (star.z <= 0) {
          star.z = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const sizeFactor = (1 - star.z / width);
          const size = star.size * sizeFactor * 2;
          const alpha = sizeFactor;

          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);

          const starColor = isDark ? star.color : '#6366f1';
          if (starColor !== '#ffffff' && starColor !== '#cbd5e1') {
            ctx.shadowBlur = size * 3;
            ctx.shadowColor = starColor;
          } else {
            ctx.shadowBlur = 0;
          }

          ctx.fillStyle = starColor;
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // Update and Draw Interactive Mouse Particles
      for (let i = mouseParticles.length - 1; i >= 0; i--) {
        const p = mouseParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;

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
      const actualMouseX = (mouseRef.current.targetX * (width / 2)) + width / 2;
      const actualMouseY = (mouseRef.current.targetY * (height / 2)) + height / 2;

      ctx.shadowBlur = 0;
      ctx.globalAlpha = isDark ? 0.15 : 0.1;
      ctx.strokeStyle = isDark ? '#06b6d4' : '#4f46e5';

      stars.forEach(star => {
        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        const dx = px - actualMouseX;
        const dy = py - actualMouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
    <div className={dark ? "theme-dark" : "theme-light"}>
      <div className="app-container">
        {/* Theme toggle */}
        <button className="theme-toggle-float" onClick={toggleDark} aria-label="Toggle theme">
          {dark ? <FaSun /> : <FaMoon />}
        </button>

        {/* Dynamic Starfield Background Canvas */}
        <canvas ref={canvasRef} className="starfield-canvas" />

        {/* Decorative Nebula Lights behind the register card */}
        <div className="nebula-overlay-1" />
        <div className="nebula-overlay-2" />

        {/* Glassmorphic Register Card */}
        <div className="login-card-wrapper anim-fadeInScale">
          <div className="login-card">
            <div className="login-header anim-fadeInDown">
              <div className="login-logo">
                <svg viewBox="0 0 24 24">
                  <path d="M12 2C12 2 8 6 8 11.5C8 14.5 9.5 16.5 9.5 16.5H14.5C14.5 16.5 16 14.5 16 11.5C16 6 12 2 12 2Z" />
                  <path d="M9.5 18C9.5 18 6 19 6 22H18C18 19 14.5 18 14.5 18H9.5Z" opacity="0.8" />
                  <circle cx="12" cy="10" r="1.5" fill="#030303" />
                </svg>
              </div>
              <h1 className="login-title">Futrio AI</h1>
              <p className="login-subtitle">Create your secure pilot account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {errorMessage && <div className="form-feedback error-msg" style={{ animation: 'shake 0.4s ease' }}>{errorMessage}</div>}
              {successMessage && <div className="form-feedback success-msg">{successMessage}</div>}

              {/* Email Input */}
              <div className="input-container anim-fadeInUp anim-stagger-1">
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
                <label htmlFor="email" className="input-label">Email Address</label>
              </div>

              {/* Password Input */}
              <div className="input-container anim-fadeInUp anim-stagger-2">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input-field"
                  placeholder=" "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <label htmlFor="password" className="input-label">Create Password</label>
                
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
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
                className="submit-button btn-shimmer anim-fadeInUp anim-stagger-3"
                disabled={isLoading}
              >
                {isLoading ? 'Creating Account...' : 'Register Session'}
              </button>
            </form>

            <div className="signup-redirect anim-fadeInUp anim-stagger-4">
              Already have an account?
              <a onClick={() => { nav("/", { replace: true }) }} style={{ cursor: "pointer" }} className="signup-link">Login here</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
