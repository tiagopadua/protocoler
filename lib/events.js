// For browsers
class EventEmitter {

    constructor() {
        this.listeners = new Map();
    }

    // This is used to define which events the class will process. Should not be called externally
    _registerEvent(eventName) {
        if (this.listeners.has(eventName)) {
            console.warn('Event is already registered:', eventName);
        } else {
            this.listeners.set(eventName, []);
        }
        return true;
    }

    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            console.error('Unable to add listener. Event not recognized:', eventName);
            return false;
        }

        if (typeof callback !== 'function') {
            console.error('Unable to add listener. Callback is not a function! Instead received:', typeof callback);
            return false;
        }

        // Find if callback is already registered
        let callbackList = this.listeners.get(eventName);
        let callbackFound = !callbackList.every(callbackRegistered => callback !== callbackRegistered);  // Return true if callback is not exactly the same as one of the already registered
        if (callbackFound) {
            console.error('Listener already added for the exact same callback. Skipping...');
            return false;
        }

        // Now that everything is OK, really add the callback
        callbackList.push(callback);
        return true;
    }

    addEventListener(eventName, callback) {
        return this.on(eventName, callback);
    }

    once(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            console.error('Unable to add listener. Event not recognized:', eventName);
            return false;
        }

        if (typeof callback !== 'function') {
            console.error('Unable to add listener. Callback is not a function! Instead received:', typeof callback);
            return false;
        }

        // Find if callback is already registered
        let callbackList = this.listeners.get(eventName);
        let callbackFound = !callbackList.every(callbackRegistered => callback !== callbackRegistered); // Return false if callback is not exactly the same as one of the already registered
        if (callbackFound) {
            console.error('Listener already added for the exact same callback. Skipping...');
            return false;
        }
    }

    off(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            console.error('Unable to remove listener. Event not recognized:', eventName);
            return false;
        }

        if (typeof callback !== 'function') {
            console.error('Unable to remove listener. Callback is not a function! Instead received:', typeof callback);
            return false;
        }

        let callbackIndex = null;
        let callbackList = this.listeners.get(eventName);
        let callbackNotFound = callbackList.some((callbackRegistered, currentIndex) => {
            if (callback === callbackRegistered) {
                callbackIndex = currentIndex;
                return false; // Found! So, break
            }
            return true; // continue
        });
        if (callbackNotFound || callbackIndex === null) {
            console.info('Callback not found, so will not remove it. Continuing as normal.');
            return false;
        }

        callbackList.splice(callbackIndex, 1); // Remove it from the list
        return true;
    }

    removeEventListener(eventName, callback) {
        return this.off(eventName, callback);
    }

    emit(eventName) {
        if (!this.listeners.has(eventName)) {
            console.error('Unable to emit event. Event name not recognized:', eventName);
            return false;
        }

        let args = [].slice.apply(arguments);
        args.shift();  // Remove first argument (which is eventName)

        let callbackList = this.listeners.get(eventName);
        callbackList.every(callback => {
            try {
                callback.apply(this, args);
            } catch(e) {
                console.warn('Exception caught while in callback function for event', eventName);
                console.trace(e);
            }
            return true;  // Do not break loop
        });

        return true;
    }

};

module.exports = EventEmitter;
