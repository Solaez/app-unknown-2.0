import { useGetDownloads, useCancelDownload } from '@workspace/api-client-react';
import { motion } from 'framer-motion';
import { Download as DownloadIcon, X, CheckCircle, AlertCircle, HardDrive } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetDownloadsQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

export default function Downloads() {
  let toast: any;
  try { toast = require('@/hooks/use-toast').useToast().toast; } catch (e) { toast = (m:any) => console.log(m); }

  const { data: downloads, isLoading } = useGetDownloads();
  const cancel = useCancelDownload();
  const queryClient = useQueryClient();

  const handleCancel = (id: number) => {
    cancel.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Canceled", description: "Download removed from queue." });
        queryClient.invalidateQueries({ queryKey: getGetDownloadsQueryKey() });
      }
    });
  };

  const activeDownloads = downloads?.filter(d => d.status === 'downloading' || d.status === 'pending') || [];
  const completedDownloads = downloads?.filter(d => d.status === 'completed' || d.status === 'error') || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-black uppercase tracking-tight neon-text flex items-center gap-3">
          <DownloadIcon className="w-8 h-8 text-primary" /> Active Queue
        </h1>
        <p className="text-muted-foreground mt-1">Manage your active and completed transfers.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">Downloading ({activeDownloads.length})</h2>
        
        {activeDownloads.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center flex flex-col items-center">
            <HardDrive className="w-12 h-12 text-white/20 mb-4" />
            <p className="text-muted-foreground">Queue is empty. Go find some games!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeDownloads.map((dl, i) => (
              <motion.div
                key={dl.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-panel p-4 rounded-2xl relative overflow-hidden group"
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 shrink-0 border border-white/10 flex items-center justify-center">
                    <DownloadIcon className="w-6 h-6 text-primary animate-bounce" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold truncate text-white">{dl.romTitle}</h3>
                      <button 
                        onClick={() => handleCancel(dl.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 bg-black/40 rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono mb-3">
                      <span>{dl.platformName}</span>
                      <span className="text-primary neon-text">{dl.speed}</span>
                      <span>{dl.size}</span>
                    </div>

                    <div className="h-2 bg-black/60 rounded-full overflow-hidden border border-white/5">
                      <motion.div 
                        className="h-full bg-primary relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${dl.progress}%` }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/50" />
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Background glow tied to progress */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-primary/5 transition-all duration-500 ease-out" 
                  style={{ width: `${dl.progress}%` }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {completedDownloads.length > 0 && (
        <div className="space-y-4 pt-8 border-t border-white/10">
          <h2 className="text-xl font-bold uppercase tracking-widest text-muted-foreground">Completed</h2>
          <div className="space-y-3">
            {completedDownloads.map((dl) => (
              <div key={dl.id} className="glass-panel p-4 rounded-xl flex items-center justify-between opacity-70 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  {dl.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-destructive" />
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-white">{dl.romTitle}</h3>
                    <p className="text-xs text-muted-foreground font-mono">{dl.platformName} • {dl.size}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleCancel(dl.id)}
                  className="text-xs text-muted-foreground hover:text-white"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
