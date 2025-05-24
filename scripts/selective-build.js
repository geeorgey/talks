#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

/**
 * Selective Build Script for Presentation Portfolio
 * 
 * This script allows building individual presentations or specific sets of presentations
 * instead of building the entire site each time.
 * 
 * Usage:
 * npm run build:selective -- --presentations presentation-001,presentation-002
 * npm run build:selective -- --category "ビジネス"
 * npm run build:selective -- --tag "AI"
 * npm run build:selective -- --language "ja"
 * npm run build:selective -- --recent 5
 * npm run build:selective -- --all
 */

class SelectiveBuild {
  constructor() {
    this.presentationsDir = path.join(process.cwd(), 'src/data/presentations');
    this.outputDir = path.join(process.cwd(), 'out');
    this.buildConfig = {
      presentations: [],
      outputDir: this.outputDir,
      mode: 'selective'
    };
  }

  /**
   * Parse command line arguments
   */
  parseArguments() {
    const args = process.argv.slice(2);
    const config = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      
      if (arg.startsWith('--')) {
        const key = arg.substring(2);
        const value = args[i + 1];
        
        if (value && !value.startsWith('--')) {
          config[key] = value;
          i++; // Skip next argument as it's the value
        } else {
          config[key] = true;
        }
      }
    }

    return config;
  }

  /**
   * Load all presentations from YAML files
   */
  loadAllPresentations() {
    const presentations = [];
    
    if (!fs.existsSync(this.presentationsDir)) {
      console.warn('Presentations directory not found:', this.presentationsDir);
      return presentations;
    }

    const files = fs.readdirSync(this.presentationsDir);
    
    for (const file of files) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        try {
          const filePath = path.join(this.presentationsDir, file);
          const content = fs.readFileSync(filePath, 'utf8');
          const presentation = yaml.load(content);
          presentations.push(presentation);
        } catch (error) {
          console.warn(`Failed to parse presentation file: ${file}`, error.message);
        }
      }
    }

    return presentations;
  }

  /**
   * Filter presentations based on criteria
   */
  filterPresentations(presentations, criteria) {
    let filtered = presentations;

    // Filter by specific presentation IDs
    if (criteria.presentations) {
      const ids = criteria.presentations.split(',').map(id => id.trim());
      filtered = filtered.filter(p => ids.includes(p.id));
    }

    // Filter by category
    if (criteria.category) {
      filtered = filtered.filter(p => p.category === criteria.category);
    }

    // Filter by tag
    if (criteria.tag) {
      filtered = filtered.filter(p => p.tags && p.tags.includes(criteria.tag));
    }

    // Filter by language
    if (criteria.language) {
      filtered = filtered.filter(p => p.language === criteria.language);
    }

    // Filter by status
    if (criteria.status) {
      filtered = filtered.filter(p => p.status === criteria.status);
    } else {
      // Default to published only
      filtered = filtered.filter(p => p.status === 'published');
    }

    // Filter by date range
    if (criteria.since) {
      const sinceDate = new Date(criteria.since);
      filtered = filtered.filter(p => new Date(p.date) >= sinceDate);
    }

    if (criteria.until) {
      const untilDate = new Date(criteria.until);
      filtered = filtered.filter(p => new Date(p.date) <= untilDate);
    }

    // Get recent presentations
    if (criteria.recent) {
      const count = parseInt(criteria.recent, 10);
      filtered = filtered
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, count);
    }

    return filtered;
  }

  /**
   * Create build configuration file
   */
  createBuildConfig(presentations) {
    this.buildConfig.presentations = presentations.map(p => p.id);
    this.buildConfig.mode = presentations.length === 0 ? 'all' : 'selective';

    const configPath = path.join(process.cwd(), 'build-config.json');
    fs.writeFileSync(configPath, JSON.stringify(this.buildConfig, null, 2));
    
    console.log('Build configuration created:', configPath);
    console.log(`Mode: ${this.buildConfig.mode}`);
    console.log(`Presentations to build: ${this.buildConfig.presentations.length}`);
    
    return configPath;
  }

  /**
   * Generate static site for selected presentations
   */
  buildStaticSite() {
    console.log('Building static site...');
    
    try {
      // Run Next.js build
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      console.error('❌ Build failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Clean up temporary files
   */
  cleanup() {
    const configPath = path.join(process.cwd(), 'build-config.json');
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
  }

  /**
   * Generate build statistics
   */
  generateStats(presentations, totalPresentations) {
    const stats = {
      timestamp: new Date().toISOString(),
      mode: this.buildConfig.mode,
      total_presentations: totalPresentations,
      built_presentations: presentations.length,
      presentations: presentations.map(p => ({
        id: p.id,
        title: p.title,
        category: p.category,
        language: p.language,
        slides_count: p.slides ? p.slides.length : 0
      })),
      categories: [...new Set(presentations.map(p => p.category))],
      languages: [...new Set(presentations.map(p => p.language))],
      total_slides: presentations.reduce((sum, p) => sum + (p.slides ? p.slides.length : 0), 0)
    };

    const statsPath = path.join(this.outputDir, 'build-stats.json');
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2));
    console.log('Build statistics saved:', statsPath);
    
    return stats;
  }

  /**
   * Display build summary
   */
  displaySummary(stats) {
    console.log('\n📊 Build Summary:');
    console.log(`📅 Timestamp: ${stats.timestamp}`);
    console.log(`🔧 Mode: ${stats.mode}`);
    console.log(`📚 Presentations built: ${stats.built_presentations}/${stats.total_presentations}`);
    console.log(`📄 Total slides: ${stats.total_slides}`);
    console.log(`📂 Categories: ${stats.categories.join(', ')}`);
    console.log(`🌐 Languages: ${stats.languages.join(', ')}`);
    
    if (stats.presentations.length > 0) {
      console.log('\n📋 Built presentations:');
      stats.presentations.forEach(p => {
        console.log(`  • ${p.id}: ${p.title} (${p.slides_count} slides)`);
      });
    }
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🚀 Starting selective build process...\n');
    
    try {
      // Parse command line arguments
      const criteria = this.parseArguments();
      console.log('Build criteria:', criteria);

      // Load all presentations
      const allPresentations = this.loadAllPresentations();
      console.log(`📚 Found ${allPresentations.length} total presentations`);

      if (allPresentations.length === 0) {
        console.warn('⚠️  No presentations found. Nothing to build.');
        return;
      }

      // Filter presentations based on criteria
      let selectedPresentations;
      
      if (criteria.all) {
        selectedPresentations = allPresentations;
        console.log('🔄 Building all presentations');
      } else {
        selectedPresentations = this.filterPresentations(allPresentations, criteria);
        console.log(`🎯 Selected ${selectedPresentations.length} presentations for build`);
      }

      if (selectedPresentations.length === 0) {
        console.warn('⚠️  No presentations match the specified criteria.');
        return;
      }

      // Create build configuration
      this.createBuildConfig(selectedPresentations);

      // Build static site
      this.buildStaticSite();

      // Generate statistics
      const stats = this.generateStats(selectedPresentations, allPresentations.length);

      // Display summary
      this.displaySummary(stats);

      console.log('\n✅ Selective build completed successfully!');
      
    } catch (error) {
      console.error('❌ Build process failed:', error.message);
      process.exit(1);
    } finally {
      // Clean up temporary files
      this.cleanup();
    }
  }
}

// Run the script if called directly
if (require.main === module) {
  const builder = new SelectiveBuild();
  builder.run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = SelectiveBuild;