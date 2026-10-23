import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface KanbanTask {
  id: string;
  title: string;
  column: 'todo' | 'in-progress' | 'done';
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-700">
        <h3 class="text-lg font-bold text-white mb-2 flex items-center space-x-2">
          <span>📋 Kanban / Sticky Notes Board</span>
        </h3>
        <p class="text-xs text-slate-400">
          In-browser local storage task management board with Todo, In-Progress, and Done columns.
        </p>

        <div class="mt-4 space-y-4">
          <!-- New Task Input -->
          <div class="flex gap-2">
            <input type="text" [ngModel]="newTaskTitle()" (ngModelChange)="newTaskTitle.set($event)"
                   placeholder="Enter new task description..."
                   class="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-500">
            <button (click)="addTask()" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow">
              ➕ Add Task
            </button>
          </div>

          <!-- Board Columns -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- Todo Column -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
              <h4 class="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                <span>📌 To Do</span>
                <span class="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full">{{ getColumnTasks('todo').length }}</span>
              </h4>
              <div class="space-y-2">
                @for (task of getColumnTasks('todo'); track task.id) {
                  <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center justify-between group">
                    <span class="text-xs text-slate-200">{{ task.title }}</span>
                    <div class="flex space-x-1">
                      <button (click)="moveTask(task.id, 'in-progress')" class="text-xs p-1 hover:text-indigo-400" title="Move to In Progress">➔</button>
                      <button (click)="deleteTask(task.id)" class="text-xs p-1 text-slate-500 hover:text-red-400">✕</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- In Progress Column -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
              <h4 class="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center justify-between">
                <span>⚙️ In Progress</span>
                <span class="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full">{{ getColumnTasks('in-progress').length }}</span>
              </h4>
              <div class="space-y-2">
                @for (task of getColumnTasks('in-progress'); track task.id) {
                  <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center justify-between group">
                    <span class="text-xs text-slate-200">{{ task.title }}</span>
                    <div class="flex space-x-1">
                      <button (click)="moveTask(task.id, 'done')" class="text-xs p-1 hover:text-emerald-400" title="Move to Done">➔</button>
                      <button (click)="deleteTask(task.id)" class="text-xs p-1 text-slate-500 hover:text-red-400">✕</button>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Done Column -->
            <div class="bg-slate-800 p-4 rounded-xl border border-slate-700 space-y-3">
              <h4 class="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-between">
                <span>✅ Done</span>
                <span class="text-[10px] bg-slate-900 px-2 py-0.5 rounded-full">{{ getColumnTasks('done').length }}</span>
              </h4>
              <div class="space-y-2">
                @for (task of getColumnTasks('done'); track task.id) {
                  <div class="bg-slate-900 p-3 rounded-lg border border-slate-700 flex items-center justify-between group">
                    <span class="text-xs text-slate-400 line-through">{{ task.title }}</span>
                    <button (click)="deleteTask(task.id)" class="text-xs p-1 text-slate-500 hover:text-red-400">✕</button>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanBoardComponent {
  newTaskTitle = signal<string>('');
  tasks = signal<KanbanTask[]>([
    { id: '1', title: 'Explore Minimi 100 Tools Suite', column: 'todo' },
    { id: '2', title: 'Test Image Compressor', column: 'in-progress' },
    { id: '3', title: 'Verify Search Engine', column: 'done' }
  ]);

  getColumnTasks(col: 'todo' | 'in-progress' | 'done'): KanbanTask[] {
    return this.tasks().filter(t => t.column === col);
  }

  addTask() {
    const title = this.newTaskTitle().trim();
    if (!title) return;

    const newTask: KanbanTask = {
      id: Date.now().toString(),
      title,
      column: 'todo'
    };
    this.tasks.set([...this.tasks(), newTask]);
    this.newTaskTitle.set('');
  }

  moveTask(id: string, col: 'todo' | 'in-progress' | 'done') {
    const updated = this.tasks().map(t => t.id === id ? { ...t, column: col } : t);
    this.tasks.set(updated);
  }

  deleteTask(id: string) {
    this.tasks.set(this.tasks().filter(t => t.id !== id));
  }
}
