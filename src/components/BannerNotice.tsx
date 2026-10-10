import React from 'react';
import { Flame, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface BannerNoticeProps {
  onOpenStoreInfo: () => void;
  onFilterTops: () => void;
}

export const BannerNotice: React.FC<BannerNoticeProps> = ({ onOpenStoreInfo, onFilterTops }) => {
  const { storeConfig } = useStore();

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-emerald-900 text-white border-b border-emerald-800/60 px-4 py-2.5 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center md:text-left">
          <span className="p-1 rounded bg-emerald-800/80 text-emerald-300 shrink-0 border border-emerald-700/60">
            <Flame className="w-3.5 h-3.5 fill-emerald-300 animate-pulse" />
          </span>
          <p className="font-medium text-emerald-50">
            {storeConfig.announcement}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onFilterTops}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-semibold border border-white/20 transition-colors cursor-pointer text-[11px]"
          >
            <span>Tops (UGX 10k-30k)</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={onOpenStoreInfo}
            className="inline-flex items-center gap-1 text-emerald-200 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <MapPin className="w-3 h-3 text-emerald-300" />
            <span className="underline underline-offset-2">Pioneer Mall PF 32/37</span>
          </button>
        </div>
      </div>
    </div>
  );
};
