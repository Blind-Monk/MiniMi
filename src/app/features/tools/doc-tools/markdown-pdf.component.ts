import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Component({
  selector: 'app-markdown-pdf',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🖨️ Markdown to PDF / HTML to PDF Exporter</span>
        </h3>
        <p class="text-xs text-slate-400">
          Render Markdown notes or HTML markup into clean print-formatted PDF documents.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">Markdown Source Text</label>
            <textarea [ngModel]="markdownText()" (ngModelChange)="markdownText.set($event)"
                      class="w-full h-48 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>

          <div class="flex justify-end">
            <button (click)="exportPdf()" class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              🖨️ Export PDF Document
            </button>
          </div>

          @if (pdfUrl()) {
            <div class="p-4 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between">
              <span class="text-xs text-emerald-400 font-mono font-semibold">✓ PDF Document Generated!</span>
              <a [href]="pdfUrl()" download="markdown-doc.pdf"
                 class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow">
                ⬇️ Download PDF
              </a>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MarkdownPdfComponent {
  markdownText = signal<string>('# Minimi Project Summary\n\nMinimi is a high performance client-side web application suite.');
  pdfUrl = signal<string | null>(null);

  async exportPdf() {
    try {
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      const lines = this.markdownText().split('\n');
      let y = 750;

      lines.forEach(line => {
        if (line.startsWith('# ')) {
          page.drawText(line.replace('# ', ''), { x: 50, y, size: 24, font, color: rgb(0.1, 0.1, 0.3) });
          y -= 35;
        } else {
          page.drawText(line, { x: 50, y, size: 12, font, color: rgb(0.2, 0.2, 0.2) });
          y -= 20;
        }
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      this.pdfUrl.set(URL.createObjectURL(blob));
    } catch {
      alert('Error exporting PDF.');
    }
  }
}
