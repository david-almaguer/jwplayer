
export class ItemPromise {

    constructor (index, model, api) {
        this.index = index;
        this.model = model;
        this.api = api;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        this.async = null;
    }

    set callback (handler) {
        this.async = handler;
    }

    run () {
        const { api, async, index, resolve, reject, promise } = this;
        const playlistItem = this.getItem(index);
        if (!playlistItem) {
            const message = index === -1 ? 'No recs item' : `No playlist item at index ${index}`;
            reject(new Error(message));
        }
        if (async) {
            this.clear();
            const asyncPromise = async.call(api, playlistItem, index) || Promise.resolve();
            asyncPromise.then(resolve).catch(reject);
        } else {
            resolve(playlistItem);
        }
        return promise;
    }

    getItem(index) {
        const { model } = this;
        if (index === -1) {
            return model.get('nextUp');
        }
        const playlist = model.get('playlist');
        return playlist[index];
    }

    clear () {
        this.async = null;
    }

    preload () {
        return this.run();
    }

    setItem (index) {
        if (index !== this.index) {
            this.reject(new Error(`Item ${this.index} was skipped.`));
        }
        return this.run();
    }

}