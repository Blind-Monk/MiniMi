import '@angular/compiler';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfToolsComponent } from './pdf-tools.component';
import { PDFDocument } from 'pdf-lib';

describe('PdfToolsComponent', () => {
  let component: PdfToolsComponent;
  let fixture: ComponentFixture<PdfToolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfToolsComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PdfToolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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

  it('should compress PDF and set download url', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([200, 200]);
    const bytes = await pdfDoc.save();
    const mockFile = new File([bytes.buffer as ArrayBuffer], 'sample.pdf', { type: 'application/pdf' });

    await component.addFiles([mockFile]);
    await component.processCompress();

    expect(component.downloadUrl()).toBeTruthy();
    expect(component.downloadFilename()).toContain('compressed_sample.pdf');
  });

  it('should stamp watermark onto PDF document', async () => {
    const pdfDoc = await PDFDocument.create();
    pdfDoc.addPage([300, 300]);
    const bytes = await pdfDoc.save();
    const mockFile = new File([bytes.buffer as ArrayBuffer], 'doc.pdf', { type: 'application/pdf' });

    await component.addFiles([mockFile]);
    component.watermarkText = 'TEST_WATERMARK';
    await component.applyWatermark();

    expect(component.downloadUrl()).toBeTruthy();
    expect(component.downloadFilename()).toContain('watermarked_doc.pdf');
    expect(component.statusMessage()).toContain('TEST_WATERMARK');
  });

  it('should merge multiple PDFs', async () => {
    const doc1 = await PDFDocument.create();
    doc1.addPage();
    const bytes1 = await doc1.save();

    const doc2 = await PDFDocument.create();
    doc2.addPage();
    const bytes2 = await doc2.save();

    const file1 = new File([bytes1.buffer as ArrayBuffer], 'file1.pdf', { type: 'application/pdf' });
    const file2 = new File([bytes2.buffer as ArrayBuffer], 'file2.pdf', { type: 'application/pdf' });

    component.organizeAction = 'merge';
    await component.addFiles([file1, file2]);
    await component.processOrganize();

    expect(component.downloadUrl()).toBeTruthy();
    expect(component.downloadFilename()).toBe('merged_document.pdf');
  });

  it('should answer questions using AI PDF assistant', async () => {
    component.extractedTextPreview.set('This agreement is entered into between Party A and Party B for software engineering services.');
    component.userQuestion = 'software engineering';

    await component.sendAiMessage();

    const messages = component.chatMessages();
    const lastMsg = messages[messages.length - 1];
    expect(lastMsg.sender).toBe('ai');
    expect(lastMsg.text).toContain('software engineering');
  });
});
