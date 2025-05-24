'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize2, 
  Minimize2, 
  Play, 
  Pause,
  Grid3X3,
  Eye,
  FileText
} from 'lucide-react';
import { Slide } from '@/types';
import { getImagePath } from '@/lib/utils';

interface SlideViewerProps {
  slides: Slide[];
  initialSlide?: number;
  onSlideChange?: (slideIndex: number) => void;
  showControls?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
}

export default function SlideViewer({
  slides,
  initialSlide = 0,
  onSlideChange,
  showControls = true,
  autoPlay = false,
  autoPlayInterval = 5000
}: SlideViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index);
      onSlideChange?.(index);
    }
  }, [slides.length, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, slides.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1);
  }, [currentSlide, slides.length, goToSlide]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && !showThumbnails) {
      const interval = setInterval(nextSlide, autoPlayInterval);
      return () => clearInterval(interval);
    }
  }, [isPlaying, showThumbnails, nextSlide, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowRight':
        case ' ':
          event.preventDefault();
          nextSlide();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          prevSlide();
          break;
        case 'f':
        case 'F11':
          event.preventDefault();
          toggleFullscreen();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          }
          if (showThumbnails) {
            setShowThumbnails(false);
          }
          break;
        case 'g':
          event.preventDefault();
          setShowThumbnails(!showThumbnails);
          break;
        case 'n':
          event.preventDefault();
          setShowNotes(!showNotes);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isFullscreen, showThumbnails, showNotes]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const currentSlideData = slides[currentSlide];

  if (!currentSlideData) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No slides available</p>
      </div>
    );
  }

  return (
    <div className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : ''}`}>
      {/* Thumbnail Grid Overlay */}
      {showThumbnails && (
        <div className="absolute inset-0 z-40 bg-black bg-opacity-90 flex items-center justify-center p-4">
          <div className="w-full max-w-6xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white text-lg font-semibold">
                Slides ({slides.length})
              </h3>
              <button
                onClick={() => setShowThumbnails(false)}
                className="text-white hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-96 overflow-y-auto">
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  onClick={() => {
                    goToSlide(index);
                    setShowThumbnails(false);
                  }}
                  className={`aspect-video bg-white rounded border-2 transition-colors ${
                    index === currentSlide ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <div className="w-full h-full p-2 text-xs overflow-hidden">
                    <div className="font-medium truncate">{slide.title}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {index + 1}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Slide Area */}
      <div className={`relative ${isFullscreen ? 'h-screen' : 'min-h-96'} bg-white rounded-lg overflow-hidden`}>
        {/* Slide Content */}
        <div className={`w-full h-full flex items-center justify-center p-8 ${
          isFullscreen ? 'presentation-mode' : ''
        }`}>
          <SlideContent slide={currentSlideData} isFullscreen={isFullscreen} />
        </div>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          disabled={slides.length <= 1}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
          disabled={slides.length <= 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Counter */}
        <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
          {currentSlide + 1} / {slides.length}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-opacity"
              title="Toggle Notes"
            >
              <FileText className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowThumbnails(!showThumbnails)}
              className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-opacity"
              title="Show Thumbnails (G)"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-opacity"
              title="Auto Play"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="bg-black bg-opacity-50 text-white p-2 rounded hover:bg-opacity-70 transition-opacity"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* Speaker Notes */}
      {showNotes && currentSlideData.notes && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Speaker Notes</h4>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {currentSlideData.notes}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {!isFullscreen && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-primary-600 h-1 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface SlideContentProps {
  slide: Slide;
  isFullscreen: boolean;
}

function SlideContent({ slide, isFullscreen }: SlideContentProps) {
  const { type, title, content, image, background } = slide;

  const containerClass = isFullscreen 
    ? 'slide w-full max-w-6xl text-center' 
    : 'w-full max-w-4xl text-center';

  const baseStyle = background 
    ? { backgroundImage: `url(${getImagePath(background)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  switch (type) {
    case 'title':
      return (
        <div className={containerClass} style={baseStyle}>
          <h1 className={`font-bold mb-4 ${isFullscreen ? 'text-6xl' : 'text-4xl'}`}>
            {title}
          </h1>
          {content && (
            <p className={`text-gray-600 ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
              {content}
            </p>
          )}
        </div>
      );

    case 'image':
      return (
        <div className={containerClass} style={baseStyle}>
          {title && (
            <h2 className={`font-semibold mb-6 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {title}
            </h2>
          )}
          {image && (
            <div className="relative mx-auto">
              <Image
                src={getImagePath(image)}
                alt={title || 'Slide image'}
                width={800}
                height={600}
                className={`max-w-full h-auto rounded-lg ${isFullscreen ? 'max-h-96' : 'max-h-80'}`}
              />
            </div>
          )}
          {content && (
            <p className={`mt-4 text-gray-600 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
              {content}
            </p>
          )}
        </div>
      );

    case 'code':
      return (
        <div className={containerClass} style={baseStyle}>
          {title && (
            <h2 className={`font-semibold mb-6 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {title}
            </h2>
          )}
          <pre className={`bg-gray-900 text-white p-6 rounded-lg text-left overflow-x-auto ${
            isFullscreen ? 'text-lg' : 'text-sm'
          }`}>
            <code>{content}</code>
          </pre>
        </div>
      );

    case 'quote':
      return (
        <div className={containerClass} style={baseStyle}>
          <blockquote className={`text-center ${isFullscreen ? 'text-3xl' : 'text-xl'}`}>
            <p className="italic text-gray-700 mb-4">"{content}"</p>
            {title && (
              <cite className={`text-gray-500 ${isFullscreen ? 'text-xl' : 'text-base'}`}>
                — {title}
              </cite>
            )}
          </blockquote>
        </div>
      );

    case 'bullet':
      return (
        <div className={containerClass} style={baseStyle}>
          {title && (
            <h2 className={`font-semibold mb-6 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {title}
            </h2>
          )}
          <div className={`text-left max-w-3xl mx-auto ${isFullscreen ? 'text-xl' : 'text-base'}`}>
            <div className="slide-content" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      );

    default:
      return (
        <div className={containerClass} style={baseStyle}>
          {title && (
            <h2 className={`font-semibold mb-6 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
              {title}
            </h2>
          )}
          <div className={`slide-content max-w-3xl mx-auto ${isFullscreen ? 'text-xl' : 'text-base'}`}>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      );
  }
}