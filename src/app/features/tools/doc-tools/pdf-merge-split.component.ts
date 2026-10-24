import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument } from 'pdf-lib';

@Component({
  selector: 'app-pdf-merge-split',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📄 PDF Merger & Splitter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Combine multiple PDF files into one master document or split specific page ranges into individual PDFs.
        </p>

        <!-- Upload Multiple PDFs -->
        <div class="mt-4 border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-slate-950/50"
             (click)="fileInput.click()">
          <input #fileInput type="file" accept="application/pdf" multiple class="hidden" (change)="onFilesSelected($event)">
          <div class="text-3xl mb-2">📄</div>
          <p class="text-sm font-semibold text-slate-200">Upload PDF Files (Select Multiple)</p>
        </div>

        @if (pdfFiles().length > 0) {
          <div class="mt-6 space-y-6">
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
              <h4 class="text-xs font-semibold text-slate-200">Uploaded PDFs ({{ pdfFiles().length }})</h4>
              <div class="space-y-2">
                @for (file of pdfFiles(); track file.name) {
                  <div class="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-slate-300">
                    <span>📄 {{ file.name }}</span>
                    <span>{{ formatBytes(file.size) }}</span>
                  </div>
                }
              </div>
            </div>

            <div class="flex justify-end space-x-3">
              <button (click)="mergePdfs()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
                ⚡ Merge All PDFs into One
              </button>
            </div>

            @if (mergedPdfUrl()) {
              <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
                <span class="text-xs text-emerald-400 font-mono font-semibold">✓ PDFs Merged Successfully!</span>
                <a [href]="mergedPdfUrl()" download="merged-document.pdf"
                   class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                  ⬇️ Download Merged PDF
                </a>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class PdfMergeSplitComponent {
  pdfFiles = signal<File[]>([]);
  mergedPdfUrl = signal<string | null>(null);

  onFilesSelected(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files || files.length === 0) return;

    this.pdfFiles.set(Array.from(files));
    this.mergedPdfUrl.set(null);
  }

  async mergePdfs() {
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of this.pdfFiles()) {
        const bytes = await file.arrayBuffer();
        const doc = await PDFDocument.load(bytes);
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach(p => mergedPdf.addPage(p));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.mergedPdfUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error merging PDFs.');
    }
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
