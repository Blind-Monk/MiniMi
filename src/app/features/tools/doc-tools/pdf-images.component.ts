import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Configure pdfjs worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

@Component({
  selector: 'app-pdf-images',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🖼️ PDF to Images / Images to PDF Converter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Convert PDF pages into downloadable PNG images bundled into a single ZIP archive, or convert image files into a single PDF document.
        </p>

        <!-- Tabs -->
        <div class="mt-4 flex space-x-2 border-b border-slate-800 pb-3">
          <button (click)="activeTab.set('pdfToImages')"
                  [class.bg-indigo-600]="activeTab() === 'pdfToImages'"
                  [class.text-white]="activeTab() === 'pdfToImages'"
                  [class.bg-slate-800]="activeTab() !== 'pdfToImages'"
                  [class.text-slate-400]="activeTab() !== 'pdfToImages'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2">
            <span>📦 Convert PDF to Images (ZIP)</span>
          </button>
          <button (click)="activeTab.set('imagesToPdf')"
                  [class.bg-indigo-600]="activeTab() === 'imagesToPdf'"
                  [class.text-white]="activeTab() === 'imagesToPdf'"
                  [class.bg-slate-800]="activeTab() !== 'imagesToPdf'"
                  [class.text-slate-400]="activeTab() !== 'imagesToPdf'"
                  class="px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center space-x-2">
            <span>🖼️ Convert Images to PDF</span>
          </button>
        </div>

        <!-- TAB 1: PDF to Images (ZIP) -->
        @if (activeTab() === 'pdfToImages') {
          <div class="mt-4 space-y-6">
            <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
                 (click)="pdfInput.click()">
              <input #pdfInput type="file" accept="application/pdf" class="hidden" (change)="onPdfSelected($event)">
              <div class="text-3xl mb-2">📄</div>
              <p class="text-sm font-semibold text-slate-200">
                {{ selectedPdfFile() ? selectedPdfFile()?.name : 'Upload PDF File to Extract Pages as Images' }}
              </p>
            </div>

            @if (selectedPdfFile()) {
              <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <span class="text-xs text-slate-300 font-semibold">Ready to process {{ selectedPdfFile()?.name }}</span>
                <button (click)="convertPdfToImagesZip()" [disabled]="isProcessing()"
                        class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold text-xs rounded-xl shadow flex items-center space-x-2">
                  <span>{{ isProcessing() ? '⚡ Extracting Pages...' : '📦 Export All Pages to Images (ZIP)' }}</span>
                </button>
              </div>
            }

            @if (zipDownloadUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ Images ZIP Archive Ready!</span>
                <a [href]="zipDownloadUrl()" download="pdf-images.zip"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Images (.ZIP)
                </a>
              </div>
            }
          </div>
        }

        <!-- TAB 2: Images to PDF -->
        @if (activeTab() === 'imagesToPdf') {
          <div class="mt-4 space-y-6">
            <div class="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
                 (click)="imgInput.click()">
              <input #imgInput type="file" accept="image/*" multiple class="hidden" (change)="onImagesSelected($event)">
              <div class="text-3xl mb-2">🖼️</div>
              <p class="text-sm font-semibold text-slate-200">Upload Photo Images to Convert into PDF</p>
            </div>

            @if (images().length > 0) {
              <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs font-semibold text-slate-300">Images Selected: {{ images().length }}</span>
                <button (click)="convertImagesToPdf()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                  ⚡ Generate PDF Document
                </button>
              </div>

              @if (pdfUrl()) {
                <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                  <span class="text-xs text-emerald-400 font-mono font-semibold">✓ PDF Document Ready!</span>
                  <a [href]="pdfUrl()" download="images-bundled.pdf"
                     class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                    ⬇️ Download PDF
                  </a>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PdfImagesComponent {
  activeTab = signal<'pdfToImages' | 'imagesToPdf'>('pdfToImages');

  // PDF to Images signals
  selectedPdfFile = signal<File | null>(null);
  isProcessing = signal<boolean>(false);
  zipDownloadUrl = signal<string | null>(null);

  // Images to PDF signals
  images = signal<File[]>([]);
  pdfUrl = signal<string | null>(null);

  onPdfSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedPdfFile.set(file);
      this.zipDownloadUrl.set(null);
    }
  }

  async convertPdfToImagesZip() {
    const file = this.selectedPdfFile();
    if (!file) return;

    this.isProcessing.set(true);
    try {
      const buffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      const pdf = await loadingTask.promise;

      const zip = new JSZip();
      const imgFolder = zip.folder('pdf-pages');

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;

          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          imgFolder?.file(`page-${pageNum}.png`, base64Data, { base64: true });
        }
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      this.zipDownloadUrl.set(URL.createObjectURL(zipContent));
    } catch (e) {
      alert('Error extracting images from PDF: ' + e);
    } finally {
      this.isProcessing.set(false);
    }
  }

  onImagesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.images.set(Array.from(files));
    this.pdfUrl.set(null);
  }

  async convertImagesToPdf() {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of this.images()) {
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type.includes('png')) {
          image = await pdfDoc.embedPng(bytes);
        } else {
          image = await pdfDoc.embedJpg(bytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.pdfUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error creating PDF from images.');
    }
  }
}
