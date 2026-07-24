import { Link } from 'wouter';
import { Ghost, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-md mx-auto"
    >
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6 neon-glow">
        <Ghost className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold mb-2 neon-text">404</h1>
      <h2 className="text-xl font-medium text-foreground mb-4">Level Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The ROM or page you're looking for has been corrupted, moved, or never existed in this dimension.
      </p>
      
      <Link href="/">
        <div className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-medium rounded-full hover:bg-primary/90 transition-colors neon-glow cursor-pointer">
          <Home className="w-4 h-4" />
          Return to Dashboard
        </div>
      </Link>
    </motion.div>
  );
}
