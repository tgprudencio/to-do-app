import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage) {
    this.init();
  }

  async init() {
    const storage = await this.storage.create();
    this._storage = storage;
  }

  async saveTasks(userId: number, tasks: any) {
    await this.storage.set(userId.toString(), tasks); 
  }

  async getTasks(userId: number) {
    const tasks = await this.storage.get(userId.toString());
    return tasks;
  }

}