'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Grid3X3, List, Search, Filter, SortAsc } from 'lucide-react';
import Layout from '@/components/Layout';
import PresentationCard from '@/components/PresentationCard';
import { getAllPresentations, getUniqueCategories, getUniqueTags } from '@/lib/data';
import { PresentationSearch } from '@/lib/search';
import { Presentation, SearchFilters, ViewMode, SortOrder } from '@/types';
import { debounce } from '@/lib/utils';

export default function PresentationsPage() {
  const searchParams = useSearchParams();
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('date');
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams?.get('q') || '',
    tags: searchParams?.get('tag') ? [searchParams.get('tag')!] : [],
    category: searchParams?.get('category') || 'all',
    language: 'all',
    status: 'published'
  });

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [presentationsData, categoriesData, tagsData] = await Promise.all([
          getAllPresentations(),
          getUniqueCategories(),
          getUniqueTags()
        ]);
        
        setPresentations(presentationsData);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Search and filter presentations
  const search = useMemo(() => {
    return new PresentationSearch(presentations);
  }, [presentations]);

  const filteredPresentations = useMemo(() => {
    let results = search.search(filters);

    // Sort results
    results.sort((a, b) => {
      switch (sortOrder) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'popularity':
          return b.slides.length - a.slides.length;
        case 'date':
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return results;
  }, [search, filters, sortOrder]);

  // Debounced search
  const debouncedSearch = debounce((query: string) => {
    setFilters(prev => ({ ...prev, query }));
  }, 300);

  const handleSearchChange = (query: string) => {
    debouncedSearch(query);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      category: 'all',
      language: 'all',
      status: 'published'
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="h-40 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            プレゼンテーション
          </h1>
          <p className="text-gray-600">
            {presentations.length}個のプレゼンテーション、
            {presentations.reduce((sum, p) => sum + p.slides.length, 0)}枚のスライド
          </p>
        </div>

        {/* Search and Controls */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="プレゼンテーションを検索..."
                  defaultValue={filters.query}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-2">
              {/* View Mode */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="input w-auto"
              >
                <option value="date">日付順</option>
                <option value="title">タイトル順</option>
                <option value="category">カテゴリ順</option>
                <option value="popularity">人気順</option>
              </select>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-outline"
              >
                <Filter className="w-4 h-4 mr-2" />
                フィルター
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="label mb-2">カテゴリ</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="input"
                  >
                    <option value="all">すべて</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="label mb-2">言語</label>
                  <select
                    value={filters.language}
                    onChange={(e) => handleFilterChange('language', e.target.value)}
                    className="input"
                  >
                    <option value="all">すべて</option>
                    <option value="ja">日本語</option>
                    <option value="en">English</option>
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="label mb-2">ステータス</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="input"
                  >
                    <option value="all">すべて</option>
                    <option value="published">公開済み</option>
                    <option value="draft">下書き</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="mt-4">
                <label className="label mb-2">タグ</label>
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 20).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`badge transition-colors ${
                        filters.tags.includes(tag)
                          ? 'badge-primary'
                          : 'badge-secondary hover:bg-primary-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="btn-outline text-sm"
                >
                  フィルターをクリア
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(filters.query || filters.tags.length > 0 || filters.category !== 'all') && (
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-600">アクティブなフィルター:</span>
              
              {filters.query && (
                <span className="badge-primary">
                  "{filters.query}"
                </span>
              )}
              
              {filters.category !== 'all' && (
                <span className="badge-secondary">
                  カテゴリ: {filters.category}
                </span>
              )}
              
              {filters.tags.map(tag => (
                <span key={tag} className="badge-primary">
                  {tag}
                  <button
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredPresentations.length}件の結果
          </p>
        </div>

        {/* Presentations Grid/List */}
        {filteredPresentations.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
            {filteredPresentations.map((presentation) => (
              <PresentationCard
                key={presentation.id}
                presentation={presentation}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              検索結果が見つかりません
            </h3>
            <p className="text-gray-600 mb-4">
              検索条件を変更して再度お試しください
            </p>
            <button
              onClick={clearFilters}
              className="btn-primary"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}