import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Gamepad2, Lock, User, Zap, Shield, ChevronRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

/* ── animated floating particles ── */
function Particles() {
  const count = 22;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: count }).map((_, i) => {
        const size = 2 + Math.random() * 3;
        const x = Math.random() * 100;
        const delay = Math.random() * 8;
        const dur = 6 + Math.random() * 8;
        const opacity = 0.15 + Math.random() * 0.35;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size, height: size,
              left: `${x}%`,
              bottom: '-10px',
              background: i % 3 === 0 ? 'hsl(var(--primary))' : i % 3 === 1 ? 'hsl(var(--secondary))' : '#06b6d4',
              opacity,
            }}
            animate={{ y: [0, -(500 + Math.random() * 400)], opacity: [opacity, 0] }}
            transition={{ duration: dur, delay, repeat: Infinity, ease: 'linear' }}
          />
        );
      })}
    </div>
  );
}

/* ── grid lines bg ── */
function GridBg() {
  return (
    <div className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(hsl(var(--primary)/0.04) 1px, transparent 1px),
          linear-gradient(90deg, hsl(var(--primary)/0.04) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }}
    />
  );
}

export default function Login() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  /* Redirect if already authenticated */
  useEffect(() => {
    if (!isLoading && isAuthenticated) setLocation('/');
  }, [isAuthenticated, isLoading, setLocation]);

  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Ingresa usuario y contraseña');
      return;
    }
    setError('');
    setSubmitting(true);
    const result = await login(username.trim(), password);
    setSubmitting(false);
    if (result.ok) {
      setSuccess(true);
      setTimeout(() => setLocation('/'), 800);
    } else {
      setError(result.error ?? 'Credenciales incorrectas');
    }
  }

  return (
    <div className="min-h-screen w-full flex overflow-hidden relative bg-background">
      <GridBg />
      <Particles />

      {/* ── Left panel — branding ── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary)/0.15) 0%, hsl(var(--secondary)/0.10) 50%, hsl(var(--primary)/0.05) 100%)',
          borderRight: '1px solid hsl(var(--border))',
        }}
      >
        {/* Big ambient glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[120px] opacity-30"
          style={{ background: 'hsl(var(--primary))' }} />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-20"
          style={{ background: 'hsl(var(--secondary))' }} />

        {/* Floating game cards */}
        {[
          { label: 'Super Mario Galaxy', console: 'Wii', rating: '9.8', gradient: 'linear-gradient(135deg,#7c3aed,#2563eb)', delay: 0, x: '8%', y: '22%' },
          { label: 'Zelda: BotW', console: 'Switch', rating: '9.7', gradient: 'linear-gradient(135deg,#059669,#10b981)', delay: 0.3, x: '58%', y: '15%' },
          { label: 'GTA: San Andreas', console: 'PS2', rating: '9.5', gradient: 'linear-gradient(135deg,#f59e0b,#ef4444)', delay: 0.6, x: '15%', y: '68%' },
          { label: 'Halo: CE', console: 'Xbox', rating: '9.3', gradient: 'linear-gradient(135deg,#06b6d4,#3b82f6)', delay: 0.9, x: '62%', y: '62%' },
        ].map((card) => (
          <motion.div
            key={card.label}
            className="absolute rounded-2xl border border-white/10 px-4 py-3 backdrop-blur-sm"
            style={{ background: 'rgba(0,0,0,0.55)', left: card.x, top: card.y, minWidth: 160 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{ opacity: { delay: card.delay, duration: 0.6 }, y: { delay: card.delay, duration: 4, repeat: Infinity, ease: 'easeInOut' } }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: card.gradient }}>
                {card.console.slice(0, 2)}
              </div>
              <div>
                <p className="text-[12px] font-bold text-white leading-tight">{card.label}</p>
                <p className="text-[10px] text-white/50">{card.console} · ⭐ {card.rating}</p>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Center logo */}
        <div className="flex-1 flex flex-col items-center justify-center relative z-10 p-12">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 neon-glow"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
          >
            <Gamepad2 className="w-12 h-12 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-5xl font-black text-foreground tracking-tight mb-3"
          >
            NeonROM
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="text-muted-foreground text-center max-w-sm leading-relaxed"
          >
            El gestor de ROMs retro más completo. Miles de juegos, todas las plataformas, en un solo lugar.
          </motion.p>

          {/* Feature badges */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="flex flex-wrap gap-2 mt-8 justify-center"
          >
            {[
              { icon: Shield, label: 'Acceso Seguro' },
              { icon: Zap, label: 'Ultra Rápido' },
              { icon: Gamepad2, label: 'Multi-Plataforma' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border/60 bg-muted/30 text-[12px] font-semibold text-muted-foreground">
                <Icon className="w-3 h-3" />
                {label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Version footer */}
        <div className="p-8 text-center relative z-10">
          <p className="text-[11px] text-muted-foreground/60">NeonROM v2.0 · Retro Gaming Vault</p>
        </div>
      </motion.div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-[420px]"
        >
          {/* Logo — mobile only */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center neon-glow"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}>
              <Gamepad2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black text-foreground">NeonROM</span>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-foreground mb-1">Bienvenido</h2>
            <p className="text-muted-foreground text-sm">Inicia sesión para acceder a tu bóveda retro</p>
          </div>

          {/* Card */}
          <div className="rounded-3xl border border-border/70 p-7 relative overflow-hidden"
            style={{ background: 'hsl(var(--card))' }}>

            {/* Glow top bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-3xl"
              style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)), hsl(var(--primary)))' }} />

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Username */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                  Usuario
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    ref={usernameRef}
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(''); }}
                    placeholder="Tu nombre de usuario"
                    autoComplete="username"
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all outline-none text-foreground',
                      'bg-muted/50 placeholder:text-muted-foreground/50',
                      error
                        ? 'border-destructive/60 focus:border-destructive'
                        : 'border-border focus:border-primary/60 focus:bg-muted/70'
                    )}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className={cn(
                      'w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition-all outline-none text-foreground',
                      'bg-muted/50 placeholder:text-muted-foreground/50',
                      error
                        ? 'border-destructive/60 focus:border-destructive'
                        : 'border-border focus:border-primary/60 focus:bg-muted/70'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-destructive/10 border border-destructive/25"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                    <p className="text-[13px] font-medium text-destructive">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={submitting || success}
                whileHover={{ scale: submitting || success ? 1 : 1.02 }}
                whileTap={{ scale: submitting || success ? 1 : 0.98 }}
                className={cn(
                  'w-full py-3.5 rounded-xl font-black text-[15px] text-white relative overflow-hidden transition-all',
                  'flex items-center justify-center gap-2',
                  (submitting || success) ? 'opacity-80 cursor-not-allowed' : 'neon-glow hover:brightness-110'
                )}
                style={{ background: success ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))' }}
              >
                {/* Shimmer effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"
                  animate={{ x: ['-200%', '200%'] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                />

                <span className="relative">
                  {success ? '✓ Sesión iniciada' : submitting ? 'Verificando...' : 'Iniciar Sesión'}
                </span>
                {!submitting && !success && <ChevronRight className="w-4 h-4 relative" />}
              </motion.button>
            </form>
          </div>

          {/* Admin hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-5 p-3.5 rounded-2xl border border-border/50 bg-muted/20 flex items-start gap-2.5"
          >
            <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-foreground">Cuenta Administrador</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Usuario: <span className="font-mono font-bold text-foreground">unknown</span>
                {' · '}
                Contraseña: <span className="font-mono font-bold text-foreground">unknown</span>
              </p>
            </div>
          </motion.div>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
            NeonROM · Retro Gaming Vault © 2025
          </p>
        </motion.div>
      </div>
    </div>
  );
}
