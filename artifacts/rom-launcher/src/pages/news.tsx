import { useGetNews } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, User, ArrowRight } from 'lucide-react';

export default function News() {
  const { data: news, isLoading } = useGetNews();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-white/5 animate-pulse rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight neon-text flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" /> Transmission Feed
        </h1>
        <p className="text-muted-foreground mt-1">Latest updates from the retro gaming underground.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {news?.map((article, i) => (
          <motion.article
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel rounded-3xl overflow-hidden group cursor-pointer border border-white/10 hover:border-primary/50 transition-colors flex flex-col h-full"
          >
            <div className="h-48 relative overflow-hidden shrink-0">
              {article.imageUrl ? (
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                  <Newspaper className="w-12 h-12 opacity-20" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80" />
              <div className="absolute top-4 left-4 bg-primary/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {article.category}
              </div>
            </div>
            
            <div className="p-6 flex flex-col flex-1 relative z-10 bg-black/40">
              <h2 className="text-2xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors">
                {article.title}
              </h2>
              <p className="text-muted-foreground line-clamp-3 mb-6 flex-1 text-sm leading-relaxed">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs text-white/50 font-mono pt-4 border-t border-white/5 mt-auto">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> {article.author}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {article.readTime}m read</span>
                </div>
                <div className="flex items-center gap-1 text-primary group-hover:translate-x-1 transition-transform">
                  Read <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
