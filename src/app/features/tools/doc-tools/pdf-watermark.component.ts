import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, rgb, degrees } from 'pdf-lib';

@Component({
  selector: 'app-pdf-watermark',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🏷️ PDF Watermarker</span>
        </h3>
        <p class="text-xs text-slate-400">
          Stamp customized text or confidential diagonal watermark labels across PDF document pages.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="application/pdf" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🏷️</div>
          <p class="text-sm font-semibold text-slate-200">Upload PDF to Stamp Watermark</p>
        </div>

        @if (pdfLoaded()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-4">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Watermark Text</label>
                <input type="text" [ngModel]="watermarkText()" (ngModelChange)="watermarkText.set($event)"
                       class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white">
              </div>

              <div class="flex justify-end">
                <button (click)="applyWatermark()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                  ⚡ Apply Watermark
                </button>
              </div>
            </div>

            @if (watermarkedUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ Watermark Applied to PDF!</span>
                <a [href]="watermarkedUrl()" download="watermarked-document.pdf"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Watermarked PDF
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PdfWatermarkComponent {
  pdfLoaded = signal<boolean>(false);
  watermarkText = signal<string>('CONFIDENTIAL');
  watermarkedUrl = signal<string | null>(null);

  private fileBytes: ArrayBuffer | null = null;

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileBytes = await file.arrayBuffer();
    this.pdfLoaded.set(true);
    this.watermarkedUrl.set(null);
  }

  async applyWatermark() {
    if (!this.fileBytes) return;

    try {
      const doc = await PDFDocument.load(this.fileBytes);
      const pages = doc.getPages();
      const text = this.watermarkText();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 4,
          y: height / 2,
          size: 48,
          color: rgb(0.8, 0.2, 0.2),
          opacity: 0.4,
          rotate: degrees(45)
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.watermarkedUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error watermarking PDF.');
    }
  }
}
