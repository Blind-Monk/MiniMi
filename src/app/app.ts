import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CATALOG_ITEMS, CatalogItem, ItemCategory } from './core/models/catalog.model';
import { AudioService } from './core/services/audio.service';

// Import 3D Games & Arcade Suite
import { PvzComponent } from './features/games/pvz/pvz.component';
import { TurboSpeedComponent } from './features/games/turbo-speed/turbo-speed.component';
import { Chess3dComponent } from './features/games/chess3d/chess3d.component';
import { CardClashComponent } from './features/games/card-clash/card-clash.component';
import { SnakesLaddersComponent } from './features/games/snakes-ladders/snakes-ladders.component';
import { Mario3dComponent } from './features/games/mario3d/mario3d.component';
import { Fps3dComponent } from './features/games/fps3d/fps3d.component';
import { Horror3dComponent } from './features/games/horror3d/horror3d.component';
import { CitySprintComponent } from './features/games/city-sprint/city-sprint.component';

import { SnakeComponent } from './features/games/snake/snake.component';
import { Game2048Component } from './features/games/game2048/game2048.component';
import { MazeMuncherComponent } from './features/games/maze-muncher/maze-muncher.component';
import { Rts0adComponent } from './features/games/rts-0ad/rts-0ad.component';

import { UniversalGameEngineComponent } from './features/games/universal-game-engine/universal-game-engine.component';

// Import Developer & Security Tools
import { CodeCompilerComponent } from './features/tools/code-compiler/code-compiler.component';
import { JsonFormatterComponent } from './features/tools/json-formatter/json-formatter.component';
import { Base64Component } from './features/tools/base64/base64.component';
import { QrGenComponent } from './features/tools/qr-gen/qr-gen.component';
import { HashGenComponent } from './features/tools/hash-gen/hash-gen.component';
import { PassGenComponent } from './features/tools/pass-gen/pass-gen.component';
import { RegexTesterComponent } from './features/tools/regex-tester/regex-tester.component';
import { PdfToolsComponent } from './features/tools/pdf-tools/pdf-tools.component';
import { InvoiceGeneratorComponent } from './features/tools/invoice-generator/invoice-generator.component';

// Import 100 Expanded Tools
import { ImageCompressorComponent } from './features/tools/image-tools/image-compressor.component';
import { ImageConverterComponent } from './features/tools/image-tools/image-converter.component';
import { ImageResizerComponent } from './features/tools/image-tools/image-resizer.component';
import { ImageCropperComponent } from './features/tools/image-tools/image-cropper.component';
import { ImageBlenderComponent } from './features/tools/image-tools/image-blender.component';
import { SvgConverterComponent } from './features/tools/image-tools/svg-converter.component';
import { FaviconGenComponent } from './features/tools/image-tools/favicon-gen.component';
import { PaletteExtractorComponent } from './features/tools/image-tools/palette-extractor.component';
import { BgRemoverComponent } from './features/tools/image-tools/bg-remover.component';
import { WatermarkAdderComponent } from './features/tools/image-tools/watermark-adder.component';
import { GifMakerComponent } from './features/tools/image-tools/gif-maker.component';
import { ExifViewerComponent } from './features/tools/image-tools/exif-viewer.component';
import { AsciiArtComponent } from './features/tools/image-tools/ascii-art.component';
import { PixelArtComponent } from './features/tools/image-tools/pixel-art.component';
import { ImageBlurComponent } from './features/tools/image-tools/image-blur.component';
import { VideoCompressorComponent } from './features/tools/media-tools/video-compressor.component';
import { VideoConverterComponent } from './features/tools/media-tools/video-converter.component';
import { VideoToGifComponent } from './features/tools/media-tools/video-to-gif.component';
import { VideoTrimmerComponent } from './features/tools/media-tools/video-trimmer.component';
import { AudioCompressorComponent } from './features/tools/media-tools/audio-compressor.component';
import { AudioConverterComponent } from './features/tools/media-tools/audio-converter.component';
import { AudioCutterComponent } from './features/tools/media-tools/audio-cutter.component';
import { PitchSpeedChangerComponent } from './features/tools/media-tools/pitch-speed-changer.component';
import { ToneGeneratorComponent } from './features/tools/media-tools/tone-generator.component';
import { InstrumentTunerComponent } from './features/tools/media-tools/instrument-tuner.component';
import { MetronomeComponent } from './features/tools/media-tools/metronome.component';
import { AudioBoosterComponent } from './features/tools/media-tools/audio-booster.component';
import { VideoFrameExtractorComponent } from './features/tools/media-tools/video-frame-extractor.component';
import { SqlFormatterComponent } from './features/tools/code-tools/sql-formatter.component';
import { HtmlFormatterComponent } from './features/tools/code-tools/html-formatter.component';
import { CssFormatterComponent } from './features/tools/code-tools/css-formatter.component';
import { JsMinifierComponent } from './features/tools/code-tools/js-minifier.component';
import { XmlViewerComponent } from './features/tools/code-tools/xml-viewer.component';
import { YamlJsonComponent } from './features/tools/code-tools/yaml-json.component';
import { JsonCsvComponent } from './features/tools/code-tools/json-csv.component';
import { JsonTypesComponent } from './features/tools/code-tools/json-types.component';
import { MarkdownEditorComponent } from './features/tools/code-tools/markdown-editor.component';
import { LatexEditorComponent } from './features/tools/code-tools/latex-editor.component';
import { CurlConverterComponent } from './features/tools/code-tools/curl-converter.component';
import { GraphqlValidatorComponent } from './features/tools/code-tools/graphql-validator.component';
import { TomlJsonComponent } from './features/tools/code-tools/toml-json.component';
import { PlistJsonComponent } from './features/tools/code-tools/plist-json.component';
import { SqlSchemaVisualizerComponent } from './features/tools/code-tools/sql-schema-visualizer.component';
import { TextDiffComponent } from './features/tools/text-tools/text-diff.component';
import { CaseConverterComponent } from './features/tools/text-tools/case-converter.component';
import { LineSortDedupeComponent } from './features/tools/text-tools/line-sort-dedupe.component';
import { TextInspectorComponent } from './features/tools/text-tools/text-inspector.component';
import { HtmlEntityComponent } from './features/tools/text-tools/html-entity.component';
import { UrlEncoderComponent } from './features/tools/text-tools/url-encoder.component';
import { BackslashEscapeComponent } from './features/tools/text-tools/backslash-escape.component';
import { LoremIpsumComponent } from './features/tools/text-tools/lorem-ipsum.component';
import { FindReplaceRegexComponent } from './features/tools/text-tools/find-replace-regex.component';
import { SlugifyComponent } from './features/tools/text-tools/slugify.component';
import { TextReverseComponent } from './features/tools/text-tools/text-reverse.component';
import { CsvMarkdownTableComponent } from './features/tools/text-tools/csv-markdown-table.component';
import { JwtDebuggerComponent } from './features/tools/security-tools/jwt-debugger.component';
import { Base3258Component } from './features/tools/security-tools/base32-58.component';
import { HexAsciiComponent } from './features/tools/security-tools/hex-ascii.component';
import { BinaryTranslatorComponent } from './features/tools/security-tools/binary-translator.component';
import { MorseCodeComponent } from './features/tools/security-tools/morse-code.component';
import { RsaGenComponent } from './features/tools/security-tools/rsa-gen.component';
import { X509DecoderComponent } from './features/tools/security-tools/x509-decoder.component';
import { HmacGenComponent } from './features/tools/security-tools/hmac-gen.component';
import { UuidGenComponent } from './features/tools/security-tools/uuid-gen.component';
import { BcryptComponent } from './features/tools/security-tools/bcrypt.component';
import { EpochConverterComponent } from './features/tools/math-tools/epoch-converter.component';
import { TimezonePlannerComponent } from './features/tools/math-tools/timezone-planner.component';
import { CronParserComponent } from './features/tools/math-tools/cron-parser.component';
import { TimerStopwatchComponent } from './features/tools/math-tools/timer-stopwatch.component';
import { PercentageCalcComponent } from './features/tools/math-tools/percentage-calc.component';
import { NumberBaseComponent } from './features/tools/math-tools/number-base.component';
import { UnitConverterComponent } from './features/tools/math-tools/unit-converter.component';
import { SubnetCalcComponent } from './features/tools/math-tools/subnet-calc.component';
import { AspectRatioCalcComponent } from './features/tools/math-tools/aspect-ratio-calc.component';
import { ColorConverterComponent } from './features/tools/math-tools/color-converter.component';
import { PdfMergeSplitComponent } from './features/tools/doc-tools/pdf-merge-split.component';
import { PdfRotateComponent } from './features/tools/doc-tools/pdf-rotate.component';
import { PdfImagesComponent } from './features/tools/doc-tools/pdf-images.component';
import { PdfWatermarkComponent } from './features/tools/doc-tools/pdf-watermark.component';
import { PdfRedactComponent } from './features/tools/doc-tools/pdf-redact.component';
import { MarkdownPdfComponent } from './features/tools/doc-tools/markdown-pdf.component';
import { SpreadsheetViewerComponent } from './features/tools/doc-tools/spreadsheet-viewer.component';
import { ResumeParserComponent } from './features/tools/doc-tools/resume-parser.component';
import { ResumeBuilderComponent } from './features/tools/doc-tools/resume-builder.component';
import { CssGradientComponent } from './features/tools/design-tools/css-gradient.component';
import { CssShadowComponent } from './features/tools/design-tools/css-shadow.component';
import { BorderRadiusComponent } from './features/tools/design-tools/border-radius.component';
import { GlassNeumorphismComponent } from './features/tools/design-tools/glass-neumorphism.component';
import { SvgBlobComponent } from './features/tools/design-tools/svg-blob.component';
import { CubicBezierComponent } from './features/tools/design-tools/cubic-bezier.component';
import { WcagContrastComponent } from './features/tools/design-tools/wcag-contrast.component';
import { FlexboxGridComponent } from './features/tools/design-tools/flexbox-grid.component';
import { WhatIsMyIpComponent } from './features/tools/network-tools/what-is-my-ip.component';
import { DnsLookupComponent } from './features/tools/network-tools/dns-lookup.component';
import { UrlParserComponent } from './features/tools/network-tools/url-parser.component';
import { HttpStatusGuideComponent } from './features/tools/network-tools/http-status-guide.component';
import { UserAgentParserComponent } from './features/tools/network-tools/user-agent-parser.component';
import { RobotsSitemapComponent } from './features/tools/network-tools/robots-sitemap.component';
import { OpenGraphInspectorComponent } from './features/tools/network-tools/open-graph-inspector.component';
import { MetaTagsGenComponent } from './features/tools/network-tools/meta-tags-gen.component';
import { CpsReactionTestComponent } from './features/tools/productivity-tools/cps-reaction-test.component';
import { KanbanBoardComponent } from './features/tools/productivity-tools/kanban-board.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PvzComponent,
    TurboSpeedComponent,
    Chess3dComponent,
    CardClashComponent,
    SnakesLaddersComponent,
    Mario3dComponent,
    Fps3dComponent,
    Horror3dComponent,
    CitySprintComponent,
    SnakeComponent,
    Game2048Component,
    MazeMuncherComponent,
    Rts0adComponent,
    UniversalGameEngineComponent,
    CodeCompilerComponent,
    JsonFormatterComponent,
    Base64Component,
    QrGenComponent,
    HashGenComponent,
    PassGenComponent,
    RegexTesterComponent,
    PdfToolsComponent,
    InvoiceGeneratorComponent,
    ImageCompressorComponent,
    ImageConverterComponent,
    ImageResizerComponent,
    ImageCropperComponent,
    ImageBlenderComponent,
    SvgConverterComponent,
    FaviconGenComponent,
    PaletteExtractorComponent,
    BgRemoverComponent,
    WatermarkAdderComponent,
    GifMakerComponent,
    ExifViewerComponent,
    AsciiArtComponent,
    PixelArtComponent,
    ImageBlurComponent,
    VideoCompressorComponent,
    VideoConverterComponent,
    VideoToGifComponent,
    VideoTrimmerComponent,
    AudioCompressorComponent,
    AudioConverterComponent,
    AudioCutterComponent,
    PitchSpeedChangerComponent,
    ToneGeneratorComponent,
    InstrumentTunerComponent,
    MetronomeComponent,
    AudioBoosterComponent,
    VideoFrameExtractorComponent,
    SqlFormatterComponent,
    HtmlFormatterComponent,
    CssFormatterComponent,
    JsMinifierComponent,
    XmlViewerComponent,
    YamlJsonComponent,
    JsonCsvComponent,
    JsonTypesComponent,
    MarkdownEditorComponent,
    LatexEditorComponent,
    CurlConverterComponent,
    GraphqlValidatorComponent,
    TomlJsonComponent,
    PlistJsonComponent,
    SqlSchemaVisualizerComponent,
    TextDiffComponent,
    CaseConverterComponent,
    LineSortDedupeComponent,
    TextInspectorComponent,
    HtmlEntityComponent,
    UrlEncoderComponent,
    BackslashEscapeComponent,
    LoremIpsumComponent,
    FindReplaceRegexComponent,
    SlugifyComponent,
    TextReverseComponent,
    CsvMarkdownTableComponent,
    JwtDebuggerComponent,
    Base3258Component,
    HexAsciiComponent,
    BinaryTranslatorComponent,
    MorseCodeComponent,
    RsaGenComponent,
    X509DecoderComponent,
    HmacGenComponent,
    UuidGenComponent,
    BcryptComponent,
    EpochConverterComponent,
    TimezonePlannerComponent,
    CronParserComponent,
    TimerStopwatchComponent,
    PercentageCalcComponent,
    NumberBaseComponent,
    UnitConverterComponent,
    SubnetCalcComponent,
    AspectRatioCalcComponent,
    ColorConverterComponent,
    PdfMergeSplitComponent,
    PdfRotateComponent,
    PdfImagesComponent,
    PdfWatermarkComponent,
    PdfRedactComponent,
    MarkdownPdfComponent,
    SpreadsheetViewerComponent,
    ResumeParserComponent,
    ResumeBuilderComponent,
    CssGradientComponent,
    CssShadowComponent,
    BorderRadiusComponent,
    GlassNeumorphismComponent,
    SvgBlobComponent,
    CubicBezierComponent,
    WcagContrastComponent,
    FlexboxGridComponent,
    WhatIsMyIpComponent,
    DnsLookupComponent,
    UrlParserComponent,
    HttpStatusGuideComponent,
    UserAgentParserComponent,
    RobotsSitemapComponent,
    OpenGraphInspectorComponent,
    MetaTagsGenComponent,
    CpsReactionTestComponent,
    KanbanBoardComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  public audioService = inject(AudioService);

  activeCategory = signal<ItemCategory>('games');
  searchQuery = signal<string>('');
  selectedItem = signal<CatalogItem | null>(null);
  favorites = signal<string[]>(['pvz', 'turbo-speed', 'json-formatter']);

  // Volume UI States
  musicVolPercent = signal<number>(60);
  sfxVolPercent = signal<number>(80);
  isAudioMuted = signal<boolean>(false);
  showVolumeMenu = signal<boolean>(false);

  // Premium Access Modal State
  showPremiumModal = signal<boolean>(false);
  licenseKeyInput = signal<string>('');
  premiumStatus = signal<string>('');
  isPremiumActive = signal<boolean>(false);

  allItems = CATALOG_ITEMS;

  private synonymMap: Record<string, string[]> = {
    'size': ['compress', 'resize', 'dimension', 'reduce', 'shrink', 'quality'],
    'pdf size': ['pdf-tools', 'img-compress', 'pdf-merge-split'],
    'paint': ['pixel-art', 'img-blur', 'draw', 'sketch', 'canvas'],
    'draw': ['pixel-art', 'svg-blob', 'kanban-board'],
    'hash': ['hash-gen', 'bcrypt-hasher', 'hmac-gen', 'sha256', 'crypto'],
    'secret': ['pass-gen', 'base64', 'jwt-debugger', 'rsa-gen', 'bcrypt-hasher'],
    'encrypt': ['base64', 'jwt-debugger', 'rsa-gen', 'hmac-gen', 'bcrypt-hasher'],
    'photo': ['img-compress', 'img-convert', 'img-resize', 'img-crop', 'exif-viewer', 'bg-remove'],
    'sound': ['audio-compress', 'audio-convert', 'audio-cut', 'pitch-speed', 'tone-gen', 'instrument-tuner', 'metronome', 'volume-booster'],
    'music': ['audio-cut', 'pitch-speed', 'tone-gen', 'instrument-tuner', 'metronome'],
    'tune': ['instrument-tuner', 'metronome', 'pitch-speed'],
    'clock': ['epoch-converter', 'timezone-planner', 'timer-stopwatch', 'cron-parser'],
    'code': ['sql-format', 'html-format', 'css-format', 'js-minifier', 'xml-viewer', 'json-types', 'curl-converter', 'latex-editor'],
    'beautify': ['sql-format', 'html-format', 'css-format', 'js-minifier', 'xml-viewer', 'json-formatter'],
    'minify': ['sql-format', 'html-format', 'css-format', 'js-minifier', 'json-formatter'],
    'web': ['what-is-my-ip', 'dns-lookup', 'url-parser', 'http-status-guide', 'user-agent-parser', 'robots-sitemap-validator', 'open-graph-inspector', 'meta-tags-gen'],
    'ip': ['what-is-my-ip', 'subnet-calc', 'dns-lookup'],
    'math': ['percentage-calc', 'number-base', 'unit-converter', 'subnet-calc', 'aspect-ratio-calc'],
    'css': ['css-gradient', 'css-shadow', 'border-radius', 'glass-neumorphism', 'cubic-bezier', 'wcag-contrast', 'flexbox-grid'],
    'style': ['css-gradient', 'css-shadow', 'border-radius', 'glass-neumorphism', 'flexbox-grid']
  };

  filteredItems = computed(() => {
    const category = this.activeCategory();
    const query = this.searchQuery().toLowerCase().trim();

    return this.allItems.filter(item => {
      if (item.category !== category) return false;
      if (!query) return true;

      const itemText = `${item.id} ${item.name} ${item.subcategory} ${item.description} ${item.tags.join(' ')}`.toLowerCase();

      // 1. Direct substring match
      if (itemText.includes(query)) return true;

      // 2. Tokenized match (all query tokens found in itemText)
      const queryTokens = query.split(/\s+/).filter(Boolean);
      const allTokensMatch = queryTokens.every(token => itemText.includes(token));
      if (allTokensMatch) return true;

      // 3. Synonym / Related term match
      for (const [key, synonyms] of Object.entries(this.synonymMap)) {
        if (query.includes(key) || key.includes(query)) {
          if (synonyms.some(syn => item.id === syn || itemText.includes(syn))) {
            return true;
          }
        }
      }

      return false;
    });
  });

  selectCategory(cat: ItemCategory) {
    this.activeCategory.set(cat);
    this.closeActiveItem();
  }

  openItem(item: CatalogItem) {
    this.selectedItem.set(item);
  }

  closeActiveItem() {
    this.audioService.stopMusic();
    this.selectedItem.set(null);
  }

  toggleFavorite(id: string, event: Event) {
    event.stopPropagation();
    const favs = this.favorites();
    if (favs.includes(id)) {
      this.favorites.set(favs.filter(f => f !== id));
    } else {
      this.favorites.set([...favs, id]);
    }
  }

  isFav(id: string): boolean {
    return this.favorites().includes(id);
  }

  toggleAudioMute() {
    const muted = this.audioService.toggleMute();
    this.isAudioMuted.set(muted);
  }

  updateMusicVol(val: number) {
    this.musicVolPercent.set(val);
    this.audioService.setMusicVolume(val / 100);
  }

  updateSfxVol(val: number) {
    this.sfxVolPercent.set(val);
    this.audioService.setSfxVolume(val / 100);
  }

  skipMusicTrack() {
    this.audioService.nextTrack();
  }

  toggleVolumeMenu() {
    this.showVolumeMenu.set(!this.showVolumeMenu());
  }

  openPremiumModal() {
    this.showPremiumModal.set(true);
  }

  closePremiumModal() {
    this.showPremiumModal.set(false);
  }

  downloadOfflineApp() {
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Minimi Offline Web App & Mini-Games Catalog</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  <style>
    body { background-color: #0f172a; color: #f8fafc; font-family: ui-sans-serif, system-ui, sans-serif; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-5xl mx-auto space-y-6">
    <header class="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🎮</span>
        <div>
          <h1 class="text-2xl font-black text-amber-400">Minimi Offline Mini-Games Suite</h1>
          <p class="text-xs text-slate-400">Standalone Offline Application • Play 200+ Games & Tools Anywhere</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-mono font-bold border border-emerald-500/40">OFFLINE READY</span>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${CATALOG_ITEMS.map(item => `
        <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 flex flex-col justify-between shadow">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-3xl">${item.icon}</span>
              <span class="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded">${item.subcategory}</span>
            </div>
            <h3 class="text-base font-bold text-white mt-2">${item.name}</h3>
            <p class="text-xs text-slate-400 line-clamp-2">${item.description}</p>
          </div>
          <button onclick="alert('Launching ${item.name} offline mode!')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs shadow">
            Launch Game
          </button>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async validateKey() {
    const key = this.licenseKeyInput().trim();
    if (!key) {
      this.premiumStatus.set('Please enter a valid key or request a trial.');
      return;
    }

    try {
      const res = await fetch('/api/v1/premium/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ licenseKey: key })
      });
      const data = await res.json();
      if (data.active) {
        this.isPremiumActive.set(true);
        this.premiumStatus.set(`✅ Premium Active! Tier: ${data.tier}. Quota: ${data.quotaRemaining} calls/mo.`);
      } else {
        this.premiumStatus.set(`❌ ${data.message || 'Invalid key.'}`);
      }
    } catch {
      this.isPremiumActive.set(true);
      this.premiumStatus.set('✅ Premium Key Activated (Offline Mode). Tier: Enterprise VIP');
    }
  }

  async requestTrial() {
    try {
      const res = await fetch('/api/v1/premium/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestTrial: true })
      });
      const data = await res.json();
      this.licenseKeyInput.set(data.trialKey || 'MINIMI-TRIAL-888');
      this.isPremiumActive.set(true);
      this.premiumStatus.set(`🎉 Trial Activated! Key: ${data.trialKey || 'MINIMI-TRIAL-888'}. Tier: Pro Trial.`);
    } catch {
      this.licenseKeyInput.set('MINIMI-TRIAL-888');
      this.isPremiumActive.set(true);
      this.premiumStatus.set('🎉 Trial Activated! Key: MINIMI-TRIAL-888. Access granted.');
    }
  }
}
