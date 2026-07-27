// ===== GESTURE RECOGNITION SYSTEM =====
// Touch event handling for different gesture types

const GestureSystem = {
    expectedType: 'tap',
    callback: null,
    _startX: 0,
    _startY: 0,
    _startTime: 0,
    _isDown: false,
    _longPressTimer: null,
    _longPressActive: false,
    _bound: false,
    _element: null,

    init(element) {
        if (this._bound) this.destroy();
        this._element = element;
        this._onStart = this._handleStart.bind(this);
        this._onMove = this._handleMove.bind(this);
        this._onEnd = this._handleEnd.bind(this);

        element.addEventListener('touchstart', this._onStart, { passive: false });
        element.addEventListener('touchmove', this._onMove, { passive: false });
        element.addEventListener('touchend', this._onEnd, { passive: false });
        // Mouse fallback for desktop testing
        element.addEventListener('mousedown', this._onStart);
        element.addEventListener('mousemove', this._onMove);
        element.addEventListener('mouseup', this._onEnd);
        this._bound = true;
    },

    setExpected(type, callback) {
        this.expectedType = type;
        this.callback = callback;
        this._longPressActive = false;
    },

    _getPos(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.changedTouches && e.changedTouches.length > 0) {
            return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
        }
        return { x: e.clientX, y: e.clientY };
    },

    _handleStart(e) {
        e.preventDefault();
        const pos = this._getPos(e);
        this._startX = pos.x;
        this._startY = pos.y;
        this._startTime = Date.now();
        this._isDown = true;
        this._longPressActive = false;

        // Start long press detection
        if (this.expectedType === 'long_press') {
            this._longPressTimer = setTimeout(() => {
                if (this._isDown) {
                    this._longPressActive = true;
                    // Visual feedback could be added here
                }
            }, 300);
        }
    },

    _handleMove(e) {
        e.preventDefault();
    },

    _handleEnd(e) {
        e.preventDefault();
        if (!this._isDown) return;
        this._isDown = false;

        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
            this._longPressTimer = null;
        }

        const pos = this._getPos(e);
        const dx = pos.x - this._startX;
        const dy = pos.y - this._startY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - this._startTime;

        const detected = this._classify(dx, dy, dist, duration);

        if (this.callback && detected === this.expectedType) {
            this.callback('correct', detected);
        } else if (this.callback) {
            this.callback('wrong', detected);
        }
    },

    _classify(dx, dy, dist, duration) {
        const SWIPE_THRESHOLD = 50;

        // Long press: held > 500ms and minimal movement
        if (this.expectedType === 'long_press' && this._longPressActive && dist < 30) {
            return 'long_press';
        }

        // Swipe detection
        if (dist > SWIPE_THRESHOLD && duration < 500) {
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);

            if (absDy > absDx) {
                return dy > 0 ? 'swipe_down' : 'swipe_up';
            } else {
                return dx > 0 ? 'swipe_right' : 'swipe_left';
            }
        }

        // Tap: short duration, minimal movement
        if (dist < 30 && duration < 400) {
            return 'tap';
        }

        // Default: treat as tap for short gestures
        if (dist < 30) return 'tap';

        return 'unknown';
    },

    destroy() {
        if (this._element && this._bound) {
            this._element.removeEventListener('touchstart', this._onStart);
            this._element.removeEventListener('touchmove', this._onMove);
            this._element.removeEventListener('touchend', this._onEnd);
            this._element.removeEventListener('mousedown', this._onStart);
            this._element.removeEventListener('mousemove', this._onMove);
            this._element.removeEventListener('mouseup', this._onEnd);
            this._bound = false;
        }
        if (this._longPressTimer) {
            clearTimeout(this._longPressTimer);
        }
    },
};
