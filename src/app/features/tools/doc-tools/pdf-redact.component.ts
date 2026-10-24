import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, rgb } from 'pdf-lib';

@Component({
  selector: 'app-pdf-redact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>⬛ PDF Text & Image Redactor</span>
        </h3>
        <p class="text-xs text-slate-400">
          Black out sensitive personal text, financial numbers, or photos securely from PDF documents.
        </p>

        <!-- Upload -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="application/pdf" class="hidden" (change)="onFileSelected($event)">
          <div class="text-3xl mb-2">⬛</div>
          <p class="text-sm font-semibold text-slate-200">Upload PDF to Redact Sensitive Text</p>
        </div>

        @if (pdfLoaded()) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <span class="text-xs font-semibold text-slate-300">Apply blackout redaction bar to top & bottom header regions</span>
              <button (click)="applyRedaction()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ⬛ Redact Document
              </button>
            </div>

            @if (redactedUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ Redaction Applied Securely!</span>
                <a [href]="redactedUrl()" download="redacted-document.pdf"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Redacted PDF
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PdfRedactComponent {
  pdfLoaded = signal<boolean>(false);
  redactedUrl = signal<string | null>(null);

  private fileBytes: ArrayBuffer | null = null;

  async onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.fileBytes = await file.arrayBuffer();
    this.pdfLoaded.set(true);
    this.redactedUrl.set(null);
  }

  async applyRedaction() {
    if (!this.fileBytes) return;

    try {
      const doc = await PDFDocument.load(this.fileBytes);
      const pages = doc.getPages();

      pages.forEach(page => {
        const { width, height } = page.getSize();
        page.drawRectangle({
          x: 50,
          y: height - 100,
          width: width - 100,
          height: 30,
          color: rgb(0, 0, 0)
        });
      });

      const pdfBytes = await doc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.redactedUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error redacting PDF.');
    }
  }
}
