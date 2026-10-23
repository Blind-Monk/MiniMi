import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CodeCompilerComponent } from './code-compiler.component';

describe('CodeCompilerComponent', () => {
  let component: CodeCompilerComponent;
  let fixture: ComponentFixture<CodeCompilerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeCompilerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CodeCompilerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component with default HTML mode', () => {
    expect(component).toBeTruthy();
    expect(component.activeMode()).toBe('html');
    expect(component.codeInput()).toContain('<!DOCTYPE html>');
  });

  it('should switch mode to markdown and load sample markdown template', () => {
    component.setMode('markdown');
    expect(component.activeMode()).toBe('markdown');
    expect(component.codeInput()).toContain('Markdown Compiler');
    expect(component.markdownHtml()).toContain('<h1>');
  });

  it('should switch mode to script and execute JS snippet with console log output', () => {
    component.setMode('script');
    expect(component.activeMode()).toBe('script');
    expect(component.codeInput()).toContain('generateFibonacci');

    expect(component.consoleLogs().length).toBeGreaterThan(0);
    const hasLog = component.consoleLogs().some(log => log.message.includes('Generating 10 Fibonacci numbers'));
    expect(hasLog).toBe(true);
  });

  it('should correctly parse Markdown syntax elements into HTML', () => {
    const mdInput = `# Header 1
## Header 2
> Blockquote message
**Bold text** and *italic text*
- Item 1
- Item 2
`;
    const parsed = component.parseMarkdown(mdInput);
    expect(parsed).toContain('<h1>Header 1</h1>');
    expect(parsed).toContain('<h2>Header 2</h2>');
    expect(parsed).toContain('<blockquote>Blockquote message</blockquote>');
    expect(parsed).toContain('<strong>Bold text</strong>');
    expect(parsed).toContain('<em>italic text</em>');
    expect(parsed).toContain('<ul><li>Item 1</li><li>Item 2</li></ul>');
  });

  it('should execute custom JS code and capture return values and errors', () => {
    component.setMode('script');
    component.onCodeInput('console.log("Hello Minimi"); return 42;');
    component.compileAndRun();

    const logs = component.consoleLogs();
    expect(logs.some(l => l.message === 'Hello Minimi')).toBe(true);
    expect(logs.some(l => l.message.includes('Return Value: 42'))).toBe(true);
  });

  it('should handle runtime JS execution errors safely', () => {
    component.setMode('script');
    component.onCodeInput('throw new Error("Custom Test Error");');
    component.compileAndRun();

    const logs = component.consoleLogs();
    expect(logs.some(l => l.type === 'error' && l.message.includes('Custom Test Error'))).toBe(true);
  });

  it('should clear editor inputs and outputs', () => {
    component.clearCode();
    expect(component.codeInput()).toBe('');
    expect(component.htmlSafeIframeDoc()).toBe('');
    expect(component.consoleLogs().length).toBe(0);
  });
});
