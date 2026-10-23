import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';

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
          Bundle multiple photo images into a single PDF document or export PDF pages as PNG images.
        </p>

        <!-- Upload Images to Bundle -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="image/*" multiple class="hidden" (change)="onImagesSelected($event)">
          <div class="text-3xl mb-2">🖼️</div>
          <p class="text-sm font-semibold text-slate-200">Upload Photo Images to Convert into PDF</p>
        </div>

        @if (images().length > 0) {
          <div class="mt-6 space-y-6">
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
          </div>
        }
      </div>
    </div>
  `
})
export class PdfImagesComponent {
  images = signal<File[]>([]);
  pdfUrl = signal<string | null>(null);

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
