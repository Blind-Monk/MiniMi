import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { PdfToolsComponent } from './pdf-tools.component';
import { PDFDocument } from 'pdf-lib';

describe('PdfToolsComponent', () => {
  let component: PdfToolsComponent;

  beforeEach(() => {
    component = new PdfToolsComponent();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default category and tools', () => {
    expect(component.activeCategory()).toBe('compress');
    expect(component.selectedTool()?.id).toBe('compress-pdf');
    expect(component.filteredTools().length).toBeGreaterThan(0);
  });

  it('should format file sizes correctly', () => {
    expect(component.formatSize(500)).toBe('500 B');
    expect(component.formatSize(2048)).toBe('2.0 KB');
    expect(component.formatSize(1048576)).toBe('1.00 MB');
  });

  it('should handle file loading and document parsing', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    const bytes = await pdfDoc.save();
    const mockFile = new File([bytes.buffer as ArrayBuffer], 'test.pdf', { type: 'application/pdf' });

    await component.addFiles([mockFile]);

    expect(component.loadedFiles().length).toBe(1);
    expect(component.loadedFiles()[0].name).toBe('test.pdf');
    expect(component.loadedFiles()[0].pageCount).toBe(1);
  });
});
