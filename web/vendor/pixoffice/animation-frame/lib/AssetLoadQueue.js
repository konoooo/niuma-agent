/** Bound texture downloads across the office and sidebar without serializing whole packs. */
export class AssetLoadQueue {
    active = 0;
    pending = [];
    concurrency;
    constructor(concurrency = 4) {
        if (!Number.isInteger(concurrency) || concurrency < 1)
            throw new Error('Invalid asset concurrency');
        this.concurrency = concurrency;
    }
    run(load) {
        return new Promise((resolve, reject) => {
            this.pending.push(() => {
                this.active++;
                const finish = () => { this.active--; this.drain(); };
                Promise.resolve().then(load).then(value => { resolve(value); finish(); }, error => { reject(error); finish(); });
            });
            this.drain();
        });
    }
    drain() {
        while (this.active < this.concurrency && this.pending.length)
            this.pending.shift()();
    }
}
export const textureLoadQueue = new AssetLoadQueue(4);