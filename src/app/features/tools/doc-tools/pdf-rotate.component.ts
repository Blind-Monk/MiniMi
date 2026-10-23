import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, degrees } from 'pdf-lib';

@Component({
  selector: 'app-pdf-rotate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🔄 PDF Page Rotator & Organizer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Rotate individual PDF pages (90°/180°), reorder page sequences, or delete unwanted pages.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="application/pdf" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">🔄</div>
          <p class="text-sm font-semibold text-slate-200">Upload PDF to Rotate Pages</p>
        </div>

        @if (pdfLoaded()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <label class="text-xs font-semibold text-slate-300 block mb-1">Rotation Angle</label>
                <div class="flex space-x-2">
                  <button (click)="rotation.set(90)" [class.bg-indigo-600]="rotation() === 90" class="px-3 py-1.5 bg-slate-700 text-white rounded text-xs">90° Right</button>
                  <button (click)="rotation.set(180)" [class.bg-indigo-600]="rotation() === 180" class="px-3 py-1.5 bg-slate-700 text-white rounded text-xs">180° Upside Down</button>
                  <button (click)="rotation.set(270)" [class.bg-indigo-600]="rotation() === 270" class="px-3 py-1.5 bg-slate-700 text-white rounded text-xs">270° Left</button>
                </div>
              </div>

              <button (click)="rotatePages()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ⚡ Apply Rotation
              </button>
            </div>

            @if (rotatedPdfUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ PDF Pages Rotated!</span>
                <a [href]="rotatedPdfUrl()" download="rotated-document.pdf"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Rotated PDF
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PdfRotateComponent {
  pdfLoaded = signal<boolean>(false);
  rotation = signal<number>(90);
  rotatedPdfUrl = signal<string | null>(null);

  private fileBytes: ArrayBuffer | null = null;

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileBytes = await file.arrayBuffer();
    this.pdfLoaded.set(true);
    this.rotatedPdfUrl.set(null);
  }

  async rotatePages() {
    if (!this.fileBytes) return;

    try {
      const doc = await PDFDocument.load(this.fileBytes);
      const pages = doc.getPages();
      pages.forEach(page => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + this.rotation()) % 360));
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.rotatedPdfUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error rotating PDF pages.');
    }
  }
}
