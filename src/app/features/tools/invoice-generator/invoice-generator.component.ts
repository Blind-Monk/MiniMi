import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface InvoiceLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discountType: 'percent' | 'fixed';
  discount: number;
}

interface InvoiceTax {
  id: string;
  name: string;
  rate: number;
  inclusive: boolean;
  compound: boolean;
  scope: 'invoice' | 'items';
  lineIds: string[];
}

interface CompanyProfile {
  name: string;
  address: string;
  email: string;
  phone: string;
  taxId: string;
  logo: string;
}

interface InvoiceDraft {
  number: string;
  date: string;
  dueDate: string;
  currency: string;
  company: CompanyProfile;
  customerName: string;
  customerAddress: string;
  customerEmail: string;
  customerTaxId: string;
  lines: InvoiceLine[];
  discountType: 'percent' | 'fixed';
  discount: number;
  taxes: InvoiceTax[];
  notes: string;
}

interface SavedInvoice {
  number: string;
  customerName: string;
  date: string;
  total: number;
  currency: string;
  draft: InvoiceDraft;
}

const STORAGE_KEY = 'minimi.invoice-generator.v1';
const PROFILE_KEY = 'minimi.invoice-company-profile.v1';
const SEQUENCE_KEY = 'minimi.invoice-generator.sequence.v1';

@Component({
  selector: 'app-invoice-generator',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="invoice-tool text-slate-100">
      <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold text-white">Invoice workspace</h2>
          <p class="mt-1 text-sm text-slate-400">Create polished invoices locally. Your company profile and saved invoices stay in this browser.</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <button type="button" (click)="newInvoice()" class="rounded-lg bg-teal-600 px-3 py-2 text-sm font-semibold hover:bg-teal-500">＋ New invoice</button>
          <button type="button" (click)="duplicateInvoice()" class="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600">Duplicate</button>
          <button type="button" (click)="saveDraft()" class="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600">Save draft</button>
          <button type="button" (click)="printInvoice()" class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold hover:bg-indigo-500">Print / PDF</button>
          <button type="button" (click)="exportJson()" class="rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600">Export JSON</button>
          <label class="cursor-pointer rounded-lg bg-slate-700 px-3 py-2 text-sm font-semibold hover:bg-slate-600">
            Import JSON
            <input type="file" accept="application/json,.json" (change)="importJson($event)" class="sr-only">
          </label>
        </div>
      </div>

      @if (notice) {
        <p role="status" class="mb-4 rounded-lg border border-teal-700 bg-teal-950/60 px-3 py-2 text-sm text-teal-200">{{ notice }}</p>
      }
      @if (errorMessage) {
        <p role="alert" class="mb-4 rounded-lg border border-red-700 bg-red-950/60 px-3 py-2 text-sm text-red-200">{{ errorMessage }}</p>
      }

      <div class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.95fr)]">
        <div class="space-y-4">
          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 class="mb-3 font-semibold text-teal-300">Your company</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="field">Company name *
                <input [(ngModel)]="invoice.company.name" name="companyName" autocomplete="organization" placeholder="Acme Studio">
              </label>
              <label class="field">Email
                <input [(ngModel)]="invoice.company.email" name="companyEmail" type="email" autocomplete="email" placeholder="hello@example.com">
              </label>
              <label class="field sm:col-span-2">Address
                <textarea [(ngModel)]="invoice.company.address" name="companyAddress" rows="2" autocomplete="street-address" placeholder="Street, city, postal code"></textarea>
              </label>
              <label class="field">Phone
                <input [(ngModel)]="invoice.company.phone" name="companyPhone" autocomplete="tel" placeholder="+1 555 0100">
              </label>
              <label class="field">Tax / VAT ID
                <input [(ngModel)]="invoice.company.taxId" name="companyTaxId" placeholder="Optional">
              </label>
              <label class="field sm:col-span-2">Logo (image, any size; resized and compressed automatically)
                <input type="file" accept="image/*" (change)="uploadLogo($event)" class="file-input">
              </label>
            </div>
          </section>

          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 class="mb-3 font-semibold text-teal-300">Invoice details</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="field">Invoice number *
                <input [(ngModel)]="invoice.number" name="invoiceNumber" placeholder="INV-2026-001">
              </label>
              <label class="field">Currency
                <select [(ngModel)]="invoice.currency" name="currency">
                  @for (currency of currencies; track currency.code) {
                    <option [value]="currency.code">{{ currency.code }} — {{ currency.name }} ({{ currency.symbol }})</option>
                  }
                </select>
              </label>
              <label class="field">Invoice date
                <input [(ngModel)]="invoice.date" name="invoiceDate" type="date">
              </label>
              <label class="field">Due date
                <input [(ngModel)]="invoice.dueDate" name="dueDate" type="date">
              </label>
            </div>
          </section>

          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 class="mb-3 font-semibold text-teal-300">Bill to</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="field">Client / company name
                <input [(ngModel)]="invoice.customerName" name="customerName" autocomplete="organization" placeholder="Client name">
              </label>
              <label class="field">Email
                <input [(ngModel)]="invoice.customerEmail" name="customerEmail" type="email" autocomplete="email" placeholder="client@example.com">
              </label>
              <label class="field sm:col-span-2">Address
                <textarea [(ngModel)]="invoice.customerAddress" name="customerAddress" rows="2" placeholder="Client address"></textarea>
              </label>
              <label class="field">Tax ID
                <input [(ngModel)]="invoice.customerTaxId" name="customerTaxId" placeholder="Optional">
              </label>
            </div>
          </section>

          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold text-teal-300">Line items</h3>
              <button type="button" (click)="addLine()" class="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600">＋ Add item</button>
            </div>
            <div class="space-y-3">
              @for (line of invoice.lines; track line.id; let i = $index) {
                <div class="grid gap-2 rounded-lg border border-slate-700/80 bg-slate-950/50 p-3 sm:grid-cols-12">
                  <label class="field sm:col-span-3">Description
                    <input [(ngModel)]="line.description" [name]="'description' + i" placeholder="Service or product">
                  </label>
                  <label class="field sm:col-span-2">Quantity
                    <input [(ngModel)]="line.quantity" [name]="'quantity' + i" type="number" min="0" step="any" inputmode="decimal" class="min-w-16">
                  </label>
                  <label class="field sm:col-span-2">Unit price
                    <input [(ngModel)]="line.unitPrice" [name]="'price' + i" type="number" min="0" step="any">
                  </label>
                  <label class="field sm:col-span-3">Product discount
                    <div class="flex gap-1">
                      <input [(ngModel)]="line.discount" [name]="'lineDiscount' + i" type="number" min="0" [max]="line.discountType === 'percent' ? 100 : line.quantity * line.unitPrice" step="any">
                      <select [(ngModel)]="line.discountType" [name]="'lineDiscountType' + i" [attr.aria-label]="'Discount type for item ' + (i + 1)" class="max-w-24">
                        <option value="percent">%</option><option value="fixed">{{ invoice.currency }}</option>
                      </select>
                    </div>
                  </label>
                  <div class="flex items-end justify-between gap-1 sm:col-span-2">
                    <span class="pb-2 text-xs text-slate-400">{{ money(lineTotal(line)) }}</span>
                    <div class="flex">
                      <button type="button" (click)="duplicateLine(i)" [attr.aria-label]="'Duplicate item ' + (i + 1)" class="rounded px-2 py-1 text-slate-300 hover:bg-slate-800">⧉</button>
                      <button type="button" (click)="removeLine(i)" [disabled]="invoice.lines.length === 1" [attr.aria-label]="'Remove item ' + (i + 1)" class="rounded px-2 py-1 text-red-300 hover:bg-red-950 disabled:opacity-40">✕</button>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>

          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h3 class="mb-3 font-semibold text-teal-300">Discounts & taxes</h3>
            <div class="grid gap-3 sm:grid-cols-2">
              <label class="field">Invoice-wide discount
                <div class="flex gap-2">
                  <select [(ngModel)]="invoice.discountType" name="discountType" aria-label="Discount type" class="w-24 shrink-0">
                    <option value="percent">Percent</option><option value="fixed">Fixed</option>
                  </select>
                  <input [(ngModel)]="invoice.discount" name="invoiceDiscount" type="number" min="0" [max]="invoice.discountType === 'percent' ? 100 : subtotal" step="any">
                </div>
              </label>
              <div class="field">
                <span>Tax rules</span>
                <button type="button" (click)="addTax()" class="mt-1 w-fit rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold hover:bg-slate-600">＋ Add tax</button>
              </div>
            </div>
            <div class="mt-3 space-y-2">
              @for (tax of invoice.taxes; track $index; let i = $index) {
                <div class="grid grid-cols-2 items-end gap-2 rounded-lg border border-slate-700/80 p-3 sm:grid-cols-6 xl:grid-cols-12">
                  <label class="field col-span-2 min-w-0 sm:col-span-2 xl:col-span-3">Tax name
                    <input [(ngModel)]="tax.name" [name]="'taxName' + i" placeholder="GST">
                  </label>
                  <label class="field col-span-1 min-w-0 sm:col-span-1 xl:col-span-2">Rate %
                    <input [(ngModel)]="tax.rate" [name]="'taxRate' + i" type="number" min="0" max="100" step="any">
                  </label>
                  <label class="field col-span-2 min-w-0 sm:col-span-2 xl:col-span-3">Apply to
                    <select [(ngModel)]="tax.scope" [name]="'taxScope' + i">
                      <option value="invoice">Whole invoice</option><option value="items">Selected products</option>
                    </select>
                  </label>
                  <label class="flex min-w-0 items-center gap-2 whitespace-nowrap pb-2 text-xs text-slate-300 sm:col-span-1 xl:col-span-1">
                    <input [(ngModel)]="tax.inclusive" [name]="'taxInclusive' + i" type="checkbox"> Inclusive
                  </label>
                  <label class="flex min-w-0 items-center gap-2 whitespace-nowrap pb-2 text-xs text-slate-300 sm:col-span-2 xl:col-span-2" [title]="'Apply this tax on earlier taxes too'">
                    <input [(ngModel)]="tax.compound" [name]="'taxCompound' + i" type="checkbox"> Compound
                  </label>
                  <button type="button" (click)="removeTax(i)" [attr.aria-label]="'Remove tax ' + (i + 1)" class="mb-1 flex min-h-9 min-w-9 items-center justify-center justify-self-end rounded px-2 py-1 text-red-300 hover:bg-red-950 sm:col-span-1">✕</button>
                  @if (tax.scope === 'items') {
                    <div class="col-span-2 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-700 pt-2 sm:col-span-6 xl:col-span-12">
                      @for (line of invoice.lines; track line.id; let lineIndex = $index) {
                        <label class="flex items-center gap-2 text-xs text-slate-300">
                          <input type="checkbox" [checked]="tax.lineIds.includes(line.id)" (change)="toggleTaxLine(tax, line.id, $event)">
                          {{ line.description || 'Product ' + (lineIndex + 1) }}
                        </label>
                      }
                    </div>
                  }
                </div>
              }
            </div>
            <label class="field mt-3">Notes / payment terms
              <textarea [(ngModel)]="invoice.notes" name="notes" rows="2" placeholder="Thank you for your business."></textarea>
            </label>
          </section>
        </div>

        <aside class="space-y-4 xl:sticky xl:top-4">
          <section class="invoice-preview rounded-xl border border-slate-300 bg-white p-6 text-slate-800 shadow-xl sm:p-8">
            <div class="mb-7 flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div class="flex min-w-0 items-center gap-3">
                @if (invoice.company.logo) {
                  <img [src]="invoice.company.logo" alt="Company logo" class="h-14 w-14 rounded object-contain">
                }
                <div>
                  <h2 class="break-words text-xl font-bold text-slate-900">{{ invoice.company.name || 'Your Company' }}</h2>
                  <p class="whitespace-pre-line text-xs text-slate-500">{{ invoice.company.address }}</p>
                  <p class="text-xs text-slate-500">{{ invoice.company.email }} {{ invoice.company.phone }}</p>
                  @if (invoice.company.taxId) { <p class="text-xs text-slate-500">Tax ID: {{ invoice.company.taxId }}</p> }
                </div>
              </div>
              <div class="shrink-0 text-right">
                <p class="text-2xl font-light tracking-wide text-teal-700">INVOICE</p>
                <p class="mt-1 text-sm font-semibold">{{ invoice.number || 'INV-0001' }}</p>
                <p class="mt-2 text-xs text-slate-500">Date: {{ invoice.date || '—' }}</p>
                <p class="text-xs text-slate-500">Due: {{ invoice.dueDate || '—' }}</p>
              </div>
            </div>

            <div class="mb-7">
              <p class="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Bill to</p>
              <p class="font-semibold">{{ invoice.customerName || 'Client name' }}</p>
              <p class="whitespace-pre-line text-xs text-slate-500">{{ invoice.customerAddress }}</p>
              <p class="text-xs text-slate-500">{{ invoice.customerEmail }}</p>
              @if (invoice.customerTaxId) { <p class="text-xs text-slate-500">Tax ID: {{ invoice.customerTaxId }}</p> }
            </div>

            <table class="w-full text-left text-xs">
              <thead><tr class="border-y border-slate-200 text-[10px] uppercase tracking-wide text-slate-500">
                <th class="py-2">Description</th><th class="py-2 text-right">Qty</th><th class="py-2 text-right">Unit price</th><th class="py-2 text-right">Amount</th>
              </tr></thead>
              <tbody>
                @for (line of invoice.lines; track line.id) {
                  <tr class="border-b border-slate-100">
                    <td class="py-2 pr-2">
                      {{ line.description || 'Item' }}
                      @if (lineDiscountAmount(line) > 0) { <span class="block text-[10px] text-rose-600">Product discount: −{{ money(lineDiscountAmount(line)) }}</span> }
                      @for (tax of lineTaxRows(line); track tax.id) {
                        <span class="block text-[10px] text-slate-500">{{ tax.name }}: {{ money(tax.amount) }}{{ tax.inclusive ? ' (incl.)' : '' }}</span>
                      }
                    </td><td class="py-2 text-right">{{ line.quantity }}</td>
                    <td class="py-2 text-right">{{ money(line.unitPrice) }}</td><td class="py-2 text-right">{{ money(lineTotal(line)) }}</td>
                  </tr>
                }
              </tbody>
            </table>

            <div class="ml-auto mt-5 max-w-xs space-y-2 text-xs">
              <div class="flex justify-between"><span>Subtotal</span><span>{{ money(subtotal) }}</span></div>
              <div class="flex justify-between text-rose-600"><span>Invoice discount</span><span>−{{ money(discountAmount) }}</span></div>
              @for (row of taxRows; track $index) {
                <div class="flex justify-between"><span>{{ row.name }} ({{ row.rate }}%){{ row.inclusive ? ' incl.' : '' }}</span><span>{{ money(row.amount) }}</span></div>
              }
              <div class="flex justify-between border-t border-slate-300 pt-2 text-base font-bold text-slate-900"><span>Total</span><span>{{ money(total) }}</span></div>
            </div>
            @if (invoice.notes) { <p class="mt-8 whitespace-pre-line border-t border-slate-200 pt-4 text-xs text-slate-500">{{ invoice.notes }}</p> }
          </section>

          <section class="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <div class="mb-3 flex items-center justify-between gap-2">
              <h3 class="font-semibold text-teal-300">Saved invoices</h3>
              @if (savedInvoices.length) { <button type="button" (click)="clearHistory()" class="text-xs text-slate-400 hover:text-red-300">Clear history</button> }
            </div>
            @if (savedInvoices.length) {
              <ul class="space-y-2">
                @for (saved of savedInvoices; track saved.number + saved.date; let i = $index) {
                  <li class="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2">
                    <button type="button" (click)="loadInvoice(i)" class="min-w-0 text-left hover:text-teal-300">
                      <span class="block truncate text-sm font-medium">{{ saved.number }} · {{ saved.customerName || 'No client' }}</span>
                      <span class="text-xs text-slate-400">{{ saved.date }} · {{ money(saved.total, saved.currency) }}</span>
                    </button>
                    <button type="button" (click)="deleteInvoice(i)" [attr.aria-label]="'Delete saved invoice ' + saved.number" class="rounded px-2 py-1 text-red-300 hover:bg-red-950">✕</button>
                  </li>
                }
              </ul>
            } @else {
              <p class="text-xs text-slate-400">Saved invoices will appear here.</p>
            }
          </section>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .invoice-tool .field { display: flex; flex-direction: column; gap: .35rem; color: #cbd5e1; font-size: .75rem; font-weight: 600; }
    .invoice-tool input:not([type="checkbox"]):not([type="file"]), .invoice-tool textarea, .invoice-tool select {
      width: 100%; min-width: 0; border: 1px solid #334155; border-radius: .5rem; background: #020617; color: #e2e8f0;
      padding: .55rem .65rem; font-size: .8rem; font-weight: 400; outline: none;
    }
    .invoice-tool input:focus, .invoice-tool textarea:focus, .invoice-tool select:focus { border-color: #14b8a6; }
    .invoice-tool .file-input { max-width: 100%; color: #cbd5e1; font-size: .75rem; font-weight: 400; }
  `]
})
export class InvoiceGeneratorComponent {
  private readonly changeDetector = inject(ChangeDetectorRef);

  readonly currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' }, { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' }, { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$' }, { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }, { code: 'CNY', name: 'Chinese Yuan', symbol: 'CN¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' }, { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }, { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
    { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' }, { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$' }, { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' }, { code: 'KRW', name: 'South Korean Won', symbol: '₩' }
  ];
  invoice: InvoiceDraft = this.createInvoice();
  savedInvoices: SavedInvoice[] = [];
  notice = '';
  errorMessage = '';

  constructor() {
    this.restoreLocalData();
  }

  get subtotal(): number {
    return this.invoice.lines.reduce((sum, line) => sum + this.lineTotal(line), 0);
  }

  get discountAmount(): number {
    const discount = this.invoice.discountType === 'percent'
      ? this.subtotal * this.clamp(this.invoice.discount, 0, 100) / 100
      : this.clamp(this.invoice.discount, 0, this.subtotal);
    return this.round(discount);
  }

  get taxRows(): Array<InvoiceTax & { amount: number }> {
    return this.calculateTaxes().rows;
  }

  get total(): number {
    const base = Math.max(0, this.subtotal - this.discountAmount);
    return this.round(base + this.taxRows.reduce((sum, tax) => sum + (tax.inclusive ? 0 : tax.amount), 0));
  }

  lineTotal(line: InvoiceLine): number {
    const gross = Math.max(0, this.number(line.quantity)) * Math.max(0, this.number(line.unitPrice));
    const discount = line.discountType === 'fixed'
      ? this.clamp(line.discount, 0, gross)
      : gross * this.clamp(line.discount, 0, 100) / 100;
    return this.round(gross - discount);
  }

  lineDiscountAmount(line: InvoiceLine): number {
    const gross = Math.max(0, this.number(line.quantity)) * Math.max(0, this.number(line.unitPrice));
    return this.round(gross - this.lineTotal(line));
  }

  lineTaxRows(line: InvoiceLine): Array<InvoiceTax & { amount: number }> {
    return this.calculateTaxes().lineRows.get(line.id) ?? [];
  }

  toggleTaxLine(tax: InvoiceTax, lineId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const assigned = new Set(tax.lineIds);
    if (checked) assigned.add(lineId);
    else assigned.delete(lineId);
    tax.lineIds = [...assigned];
  }

  money(amount: number, currencyCode = this.invoice.currency): string {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: currencyCode }).format(this.number(amount));
    } catch {
      return `${currencyCode} ${this.number(amount).toFixed(2)}`;
    }
  }

  addLine(): void {
    this.invoice.lines.push(this.createLine());
  }

  duplicateLine(index: number): void {
    const line = this.invoice.lines[index];
    if (line) this.invoice.lines.splice(index + 1, 0, { ...line, id: this.createId() });
  }

  removeLine(index: number): void {
    if (this.invoice.lines.length > 1) this.invoice.lines.splice(index, 1);
  }

  addTax(): void {
    this.invoice.taxes.push({ id: this.createId(), name: 'Tax', rate: 0, inclusive: false, compound: false, scope: 'invoice', lineIds: [] });
  }

  removeTax(index: number): void {
    this.invoice.taxes.splice(index, 1);
  }

  newInvoice(): void {
    this.invoice = this.createInvoice(this.invoice.company);
    this.invoice.number = this.nextInvoiceNumber();
    this.notice = 'Started a new invoice.';
    this.errorMessage = '';
  }

  duplicateInvoice(): void {
    this.invoice = this.copyInvoice(this.invoice);
    this.invoice.number = this.nextInvoiceNumber();
    this.invoice.date = new Date().toISOString().slice(0, 10);
    this.notice = 'Invoice duplicated with a new number.';
    this.errorMessage = '';
  }

  saveDraft(): void {
    if (!this.invoice.company.name.trim() || !this.invoice.number.trim()) {
      this.errorMessage = 'Enter a company name and invoice number before saving.';
      this.notice = '';
      return;
    }
    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(this.invoice.company));
      const saved: SavedInvoice = {
        number: this.invoice.number,
        customerName: this.invoice.customerName,
        date: this.invoice.date,
        total: this.total,
        currency: this.invoice.currency,
        draft: this.copyInvoice(this.invoice)
      };
      this.savedInvoices = [saved, ...this.savedInvoices.filter(item => item.number !== saved.number)].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedInvoices));
      const parsedSequence = Number(this.invoice.number.match(/(\d+)$/)?.[1] ?? 0);
      if (Number.isFinite(parsedSequence)) {
        const currentSequence = Number(localStorage.getItem(SEQUENCE_KEY) ?? 0);
        localStorage.setItem(SEQUENCE_KEY, String(Math.max(currentSequence, parsedSequence)));
      }
      this.notice = 'Invoice saved in this browser.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Could not save invoice. Browser storage may be full or disabled; export a JSON backup instead.';
      this.notice = '';
    }
  }

  loadInvoice(index: number): void {
    const selected = this.savedInvoices[index];
    if (!selected) return;
    this.invoice = this.copyInvoice(selected.draft);
    this.notice = `Loaded ${selected.number}.`;
    this.errorMessage = '';
  }

  deleteInvoice(index: number): void {
    this.savedInvoices.splice(index, 1);
    this.persistHistory();
  }

  clearHistory(): void {
    this.savedInvoices = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
      this.notice = 'Saved invoice history cleared.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Could not clear saved invoice history from browser storage.';
    }
  }

  printInvoice(): void {
    if (!this.invoice.company.name.trim() || !this.invoice.number.trim() || !this.invoice.lines.some(line => line.description.trim())) {
      this.errorMessage = 'Add a company name, invoice number, and at least one described item before printing.';
      this.notice = '';
      return;
    }

    const preview = document.querySelector<HTMLElement>('.invoice-preview');
    if (!preview) {
      this.errorMessage = 'Could not find the invoice preview to print.';
      this.notice = '';
      return;
    }

    const printWindow = window.open('', '_blank', 'popup,width=900,height=700');
    if (!printWindow) {
      this.errorMessage = 'Your browser blocked the print window. Allow pop-ups for this site and try again.';
      this.notice = '';
      return;
    }

    this.errorMessage = '';
    printWindow.document.open();
    printWindow.document.write('<!doctype html><html><head><meta charset="utf-8"><title></title></head><body></body></html>');
    printWindow.document.close();

    const printStyles = printWindow.document.createElement('style');
    printStyles.textContent = `
      @page { size: A4; margin: 12mm; }
      html, body { min-height: 0; margin: 0; padding: 0; background: #fff; }
      body { color: #1e293b; font-family: Arial, sans-serif; }
      .invoice-preview { position: static !important; width: 100% !important; max-width: none !important; margin: 0 !important; box-sizing: border-box !important; }
      .invoice-preview, .invoice-preview * { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .invoice-preview tr { break-inside: avoid; page-break-inside: avoid; }
      @media print { html, body { height: auto; overflow: visible; } }
    `;
    printWindow.document.head.appendChild(printStyles);
    const previewClone = preview.cloneNode(true) as HTMLElement;
    const sourceNodes = [preview, ...Array.from(preview.querySelectorAll<HTMLElement>('*'))];
    const clonedNodes = [previewClone, ...Array.from(previewClone.querySelectorAll<HTMLElement>('*'))];
    sourceNodes.forEach((source, index) => {
      const target = clonedNodes[index];
      if (!target) return;
      const computed = window.getComputedStyle(source);
      for (let styleIndex = 0; styleIndex < computed.length; styleIndex++) {
        const property = computed.item(styleIndex);
        target.style.setProperty(property, computed.getPropertyValue(property));
      }
    });
    previewClone.style.setProperty('position', 'static', 'important');
    previewClone.style.setProperty('width', '100%', 'important');
    previewClone.style.setProperty('max-width', 'none', 'important');
    previewClone.style.setProperty('margin', '0', 'important');
    previewClone.style.setProperty('box-sizing', 'border-box', 'important');
    printWindow.document.body.appendChild(previewClone);

    const closePrintWindow = () => {
      if (!printWindow.closed) printWindow.close();
    };
    printWindow.addEventListener('afterprint', closePrintWindow, { once: true });
    void (async () => {
      const images = Array.from(printWindow.document.images);
      await Promise.all(images.map(image => image.decode().catch(() => undefined)));
      if (printWindow.closed) return;
      printWindow.focus();
      printWindow.print();
    })();
    this.notice = 'Opened the invoice preview in a print-ready view.';
    this.errorMessage = '';
  }

  exportJson(): void {
    const blob = new Blob([JSON.stringify(this.invoice, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${this.invoice.number || 'invoice'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    this.notice = 'Invoice JSON exported.';
    this.errorMessage = '';
  }

  importJson(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported: unknown = JSON.parse(String(reader.result));
        if (!this.isInvoiceDraft(imported)) {
          this.errorMessage = 'The selected JSON file is not a valid invoice export.';
          return;
        }
            this.invoice = this.normalizeInvoice(imported);
        this.notice = 'Invoice imported. Save it to add it to your saved invoices.';
        this.errorMessage = '';
      } catch {
        this.errorMessage = 'Could not parse the selected JSON file.';
      } finally {
        input.value = '';
      }
    };
    reader.onerror = () => {
      this.errorMessage = 'Could not read the selected JSON file.';
      input.value = '';
    };
    reader.readAsText(file);
  }

  async uploadLogo(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Choose a valid image file for the company logo.';
      input.value = '';
      return;
    }
    try {
      const bitmap = await this.decodeLogo(file);
      try {
        const scale = Math.min(1, 512 / bitmap.width, 320 / bitmap.height);
        let width = Math.max(1, Math.round(bitmap.width * scale));
        let height = Math.max(1, Math.round(bitmap.height * scale));
        let compressed = await this.encodeLogo(bitmap, width, height, 0.82);

        for (let attempt = 0; compressed.size > 250 * 1024 && attempt < 4; attempt++) {
          width = Math.max(1, Math.round(width * 0.8));
          height = Math.max(1, Math.round(height * 0.8));
          compressed = await this.encodeLogo(bitmap, width, height, 0.72);
        }

        this.invoice.company.logo = await this.blobAsDataUrl(compressed);
        this.errorMessage = '';
        this.notice = 'Company logo resized and compressed for the invoice.';
        this.changeDetector.markForCheck();
        try {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(this.invoice.company));
        } catch {
          this.errorMessage = 'Logo added to this invoice, but could not be saved for future invoices because browser storage is full or disabled.';
          this.changeDetector.markForCheck();
        }
      } finally {
        bitmap.close?.();
      }
    } catch {
      this.errorMessage = 'Could not process this image. Try another image format or a smaller source image.';
      this.changeDetector.markForCheck();
    } finally {
      input.value = '';
    }
  }

  private async decodeLogo(file: File): Promise<{
    source: CanvasImageSource;
    width: number;
    height: number;
    close?: () => void;
  }> {
    if (typeof createImageBitmap === 'function') {
      try {
        const bitmap = await createImageBitmap(file);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          close: () => bitmap.close()
        };
      } catch {
        // Fall back to HTML image decoding for formats unsupported by createImageBitmap.
      }
    }

    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('Image has invalid dimensions');
      return { source: image, width: image.naturalWidth, height: image.naturalHeight };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  private encodeLogo(bitmap: { source: CanvasImageSource }, width: number, height: number, quality: number): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) return Promise.reject(new Error('Canvas is unavailable'));
    context.drawImage(bitmap.source, 0, 0, width, height);
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) resolve(blob);
        else reject(new Error('Image compression failed'));
      }, 'image/webp', quality);
    });
  }

  private blobAsDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('Compressed image could not be read'));
      reader.onerror = () => reject(new Error('Compressed image could not be read'));
      reader.readAsDataURL(blob);
    });
  }

  private restoreLocalData(): void {
    try {
      const profile = localStorage.getItem(PROFILE_KEY);
      if (profile) this.invoice.company = { ...this.invoice.company, ...JSON.parse(profile) as Partial<CompanyProfile> };
      const history = localStorage.getItem(STORAGE_KEY);
      if (history) {
        const parsed: unknown = JSON.parse(history);
        if (Array.isArray(parsed)) {
          this.savedInvoices = parsed.flatMap((entry): SavedInvoice[] => {
            if (typeof entry !== 'object' || entry === null) return [];
            const saved = entry as Partial<SavedInvoice>;
            if (typeof saved.draft !== 'object' || saved.draft === null) return [];
            return [{
              number: typeof saved.number === 'string' ? saved.number : '',
              customerName: typeof saved.customerName === 'string' ? saved.customerName : '',
              date: typeof saved.date === 'string' ? saved.date : '',
              total: this.number(saved.total ?? 0),
              currency: typeof saved.currency === 'string' ? saved.currency : 'USD',
              draft: this.normalizeInvoice(saved.draft as InvoiceDraft)
            }];
          });
        }
      }
    } catch {
      this.errorMessage = 'Saved invoice data could not be read. You can continue with a new invoice.';
    }
  }

  private persistHistory(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.savedInvoices));
      this.notice = 'Saved invoice removed.';
      this.errorMessage = '';
    } catch {
      this.errorMessage = 'Could not update saved invoice history in browser storage.';
    }
  }

  private createInvoice(company: CompanyProfile = this.defaultCompany()): InvoiceDraft {
    const today = new Date().toISOString().slice(0, 10);
    const year = new Date().getFullYear();
    return {
      number: `INV-${year}-001`,
      date: today,
      dueDate: today,
      currency: 'INR',
      company: { ...company },
      customerName: '',
      customerAddress: '',
      customerEmail: '',
      customerTaxId: '',
      lines: [this.createLine()],
      discountType: 'percent',
      discount: 0,
      taxes: [],
      notes: 'Thank you for your business.'
    };
  }

  private defaultCompany(): CompanyProfile {
    return { name: '', address: '', email: '', phone: '', taxId: '', logo: '' };
  }

  private copyInvoice(invoice: InvoiceDraft): InvoiceDraft {
    return JSON.parse(JSON.stringify(invoice)) as InvoiceDraft;
  }

  private createLine(): InvoiceLine {
    return { id: this.createId(), description: '', quantity: 1, unitPrice: 0, discountType: 'percent', discount: 0 };
  }

  private createId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private normalizeInvoice(invoice: InvoiceDraft): InvoiceDraft {
    const defaults = this.createInvoice();
    const company = typeof invoice.company === 'object' && invoice.company !== null
      ? { ...defaults.company, ...invoice.company }
      : defaults.company;
    const lines = Array.isArray(invoice.lines) ? invoice.lines.map(line => ({
      id: typeof line.id === 'string' && line.id ? line.id : this.createId(),
      description: typeof line.description === 'string' ? line.description : '',
      quantity: this.number(line.quantity),
      unitPrice: this.number(line.unitPrice),
      discountType: line.discountType === 'fixed' ? 'fixed' as const : 'percent' as const,
      discount: this.number(line.discount)
    })) : defaults.lines;
    const taxes = Array.isArray(invoice.taxes) ? invoice.taxes.map(tax => ({
      id: typeof tax.id === 'string' && tax.id ? tax.id : this.createId(),
      name: typeof tax.name === 'string' ? tax.name : 'Tax',
      rate: this.number(tax.rate),
      inclusive: Boolean(tax.inclusive),
      compound: Boolean(tax.compound),
      scope: tax.scope === 'items' ? 'items' as const : 'invoice' as const,
      lineIds: Array.isArray(tax.lineIds) ? tax.lineIds.filter((id): id is string => typeof id === 'string') : []
    })) : [];

    return {
      ...defaults,
      ...invoice,
      company,
      lines: lines.length ? lines : defaults.lines,
      taxes,
      discountType: invoice.discountType === 'fixed' ? 'fixed' : 'percent',
      discount: this.number(invoice.discount),
      currency: typeof invoice.currency === 'string' ? invoice.currency : 'USD'
    };
  }

  private calculateTaxes(): {
    rows: Array<InvoiceTax & { amount: number }>;
    lineRows: Map<string, Array<InvoiceTax & { amount: number }>>;
  } {
    const rows: Array<InvoiceTax & { amount: number }> = [];
    const lineRows = new Map<string, Array<InvoiceTax & { amount: number }>>();
    const previousTaxByLine = new Map<string, number>();
    let previousTaxTotal = 0;
    const taxableBase = new Map(this.invoice.lines.map(line => {
      const invoiceDiscountShare = this.subtotal > 0
        ? this.discountAmount * this.lineTotal(line) / this.subtotal
        : 0;
      return [line.id, Math.max(0, this.lineTotal(line) - invoiceDiscountShare)];
    }));

    for (const tax of this.invoice.taxes) {
      const rate = this.clamp(tax.rate, 0, 100) / 100;
      const selectedLines = tax.scope === 'items'
        ? this.invoice.lines.filter(line => tax.lineIds.includes(line.id))
        : [];
      let amount = 0;

      if (tax.scope === 'items') {
        for (const line of selectedLines) {
          const lineBase = (taxableBase.get(line.id) ?? 0) +
            (tax.compound ? previousTaxByLine.get(line.id) ?? 0 : 0);
          const lineTax = this.round(tax.inclusive ? lineBase * rate / (1 + rate) : lineBase * rate);
          amount += lineTax;
          previousTaxByLine.set(line.id, (previousTaxByLine.get(line.id) ?? 0) + lineTax);
          const lineTaxRows = lineRows.get(line.id) ?? [];
          lineTaxRows.push({ ...tax, amount: lineTax });
          lineRows.set(line.id, lineTaxRows);
        }
      } else {
        const base = Math.max(0, this.subtotal - this.discountAmount) +
          (tax.compound ? previousTaxTotal : 0);
        amount = this.round(tax.inclusive ? base * rate / (1 + rate) : base * rate);
        if (tax.compound && previousTaxTotal > 0) {
          for (const line of this.invoice.lines) {
            const share = base > 0 ? (previousTaxByLine.get(line.id) ?? 0) / previousTaxTotal : 0;
            previousTaxByLine.set(line.id, (previousTaxByLine.get(line.id) ?? 0) + amount * share);
          }
        } else if (amount > 0 && base > 0) {
          for (const line of this.invoice.lines) {
            const share = (taxableBase.get(line.id) ?? 0) / base;
            previousTaxByLine.set(line.id, (previousTaxByLine.get(line.id) ?? 0) + amount * share);
          }
        }
      }

      amount = this.round(amount);
      rows.push({ ...tax, amount });
      previousTaxTotal += amount;
    }
    return { rows, lineRows };
  }

  private nextInvoiceNumber(): string {
    const year = new Date().getFullYear();
    let previous = 0;
    try {
      previous = Number(localStorage.getItem(SEQUENCE_KEY) ?? 0);
      if (!Number.isFinite(previous) || previous < 0) previous = 0;
      const next = previous + 1;
      localStorage.setItem(SEQUENCE_KEY, String(next));
      return `INV-${year}-${String(next).padStart(3, '0')}`;
    } catch {
      this.errorMessage = 'Could not persist invoice numbering. The invoice number can still be edited manually.';
      return `INV-${year}-${String(Date.now()).slice(-5)}`;
    }
  }

  private isInvoiceDraft(value: unknown): value is InvoiceDraft {
    if (typeof value !== 'object' || value === null) return false;
    const candidate = value as Partial<InvoiceDraft>;
    return typeof candidate.number === 'string' &&
      typeof candidate.currency === 'string' &&
      typeof candidate.company === 'object' && candidate.company !== null &&
      Array.isArray(candidate.lines) &&
      candidate.lines.every(line => typeof line === 'object' && line !== null &&
        typeof line.description === 'string' &&
        Number.isFinite(Number(line.quantity)) &&
        Number.isFinite(Number(line.unitPrice)) &&
        Number.isFinite(Number(line.discount))) &&
      Array.isArray(candidate.taxes) &&
      candidate.taxes.every(tax => typeof tax === 'object' && tax !== null &&
        typeof tax.name === 'string' && Number.isFinite(Number(tax.rate)));
  }

  private number(value: number): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, this.number(value)));
  }

  private round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
