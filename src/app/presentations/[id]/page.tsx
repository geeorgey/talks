import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Tag, User, MapPin, Share2, Download } from 'lucide-react';
import Layout from '@/components/Layout';
import SlideViewer from '@/components/SlideViewer';
import PresentationCard from '@/components/PresentationCard';
import { getAllPresentations, getPresentationById } from '@/lib/data';
import { PresentationSearch } from '@/lib/search';
import { formatDate, getImagePath } from '@/lib/utils';

interface PresentationPageProps {
  params: {
    id: string;
  };
}

export async function generateStaticParams() {
  const presentations = await getAllPresentations();
  return presentations.map((presentation) => ({
    id: presentation.id,
  }));
}

export default async function PresentationPage({ params }: PresentationPageProps) {
  const presentation = await getPresentationById(params.id);
  
  if (!presentation) {
    notFound();
  }

  const allPresentations = await getAllPresentations();
  const search = new PresentationSearch(allPresentations);
  const relatedPresentations = search.getRelatedPresentations(presentation, 3);

  const {
    title,
    description,
    author,
    date,
    tags,
    category,
    slides,
    duration,
    event,
    location,
    language,
    status
  } = presentation;

  return (
    <Layout>
      <div className="container py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            href="/presentations"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            プレゼンテーション一覧に戻る
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h1>
              
              <p className="text-lg text-gray-600 mb-6">
                {description}
              </p>

              {/* Meta Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center text-gray-600">
                  <User className="w-4 h-4 mr-2" />
                  {author}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formatDate(date)}
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Tag className="w-4 h-4 mr-2" />
                  {category}
                </div>
                
                {duration && (
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    約{duration}分
                  </div>
                )}
                
                {location && (
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {location}
                  </div>
                )}

                <div className="flex items-center text-gray-600">
                  <span className={`w-3 h-3 rounded-full mr-2 ${
                    language === 'ja' ? 'bg-red-500' : 'bg-blue-500'
                  }`} />
                  {language === 'ja' ? '日本語' : 'English'}
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/presentations?tag=${encodeURIComponent(tag)}`}
                    className="badge-secondary hover:bg-primary-100 hover:text-primary-800 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>

              {/* Event Info */}
              {event && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-900 mb-1">イベント情報</h3>
                  <p className="text-gray-600">{event}</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col space-y-3 lg:w-48">
              <button className="btn-primary">
                <Share2 className="w-4 h-4 mr-2" />
                シェア
              </button>
              
              <button className="btn-outline">
                <Download className="w-4 h-4 mr-2" />
                ダウンロード
              </button>

              {/* Status */}
              {status !== 'published' && (
                <div className={`badge text-center ${
                  status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'archived' ? 'bg-gray-100 text-gray-800' : ''
                }`}>
                  {status === 'draft' ? '下書き' : 'アーカイブ'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Slide Viewer */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              スライド ({slides.length}枚)
            </h2>
            <div className="text-sm text-gray-600">
              キーボードショートカット: ← → (ナビゲーション), F (フルスクリーン), G (サムネイル)
            </div>
          </div>
          
          <SlideViewer
            slides={slides}
            showControls={true}
            autoPlay={false}
            autoPlayInterval={5000}
          />
        </div>

        {/* Related Presentations */}
        {relatedPresentations.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              関連するプレゼンテーション
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedPresentations.map((relatedPresentation) => (
                <PresentationCard
                  key={relatedPresentation.id}
                  presentation={relatedPresentation}
                  viewMode="grid"
                />
              ))}
            </div>
          </section>
        )}

        {/* Additional Info */}
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            プレゼンテーション情報
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">概要</h4>
              <p className="text-gray-600 text-sm">
                このプレゼンテーションは{slides.length}枚のスライドで構成されており、
                {duration ? `約${duration}分` : '時間未定'}で発表されました。
                {event && `「${event}」で発表されました。`}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">使用方法</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 矢印キーまたはスペースキーでスライドを進める</li>
                <li>• Fキーでフルスクリーンモード</li>
                <li>• Gキーでサムネイル表示</li>
                <li>• Nキーでスピーカーノート表示</li>
                <li>• Escキーで各モードを終了</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}