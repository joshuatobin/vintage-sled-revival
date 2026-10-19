import { DurableObject } from 'cloudflare:workers';
import { createWorker, GarageStore as Store } from './garage.mjs';

export class GarageStore extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.store = new Store(ctx);
  }

  fetch(request) { return this.store.fetch(request); }
}

export default createWorker();
