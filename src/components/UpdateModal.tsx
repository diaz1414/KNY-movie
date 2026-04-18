import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, AlertCircle } from 'lucide-react';

const CURRENT_VERSION = '1.0.0'; // Manually track version
const VERSION_CHECK_URL = 'https://yknmovies.diaww.my.id/version.json';

interface UpdateInfo {
  version: string;
  downloadUrl: string;
  changelog: string;
  isCritical: boolean;
}

const UpdateModal: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      try {
        const response = await fetch(`${VERSION_CHECK_URL}?t=${Date.now()}`);
        const data = await response.json();
        
        if (data.version !== CURRENT_VERSION) {
          setUpdateInfo(data);
          setIsVisible(true);
        }
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    };

    checkUpdate();
  }, []);

  if (!isVisible || !updateInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[30000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 font-outfit"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative w-full max-w-md bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] p-8 shadow-[0_0_100px_rgba(229,9,20,0.2)]"
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-netflix-red/20 border border-netflix-red/30 rounded-2xl flex items-center justify-center">
              <Download className="text-netflix-red" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none mb-1">Update Available</h2>
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Version {updateInfo.version}</p>
            </div>
          </div>

          {/* Changelog */}
          <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[3px] text-netflix-red mb-3">What's New</h3>
            <p className="text-white/70 text-sm leading-relaxed font-medium">
              {updateInfo.changelog || 'Performance improvements and bug fixes for a better streaming experience.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => window.open(updateInfo.downloadUrl, '_blank')}
              className="w-full bg-netflix-red text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
              <Download size={18} />
              Download APK Now
            </button>
            
            {!updateInfo.isCritical && (
              <button
                onClick={() => setIsVisible(false)}
                className="w-full bg-transparent text-white/40 py-4 rounded-xl font-bold text-[10px] uppercase tracking-[3px] hover:text-white transition-colors"
              >
                Skip For Now
              </button>
            )}
          </div>

          {updateInfo.isCritical && (
            <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-bold text-red-500/60 uppercase tracking-widest">
              <AlertCircle size={12} />
              This update is mandatory
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateModal;
