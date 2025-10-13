import { Video } from '../lib/supabase';
import { VideoCard } from './VideoCard';
import { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VideoRowProps {
  videos: Video[];
  hasAccess: (videoId: string) => boolean;
  onClick: (video: Video) => void;
}

export function VideoRow({ videos, hasAccess, onClick }: VideoRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [videos]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  if (videos.length === 0) return null;

  return (
    <div className="relative group">
      {showLeftArrow && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ marginLeft: '4px' }}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-3 sm:gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((video) => (
          <div key={video.id} className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[360px]">
            <VideoCard
              video={video}
              hasAccess={hasAccess(video.id)}
              onClick={onClick}
            />
          </div>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-black/80 hover:bg-black text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ marginRight: '4px' }}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}
