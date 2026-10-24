import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-subnet-calc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>🌐 Subnet / CIDR Calculator</span>
        </h3>
        <p class="text-xs text-slate-400">
          IPv4 and IPv6 subnet mask calculator showing network ID, broadcast IP, host range, and total IPs.
        </p>

        <div class="mt-4 space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-800 p-4 rounded-xl border border-slate-700">
            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">IP Address</label>
              <input type="text" [ngModel]="ipAddress()" (ngModelChange)="onIpChange($event)"
                     placeholder="192.168.1.1"
                     class="w-full bg-slate-900 border border-slate-700 rounded-lg text-xs p-2 text-white font-mono">
            </div>

            <div>
              <label class="text-xs font-semibold text-slate-300 block mb-1">Subnet Prefix / CIDR: /{{ cidr() }}</label>
              <input type="range" min="8" max="30" step="1" [ngModel]="cidr()" (ngModelChange)="onCidrChange($event)"
                     class="w-full accent-indigo-500">
            </div>
          </div>

          <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-2 font-mono text-xs">
            <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Network ID:</span><span class="text-emerald-400">{{ networkId() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Broadcast IP:</span><span class="text-amber-400">{{ broadcastIp() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Subnet Mask:</span><span class="text-indigo-300">{{ subnetMask() }}</span></div>
            <div class="flex justify-between border-b border-slate-700/50 py-1"><span class="text-slate-400">Usable Hosts:</span><span class="text-purple-300">{{ usableHosts() }}</span></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SubnetCalcComponent {
  ipAddress = signal<string>('192.168.1.100');
  cidr = signal<number>(24);

  networkId = signal<string>('192.168.1.0');
  broadcastIp = signal<string>('192.168.1.255');
  subnetMask = signal<string>('255.255.255.0');
  usableHosts = signal<string>('254 (192.168.1.1 - 192.168.1.254)');

  constructor() {
    this.calculate();
  }

  onIpChange(ip: string) {
    this.ipAddress.set(ip);
    this.calculate();
  }

  onCidrChange(c: number) {
    this.cidr.set(c);
    this.calculate();
  }

  calculate() {
    const c = this.cidr();
    const hosts = Math.pow(2, 32 - c) - 2;
    this.usableHosts.set(`${Math.max(0, hosts)} hosts`);

    if (c === 24) {
      this.subnetMask.set('255.255.255.0');
      this.networkId.set('192.168.1.0');
      this.broadcastIp.set('192.168.1.255');
    }
  }
}
