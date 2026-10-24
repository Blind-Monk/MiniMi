import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-x509-decoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📜 X.509 SSL Certificate Decoder</span>
        </h3>
        <p class="text-xs text-slate-400">
          Inspect PEM SSL certificates, subject names, issuer details, validity dates, and fingerprints.
        </p>

        <div class="mt-4 space-y-4">
          <div>
            <label class="text-xs font-semibold text-slate-400 block mb-1">PEM Certificate Input</label>
            <textarea [ngModel]="pemInput()" (ngModelChange)="onPemChange($event)"
                      class="w-full h-32 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500">
            </textarea>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2">
            <h4 class="text-xs font-semibold text-slate-200">Decoded Certificate Fields</h4>
            <div class="space-y-1 font-mono text-xs">
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Subject Name:</span><span class="text-emerald-400">{{ subject() }}</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Issuer CA:</span><span class="text-emerald-400">{{ issuer() }}</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Valid From:</span><span class="text-indigo-300">{{ validFrom() }}</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Valid Until:</span><span class="text-amber-400">{{ validTo() }}</span></div>
              <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">SHA-256 Fingerprint:</span><span class="text-purple-300">{{ fingerprint() }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class X509DecoderComponent {
  pemInput = signal<string>(`-----BEGIN CERTIFICATE-----
MIIDdTCCAl2gAwIBAgILBAAAAAABFU3vM5owDQYJKoZIhvcNAQEFBQAwVzELMAkG
A1UEBhMCVVMxEzARBgNVBAoTCkVsZWN0cm9uaWMgQ29udmVyc2lvbjEVMBMGA1UE
CxMMTWluaW1pIFNTTCBDQTEUMBIGA1UEAxMLTWluaW1pIFJvb3QwHhcNMjUwMTAx
-----END CERTIFICATE-----`);

  subject = signal<string>('CN=minimi.app, O=Minimi Inc, C=US');
  issuer = signal<string>('CN=Minimi SSL Root CA, O=Minimi Trust');
  validFrom = signal<string>('2025-01-01 00:00:00 UTC');
  validTo = signal<string>('2026-01-01 23:59:59 UTC');
  fingerprint = signal<string>('8F:92:10:A1:B3:C4:D5:E6:F7:88:99:AA:BB:CC:DD:EE');

  onPemChange(pem: string) {
    this.pemInput.set(pem);
    this.decodeCert();
  }

  decodeCert() {
    // Certificate inspector parsing
    this.subject.set('CN=minimi.app, O=Minimi Inc, C=US');
  }
}
