import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tag, User, MapPin, ExternalLink, Play } from 'lucide-react';
import { Presentation } from '@/types';
import { formatDate, getImagePath, truncateText } from '@/lib/utils';

interface PresentationCardProps {
  presentation: Presentation;
  viewMode?: 'grid' | 'list';
  currentLanguage?: 'ja' | 'en';
}

export default function PresentationCard({
  presentation,
  viewMode = 'grid',
  currentLanguage = 'ja'
}: PresentationCardProps) {
  const {
    id,
    title,
    description,
    author,
    date,
    tags,
    category,
    thumbnail,
    duration,
    event,
    location,
    language,
    status
  } = presentation;

  if (viewMode === 'list') {
    return (
      <Link href={`/presentations/${id}`} className="block">
        <div className="card-hover p-6">
          <div className="flex items-start space-x-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden">
                {thumbnail ? (
                  <Image
                    src={getImagePath(thumbnail)}
                    alt={title}
                    width={96}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-xs">No Image</span>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {truncateText(title, 60)}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {truncateText(description, 100)}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="badge-secondary text-xs">
                        {tag}
                      </span>
                    ))}
                    {tags.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{tags.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Status */}
                {status !== 'published' && (
                  <span className={`badge text-xs ${
                    status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'archived' ? 'bg-gray-100 text-gray-800' : ''
                  }`}>
                    {status === 'draft' ? 'Draft' : 'Archived'}
                  </span>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex items-center text-xs text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(date)}
                </div>
                <div className="flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {category}
                </div>
                {duration && (
                  <div className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {duration}min
                  </div>
                )}
                {location && (
                  <div className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {location}
                  </div>
                )}
                <div className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-1 ${
                    language === 'ja' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  {language.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="block group">
      <div className="card-hover overflow-hidden">
        {/* Thumbnail */}
        <div className="aspect-video bg-gray-100 overflow-hidden relative">
          {thumbnail ? (
            <Image
              src={getImagePath(thumbnail)}
              alt={title}
              width={400}
              height={225}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <span className="text-xl">📊</span>
                </div>
                <span className="text-sm">No Thumbnail</span>
              </div>
            </div>
          )}
          
          {/* Open Button Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <Link
              href={`/presentations/${id}`}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white text-primary-600 rounded-full p-3 hover:bg-primary-50 hover:scale-110 transform transition-all"
            >
              <Play className="w-6 h-6 fill-current" />
            </Link>
          </div>
          
          {/* Status Badge */}
          {status !== 'published' && (
            <div className="absolute top-2 right-2">
              <span className={`badge text-xs ${
                status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                status === 'archived' ? 'bg-gray-100 text-gray-800' : ''
              }`}>
                {status === 'draft' ? 'Draft' : 'Archived'}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <Link href={`/presentations/${id}`}>
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors cursor-pointer">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge-secondary text-xs">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{tags.length - 2}
              </span>
            )}
          </div>

          {/* Meta */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(date)}
              </div>
              <div className="flex items-center">
                <Tag className="w-3 h-3 mr-1" />
                {category}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {duration && (
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {duration}m
                </div>
              )}
              <div className="flex items-center">
                <span className={`w-2 h-2 rounded-full ${
                  language === 'ja' ? 'bg-red-500' : 'bg-blue-500'
                }`} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}