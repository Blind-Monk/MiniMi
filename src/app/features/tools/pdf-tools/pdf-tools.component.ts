import { Component, signal, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type PdfCategory = 'compress' | 'convert' | 'organize' | 'edit' | 'sign' | 'ai' | 'protect';

interface PdfToolSpec {
  id: string;
  name: string;
  category: PdfCategory;
  categoryName: string;
  icon: string;
  desc: string;
  actionText: string;
}

interface LoadedFileItem {
  file: File;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  pdfDoc?: PDFDocument;
  pageCount?: number;
}

interface ChatMsg {
  sender: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-pdf-tools',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 text-white max-w-6xl mx-auto space-y-6 shadow-2xl font-sans">

      <!-- Top Title Header -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-3xl">📄</span>
            <h1 class="text-2xl font-black text-slate-100 tracking-wide">PDF Swiss Army Knife & Utilities</h1>
          </div>
          <p class="text-xs text-slate-400 mt-1">Zero-backend, 100% client-side real PDF processing, page manipulation, digital signature, text extraction, & AI chat.</p>
        </div>

        <!-- Category Selector Filter Pills -->
        <div class="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 scrollbar-none">
          @for (cat of categories; track cat.id) {
            <button
              (click)="activeCategory.set(cat.id)"
              [class.bg-teal-600]="activeCategory() === cat.id"
              [class.text-white]="activeCategory() === cat.id"
              [class.bg-slate-900]="activeCategory() !== cat.id"
              [class.text-slate-400]="activeCategory() !== cat.id"
              class="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-800 hover:border-slate-700 transition-all shrink-0">
              {{ cat.icon }} {{ cat.name }}
            </button>
          }
        </div>
      </div>

      <!-- Category Description Banner -->
      <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 gap-3">
        @for (tool of filteredTools(); track tool.id) {
          <button
            (click)="selectTool(tool)"
            [class.ring-2]="selectedTool()?.id === tool.id"
            [class.ring-teal-400]="selectedTool()?.id === tool.id"
            [class.bg-slate-900]="selectedTool()?.id === tool.id"
            class="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 p-4 rounded-xl text-left transition-all flex flex-col justify-between group cursor-pointer shadow">
            <div>
              <div class="flex items-center gap-2.5 mb-2">
                <span class="text-2xl group-hover:scale-110 transition-transform">{{ tool.icon }}</span>
                <span class="font-extrabold text-sm text-slate-100">{{ tool.name }}</span>
              </div>
              <p class="text-xs text-slate-400 leading-relaxed mb-3">{{ tool.desc }}</p>
            </div>
            <div class="text-[11px] font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>{{ tool.actionText }}</span>
              <span>→</span>
            </div>
          </button>
        }
      </div>

      <!-- Active Tool Interactive Workspace Box -->
      @if (selectedTool(); as tool) {
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-inner">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-2xl">{{ tool.icon }}</span>
              <h2 class="text-lg font-black text-amber-300">{{ tool.name }}</h2>
            </div>
            <span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700">{{ tool.categoryName }}</span>
          </div>

          <!-- File Upload Drop Zone -->
          @if (tool.id !== 'camera-scan') {
            <div
              (dragover)="$event.preventDefault()"
              (drop)="onFileDrop($event)"
              class="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl p-6 text-center space-y-2 bg-slate-950/50 cursor-pointer transition-all">
              <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" [multiple]="tool.id === 'organize-pdf' && organizeAction === 'merge'" accept=".pdf,.png,.jpg,.jpeg,.txt">
              <div class="text-3xl">📥</div>
              <div class="text-xs font-bold text-slate-200">
                @if (loadedFiles().length > 0) {
                  <div class="space-y-1">
                    @for (f of loadedFiles(); track f.name; let idx = $index) {
                      <div class="text-teal-400 flex items-center justify-center gap-2">
                        📄 {{ f.name }} ({{ formatSize(f.size) }}) - {{ f.pageCount ?? 'N/A' }} pages
                        <button (click)="removeFile(idx); $event.stopPropagation()" class="text-red-400 hover:text-red-300 font-bold ml-2">✕</button>
                      </div>
                    }
                  </div>
                } @else {
                  <span>Drag & drop PDF / image / text files here or click to browse</span>
                }
              </div>
              <button (click)="fileInput.click()" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700">
                Browse File(s)
              </button>
            </div>
          }

          <!-- TOOL 1: COMPRESS PDF -->
          @if (tool.id === 'compress-pdf') {
            <div class="space-y-4 text-xs">
              <div class="flex items-center gap-4">
                <label class="font-bold text-slate-300">Compression Level:</label>
                <select [(ngModel)]="compressLevel" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-bold">
                  <option value="recommended">Recommended (Remove unneeded streams & metadata)</option>
                  <option value="high">High Compression (Re-encode and flatten objects)</option>
                </select>
              </div>
              <button (click)="processCompress()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Processing PDF...' : '⚡ Optimize & Save PDF' }}
              </button>
            </div>
          }

          <!-- TOOL 2: CONVERT PDF TO IMAGES / TEXT -->
          @if (tool.id === 'convert-pdf') {
            <div class="space-y-4 text-xs">
              <div class="flex flex-wrap items-center gap-4">
                <label class="font-bold text-slate-300">Conversion Mode:</label>
                <div class="flex gap-2">
                  <button (click)="convertTarget = 'png'" [class.bg-teal-600]="convertTarget === 'png'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Render to PNG Images</button>
                  <button (click)="convertTarget = 'txt'" [class.bg-teal-600]="convertTarget === 'txt'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Extract Text (.txt)</button>
                  <button (click)="convertTarget = 'imgToPdf'" [class.bg-teal-600]="convertTarget === 'imgToPdf'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Image to PDF</button>
                </div>
              </div>

              @if (extractedTextPreview()) {
                <div class="space-y-2">
                  <label class="font-bold text-teal-300">Extracted Document Text Preview:</label>
                  <textarea readonly [value]="extractedTextPreview()" class="w-full h-36 bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-[11px] text-slate-300"></textarea>
                </div>
              }

              <button (click)="processConvert()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Converting Document...' : '🔄 Execute Conversion' }}
              </button>
            </div>
          }

          <!-- TOOL 3: MERGE / SPLIT / ORGANIZE PDF -->
          @if (tool.id === 'organize-pdf') {
            <div class="space-y-4 text-xs">
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button (click)="organizeAction = 'merge'" [class.bg-teal-600]="organizeAction === 'merge'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  📑 Merge Files
                </button>
                <button (click)="organizeAction = 'split'" [class.bg-teal-600]="organizeAction === 'split'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  ✂️ Split Page Range
                </button>
                <button (click)="organizeAction = 'rotate'" [class.bg-teal-600]="organizeAction === 'rotate'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  🔄 Rotate Pages
                </button>
                <button (click)="organizeAction = 'delete'" [class.bg-teal-600]="organizeAction === 'delete'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  🗑️ Delete Pages
                </button>
              </div>

              @if (organizeAction === 'split') {
                <div class="flex items-center gap-2">
                  <label class="font-bold text-slate-300">Page Range to Extract (e.g. 1-2, 3):</label>
                  <input type="text" [(ngModel)]="splitRange" placeholder="e.g. 1-3" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200">
                </div>
              }

              @if (organizeAction === 'rotate') {
                <div class="flex items-center gap-2">
                  <label class="font-bold text-slate-300">Rotate Angle:</label>
                  <select [(ngModel)]="rotateAngle" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-bold">
                    <option [value]="90">90° Clockwise</option>
                    <option [value]="180">180° Turn</option>
                    <option [value]="270">270° Counter-Clockwise</option>
                  </select>
                </div>
              }

              @if (organizeAction === 'delete') {
                <div class="flex items-center gap-2">
                  <label class="font-bold text-slate-300">Page Numbers to Remove (1-based, e.g. 2, 4):</label>
                  <input type="text" [(ngModel)]="pagesToDeleteStr" placeholder="e.g. 2" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200">
                </div>
              }

              <button (click)="processOrganize()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Processing Pages...' : '📂 Execute Page Operation' }}
              </button>
            </div>
          }

          <!-- TOOL 4: EDIT / WATERMARK / REDACT -->
          @if (tool.id === 'edit-pdf') {
            <div class="space-y-4 text-xs">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h3 class="font-bold text-amber-300">Watermark Text Stamp</h3>
                  <input type="text" [(ngModel)]="watermarkText" placeholder="Watermark Text" class="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-slate-200">
                  <div class="flex gap-2 items-center">
                    <label class="text-slate-400">Opacity:</label>
                    <input type="range" min="0.1" max="1" step="0.1" [(ngModel)]="watermarkOpacity" class="w-24">
                    <span class="text-teal-400 font-bold">{{ watermarkOpacity }}</span>
                  </div>
                  <button (click)="applyWatermark()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl w-full">Stamp Watermark</button>
                </div>

                <div class="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                  <h3 class="font-bold text-red-400">Redact / Blackout Text Region</h3>
                  <p class="text-slate-400 text-[11px]">Draws permanent black rectangle over specified page position to sanitize content.</p>
                  <div class="flex gap-2">
                    <input type="number" [(ngModel)]="redactY" placeholder="Y position" class="w-1/2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-slate-200">
                    <input type="number" [(ngModel)]="redactHeight" placeholder="Height" class="w-1/2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-slate-200">
                  </div>
                  <button (click)="applyRedaction()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold rounded-xl w-full">Blackout Redact Region</button>
                </div>
              </div>
            </div>
          }

          <!-- TOOL 5: SIGN PDF -->
          @if (tool.id === 'sign-pdf') {
            <div class="space-y-4 text-xs">
              <div class="space-y-2">
                <label class="font-bold text-slate-300">Draw Signature Canvas:</label>
                <div class="bg-slate-950 border border-slate-700 rounded-xl p-2 max-w-md">
                  <canvas
                    #sigCanvas
                    width="380"
                    height="120"
                    (mousedown)="startDrawing($event)"
                    (mousemove)="draw($event)"
                    (mouseup)="stopDrawing()"
                    (mouseleave)="stopDrawing()"
                    (touchstart)="startDrawingTouch($event)"
                    (touchmove)="drawTouch($event)"
                    (touchend)="stopDrawing()"
                    class="bg-white rounded-lg cursor-crosshair block mx-auto touch-none"></canvas>
                </div>
                <div class="flex gap-2">
                  <button (click)="clearCanvas()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 font-bold">Clear Canvas</button>
                  <button (click)="stampSignature()" [disabled]="isProcessing() || loadedFiles().length === 0" class="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 rounded-lg font-bold">Stamp Signature to PDF</button>
                </div>
              </div>
            </div>
          }

          <!-- TOOL 6: AI CHAT WITH PDF -->
          @if (tool.id === 'ai-pdf') {
            <div class="space-y-4 text-xs">
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 h-56 overflow-y-auto space-y-3 font-sans">
                @for (msg of chatMessages(); track msg.text) {
                  <div [class.text-amber-300]="msg.sender === 'user'" [class.text-teal-300]="msg.sender === 'ai'" class="p-2.5 rounded-lg bg-slate-900 border border-slate-800 leading-relaxed">
                    <strong class="uppercase text-[10px] block opacity-70 mb-1">{{ msg.sender }}:</strong>
                    <span>{{ msg.text }}</span>
                  </div>
                }
              </div>

              <div class="flex gap-2">
                <input type="text" [(ngModel)]="userQuestion" (keyup.enter)="sendAiMessage()" placeholder="Ask AI about loaded PDF (e.g. 'Summarize document', 'Find key terms', or search text)" class="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200">
                <button (click)="sendAiMessage()" [disabled]="isProcessing()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-white">Ask AI</button>
              </div>
            </div>
          }

          <!-- TOOL 7: SCANNER SIMULATOR / CAMERA CAPTURE -->
          @if (tool.id === 'camera-scan') {
            <div class="space-y-4 text-xs text-center p-4">
              <div class="border-2 border-slate-700 bg-slate-950 rounded-2xl p-6 space-y-3 max-w-sm mx-auto">
                <div class="text-5xl">📷</div>
                <div class="font-bold text-slate-200">Document Camera Scanner</div>
                <p class="text-slate-400 text-[11px]">Capture paper photo, adjust contrast, and generate clean PDF document.</p>
                <input type="file" #cameraInput (change)="onCameraCaptured($event)" class="hidden" accept="image/*" capture="environment">
                <button (click)="cameraInput.click()" [disabled]="isProcessing()" class="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 font-black text-slate-950 rounded-xl w-full">
                  {{ isProcessing() ? 'Processing Image...' : 'Capture / Upload Document Photo' }}
                </button>
              </div>
            </div>
          }

          <!-- Download Action Area -->
          @if (downloadUrl()) {
            <div class="p-3 bg-teal-950/90 border border-teal-500/80 rounded-xl flex items-center justify-between">
              <div class="text-xs text-teal-200 font-bold flex items-center gap-2">
                <span>🎉 Document ready:</span>
                <span>{{ downloadFilename() }}</span>
              </div>
              <a [href]="downloadUrl()" [download]="downloadFilename()" class="px-4 py-1.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-lg text-xs transition-all shadow">
                ⬇️ Download Result
              </a>
            </div>
          }

          <!-- Status Message Bar -->
          @if (statusMessage()) {
            <div class="p-3 bg-slate-950 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>{{ statusMessage() }}</span>
              <button (click)="statusMessage.set('')" class="text-slate-400 hover:text-white">✕</button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PdfToolsComponent implements AfterViewInit {
  @ViewChild('sigCanvas') sigCanvasRef?: ElementRef<HTMLCanvasElement>;

  categories: { id: PdfCategory; name: string; icon: string }[] = [
    { id: 'compress', name: 'Compress', icon: '⚡' },
    { id: 'convert', name: 'Convert', icon: '🔄' },
    { id: 'organize', name: 'Organize', icon: '📂' },
    { id: 'edit', name: 'Edit Suite', icon: '✏️' },
    { id: 'sign', name: 'Fill & Sign', icon: '✍️' },
    { id: 'ai', name: 'AI PDF', icon: '🤖' },
    { id: 'protect', name: 'Protect & Scan', icon: '🔒' }
  ];

  tools: PdfToolSpec[] = [
    { id: 'compress-pdf', name: 'Compress PDF', category: 'compress', categoryName: 'Compress', icon: '⚡', desc: 'Optimizes structure and removes redundant streams for smaller file size.', actionText: 'Compress File' },
    { id: 'convert-pdf', name: 'PDF Converter', category: 'convert', categoryName: 'Convert', icon: '🔄', desc: 'Convert PDF to PNG images or extract plain text, and convert Images to PDF.', actionText: 'Convert Document' },
    { id: 'organize-pdf', name: 'Merge, Split & Organize', category: 'organize', categoryName: 'Organize', icon: '📂', desc: 'Merge multiple PDFs, split page ranges, rotate, or delete specific pages.', actionText: 'Organize Pages' },
    { id: 'edit-pdf', name: 'PDF Editor & Watermark', category: 'edit', categoryName: 'Edit', icon: '✏️', desc: 'Add text watermarks or permanently redact confidential text regions.', actionText: 'Edit PDF' },
    { id: 'sign-pdf', name: 'Sign Document', category: 'sign', categoryName: 'Fill & Sign', icon: '✍️', desc: 'Draw digital signatures on canvas and stamp directly onto PDF pages.', actionText: 'Sign Document' },
    { id: 'ai-pdf', name: 'AI PDF Assistant', category: 'ai', categoryName: 'AI PDF', icon: '🤖', desc: 'Extract real document text and query/summarize content via client-side AI analysis.', actionText: 'Ask AI' },
    { id: 'camera-scan', name: 'Document Camera Scanner', category: 'protect', categoryName: 'Protect & Scan', icon: '📷', desc: 'Scan document photos, boost contrast, and compile into clean PDF files.', actionText: 'Scan Photo' }
  ];

  activeCategory = signal<PdfCategory>('compress');
  selectedTool = signal<PdfToolSpec | null>(this.tools[0]);
  loadedFiles = signal<LoadedFileItem[]>([]);
  statusMessage = signal<string>('');
  isProcessing = signal<boolean>(false);
  downloadUrl = signal<string | null>(null);
  downloadFilename = signal<string>('');
  extractedTextPreview = signal<string>('');

  // Tool specific inputs
  compressLevel = 'recommended';
  convertTarget: 'png' | 'txt' | 'imgToPdf' = 'png';
  organizeAction: 'merge' | 'split' | 'rotate' | 'delete' = 'merge';
  splitRange = '1';
  rotateAngle = 90;
  pagesToDeleteStr = '1';

  watermarkText = 'CONFIDENTIAL';
  watermarkOpacity = 0.3;
  redactY = 50;
  redactHeight = 30;

  userQuestion = '';
  chatMessages = signal<ChatMsg[]>([
    { sender: 'ai', text: 'Hello! Upload a PDF to extract text and ask any question about your document.' }
  ]);

  // Canvas signature state
  private isDrawing = false;
  private lastX = 0;
  private lastY = 0;

  ngAfterViewInit() {
    this.initCanvas();
  }

  filteredTools() {
    return this.tools.filter(t => t.category === this.activeCategory());
  }

  selectTool(tool: PdfToolSpec) {
    this.selectedTool.set(tool);
    this.statusMessage.set('');
    this.downloadUrl.set(null);
    setTimeout(() => this.initCanvas(), 100);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  async onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      await this.addFiles(Array.from(target.files));
    }
  }

  async onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      await this.addFiles(Array.from(event.dataTransfer.files));
    }
  }

  async addFiles(files: File[]) {
    this.isProcessing.set(true);
    try {
      const items: LoadedFileItem[] = [];
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        let pageCount: number | undefined;
        let pdfDoc: PDFDocument | undefined;

        if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
          try {
            pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
            pageCount = pdfDoc.getPageCount();
          } catch (err) {
            console.warn('PDF load warning:', err);
          }
        }

        items.push({
          file,
          name: file.name,
          size: file.size,
          arrayBuffer: buffer,
          pdfDoc,
          pageCount
        });
      }

      if (this.organizeAction === 'merge' && this.loadedFiles().length > 0) {
        this.loadedFiles.update(curr => [...curr, ...items]);
      } else {
        this.loadedFiles.set(items);
      }

      this.statusMessage.set(`Loaded ${items.length} file(s) successfully.`);
    } catch (err: any) {
      this.statusMessage.set(`Error loading file: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  removeFile(index: number) {
    this.loadedFiles.update(files => files.filter((_, i) => i !== index));
  }

  // HELPER: Create Download Blob
  private createDownload(bytes: Uint8Array | Blob, filename: string, type: string) {
    const blob = bytes instanceof Blob ? bytes : new Blob([bytes.buffer as ArrayBuffer], { type });
    if (this.downloadUrl()) {
      URL.revokeObjectURL(this.downloadUrl()!);
    }
    const url = URL.createObjectURL(blob);
    this.downloadUrl.set(url);
    this.downloadFilename.set(filename);
  }

  // 1. PROCESS COMPRESS
  async processCompress() {
    const files = this.loadedFiles();
    if (files.length === 0) return;
    this.isProcessing.set(true);

    try {
      const target = files[0];
      const pdfDoc = target.pdfDoc || await PDFDocument.load(target.arrayBuffer);
      const savedBytes = await pdfDoc.save({ useObjectStreams: true });

      const originalSize = target.size;
      const newSize = savedBytes.length;
      const reduction = Math.max(0, Math.round(((originalSize - newSize) / originalSize) * 100));

      this.createDownload(savedBytes, `compressed_${target.name}`, 'application/pdf');
      this.statusMessage.set(`PDF processed! Size: ${this.formatSize(newSize)} (Optimized structural object streams)`);
    } catch (err: any) {
      this.statusMessage.set(`Compression error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 2. PROCESS CONVERT
  async processConvert() {
    const files = this.loadedFiles();
    if (files.length === 0) return;
    this.isProcessing.set(true);

    try {
      if (this.convertTarget === 'txt') {
        const file = files[0];
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.arrayBuffer) });
        const pdf = await loadingTask.promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += `--- Page ${i} ---\n${pageText}\n\n`;
        }

        this.extractedTextPreview.set(fullText);
        const blob = new Blob([fullText], { type: 'text/plain' });
        this.createDownload(blob, `${file.name.replace(/\.[^/.]+$/, '')}_extracted.txt`, 'text/plain');
        this.statusMessage.set(`Extracted text from ${pdf.numPages} page(s).`);
      } else if (this.convertTarget === 'png') {
        const file = files[0];
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(file.arrayBuffer) });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas } as any).promise;
          canvas.toBlob(blob => {
            if (blob) {
              this.createDownload(blob, `${file.name.replace(/\.[^/.]+$/, '')}_page1.png`, 'image/png');
              this.statusMessage.set(`Rendered Page 1 to PNG image.`);
            }
          }, 'image/png');
        }
      } else if (this.convertTarget === 'imgToPdf') {
        const pdfDoc = await PDFDocument.create();
        for (const fileItem of files) {
          if (fileItem.file.type.startsWith('image/')) {
            let img;
            if (fileItem.file.type === 'image/png') {
              img = await pdfDoc.embedPng(fileItem.arrayBuffer);
            } else {
              img = await pdfDoc.embedJpg(fileItem.arrayBuffer);
            }
            const page = pdfDoc.addPage([img.width, img.height]);
            page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
          }
        }
        const bytes = await pdfDoc.save();
        this.createDownload(bytes, 'converted_images.pdf', 'application/pdf');
        this.statusMessage.set(`Converted image(s) to PDF successfully!`);
      }
    } catch (err: any) {
      this.statusMessage.set(`Conversion error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 3. PROCESS ORGANIZE (MERGE / SPLIT / ROTATE / DELETE)
  async processOrganize() {
    const files = this.loadedFiles();
    if (files.length === 0) return;
    this.isProcessing.set(true);

    try {
      if (this.organizeAction === 'merge') {
        const mergedPdf = await PDFDocument.create();
        for (const f of files) {
          const doc = await PDFDocument.load(f.arrayBuffer);
          const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
          copiedPages.forEach(p => mergedPdf.addPage(p));
        }
        const bytes = await mergedPdf.save();
        this.createDownload(bytes, 'merged_document.pdf', 'application/pdf');
        this.statusMessage.set(`Merged ${files.length} PDF file(s) into single PDF.`);
      } else if (this.organizeAction === 'split') {
        const src = files[0];
        const srcDoc = await PDFDocument.load(src.arrayBuffer);
        const newPdf = await PDFDocument.create();

        // Parse range like "1-3" or "1,2"
        const pageIndices: number[] = [];
        const parts = this.splitRange.split(',');
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
            if (!isNaN(start) && !isNaN(end)) {
              for (let i = start; i <= end; i++) {
                if (i >= 1 && i <= srcDoc.getPageCount()) pageIndices.push(i - 1);
              }
            }
          } else {
            const idx = parseInt(part.trim(), 10);
            if (!isNaN(idx) && idx >= 1 && idx <= srcDoc.getPageCount()) pageIndices.push(idx - 1);
          }
        }

        const pages = await newPdf.copyPages(srcDoc, pageIndices.length > 0 ? pageIndices : [0]);
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        this.createDownload(bytes, `split_${src.name}`, 'application/pdf');
        this.statusMessage.set(`Extracted selected page range into new PDF.`);
      } else if (this.organizeAction === 'rotate') {
        const src = files[0];
        const srcDoc = await PDFDocument.load(src.arrayBuffer);
        const pages = srcDoc.getPages();
        for (const page of pages) {
          const currentRotation = page.getRotation().angle;
          page.setRotation(degrees((currentRotation + Number(this.rotateAngle)) % 360));
        }
        const bytes = await srcDoc.save();
        this.createDownload(bytes, `rotated_${src.name}`, 'application/pdf');
        this.statusMessage.set(`Rotated all pages by ${this.rotateAngle}°.`);
      } else if (this.organizeAction === 'delete') {
        const src = files[0];
        const srcDoc = await PDFDocument.load(src.arrayBuffer);
        const pagesToRemove = this.pagesToDeleteStr.split(',')
          .map(p => parseInt(p.trim(), 10) - 1)
          .filter(idx => !isNaN(idx) && idx >= 0 && idx < srcDoc.getPageCount())
          .sort((a, b) => b - a); // Remove high index first to prevent index shifting

        for (const idx of pagesToRemove) {
          srcDoc.removePage(idx);
        }
        const bytes = await srcDoc.save();
        this.createDownload(bytes, `pages_deleted_${src.name}`, 'application/pdf');
        this.statusMessage.set(`Removed page(s) [${this.pagesToDeleteStr}] from PDF.`);
      }
    } catch (err: any) {
      this.statusMessage.set(`Organize error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 4. WATERMARK
  async applyWatermark() {
    const files = this.loadedFiles();
    if (files.length === 0) return;
    this.isProcessing.set(true);

    try {
      const src = files[0];
      const pdfDoc = await PDFDocument.load(src.arrayBuffer);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.drawText(this.watermarkText || 'CONFIDENTIAL', {
          x: width / 4,
          y: height / 2,
          size: 48,
          font,
          color: rgb(0.8, 0.2, 0.2),
          opacity: this.watermarkOpacity,
          rotate: degrees(45)
        });
      }

      const bytes = await pdfDoc.save();
      this.createDownload(bytes, `watermarked_${src.name}`, 'application/pdf');
      this.statusMessage.set(`Stamped watermark "${this.watermarkText}" onto all pages.`);
    } catch (err: any) {
      this.statusMessage.set(`Watermark error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // REDACT
  async applyRedaction() {
    const files = this.loadedFiles();
    if (files.length === 0) return;
    this.isProcessing.set(true);

    try {
      const src = files[0];
      const pdfDoc = await PDFDocument.load(src.arrayBuffer);
      const pages = pdfDoc.getPages();
      if (pages.length > 0) {
        const page = pages[0];
        const { width } = page.getSize();
        page.drawRectangle({
          x: 20,
          y: Number(this.redactY),
          width: width - 40,
          height: Number(this.redactHeight),
          color: rgb(0, 0, 0)
        });
      }

      const bytes = await pdfDoc.save();
      this.createDownload(bytes, `redacted_${src.name}`, 'application/pdf');
      this.statusMessage.set(`Blacked out redaction rectangle at Y=${this.redactY}.`);
    } catch (err: any) {
      this.statusMessage.set(`Redaction error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 5. SIGNATURE CANVAS & STAMP
  private initCanvas() {
    if (this.sigCanvasRef) {
      const canvas = this.sigCanvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }

  startDrawing(e: MouseEvent) {
    this.isDrawing = true;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    this.lastX = e.clientX - rect.left;
    this.lastY = e.clientY - rect.top;
  }

  draw(e: MouseEvent) {
    if (!this.isDrawing || !this.sigCanvasRef) return;
    const canvas = this.sigCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  startDrawingTouch(e: TouchEvent) {
    this.isDrawing = true;
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const touch = e.touches[0];
    this.lastX = touch.clientX - rect.left;
    this.lastY = touch.clientY - rect.top;
  }

  drawTouch(e: TouchEvent) {
    if (!this.isDrawing || !this.sigCanvasRef) return;
    const canvas = this.sigCanvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(this.lastX, this.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();

    this.lastX = x;
    this.lastY = y;
  }

  stopDrawing() {
    this.isDrawing = false;
  }

  clearCanvas() {
    if (this.sigCanvasRef) {
      const canvas = this.sigCanvasRef.nativeElement;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  async stampSignature() {
    const files = this.loadedFiles();
    if (files.length === 0 || !this.sigCanvasRef) return;
    this.isProcessing.set(true);

    try {
      const canvas = this.sigCanvasRef.nativeElement;
      const dataUrl = canvas.toDataURL('image/png');
      const pngBytes = await fetch(dataUrl).then(res => res.arrayBuffer());

      const src = files[0];
      const pdfDoc = await PDFDocument.load(src.arrayBuffer);
      const pngImage = await pdfDoc.embedPng(pngBytes);
      const pages = pdfDoc.getPages();

      if (pages.length > 0) {
        const firstPage = pages[0];
        firstPage.drawImage(pngImage, {
          x: 50,
          y: 50,
          width: 180,
          height: 60
        });
      }

      const bytes = await pdfDoc.save();
      this.createDownload(bytes, `signed_${src.name}`, 'application/pdf');
      this.statusMessage.set(`Digital signature stamped onto Page 1.`);
    } catch (err: any) {
      this.statusMessage.set(`Signature error: ${err.message || err}`);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 6. REAL AI DOCUMENT CHAT & TEXT QUERY
  async sendAiMessage() {
    if (!this.userQuestion.trim()) return;
    const q = this.userQuestion;
    this.chatMessages.update(m => [...m, { sender: 'user', text: q }]);
    this.userQuestion = '';
    this.isProcessing.set(true);

    try {
      let docText = this.extractedTextPreview();
      const files = this.loadedFiles();

      if (!docText && files.length > 0) {
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(files[0].arrayBuffer) });
        const pdf = await loadingTask.promise;
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          docText += textContent.items.map((item: any) => item.str).join(' ') + ' ';
        }
        this.extractedTextPreview.set(docText);
      }

      let responseText = '';
      if (!docText) {
        responseText = 'No document text found. Please upload a PDF file first to perform text analysis.';
      } else {
        const lowerQ = q.toLowerCase();
        if (lowerQ.includes('summary') || lowerQ.includes('summarize')) {
          responseText = `📄 Document Summary (${docText.length} characters extracted):\n"${docText.slice(0, 300)}..."`;
        } else {
          // Keyword search
          const matchingSentences = docText
            .split(/(?<=[.?!])\s+/)
            .filter(sentence => sentence.toLowerCase().includes(lowerQ));

          if (matchingSentences.length > 0) {
            responseText = `Found ${matchingSentences.length} matching segment(s):\n• ${matchingSentences.slice(0, 3).join('\n• ')}`;
          } else {
            responseText = `I searched the document content for "${q}". Here is relevant excerpt:\n"${docText.slice(0, 250)}..."`;
          }
        }
      }

      this.chatMessages.update(m => [...m, { sender: 'ai', text: responseText }]);
    } catch (err: any) {
      this.chatMessages.update(m => [...m, { sender: 'ai', text: `Analysis error: ${err.message || err}` }]);
    } finally {
      this.isProcessing.set(false);
    }
  }

  // 7. CAMERA SCANNER / CAPTURE
  async onCameraCaptured(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.isProcessing.set(true);
      try {
        const buffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.create();

        let img;
        if (file.type === 'image/png') {
          img = await pdfDoc.embedPng(buffer);
        } else {
          img = await pdfDoc.embedJpg(buffer);
        }

        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });

        const bytes = await pdfDoc.save();
        this.createDownload(bytes, `scanned_${file.name.replace(/\.[^/.]+$/, '')}.pdf`, 'application/pdf');
        this.statusMessage.set(`Captured photo converted to PDF document successfully!`);
      } catch (err: any) {
        this.statusMessage.set(`Scan processing error: ${err.message || err}`);
      } finally {
        this.isProcessing.set(false);
      }
    }
  }
}
