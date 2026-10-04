import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-gen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white max-w-lg mx-auto text-center space-y-4">
      <h3 class="text-lg font-bold text-teal-400">📱 QR Code Generator</h3>

      <input
        type="text"
        [(ngModel)]="qrData"
        placeholder="Enter URL or text..."
        class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none">

      <div class="p-4 bg-white rounded-xl inline-block border border-slate-700 shadow-md">
        <img
          [src]="'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(qrData)"
          alt="QR Code"
          class="w-48 h-48 mx-auto">
      </div>
    </div>
  `
})
export class QrGenComponent {
  qrData = 'https://github.com/areyouroot/online';

  encodeURIComponent(val: string): string {
    return encodeURIComponent(val || '');
  }
}
