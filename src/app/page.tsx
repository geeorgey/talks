import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, BookOpen, Search, Tag, TrendingUp } from 'lucide-react';
import Layout from '@/components/Layout';
import PresentationCard from '@/components/PresentationCard';
import { getAllPresentations, getProfile, getUniqueCategories, getUniqueTags } from '@/lib/data';
import { getImagePath } from '@/lib/utils';

export default async function HomePage() {
  const [presentations, profile, categories, tags] = await Promise.all([
    getAllPresentations(),
    getProfile(),
    getUniqueCategories(),
    getUniqueTags()
  ]);

  const recentPresentations = presentations
    .filter(p => p.status === 'published')
    .slice(0, 6);

  const totalSlides = presentations.reduce((sum, p) => sum + p.slides.length, 0);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">
              プレゼンテーション
              <br />
              ポートフォリオ
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 mb-8">
              {profile.name.ja} - {profile.title.ja}
              <br />
              {profile.company.ja}
            </p>
            <p className="text-lg text-primary-200 mb-8 max-w-2xl mx-auto">
              {totalSlides}以上のスライドを含む{presentations.length}個のプレゼンテーションを公開中
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/presentations" className="btn-primary btn-lg">
                <BookOpen className="w-5 h-5 mr-2" />
                プレゼンテーションを見る
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link href="/search" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                <Search className="w-5 h-5 mr-2" />
                検索する
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {presentations.length}
              </div>
              <div className="text-gray-600">プレゼンテーション</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {totalSlides}+
              </div>
              <div className="text-gray-600">スライド</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {categories.length}
              </div>
              <div className="text-gray-600">カテゴリ</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {tags.length}+
              </div>
              <div className="text-gray-600">タグ</div>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Section */}
      <section className="py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-1">
                <div className="w-48 h-48 mx-auto lg:mx-0 rounded-full overflow-hidden bg-gray-100">
                  {profile.avatar ? (
                    <Image
                      src={getImagePath(profile.avatar)}
                      alt={profile.name.ja}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">👤</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="lg:col-span-2 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {profile.name.ja}
                </h2>
                <h3 className="text-lg text-primary-600 mb-4">
                  {profile.title.ja}
                </h3>
                <p className="text-gray-600 mb-6">
                  {profile.bio.ja}
                </p>
                <div className="flex justify-center lg:justify-start space-x-4">
                  {profile.social.website && (
                    <a
                      href={profile.social.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Website
                    </a>
                  )}
                  {profile.social.twitter && (
                    <a
                      href={profile.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      Twitter
                    </a>
                  )}
                  {profile.social.linkedin && (
                    <a
                      href={profile.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Presentations */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              最近のプレゼンテーション
            </h2>
            <Link href="/presentations" className="btn-outline">
              すべて見る
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          {recentPresentations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPresentations.map((presentation) => (
                <PresentationCard
                  key={presentation.id}
                  presentation={presentation}
                  viewMode="grid"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">プレゼンテーションがまだありません</p>
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              カテゴリ別に探す
            </h2>
            <p className="text-gray-600">
              興味のあるトピックからプレゼンテーションを探してください
            </p>
          </div>
          
          {categories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.map((category) => {
                const categoryCount = presentations.filter(p => 
                  p.category === category && p.status === 'published'
                ).length;
                
                return (
                  <Link
                    key={category}
                    href={`/presentations?category=${encodeURIComponent(category)}`}
                    className="card-hover p-4 text-center"
                  >
                    <Tag className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                    <h3 className="font-medium text-gray-900 mb-1">
                      {category}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {categoryCount}件
                    </p>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">カテゴリがまだありません</p>
            </div>
          )}
        </div>
      </section>

      {/* Popular Tags */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            人気のタグ
          </h2>
          
          {tags.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-2">
              {tags.slice(0, 20).map((tag) => (
                <Link
                  key={tag}
                  href={`/presentations?tag=${encodeURIComponent(tag)}`}
                  className="badge-secondary hover:bg-primary-100 hover:text-primary-800 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">タグがまだありません</p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}