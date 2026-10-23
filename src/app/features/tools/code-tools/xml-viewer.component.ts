import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-xml-viewer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌳 XML Formatter & Tree Viewer</span>
        </h3>
        <p class="text-xs text-slate-400">
          Format raw XML documents into clean indented structures with DOM parser validation.
        </p>

        <div class="mt-4 space-y-4">
          <div class="flex items-center justify-between">
            <button (click)="formatXml()" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ✨ Format & Validate XML
            </button>
            <button (click)="copyOutput()" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-bold text-xs rounded-lg border border-slate-700">
              {{ copyStatus() }}
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Input XML Document</label>
              <textarea [ngModel]="inputXml()" (ngModelChange)="inputXml.set($event)"
                        placeholder="<catalog><item id='1'><name>Widget</name></item></catalog>"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500">
              </textarea>
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-400 block mb-1">Formatted Output</label>
              <textarea readonly [value]="outputXml()"
                        class="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-emerald-400 focus:outline-none">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class XmlViewerComponent {
  inputXml = signal<string>('<?xml version="1.0"?><catalog><book id="bk101"><author>Gambardella, Matthew</author><title>XML Developer\'s Guide</title><price>44.95</price></book></catalog>');
  outputXml = signal<string>('');
  copyStatus = signal<string>('Copy Output');

  constructor() {
    this.formatXml();
  }

  formatXml() {
    const raw = this.inputXml().trim();
    if (!raw) {
      this.outputXml.set('');
      return;
    }

    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(raw, 'text/xml');
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        this.outputXml.set(`⚠️ XML Parse Error:\n${parserError.textContent}`);
        return;
      }

      this.outputXml.set(this.serializeNode(xmlDoc, 0));
    } catch (e: any) {
      this.outputXml.set(`⚠️ Error parsing XML: ${e?.message || e}`);
    }
  }

  private serializeNode(node: Node, level: number): string {
    const indent = '  '.repeat(level);

    if (node.nodeType === Node.DOCUMENT_NODE) {
      return Array.from(node.childNodes)
        .map(child => this.serializeNode(child, level))
        .filter(Boolean)
        .join('\n');
    }

    if (node.nodeType === Node.PROCESSING_INSTRUCTION_NODE) {
      return `${indent}<?${node.nodeName} ${(node as ProcessingInstruction).data}?>`;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const val = node.nodeValue?.trim();
      return val ? `${indent}${val}` : '';
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const elem = node as Element;
      const attrs = Array.from(elem.attributes)
        .map(a => `${a.name}="${a.value}"`)
        .join(' ');
      const attrStr = attrs ? ` ${attrs}` : '';

      const childNodes = Array.from(elem.childNodes).filter(
        c => c.nodeType !== Node.TEXT_NODE || c.nodeValue?.trim()
      );

      if (childNodes.length === 0) {
        return `${indent}<${elem.tagName}${attrStr}/>`;
      }

      // Inline short single text child node
      if (childNodes.length === 1 && childNodes[0].nodeType === Node.TEXT_NODE) {
        return `${indent}<${elem.tagName}${attrStr}>${childNodes[0].nodeValue?.trim()}</${elem.tagName}>`;
      }

      const inner = childNodes
        .map(child => this.serializeNode(child, level + 1))
        .filter(Boolean)
        .join('\n');

      return `${indent}<${elem.tagName}${attrStr}>\n${inner}\n${indent}</${elem.tagName}>`;
    }

    return '';
  }

  copyOutput() {
    navigator.clipboard.writeText(this.outputXml());
    this.copyStatus.set('Copied! ✓');
    setTimeout(() => this.copyStatus.set('Copy Output'), 2000);
  }
}
