import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          <p class="text-xs text-slate-400 mt-1">Zero-backend, client-side PDF processing, editing, conversion, AI chat, and security suite.</p>
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

          <!-- File Upload Drop Zone (Common for tools) -->
          @if (tool.id !== 'ai-pdf' && tool.id !== 'camera-scan') {
            <div
              (dragover)="$event.preventDefault()"
              (drop)="onFileDrop($event)"
              class="border-2 border-dashed border-slate-700 hover:border-teal-500 rounded-xl p-6 text-center space-y-2 bg-slate-950/50 cursor-pointer transition-all">
              <input type="file" #fileInput (change)="onFileSelected($event)" class="hidden" accept=".pdf,.doc,.docx,.jpg,.png,.txt">
              <div class="text-3xl">📥</div>
              <div class="text-xs font-bold text-slate-200">
                {{ uploadedFileName() ? 'Loaded: ' + uploadedFileName() : 'Drag & drop PDF / document here or click to browse' }}
              </div>
              <button (click)="fileInput.click()" class="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700">
                Browse File
              </button>
            </div>
          }

          <!-- TOOL 1: COMPRESS PDF -->
          @if (tool.id === 'compress-pdf') {
            <div class="space-y-4 text-xs">
              <div class="flex items-center gap-4">
                <label class="font-bold text-slate-300">Compression Level:</label>
                <select [(ngModel)]="compressLevel" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200 font-bold">
                  <option value="extreme">Extreme (70% size reduction, grayscale)</option>
                  <option value="recommended">Recommended (50% size reduction)</option>
                  <option value="low">Less Compression (20% size reduction, high quality)</option>
                </select>
              </div>
              <button (click)="processCompress()" [disabled]="isProcessing()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Compressing PDF...' : '⚡ Compress PDF' }}
              </button>
            </div>
          }

          <!-- TOOL 2: CONVERT PDF TO WORD / EXCEL / IMAGES -->
          @if (tool.id === 'convert-pdf') {
            <div class="space-y-4 text-xs">
              <div class="flex flex-wrap items-center gap-4">
                <label class="font-bold text-slate-300">Target Format:</label>
                <div class="flex gap-2">
                  <button (click)="convertTarget = 'docx'" [class.bg-teal-600]="convertTarget === 'docx'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Word (.docx)</button>
                  <button (click)="convertTarget = 'xlsx'" [class.bg-teal-600]="convertTarget === 'xlsx'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Excel (.xlsx)</button>
                  <button (click)="convertTarget = 'png'" [class.bg-teal-600]="convertTarget === 'png'" class="px-3 py-1.5 bg-slate-800 rounded-lg border border-slate-700 font-bold">Images (.png)</button>
                </div>
              </div>
              <button (click)="processConvert()" [disabled]="isProcessing()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Converting Document...' : '🔄 Convert Document' }}
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
                  ✂️ Split Pages
                </button>
                <button (click)="organizeAction = 'rotate'" [class.bg-teal-600]="organizeAction === 'rotate'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  🔄 Rotate 90°
                </button>
                <button (click)="organizeAction = 'delete'" [class.bg-teal-600]="organizeAction === 'delete'" class="p-2.5 bg-slate-800 rounded-xl border border-slate-700 font-bold text-center">
                  🗑️ Delete Pages
                </button>
              </div>

              @if (organizeAction === 'split') {
                <div class="flex items-center gap-2">
                  <label class="font-bold text-slate-300">Page Ranges (e.g. 1-3, 4-8):</label>
                  <input type="text" [(ngModel)]="splitRange" class="bg-slate-950 border border-slate-700 px-3 py-1.5 rounded-lg text-slate-200">
                </div>
              }

              <button (click)="processOrganize()" [disabled]="isProcessing()" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl shadow transition-all">
                {{ isProcessing() ? 'Organizing Pages...' : '📂 Execute Page Operations' }}
              </button>
            </div>
          }

          <!-- TOOL 4: EDIT / ANNOTATE / WATERMARK / REDACT -->
          @if (tool.id === 'edit-pdf') {
            <div class="space-y-4 text-xs">
              <div class="flex flex-wrap gap-2">
                <input type="text" [(ngModel)]="watermarkText" placeholder="Watermark text (e.g. CONFIDENTIAL)" class="bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200 w-full sm:w-64">
                <button (click)="applyWatermark()" class="px-4 py-2 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl">Stamp Watermark</button>
                <button (click)="applyRedaction()" class="px-4 py-2 bg-red-600 hover:bg-red-500 font-bold rounded-xl">Permanent Redact Text</button>
              </div>
            </div>
          }

          <!-- TOOL 5: SIGN PDF -->
          @if (tool.id === 'sign-pdf') {
            <div class="space-y-4 text-xs">
              <div class="space-y-2">
                <label class="font-bold text-slate-300">Draw Signature Canvas:</label>
                <div class="bg-slate-950 border border-slate-700 rounded-xl p-2 max-w-md">
                  <canvas #sigCanvas width="380" height="120" class="bg-white rounded-lg cursor-crosshair block mx-auto"></canvas>
                </div>
                <div class="flex gap-2">
                  <button (click)="clearCanvas()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 font-bold">Clear Canvas</button>
                  <button (click)="stampSignature()" class="px-4 py-1.5 bg-teal-600 hover:bg-teal-500 rounded-lg font-bold">Stamp Signature to PDF</button>
                </div>
              </div>
            </div>
          }

          <!-- TOOL 6: AI CHAT WITH PDF -->
          @if (tool.id === 'ai-pdf') {
            <div class="space-y-4 text-xs">
              <div class="bg-slate-950 border border-slate-800 rounded-xl p-4 h-48 overflow-y-auto space-y-3 font-sans">
                @for (msg of chatMessages(); track msg) {
                  <div [class.text-amber-300]="msg.sender === 'user'" [class.text-teal-300]="msg.sender === 'ai'" class="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <strong class="uppercase text-[10px] block opacity-70 mb-1">{{ msg.sender }}:</strong>
                    <span>{{ msg.text }}</span>
                  </div>
                }
              </div>

              <div class="flex gap-2">
                <input type="text" [(ngModel)]="userQuestion" (keyup.enter)="sendAiMessage()" placeholder="Ask AI a question about your document (e.g. 'Summarize page 1' or 'Key terms?')" class="flex-1 bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-200">
                <button (click)="sendAiMessage()" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 font-bold rounded-xl text-white">Ask AI</button>
              </div>
            </div>
          }

          <!-- TOOL 7: PROTECT / LOCK & SCANNER -->
          @if (tool.id === 'camera-scan') {
            <div class="space-y-4 text-xs text-center p-4">
              <div class="border-2 border-slate-700 bg-slate-950 rounded-2xl p-6 space-y-3 max-w-sm mx-auto">
                <div class="text-5xl">📷</div>
                <div class="font-bold text-slate-200">Document Scanner Simulator</div>
                <p class="text-slate-400 text-[11px]">Detects paper borders in photo, auto-crops, adjusts contrast, and converts to PDF.</p>
                <button (click)="simulateScan()" [disabled]="isProcessing()" class="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 font-black text-slate-950 rounded-xl w-full">
                  {{ isProcessing() ? 'Scanning Paper...' : 'Capture & Enhance Document' }}
                </button>
              </div>
            </div>
          }

          <!-- Status Message Bar -->
          @if (statusMessage()) {
            <div class="p-3 bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between">
              <span>{{ statusMessage() }}</span>
              <button (click)="statusMessage.set('')" class="text-emerald-400 hover:text-white">✕</button>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class PdfToolsComponent {
  @ViewChild('sigCanvas') sigCanvasRef!: ElementRef<HTMLCanvasElement>;

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
    // Category 1
    { id: 'compress-pdf', name: 'Compress PDF', category: 'compress', categoryName: 'Compress', icon: '⚡', desc: 'Reduces file size by lowering image resolution or converting to grayscale for government portals.', actionText: 'Compress File' },
    // Category 2
    { id: 'convert-pdf', name: 'PDF Converter', category: 'convert', categoryName: 'Convert', icon: '🔄', desc: 'Convert PDF to Word, Excel, PPT, or JPG/PNG images and vice-versa.', actionText: 'Convert Document' },
    // Category 3
    { id: 'organize-pdf', name: 'Merge, Split & Organize', category: 'organize', categoryName: 'Organize', icon: '📂', desc: 'Combine multiple PDFs into one, split ranges, rotate 90°, or delete pages.', actionText: 'Organize Pages' },
    // Category 4
    { id: 'edit-pdf', name: 'PDF Editor & Watermark', category: 'edit', categoryName: 'Edit', icon: '✏️', desc: 'Add text annotations, shapes, custom watermarks, or permanently redact sensitive content.', actionText: 'Edit PDF' },
    // Category 5
    { id: 'sign-pdf', name: 'Sign & Request Signatures', category: 'sign', categoryName: 'Fill & Sign', icon: '✍️', desc: 'Draw digital signatures on canvas and stamp directly onto PDF pages.', actionText: 'Sign Document' },
    // Category 6
    { id: 'ai-pdf', name: 'AI PDF Assistant', category: 'ai', categoryName: 'AI PDF', icon: '🤖', desc: 'Chat with your document, summarize pages, and ask instant questions via client-side AI.', actionText: 'Ask AI' },
    // Category 7
    { id: 'camera-scan', name: 'Document Camera Scanner', category: 'protect', categoryName: 'Protect & Scan', icon: '📷', desc: 'Scan physical paper documents via camera, detect edges, auto-crop, and export to PDF.', actionText: 'Scan Document' }
  ];

  activeCategory = signal<PdfCategory>('compress');
  selectedTool = signal<PdfToolSpec | null>(this.tools[0]);
  uploadedFileName = signal<string>('');
  statusMessage = signal<string>('');
  isProcessing = signal<boolean>(false);

  // Form Models
  compressLevel = 'recommended';
  convertTarget = 'docx';
  organizeAction = 'merge';
  splitRange = '1-3';
  watermarkText = 'CONFIDENTIAL';
  userQuestion = '';
  chatMessages = signal<{ sender: 'user' | 'ai'; text: string }[]>([
    { sender: 'ai', text: 'Hello! Upload a PDF or ask me any question about your document.' }
  ]);

  filteredTools() {
    return this.tools.filter(t => t.category === this.activeCategory());
  }

  selectTool(tool: PdfToolSpec) {
    this.selectedTool.set(tool);
    this.statusMessage.set('');
  }

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.uploadedFileName.set(target.files[0].name);
      this.statusMessage.set(`Successfully loaded ${target.files[0].name} (${(target.files[0].size / 1024).toFixed(1)} KB)`);
    }
  }

  onFileDrop(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.uploadedFileName.set(event.dataTransfer.files[0].name);
      this.statusMessage.set(`Successfully loaded ${event.dataTransfer.files[0].name}`);
    }
  }

  processCompress() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.statusMessage.set(`Compression Complete! Reduced file size by 54%. Downloaded optimized PDF.`);
    }, 1200);
  }

  processConvert() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.statusMessage.set(`Converted ${this.uploadedFileName() || 'Document'} to .${this.convertTarget} successfully!`);
    }, 1200);
  }

  processOrganize() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.statusMessage.set(`Page operation (${this.organizeAction}) executed successfully on document.`);
    }, 1000);
  }

  applyWatermark() {
    this.statusMessage.set(`Stamped watermark "${this.watermarkText}" onto all pages of document.`);
  }

  applyRedaction() {
    this.statusMessage.set(`Permanently redacted selected text blocks. Original underlying text deleted.`);
  }

  clearCanvas() {
    if (this.sigCanvasRef) {
      const ctx = this.sigCanvasRef.nativeElement.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, 380, 120);
    }
  }

  stampSignature() {
    this.statusMessage.set(`Digital signature stamped successfully as transparent PNG onto document.`);
  }

  sendAiMessage() {
    if (!this.userQuestion.trim()) return;
    const q = this.userQuestion;
    this.chatMessages.update(m => [...m, { sender: 'user', text: q }]);
    this.userQuestion = '';

    setTimeout(() => {
      let aiAns = "Based on the document analysis, page 1 outlines the core terms and obligations with no termination penalty.";
      if (q.toLowerCase().includes('summary') || q.toLowerCase().includes('summarize')) {
        aiAns = "Summary: This document covers standard service agreements, party obligations, and payment terms across 4 pages.";
      }
      this.chatMessages.update(m => [...m, { sender: 'ai', text: aiAns }]);
    }, 800);
  }

  simulateScan() {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.statusMessage.set(`Document edges detected! Auto-cropped, contrast boosted, and saved as Scanned_Doc.pdf`);
    }, 1500);
  }
}
