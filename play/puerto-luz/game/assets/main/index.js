System.register("chunks:///_virtual/Animatic.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "bb8c2xe/mBFSLZHK7fkKjUX", "Animatic", undefined);
      // Generated from content/prologue.json; edit the source and rebuild.
      var ANIMATIC = exports('ANIMATIC', {
        "version": 1,
        "duration": 90,
        "shots": [{
          "id": "harbor",
          "duration": 10,
          "speaker": "PUERTO LUZ",
          "es": "A las seis, el puerto guarda silencio. La vieja radio aún espera una voz.",
          "pt": "Às seis, o porto fica em silêncio. A antiga rádio ainda espera uma voz.",
          "start": 0
        }, {
          "id": "return",
          "duration": 10,
          "speaker": "ELENA · 32",
          "es": "Diez años. Pensé que esta puerta ya no estaría aquí.",
          "pt": "Dez anos. Achei que esta porta já não estaria aqui.",
          "start": 10
        }, {
          "id": "key",
          "duration": 10,
          "speaker": "MATEO · 34",
          "es": "La cerradura cambió. La llave de repuesto sigue bajo la maceta.",
          "pt": "A fechadura mudou. A chave reserva continua debaixo do vaso.",
          "start": 20
        }, {
          "id": "room",
          "duration": 10,
          "speaker": "ELENA",
          "es": "¿Conservaste todo? Hasta la lámpara que nunca funcionó.",
          "pt": "Você guardou tudo? Até a luminária que nunca funcionou.",
          "start": 30
        }, {
          "id": "lamp",
          "duration": 10,
          "speaker": "MATEO",
          "es": "Algunas cosas sólo necesitan otra oportunidad.",
          "pt": "Algumas coisas só precisam de outra chance.",
          "start": 40
        }, {
          "id": "tape",
          "duration": 10,
          "speaker": "ELENA",
          "es": "Esa cinta… No la pongas todavía.",
          "pt": "Essa fita… Não coloque para tocar ainda.",
          "start": 50
        }, {
          "id": "static",
          "duration": 10,
          "speaker": "MATEO",
          "es": "Tranquila. Primero hay que quitar todo este ruido.",
          "pt": "Calma. Primeiro precisamos tirar todo esse ruído.",
          "start": 60
        }, {
          "id": "together",
          "duration": 10,
          "speaker": "ELENA",
          "es": "Yo arreglo la señal. Tú quédate esta vez.",
          "pt": "Eu conserto o sinal. Desta vez, você fica.",
          "start": 70
        }, {
          "id": "begin",
          "duration": 10,
          "speaker": "MATEO",
          "es": "Aquí estaré. Empecemos por la consola.",
          "pt": "Vou estar aqui. Vamos começar pela mesa de som.",
          "start": 80
        }]
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ArtLibrary.ts", ['cc'], function (exports) {
  var cclegacy, Node, Layers, UITransform, Mask, Sprite, Color, resources, SpriteFrame, Texture2D;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Mask = module.Mask;
      Sprite = module.Sprite;
      Color = module.Color;
      resources = module.resources;
      SpriteFrame = module.SpriteFrame;
      Texture2D = module.Texture2D;
    }],
    execute: function () {
      cclegacy._RF.push({}, "647eeFrkf5J4bmlvMuRx1zq", "ArtLibrary", undefined);
      /** Shared cached original artwork. UI owns layout; delayed requests never revive destroyed pages. */
      var ArtLibrary = exports('ArtLibrary', /*#__PURE__*/function () {
        function ArtLibrary() {
          this.cache = new Map();
          this.loading = new Map();
        }
        var _proto = ArtLibrary.prototype;
        _proto.picture = function picture(parent, key, x, y, w, h, opacity, alignY) {
          if (opacity === void 0) {
            opacity = 255;
          }
          if (alignY === void 0) {
            alignY = .5;
          }
          var box = new Node('Artwork:' + key);
          box.layer = Layers.Enum.UI_2D;
          parent.addChild(box);
          box.setPosition(x + w / 2, -y - h / 2);
          box.addComponent(UITransform).setContentSize(w, h);
          box.addComponent(Mask).type = Mask.Type.GRAPHICS_RECT;
          var image = new Node('Image');
          image.layer = Layers.Enum.UI_2D;
          box.addChild(image);
          var ui = image.addComponent(UITransform),
            sprite = image.addComponent(Sprite);
          sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          sprite.color = new Color(255, 255, 255, opacity);
          this.get(key, function (frame) {
            if (!box.isValid || !image.isValid || !frame) return;
            sprite.spriteFrame = frame;
            var s = frame.originalSize,
              k = Math.max(w / s.width, h / s.height);
            ui.setContentSize(s.width * k, s.height * k);
            image.setPosition(0, (s.height * k - h) * (Math.max(0, Math.min(1, alignY)) - .5));
          });
          return box;
        };
        _proto.get = function get(key, done) {
          var _this = this;
          var cached = this.cache.get(key);
          if (cached) {
            done(cached);
            return;
          }
          var pending = this.loading.get(key);
          if (pending) {
            pending.push(done);
            return;
          }
          this.loading.set(key, [done]);
          var end = function end(frame) {
            if (frame) _this.cache.set(key, frame);
            var callbacks = _this.loading.get(key) || [];
            _this.loading["delete"](key);
            callbacks.forEach(function (f) {
              return f(frame);
            });
          };
          var path = 'art/' + key;
          if (resources.getInfoWithPath(path + '/spriteFrame', SpriteFrame)) resources.load(path + '/spriteFrame', SpriteFrame, function (error, frame) {
            return end(error ? null : frame);
          });else if (resources.getInfoWithPath(path + '/texture', Texture2D)) resources.load(path + '/texture', Texture2D, function (error, texture) {
            if (error || !texture) {
              end(null);
              return;
            }
            var frame = new SpriteFrame();
            frame.texture = texture;
            end(frame);
          });else end(null);
        };
        return ArtLibrary;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/BoardFeedback.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Puzzle.ts'], function (exports) {
  var _createClass, _extends, cclegacy, clone;
  return {
    setters: [function (module) {
      _createClass = module.createClass;
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      clone = module.clone;
    }],
    execute: function () {
      cclegacy._RF.push({}, "df9757IRFtGyrezH3hxrp5s", "BoardFeedback", undefined);
      /** Presentation only: consumes immutable rule results and never commits a command. */
      var BoardFeedback = exports('BoardFeedback', /*#__PURE__*/function () {
        function BoardFeedback(sound) {
          this.queue = [];
          this.stage = null;
          this.elapsed = 0;
          this.history = [];
          this.revision = 0;
          this.sound = sound;
        }
        var _proto = BoardFeedback.prototype;
        _proto.start = function start(before, after, frames, swap, rejected, reduced) {
          var _this = this;
          if (rejected === void 0) {
            rejected = false;
          }
          if (reduced === void 0) {
            reduced = false;
          }
          this.queue = [];
          this.history = [];
          var time = function time(n) {
            return reduced ? Math.min(.08, n) : n;
          };
          if (swap) {
            var dx = (swap.b % 7 - swap.a % 7) * 50,
              dy = (Math.floor(swap.b / 7) - Math.floor(swap.a / 7)) * 50;
            this.queue.push({
              phase: rejected ? 'reject' : 'swap',
              duration: time(rejected ? .24 : .14),
              board: clone(before),
              cleared: [],
              motions: [{
                index: swap.a,
                dx: dx,
                dy: dy
              }, {
                index: swap.b,
                dx: -dx,
                dy: -dy
              }],
              cascade: 0,
              gain: 0,
              crates: []
            });
          }
          var previous = before;
          if (!rejected) {
            var _loop = function _loop() {
              var frame = frames[i],
                shown = _extends({}, clone(after), {
                  cells: clone(frame.cells),
                  crates: [].concat(frame.crates),
                  collected: frame.collected,
                  broken: frame.broken
                });
              var broken = previous.crates.filter(function (c) {
                return !frame.crates.includes(c);
              });
              _this.queue.push({
                phase: 'clear',
                duration: time(.18),
                board: shown,
                cleared: [].concat(frame.cleared),
                motions: [],
                cascade: frame.cascade,
                gain: frame.collected - previous.collected,
                crates: broken
              });
              var next = frames[i + 1],
                fallen = next ? _extends({}, clone(after), {
                  cells: clone(next.cells),
                  crates: [].concat(frame.crates),
                  collected: frame.collected,
                  broken: frame.broken
                }) : clone(after),
                motions = [];
              for (var c = 0; c < 7; c++) {
                var survivors = [];
                for (var r = 6; r >= 0; r--) if (!frame.cleared.includes(r * 7 + c)) survivors.push(r);
                for (var _r = 6; _r >= 0; _r--) {
                  var slot = 6 - _r,
                    source = slot < survivors.length ? survivors[slot] : -(slot - survivors.length + 1);
                  motions.push({
                    index: _r * 7 + c,
                    dx: 0,
                    dy: (source - _r) * 50
                  });
                }
              }
              _this.queue.push({
                phase: 'fall',
                duration: time(.18),
                board: fallen,
                cleared: [],
                motions: motions,
                cascade: frame.cascade,
                gain: 0,
                crates: []
              });
              previous = shown;
            };
            for (var i = 0; i < frames.length; i++) {
              _loop();
            }
          }
          this.advance();
        };
        _proto.advance = function advance() {
          this.stage = this.queue.shift() || null;
          this.elapsed = 0;
          this.revision++;
          if (!this.stage) return;
          this.history.push(this.stage.phase);
          if (this.stage.phase === 'clear') {
            this.sound(this.stage.cascade > 1 ? 'cascade' : 'match');
            if (this.stage.crates.length) this.sound('crate');
          } else if (this.stage.phase === 'swap' || this.stage.phase === 'reject') this.sound(this.stage.phase);
        };
        _proto.finish = function finish() {
          this.queue = [];
          this.stage = null;
          this.elapsed = 0;
          this.revision++;
        };
        _proto.update = function update(dt) {
          if (!this.stage) return false;
          this.elapsed += dt;
          if (this.elapsed >= this.stage.duration) {
            this.advance();
            return true;
          }
          return false;
        };
        _proto.transform = function transform(index, reduced) {
          var s = this.stage,
            p = this.progress;
          if (!s) return {
            dx: 0,
            dy: 0,
            scale: 1
          };
          if (reduced) return {
            dx: 0,
            dy: 0,
            scale: s.phase === 'clear' && s.cleared.includes(index) ? .85 : 1
          };
          var motion = s.motions.find(function (m) {
            return m.index === index;
          });
          var factor = 0;
          if (s.phase === 'swap') factor = p * p * (3 - 2 * p);
          if (s.phase === 'reject') factor = Math.sin(p * Math.PI) * .62;
          if (s.phase === 'fall') factor = (1 - p) * (1 - p);
          return {
            dx: ((motion == null ? void 0 : motion.dx) || 0) * factor,
            dy: ((motion == null ? void 0 : motion.dy) || 0) * factor,
            scale: s.phase === 'clear' && s.cleared.includes(index) ? Math.max(.05, 1 - p) : 1
          };
        };
        _proto.snapshot = function snapshot() {
          var _this$stage, _this$stage2, _this$stage3, _this$stage4;
          return {
            phase: this.phase,
            progress: this.progress,
            cascade: ((_this$stage = this.stage) == null ? void 0 : _this$stage.cascade) || 0,
            gain: ((_this$stage2 = this.stage) == null ? void 0 : _this$stage2.gain) || 0,
            cleared: ((_this$stage3 = this.stage) == null ? void 0 : _this$stage3.cleared) || [],
            brokenCrates: ((_this$stage4 = this.stage) == null ? void 0 : _this$stage4.crates) || [],
            history: [].concat(this.history),
            revision: this.revision
          };
        };
        _createClass(BoardFeedback, [{
          key: "active",
          get: function get() {
            return !!this.stage;
          }
        }, {
          key: "phase",
          get: function get() {
            var _this$stage5;
            return ((_this$stage5 = this.stage) == null ? void 0 : _this$stage5.phase) || 'idle';
          }
        }, {
          key: "progress",
          get: function get() {
            return this.stage ? Math.min(1, this.elapsed / this.stage.duration) : 0;
          }
        }, {
          key: "board",
          get: function get() {
            var _this$stage6;
            return ((_this$stage6 = this.stage) == null ? void 0 : _this$stage6.board) || null;
          }
        }]);
        return BoardFeedback;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ComicPlayer.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './SceneFraming.ts', './VoicePolicy.ts'], function (exports) {
  var _extends, _createClass, cclegacy, UITransform, resources, AudioClip, SpriteFrame, Texture2D, Node, Layers, Mask, Sprite, Color, AudioSource, SCENE_FOCUS, voiceResourceFor;
  return {
    setters: [function (module) {
      _extends = module.extends;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      UITransform = module.UITransform;
      resources = module.resources;
      AudioClip = module.AudioClip;
      SpriteFrame = module.SpriteFrame;
      Texture2D = module.Texture2D;
      Node = module.Node;
      Layers = module.Layers;
      Mask = module.Mask;
      Sprite = module.Sprite;
      Color = module.Color;
      AudioSource = module.AudioSource;
    }, function (module) {
      SCENE_FOCUS = module.SCENE_FOCUS;
    }, function (module) {
      voiceResourceFor = module.voiceResourceFor;
    }],
    execute: function () {
      cclegacy._RF.push({}, "a92d8TtFHhPsItwuD0/DSac", "ComicPlayer", undefined);
      /** Retained art layer. Frame ticks only transform this sprite; captions rebuild at cuts. */
      var ComicPlayer = exports('ComicPlayer', /*#__PURE__*/function () {
        function ComicPlayer(parent, changed) {
          this.root = void 0;
          this.image = void 0;
          this.sprite = void 0;
          this.cache = new Map();
          this.requested = '';
          this.serial = 0;
          this.voiceSerial = 0;
          this.source = void 0;
          this.voiceCache = new Map();
          this.voiceDuration = 0;
          this.sound = true;
          this.locale = 'es';
          this.reducedMotion = false;
          this.active = false;
          this.isPoster = false;
          this.voiceStatus = 'idle';
          this.skipped = false;
          this.framing = {
            kind: 'wide',
            scale: 1,
            x: 0,
            y: 0
          };
          this.shots = [];
          this.index = 0;
          this.elapsed = 0;
          this.playing = true;
          this.finished = false;
          this.status = 'loading';
          this.width = 350;
          this.height = 280;
          this.changed = changed;
          this.root = new Node('ComicArtwork');
          this.root.layer = Layers.Enum.UI_2D;
          parent.addChild(this.root);
          this.root.addComponent(UITransform);
          this.root.addComponent(Mask).type = Mask.Type.GRAPHICS_RECT;
          this.image = new Node('RetainedComicImage');
          this.image.layer = Layers.Enum.UI_2D;
          this.root.addChild(this.image);
          this.image.addComponent(UITransform);
          this.sprite = this.image.addComponent(Sprite);
          this.sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          this.sprite.color = new Color(255, 255, 255, 255);
          var voiceNode = new Node('RetainedComicVoice');
          parent.addChild(voiceNode);
          this.source = voiceNode.addComponent(AudioSource);
          this.source.playOnAwake = false;
          this.source.volume = .9;
          this.root.active = false;
        }
        var _proto = ComicPlayer.prototype;
        _proto.open = function open(shots) {
          this.shots = shots;
          this.index = 0;
          this.elapsed = 0;
          this.playing = true;
          this.finished = false;
          this.skipped = false;
          this.isPoster = false;
          this.requested = '';
          this.load();
          this.loadVoice();
        };
        _proto.layout = function layout(x, y, w, h, designHeight) {
          this.width = w;
          this.height = h;
          this.root.getComponent(UITransform).setContentSize(w, h);
          this.root.setPosition(x + w / 2 - 195, designHeight / 2 - y - h / 2);
          this.fit();
        };
        _proto.configure = function configure(sound, reducedMotion, locale) {
          var changed = locale !== this.locale,
            soundChanged = sound !== this.sound;
          this.sound = sound;
          this.reducedMotion = reducedMotion;
          this.locale = locale;
          if (changed && this.shot && !this.skipped) this.loadVoice();
          if (soundChanged) {
            if (!sound) this.source.pause();else if (this.active && this.playing && this.source.clip) this.resumeVoice();
          }
        };
        _proto.resumeVoice = function resumeVoice() {
          if (!this.source.clip || this.elapsed >= this.voiceDuration) return;
          this.source.currentTime = this.elapsed;
          this.source.play();
        };
        _proto.suspend = function suspend() {
          this.active = false;
          this.source.pause();
        };
        _proto.loadVoice = function loadVoice() {
          var _this = this;
          var serial = ++this.voiceSerial;
          this.source.stop();
          this.source.clip = null;
          this.source.currentTime = 0;
          this.voiceDuration = 0;
          this.voiceStatus = 'loading';
          var key = voiceResourceFor(this.shot, this.locale);
          if (!key) {
            this.voiceStatus = 'missing';
            this.changed();
            return;
          }
          var apply = function apply(clip) {
            if (serial !== _this.voiceSerial) return;
            _this.source.clip = clip;
            _this.voiceDuration = clip.getDuration();
            _this.voiceStatus = 'ready';
            if (_this.active && _this.playing && _this.sound) _this.resumeVoice();
            _this.changed();
          };
          var cached = this.voiceCache.get(key);
          if (cached) {
            apply(cached);
            return;
          }
          if (!resources.getInfoWithPath(key, AudioClip)) {
            this.voiceStatus = 'missing';
            this.changed();
            return;
          }
          resources.load(key, AudioClip, function (error, clip) {
            if (serial !== _this.voiceSerial) return;
            if (error || !clip) {
              _this.voiceStatus = 'missing';
              _this.changed();
              return;
            }
            _this.voiceCache.set(key, clip);
            apply(clip);
          });
        };
        _proto.poster = function poster(key) {
          this.isPoster = true;
          this.load(key);
          this.fit();
          this.image.setScale(1, 1, 1);
        };
        _proto.showShot = function showShot() {
          this.isPoster = false;
          this.load();
          this.fit();
        };
        _proto.visible = function visible(show) {
          this.root.active = show;
        };
        _proto.fit = function fit() {
          var frame = this.sprite.spriteFrame;
          if (!frame) return;
          var size = frame.originalSize;
          var ratio = this.isPoster ? Math.max(this.width / size.width, this.height / size.height) : Math.min(this.width / size.width, this.height / size.height);
          this.image.getComponent(UITransform).setContentSize(size.width * ratio, size.height * ratio);
          if (this.isPoster) this.image.setPosition(0, -(size.height * ratio - this.height) * .22, 0);else this.compose();
        };
        _proto.compose = function compose() {
          var _this$shot, _this$shot2, _this$shot3, _this$shot4, _this$shot5;
          var f = SCENE_FOCUS[(_this$shot = this.shot) == null ? void 0 : _this$shot.sceneKey],
            kind = ((_this$shot2 = this.shot) == null ? void 0 : _this$shot2.shot) || 'wide',
            speaker = ((_this$shot3 = this.shot) == null ? void 0 : _this$shot3.speaker) || '',
            p = Math.min(1, this.elapsed / this.duration),
            close = kind === 'close',
            focus = ((_this$shot4 = this.shot) == null ? void 0 : _this$shot4.focus) || (close && f ? f.shared || (speaker.startsWith('Elena') ? f.elena : f.mateo) : {
              x: .5,
              y: .5
            }),
            base = ((_this$shot5 = this.shot) == null || (_this$shot5 = _this$shot5.focus) == null ? void 0 : _this$shot5.scale) || (close ? (f == null ? void 0 : f.close) || 1.12 : kind === 'cut' ? 1.055 : 1),
            motion = this.reducedMotion || kind === 'cut' ? 0 : .012 * p,
            scale = base + motion;
          var size = this.image.getComponent(UITransform).contentSize,
            roomX = Math.max(0, (size.width * scale - this.width) / 2),
            roomY = Math.max(0, (size.height * scale - this.height) / 2),
            x = Math.max(-roomX, Math.min(roomX, (.5 - focus.x) * size.width * scale)),
            y = Math.max(-roomY, Math.min(roomY, (focus.y - .5) * size.height * scale));
          this.image.setScale(scale, scale, 1);
          this.image.setPosition(x, y, 0);
          this.framing = {
            kind: kind,
            scale: scale,
            x: x,
            y: y
          };
        };
        _proto.load = function load(key) {
          var _this2 = this;
          if (key === void 0) {
            var _this$shot6;
            key = (_this$shot6 = this.shot) == null ? void 0 : _this$shot6.sceneKey;
          }
          if (!key) return;
          if (key === this.requested) return;
          this.requested = key;
          var request = ++this.serial;
          this.status = 'loading';
          this.sprite.spriteFrame = null;
          var apply = function apply(frame) {
            if (request !== _this2.serial) return;
            _this2.sprite.spriteFrame = frame;
            _this2.status = 'ready';
            _this2.fit();
            _this2.changed();
          };
          var cached = this.cache.get(key);
          if (cached) {
            apply(cached);
            return;
          }
          if (resources.getInfoWithPath("art/" + key + "/spriteFrame", SpriteFrame)) {
            resources.load("art/" + key + "/spriteFrame", SpriteFrame, function (error, frame) {
              if (request !== _this2.serial) return;
              if (error || !frame) {
                _this2.status = 'missing';
                _this2.changed();
                return;
              }
              _this2.cache.set(key, frame);
              apply(frame);
            });
            return;
          }
          // Newly imported PNGs may expose only Texture2D; create a real frame from that asset.
          if (resources.getInfoWithPath("art/" + key + "/texture", Texture2D)) {
            resources.load("art/" + key + "/texture", Texture2D, function (error, texture) {
              if (request !== _this2.serial) return;
              if (error || !texture) {
                _this2.status = 'missing';
                _this2.changed();
                return;
              }
              var frame = new SpriteFrame();
              frame.texture = texture;
              _this2.cache.set(key, frame);
              apply(frame);
            });
            return;
          }
          this.status = 'missing';
          this.changed();
        };
        _proto.seek = function seek(index, resume) {
          if (resume === void 0) {
            resume = this.playing;
          }
          this.index = Math.max(0, Math.min(this.shots.length - 1, index));
          this.elapsed = 0;
          this.finished = false;
          this.skipped = false;
          this.playing = resume;
          this.load();
          this.loadVoice();
          this.fit();
          this.changed();
        };
        _proto.skip = function skip() {
          var _this$shot7;
          this.index = this.shots.length - 1;
          this.elapsed = ((_this$shot7 = this.shot) == null ? void 0 : _this$shot7.duration) || 0;
          this.playing = false;
          this.finished = true;
          this.skipped = true;
          ++this.voiceSerial;
          this.source.stop();
          this.source.clip = null;
          this.source.currentTime = 0;
          this.voiceDuration = 0;
          this.voiceStatus = 'idle';
          this.load();
          this.fit();
          this.changed();
        };
        _proto.toggle = function toggle() {
          if (this.finished) {
            this.seek(0, true);
            return;
          }
          this.playing = !this.playing;
          if (!this.playing) this.source.pause();else if (this.active && this.sound && this.source.clip) this.resumeVoice();
          this.changed();
        };
        _proto.update = function update(dt, active) {
          if (this.active !== active) {
            this.active = active;
            if (!active) this.source.pause();else if (this.playing && this.sound && this.source.clip) this.resumeVoice();
          }
          if (!active || !this.shot) return;
          if (this.playing && this.voiceStatus !== 'loading' && this.status !== 'loading') {
            this.elapsed += dt;
            if (this.elapsed >= this.duration) {
              if (this.index + 1 < this.shots.length) this.seek(this.index + 1);else {
                this.elapsed = this.duration;
                this.finished = true;
                this.playing = false;
                this.source.stop();
                this.changed();
              }
            }
          }
          this.compose();
        };
        _proto.snapshot = function snapshot() {
          var _this$shot8, _this$shot9, _this$shot10;
          return {
            shotId: (_this$shot8 = this.shot) == null ? void 0 : _this$shot8.id,
            voiceKey: voiceResourceFor(this.shot, this.locale),
            speakerId: (_this$shot9 = this.shot) == null ? void 0 : _this$shot9.speakerId,
            shot: this.index,
            shots: this.shots.length,
            elapsed: this.elapsed,
            playing: this.playing,
            finished: this.finished,
            sceneKey: (_this$shot10 = this.shot) == null ? void 0 : _this$shot10.sceneKey,
            artStatus: this.status,
            voiceStatus: this.voiceStatus,
            duration: this.duration,
            voiceTime: this.source.currentTime,
            voicePlaying: this.source.playing,
            playback: this.playback,
            skipped: this.skipped,
            framing: _extends({}, this.framing),
            panel: {
              width: this.width,
              height: this.height
            }
          };
        };
        _createClass(ComicPlayer, [{
          key: "shot",
          get: function get() {
            return this.shots[this.index];
          }
        }, {
          key: "speaking",
          get: function get() {
            return this.active && this.sound && this.playing && this.voiceStatus === 'ready' && this.source.playing;
          }
        }, {
          key: "duration",
          get: function get() {
            var _this$shot11;
            return Math.max(((_this$shot11 = this.shot) == null ? void 0 : _this$shot11.duration) || 1, this.voiceDuration + .3);
          }
        }, {
          key: "playback",
          get: function get() {
            return this.skipped ? 'skipped' : this.finished ? 'completed' : this.status === 'loading' || this.voiceStatus === 'loading' ? 'loading' : this.playing ? 'playing' : 'paused';
          }
        }]);
        return ComicPlayer;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Content.ts", ['cc', './Levels.ts'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      exports('LEVELS', module.LEVELS);
    }],
    execute: function () {
      cclegacy._RF.push({}, "e8adeEHME9AHp0Vx4Gfi2pa", "Content", undefined);
      var COPY = exports('COPY', {
        'es-419': {
          tag: 'UNA SEÑAL ENTRE DOS',
          intro: 'Elena, 32, vuelve a la vieja radio del puerto. Mateo, 34, conserva una cinta y una respuesta pendiente. Antes de escucharla, deben devolverle la voz a la estación.',
          start: 'Restaurar la señal',
          level: 'RETO',
          moves: 'MOVIMIENTOS',
          goal: 'Recoge',
          crates: 'Cajas',
          hint: 'Toca dos fichas vecinas para intercambiarlas.',
          hammer: 'Martillo',
          shuffle: 'Mezclar',
          more: 'Ayudas',
          target: 'Elige una ficha para quitarla.',
          invalid: 'Ese cambio no forma una combinación.',
          save: 'No se pudo guardar. Tu jugada no se ha cobrado.',
          "continue": 'Usar +5 movimientos',
          retry: 'Volver a intentar',
          lost: 'Se acabaron los movimientos',
          lostBody: 'Puedes intentarlo otra vez o usar una ayuda.',
          story: 'SEÑAL RECUPERADA',
          next: 'Siguiente reto',
          end: 'Una nueva frecuencia',
          endBody: 'La radio vuelve a sonar. La cinta todavía guarda una promesa.',
          replay: 'Volver a escuchar',
          close: 'Volver',
          lab: 'PRUEBA DE AYUDAS',
          labBody: 'Simulación interna. Sin anuncios reales ni cobros.',
          ad: 'Simular anuncio',
          buy: 'Simular compra',
          reward: 'Recibir 1 ayuda',
          cancel: 'Cancelar',
          noFill: 'Sin anuncio disponible',
          pending: 'Compra pendiente',
          granted: 'Ayuda añadida. La historia avanza al ganar.',
          noReward: 'Sin recompensa. Puedes seguir jugando.',
          noInventory: 'No te quedan ayudas de este tipo.',
          shuffleDone: 'Tablero mezclado. No se gastó un movimiento.',
          selected: 'Ayuda seleccionada',
          win: '¡Objetivo completo!',
          watch: 'Ver animática · 90 s',
          draft: 'PROTOTIPO · TEXTO SIN REVISIÓN NATIVA',
          stories: [['Elena', 'La luz sigue encendida. Pensé que te habías ido.', 'Mateo', 'Alguien tenía que cuidar este lugar.'], ['Mateo', 'Encontré tu cinta detrás de la consola.', 'Elena', 'No era para la audiencia. Era para ti.'], ['Elena', 'Esta vez, ¿la escuchamos juntos?', 'Mateo', 'Después de la primera canción. Sin huir.']]
        },
        'pt-BR': {
          tag: 'UM SINAL ENTRE DOIS',
          intro: 'Elena, 32, volta à antiga rádio do porto. Mateo, 34, guarda uma fita e uma resposta pendente. Antes de ouvi-la, precisam devolver a voz à estação.',
          start: 'Restaurar o sinal',
          level: 'DESAFIO',
          moves: 'JOGADAS',
          goal: 'Colete',
          crates: 'Caixas',
          hint: 'Toque em duas peças vizinhas para trocá-las.',
          hammer: 'Martelo',
          shuffle: 'Misturar',
          more: 'Ajudas',
          target: 'Escolha uma peça para remover.',
          invalid: 'Essa troca não forma uma combinação.',
          save: 'Não foi possível salvar. A jogada não foi cobrada.',
          "continue": 'Usar +5 jogadas',
          retry: 'Tentar novamente',
          lost: 'As jogadas acabaram',
          lostBody: 'Você pode tentar de novo ou usar uma ajuda.',
          story: 'SINAL RECUPERADO',
          next: 'Próximo desafio',
          end: 'Uma nova frequência',
          endBody: 'A rádio volta ao ar. A fita ainda guarda uma promessa.',
          replay: 'Ouvir novamente',
          close: 'Voltar',
          lab: 'TESTE DE AJUDAS',
          labBody: 'Simulação interna. Sem anúncios reais ou cobranças.',
          ad: 'Simular anúncio',
          buy: 'Simular compra',
          reward: 'Receber 1 ajuda',
          cancel: 'Cancelar',
          noFill: 'Nenhum anúncio disponível',
          pending: 'Compra pendente',
          granted: 'Ajuda recebida. Ganhe para avançar na história.',
          noReward: 'Sem recompensa. Você pode continuar jogando.',
          noInventory: 'Você não tem mais essa ajuda.',
          shuffleDone: 'Tabuleiro misturado sem gastar jogadas.',
          selected: 'Ajuda selecionada',
          win: 'Objetivo concluído!',
          watch: 'Ver animática · 90 s',
          draft: 'PROTÓTIPO · TEXTO SEM REVISÃO NATIVA',
          stories: [['Elena', 'A luz ainda está acesa. Achei que você tinha ido embora.', 'Mateo', 'Alguém precisava cuidar deste lugar.'], ['Mateo', 'Encontrei sua fita atrás da mesa de som.', 'Elena', 'Não era para o público. Era para você.'], ['Elena', 'Desta vez, vamos ouvir juntos?', 'Mateo', 'Depois da primeira música. Sem fugir.']]
        },
        "en": {
          "tag": "A SIGNAL BETWEEN US",
          "intro": "Elena, 32, returns to the old harbor radio station. Mateo, 34, has kept a tape and an unanswered question. Before listening, they must bring the station back to life.",
          "start": "Restore the signal",
          "level": "CHALLENGE",
          "moves": "MOVES",
          "goal": "Collect",
          "crates": "Crates",
          "hint": "Tap two neighboring tiles to swap them.",
          "hammer": "Hammer",
          "shuffle": "Shuffle",
          "more": "Boosters",
          "target": "Choose a tile to remove.",
          "invalid": "That swap does not make a match.",
          "save": "Could not save. Your move was not spent.",
          "continue": "Use +5 moves",
          "retry": "Try again",
          "lost": "Out of moves",
          "lostBody": "Try again or use a booster.",
          "story": "SIGNAL RESTORED",
          "next": "Next challenge",
          "end": "A new frequency",
          "endBody": "The radio is back on air. The tape still holds a promise.",
          "replay": "Listen again",
          "close": "Back",
          "lab": "BOOSTER LAB",
          "labBody": "Internal simulation. No real ads or charges.",
          "ad": "Simulate ad",
          "buy": "Simulate purchase",
          "reward": "Get 1 booster",
          "cancel": "Cancel",
          "noFill": "No ad available",
          "pending": "Purchase pending",
          "granted": "Booster added. Win to advance the story.",
          "noReward": "No reward. You can keep playing.",
          "noInventory": "You have no boosters of this type left.",
          "shuffleDone": "Board shuffled. No move spent.",
          "selected": "Booster selected",
          "win": "Goal complete!",
          "watch": "Watch animatic · 90 s",
          "draft": "PROTOTYPE · TEXT NOT NATIVE-REVIEWED",
          "stories": [["Elena", "The light is still on. I thought you had left.", "Mateo", "Someone had to look after this place."], ["Mateo", "I found your tape behind the console.", "Elena", "It was not for the audience. It was for you."], ["Elena", "Shall we listen together this time?", "Mateo", "After the first song. No running away."]]
        },
        "zh-CN": {
          "tag": "两个人的频率",
          "intro": "32岁的埃莱娜回到港口的老电台。34岁的马特奥留着一盘磁带，也留着一个迟迟未说出口的答案。在听磁带之前，他们必须让电台重新发声。",
          "start": "恢复信号",
          "level": "挑战",
          "moves": "剩余步数",
          "goal": "收集",
          "crates": "木箱",
          "hint": "点选两枚相邻棋子，交换位置。",
          "hammer": "锤子",
          "shuffle": "洗牌",
          "more": "道具",
          "target": "选择一枚要移除的棋子。",
          "invalid": "这次交换无法形成消除。",
          "save": "保存失败，本次操作未扣除步数。",
          "continue": "增加5步",
          "retry": "再试一次",
          "lost": "步数用完了",
          "lostBody": "可以重新挑战，或使用道具。",
          "story": "信号已恢复",
          "next": "下一关",
          "end": "新的频率",
          "endBody": "电台再次响起。磁带里仍藏着一个承诺。",
          "replay": "再听一次",
          "close": "返回",
          "lab": "道具实验室",
          "labBody": "内部模拟，不播放真实广告，也不会扣款。",
          "ad": "模拟观看广告",
          "buy": "模拟购买",
          "reward": "领取1个道具",
          "cancel": "取消",
          "noFill": "暂无广告",
          "pending": "购买处理中",
          "granted": "道具已添加，通关后即可推进剧情。",
          "noReward": "未获得奖励，可以继续游戏。",
          "noInventory": "这种道具已经用完了。",
          "shuffleDone": "棋盘已洗牌，未消耗步数。",
          "selected": "已选择道具",
          "win": "目标完成！",
          "watch": "观看动态分镜 · 90秒",
          "draft": "原型 · 文本尚未经过母语审校",
          "stories": [["埃莱娜", "灯还亮着。我以为你已经走了。", "马特奥", "总得有人照看这里。"], ["马特奥", "我在调音台后面找到了你的磁带。", "埃莱娜", "那不是给听众的，是给你的。"], ["埃莱娜", "这次，我们一起听吧？", "马特奥", "等第一首歌放完。这次不再逃避。"]]
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Ensemble.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _extends, cclegacy;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('resolveRouteNode', resolveRouteNode);
      cclegacy._RF.push({}, "8502dcrSGpK8IkZQYLoFvH+", "Ensemble", undefined); // Generated from content/ensemble-v2.json; do not hand edit.
      var ENSEMBLE = exports('ENSEMBLE', {
        "version": "ensemble-v2",
        "scope": "Two independent three-level short events; no common prologue or complete season implemented.",
        "locales": ["es-419", "pt-BR", "en", "zh-CN"],
        "reviewStatus": "DRAFT_NOT_NATIVE_REVIEWED",
        "voiceCoverage": {
          "es": 0,
          "pt": 0,
          "en": 0,
          "zh": 0
        },
        "characters": [{
          "id": "elena",
          "name": "Elena",
          "age": 32
        }, {
          "id": "mateo",
          "name": "Mateo",
          "age": 34
        }, {
          "id": "gabriel",
          "name": "Gabriel",
          "age": 36
        }],
        "scenes": ["ensemble-mateo-studio", "ensemble-mateo-rooftop", "ensemble-gabriel-archive", "ensemble-gabriel-terrace"],
        "routes": [{
          "id": "mateo",
          "name": "Mateo",
          "age": 34,
          "title": {
            "es": "Lo que guardamos",
            "pt": "O que guardamos",
            "en": "What We Keep",
            "zh": "我们留下的声音"
          },
          "bio": {
            "es": "Restaurador de sonido. Recuerda tus detalles, pero debe aprender a preguntar antes de decidir por ti.",
            "pt": "Restaurador de áudio. Lembra dos seus detalhes, mas precisa perguntar antes de decidir por você.",
            "en": "Sound restorer. He remembers your smallest habits, but must learn to ask before deciding for you.",
            "zh": "声音修复师。他记得你的细微习惯，却仍要学会在替你决定之前先开口询问。"
          },
          "hook": {
            "es": "Una cinta sin ficha. Tu muestra por entregar. ¿Puede el afecto respetar tus límites?",
            "pt": "Uma fita sem ficha. Sua amostra para entregar. O afeto consegue respeitar seus limites?",
            "en": "An unlabeled tape. Your sample deadline. Can affection make room for your boundaries?",
            "zh": "一盘没有档案的磁带，一份等待交付的样片。熟悉与眷恋，能否容纳你的边界？"
          },
          "portrait": "ensemble-mateo-portrait",
          "nodes": [{
            "id": "ensemble-mateo-01",
            "levelId": "ensemble-mateo-01",
            "title": {
              "es": "Una voz sin etiqueta",
              "pt": "Uma voz sem etiqueta",
              "en": "An Unlabeled Voice",
              "zh": "没有标签的声音"
            },
            "objective": {
              "es": "Recupera la señal de prueba para identificar la cinta sin difundirla.",
              "pt": "Recupere o sinal de teste para identificar a fita sem divulgá-la.",
              "en": "Restore the test signal to identify the tape without sharing it.",
              "zh": "修复测试信号，辨认磁带，暂不公开。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-mateo-01"
            },
            "previousNodeId": null,
            "shots": [{
              "id": "ensemble-mateo-01-shot-1",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Necesito un fragmento autorizado para mi muestra. Esta cinta no tiene ficha.",
              "pt": "Preciso de um trecho autorizado para minha amostra. Esta fita não tem ficha.",
              "en": "I need a cleared clip for my sample. This tape has no record.",
              "zh": "我的样片需要一段获准使用的录音。这盘磁带没有档案。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-mateo-01-shot-2",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Es una prueba que grabamos juntos. Reconocí tu forma de contar hasta tres.",
              "pt": "É um teste que gravamos juntos. Reconheci seu jeito de contar até três.",
              "en": "It is a test we recorded together. I recognized how you count to three.",
              "zh": "这是我们一起录的测试。我听出了你数到三的习惯。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-mateo-01-shot-3",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Guardaste hasta eso. Me conmueve, pero recordarme no te da permiso para publicarlo.",
              "pt": "Você guardou até isso. Fico tocada, mas lembrar de mim não autoriza a publicação.",
              "en": "You kept even that. It moves me, but remembering me is not permission to publish.",
              "zh": "连这个你都留着。我很感动，可记得我不等于有权公开录音。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-mateo-01-shot-4",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Lo sé. Conservé la caja, no comprobé quién podía decidir sobre cada voz.",
              "pt": "Eu sei. Guardei a caixa, mas não conferi quem podia decidir sobre cada voz.",
              "en": "I know. I kept the box without checking who could decide for each voice.",
              "zh": "我知道。我保管了盒子，却没查清每个声音该由谁决定。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-mateo-01-shot-5",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Podemos revisar nuestra toma a solas o preguntar primero a quien trajo la caja.",
              "pt": "Podemos ouvir nossa gravação a sós ou perguntar primeiro a quem trouxe a caixa.",
              "en": "We can check our own take privately, or first ask who brought the box.",
              "zh": "我们可以先私听自己的那段，也可以先联系送来盒子的人。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-mateo-01-shot-6",
              "duration": 8,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Tú marcas el orden. Yo haré las llamadas; tu entrega no tiene que esperar por mi descuido.",
              "pt": "Você escolhe a ordem. Eu faço as ligações; sua entrega não precisa esperar pelo meu descuido.",
              "en": "You set the order. I will make the calls; your deadline should not pay for my oversight.",
              "zh": "顺序由你定，电话由我来打。不能让我的疏忽耽误你交样片。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "choice": {
              "prompt": {
                "es": "¿Cómo empezamos a aclarar el permiso?",
                "pt": "Como começamos a esclarecer a autorização?",
                "en": "How do we clarify permission first?",
                "zh": "先从哪一步核实授权？"
              },
              "options": [{
                "id": "private-check",
                "text": {
                  "es": "Escuchar solo nuestra prueba, en privado.",
                  "pt": "Ouvir só nosso teste, em particular.",
                  "en": "Listen privately to our own test.",
                  "zh": "先私听我们自己的测试。"
                },
                "response": {
                  "es": "Revisaremos solo nuestra toma. Nada saldrá del estudio sin permiso.",
                  "pt": "Vamos ouvir só nosso teste. Nada sai do estúdio sem autorização.",
                  "en": "We will check only our take. Nothing leaves the studio without permission.",
                  "zh": "只听我们的那段；未经许可，任何录音都不离开工作室。"
                }
              }, {
                "id": "ask-donor",
                "text": {
                  "es": "Contactar primero a quien entregó la caja.",
                  "pt": "Falar primeiro com quem entregou a caixa.",
                  "en": "Contact the donor first.",
                  "zh": "先联系送来盒子的人。"
                },
                "response": {
                  "es": "Mateo llamará primero. Elena prepara su muestra con material propio mientras esperan.",
                  "pt": "Mateo vai ligar primeiro. Elena prepara a amostra com material próprio enquanto esperam.",
                  "en": "Mateo will call first. Elena works on her sample with her own material while they wait.",
                  "zh": "马特奥先打电话。等待期间，埃莱娜用自己的素材继续制作样片。"
                }
              }]
            }
          }, {
            "id": "ensemble-mateo-02",
            "levelId": "ensemble-mateo-02",
            "title": {
              "es": "El corte que elegimos",
              "pt": "O corte que escolhemos",
              "en": "The Cut We Choose",
              "zh": "由我们选择的剪辑"
            },
            "objective": {
              "es": "Limpia los obstáculos y reúne la señal para separar el fragmento autorizado.",
              "pt": "Remova os obstáculos e reúna o sinal para separar o trecho autorizado.",
              "en": "Clear obstacles and collect the signal for the permitted excerpt.",
              "zh": "清除障碍、收集信号，整理获准使用的片段。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-mateo-02"
            },
            "previousNodeId": "ensemble-mateo-01",
            "shots": [{
              "id": "ensemble-mateo-02-shot-1",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "En nuestra toma oímos una voz al fondo. Detuve la reproducción ahí.",
              "pt": "Na nossa gravação ouvimos uma voz ao fundo. Parei de tocar ali.",
              "en": "We heard another voice behind our take. I stopped playback there.",
              "zh": "我们的录音里混进了另一个声音，我在那儿停下了播放。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-mateo-02-shot-2",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Llamé a quien trajo la caja. Esa persona nos puso en contacto con la dueña de la voz.",
              "pt": "Liguei para quem trouxe a caixa. Essa pessoa nos passou o contato da dona da voz.",
              "en": "I called the donor, who put us in touch with the woman whose voice it was.",
              "zh": "我联系了送盒子的人，对方帮我们找到了那个声音的主人。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-mateo-02-shot-3",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Acepta el sonido del muelle, pero no su conversación. Anoté las condiciones.",
              "pt": "Ela autorizou o som do cais, mas não a conversa. Anotei as condições.",
              "en": "She permits the harbor sounds, but not her conversation. I recorded the terms.",
              "zh": "她同意使用码头的环境声，但不公开谈话。我记下了条件。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-mateo-02-shot-4",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Separé las pistas y aparté la conversación. Puedes revisar el corte antes de exportar.",
              "pt": "Separei as faixas e deixei a conversa de fora. Você pode revisar o corte antes de exportar.",
              "en": "I separated the tracks and left the conversation out. You can check the cut before export.",
              "zh": "我分开了音轨，留下的版本不含谈话。导出前由你检查剪辑。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-mateo-02-shot-5",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "También separaste una hora para mi muestra. Pensé que volverías a pedirme que me quedara.",
              "pt": "Você também reservou uma hora para minha amostra. Achei que pediria para eu ficar de novo.",
              "en": "You also set aside an hour for my sample. I thought you would ask me to stay again.",
              "zh": "你还为我的样片留出了一小时。我以为你又会劝我留下。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-mateo-02-shot-6",
              "duration": 8,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Quiero escucharte aquí. También quiero que tu trabajo llegue lejos. No son cosas opuestas.",
              "pt": "Quero ouvir você aqui. E quero que seu trabalho vá longe. Uma coisa não impede a outra.",
              "en": "I want to hear you here. I also want your work to travel. Those wishes can coexist.",
              "zh": "我想在这里听见你，也想让你的作品走得更远。这两件事并不矛盾。",
              "sceneKey": "ensemble-mateo-studio",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "variants": {
              "choiceNodeId": "ensemble-mateo-01",
              "optionId": "ask-donor",
              "shots": [{
                "id": "ensemble-mateo-02-donor-shot-1",
                "duration": 7,
                "speaker": "Mateo",
                "speakerId": "mateo",
                "speakerLabels": {
                  "es": "Mateo",
                  "pt": "Mateo",
                  "en": "Mateo",
                  "zh": "马特奥"
                },
                "es": "La persona que trajo la caja respondió primero. Nos advirtió de una conversación privada.",
                "pt": "Quem trouxe a caixa respondeu primeiro. Avisou que havia uma conversa particular.",
                "en": "The donor replied first and warned us about a private conversation.",
                "zh": "送盒子的人先回了电话，提醒我们磁带里有一段私人谈话。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "wide",
                "emotion": "attentive",
                "voice": {}
              }, {
                "id": "ensemble-mateo-02-donor-shot-2",
                "duration": 7,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "Gracias por llamar tú. Pedí permiso a la dueña de la voz antes de abrir esa pista.",
                "pt": "Obrigada por ligar. Pedi autorização à dona da voz antes de abrir aquela faixa.",
                "en": "Thank you for making the call. I asked the speaker before opening that track.",
                "zh": "谢谢你主动联系。我先征询声音主人的意见，才打开那条音轨。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "close",
                "emotion": "thoughtful",
                "voice": {}
              }, {
                "id": "ensemble-mateo-02-donor-shot-3",
                "duration": 8,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "Acepta el sonido del muelle, pero no su conversación. Anoté las condiciones.",
                "pt": "Ela autorizou o som do cais, mas não a conversa. Anotei as condições.",
                "en": "She permits the harbor sounds, but not her conversation. I recorded the terms.",
                "zh": "她同意使用码头的环境声，但不公开谈话。我记下了条件。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "close",
                "emotion": "honest",
                "voice": {}
              }, {
                "id": "ensemble-mateo-02-donor-shot-4",
                "duration": 7,
                "speaker": "Mateo",
                "speakerId": "mateo",
                "speakerLabels": {
                  "es": "Mateo",
                  "pt": "Mateo",
                  "en": "Mateo",
                  "zh": "马特奥"
                },
                "es": "Separé las pistas y aparté la conversación. Puedes revisar el corte antes de exportar.",
                "pt": "Separei as faixas e deixei a conversa de fora. Você pode revisar o corte antes de exportar.",
                "en": "I separated the tracks and left the conversation out. You can check the cut before export.",
                "zh": "我分开了音轨，留下的版本不含谈话。导出前由你检查剪辑。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "cut",
                "emotion": "reflective",
                "voice": {}
              }, {
                "id": "ensemble-mateo-02-donor-shot-5",
                "duration": 7,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "También separaste una hora para mi muestra. Pensé que volverías a pedirme que me quedara.",
                "pt": "Você também reservou uma hora para minha amostra. Achei que pediria para eu ficar de novo.",
                "en": "You also set aside an hour for my sample. I thought you would ask me to stay again.",
                "zh": "你还为我的样片留出了一小时。我以为你又会劝我留下。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "close",
                "emotion": "warm",
                "voice": {}
              }, {
                "id": "ensemble-mateo-02-donor-shot-6",
                "duration": 8,
                "speaker": "Mateo",
                "speakerId": "mateo",
                "speakerLabels": {
                  "es": "Mateo",
                  "pt": "Mateo",
                  "en": "Mateo",
                  "zh": "马特奥"
                },
                "es": "Quiero escucharte aquí. También quiero que tu trabajo llegue lejos. No son cosas opuestas.",
                "pt": "Quero ouvir você aqui. E quero que seu trabalho vá longe. Uma coisa não impede a outra.",
                "en": "I want to hear you here. I also want your work to travel. Those wishes can coexist.",
                "zh": "我想在这里听见你，也想让你的作品走得更远。这两件事并不矛盾。",
                "sceneKey": "ensemble-mateo-studio",
                "shot": "wide",
                "emotion": "hopeful",
                "voice": {}
              }]
            }
          }, {
            "id": "ensemble-mateo-03",
            "levelId": "ensemble-mateo-03",
            "title": {
              "es": "Después de la última toma",
              "pt": "Depois da última gravação",
              "en": "After the Last Take",
              "zh": "最后一段录音之后"
            },
            "objective": {
              "es": "Completa la señal de salida para entregar la muestra y el fragmento autorizado.",
              "pt": "Complete o sinal de saída para entregar a amostra e o trecho autorizado.",
              "en": "Complete the output signal for the sample and the cleared excerpt.",
              "zh": "完成输出信号，交付样片与获准公开的片段。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-mateo-03"
            },
            "previousNodeId": "ensemble-mateo-02",
            "shots": [{
              "id": "ensemble-mateo-03-shot-1",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "La muestra ya está enviada. El fragmento del puerto tiene permiso y créditos completos.",
              "pt": "A amostra foi enviada. O trecho do porto tem autorização e créditos completos.",
              "en": "The sample is sent. The harbor excerpt has permission and full credits.",
              "zh": "样片发出去了。码头片段的授权和署名也都齐了。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-mateo-03-shot-2",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Y tu grabación privada vuelve contigo. Dejé de confundir guardar algo con tener derecho a usarlo.",
              "pt": "E sua gravação particular volta com você. Guardar algo não me dá o direito de usar.",
              "en": "Your private recording goes home with you. Keeping something does not give me the right to use it.",
              "zh": "私人录音交还给你。保管一样东西，不意味着我有权使用它。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-mateo-03-shot-3",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Aún te detienes antes de decir algo difícil. Hoy no me hiciste adivinarlo.",
              "pt": "Você ainda hesita antes de dizer algo difícil. Hoje não me fez adivinhar.",
              "en": "You still pause before saying something difficult. Today you did not leave me guessing.",
              "zh": "说难开口的话时，你还是会停顿。但今天你没有让我猜。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-mateo-03-shot-4",
              "duration": 7,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Entonces voy a decirlo. Me gustaría tomar un café contigo, como una cita.",
              "pt": "Então vou falar. Queria tomar um café com você, como um encontro.",
              "en": "Then I will say it. I would like coffee with you, as a date.",
              "zh": "那我就说出来。我想请你喝咖啡，是约会的那种。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-mateo-03-shot-5",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Mañana salgo por trabajo. Puedo elegir una cita sin prometer que voy a quedarme.",
              "pt": "Amanhã viajo a trabalho. Posso escolher um encontro sem prometer ficar.",
              "en": "I leave for work tomorrow. I can choose a date without promising to stay.",
              "zh": "明天我就要出差。我可以答应约会，但不会因此承诺留下。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-mateo-03-shot-6",
              "duration": 8,
              "speaker": "Mateo",
              "speakerId": "mateo",
              "speakerLabels": {
                "es": "Mateo",
                "pt": "Mateo",
                "en": "Mateo",
                "zh": "马特奥"
              },
              "es": "Lo entiendo. Y si prefieres amistad, seguiremos haciendo buen trabajo, sin deudas entre nosotros.",
              "pt": "Eu entendo. Se preferir amizade, seguimos trabalhando bem, sem nenhuma dívida entre nós.",
              "en": "I understand. If you prefer friendship, our work continues, with nothing owed between us.",
              "zh": "我明白。如果你想做朋友，我们一样能好好合作，谁也不欠谁。",
              "sceneKey": "ensemble-mateo-rooftop",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "choice": {
              "prompt": {
                "es": "¿Qué quieres después de esta grabación?",
                "pt": "O que você quer depois desta gravação?",
                "en": "What would you like after this recording?",
                "zh": "这段录音之后，你希望怎样继续？"
              },
              "options": [{
                "id": "romance",
                "text": {
                  "es": "Sí, una cita. Antes de mi viaje.",
                  "pt": "Sim, um encontro. Antes da viagem.",
                  "en": "Yes, a date. Before my trip.",
                  "zh": "好，出差前约会一次。"
                },
                "response": {
                  "es": "Acordaron un café a las ocho. Elena viajará al día siguiente; Mateo no le pide otra promesa. Una cita nueva, elegida por ambos.",
                  "pt": "Marcaram um café às oito. Elena viaja no dia seguinte; Mateo não pede outra promessa. Um novo encontro, escolhido pelos dois.",
                  "en": "They agree on coffee at eight. Elena travels tomorrow; Mateo asks for no further promise. A new date, chosen by both.",
                  "zh": "他们约好八点喝咖啡。埃莱娜明天照常出差，马特奥没有索取更多承诺。这一次约会，是两个人共同的选择。"
                }
              }, {
                "id": "friendship",
                "text": {
                  "es": "Quiero conservar nuestra amistad.",
                  "pt": "Quero manter nossa amizade.",
                  "en": "I want to keep our friendship.",
                  "zh": "我想保留我们的友情。"
                },
                "response": {
                  "es": "Mateo acepta sin intentar convencerla. La muestra está entregada, la amistad continúa y el próximo trabajo tendrá acuerdos claros.",
                  "pt": "Mateo aceita sem tentar convencê-la. A amostra foi entregue, a amizade continua e o próximo trabalho terá acordos claros.",
                  "en": "Mateo accepts without trying to persuade her. The sample is delivered, their friendship continues, and future work has clear agreements.",
                  "zh": "马特奥接受了，没有试图说服她。样片顺利交付，友情继续，下次合作也会有清楚的约定。"
                }
              }]
            }
          }],
          "levels": [{
            "id": "ensemble-mateo-01",
            "seed": 41134,
            "moves": 11,
            "target": 12,
            "color": 0,
            "crates": []
          }, {
            "id": "ensemble-mateo-02",
            "seed": 44922,
            "moves": 15,
            "target": 15,
            "color": 2,
            "crates": [24]
          }, {
            "id": "ensemble-mateo-03",
            "seed": 46229,
            "moves": 12,
            "target": 17,
            "color": 4,
            "crates": [24]
          }],
          "ending": {
            "es": "El fragmento autorizado está listo y Elena entregó su muestra. Este breve encuentro termina con el vínculo que ella eligió.",
            "pt": "O trecho autorizado está pronto, e Elena entregou sua amostra. Este breve encontro termina com o vínculo que ela escolheu.",
            "en": "The cleared excerpt is ready, and Elena has delivered her sample. This short event closes with the relationship she chose.",
            "zh": "获准公开的片段已完成，埃莱娜也交付了样片。这段短事件，在她自主选择的关系中收尾。"
          }
        }, {
          "id": "gabriel",
          "name": "Gabriel",
          "age": 36,
          "title": {
            "es": "Un espacio compartido",
            "pt": "Um espaço compartilhado",
            "en": "A Shared Space",
            "zh": "共同的位置"
          },
          "bio": {
            "es": "Arquitecto urbano. Preciso y de humor seco; tendrá que escuchar lo que sus planos dejaron fuera.",
            "pt": "Arquiteto urbano. Preciso, de humor seco; precisa ouvir o que suas plantas deixaram de fora.",
            "en": "Urban architect. Precise, with dry humor; he must listen to what his plans have left out.",
            "zh": "城市建筑师。严谨，带一点冷幽默；这次他必须倾听图纸没有记录的生活。"
          },
          "hook": {
            "es": "Tu muestra necesita un lugar. Su plano olvida una puerta en uso. ¿Quién puede cambiar el diseño?",
            "pt": "Sua mostra precisa de espaço. A planta dele ignora uma porta em uso. Quem pode mudar o projeto?",
            "en": "Your show needs a space. His plan overlooks a working doorway. Who gets to change the design?",
            "zh": "你的声音展需要场地，他的图纸却遗漏了一扇正在使用的门。谁有权改变设计？"
          },
          "portrait": "ensemble-gabriel-portrait",
          "nodes": [{
            "id": "ensemble-gabriel-01",
            "levelId": "ensemble-gabriel-01",
            "title": {
              "es": "El plano y la puerta",
              "pt": "A planta e a porta",
              "en": "The Plan and the Door",
              "zh": "图纸与门"
            },
            "objective": {
              "es": "Despeja los obstáculos y reúne los marcadores para revisar el espacio de la muestra.",
              "pt": "Remova os obstáculos e reúna os marcadores para revisar o espaço da mostra.",
              "en": "Clear obstacles and collect markers to survey the exhibition space.",
              "zh": "清除障碍、收集标记，核查声音展的场地。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-gabriel-01"
            },
            "previousNodeId": null,
            "shots": [{
              "id": "ensemble-gabriel-01-shot-1",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Según el plano, tu mesa de escucha cabe junto a esa puerta.",
              "pt": "Pela planta, sua mesa de escuta cabe perto daquela porta.",
              "en": "According to the plan, your listening desk fits beside that door.",
              "zh": "按照图纸，你的试听台可以放在那扇门旁边。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-01-shot-2",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Según mi grabación de ayer, por ahí entran los carritos del mercado.",
              "pt": "Pela gravação que fiz ontem, é por ali que entram os carrinhos da feira.",
              "en": "According to my recording yesterday, market carts come through there.",
              "zh": "按照我昨天的录音，市场的推车就是从那里进来的。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-01-shot-3",
              "duration": 8,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Ese uso no figura aquí. Firmé esta versión; me corresponde comprobarlo.",
              "pt": "Esse uso não aparece aqui. Assinei esta versão; cabe a mim conferir.",
              "en": "That use is missing here. I signed this version; it is mine to check.",
              "zh": "图纸没有记下这个用途。这版是我签的字，我有责任核实。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-01-shot-4",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Quiero abrir la muestra, no convertir mi obra en un obstáculo para los vecinos.",
              "pt": "Quero abrir a mostra, não transformar meu trabalho num obstáculo para os vizinhos.",
              "en": "I want to open the show, not turn my work into an obstacle for neighbors.",
              "zh": "我想让展览开幕，不想让自己的作品挡住邻居的路。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-01-shot-5",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Podemos medir primero o invitar a quienes usan la puerta a recorrerla con nosotros.",
              "pt": "Podemos medir primeiro ou convidar quem usa a porta para percorrer o espaço conosco.",
              "en": "We can measure first, or invite the people who use the door to walk it with us.",
              "zh": "可以先去测量，也可以先请每天走这扇门的人和我们一起勘查。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-01-shot-6",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Y la corrección llevará tu firma, no solo mi nombre como quien protestó.",
              "pt": "E a correção leva sua assinatura, não só meu nome como quem reclamou.",
              "en": "And the correction carries your signature, not just my name as the person who objected.",
              "zh": "而且修订方案要有你的签名，不能只留下我这个提出异议的人。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "choice": {
              "prompt": {
                "es": "¿Qué evidencia reunimos primero?",
                "pt": "Que evidência vamos reunir primeiro?",
                "en": "Which evidence do we gather first?",
                "zh": "先收集哪一种证据？"
              },
              "options": [{
                "id": "site-check",
                "text": {
                  "es": "Medir el paso durante la descarga.",
                  "pt": "Medir a passagem durante a descarga.",
                  "en": "Measure the passage during deliveries.",
                  "zh": "先在卸货时测量通道。"
                },
                "response": {
                  "es": "Elena y Gabriel medirán el uso real; después contrastarán el registro con los vecinos.",
                  "pt": "Elena e Gabriel vão medir o uso real e depois conferir o registro com os vizinhos.",
                  "en": "Elena and Gabriel will measure actual use, then check the record with neighbors.",
                  "zh": "埃莱娜与加布里埃尔先测量实际通行情况，再请居民核对记录。"
                }
              }, {
                "id": "resident-walk",
                "text": {
                  "es": "Invitar primero a los usuarios del lugar.",
                  "pt": "Convidar primeiro quem usa o local.",
                  "en": "Invite the people who use the space first.",
                  "zh": "先邀请场地使用者共同勘查。"
                },
                "response": {
                  "es": "Gabriel convocará el recorrido. Elena recogerá testimonios con permiso y ambos medirán el paso.",
                  "pt": "Gabriel vai organizar a visita. Elena recolhe depoimentos com autorização, e os dois medem a passagem.",
                  "en": "Gabriel will arrange the walk. Elena gathers accounts with permission, and both measure the passage.",
                  "zh": "加布里埃尔组织勘查；埃莱娜经同意记录使用者的意见，再一起测量通道。"
                }
              }]
            }
          }, {
            "id": "ensemble-gabriel-02",
            "levelId": "ensemble-gabriel-02",
            "title": {
              "es": "El espacio que faltaba",
              "pt": "O espaço que faltava",
              "en": "The Missing Space",
              "zh": "被遗漏的空间"
            },
            "objective": {
              "es": "Libera los puntos bloqueados y reúne marcadores para probar la nueva ubicación.",
              "pt": "Libere os pontos bloqueados e reúna marcadores para testar a nova posição.",
              "en": "Clear blocked points and collect markers to test the revised placement.",
              "zh": "清除受阻位置、收集标记，测试调整后的展位。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-gabriel-02"
            },
            "previousNodeId": "ensemble-gabriel-01",
            "shots": [{
              "id": "ensemble-gabriel-02-shot-1",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Medimos durante la descarga. Con la mesa ahí, dos carritos no pueden cruzarse.",
              "pt": "Medimos durante a descarga. Com a mesa ali, dois carrinhos não conseguem passar juntos.",
              "en": "We measured during deliveries. With the desk there, two carts cannot pass.",
              "zh": "我们在卸货时做了测量。试听台放在那里，两辆推车就无法交错通行。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-02-shot-2",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Los vecinos confirmaron el registro. La línea del plano era precisa; mi suposición, no.",
              "pt": "Os vizinhos confirmaram o registro. A linha da planta era precisa; minha suposição, não.",
              "en": "The neighbors confirmed our record. The line on the plan was precise; my assumption was not.",
              "zh": "居民确认了记录。图纸上的线很精确，我的判断却不准确。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-02-shot-3",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Propongo una mesa móvil y escuchar con audífonos. Quiero probarlo antes de prometerlo.",
              "pt": "Proponho uma mesa móvel e fones de ouvido. Quero testar antes de prometer.",
              "en": "I propose a movable desk and headphones. I want to test it before promising anything.",
              "zh": "我提议改用可移动的试听台和耳机。承诺之前，我想先测试。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-02-shot-4",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Eso reduce tu espacio. Puedo redibujar el soporte para que tu equipo ocupe menos.",
              "pt": "Isso reduz seu espaço. Posso redesenhar o suporte para seu equipamento ocupar menos.",
              "en": "That reduces your space. I can redraw the stand so your equipment needs less room.",
              "zh": "这会缩小你的展览空间。我可以重画支架，让设备少占一点地方。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-02-shot-5",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Ahora sí estamos diseñando juntos. No vine solo a pedirte que aprobaras mi idea.",
              "pt": "Agora estamos projetando juntos. Não vim só pedir sua aprovação.",
              "en": "Now we are designing together. I did not come just to ask for your approval.",
              "zh": "现在我们才算是在一起设计。我来这里，不只是为了请你批准。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-02-shot-6",
              "duration": 8,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Lo noto. Mi plano tiene menos espacio en blanco desde que estás aquí. Y mejores preguntas.",
              "pt": "Percebi. Minha planta tem menos espaço em branco desde que você chegou. E perguntas melhores.",
              "en": "I noticed. My plan has less blank space since you arrived. And better questions.",
              "zh": "我发现了。你来了以后，我的图纸空白少了，问题却问得更好了。",
              "sceneKey": "ensemble-gabriel-archive",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "variants": {
              "choiceNodeId": "ensemble-gabriel-01",
              "optionId": "resident-walk",
              "shots": [{
                "id": "ensemble-gabriel-02-walk-shot-1",
                "duration": 7,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "En el recorrido, una vecina nos mostró dónde esperan los carritos antes de entrar.",
                "pt": "Na visita, uma vizinha mostrou onde os carrinhos esperam antes de entrar.",
                "en": "During the walk, a neighbor showed us where carts wait before entering.",
                "zh": "共同勘查时，一位邻居指出了推车进入前等候的位置。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "wide",
                "emotion": "attentive",
                "voice": {}
              }, {
                "id": "ensemble-gabriel-02-walk-shot-2",
                "duration": 7,
                "speaker": "Gabriel",
                "speakerId": "gabriel",
                "speakerLabels": {
                  "es": "Gabriel",
                  "pt": "Gabriel",
                  "en": "Gabriel",
                  "zh": "加布里埃尔"
                },
                "es": "Medimos ese giro juntos. El plano omitía la espera; voy a incluir su aporte en la revisión.",
                "pt": "Medimos a curva juntos. A planta ignorava a espera; vou registrar a contribuição dela na revisão.",
                "en": "We measured that turn together. The plan missed the waiting area; I will credit her input in the revision.",
                "zh": "我们一起测量了转弯空间。图纸遗漏了等候区，我会在修订记录中写明她的贡献。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "close",
                "emotion": "thoughtful",
                "voice": {}
              }, {
                "id": "ensemble-gabriel-02-walk-shot-3",
                "duration": 8,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "Propongo una mesa móvil y escuchar con audífonos. Quiero probarlo antes de prometerlo.",
                "pt": "Proponho uma mesa móvel e fones de ouvido. Quero testar antes de prometer.",
                "en": "I propose a movable desk and headphones. I want to test it before promising anything.",
                "zh": "我提议改用可移动的试听台和耳机。承诺之前，我想先测试。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "close",
                "emotion": "honest",
                "voice": {}
              }, {
                "id": "ensemble-gabriel-02-walk-shot-4",
                "duration": 7,
                "speaker": "Gabriel",
                "speakerId": "gabriel",
                "speakerLabels": {
                  "es": "Gabriel",
                  "pt": "Gabriel",
                  "en": "Gabriel",
                  "zh": "加布里埃尔"
                },
                "es": "Eso reduce tu espacio. Puedo redibujar el soporte para que tu equipo ocupe menos.",
                "pt": "Isso reduz seu espaço. Posso redesenhar o suporte para seu equipamento ocupar menos.",
                "en": "That reduces your space. I can redraw the stand so your equipment needs less room.",
                "zh": "这会缩小你的展览空间。我可以重画支架，让设备少占一点地方。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "cut",
                "emotion": "reflective",
                "voice": {}
              }, {
                "id": "ensemble-gabriel-02-walk-shot-5",
                "duration": 7,
                "speaker": "Elena",
                "speakerId": "elena",
                "speakerLabels": {
                  "es": "Elena",
                  "pt": "Elena",
                  "en": "Elena",
                  "zh": "埃莱娜"
                },
                "es": "Ahora sí estamos diseñando juntos. No vine solo a pedirte que aprobaras mi idea.",
                "pt": "Agora estamos projetando juntos. Não vim só pedir sua aprovação.",
                "en": "Now we are designing together. I did not come just to ask for your approval.",
                "zh": "现在我们才算是在一起设计。我来这里，不只是为了请你批准。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "close",
                "emotion": "warm",
                "voice": {}
              }, {
                "id": "ensemble-gabriel-02-walk-shot-6",
                "duration": 8,
                "speaker": "Gabriel",
                "speakerId": "gabriel",
                "speakerLabels": {
                  "es": "Gabriel",
                  "pt": "Gabriel",
                  "en": "Gabriel",
                  "zh": "加布里埃尔"
                },
                "es": "Lo noto. Mi plano tiene menos espacio en blanco desde que estás aquí. Y mejores preguntas.",
                "pt": "Percebi. Minha planta tem menos espaço em branco desde que você chegou. E perguntas melhores.",
                "en": "I noticed. My plan has less blank space since you arrived. And better questions.",
                "zh": "我发现了。你来了以后，我的图纸空白少了，问题却问得更好了。",
                "sceneKey": "ensemble-gabriel-archive",
                "shot": "wide",
                "emotion": "hopeful",
                "voice": {}
              }]
            }
          }, {
            "id": "ensemble-gabriel-03",
            "levelId": "ensemble-gabriel-03",
            "title": {
              "es": "Un lugar para escuchar",
              "pt": "Um lugar para ouvir",
              "en": "A Place to Listen",
              "zh": "留一个倾听的位置"
            },
            "objective": {
              "es": "Completa la prueba del espacio: despeja obstáculos y reúne los últimos marcadores.",
              "pt": "Complete o teste do espaço: remova obstáculos e reúna os últimos marcadores.",
              "en": "Finish the space trial: clear obstacles and collect the last markers.",
              "zh": "完成场地测试：清除障碍，收集最后的标记。"
            },
            "unlock": {
              "type": "level_win",
              "levelId": "ensemble-gabriel-03"
            },
            "previousNodeId": "ensemble-gabriel-02",
            "shots": [{
              "id": "ensemble-gabriel-03-shot-1",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "La prueba funcionó. La mesa se mueve, los carritos pasan y la salida queda libre.",
              "pt": "O teste funcionou. A mesa se move, os carrinhos passam e a saída fica livre.",
              "en": "The trial worked. The desk moves, carts pass, and the exit stays clear.",
              "zh": "测试成功了。试听台可以移动，推车顺利通过，出口也保持畅通。",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "wide",
              "emotion": "attentive",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-03-shot-2",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Entregué el plano corregido con mi firma. Registré el error y quiénes ayudaron a resolverlo.",
              "pt": "Entreguei a planta corrigida com minha assinatura. Registrei o erro e quem ajudou a resolvê-lo.",
              "en": "I submitted the corrected plan with my signature. It records my error and who helped fix it.",
              "zh": "我签字提交了修订图纸，记录了自己的错误，也写明了帮助解决问题的人。",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "close",
              "emotion": "thoughtful",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-03-shot-3",
              "duration": 8,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Tengo un lugar viable para la muestra. Y tú sobreviviste a que alguien moviera tus líneas.",
              "pt": "Tenho um espaço viável para a mostra. E você sobreviveu a alguém mudar suas linhas.",
              "en": "I have a workable place for the show. And you survived someone moving your lines.",
              "zh": "展览终于有了可用的地方。而你的线条被别人改动后，你也好好地活了下来。",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "close",
              "emotion": "honest",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-03-shot-4",
              "duration": 7,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Apenas. Tendré que dibujar otra terraza para recuperar el orgullo.",
              "pt": "Por pouco. Vou ter que desenhar outro terraço para recuperar o orgulho.",
              "en": "Barely. I may need to draw another terrace to recover my pride.",
              "zh": "勉强活着。我大概得再画一个露台，才能找回自尊。",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "cut",
              "emotion": "reflective",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-03-shot-5",
              "duration": 7,
              "speaker": "Elena",
              "speakerId": "elena",
              "speakerLabels": {
                "es": "Elena",
                "pt": "Elena",
                "en": "Elena",
                "zh": "埃莱娜"
              },
              "es": "Mañana salgo a grabar calles que aún no conozco. Esta vez no hay plano.",
              "pt": "Amanhã vou gravar ruas que ainda não conheço. Desta vez não tem planta.",
              "en": "Tomorrow I am recording streets I have not explored. There is no plan this time.",
              "zh": "明天我要去录还没走过的街道。这一次没有图纸。",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "close",
              "emotion": "warm",
              "voice": {}
            }, {
              "id": "ensemble-gabriel-03-shot-6",
              "duration": 8,
              "speaker": "Gabriel",
              "speakerId": "gabriel",
              "speakerLabels": {
                "es": "Gabriel",
                "pt": "Gabriel",
                "en": "Gabriel",
                "zh": "加布里埃尔"
              },
              "es": "Me gustaría acompañarte después, sin trabajo de por medio. ¿Como una cita, o prefieres amistad?",
              "pt": "Queria acompanhar você depois, sem trabalho no meio. Como um encontro, ou prefere amizade?",
              "en": "I would like to join you afterward, with work put aside. As a date, or would you prefer friendship?",
              "zh": "工作结束后，我想陪你再走一段，不谈项目。算一次约会，还是你更愿意做朋友？",
              "sceneKey": "ensemble-gabriel-terrace",
              "shot": "wide",
              "emotion": "hopeful",
              "voice": {}
            }],
            "choice": {
              "prompt": {
                "es": "¿Cómo quieres seguir este recorrido?",
                "pt": "Como você quer continuar esse passeio?",
                "en": "How would you like this walk to continue?",
                "zh": "接下来的路，你想怎样一起走？"
              },
              "options": [{
                "id": "romance",
                "text": {
                  "es": "Una cita. Esta vez elijo yo el camino.",
                  "pt": "Um encontro. Desta vez eu escolho o caminho.",
                  "en": "A date. This time I choose the way.",
                  "zh": "约会吧。这次由我选路。"
                },
                "response": {
                  "es": "Gabriel guarda el plano. Acuerdan encontrarse después de la grabación, sin revisar el proyecto. La próxima conversación será solo de ellos.",
                  "pt": "Gabriel guarda a planta. Combinam se encontrar depois da gravação, sem revisar o projeto. A próxima conversa será só dos dois.",
                  "en": "Gabriel puts the plan away. They agree to meet after the recording, with no project review. Their next conversation is just for them.",
                  "zh": "加布里埃尔收起图纸。他们约好录音结束后见面，不再讨论项目。下一段交谈，只属于他们两个人。"
                }
              }, {
                "id": "friendship",
                "text": {
                  "es": "Prefiero que sigamos como amigos.",
                  "pt": "Prefiro continuar como amigos.",
                  "en": "I would rather stay friends.",
                  "zh": "我更想继续做朋友。"
                },
                "response": {
                  "es": "Gabriel acepta con una sonrisa. La muestra conserva su espacio y Elena conserva un colega que sabe escuchar, incluso cuando discrepan.",
                  "pt": "Gabriel aceita com um sorriso. A mostra mantém seu espaço, e Elena ganha um colega que sabe ouvir, mesmo quando discorda.",
                  "en": "Gabriel accepts with a smile. The show keeps its space, and Elena keeps a colleague who listens even when they disagree.",
                  "zh": "加布里埃尔微笑着接受。展览依然拥有场地，埃莱娜也拥有了一位即使意见不同、仍愿认真倾听的同行朋友。"
                }
              }]
            }
          }],
          "levels": [{
            "id": "ensemble-gabriel-01",
            "seed": 43615,
            "moves": 9,
            "target": 16,
            "color": 4,
            "crates": [24]
          }, {
            "id": "ensemble-gabriel-02",
            "seed": 47536,
            "moves": 10,
            "target": 19,
            "color": 1,
            "crates": [17, 24]
          }, {
            "id": "ensemble-gabriel-03",
            "seed": 51457,
            "moves": 16,
            "target": 22,
            "color": 3,
            "crates": [16, 18, 30, 32]
          }],
          "ending": {
            "es": "El plano fue corregido y la muestra tiene un espacio viable. Elena y Gabriel cierran el trabajo en igualdad, con el vínculo elegido.",
            "pt": "A planta foi corrigida, e a mostra tem um espaço viável. Elena e Gabriel encerram o trabalho em igualdade, com o vínculo escolhido.",
            "en": "The plan is corrected and the show has a workable space. Elena and Gabriel finish as equals, with the relationship they chose.",
            "zh": "图纸完成修订，展览获得可用空间。埃莱娜与加布里埃尔平等地完成合作，也选择了今后的关系。"
          }
        }]
      });

      /** Choices are scoped by full node ID; resolving text never grants progression or rewards. */
      function resolveRouteNode(routeId, index, choices) {
        if (choices === void 0) {
          choices = {};
        }
        var route = ENSEMBLE.routes.find(function (r) {
          return r.id === routeId;
        });
        if (!route || !Number.isInteger(index) || index < 0 || index >= route.nodes.length) return undefined;
        var node = route.nodes[index],
          variant = node.variants;
        return _extends({}, node, {
          shots: variant && choices[variant.choiceNodeId] === variant.optionId ? variant.shots : node.shots
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/EnsembleSession.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Puzzle.ts', './Session.ts', './PartnerMechanics.ts'], function (exports) {
  var _extends, _createClass, _createForOfIteratorHelperLoose, cclegacy, clone, digest, RULES, Session, PARTNER_RULES, applyPartner, partnerSkill;
  return {
    setters: [function (module) {
      _extends = module.extends;
      _createClass = module.createClass;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      clone = module.clone;
      digest = module.digest;
      RULES = module.RULES;
    }, function (module) {
      Session = module.Session;
    }, function (module) {
      PARTNER_RULES = module.PARTNER_RULES;
      applyPartner = module.applyPartner;
      partnerSkill = module.partnerSkill;
    }],
    execute: function () {
      cclegacy._RF.push({}, "1f618eWyV1HhJLBEI+JCzQx", "EnsembleSession", undefined);
      var VERSION = 'ensemble-1';
      var MAX_COMMANDS = 20000;
      var reject = function reject(reason) {
        return {
          ok: false,
          reason: reason,
          frames: [],
          reshuffled: false
        };
      };
      var accepted = function accepted() {
        return {
          ok: true,
          reason: '',
          frames: [],
          reshuffled: false
        };
      };
      var validId = function validId(id) {
        return typeof id === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,159}$/.test(id) && !['constructor', 'prototype', '__proto__'].includes(id);
      };

      /** Product-only route coordinator. v1 Session and its frozen levels remain unchanged.
       * The journal/hash detects incompatible or damaged saves; it is not anti-cheat.
       * Each transaction persists its complete candidate before publishing any state.
       */
      var EnsembleSession = exports('EnsembleSession', /*#__PURE__*/function () {
        function EnsembleSession(routes, legacyLevels, legacyRaw) {
          this.definitions = void 0;
          this.routeStates = void 0;
          this.wallet = void 0;
          this.selected = void 0;
          this.journal = [];
          this.legacyRaw = void 0;
          this.persisting = false;
          if (!Array.isArray(routes) || !routes.length) throw new Error('INVALID_ROUTES');
          this.definitions = clone(routes);
          var ids = new Set();
          for (var _iterator = _createForOfIteratorHelperLoose(this.definitions), _step; !(_step = _iterator()).done;) {
            var route = _step.value;
            if (!validId(route.id) || route.id === 'legacy' || ids.has(route.id)) throw new Error('INVALID_ROUTE_ID');
            ids.add(route.id);
            route.choices = route.choices || [];
            var nodes = new Set(),
              choiceLevels = new Set();
            var _loop = function _loop() {
              var choice = _step3.value;
              if (!validId(choice.nodeId) || nodes.has(choice.nodeId) || choiceLevels.has(choice.levelId) || !route.levels.some(function (l) {
                return l.id === choice.levelId;
              }) || !Array.isArray(choice.optionIds) || choice.optionIds.length < 2 || choice.optionIds.some(function (id) {
                return !validId(id);
              }) || new Set(choice.optionIds).size !== choice.optionIds.length) throw new Error('INVALID_ROUTE_CHOICE');
              nodes.add(choice.nodeId);
              choiceLevels.add(choice.levelId);
            };
            for (var _iterator3 = _createForOfIteratorHelperLoose(route.choices), _step3; !(_step3 = _iterator3()).done;) {
              _loop();
            }
          }
          this.definitions.push({
            id: 'legacy',
            levels: clone(legacyLevels),
            choices: []
          });
          var legacy = legacyRaw === undefined ? new Session(legacyLevels) : Session.restore(legacyLevels, legacyRaw);
          this.legacyRaw = legacyRaw === undefined ? null : legacyRaw;
          this.wallet = clone({
            grants: legacy.state.grants,
            consumed: legacy.state.consumed
          });
          this.routeStates = new Map();
          for (var _iterator2 = _createForOfIteratorHelperLoose(this.definitions), _step2; !(_step2 = _iterator2()).done;) {
            var definition = _step2.value;
            var session = definition.id === 'legacy' ? legacy : new Session(definition.levels);
            // Sessions supply puzzle/progression rules; only the coordinator owns money.
            session.state.grants = [];
            session.state.consumed = [];
            this.routeStates.set(definition.id, {
              session: session,
              choices: {}
            });
          }
          this.selected = ids.has('mateo') ? 'mateo' : this.definitions[0].id;
        }
        var _proto = EnsembleSession.prototype;
        _proto.dispatch = function dispatch(command, persist) {
          if (!command || typeof command !== 'object') return reject('INVALID_COMMAND');
          return this.apply({
            type: 'command',
            routeId: this.selected,
            command: command
          }, persist);
        };
        _proto.selectRoute = function selectRoute(id, persist) {
          return this.apply({
            type: 'select',
            routeId: id
          }, persist);
        };
        _proto.choose = function choose(nodeId, optionId, persist) {
          return this.apply({
            type: 'choose',
            routeId: this.selected,
            nodeId: nodeId,
            optionId: optionId
          }, persist);
        };
        _proto.partner = function partner(action, persist) {
          return this.apply({
            type: 'partner',
            routeId: this.selected,
            runId: this.routeStates.get(this.selected).session.state.runId,
            rules: PARTNER_RULES,
            action: action
          }, persist);
        };
        _proto.apply = function apply(action, persist) {
          if (this.persisting) return reject('TRANSACTION_IN_PROGRESS');
          if (!action || typeof action !== 'object' || !this.routeStates.has(action.routeId)) return reject('UNKNOWN_ROUTE');
          if (this.journal.length >= MAX_COMMANDS) return reject('LOCAL_JOURNAL_FULL');
          if (action.type !== 'select' && action.routeId !== this.selected) return reject('WRONG_ROUTE');
          var routeStates = new Map(this.routeStates);
          var selected = this.selected,
            wallet = this.wallet,
            result = accepted();
          if (action.type === 'select') selected = action.routeId;else if (action.type === 'partner') {
            var current = this.routeStates.get(selected),
              state = current.session.state;
            if (action.rules !== PARTNER_RULES) return reject('INCOMPATIBLE_PARTNER_RULES');
            if (action.runId !== state.runId) return reject('PARTNER_WRONG_RUN');
            var status = this.partnerStatus;
            if (!status.available) return reject(status.reason);
            var changed = applyPartner(state.board, selected, action.action);
            if (!changed.ok) return reject(changed.reason);
            var candidate = new Session(current.session.levels);
            candidate.state = _extends({}, clone(state), clone(wallet), {
              board: changed.board
            });
            candidate.commands = clone(current.session.commands);
            var s = candidate.state;
            s.events.push({
              type: 'partner_used',
              runId: s.runId,
              detail: {
                rules: PARTNER_RULES,
                action: clone(action.action),
                cost: 1
              },
              hash: digest({
                board: s.board,
                grants: s.grants,
                completed: s.completed,
                storyUnlocked: s.storyUnlocked
              })
            });
            candidate.state.grants = [];
            candidate.state.consumed = [];
            routeStates.set(selected, {
              session: candidate,
              choices: current.choices
            });
          } else if (action.type === 'command' || action.type === 'choose') {
            var _current = this.routeStates.get(selected);
            var definition = this.definitions.find(function (d) {
              return d.id === selected;
            });
            var _state = _current.session.state;
            if (action.type === 'choose') {
              var _definition$levels$_s, _extends2;
              var constraint = definition.choices.find(function (c) {
                return c.nodeId === action.nodeId;
              });
              if (!constraint || !constraint.optionIds.includes(action.optionId)) return reject('INVALID_CHOICE');
              if (Object.prototype.hasOwnProperty.call(_current.choices, action.nodeId)) return reject('CHOICE_ALREADY_MADE');
              if (_state.screen !== 'story' || ((_definition$levels$_s = definition.levels[_state.levelIndex]) == null ? void 0 : _definition$levels$_s.id) !== constraint.levelId || !_state.completed.includes(constraint.levelId) || !_state.storyUnlocked.includes(constraint.levelId)) return reject('CHOICE_LOCKED');
              routeStates.set(selected, {
                session: _current.session,
                choices: _extends({}, _current.choices, (_extends2 = {}, _extends2[action.nodeId] = action.optionId, _extends2))
              });
            } else {
              var _action$command;
              if (((_action$command = action.command) == null ? void 0 : _action$command.type) === 'next') {
                var _constraint = definition.choices.find(function (c) {
                  var _definition$levels$_s2;
                  return c.levelId === ((_definition$levels$_s2 = definition.levels[_state.levelIndex]) == null ? void 0 : _definition$levels$_s2.id);
                });
                if (_state.screen === 'story' && _constraint && !Object.prototype.hasOwnProperty.call(_current.choices, _constraint.nodeId)) return reject('CHOICE_REQUIRED');
              }
              var _candidate = new Session(definition.levels);
              _candidate.state = _extends({}, clone(_state), clone(wallet));
              _candidate.commands = clone(_current.session.commands);
              result = _candidate.dispatch(action.command);
              if (!result.ok) return result;
              wallet = {
                grants: _candidate.state.grants,
                consumed: _candidate.state.consumed
              };
              _candidate.state.grants = [];
              _candidate.state.consumed = [];
              routeStates.set(selected, {
                session: _candidate,
                choices: _current.choices
              });
            }
          } else return reject('UNKNOWN_COMMAND');
          var journal = [].concat(this.journal, [clone(action)]);
          this.persisting = true;
          try {
            persist == null || persist(this.encode(routeStates, wallet, selected, journal));
          } catch (_unused) {
            return reject('SAVE_FAILED');
          } finally {
            this.persisting = false;
          }
          this.routeStates = routeStates;
          this.wallet = wallet;
          this.selected = selected;
          this.journal = journal;
          return result;
        };
        _proto.snapshot = function snapshot(routes, wallet, selected) {
          return {
            activeRouteId: selected,
            wallet: wallet,
            routes: this.definitions.map(function (d) {
              var r = routes.get(d.id);
              return {
                id: d.id,
                state: r.session.state,
                choices: r.choices
              };
            })
          };
        };
        _proto.encode = function encode(routes, wallet, selected, journal) {
          if (routes === void 0) {
            routes = this.routeStates;
          }
          if (wallet === void 0) {
            wallet = this.wallet;
          }
          if (selected === void 0) {
            selected = this.selected;
          }
          if (journal === void 0) {
            journal = this.journal;
          }
          return JSON.stringify({
            schema: 2,
            version: VERSION,
            rules: RULES,
            definitionHash: digest(this.definitions),
            definitions: this.definitions,
            legacyRaw: this.legacyRaw,
            legacyHash: digest(this.legacyRaw),
            journal: journal,
            journalHash: digest(journal),
            stateHash: digest(this.snapshot(routes, wallet, selected))
          });
        };
        _proto.serialize = function serialize() {
          return this.encode();
        };
        EnsembleSession.restore = function restore(routes, legacyLevels, raw) {
          if (typeof raw !== 'string' || raw.length > 10000000) throw new Error('SAVE_TOO_LARGE');
          var data = JSON.parse(raw);
          if (!data || data.schema !== 2 || data.version !== VERSION || data.rules !== RULES || !Array.isArray(data.journal) || data.journal.length > MAX_COMMANDS || data.legacyRaw !== null && typeof data.legacyRaw !== 'string') throw new Error('INCOMPATIBLE_SAVE');
          if (data.journalHash !== digest(data.journal) || data.legacyHash !== digest(data.legacyRaw)) throw new Error('SAVE_INTEGRITY');
          var session = new EnsembleSession(routes, legacyLevels, data.legacyRaw === null ? undefined : data.legacyRaw);
          // Exact definitions supplement the noncryptographic digest: changing even an
          // unplayed future level or choice requires an explicit new version/migration.
          if (data.definitionHash !== digest(session.definitions) || JSON.stringify(data.definitions) !== JSON.stringify(session.definitions)) throw new Error('INCOMPATIBLE_ROUTE_VERSION');
          for (var _iterator4 = _createForOfIteratorHelperLoose(data.journal), _step4; !(_step4 = _iterator4()).done;) {
            var action = _step4.value;
            var result = session.apply(action);
            if (!result.ok) throw new Error('INVALID_JOURNAL:' + result.reason);
          }
          if (digest(session.snapshot(session.routeStates, session.wallet, session.selected)) !== data.stateHash) throw new Error('SAVE_INTEGRITY');
          return session;
        };
        _createClass(EnsembleSession, [{
          key: "activeRouteId",
          get: function get() {
            return this.selected;
          }
        }, {
          key: "levels",
          get: function get() {
            return clone(this.routeStates.get(this.selected).session.levels);
          }
        }, {
          key: "state",
          get: function get() {
            return _extends({}, clone(this.routeStates.get(this.selected).session.state), clone(this.wallet));
          }
        }, {
          key: "choices",
          get: function get() {
            return clone(this.routeStates.get(this.selected).choices);
          }
        }, {
          key: "commands",
          get: function get() {
            return clone(this.journal);
          }
        }, {
          key: "routeSummaries",
          get: function get() {
            var _this = this;
            return this.definitions.map(function (d) {
              var r = _this.routeStates.get(d.id);
              return {
                id: d.id,
                active: d.id === _this.selected,
                screen: r.session.state.screen,
                levelIndex: r.session.state.levelIndex,
                completed: clone(r.session.state.completed),
                storyUnlocked: clone(r.session.state.storyUnlocked),
                choices: clone(r.choices)
              };
            });
          }
        }, {
          key: "routes",
          get: function get() {
            return this.routeSummaries;
          }
        }, {
          key: "partnerStatus",
          get: function get() {
            var _this2 = this;
            var state = this.routeStates.get(this.selected).session.state,
              skill = partnerSkill(this.selected);
            var used = this.journal.some(function (a) {
              return a.type === 'partner' && a.routeId === _this2.selected && a.runId === state.runId;
            });
            var reason = !skill ? 'PARTNER_UNAVAILABLE' : state.screen !== 'puzzle' || !state.board ? 'WRONG_SCREEN' : state.board.status !== 'playing' ? 'RUN_NOT_PLAYING' : used ? 'PARTNER_ALREADY_USED' : state.board.moves < 2 ? 'PARTNER_NEEDS_TWO_MOVES' : skill === 'relocate' && !state.board.crates.length ? 'PARTNER_NO_CRATES' : '';
            return {
              available: !reason,
              reason: reason,
              skill: skill,
              used: used,
              cost: 1,
              runId: state.runId
            };
          }
        }]);
        return EnsembleSession;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/FeedbackAudio.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, isValid, Node, AudioSource, resources, AudioClip;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      isValid = module.isValid;
      Node = module.Node;
      AudioSource = module.AudioSource;
      resources = module.resources;
      AudioClip = module.AudioClip;
    }],
    execute: function () {
      cclegacy._RF.push({}, "0c931xqjghJi44iorYN+N2j", "FeedbackAudio", undefined);
      var KEYS = ['select', 'swap', 'reject', 'match', 'cascade', 'crate', 'win'];
      /** Small native audio pool. No pending sound is replayed after loading or unmuting. */
      var FeedbackAudio = exports('FeedbackAudio', /*#__PURE__*/function () {
        function FeedbackAudio(parent) {
          var _this = this;
          this.root = void 0;
          this.sources = [];
          this.clips = new Map();
          this.enabled = true;
          this.disposed = false;
          this.cursor = 0;
          this.last = new Map();
          this.root = new Node('PuzzleFeedbackAudio');
          parent.addChild(this.root);
          for (var i = 0; i < 4; i++) {
            var n = new Node('FeedbackChannel' + i);
            this.root.addChild(n);
            var a = n.addComponent(AudioSource);
            a.playOnAwake = false;
            a.volume = .55;
            this.sources.push(a);
          }
          var _loop = function _loop() {
            var key = _step.value;
            if (resources.getInfoWithPath('feedback/' + key, AudioClip)) resources.load('feedback/' + key, AudioClip, function (error, clip) {
              if (!error && clip && !_this.disposed) _this.clips.set(key, clip);
            });
          };
          for (var _iterator = _createForOfIteratorHelperLoose(KEYS), _step; !(_step = _iterator()).done;) {
            _loop();
          }
        }
        var _proto = FeedbackAudio.prototype;
        _proto.setEnabled = function setEnabled(value) {
          this.enabled = value;
          if (!value) {
            for (var _iterator2 = _createForOfIteratorHelperLoose(this.sources), _step2; !(_step2 = _iterator2()).done;) {
              var s = _step2.value;
              if (isValid(s)) s.stop();
            }
          }
        };
        _proto.play = function play(key) {
          if (!this.enabled || this.disposed) return;
          var clip = this.clips.get(key);
          if (!clip) return;
          var now = Date.now();
          if (now - (this.last.get(key) || 0) < (key === 'select' ? 45 : 75)) return;
          this.last.set(key, now);
          var a = this.sources[this.cursor++ % this.sources.length];
          a.stop();
          a.clip = clip;
          a.volume = key === 'win' ? .65 : .55;
          a.play();
        };
        _proto.snapshot = function snapshot() {
          return {
            enabled: this.enabled,
            loaded: [].concat(this.clips.keys())
          };
        };
        _proto.dispose = function dispose() {
          if (this.disposed) return;
          this.disposed = true;
          for (var _iterator3 = _createForOfIteratorHelperLoose(this.sources), _step3; !(_step3 = _iterator3()).done;) {
            var a = _step3.value;
            if (isValid(a)) a.stop();
          }
          this.clips.clear();
          if (isValid(this.root)) this.root.destroy();
        };
        return FeedbackAudio;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Levels.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "222bf/1x+lAH5huQBmBcM6B", "Levels", undefined); // Authored deterministic season levels; regenerate via design-season-levels.mjs.
      var LEVELS = exports('LEVELS', [{
        "id": "s1-01",
        "seed": 41134,
        "moves": 11,
        "target": 12,
        "color": 0,
        "crates": []
      }, {
        "id": "s1-02",
        "seed": 42308,
        "moves": 11,
        "target": 14,
        "color": 2,
        "crates": []
      }, {
        "id": "s1-03",
        "seed": 43615,
        "moves": 9,
        "target": 16,
        "color": 4,
        "crates": [24]
      }, {
        "id": "s1-04",
        "seed": 44922,
        "moves": 15,
        "target": 15,
        "color": 2,
        "crates": [24]
      }, {
        "id": "s1-05",
        "seed": 46229,
        "moves": 12,
        "target": 17,
        "color": 4,
        "crates": [24]
      }, {
        "id": "s1-06",
        "seed": 47536,
        "moves": 10,
        "target": 19,
        "color": 1,
        "crates": [17, 24]
      }, {
        "id": "s1-07",
        "seed": 48881,
        "moves": 14,
        "target": 18,
        "color": 4,
        "crates": [17, 24]
      }, {
        "id": "s1-08",
        "seed": 50150,
        "moves": 18,
        "target": 20,
        "color": 1,
        "crates": [17, 24]
      }, {
        "id": "s1-09",
        "seed": 51457,
        "moves": 16,
        "target": 22,
        "color": 3,
        "crates": [16, 18, 30, 32]
      }, {
        "id": "s1-10",
        "seed": 52764,
        "moves": 14,
        "target": 21,
        "color": 1,
        "crates": [16, 18, 30, 32]
      }, {
        "id": "s1-11",
        "seed": 54071,
        "moves": 19,
        "target": 23,
        "color": 3,
        "crates": [16, 18, 30, 32]
      }, {
        "id": "s1-12",
        "seed": 55378,
        "moves": 14,
        "target": 25,
        "color": 0,
        "crates": [9, 12, 23, 26]
      }, {
        "id": "s1-13",
        "seed": 56723,
        "moves": 21,
        "target": 24,
        "color": 3,
        "crates": [9, 12, 23, 26]
      }, {
        "id": "s1-14",
        "seed": 57992,
        "moves": 15,
        "target": 26,
        "color": 0,
        "crates": [9, 12, 23, 26]
      }, {
        "id": "s1-15",
        "seed": 59299,
        "moves": 14,
        "target": 28,
        "color": 2,
        "crates": [8, 12, 22, 26, 36, 40]
      }, {
        "id": "s1-16",
        "seed": 60606,
        "moves": 23,
        "target": 27,
        "color": 0,
        "crates": [8, 12, 22, 26, 36, 40]
      }, {
        "id": "s1-17",
        "seed": 61932,
        "moves": 17,
        "target": 29,
        "color": 2,
        "crates": [8, 12, 22, 26, 36, 40]
      }, {
        "id": "s1-18",
        "seed": 63220,
        "moves": 18,
        "target": 31,
        "color": 4,
        "crates": [8, 12, 22, 26, 36, 40]
      }]);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Localization.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('isLocale', isLocale);
      cclegacy._RF.push({}, "f1f7428KG9HmYvYJoZi5JKC", "Localization", undefined);
      var TEXT_LANGUAGE = exports('TEXT_LANGUAGE', {
        'es-419': 'es',
        'pt-BR': 'pt',
        en: 'en',
        'zh-CN': 'zh'
      });
      function isLocale(value) {
        return typeof value === 'string' && Object.prototype.hasOwnProperty.call(TEXT_LANGUAGE, value);
      }

      // Spanish source strings are stable keys; existing Spanish and Portuguese remain in Main.
      var UI_TRANSLATIONS = exports('UI_TRANSLATIONS', {
        "No se guardaron los ajustes.": {
          "en": "Could not save settings.",
          "zh": "设置保存失败。"
        },
        "¡Ficha rayada! 4 en línea la crean; combínala para borrar toda su fila.": {
          "en": "Striped tile! Match 4 in a line to make one, then match it to clear its row.",
          "zh": "条纹棋子！将4枚棋子连成一线即可生成，再匹配它就能清除整行。"
        },
        "Guardado protegido": {
          "en": "Save protected",
          "zh": "存档已保护"
        },
        "No se pudo recuperar la partida. Conservamos el archivo original sin sobrescribirlo.": {
          "en": "Could not restore your game. Your original save has been preserved.",
          "zh": "无法恢复游戏，原始存档已保留，未被覆盖。"
        },
        "RESTAURA LA SEÑAL": {
          "en": "RESTORE THE SIGNAL",
          "zh": "恢复电台信号"
        },
        "UNA SEÑAL ENTRE DOS": {
          "en": "A SIGNAL BETWEEN US",
          "zh": "两个人的频率"
        },
        "Ajustes": {
          "en": "Settings",
          "zh": "设置"
        },
        "AL AIRE · SEÑAL RESTAURADA": {
          "en": "ON AIR · SIGNAL RESTORED",
          "zh": "正在播出 · 信号已恢复"
        },
        "RADIO PUERTO LUZ": {
          "en": "RADIO PUERTO LUZ",
          "zh": "光之港电台"
        },
        "Seis días para salvar la radio.\nUna cinta. Todo lo que no nos dijimos.": {
          "en": "Six days to save the station.\nOne tape. Everything we left unsaid.",
          "zh": "六天，挽救一座电台。\n一盘磁带，藏着所有未说出口的话。"
        },
        "Entrar en la historia   ›": {
          "en": "Enter the story   ›",
          "zh": "进入故事   ›"
        },
        "Volver al final   ›": {
          "en": "Return to the ending   ›",
          "zh": "重温结局   ›"
        },
        "Continuar la historia   ›": {
          "en": "Continue the story   ›",
          "zh": "继续故事   ›"
        },
        "Capítulos": {
          "en": "Chapters",
          "zh": "章节"
        },
        "Cómo jugar": {
          "en": "How to play",
          "zh": "玩法说明"
        },
        "Nuestra frecuencia": {
          "en": "Our frequency",
          "zh": "我们的频率"
        },
        "Cada señal guarda una historia.": {
          "en": "Every signal holds a story.",
          "zh": "每一道信号，都藏着一个故事。"
        },
        "Volver a la radio": {
          "en": "Back to the station",
          "zh": "返回电台"
        },
        "ESCUCHAR DE NUEVO": {
          "en": "LISTEN AGAIN",
          "zh": "再次聆听"
        },
        "RECUPERA ESTA SEÑAL": {
          "en": "RESTORE THIS SIGNAL",
          "zh": "恢复这道信号"
        },
        "Completa el encuentro anterior": {
          "en": "Complete the previous encounter",
          "zh": "先完成上一关"
        },
        "Todos los capítulos": {
          "en": "All chapters",
          "zh": "全部章节"
        },
        "RECUERDO": {
          "en": "MEMORY",
          "zh": "回忆"
        },
        "SEÑAL RECUPERADA": {
          "en": "SIGNAL RESTORED",
          "zh": "信号已恢复"
        },
        "Cargando ilustración…": {
          "en": "Loading artwork…",
          "zh": "正在加载插画…"
        },
        "Ilustración no disponible · texto completo": {
          "en": "Artwork unavailable · full text shown",
          "zh": "插画暂不可用 · 可阅读完整文本"
        },
        "Cargando escena…": {
          "en": "Loading scene…",
          "zh": "正在加载场景…"
        },
        "Escena omitida": {
          "en": "Scene skipped",
          "zh": "已跳过场景"
        },
        "Escena completa": {
          "en": "Scene complete",
          "zh": "场景播放完毕"
        },
        "En pausa · ▶ para continuar": {
          "en": "Paused · ▶ to resume",
          "zh": "已暂停 · ▶继续"
        },
        "Reproduciendo · Ⅱ para pausar": {
          "en": "Playing · Ⅱ to pause",
          "zh": "播放中 · Ⅱ暂停"
        },
        "sin sonido": {
          "en": "sound off",
          "zh": "已静音"
        },
        "solo subtítulos": {
          "en": "subtitles only",
          "zh": "仅字幕"
        },
        "Omitir": {
          "en": "Skip",
          "zh": "跳过"
        },
        "Volver a capítulos": {
          "en": "Back to chapters",
          "zh": "返回章节"
        },
        "Ver el final": {
          "en": "See the ending",
          "zh": "观看结局"
        },
        "ESTAMOS AL AIRE": {
          "en": "WE ARE ON AIR",
          "zh": "我们开播了"
        },
        "Volvimos al aire.": {
          "en": "Back on air.",
          "zh": "电台，再次响起。"
        },
        "Volver a los recuerdos": {
          "en": "Revisit memories",
          "zh": "重温回忆"
        },
        "Inicio": {
          "en": "Home",
          "zh": "首页"
        },
        "ENCUENTRO": {
          "en": "ENCOUNTER",
          "zh": "相遇"
        },
        "RECUPERA LA SEÑAL": {
          "en": "RESTORE THE SIGNAL",
          "zh": "恢复信号"
        },
        "Une 3. Toca dos vecinas o desliza una ficha.": {
          "en": "Match 3. Tap two neighbors or swipe a tile.",
          "zh": "三枚相同即可消除。点选相邻两枚，或滑动交换。"
        },
        "Forma 4 para crear una ficha que limpia su fila.": {
          "en": "Match 4 to create a tile that clears its row.",
          "zh": "四枚连成一线，可生成清除整行的条纹棋子。"
        },
        "¡En sintonía!": {
          "en": "In tune!",
          "zh": "信号接通！"
        },
        "señal": {
          "en": "signal",
          "zh": "信号"
        },
        "Historia recuperada. Escuchemos lo que sigue.": {
          "en": "Story recovered. Let’s hear what comes next.",
          "zh": "故事已找回，听听接下来发生了什么。"
        },
        "Gana este encuentro para escuchar su historia.": {
          "en": "Win this encounter to hear its story.",
          "zh": "通过本关，即可聆听这段故事。"
        },
        "Falta poco para recuperar la señal.": {
          "en": "Almost there. Restore the signal.",
          "zh": "距离恢复信号，只差一点了。"
        },
        "fichas pendientes": {
          "en": "tiles remaining",
          "zh": "枚棋子待收集"
        },
        "Menú": {
          "en": "Menu",
          "zh": "菜单"
        },
        "En pausa": {
          "en": "Paused",
          "zh": "已暂停"
        },
        "Tu partida está guardada.": {
          "en": "Your game is saved.",
          "zh": "游戏进度已保存。"
        },
        "Continuar": {
          "en": "Continue",
          "zh": "继续"
        },
        "Guardar y volver al inicio": {
          "en": "Save and return home",
          "zh": "保存并返回首页"
        },
        "IDIOMA": {
          "en": "LANGUAGE",
          "zh": "语言"
        },
        "Sonido": {
          "en": "Sound",
          "zh": "声音"
        },
        "Movimiento reducido": {
          "en": "Reduce motion",
          "zh": "减少动态效果"
        },
        "La música y el diálogo pueden no estar disponibles en todos los dispositivos.": {
          "en": "Music and dialogue may be unavailable on some devices.",
          "zh": "部分设备可能无法播放音乐或对白。"
        },
        "1. Toca dos fichas vecinas. Junta tres iguales.\n\n2. Recoge las fichas del objetivo y rompe las cajas. Cumple ambos antes de agotar los movimientos.\n\n3. Gana para recuperar una escena. Tus recuerdos se pueden volver a ver.": {
          "en": "1. Tap two neighboring tiles. Match three of the same kind.\n\n2. Collect the target tiles and break the crates. Complete both before you run out of moves.\n\n3. Win to recover a scene. You can revisit unlocked memories.",
          "zh": "1. 点选相邻两枚棋子，交换后连成三个相同棋子即可消除。\n\n2. 收集目标棋子并打破木箱，在步数用完前完成两项目标。\n\n3. 通关解锁剧情，已解锁的回忆可随时重温。"
        },
        "4 iguales crean una ficha rayada: al combinarla, borra su fila. Martillo: quita una. Mezclar: sin gastar jugada.": {
          "en": "Match 4 to make a striped tile; match it to clear its row. Hammer: remove one tile. Shuffle: no move spent.",
          "zh": "四枚连成一线生成条纹棋子，再匹配它即可清除整行。锤子：移除一枚棋子。洗牌：不消耗步数。"
        },
        "Laboratorio · ayudas simuladas": {
          "en": "Lab · simulated boosters",
          "zh": "实验室 · 模拟道具"
        },
        "Te falta una ayuda": {
          "en": "You are out of this booster",
          "zh": "这种道具用完了"
        },
        "Reponer aquí es una simulación. No hay anuncios reales ni cobros. La ayuda queda guardada; tú decides cuándo usarla.": {
          "en": "Refilling here is a simulation. No real ads or charges. The booster is saved; you choose when to use it.",
          "zh": "这里的补充道具功能仅为模拟，不播放真实广告，也不会扣款。道具会保存下来，由你决定何时使用。"
        },
        "Activado": {
          "en": "On",
          "zh": "开启"
        },
        "Desactivado": {
          "en": "Off",
          "zh": "关闭"
        },
        "Voces en español. Los otros idiomas incluyen subtítulos.": {
          "en": "Spanish voices. Subtitles in the other languages.",
          "zh": "西班牙语配音，其他语言提供字幕。"
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./Animatic.ts', './ArtLibrary.ts', './BoardFeedback.ts', './ComicPlayer.ts', './Content.ts', './Ensemble.ts', './EnsembleSession.ts', './FeedbackAudio.ts', './Levels.ts', './Localization.ts', './Main.ts', './PartnerMechanics.ts', './SceneFraming.ts', './Season.ts', './VoicePolicy.ts', './MergeProbe.ts', './Puzzle.ts', './Session.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/Main.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Session.ts', './Puzzle.ts', './Content.ts', './Localization.ts', './Season.ts', './Ensemble.ts', './EnsembleSession.ts', './ComicPlayer.ts', './BoardFeedback.ts', './ArtLibrary.ts', './FeedbackAudio.ts', './PartnerMechanics.ts', './Levels.ts'], function (exports) {
  var _inheritsLoose, _extends, _createForOfIteratorHelperLoose, _createClass, cclegacy, _decorator, sys, profiler, view, director, Node, Layers, Camera, UITransform, Canvas, Graphics, game, Game, resources, Font, screen, ResolutionPolicy, AudioSource, AudioClip, Color, Label, Mask, Director, Component, balance, clone, digest, legalMoves, COPY, UI_TRANSLATIONS, isLocale, TEXT_LANGUAGE, SEASON, ENSEMBLE, resolveRouteNode, EnsembleSession, ComicPlayer, BoardFeedback, ArtLibrary, FeedbackAudio, applyPartner, LEVELS;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _createClass = module.createClass;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      sys = module.sys;
      profiler = module.profiler;
      view = module.view;
      director = module.director;
      Node = module.Node;
      Layers = module.Layers;
      Camera = module.Camera;
      UITransform = module.UITransform;
      Canvas = module.Canvas;
      Graphics = module.Graphics;
      game = module.game;
      Game = module.Game;
      resources = module.resources;
      Font = module.Font;
      screen = module.screen;
      ResolutionPolicy = module.ResolutionPolicy;
      AudioSource = module.AudioSource;
      AudioClip = module.AudioClip;
      Color = module.Color;
      Label = module.Label;
      Mask = module.Mask;
      Director = module.Director;
      Component = module.Component;
    }, function (module) {
      balance = module.balance;
    }, function (module) {
      clone = module.clone;
      digest = module.digest;
      legalMoves = module.legalMoves;
    }, function (module) {
      COPY = module.COPY;
    }, function (module) {
      UI_TRANSLATIONS = module.UI_TRANSLATIONS;
      isLocale = module.isLocale;
      TEXT_LANGUAGE = module.TEXT_LANGUAGE;
    }, function (module) {
      SEASON = module.SEASON;
    }, function (module) {
      ENSEMBLE = module.ENSEMBLE;
      resolveRouteNode = module.resolveRouteNode;
    }, function (module) {
      EnsembleSession = module.EnsembleSession;
    }, function (module) {
      ComicPlayer = module.ComicPlayer;
    }, function (module) {
      BoardFeedback = module.BoardFeedback;
    }, function (module) {
      ArtLibrary = module.ArtLibrary;
    }, function (module) {
      FeedbackAudio = module.FeedbackAudio;
    }, function (module) {
      applyPartner = module.applyPartner;
    }, function (module) {
      LEVELS = module.LEVELS;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "553d5hw9S5NDbtRw8OMM6SM", "Main", undefined);
      var ROUTES = ENSEMBLE.routes.map(function (r) {
        return {
          id: r.id,
          levels: r.levels,
          choices: r.nodes.filter(function (n) {
            return n.choice;
          }).map(function (n) {
            return {
              nodeId: n.id,
              levelId: n.levelId,
              optionIds: n.choice.options.map(function (o) {
                return o.id;
              })
            };
          })
        };
      });
      var ccclass = _decorator.ccclass;
      // The prototype journal remains untouched; the complete season has its own identity.
      var LEGACY_SAVE = 'puerto-luz:season:v1',
        SAVE = 'puerto-luz:ensemble:v2',
        PREFS = 'puerto-luz:season:prefs:v1';
      var C = {
        bg: '#101F28',
        panel: '#233D46',
        ink: '#FFF1D9',
        muted: '#B4C6C8',
        gold: '#F3C47E',
        accent: '#EF9788',
        green: '#9DD9BF',
        tile: ['#F1928C', '#75C9E4', '#FFD37B', '#B8A3E9', '#91D9B8']
      };
      var PuertoLuz = exports('PuertoLuz', (_dec = ccclass('PuertoLuz'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(PuertoLuz, _Component);
        function PuertoLuz() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.session = new EnsembleSession(ROUTES, LEVELS);
          _this.locale = 'es-419';
          _this.sound = true;
          _this.reducedMotion = false;
          _this.canvas = void 0;
          _this.surface = void 0;
          _this.layer = void 0;
          _this.art = void 0;
          _this.hits = [];
          _this.selected = -1;
          _this.hammer = false;
          _this.message = '';
          _this.dirty = true;
          _this.busy = 0;
          _this.visual = null;
          _this.modal = '';
          _this.offerItem = 'hammer';
          _this.offerSource = 'ad-simulation';
          _this.counter = 0;
          _this.offerId = '';
          _this.restorationIssue = '';
          _this.page = 'home';
          _this.chapterIndex = 0;
          _this.comicIndex = 0;
          _this.review = false;
          _this.designHeight = 844;
          _this.feedbackAudio = void 0;
          _this.feedback = void 0;
          _this.tokenNodes = new Map();
          _this.progressGraphic = null;
          _this.gesture = null;
          _this.suppressedTouches = new Set();
          _this.pressed = '';
          _this.comicStatus = '';
          _this.inputMode = 'tap';
          _this.safeTop = 0;
          _this.safeBottom = 0;
          _this.supplyContext = null;
          _this.music = null;
          _this.musicRequested = false;
          _this.hidden = false;
          _this.victoryTimer = 0;
          _this.illustrations = new ArtLibrary();
          _this.effectsGraphic = null;
          _this.background = null;
          _this.storyFont = null;
          _this.chineseFont = null;
          _this.observedWidth = 0;
          _this.observedHeight = 0;
          _this.partnerColor = -1;
          _this.partnerFrom = -1;
          _this.partnerTo = -1;
          _this.partnerBefore = false;
          return _this;
        }
        var _proto = PuertoLuz.prototype;
        _proto.et = function et(es, pt, en, zh) {
          return {
            es: es,
            pt: pt,
            en: en,
            zh: zh
          }[this.lang];
        };
        _proto.tr = function tr(es, pt) {
          return this.lang === 'es' ? es : this.lang === 'pt' ? pt : UI_TRANSLATIONS[es][this.lang];
        };
        _proto.title = function title(value) {
          return value[this.lang];
        };
        _proto.start = function start() {
          var _this2 = this;
          try {
            var raw = sys.localStorage.getItem(SAVE);
            this.session = raw ? EnsembleSession.restore(ROUTES, LEVELS, raw) : new EnsembleSession(ROUTES, LEVELS, sys.localStorage.getItem(LEGACY_SAVE) || undefined);
            if (!raw) sys.localStorage.setItem(SAVE, this.session.serialize());
          } catch (_unused) {
            this.restorationIssue = 'SAVE_RECOVERY_REQUIRED';
          }
          try {
            var p = JSON.parse(sys.localStorage.getItem(PREFS) || '{}');
            if (isLocale(p.locale)) this.locale = p.locale;
            this.sound = p.sound !== false;
            this.reducedMotion = p.reducedMotion === true;
          } catch (_unused2) {/* Defaults preserve the journal. */}
          profiler.hideStats();
          this.resize();
          view.resizeWithBrowserSize(true);
          var scene = director.getScene(),
            cameraNode = new Node('Camera');
          scene.addChild(cameraNode);
          cameraNode.layer = Layers.Enum.UI_2D;
          cameraNode.setPosition(0, 0, 1000);
          var camera = cameraNode.addComponent(Camera);
          camera.projection = Camera.ProjectionType.ORTHO;
          camera.visibility = Layers.Enum.UI_2D;
          camera.clearColor = this.color(C.bg);
          camera.near = 1;
          camera.far = 2000;
          this.canvas = new Node('NativeCanvas');
          this.canvas.layer = Layers.Enum.UI_2D;
          scene.addChild(this.canvas);
          this.canvas.addComponent(UITransform).setContentSize(390, this.designHeight);
          this.canvas.addComponent(Canvas).cameraComponent = camera;
          var backdrop = new Node('Backdrop');
          backdrop.layer = Layers.Enum.UI_2D;
          this.canvas.addChild(backdrop);
          this.background = backdrop.addComponent(Graphics);
          this.surface = new Node('TouchSurface');
          this.surface.layer = Layers.Enum.UI_2D;
          this.canvas.addChild(this.surface);
          this.surface.addComponent(UITransform).setContentSize(390, this.designHeight);
          this.surface.on(Node.EventType.TOUCH_START, this.touchStart, this);
          this.surface.on(Node.EventType.TOUCH_MOVE, this.touchMove, this);
          this.surface.on(Node.EventType.TOUCH_END, this.touchEnd, this);
          this.surface.on(Node.EventType.TOUCH_CANCEL, this.touchCancel, this);
          this.feedbackAudio = new FeedbackAudio(this.canvas);
          this.feedbackAudio.setEnabled(this.sound);
          this.feedback = new BoardFeedback(function (key) {
            return _this2.feedbackAudio.play(key);
          });
          this.art = new ComicPlayer(this.canvas, function () {
            _this2.dirty = true;
          });
          game.on(Game.EVENT_HIDE, this.onHide, this);
          game.on(Game.EVENT_SHOW, this.onShow, this);
          globalThis.__PUERTO__ = {
            engine: 'Cocos Creator 3.8.8',
            snapshot: function snapshot() {
              var _this2$music, _this2$music2, _this2$music3, _this2$season$nodes$_, _this2$art$shot, _this2$art$shot2, _this2$season$nodes$_2;
              return {
                typography: {
                  storyFontLoaded: !!_this2.storyFont,
                  chineseFontLoaded: !!_this2.chineseFont,
                  family: _this2.lang === 'zh' ? 'PuertoLuzChinese' : 'Newsreader16ptMedium'
                },
                state: clone(_this2.session.state),
                activeRouteId: _this2.session.activeRouteId,
                partner: _extends({}, _this2.session.partnerStatus, {
                  color: _this2.partnerColor,
                  from: _this2.partnerFrom,
                  to: _this2.partnerTo,
                  preview: _this2.partnerPreview
                }),
                routes: _this2.session.routeSummaries,
                choices: _extends({}, _this2.session.choices),
                locale: _this2.locale,
                sound: _this2.sound,
                reducedMotion: _this2.reducedMotion,
                music: {
                  loaded: !!((_this2$music = _this2.music) != null && _this2$music.clip),
                  playing: ((_this2$music2 = _this2.music) == null ? void 0 : _this2$music2.playing) || false,
                  volume: ((_this2$music3 = _this2.music) == null ? void 0 : _this2$music3.volume) || 0
                },
                page: _this2.page,
                modal: _this2.modal,
                chapter: _this2.chapterIndex,
                review: _this2.review,
                comicNode: (_this2$season$nodes$_ = _this2.season.nodes[_this2.comicIndex]) == null ? void 0 : _this2$season$nodes$_.id,
                comic: _extends({}, _this2.art.snapshot(), {
                  statusText: _this2.comicStatus,
                  caption: ((_this2$art$shot = _this2.art.shot) == null ? void 0 : _this2$art$shot[_this2.lang]) || '',
                  speaker: ((_this2$art$shot2 = _this2.art.shot) == null ? void 0 : _this2$art$shot2.speakerLabels[_this2.lang]) || ''
                }),
                objective: _this2.title(((_this2$season$nodes$_2 = _this2.season.nodes[_this2.session.state.levelIndex]) == null ? void 0 : _this2$season$nodes$_2.objective) || _this2.season.nodes[_this2.season.nodes.length - 1].objective),
                designHeight: _this2.designHeight,
                safeArea: {
                  top: _this2.safeTop,
                  bottom: _this2.safeBottom,
                  contentHeight: _this2.contentHeight
                },
                feedback: _this2.feedback.snapshot(),
                victory: {
                  active: _this2.victoryTimer > 0,
                  remaining: _this2.victoryTimer
                },
                feedbackAudio: _this2.feedbackAudio.snapshot(),
                inputMode: _this2.inputMode,
                gesture: _this2.gesture ? {
                  drag: _this2.gesture.drag,
                  target: _this2.gesture.target,
                  start: _this2.gesture.hit.id
                } : null,
                tutorial: !_this2.session.state.events.some(function (e) {
                  return e.type === 'swap_committed';
                }),
                hammer: _this2.hammer,
                selected: _this2.selected,
                busy: _this2.busy,
                saveIssue: _this2.restorationIssue,
                message: _this2.message,
                hash: digest(_this2.session.state),
                legal: _this2.session.state.board ? legalMoves(_this2.session.state.board) : [],
                hits: _this2.hits.map(function (_ref) {
                  var id = _ref.id,
                    x = _ref.x,
                    y = _ref.y,
                    w = _ref.w,
                    h = _ref.h;
                  return {
                    id: id,
                    x: x,
                    y: y + _this2.safeTop,
                    w: w,
                    h: h
                  };
                }),
                events: clone(_this2.session.state.events)
              };
            }
          };
          resources.load('fonts/Newsreader16pt-Medium', Font, function (error, font) {
            if (error || !font || !_this2.isValid) return;
            _this2.storyFont = font;
            _this2.dirty = true;
          });
          resources.load('fonts/PuertoLuzChinese', Font, function (error, font) {
            if (error || !font || !_this2.isValid) return;
            _this2.chineseFont = font;
            _this2.dirty = true;
          });
          this.render();
        };
        _proto.resize = function resize() {
          var _this$canvas, _this$surface;
          var size = screen.windowSize;
          if (size.width === this.observedWidth && size.height === this.observedHeight) return;
          this.observedWidth = size.width;
          this.observedHeight = size.height;
          this.cancelGesture();
          this.suppressedTouches.clear();
          this.designHeight = Math.max(650, 390 * size.height / Math.max(1, size.width));
          view.setDesignResolutionSize(390, this.designHeight, 390 * size.height / Math.max(1, size.width) < 650 ? ResolutionPolicy.SHOW_ALL : ResolutionPolicy.FIXED_WIDTH);
          this.safeTop = 0;
          this.safeBottom = 0;
          if (sys.isNative) {
            try {
              var safe = sys.getSafeAreaRect(false);
              this.safeTop = Math.max(0, this.designHeight - safe.y - safe.height);
              this.safeBottom = Math.max(0, safe.y);
            } catch (_unused3) {}
          }
          (_this$canvas = this.canvas) == null || (_this$canvas = _this$canvas.getComponent(UITransform)) == null || _this$canvas.setContentSize(390, this.designHeight);
          (_this$surface = this.surface) == null || (_this$surface = _this$surface.getComponent(UITransform)) == null || _this$surface.setContentSize(390, this.designHeight);
          this.dirty = true;
        };
        _proto.onDestroy = function onDestroy() {
          var _this$feedbackAudio;
          game.off(Game.EVENT_HIDE, this.onHide, this);
          game.off(Game.EVENT_SHOW, this.onShow, this);
          (_this$feedbackAudio = this.feedbackAudio) == null || _this$feedbackAudio.dispose();
        };
        _proto.onHide = function onHide() {
          var _this$feedback, _this$feedbackAudio2, _this$music, _this$art;
          console.info('[PuertoLifecycle] ' + JSON.stringify({
            event: 'hide',
            busy: this.busy > 0,
            phase: ((_this$feedback = this.feedback) == null ? void 0 : _this$feedback.phase) || 'idle',
            page: this.page
          }));
          this.cancelGesture();
          this.suppressedTouches.clear();
          this.hidden = true;
          (_this$feedbackAudio2 = this.feedbackAudio) == null || _this$feedbackAudio2.setEnabled(false);
          (_this$music = this.music) == null || _this$music.pause();
          this.selected = -1;
          this.hammer = false;
          (_this$art = this.art) == null || _this$art.suspend();
          if (['play', 'comic', 'choice'].includes(this.page)) this.modal = 'pause';
          this.dirty = true;
        };
        _proto.onShow = function onShow() {
          var _this$feedback2, _this$feedbackAudio3;
          console.info('[PuertoLifecycle] ' + JSON.stringify({
            event: 'show',
            busy: this.busy > 0,
            phase: ((_this$feedback2 = this.feedback) == null ? void 0 : _this$feedback2.phase) || 'idle',
            page: this.page
          }));
          this.hidden = false;
          (_this$feedbackAudio3 = this.feedbackAudio) == null || _this$feedbackAudio3.setEnabled(this.sound);
          this.musicState();
          this.resize();
          this.dirty = true;
        };
        _proto.musicState = function musicState() {
          if (!this.music) return;
          if (this.sound && !this.hidden) {
            if (this.music.clip && !this.music.playing) this.music.play();
          } else this.music.pause();
        };
        _proto.ensureMusic = function ensureMusic() {
          var _this3 = this;
          if (this.musicRequested) return;
          this.musicRequested = true;
          this.music = this.node.addComponent(AudioSource);
          this.music.loop = true;
          this.music.playOnAwake = false;
          this.music.volume = .28;
          if (!resources.getInfoWithPath('music/harbor-loop', AudioClip)) return;
          resources.load('music/harbor-loop', AudioClip, function (error, clip) {
            if (error || !clip || !_this3.music) return;
            _this3.music.clip = clip;
            _this3.musicState();
          });
        };
        _proto.prefs = function prefs() {
          var _this$feedbackAudio4;
          this.musicState();
          (_this$feedbackAudio4 = this.feedbackAudio) == null || _this$feedbackAudio4.setEnabled(this.sound && !this.hidden);
          try {
            sys.localStorage.setItem(PREFS, JSON.stringify({
              locale: this.locale,
              sound: this.sound,
              reducedMotion: this.reducedMotion
            }));
          } catch (_unused4) {
            this.message = this.tr('No se guardaron los ajustes.', 'Não foi possível salvar os ajustes.');
          }
        };
        _proto.color = function color(s) {
          return new Color().fromHEX(s);
        };
        _proto.serif = function serif(label) {
          label.isBold = false;
          var isChinese = /[\u3400-\u9fff]/.test(label.string),
            font = isChinese ? this.chineseFont : this.storyFont;
          if (font) {
            label.font = font;
            label.useSystemFont = false;
          } else label.fontFamily = isChinese ? 'sans-serif' : 'Georgia';
        };
        _proto.makeNode = function makeNode(name, x, y) {
          if (x === void 0) {
            x = 0;
          }
          if (y === void 0) {
            y = 0;
          }
          var n = new Node(name);
          n.layer = Layers.Enum.UI_2D;
          this.layer.addChild(n);
          n.setPosition(x, -y);
          return n;
        };
        _proto.rect = function rect(x, y, w, h, fill, r, stroke) {
          if (r === void 0) {
            r = 12;
          }
          var g = this.makeNode('surface', x, y).addComponent(Graphics);
          g.fillColor = this.color(fill);
          g.roundRect(0, -h, w, h, r);
          g.fill();
          if (stroke) {
            g.lineWidth = 2;
            g.strokeColor = this.color(stroke);
            g.stroke();
          }
          return g;
        };
        _proto.text = function text(value, x, y, w, size, color, align, h) {
          if (size === void 0) {
            size = 16;
          }
          if (color === void 0) {
            color = C.ink;
          }
          if (align === void 0) {
            align = 0;
          }
          if (h === void 0) {
            h = 50;
          }
          var n = this.makeNode('text', x + w / 2, y + h / 2);
          n.addComponent(UITransform).setContentSize(w, h);
          var l = n.addComponent(Label);
          l.string = value;
          l.fontSize = size;
          l.lineHeight = size * 1.25;
          l.color = this.color(color);
          l.horizontalAlign = align;
          l.verticalAlign = 0;
          l.overflow = Label.Overflow.CLAMP;
          l.isBold = size >= 23;
          if (this.chineseFont && (this.lang === 'zh' || /[\u3400-\u9fff]/.test(value))) {
            l.font = this.chineseFont;
            l.useSystemFont = false;
          }
          return l;
        };
        _proto.button = function button(id, label, x, y, w, action, secondary, h, enabled) {
          if (secondary === void 0) {
            secondary = false;
          }
          if (h === void 0) {
            h = 48;
          }
          if (enabled === void 0) {
            enabled = true;
          }
          h = Math.max(48, h);
          var down = this.pressed === id;
          this.rect(x, y + 3, w, h, secondary ? '#0C1B23' : '#755536', 14);
          this.rect(x, y, w, h, enabled ? down ? '#EBAA72' : secondary ? C.panel : C.gold : '#263B44', 14, secondary && enabled ? '#476069' : undefined);
          if (!secondary && enabled) this.rect(x + 13, y + 3, w - 26, 2, '#FFE4B4', 1);
          this.text(label, x + 7, y + (h - 22) / 2, w - 14, 14, enabled ? secondary ? C.ink : C.bg : '#849B9F', 1, 25);
          if (enabled) this.hits.push({
            id: id,
            x: x,
            y: y,
            w: w,
            h: h,
            action: action
          });
        };
        _proto.cancelGesture = function cancelGesture() {
          this.gesture = null;
          this.pressed = '';
          this.dirty = true;
        };
        _proto.point = function point(e) {
          var p = e.getUILocation();
          return {
            x: p.x,
            y: this.designHeight - p.y - this.safeTop
          };
        };
        _proto.permitted = function permitted(hit) {
          return !this.hidden && (this.busy <= 0 || this.page !== 'play' || !!this.modal || hit.id === 'menu' || hit.id === 'pause-lost');
        };
        _proto.touchStart = function touchStart(e) {
          var id = e.getID();
          if (id === null) return;
          if (this.gesture || e.getAllTouches().length > 1) {
            for (var _iterator = _createForOfIteratorHelperLoose(e.getAllTouches()), _step; !(_step = _iterator()).done;) {
              var t = _step.value;
              this.suppressedTouches.add(t.getID());
            }
            this.cancelGesture();
            return;
          }
          if (this.suppressedTouches.has(id)) return;
          var p = this.point(e),
            hit = [].concat(this.hits).reverse().find(function (h) {
              return p.x >= h.x && p.x <= h.x + h.w && p.y >= h.y && p.y <= h.y + h.h;
            });
          if (!hit || !this.permitted(hit)) return;
          this.gesture = _extends({
            id: id
          }, p, {
            hit: hit,
            target: -1,
            drag: false,
            axis: null
          });
          this.pressed = hit.id;
          this.dirty = true;
        };
        _proto.touchMove = function touchMove(e) {
          var g = this.gesture;
          if (!g || g.id !== e.getID()) return;
          if (!this.permitted(g.hit)) {
            this.cancelGesture();
            return;
          }
          var p = this.point(e),
            dx = p.x - g.x,
            dy = p.y - g.y;
          if (Math.hypot(dx, dy) < 18) return;
          if (!g.hit.id.startsWith('cell:') || this.hammer) {
            this.cancelGesture();
            return;
          }
          if (!g.axis) g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
          var a = Number(g.hit.id.slice(5)),
            b = g.axis === 'x' ? a + (dx > 0 ? 1 : -1) : a + (dy > 0 ? 7 : -7);
          g.drag = true;
          g.target = b >= 0 && b < 49 && Math.abs(a % 7 - b % 7) + Math.abs(Math.floor(a / 7) - Math.floor(b / 7)) === 1 ? b : -1;
          this.inputMode = 'drag';
          this.dirty = true;
        };
        _proto.touchEnd = function touchEnd(e) {
          var id = e.getID();
          if (id !== null && this.suppressedTouches["delete"](id)) return;
          var g = this.gesture;
          if (!g || g.id !== id) return;
          var p = this.point(e);
          this.cancelGesture();
          if (!this.permitted(g.hit)) return;
          if (g.drag) {
            if (g.target >= 0) {
              this.ensureMusic();
              this.transact({
                type: 'swap',
                a: Number(g.hit.id.slice(5)),
                b: g.target
              });
            }
            return;
          }
          if (Math.hypot(p.x - g.x, p.y - g.y) >= 18) return;
          if (p.x >= g.hit.x && p.x <= g.hit.x + g.hit.w && p.y >= g.hit.y && p.y <= g.hit.y + g.hit.h) {
            this.inputMode = 'tap';
            this.tap(p.x, p.y);
          }
        };
        _proto.touchCancel = function touchCancel(e) {
          var id = e.getID();
          if (id !== null) this.suppressedTouches["delete"](id);
          this.cancelGesture();
        };
        _proto.tap = function tap(x, y) {
          for (var _iterator2 = _createForOfIteratorHelperLoose([].concat(this.hits).reverse()), _step2; !(_step2 = _iterator2()).done;) {
            var hit = _step2.value;
            if (x >= hit.x && x <= hit.x + hit.w && y >= hit.y && y <= hit.y + hit.h) {
              if (!this.permitted(hit)) return;
              this.hits = [];
              this.ensureMusic();
              if (!hit.id.startsWith('cell:')) this.feedbackAudio.play('select');
              hit.action();
              this.dirty = true;
              return;
            }
          }
        };
        _proto.transact = function transact(cmd) {
          var _this$session$state$b;
          if (this.restorationIssue) return false;
          var before = this.session.state.board ? clone(this.session.state.board) : null;
          var result = this.session.dispatch(cmd, function (raw) {
            return sys.localStorage.setItem(SAVE, raw);
          });
          this.selected = -1;
          this.hammer = false;
          if (!result.ok) {
            this.message = result.reason === 'SAVE_FAILED' ? this.t.save : result.reason === 'NO_INVENTORY' ? this.t.noInventory : this.t.invalid;
            if (cmd.type === 'swap' && before && result.reason === 'NO_MATCH') {
              this.feedback.start(before, before, [], cmd, true, this.reducedMotion);
              this.busy = 1;
              this.visual = this.feedback.board;
            } else this.feedbackAudio.play('reject');
            this.dirty = true;
            return false;
          }
          this.message = result.reshuffled ? this.t.shuffleDone : '';
          if (before && !before.cells.some(function (c) {
            return c.special;
          }) && (_this$session$state$b = this.session.state.board) != null && _this$session$state$b.cells.some(function (c) {
            return c.special;
          })) this.message = this.tr('¡Ficha rayada! 4 en línea la crean; combínala para borrar toda su fila.', 'Peça listrada! 4 em linha a criam; combine-a para limpar a linha toda.');
          if (result.frames.length && before) {
            this.feedback.start(before, this.session.state.board, result.frames, cmd.type === 'swap' ? cmd : null, false, this.reducedMotion);
            this.busy = 1;
            this.visual = this.feedback.board;
          } else {
            this.feedback.finish();
            this.victoryTimer = 0;
            this.busy = 0;
            this.visual = null;
            this.routeSession();
          }
          this.dirty = true;
          return true;
        };
        _proto.routeSession = function routeSession() {
          var screen = this.session.state.screen;
          if (screen === 'story') {
            if (!this.review && this.comicIndex === this.session.state.levelIndex && this.art.shots.length) {
              this.page = 'comic';
              this.modal = '';
            } else this.openComic(this.session.state.levelIndex, false);
          } else this.page = screen === 'ending' ? 'ending' : 'play';
        };
        _proto.resume = function resume() {
          if (this.session.state.screen === 'intro') this.transact({
            type: 'begin'
          });else this.routeSession();
        };
        _proto.openComic = function openComic(index, review) {
          var node = this.season.nodes[index];
          if (!node || !this.session.state.storyUnlocked.includes(node.levelId)) return;
          this.comicIndex = index;
          this.review = review;
          this.message = '';
          this.art.open(node.shots);
          this.page = 'comic';
          this.modal = '';
          this.dirty = true;
        };
        _proto.update = function update(dt) {
          var _this$art2, _this$art3;
          this.resize();
          (_this$art2 = this.art) == null || _this$art2.configure(this.sound, this.reducedMotion, this.lang);
          (_this$art3 = this.art) == null || _this$art3.update(dt, this.page === 'comic' && !this.modal && !this.hidden);
          if (this.music) {
            var target = this.page === 'comic' && this.art.speaking ? .10 : .28;
            this.music.volume += (target - this.music.volume) * Math.min(1, dt * 7);
          }
          if (this.busy > 0 && !this.modal && !this.hidden && this.page === 'play') {
            if (this.victoryTimer > 0) {
              this.victoryTimer = Math.max(0, this.victoryTimer - dt);
              if (!this.victoryTimer) {
                this.busy = 0;
                this.routeSession();
                this.dirty = true;
              }
            } else if (this.feedback.update(dt)) {
              this.visual = this.feedback.board;
              this.dirty = true;
              if (!this.feedback.active) {
                var _this$session$state$b2;
                this.visual = null;
                if (((_this$session$state$b2 = this.session.state.board) == null ? void 0 : _this$session$state$b2.status) === 'won') {
                  this.feedbackAudio.play('win');
                  this.victoryTimer = this.reducedMotion ? .5 : 1.15;
                } else {
                  this.busy = 0;
                  this.routeSession();
                }
              }
            }
          }
          if (this.dirty) this.render();
          if (this.busy && this.page === 'play') {
            for (var _iterator3 = _createForOfIteratorHelperLoose(this.tokenNodes), _step3; !(_step3 = _iterator3()).done;) {
              var _step3$value = _step3.value,
                i = _step3$value[0],
                node = _step3$value[1];
              var t = this.feedback.transform(i, this.reducedMotion);
              node.setPosition(i % 7 * 50 + 23 + t.dx, -(Math.floor(i / 7) * 50 + 23 + t.dy));
              node.setScale(t.scale, t.scale, 1);
            }
          }
          this.updateProgress();
          this.updateEffects();
        };
        _proto.updateProgress = function updateProgress() {
          var g = this.progressGraphic;
          if (!g || this.page !== 'comic' || this.modal) return;
          g.clear();
          for (var i = 0; i < this.art.shots.length; i++) {
            var width = (342 - (this.art.shots.length - 1) * 6) / this.art.shots.length,
              x = i * (width + 6);
            g.fillColor = this.color(C.panel);
            g.roundRect(x, 0, width, 5, 2);
            g.fill();
            var p = i < this.art.index || this.art.finished ? 1 : i === this.art.index ? Math.min(1, this.art.elapsed / this.art.duration) : 0;
            if (p > 0) {
              g.fillColor = this.color(C.gold);
              g.roundRect(x, 0, Math.max(2, width * p), 5, 2);
              g.fill();
            }
          }
        };
        _proto.render = function render() {
          var _this4 = this;
          this.dirty = false;
          this.tokenNodes.clear();
          this.progressGraphic = null;
          this.effectsGraphic = null;
          if (this.layer) {
            this.layer.removeFromParent();
            this.layer.destroy();
          }
          this.layer = new Node('Presentation');
          this.layer.layer = Layers.Enum.UI_2D;
          this.canvas.addChild(this.layer);
          this.layer.setPosition(-195, this.designHeight / 2 - this.safeTop);
          this.hits = [];
          if (this.background) {
            this.background.clear();
            this.background.fillColor = this.color(C.bg);
            this.background.rect(-195, -this.designHeight / 2, 390, this.designHeight);
            this.background.fill();
          }
          this.art.visible((this.page === 'home' || this.page === 'comic') && !this.modal && !this.restorationIssue);
          var scenic = ['home', 'comic', 'ending'].includes(this.page);
          if (!scenic) this.rect(0, -this.safeTop, 390, this.designHeight, C.bg, 0);
          if (this.restorationIssue) {
            this.text(this.tr('Guardado protegido', 'Arquivo protegido'), 24, 170, 342, 26);
            this.text(this.tr('No se pudo recuperar la partida. Conservamos el archivo original sin sobrescribirlo.', 'Não foi possível recuperar a partida. O arquivo original foi preservado.'), 24, 224, 342, 19, C.muted, 0, 140);
            return;
          }
          if (this.page === 'home') this.drawHome();else if (this.page === 'map') this.drawMap();else if (this.page === 'chapter') this.drawChapter();else if (this.page === 'play') this.drawBoard(this.visual || this.session.state.board);else if (this.page === 'comic') this.drawComic();else if (this.page === 'choice') this.drawChoice();else this.drawEnding();
          if (this.page !== 'home') {
            this.icon('signal', 21, 29, 18, C.gold);
            this.text('PUERTO LUZ', 49, 20, 213, 17, C.ink, 0, 25);
            this.text(this.page === 'play' ? this.tr('RESTAURA LA SEÑAL', 'RESTAURE O SINAL') : this.route ? this.route.name.toUpperCase() : this.tr('UNA SEÑAL ENTRE DOS', 'UM SINAL ENTRE DOIS'), 50, 47, 227, 9, C.gold, 0, 18);
          }
          this.button('menu', ['play', 'comic', 'choice'].includes(this.page) ? 'Ⅱ' : this.tr('Ajustes', 'Ajustes'), 298, 18, 72, function () {
            _this4.modal = ['play', 'comic', 'choice'].includes(_this4.page) ? 'pause' : 'settings';
          }, true, 48);
          this.art.root.setSiblingIndex(this.canvas.children.length - 1);
          this.layer.setSiblingIndex(this.canvas.children.length - 1);
          if (this.modal) this.drawModal();
        };
        _proto.fade = function fade(x, y, w, h, from, to) {
          var g = this.makeNode('CinematicScrim', x, y).addComponent(Graphics);
          for (var i = 0; i < 96; i++) {
            g.fillColor = new Color(10, 24, 32, Math.round(from + (to - from) * i / 95));
            g.rect(0, -h * (i + 1) / 96, w, h / 96 + .2);
            g.fill();
          }
        };
        _proto.icon = function icon(kind, x, y, r, color) {
          if (r === void 0) {
            r = 14;
          }
          if (color === void 0) {
            color = C.gold;
          }
          var g = this.makeNode('Icon:' + kind, x, y).addComponent(Graphics);
          g.strokeColor = this.color(color);
          g.fillColor = this.color(color);
          g.lineWidth = 2;
          if (kind === 'signal') {
            for (var i = 0; i < 5; i++) {
              var h = (i === 2 ? 1 : i === 1 || i === 3 ? .65 : .35) * r;
              g.roundRect(-r + i * r * .45, -h / 2, 3, h, 1);
              g.fill();
            }
          } else if (kind === 'hammer') {
            g.moveTo(-r * .5, -r * .65);
            g.lineTo(r * .4, r * .6);
            g.stroke();
            g.roundRect(-r * .15, r * .2, r * .9, r * .5, 3);
            g.fill();
          } else if (kind === 'shuffle') {
            g.moveTo(-r, r * .4);
            g.bezierCurveTo(0, r * .4, 0, -r * .4, r, -r * .4);
            g.moveTo(-r, -r * .4);
            g.bezierCurveTo(0, -r * .4, 0, r * .4, r, r * .4);
            g.stroke();
            g.moveTo(r - 5, r * .4 + 4);
            g.lineTo(r, r * .4);
            g.lineTo(r - 5, r * .4 - 4);
            g.stroke();
          } else if (kind === 'check') {
            g.moveTo(-r * .6, 0);
            g.lineTo(-r * .15, -r * .45);
            g.lineTo(r * .65, r * .55);
            g.stroke();
          } else {
            g.roundRect(-r, -r * .7, r * 2, r * 1.4, 4);
            g.stroke();
            g.circle(-r * .4, 0, r * .17);
            g.circle(r * .4, 0, r * .17);
            g.stroke();
          }
          return g;
        };
        _proto.station = function station(y, w) {
          if (w === void 0) {
            w = 342;
          }
          var done = this.session.state.completed.length,
            total = this.season.nodes.length;
          this.text(this.route ? this.route.name.toUpperCase() : this.tr('RADIO PUERTO LUZ', 'RÁDIO PUERTO LUZ'), 24, y, w, 10, C.gold, 0, 18);
          this.text(done + " / " + total, 24, y, w, 11, C.ink, 2, 18);
          for (var i = 0; i < total; i++) this.rect(24 + i * (w / total), y + 25, w / total - 4, 5, i < done ? C.gold : '#49606A', 2);
        };
        _proto.selectRoute = function selectRoute(id) {
          if (this.restorationIssue) return;
          var result = this.session.selectRoute(id, function (raw) {
            return sys.localStorage.setItem(SAVE, raw);
          });
          if (!result.ok) {
            this.message = this.t.save;
            return;
          }
          this.art.suspend();
          this.art.shots = [];
          this.review = false;
          this.comicIndex = -1;
          this.selected = -1;
          this.hammer = false;
          this.message = '';
          this.modal = '';
          this.page = 'map';
        };
        _proto.drawHome = function drawHome() {
          var _this5 = this;
          var h = this.contentHeight;
          this.art.visible(false);
          this.icon('signal', 34, 38, 22);
          var brand = this.text('PUERTO LUZ', 65, 22, 220, 25, C.ink, 0, 40);
          this.serif(brand);
          this.text(this.et('Dos encuentros. Tu propia historia.', 'Dois encontros. Sua história.', 'Two encounters. Your own story.', '两次相遇，属于你的故事。'), 24, 82, 342, 18, C.ink, 0, 30);
          this.text(this.et('Elige a quién conocer. Cada historia va a tu ritmo.', 'Escolha quem conhecer. Cada história tem seu ritmo.', 'Choose whom to meet. Each story moves at your pace.', '选择想了解的人，各条故事线独立推进。'), 24, 115, 342, 12, C.muted, 0, 40);
          var top = 166,
            step = Math.min(250, (h - 280) / 2);
          ENSEMBLE.routes.forEach(function (route, i) {
            var y = top + i * step,
              progress = _this5.session.routeSummaries.find(function (r) {
                return r.id === route.id;
              }),
              cardH = step - 14;
            _this5.rect(20, y, 350, cardH, '#203941', 18, i === 0 ? '#846B4E' : '#497E7B');
            _this5.illustrations.picture(_this5.layer, route.portrait, 21, y + 1, 125, cardH - 2);
            _this5.fade(119, y + 1, 28, cardH - 2, 50, 170);
            _this5.text(route.name, 161, y + 12, 193, 25, C.ink, 0, 35);
            _this5.text(route.age + " \xB7 " + _this5.title(route.title), 161, y + 49, 189, 11, C.gold, 0, 37);
            _this5.text(route.id === 'mateo' ? _this5.et('Volver a confiar. Elegir qué viene después.', 'Confiar de novo. Escolher o que vem depois.', 'Trust again. Choose what comes next.', '再次信任，下一步由你决定。') : _this5.et('Dos ideas. Un lugar para ambos.', 'Duas ideias. Um lugar para ambos.', 'Two ideas. A place for both.', '两种想法，一处共同的位置。'), 161, y + 85, 187, 12, C.muted, 0, Math.max(42, cardH - 153));
            _this5.button('route:' + route.id, _this5.et('Conocer', 'Conhecer', 'Meet', '走近他') + ("  \xB7  " + progress.completed.length + "/3  \u203A"), 158, y + cardH - 59, 195, function () {
              return _this5.selectRoute(route.id);
            }, i === 1, 48);
          });
          this.button('route:legacy', this.et('La radio · historia original', 'A rádio · história original', 'The radio · original story', '电台往事 · 原篇'), 24, h - 92, 342, function () {
            return _this5.selectRoute('legacy');
          }, true, 48);
          this.text(this.message || this.et('Historias independientes · decisiones que se recuerdan', 'Histórias independentes · escolhas que ficam', 'Independent stories · choices that are remembered', '独立故事线 · 你的选择会被记住'), 24, h - 32, 342, 10, C.muted, 1, 22);
        };
        _proto.drawRouteMap = function drawRouteMap() {
          var _this6 = this;
          var r = this.route,
            h = this.contentHeight,
            top = 276,
            step = Math.min(103, (h - top - 146) / 3);
          this.illustrations.picture(this.layer, r.portrait, 24, 87, 95, 157);
          this.text(r.name, 137, 91, 231, 30, C.ink, 0, 43);
          this.text(this.title(r.title), 137, 140, 224, 13, C.gold, 0, 38);
          this.text(this.title(r.bio), 137, 178, 224, 13, C.muted, 0, 80);
          r.nodes.forEach(function (node, i) {
            var y = top + i * step,
              unlocked = _this6.session.state.storyUnlocked.includes(node.levelId),
              current = i === _this6.session.state.levelIndex && _this6.session.state.screen !== 'ending';
            _this6.button('episode:' + i, String(i + 1).padStart(2, '0') + "   " + _this6.title(node.title), 24, y, 342, function () {
              if (current) _this6.resume();else if (unlocked) _this6.openComic(i, true);
            }, !current, 48, current || unlocked);
            _this6.text(unlocked ? _this6.et('RECUERDO RECUPERADO', 'LEMBRANÇA RECUPERADA', 'MEMORY RECOVERED', '已解锁回忆') : current ? _this6.et('GANA EL PUZZLE PARA CONTINUAR', 'VENÇA O PUZZLE PARA CONTINUAR', 'WIN THE PUZZLE TO CONTINUE', '通关谜题，解锁下一幕') : _this6.et('Completa el encuentro anterior', 'Conclua o encontro anterior', 'Finish the previous encounter', '完成前一次相遇'), 30, y + 53, 330, 10, C.muted, 0, 20);
          });
          if (this.session.state.screen === 'ending') this.button('route-ending', this.et('Tu desenlace', 'Seu desfecho', 'Your ending', '你的结局'), 24, h - 126, 342, function () {
            _this6.page = 'ending';
          });
          this.button('home', this.et('Otras historias', 'Outras histórias', 'Other stories', '其他故事'), 24, h - 66, 342, function () {
            return _this6.back();
          }, true);
        };
        _proto.drawChoice = function drawChoice() {
          var _this7 = this;
          var node = this.season.nodes[this.comicIndex],
            choice = node.choice,
            h = this.contentHeight,
            selected = this.session.choices[node.id],
            option = choice.options.find(function (o) {
              return o.id === selected;
            });
          this.art.visible(false);
          this.illustrations.picture(this.layer, node.shots[node.shots.length - 1].sceneKey, 0, 78, 390, Math.min(210, h * .25), 255, 0);
          this.fade(0, 78, 390, Math.min(210, h * .25), 0, 240);
          var top = 92 + Math.min(210, h * .25);
          this.text(this.et('TU DECISIÓN', 'SUA ESCOLHA', 'YOUR CHOICE', '你的选择'), 24, top, 342, 11, C.gold, 0, 22);
          var q = this.text(this.title(choice.prompt), 24, top + 29, 342, 22, C.ink, 0, 85);
          this.serif(q);
          if (option) {
            this.text(this.title(option.response), 24, top + 125, 342, 18, C.ink, 0, Math.max(100, h - top - 225));
            this.button('choice-continue', this.review ? this.et('Volver a recuerdos', 'Voltar às lembranças', 'Back to memories', '返回回忆') : this.t.next, 24, h - 66, 342, function () {
              if (_this7.review) _this7.page = 'map';else _this7.transact({
                type: 'next'
              });
            });
          } else {
            choice.options.forEach(function (o, i) {
              var y = top + 132 + i * 91;
              _this7.rect(24, y, 342, 78, i === 0 ? '#D9B47F' : C.panel, 14, i === 0 ? undefined : '#6C8385');
              _this7.text(_this7.title(o.text), 39, y + 14, 312, 16, i === 0 ? C.bg : C.ink, 0, 52);
              _this7.hits.push({
                id: 'choice:' + o.id,
                x: 24,
                y: y,
                w: 342,
                h: 78,
                action: function action() {
                  if (_this7.restorationIssue) return;
                  var result = _this7.session.choose(node.id, o.id, function (raw) {
                    return sys.localStorage.setItem(SAVE, raw);
                  });
                  if (!result.ok) _this7.message = _this7.t.save;
                }
              });
            });
            this.text(this.message || this.et('Esta elección se recordará. No cuesta ayudas.', 'Esta escolha será lembrada. Não custa ajudas.', 'This choice will be remembered. It costs no boosters.', '这个选择会被记住，不消耗任何道具。'), 24, h - 45, 342, 11, C.muted, 1, 32);
          }
        };
        _proto.drawRouteEnding = function drawRouteEnding() {
          var _last$choice,
            _this8 = this;
          var r = this.route,
            h = this.contentHeight,
            last = this.season.nodes[this.season.nodes.length - 1],
            option = (_last$choice = last.choice) == null ? void 0 : _last$choice.options.find(function (o) {
              return o.id === _this8.session.choices[last.id];
            });
          this.illustrations.picture(this.layer, last.shots[last.shots.length - 1].sceneKey, 0, 77, 390, Math.min(260, h * .31));
          this.fade(0, 77, 390, Math.min(260, h * .31), 0, 220);
          var y = 90 + Math.min(260, h * .31);
          this.text(r.name, 24, y, 342, 31, C.ink, 0, 46);
          this.text(option ? this.title(option.response) : this.title(r.ending), 24, y + 59, 342, 18, C.ink, 0, Math.max(100, h - y - 266));
          this.text(this.title(r.ending), 24, h - 195, 342, 13, C.muted, 0, 50);
          this.button('review', this.et('Revisitar nuestros recuerdos', 'Rever nossas lembranças', 'Revisit our memories', '重温我们的回忆'), 24, h - 126, 342, function () {
            _this8.page = 'map';
          });
          this.button('home', this.et('Explorar otra historia', 'Explorar outra história', 'Explore another story', '探索另一段故事'), 24, h - 66, 342, function () {
            return _this8.back();
          }, true);
        };
        _proto.back = function back() {
          this.cancelGesture();
          if (this.busy) {
            this.feedback.finish();
            this.victoryTimer = 0;
            this.busy = 0;
            this.visual = null;
          }
          this.page = 'home';
          this.modal = '';
          this.selected = -1;
          this.hammer = false;
        };
        _proto.drawMap = function drawMap() {
          var _this9 = this;
          if (this.route) {
            this.drawRouteMap();
            return;
          }
          var h = this.contentHeight;
          this.text(this.tr('Nuestra frecuencia', 'Nossa frequência'), 24, 89, 190, 23, C.ink, 0, 43);
          this.text(this.tr('Cada señal guarda una historia.', 'Cada sinal guarda uma história.'), 24, 133, 342, 13, C.muted, 0, 28);
          this.button('legacy-resume', this.et('Continuar', 'Continuar', 'Continue', '继续'), 224, 89, 142, function () {
            return _this9.resume();
          }, true);
          var step = Math.min(94, (h - 258) / 6),
            current = Math.min(5, Math.floor(this.session.state.levelIndex / 3));
          this.season.chapters.forEach(function (chapter, i) {
            var nodes = _this9.season.nodes.filter(function (n) {
                return n.chapterId === chapter.id;
              }),
              count = nodes.filter(function (n) {
                return _this9.session.state.storyUnlocked.includes(n.levelId);
              }).length,
              y = 174 + i * step,
              enabled = i <= current;
            _this9.rect(24, y, 342, step - 8, enabled ? '#29434B' : '#1A303A', 12, enabled && i === current ? C.gold : undefined);
            _this9.illustrations.picture(_this9.layer, _this9.season.nodes[i * 3].shots[0].sceneKey, 25, y + 1, 90, step - 10, enabled ? 255 : 90);
            _this9.text(String(i + 1).padStart(2, '0'), 128, y + 8, 35, 11, C.gold, 0, 20);
            _this9.text(_this9.title(chapter.title), 128, y + 26, 222, step < 75 ? 15 : 17, enabled ? C.ink : C.muted, 0, 23);
            for (var n = 0; n < 3; n++) _this9.rect(128 + n * 22, y + step - 22, 16, 4, n < count ? C.gold : '#557078', 2);
            _this9.text(count === 3 ? '✓' : enabled ? '›' : '·', 320, y + 8, 31, 24, enabled ? C.gold : C.muted, 1, 35);
            if (enabled) _this9.hits.push({
              id: 'chapter:' + i,
              x: 24,
              y: y,
              w: 342,
              h: step - 8,
              action: function action() {
                _this9.chapterIndex = i;
                _this9.page = 'chapter';
              }
            });
          });
          this.button('home', this.tr('Volver a la radio', 'Voltar à rádio'), 24, h - 69, 342, function () {
            return _this9.back();
          }, true, 48);
        };
        _proto.drawChapter = function drawChapter() {
          var _this10 = this;
          var chapter = this.season.chapters[this.chapterIndex],
            h = this.contentHeight,
            artH = Math.min(222, h * .28);
          this.illustrations.picture(this.layer, this.season.nodes[this.chapterIndex * 3].shots[0].sceneKey, 0, 78, 390, artH);
          this.fade(0, 78 + artH - 95, 390, 95, 0, 255);
          this.text("0" + (this.chapterIndex + 1) + " / 06", 24, 90, 342, 12, C.gold, 0, 22);
          var titleY = 78 + artH - 44;
          this.text(this.title(chapter.title), 24, titleY, 342, 26, C.ink, 0, 45);
          this.text(this.title(chapter.synopsis), 24, titleY + 52, 342, 14, C.muted, 0, 68);
          var top = titleY + 132,
            step = Math.min(85, (h - 91 - top) / 3);
          this.season.nodes.forEach(function (node, i) {
            if (node.chapterId !== chapter.id) return;
            var y = top + i % 3 * step,
              unlocked = _this10.session.state.storyUnlocked.includes(node.levelId),
              current = i === _this10.session.state.levelIndex && _this10.session.state.screen !== 'ending';
            _this10.button('episode:' + i, String(i + 1).padStart(2, '0') + "   " + _this10.title(node.title), 24, y, 342, function () {
              if (current) _this10.resume();else if (unlocked) _this10.openComic(i, true);
            }, !current, 48, unlocked || current);
            _this10.text(unlocked ? _this10.tr('ESCUCHAR DE NUEVO', 'OUVIR NOVAMENTE') : current ? _this10.tr('RECUPERA ESTA SEÑAL', 'RECUPERE ESTE SINAL') : _this10.tr('Completa el encuentro anterior', 'Conclua o encontro anterior'), 30, y + 53, 330, 10, C.muted, 0, 19);
          });
          this.button('map', this.tr('Todos los capítulos', 'Todos os capítulos'), 24, h - 69, 342, function () {
            _this10.page = 'map';
          }, true, 48);
        };
        _proto.drawComic = function drawComic() {
          var _this11 = this;
          var node = this.season.nodes[this.comicIndex],
            h = this.contentHeight,
            artY = h < 680 ? 128 : 137,
            artH = h < 680 ? 202 : Math.min(320, Math.max(219, h - 465));
          this.text((this.review ? this.tr('RECUERDO', 'LEMBRANÇA') : this.tr('SEÑAL RECUPERADA', 'SINAL RECUPERADO')) + "  \xB7  " + String(this.comicIndex + 1).padStart(2, '0') + " / " + this.season.nodes.length, 24, 86, 342, 10, C.gold, 0, 20);
          this.text(this.title(node.title), 24, 109, 342, 20, C.ink, 0, 28);
          this.art.showShot();
          this.art.layout(0, artY + this.safeTop, 390, artH, this.designHeight);
          this.art.visible(true);
          this.fade(0, artY, 390, 30, 60, 0);
          this.fade(0, artY + artH - 38, 390, 38, 0, 150);
          if (this.art.status !== 'ready') this.text(this.art.status === 'loading' ? this.tr('Cargando ilustración…', 'Carregando ilustração…') : this.tr('Ilustración no disponible · texto completo', 'Ilustração indisponível · texto completo'), 34, artY + artH / 2 - 25, 322, 16, C.muted, 1, 60);
          var shot = this.art.shot,
            captionY = artY + artH + 13,
            progressY = h - 179;
          this.illustrations.picture(this.layer, (shot == null ? void 0 : shot.sceneKey) || 'radio-night', 0, captionY + 35, 390, Math.max(75, progressY - captionY - 30), 22);
          this.fade(0, captionY + 35, 390, Math.max(75, progressY - captionY - 30), 100, 235);
          this.rect(24, captionY + 1, 3, 25, C.gold, 1);
          this.text((shot == null ? void 0 : shot.speakerLabels[this.lang]) || '', 37, captionY, 329, 13, C.gold, 0, 26);
          var caption = this.text(shot ? shot[this.lang] : '', 24, captionY + 34, 342, h < 720 ? 19 : 22, C.ink, 0, Math.max(90, progressY - captionY - 42));
          this.serif(caption);
          caption.lineHeight = h < 720 ? 25 : 29;
          this.progressGraphic = this.makeNode('ShotProgress', 24, progressY).addComponent(Graphics);
          var status = this.art.playback === 'loading' ? this.tr('Cargando escena…', 'Carregando cena…') : this.art.skipped ? this.tr('Escena omitida', 'Cena pulada') : this.art.finished ? this.tr('Escena completa', 'Cena completa') : !this.art.playing ? this.tr('En pausa · ▶ para continuar', 'Em pausa · ▶ para continuar') : this.tr('Reproduciendo · Ⅱ para pausar', 'Reproduzindo · Ⅱ para pausar');
          this.comicStatus = status;
          var mediaNote = !this.art.finished && (this.art.voiceStatus === 'missing' || !this.sound) ? ' · ' + (!this.sound ? this.tr('sin sonido', 'sem som') : this.tr('solo subtítulos', 'apenas legendas')) : '';
          this.text(this.art.index + 1 + " / " + this.art.shots.length + " \xB7 " + status + mediaNote, 24, progressY + 10, 342, 10, C.muted, 1, 28);
          this.button('previous-shot', '‹', 24, h - 126, 58, function () {
            return _this11.art.seek(_this11.art.index - 1);
          }, true, 48, this.art.index > 0);
          this.button('toggle-play', this.art.playing ? 'Ⅱ' : '▶', 91, h - 126, 74, function () {
            return _this11.art.toggle();
          }, true, 48);
          this.button('next-shot', '›', 174, h - 126, 58, function () {
            if (_this11.art.index + 1 < _this11.art.shots.length) _this11.art.seek(_this11.art.index + 1);else _this11.art.skip();
          }, true, 48);
          this.button('skip', this.tr('Omitir', 'Pular'), 242, h - 126, 124, function () {
            return _this11.art.skip();
          }, true, 48);
          this.button('next', node.choice ? this.et('Tu decisión   ›', 'Sua escolha   ›', 'Your choice   ›', '你的选择   ›') : this.review ? this.tr('Volver a capítulos', 'Voltar aos capítulos') : this.comicIndex === this.season.nodes.length - 1 ? this.tr('Ver el final', 'Ver o final') : this.t.next, 24, h - 66, 342, function () {
            if (node.choice && _this11.art.finished) _this11.page = 'choice';else if (_this11.review) _this11.page = _this11.route ? 'map' : 'chapter';else if (_this11.art.finished) _this11.transact({
              type: 'next'
            });
          }, false, 48, this.art.finished || this.review);
        };
        _proto.drawEnding = function drawEnding() {
          var _this12 = this;
          if (this.route) {
            this.drawRouteEnding();
            return;
          }
          var h = this.contentHeight,
            artH = Math.max(164, h - 535);
          this.illustrations.picture(this.layer, 'radio-live', 0, 76, 390, artH);
          this.fade(0, 76 + artH - 60, 390, 60, 0, 255);
          var y = 76 + artH - 5;
          this.icon('signal', 36, y + 15, 20);
          this.text(this.tr('ESTAMOS AL AIRE', 'ESTAMOS NO AR'), 60, y + 5, 307, 11, C.gold, 0, 22);
          var title = this.text(this.tr('Volvimos al aire.', 'Voltamos ao ar.'), 24, y + 37, 342, 32, C.ink, 0, 52);
          this.serif(title);
          this.text(this.title(this.season.ending), 24, y + 99, 342, h < 720 ? 15 : 16, C.ink, 0, h - y - 272);
          this.station(h - 161);
          this.button('review', this.tr('Volver a los recuerdos', 'Rever as lembranças'), 24, h - 112, 342, function () {
            _this12.page = 'map';
          });
          this.button('home', this.tr('Inicio', 'Início'), 24, h - 55, 342, function () {
            return _this12.back();
          }, true, 48);
        };
        _proto.drawBoard = function drawBoard(b) {
          var _this$feedback$stage,
            _this13 = this,
            _this$feedback$stage2,
            _this$feedback$stage3;
          if (!b) return;
          var s = this.session.state,
            h = this.contentHeight,
            boardY = this.boardY,
            compact = boardY < 220;
          if (!compact) {
            this.illustrations.picture(this.layer, this.season.nodes[s.levelIndex].shots[0].sceneKey, 0, 75, 390, boardY - 144, 160);
            this.fade(0, 75, 390, boardY - 144, 80, 215);
          }
          this.text(this.tr('ENCUENTRO', 'ENCONTRO') + " " + String(s.levelIndex + 1).padStart(2, '0') + " / " + this.season.nodes.length, 22, 82, 250, 10, C.gold, 0, 20);
          this.text(this.title(this.season.nodes[s.levelIndex].objective), 22, 107, 265, compact ? 12 : 14, C.ink, 0, compact ? 25 : 54);
          this.rect(299, 78, 68, 59, '#29434B', 19, '#6F8A87');
          this.text(String(b.moves), 302, 79, 62, 28, b.moves <= 5 ? C.accent : C.ink, 1, 37);
          this.text(this.t.moves, 301, 115, 64, 9, C.muted, 1, 16);
          this.rect(15, boardY - 55, 360, 410, '#0B1821', 20, '#507078');
          this.rect(20, boardY - 51, 350, 44, '#2E4A52', 13);
          this.drawToken(b.level.color, 42, boardY - 30, 12, false);
          var reached = b.collected >= b.level.target;
          this.text(Math.min(b.collected, b.level.target) + " / " + b.level.target, 62, boardY - 44, 140, 18, reached ? C.green : C.ink, 0, 26);
          this.rect(65, boardY - 16, 120, 3, '#172D36', 1);
          this.rect(65, boardY - 16, Math.max(2, 120 * Math.min(1, b.collected / b.level.target)), 3, reached ? C.green : C.gold, 1);
          if (b.level.crates.length) {
            this.icon('cassette', 224, boardY - 30, 12, C.muted);
            this.text(b.broken + " / " + b.level.crates.length, 247, boardY - 44, 104, 18, b.broken >= b.level.crates.length ? C.green : C.ink, 2, 30);
          } else this.text(this.tr('RECUPERA LA SEÑAL', 'RECUPERE O SINAL'), 209, boardY - 38, 144, 9, C.muted, 1, 24);
          var rowClear = this.feedback.phase === 'clear' && ((_this$feedback$stage = this.feedback.stage) == null ? void 0 : _this$feedback$stage.cleared.some(function (i) {
              var _this13$feedback$stag;
              return (_this13$feedback$stag = _this13.feedback.stage) == null ? void 0 : _this13$feedback$stag.board.cells[i].special;
            })),
            hints = s.events.some(function (e) {
              return e.type === 'swap_committed';
            }) ? [] : legalMoves(b)[0] || [];
          var boardMask = this.makeNode('BoardTokenViewport', 22, boardY),
            boardTransform = boardMask.addComponent(UITransform);
          boardTransform.setContentSize(346, 346);
          boardTransform.setAnchorPoint(0, 1);
          boardMask.addComponent(Mask).type = Mask.Type.GRAPHICS_RECT;
          var _loop = function _loop(i) {
            var _this13$feedback$stag2, _this13$gesture;
            var x = 22 + i % 7 * 50,
              y = boardY + Math.floor(i / 7) * 50;
            _this13.rect(x, y, 46, 46, (Math.floor(i / 7) + i % 7) % 2 ? '#29444E' : '#2C4953', 8, rowClear && (_this13$feedback$stag2 = _this13.feedback.stage) != null && _this13$feedback$stag2.cleared.includes(i) ? C.accent : ((_this13$gesture = _this13.gesture) == null ? void 0 : _this13$gesture.target) === i ? C.accent : i === _this13.selected || _this13.hammer || _this13.pressed === 'cell:' + i ? C.gold : hints.includes(i) ? '#91C3BE' : undefined);
            var token = _this13.drawToken(b.cells[i].color, x + 23, y + 23, 18, b.cells[i].special);
            token.setParent(boardMask);
            token.setPosition(x - 22 + 23, -(y - boardY + 23));
            _this13.tokenNodes.set(i, token);
            if (b.crates.includes(i)) {
              var frameNode = new Node('WoodenFrame');
              frameNode.layer = Layers.Enum.UI_2D;
              token.addChild(frameNode);
              var g = frameNode.addComponent(Graphics);
              g.strokeColor = _this13.color('#C59B68');
              g.lineWidth = 3;
              g.roundRect(-21, -21, 42, 42, 4);
              g.stroke();
              g.lineWidth = 2;
              g.moveTo(-20, 15);
              g.lineTo(20, 15);
              g.moveTo(-20, -15);
              g.lineTo(20, -15);
              g.stroke();
            }
            if (b.status === 'playing' && !_this13.modal && !_this13.busy) _this13.hits.push({
              id: 'cell:' + i,
              x: x - 1,
              y: y - 1,
              w: 48,
              h: 48,
              action: function action() {
                return _this13.cell(i);
              }
            });
          };
          for (var i = 0; i < 49; i++) {
            _loop(i);
          }
          boardMask.setSiblingIndex(this.layer.children.length - 1);
          this.effectsGraphic = this.makeNode('ResolvedGoalFeedback', 0, 0).addComponent(Graphics);
          var teaching = !s.events.some(function (e) {
              return e.type === 'swap_committed';
            }),
            instruction = teaching ? this.tr('Une 3. Toca dos vecinas o desliza una ficha.', 'Junte 3. Toque duas vizinhas ou deslize uma peça.') : this.tr('Forma 4 para crear una ficha que limpia su fila.', 'Forme 4 para criar uma peça que limpa a linha.');
          var feedbackText = this.feedback.phase === 'clear' ? ((_this$feedback$stage2 = this.feedback.stage) != null && _this$feedback$stage2.cascade && this.feedback.stage.cascade > 1 ? this.tr('¡En sintonía!', 'Em sintonia!') + ' ×' + this.feedback.stage.cascade + '   ' : '') + "+" + (((_this$feedback$stage3 = this.feedback.stage) == null ? void 0 : _this$feedback$stage3.gain) || 0) + " " + this.tr('señal', 'sinal') : '';
          this.text(this.hammer ? this.t.target : feedbackText || this.message || instruction, 24, boardY + 365, 342, 12, this.hammer || feedbackText ? C.gold : C.muted, 1, 38);
          var y = Math.min(h - 73, boardY + 416),
            toolW = this.route ? 108 : 164;
          this.button('hammer', this.t.hammer + " \xB7 " + balance(s, 'hammer'), 22, y, toolW, function () {
            if (!balance(s, 'hammer')) _this13.openSupply('hammer');else {
              _this13.hammer = !_this13.hammer;
              _this13.selected = -1;
            }
          }, true, 54);
          this.button('shuffle', this.t.shuffle + " \xB7 " + balance(s, 'shuffle'), this.route ? 141 : 200, y, this.route ? 108 : 168, function () {
            if (!balance(s, 'shuffle')) _this13.openSupply('shuffle');else _this13.transact({
              type: 'use',
              item: 'shuffle',
              id: _this13.id('use')
            });
          }, true, 54);
          if (this.route) {
            var ps = this.session.partnerStatus;
            this.button('partner', ps.used ? this.et('Usado', 'Usado', 'Used', '已协作') : this.partnerName(), 260, y, 108, function () {
              _this13.partnerColor = -1;
              _this13.partnerFrom = -1;
              _this13.partnerTo = -1;
              _this13.partnerBefore = false;
              _this13.selected = -1;
              _this13.hammer = false;
              _this13.modal = 'partner';
            }, true, 54, ps.available && !this.busy);
          } else {
            this.icon('hammer', 43, y + 27, 12);
            this.icon('shuffle', 221, y + 27, 11);
          }
          if (h - y > 130) {
            this.station(h - 79);
            this.text(b.status === 'won' ? this.tr('Historia recuperada. Escuchemos lo que sigue.', 'História recuperada. Vamos ouvir o que vem a seguir.') : this.tr('Gana este encuentro para escuchar su historia.', 'Vença este encontro para ouvir a história.'), 24, h - 38, 342, 10, C.muted, 1, 20);
          }
          if (this.victoryTimer > 0) {
            this.fade(15, boardY, 360, 350, 80, 170);
            this.rect(34, boardY + 115, 322, 123, '#18313B', 18, C.gold);
            this.icon('signal', 59, boardY + 145, 22, C.gold);
            this.text(this.tr('SEÑAL RECUPERADA', 'SINAL RECUPERADO'), 83, boardY + 132, 256, 14, C.gold, 0, 28);
            this.text(this.title(this.season.nodes[s.levelIndex].title), 50, boardY + 175, 290, 19, C.ink, 1, 47);
          }
          if (b.status === 'lost' && !this.busy) {
            this.hits = [];
            this.fade(0, 0, 390, h, 205, 235);
            this.rect(24, 240, 342, 332, C.bg, 22, '#6D807B');
            this.text(this.t.lost, 45, 263, 300, 26, C.ink, 1, 55);
            this.text(this.tr('Falta poco para recuperar la señal.', 'Falta pouco para recuperar o sinal.'), 46, 323, 298, 16, C.muted, 1, 47);
            this.text(Math.max(0, b.level.target - b.collected) + " " + this.tr('fichas pendientes', 'peças restantes') + (b.level.crates.length ? ' · ' + Math.max(0, b.level.crates.length - b.broken) + ' ' + this.t.crates : ''), 46, 380, 298, 14, C.gold, 1, 40);
            if (!b.continued) this.button('continue', this.t["continue"] + " \xB7 " + balance(s, 'continue'), 48, 437, 294, function () {
              if (balance(s, 'continue')) _this13.transact({
                type: 'use',
                item: 'continue',
                id: _this13.id('use')
              });else _this13.openSupply('continue');
            }, false, 48, true);
            this.button('retry-lost', this.t.retry, 48, 501, 294, function () {
              return _this13.transact({
                type: 'retry'
              });
            }, true);
            this.button('pause-lost', this.tr('Menú', 'Menu'), 298, 18, 72, function () {
              _this13.modal = 'pause';
            }, true, 48);
          }
        };
        _proto.updateEffects = function updateEffects() {
          var g = this.effectsGraphic;
          if (!g || this.page !== 'play' || this.modal) return;
          g.clear();
          var stage = this.feedback.stage;
          if (!stage || stage.phase !== 'clear') return;
          var p = this.feedback.progress;
          if (this.reducedMotion) {
            g.strokeColor = this.color(C.gold);
            g.lineWidth = 2;
            g.roundRect(20, -this.boardY + 7, 350, 44, 12);
            g.stroke();
            return;
          }
          for (var _iterator4 = _createForOfIteratorHelperLoose(stage.cleared), _step4; !(_step4 = _iterator4()).done;) {
            var i = _step4.value;
            var color = stage.board.cells[i].color,
              x = 45 + i % 7 * 50,
              y = -(this.boardY + Math.floor(i / 7) * 50 + 23);
            for (var k = 0; k < 4; k++) {
              var a = k * Math.PI / 2 + i,
                dist = 8 + p * 24;
              var c = this.color(C.tile[color]);
              c.a = Math.round(180 * (1 - p));
              g.fillColor = c;
              g.circle(x + Math.cos(a) * dist, y + Math.sin(a) * dist, Math.max(.5, 3 * (1 - p)));
              g.fill();
            }
            if (color === stage.board.level.color && stage.gain > 0) {
              var q = p * p,
                tx = 42,
                ty = -(this.boardY - 30),
                cx = x + (tx - x) * q,
                cy = y + (ty - y) * q + Math.sin(p * Math.PI) * 25;
              g.fillColor = this.color(C.gold);
              g.circle(cx, cy, 3.5);
              g.fill();
            }
          }
          for (var _iterator5 = _createForOfIteratorHelperLoose(stage.crates), _step5; !(_step5 = _iterator5()).done;) {
            var _i = _step5.value;
            var _x = 45 + _i % 7 * 50,
              _y = -(this.boardY + Math.floor(_i / 7) * 50 + 23);
            g.strokeColor = new Color(216, 170, 111, Math.round(255 * (1 - p)));
            g.lineWidth = 3;
            for (var _k = 0; _k < 4; _k++) {
              var _a = _k * Math.PI / 2;
              g.moveTo(_x + Math.cos(_a) * (12 + p * 20), _y + Math.sin(_a) * (12 + p * 20));
              g.lineTo(_x + Math.cos(_a) * (20 + p * 20), _y + Math.sin(_a) * (20 + p * 20));
              g.stroke();
            }
          }
        };
        _proto.drawToken = function drawToken(color, x, y, r, special) {
          var g = this.makeNode('token', x, y).addComponent(Graphics);
          var shape = function shape(q, cy) {
            if (cy === void 0) {
              cy = 0;
            }
            if (color === 0) {
              g.moveTo(0, cy - q * .85);
              g.bezierCurveTo(-q * 1.6, cy + q * .15, -q * .7, cy + q * 1.35, 0, cy + q * .58);
              g.bezierCurveTo(q * .7, cy + q * 1.35, q * 1.6, cy + q * .15, 0, cy - q * .85);
              g.close();
            } else if (color === 1) {
              g.moveTo(0, cy + q);
              g.bezierCurveTo(q * .38, cy + q * .48, q * .86, cy - q * .04, q * .77, cy - q * .48);
              g.bezierCurveTo(q * .6, cy - q * 1.02, -q * .6, cy - q * 1.02, -q * .77, cy - q * .48);
              g.bezierCurveTo(-q * .86, cy - q * .04, -q * .38, cy + q * .48, 0, cy + q);
              g.close();
            } else if (color === 2) g.roundRect(-q, cy - q * .72, q * 2, q * 1.44, 5);else if (color === 3) {
              for (var k = 0; k < 10; k++) {
                var a = k * Math.PI / 5 + Math.PI / 2,
                  rr = k % 2 ? q * .64 : q;
                k ? g.lineTo(Math.cos(a) * rr, cy + Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, cy + Math.sin(a) * rr);
              }
              g.close();
            } else {
              g.moveTo(-q * .7, cy - q * .7);
              g.bezierCurveTo(-q * 1.25, cy + q * .45, q * .12, cy + q * .98, q * .8, cy + q * .78);
              g.bezierCurveTo(q * 1.02, cy - q * .05, q * .45, cy - q * 1.1, -q * .7, cy - q * .7);
              g.close();
            }
          };
          g.fillColor = new Color(4, 14, 20, 145);
          shape(r + 1, -3);
          g.fill();
          var base = this.color(C.tile[color]);
          g.fillColor = new Color(base.r * .6, base.g * .6, base.b * .6, 255);
          shape(r, -1.3);
          g.fill();
          g.fillColor = base;
          shape(r - 1, 1.2);
          g.fill();
          g.strokeColor = new Color(255, 249, 228, 110);
          g.lineWidth = 1;
          shape(r - 2, 1.5);
          g.stroke();
          g.strokeColor = new Color(255, 255, 240, 150);
          g.lineWidth = 2;
          g.moveTo(-r * .4, r * .3);
          g.lineTo(-r * .1, r * .55);
          g.stroke();
          g.strokeColor = new Color(30, 70, 77, 145);
          g.lineWidth = 1.6;
          if (color === 2) {
            g.circle(-r * .4, 1, r * .17);
            g.circle(r * .4, 1, r * .17);
            g.moveTo(-r * .28, -r * .3);
            g.lineTo(r * .28, -r * .3);
            g.stroke();
          }
          if (color === 3) {
            g.fillColor = new Color(255, 238, 197, 200);
            g.circle(0, 0, r * .18);
            g.fill();
          }
          if (color === 4) {
            g.moveTo(-r * .45, -r * .5);
            g.lineTo(r * .4, r * .5);
            g.moveTo(0, 0);
            g.lineTo(-r * .35, r * .15);
            g.stroke();
          }
          if (special) {
            g.strokeColor = this.color(C.bg);
            g.lineWidth = 7;
            g.moveTo(-r * .85, 0);
            g.lineTo(r * .85, 0);
            g.stroke();
            g.strokeColor = this.color(C.ink);
            g.lineWidth = 3;
            g.moveTo(-r * .85, 0);
            g.lineTo(r * .85, 0);
            g.stroke();
          }
          return g.node;
        };
        _proto.cell = function cell(i) {
          if (this.hammer) {
            this.transact({
              type: 'use',
              item: 'hammer',
              target: i,
              id: this.id('use')
            });
            return;
          }
          if (this.selected === i) {
            this.selected = -1;
            return;
          }
          if (this.selected < 0) {
            this.selected = i;
            this.feedbackAudio.play('select');
            return;
          }
          var a = this.selected;
          if (Math.abs(a % 7 - i % 7) + Math.abs(Math.floor(a / 7) - Math.floor(i / 7)) !== 1) {
            this.selected = i;
            this.feedbackAudio.play('select');
            return;
          }
          this.transact({
            type: 'swap',
            a: a,
            b: i
          });
        };
        _proto.partnerName = function partnerName() {
          return this.session.partnerStatus.skill === 'retune' ? this.et('Afinar', 'Afinar', 'Retune', '调音') : this.et('Mover marco', 'Mover moldura', 'Move frame', '移框');
        };
        _proto.partnerAction = function partnerAction() {
          return this.session.partnerStatus.skill === 'retune' ? {
            skill: 'retune',
            color: this.partnerColor
          } : {
            skill: 'relocate',
            from: this.partnerFrom,
            to: this.partnerTo
          };
        };
        _proto.drawPartnerModal = function drawPartnerModal() {
          var _this$route,
            _this14 = this;
          this.hits = [];
          this.art.visible(false);
          var h = this.contentHeight,
            b = this.session.state.board,
            retune = this.session.partnerStatus.skill === 'retune',
            preview = this.partnerPreview,
            shown = preview.board;
          this.fade(0, -this.safeTop, 390, this.designHeight, 245, 250);
          this.rect(12, 95, 366, h - 110, '#1C2F3A', 20, C.gold);
          this.text(((_this$route = this.route) == null ? void 0 : _this$route.name) + " \xB7 " + this.partnerName(), 26, 110, 338, 24, C.ink, 0, 36);
          this.text(this.et('1 movimiento · una vez', '1 movimento · uma vez', '1 move · once per attempt', '1 步 · 每次挑战限一次'), 26, 150, 224, 12, C.gold, 0, 22);
          var stateLabel = preview.ready ? preview.showingBefore ? this.et('TABLERO ORIGINAL', 'TABULEIRO ORIGINAL', 'ORIGINAL BOARD', '原棋盘') : this.et('VISTA PREVIA · SIN APLICAR', 'PRÉVIA · NÃO APLICADA', 'PREVIEW · NOT APPLIED', '预览 · 尚未应用') : this.et('ELIGE PARA VER EL CAMBIO', 'ESCOLHA PARA VER A MUDANÇA', 'SELECT TO PREVIEW', '选择后查看变化');
          this.text(stateLabel, 26, 179, 224, 11, preview.showingBefore ? C.muted : C.green, 0, 28);
          this.button('partner-compare', preview.showingBefore ? this.et('Ver después', 'Ver depois', 'After', '看变化') : this.et('Ver antes', 'Ver antes', 'Before', '看原棋盘'), 263, 155, 100, function () {
            _this14.partnerBefore = !_this14.partnerBefore;
          }, true, 48, preview.ready);
          if (retune) {
            var _loop2 = function _loop2(color) {
              var x = 30 + color * 67,
                enabled = color !== b.level.color;
              _this14.rect(x, 218, 60, 48, enabled ? C.panel : '#12252D', 10, _this14.partnerColor === color ? C.gold : undefined);
              _this14.drawToken(color, x + 30, 242, 17, false);
              if (!enabled) {
                _this14.icon('check', x + 48, 228, 7, C.muted);
                _this14.text(_this14.et('Meta', 'Meta', 'Goal', '目标'), x, 267, 60, 9, C.muted, 1, 12);
              }
              if (enabled) _this14.hits.push({
                id: 'partner-color:' + color,
                x: x,
                y: 218,
                w: 60,
                h: 48,
                action: function action() {
                  _this14.partnerColor = color;
                  _this14.partnerBefore = false;
                }
              });
            };
            for (var color = 0; color < 5; color++) {
              _loop2(color);
            }
          }
          var step = retune ? 42 : 49,
            boardX = retune ? 48 : 24,
            boardY = retune ? 281 : 218;
          var _loop3 = function _loop3(i) {
            var x = boardX + i % 7 * step,
              y = boardY + Math.floor(i / 7) * step,
              crate = shown.crates.includes(i),
              originalCrate = b.crates.includes(i),
              adjacent = _this14.partnerFrom >= 0 && Math.abs(i % 7 - _this14.partnerFrom % 7) + Math.abs(Math.floor(i / 7) - Math.floor(_this14.partnerFrom / 7)) === 1 && !originalCrate,
              changed = preview.ready && !preview.showingBefore && preview.changed.includes(i);
            _this14.rect(x, y, step - 4, step - 4, '#29444E', 6, changed ? C.green : !retune && i === _this14.partnerFrom ? C.gold : !retune && adjacent ? '#78B6AD' : undefined);
            _this14.drawToken(shown.cells[i].color, x + (step - 4) / 2, y + (step - 4) / 2, retune ? 14 : 15, shown.cells[i].special);
            if (crate) {
              var g = _this14.makeNode('PreviewFrame:' + i, x + (step - 4) / 2, y + (step - 4) / 2).addComponent(Graphics);
              g.strokeColor = _this14.color(changed ? C.green : '#C59B68');
              g.lineWidth = 3;
              g.roundRect(-(step - 9) / 2, -(step - 9) / 2, step - 9, step - 9, 4);
              g.stroke();
            }
            if (!retune && originalCrate && !crate) {
              var _g = _this14.makeNode('FrameOrigin:' + i, x + 5, y + 5).addComponent(Graphics);
              _g.strokeColor = _this14.color(C.gold);
              _g.lineWidth = 2;
              _g.moveTo(0, 0);
              _g.lineTo(8, 0);
              _g.moveTo(0, 0);
              _g.lineTo(0, -8);
              _g.moveTo(step - 14, -(step - 14));
              _g.lineTo(step - 22, -(step - 14));
              _g.moveTo(step - 14, -(step - 14));
              _g.lineTo(step - 14, -(step - 22));
              _g.stroke();
            }
            // Hit candidates come from the real board, so comparing never changes selection rules.
            if (!retune && (originalCrate || adjacent)) _this14.hits.push({
              id: 'partner-cell:' + i,
              x: x - 1,
              y: y - 1,
              w: 48,
              h: 48,
              action: function action() {
                if (originalCrate) {
                  _this14.partnerFrom = i;
                  _this14.partnerTo = -1;
                } else _this14.partnerTo = i;
                _this14.partnerBefore = false;
              }
            });
          };
          for (var i = 0; i < 49; i++) {
            _loop3(i);
          }
          var coord = function coord(i) {
            return String.fromCharCode(65 + i % 7) + (Math.floor(i / 7) + 1);
          };
          var note = preview.ready ? retune ? this.et('Cambia el color, no el progreso.', 'Muda a cor, não o progresso.', 'Colors change; progress stays.', '颜色改变，收集进度不变。') : coord(this.partnerFrom) + " \u2192 " + coord(this.partnerTo) + " \xB7 " + this.et('sin romper marcos', 'sem quebrar molduras', 'no frames removed', '不减少障碍') : retune ? this.et('Elige un color para intercambiar con el objetivo.', 'Escolha uma cor para trocar com a cor da meta.', 'Choose a color to exchange with the goal color.', '选择一种颜色，与目标色互换。') : this.et('Toca un marco y una casilla vecina libre.', 'Toque numa moldura e numa casa vizinha livre.', 'Tap a frame, then a free neighboring cell.', '点选障碍，再选相邻的无障碍格。');
          this.text(note, 26, retune ? 582 : 573, 338, 12, C.muted, 0, 34);
          this.button('partner-cancel', this.et('Cancelar', 'Cancelar', 'Cancel', '取消'), 24, h - 70, 158, function () {
            _this14.modal = '';
          }, true);
          this.button('partner-confirm', this.et('Aplicar', 'Aplicar', 'Apply', '确认') + (" \xB7 " + b.moves + " \u2192 " + (b.moves - 1)), 194, h - 70, 172, function () {
            return _this14.applyPartner();
          }, false, 48, preview.ready);
        };
        _proto.applyPartner = function applyPartner() {
          if (this.restorationIssue) return;
          var action = this.partnerAction();
          var result = this.session.partner(action, function (raw) {
            return sys.localStorage.setItem(SAVE, raw);
          });
          if (!result.ok) {
            this.message = result.reason === 'SAVE_FAILED' ? this.t.save : this.t.invalid;
            this.feedbackAudio.play('reject');
          } else {
            this.feedbackAudio.play('select');
            this.message = '';
          }
          this.modal = '';
          this.selected = -1;
          this.hammer = false;
          this.dirty = true;
        };
        _proto.openSupply = function openSupply(item) {
          this.cancelGesture();
          this.offerItem = item;
          this.supplyContext = {
            selected: this.selected,
            hammer: this.hammer,
            modal: this.modal
          };
          this.modal = 'supply';
        };
        _proto.closeSupply = function closeSupply() {
          var context = this.supplyContext;
          this.supplyContext = null;
          if (context) {
            this.selected = context.selected;
            this.hammer = context.hammer;
            this.modal = context.modal;
          } else this.modal = '';
        };
        _proto.id = function id(prefix) {
          return prefix + ":" + this.session.activeRouteId + ":" + this.session.state.runId + ":" + this.session.commands.length + ":" + ++this.counter;
        };
        _proto.drawModal = function drawModal() {
          var _this15 = this;
          if (this.modal === 'partner') {
            this.drawPartnerModal();
            return;
          }
          this.hits = [];
          this.art.visible(false);
          var h = this.contentHeight,
            top = 95;
          this.fade(0, -this.safeTop, 390, this.designHeight, 235, 245);
          this.rect(12, top, 366, h - top - 20, '#1C2F3A', 20, C.gold);
          this.text(this.modal === 'pause' ? this.tr('En pausa', 'Em pausa') : this.modal === 'settings' ? this.tr('Ajustes', 'Ajustes') : this.modal === 'help' ? this.tr('Cómo jugar', 'Como jogar') : this.t.lab, 30, 117, 330, 26, C.ink, 0, 44);
          if (this.modal === 'pause') {
            this.text(this.tr('Tu partida está guardada.', 'Sua partida está salva.'), 30, 176, 330, 17, C.muted, 0, 50);
            this.button('resume', this.tr('Continuar', 'Continuar'), 30, 246, 330, function () {
              _this15.modal = '';
            });
            this.button('home', this.tr('Guardar y volver al inicio', 'Salvar e voltar ao início'), 30, 308, 330, function () {
              return _this15.back();
            }, true);
            this.button('settings', this.tr('Ajustes', 'Ajustes'), 30, 370, 330, function () {
              _this15.modal = 'settings';
            }, true);
            this.button('help', this.tr('Cómo jugar', 'Como jogar'), 30, 432, 330, function () {
              _this15.modal = 'help';
            }, true);
            if (this.page === 'play') this.button('retry', this.t.retry, 30, 494, 330, function () {
              _this15.modal = '';
              _this15.transact({
                type: 'retry'
              });
            }, true);
          } else if (this.modal === 'settings') {
            this.text(this.tr('IDIOMA', 'IDIOMA'), 30, 187, 330, 12, C.gold);
            var languages = [{
              id: 'es',
              label: 'Español',
              locale: 'es-419'
            }, {
              id: 'pt',
              label: 'Português',
              locale: 'pt-BR'
            }, {
              id: 'en',
              label: 'English',
              locale: 'en'
            }, {
              id: 'zh',
              label: '简体中文',
              locale: 'zh-CN'
            }];
            languages.forEach(function (language, i) {
              return _this15.button('locale-' + language.id, language.label, 30 + i % 2 * 171, 223 + Math.floor(i / 2) * 61, 159, function () {
                _this15.locale = language.locale;
                _this15.message = '';
                _this15.prefs();
              }, _this15.locale !== language.locale);
            });
            this.button('sound', this.tr('Sonido', 'Som') + " \xB7 " + (this.sound ? this.tr('Activado', 'Ligado') : this.tr('Desactivado', 'Desligado')), 30, 363, 330, function () {
              _this15.sound = !_this15.sound;
              _this15.prefs();
            }, true);
            this.button('motion', this.tr('Movimiento reducido', 'Movimento reduzido') + " \xB7 " + (this.reducedMotion ? this.tr('Activado', 'Ligado') : this.tr('Desactivado', 'Desligado')), 30, 425, 330, function () {
              _this15.reducedMotion = !_this15.reducedMotion;
              _this15.prefs();
            }, true);
            this.text(this.route && !this.route.nodes.some(function (n) {
              return n.shots.some(function (s) {
                var _s$voice;
                return (_s$voice = s.voice) == null ? void 0 : _s$voice.es;
              });
            }) ? this.et('Estas historias incluyen subtítulos en cuatro idiomas.', 'Estas histórias incluem legendas em quatro idiomas.', 'These stories include subtitles in four languages.', '这些故事提供四种语言字幕。') : this.tr('Voces en español. Los otros idiomas incluyen subtítulos.', 'Vozes em espanhol. Os outros idiomas incluem legendas.'), 30, h < 670 ? 480 : 490, 330, h < 670 ? 12 : 14, C.muted, 0, h < 670 ? 48 : 85);
          } else if (this.modal === 'help') {
            this.text(this.tr('1. Toca dos fichas vecinas. Junta tres iguales.\n\n2. Recoge las fichas del objetivo y rompe las cajas. Cumple ambos antes de agotar los movimientos.\n\n3. Gana para recuperar una escena. Tus recuerdos se pueden volver a ver.', '1. Toque duas peças vizinhas. Combine três iguais.\n\n2. Colete as peças do objetivo e quebre as caixas. Cumpra ambos antes de acabar as jogadas.\n\n3. Vença para recuperar uma cena. Suas lembranças podem ser revistas.'), 30, 178, 330, h < 670 ? 15 : 17, C.ink, 0, h < 670 ? 210 : 276);
            this.text(this.tr('4 iguales crean una ficha rayada: al combinarla, borra su fila. Martillo: quita una. Mezclar: sin gastar jugada.', '4 iguais criam uma peça listrada: ao combiná-la, limpa a linha. Martelo: remove uma. Misturar: sem gastar jogada.'), 30, h < 670 ? 402 : 462, 330, h < 670 ? 13 : 14, C.muted, 0, h < 670 ? 55 : 70);
            this.button('shop', this.tr('Laboratorio · ayudas simuladas', 'Laboratório · ajudas simuladas'), 30, h - 148, 330, function () {
              _this15.modal = 'shop';
            }, true, 44);
          } else {
            this.text(this.t.labBody, 30, 167, 330, 15, C.muted, 0, 56);
            if (this.modal === 'supply') {
              this.text(this.tr('Te falta una ayuda', 'Você está sem ajuda'), 30, 243, 330, 23, C.ink, 1, 46);
              this.text(this.tr('Reponer aquí es una simulación. No hay anuncios reales ni cobros. La ayuda queda guardada; tú decides cuándo usarla.', 'Repor aqui é uma simulação. Não há anúncios reais nem cobrança. A ajuda fica guardada; você decide quando usar.'), 30, 290, 330, 16, C.muted, 0, Math.min(125, h - 520));
              this.button('ad', this.t.ad, 30, h - 220, 330, function () {
                _this15.offerSource = 'ad-simulation';
                _this15.offerId = _this15.id('offer');
                _this15.modal = 'offer';
              });
              this.button('buy', this.t.buy, 30, h - 162, 330, function () {
                _this15.offerSource = 'iap-simulation';
                _this15.offerId = _this15.id('offer');
                _this15.modal = 'offer';
              }, true);
            } else if (this.modal === 'shop') {
              var _loop4 = function _loop4() {
                var _step6$value = _step6.value,
                  i = _step6$value[0],
                  item = _step6$value[1];
                var label = item === 'hammer' ? _this15.t.hammer : item === 'shuffle' ? _this15.t.shuffle : '+5';
                _this15.button('item:' + item, label + " \xB7 " + balance(_this15.session.state, item), 30, 239 + i * 57, 330, function () {
                  _this15.offerItem = item;
                  _this15.message = _this15.t.selected;
                }, _this15.offerItem !== item, 46);
              };
              for (var _iterator6 = _createForOfIteratorHelperLoose(['hammer', 'shuffle', 'continue'].entries()), _step6; !(_step6 = _iterator6()).done;) {
                _loop4();
              }
              this.button('ad', this.t.ad, 30, 424, 330, function () {
                _this15.offerSource = 'ad-simulation';
                _this15.offerId = _this15.id('offer');
                _this15.modal = 'offer';
              }, false, 46);
              this.button('buy', this.t.buy, 30, 483, 330, function () {
                _this15.offerSource = 'iap-simulation';
                _this15.offerId = _this15.id('offer');
                _this15.modal = 'offer';
              }, true, 46);
            } else {
              this.text(this.offerSource === 'ad-simulation' ? this.t.ad : this.t.buy, 30, 246, 330, 21, C.gold, 1, 53);
              this.button('reward', this.t.reward, 30, 322, 330, function () {
                return _this15.offer('reward');
              });
              this.button('cancel-offer', this.t.cancel, 30, 384, 330, function () {
                return _this15.offer('cancel');
              }, true);
              this.button('unavailable', this.offerSource === 'ad-simulation' ? this.t.noFill : this.t.pending, 30, 446, 330, function () {
                return _this15.offer(_this15.offerSource === 'ad-simulation' ? 'no-fill' : 'pending');
              }, true);
            }
            if (this.modal !== 'supply') this.text(this.message, 30, h - 133, 330, 13, C.gold, 1, 46);
          }
          this.button('close', this.t.close, 30, h - 80, 330, function () {
            if (_this15.supplyContext) _this15.closeSupply();else _this15.modal = '';
          }, true, 44);
        };
        _proto.offer = function offer(outcome) {
          if (this.restorationIssue) return;
          var result = this.session.dispatch({
            type: 'grant',
            source: this.offerSource,
            item: this.offerItem,
            id: this.offerId,
            outcome: outcome
          }, function (raw) {
            return sys.localStorage.setItem(SAVE, raw);
          });
          this.message = !result.ok ? this.t.save : outcome === 'reward' ? this.t.granted : this.t.noReward;
          if (this.supplyContext) this.closeSupply();else this.modal = 'shop';
        };
        _createClass(PuertoLuz, [{
          key: "contentHeight",
          get: function get() {
            return this.designHeight - this.safeTop - this.safeBottom;
          }
        }, {
          key: "boardY",
          get: function get() {
            return Math.min(252, Math.max(183, this.contentHeight - 471));
          }
        }, {
          key: "route",
          get: function get() {
            var _this16 = this;
            return ENSEMBLE.routes.find(function (r) {
              return r.id === _this16.session.activeRouteId;
            });
          }
        }, {
          key: "season",
          get: function get() {
            var _this17 = this;
            var r = this.route;
            if (!r) return SEASON;
            return {
              nodes: r.nodes.map(function (_, i) {
                return resolveRouteNode(r.id, i, _this17.session.choices);
              }),
              chapters: [],
              ending: r.ending
            };
          }
        }, {
          key: "t",
          get: function get() {
            return COPY[this.locale];
          }
        }, {
          key: "lang",
          get: function get() {
            return TEXT_LANGUAGE[this.locale];
          }
        }, {
          key: "partnerPreview",
          get: function get() {
            if (this.modal !== 'partner' || !this.session.state.board) return null;
            var original = this.session.state.board,
              result = this.session.partnerStatus.available ? applyPartner(original, this.session.activeRouteId, this.partnerAction()) : null;
            var ready = !!(result != null && result.ok),
              prospective = ready ? result.board : original;
            var changed = original.cells.flatMap(function (cell, i) {
              return cell.color !== prospective.cells[i].color || original.crates.includes(i) !== prospective.crates.includes(i) ? [i] : [];
            });
            return {
              ready: ready,
              showingBefore: this.partnerBefore,
              board: this.partnerBefore ? original : prospective,
              changed: changed
            };
          }
        }]);
        return PuertoLuz;
      }(Component)) || _class));
      function boot() {
        var scene = director.getScene();
        if (!scene || scene.getChildByName('PuertoBoot')) return;
        var n = new Node('PuertoBoot');
        scene.addChild(n);
        n.addComponent(PuertoLuz);
      }
      if (game) director.on(Director.EVENT_AFTER_SCENE_LAUNCH, boot);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/MergeProbe.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _extends, cclegacy;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        deliver: deliver,
        generate: generate,
        merge: merge
      });
      cclegacy._RF.push({}, "dd54bE1k3xBXpenpQ6JUCmu", "MergeProbe", undefined);
      /** Small offline comparison, not a second playable product or a match-3 clone. */
      function merge(s, from, to) {
        if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= s.cells.length || to >= s.cells.length || from === to) return null;
        if (!s.cells[from] || s.cells[from] !== s.cells[to] || s.cells[to] >= 5) return null;
        var cells = [].concat(s.cells);
        cells[to]++;
        cells[from] = 0;
        return _extends({}, s, {
          cells: cells
        });
      }
      function generate(s, index) {
        if (!Number.isInteger(index) || index < 0 || index >= s.cells.length || s.cells[index] !== 0 || s.energy < 1) return null;
        var cells = [].concat(s.cells);
        cells[index] = 1;
        return _extends({}, s, {
          cells: cells,
          energy: s.energy - 1
        });
      }
      function deliver(s, index, target) {
        if (target === void 0) {
          target = 3;
        }
        if (!Number.isInteger(index) || s.cells[index] !== target) return null;
        var cells = [].concat(s.cells);
        cells[index] = 0;
        return _extends({}, s, {
          cells: cells,
          delivered: s.delivered + 1
        });
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PartnerMechanics.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Puzzle.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, groups, legalMoves, clone, adjacent;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      groups = module.groups;
      legalMoves = module.legalMoves;
      clone = module.clone;
      adjacent = module.adjacent;
    }],
    execute: function () {
      exports('applyPartner', applyPartner);
      cclegacy._RF.push({}, "54d63NJtjRDxrjkK3Rw42rP", "PartnerMechanics", undefined);

      /** Explicit product actions only. Never run these rules while replaying old commands. */
      var PARTNER_RULES = exports('PARTNER_RULES', 'partner-1');
      var partnerSkill = exports('partnerSkill', function partnerSkill(routeId) {
        return routeId === 'mateo' ? 'retune' : routeId === 'gabriel' ? 'relocate' : null;
      });

      /** No resolution, rewards, RNG draws, or automatic reshuffle: the player must still match. */
      function applyPartner(original, routeId, action) {
        var fail = function fail(reason) {
          return {
            ok: false,
            reason: reason,
            board: original
          };
        };
        var skill = partnerSkill(routeId);
        if (!skill) return fail('PARTNER_UNAVAILABLE');
        if (!action || typeof action !== 'object' || action.skill !== skill) return fail('INVALID_PARTNER_ACTION');
        if (original.status !== 'playing') return fail('RUN_NOT_PLAYING');
        if (original.moves < 2) return fail('PARTNER_NEEDS_TWO_MOVES');
        if (original.cells.length !== 49 || original.cells.some(function (c) {
          return !Number.isInteger(c.color) || c.color < 0 || c.color > 4;
        }) || groups(original.cells).length || !legalMoves(original).length) return fail('PARTNER_UNSTABLE_BOARD');
        var board = clone(original);
        if (action.skill === 'retune') {
          if (!Number.isInteger(action.color) || action.color < 0 || action.color > 4 || action.color === board.level.color) return fail('INVALID_PARTNER_COLOR');
          if (!board.cells.some(function (c) {
            return c.color === action.color || c.color === board.level.color;
          })) return fail('PARTNER_NO_CHANGE');
          for (var _iterator = _createForOfIteratorHelperLoose(board.cells), _step; !(_step = _iterator()).done;) {
            var cell = _step.value;
            if (cell.color === action.color) cell.color = board.level.color;else if (cell.color === board.level.color) cell.color = action.color;
          }
        } else {
          var index = board.crates.indexOf(action.from);
          if (index < 0 || !adjacent(action.from, action.to) || board.crates.includes(action.to)) return fail('INVALID_PARTNER_TARGET');
          board.crates[index] = action.to;
        }
        board.moves--;
        // Both transformations preserve stable matching topology. Fail closed if rules change.
        if (groups(board.cells).length || !legalMoves(board).length) return fail('PARTNER_UNSTABLE_BOARD');
        return {
          ok: true,
          reason: '',
          board: board
        };
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Puzzle.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        act: act,
        createBoard: createBoard,
        digest: digest,
        groups: groups,
        legalMoves: legalMoves
      });
      cclegacy._RF.push({}, "02b5cGmA0VCoJu/+lx0DgXS", "Puzzle", undefined);
      /** Deterministic, renderer-independent match-3. Coordinates use row-major indexing. */
      var RULES = exports('RULES', 'match3-0.1');
      var WIDTH = exports('WIDTH', 7);
      var clone = exports('clone', function clone(v) {
        return JSON.parse(JSON.stringify(v));
      });
      function digest(value) {
        var h = 2166136261;
        for (var _iterator = _createForOfIteratorHelperLoose(JSON.stringify(value)), _step; !(_step = _iterator()).done;) {
          var ch = _step.value;
          h ^= ch.charCodeAt(0);
          h = Math.imul(h, 16777619);
        }
        return (h >>> 0).toString(16).padStart(8, '0');
      }
      function random(b, n) {
        var x = b.rng >>> 0;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        b.rng = x >>> 0;
        return b.rng % n;
      }
      var indexOK = function indexOK(i) {
        return Number.isInteger(i) && i >= 0 && i < 49;
      };
      var adjacent = exports('adjacent', function adjacent(a, b) {
        return indexOK(a) && indexOK(b) && Math.abs(a % 7 - b % 7) + Math.abs(Math.floor(a / 7) - Math.floor(b / 7)) === 1;
      });
      function groups(cells) {
        var found = [];
        for (var axis = 0; axis < 2; axis++) for (var line = 0; line < 7; line++) {
          var run = [];
          for (var v = 0; v <= 7; v++) {
            var i = axis === 0 ? line * 7 + v : v * 7 + line;
            if (v < 7 && (!run.length || cells[i].color === cells[run[0]].color)) run.push(i);else {
              if (run.length >= 3) found.push(run);
              run = v < 7 ? [i] : [];
            }
          }
        }
        return found;
      }
      function legalMoves(b) {
        var result = [];
        for (var a = 0; a < 49; a++) for (var _i = 0, _arr = [1, 7]; _i < _arr.length; _i++) {
          var v = _arr[_i];
          var c = a + v;
          if (!adjacent(a, c)) continue;
          var cells = b.cells.slice();
          var _ref = [cells[c], cells[a]];
          cells[a] = _ref[0];
          cells[c] = _ref[1];
          if (groups(cells).length) result.push([a, c]);
        }
        return result;
      }
      function freshCells(b) {
        b.cells = [];
        var _loop = function _loop(i) {
          var choices = [0, 1, 2, 3, 4].filter(function (c) {
            return !(i % 7 >= 2 && b.cells[i - 1].color === c && b.cells[i - 2].color === c) && !(i >= 14 && b.cells[i - 7].color === c && b.cells[i - 14].color === c);
          });
          b.cells.push({
            color: choices[random(b, choices.length)],
            special: false
          });
        };
        for (var i = 0; i < 49; i++) {
          _loop(i);
        }
      }
      function shuffle(b) {
        // Preserve the exact tile multiset and specials. Bounded retries fail atomically.
        var original = clone(b.cells);
        for (var attempt = 0; attempt < 300; attempt++) {
          b.cells = clone(original);
          for (var i = 48; i > 0; i--) {
            var j = random(b, i + 1);
            var _ref2 = [b.cells[j], b.cells[i]];
            b.cells[i] = _ref2[0];
            b.cells[j] = _ref2[1];
          }
          if (!groups(b.cells).length && legalMoves(b).length) return;
        }
        throw new Error('SHUFFLE_NO_STABLE_BOARD');
      }
      function createBoard(level) {
        if (!level.id || !Number.isSafeInteger(level.seed) || !Number.isInteger(level.moves) || level.moves < 1 || !Number.isInteger(level.target) || level.target < 1 || !Number.isInteger(level.color) || level.color < 0 || level.color > 4 || new Set(level.crates).size !== level.crates.length || level.crates.some(function (i) {
          return !indexOK(i);
        })) throw new Error('INVALID_LEVEL');
        var b = {
          cells: [],
          crates: [].concat(level.crates),
          rng: level.seed >>> 0 || 1,
          moves: level.moves,
          collected: 0,
          broken: 0,
          status: 'playing',
          continued: false,
          level: clone(level)
        };
        for (var k = 0; k < 100; k++) {
          freshCells(b);
          if (legalMoves(b).length) return b;
        }
        throw new Error('NO_INITIAL_BOARD');
      }
      function settleStatus(b) {
        b.status = b.collected >= b.level.target && b.crates.length === 0 ? 'won' : b.moves <= 0 ? 'lost' : 'playing';
      }
      function clearAndFall(b, initial, preserve, frames, cascade) {
        var cleared = new Set(initial),
          blast = new Set();
        var previous = -1;
        while (previous !== cleared.size) {
          previous = cleared.size;
          for (var _i2 = 0, _Array$from = Array.from(cleared); _i2 < _Array$from.length; _i2++) {
            var i = _Array$from[_i2];
            if (b.cells[i].special) for (var c = 0; c < 7; c++) {
              var hit = Math.floor(i / 7) * 7 + c;
              cleared.add(hit);
              blast.add(hit);
            }
          }
        }
        // A special crossed by another special's blast is consumed, not recreated.
        for (var _iterator2 = _createForOfIteratorHelperLoose(preserve.keys()), _step2; !(_step2 = _iterator2()).done;) {
          var _i4 = _step2.value;
          if (blast.has(_i4)) preserve["delete"](_i4);
        }
        for (var _iterator3 = _createForOfIteratorHelperLoose(cleared), _step3; !(_step3 = _iterator3()).done;) {
          var _i5 = _step3.value;
          if (!preserve.has(_i5)) {
            if (b.cells[_i5].color === b.level.color) b.collected++;
            var at = b.crates.indexOf(_i5);
            if (at >= 0) {
              b.crates.splice(at, 1);
              b.broken++;
            }
          }
        }
        frames.push({
          cells: clone(b.cells),
          crates: [].concat(b.crates),
          cleared: Array.from(cleared).filter(function (i) {
            return !preserve.has(i);
          }),
          collected: b.collected,
          broken: b.broken,
          cascade: cascade
        });
        for (var _c = 0; _c < 7; _c++) {
          var column = [];
          for (var r = 6; r >= 0; r--) {
            var _i3 = r * 7 + _c;
            if (preserve.has(_i3)) column.push(preserve.get(_i3));else if (!cleared.has(_i3)) column.push(b.cells[_i3]);
          }
          while (column.length < 7) column.push({
            color: random(b, 5),
            special: false
          });
          for (var _r = 6; _r >= 0; _r--) b.cells[_r * 7 + _c] = column[6 - _r];
        }
      }
      function resolve(b, frames, preferred) {
        if (preferred === void 0) {
          preferred = -1;
        }
        for (var cascade = 0; cascade < 100; cascade++) {
          var g = groups(b.cells);
          if (!g.length) return;
          var preserve = new Map();
          for (var _iterator4 = _createForOfIteratorHelperLoose(g), _step4; !(_step4 = _iterator4()).done;) {
            var run = _step4.value;
            if (run.length >= 4) {
              var i = run.includes(preferred) ? preferred : run[Math.floor(run.length / 2)];
              if (!b.cells[i].special) preserve.set(i, {
                color: b.cells[i].color,
                special: true
              });
            }
          }
          clearAndFall(b, Array.from(new Set(g.flat())), preserve, frames, cascade + 1);
        }
        throw new Error('CASCADE_LIMIT');
      }
      function act(original, action) {
        var fail = function fail(reason) {
          return {
            ok: false,
            reason: reason,
            board: original,
            frames: [],
            reshuffled: false
          };
        };
        if (action.kind === 'continue') {
          if (original.status !== 'lost' || original.continued) return fail('CONTINUE_UNAVAILABLE');
          var _b = clone(original);
          _b.continued = true;
          _b.moves += 5;
          _b.status = 'playing';
          return {
            ok: true,
            reason: '',
            board: _b,
            frames: [],
            reshuffled: false
          };
        }
        if (original.status !== 'playing') return fail('RUN_NOT_PLAYING');
        var b = clone(original),
          frames = [];
        var reshuffled = false;
        try {
          if (action.kind === 'swap') {
            if (!adjacent(action.a, action.b)) return fail('NOT_ADJACENT');
            var _ref3 = [b.cells[action.b], b.cells[action.a]];
            b.cells[action.a] = _ref3[0];
            b.cells[action.b] = _ref3[1];
            if (!groups(b.cells).length) return fail('NO_MATCH');
            b.moves--;
            resolve(b, frames, action.b);
          } else if (action.kind === 'hammer') {
            if (!indexOK(action.target)) return fail('INVALID_TARGET');
            clearAndFall(b, [action.target], new Map(), frames, 0);
            resolve(b, frames);
          } else if (action.kind === 'shuffle') {
            shuffle(b);
            reshuffled = true;
          } else return fail('UNKNOWN_ACTION');
          settleStatus(b);
          if (b.status === 'playing' && !legalMoves(b).length) {
            shuffle(b);
            reshuffled = true;
          }
          return {
            ok: true,
            reason: '',
            board: b,
            frames: frames,
            reshuffled: reshuffled
          };
        } catch (e) {
          return fail(String(e.message));
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/SceneFraming.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "3f52fV6b+9BJ4wdW7iSdhS1", "SceneFraming", undefined);
      /** Measured normalized head centers, top-left origin. Wides preserve original scene. */
      var SCENE_FOCUS = exports('SCENE_FOCUS', {
        'radio-night': {
          elena: {
            x: .247,
            y: .365
          },
          mateo: {
            x: .768,
            y: .286
          },
          close: 2.45
        },
        'archive-rain': {
          elena: {
            x: .281,
            y: .383
          },
          mateo: {
            x: .694,
            y: .371
          },
          close: 2.4
        },
        'harbor-dawn': {
          elena: {
            x: .353,
            y: .291
          },
          mateo: {
            x: .663,
            y: .229
          },
          close: 2.5
        },
        'rooftop-dusk': {
          elena: {
            x: .400,
            y: .278
          },
          mateo: {
            x: .578,
            y: .220
          },
          close: 1.5,
          shared: {
            x: .49,
            y: .34
          }
        },
        'radio-live': {
          elena: {
            x: .239,
            y: .362
          },
          mateo: {
            x: .752,
            y: .308
          },
          close: 2.35
        },
        'terrace-morning': {
          elena: {
            x: .511,
            y: .442
          },
          mateo: {
            x: .746,
            y: .414
          },
          close: 1.45,
          shared: {
            x: .62,
            y: .52
          }
        },
        'ensemble-mateo-studio': {
          elena: {
            x: .31,
            y: .32
          },
          mateo: {
            x: .69,
            y: .29
          },
          close: 2.15
        },
        'ensemble-mateo-rooftop': {
          elena: {
            x: .32,
            y: .32
          },
          mateo: {
            x: .70,
            y: .19
          },
          close: 2.05
        },
        // ComicPlayer uses `mateo` for the non-Elena speaker; these points locate Gabriel.
        'ensemble-gabriel-archive': {
          elena: {
            x: .397,
            y: .376
          },
          mateo: {
            x: .696,
            y: .332
          },
          close: 2.2
        },
        'ensemble-gabriel-terrace': {
          elena: {
            x: .327,
            y: .296
          },
          mateo: {
            x: .682,
            y: .214
          },
          close: 2.05
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Season.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      cclegacy._RF.push({}, "4ba5e5l/YVGErtHNYoBWQha", "Season", undefined);
      // Generated from content/season-one.json; do not hand edit.
      var SEASON = exports('SEASON', {
        "season_id": "season-one",
        "version": 1,
        "title": {
          "es": "Una señal entre dos",
          "pt": "Um sinal entre dois",
          "en": "A Signal Between Us",
          "zh": "彼此的讯号"
        },
        "rights": "Original fiction and art direction authored for Puerto Luz. No third-party characters, recordings, voices or licensed media are included. Prompts are specifications, not proof of generated assets.",
        "review_status": "DRAFT_NOT_NATIVE_REVIEWED",
        "locales": ["es-419", "pt-BR", "en", "zh-CN"],
        "contentRatingIntent": "Adult protagonists; non-explicit romance, voluntary kiss and hand-holding; no nudity or sexual content. Final platform rating not assessed.",
        "continuity": "Expands the internal three-level proof of concept into one complete season. Prologue remains an optional non-gated introduction; season nodes replace the short prototype win dialogues. Elena returns after ten years. Mateo kept her tape and recorded an unsent reply.",
        "progression": {
          "order": "linear",
          "unlock": "win_corresponding_level",
          "failureAdvancesStory": false,
          "rewardOrPurchaseAdvancesStory": false,
          "replay": "only_previously_unlocked_nodes",
          "autoAdvanceToLockedNode": false
        },
        "characters": [{
          "id": "elena",
          "name": "Elena",
          "age": 32,
          "visualBible": {
            "appearance": "Adult Latina woman, 32, medium warm-brown skin, oval face, dark brown eyes, shoulder-length dark brown loose curls, strong brows, small gold hoop earrings. Mature natural facial proportions.",
            "wardrobe": "Burgundy rolled-sleeve work shirt, ivory crew-neck cotton top, charcoal high-waist trousers, brown practical boots. Same wardrobe throughout all six paintings.",
            "personality": "Independent sound producer; precise, warm, willing to forgive after honest action. Her career remains her own.",
            "continuity": "Always the same face, curls, earrings and clothing. Usually screen left; never a teenage appearance, no glamour redesign."
          }
        }, {
          "id": "mateo",
          "name": "Mateo",
          "age": 34,
          "visualBible": {
            "appearance": "Adult Latino man, 34, medium warm-brown skin, short black curls, dark brown eyes, neat short beard, broad nose, natural mature facial proportions.",
            "wardrobe": "Indigo rolled-sleeve work shirt, sand-colored cotton trousers, dark work boots, simple dark wristwatch. Same wardrobe throughout all six paintings.",
            "personality": "Radio technician; caring but accustomed to withholding difficult information. Learns to ask instead of deciding for Elena.",
            "continuity": "Always the same face, short curls, beard, watch and clothing. Usually screen right; no youthful redesign, no exaggerated physique."
          }
        }],
        "scenes": [{
          "key": "radio-night",
          "title": {
            "es": "La luz encendida",
            "pt": "A luz acesa",
            "en": "The Light Is On",
            "zh": "亮着的灯"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Interior of a small old coastal radio studio at blue hour, warm amber desk lamp, faded teal analog mixing console and unlabelled cassette beside it, harbor lights through arched window. Elena at left just inside doorway, Mateo at right beside console, a careful hopeful gaze across the room. Wide medium two-shot with hands and worktable visible; room for face crops. Their physical distance expresses a reunion after ten years."
        }, {
          "key": "archive-rain",
          "title": {
            "es": "Lo que callamos",
            "pt": "O que ficou em silêncio",
            "en": "What We Left Unsaid",
            "zh": "未曾说出口的话"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Small storage room adjoining the same radio, overcast rainy daylight on window, wooden shelves with plain solid-color tape boxes and closed blank-cover notebooks. Elena at left sits at a desk, one hand beside a cassette; Mateo at right seated at the same height, open palms and regretful eyes. Intimate calm conversation, no confrontation or aggression. A small tape recorder and completely blank cream paper sheets on the desk. Clear faces for close crops. All walls are plain uninterrupted teal plaster. No wall plaques, signs, posters, labels, inscriptions, symbols, letters or numbers anywhere. Every paper and box surface is completely blank. Do not depict written marks of any kind. IDENTITY IS THE HIGHEST PRIORITY: precisely preserve the actual male face in the supplied cover reference, including the same face length-to-width ratio, nose, jaw, brow and beard shape. Mateo has short natural black curls lying low and flat along the head, not a high fluffy top, tall coils, high fade or a different haircut. Do not broaden or shorten his face. Preserve Elena as exactly the same adult woman from the reference. Match both people before adding scene detail."
        }, {
          "key": "harbor-dawn",
          "title": {
            "es": "Un plan entre dos",
            "pt": "Um plano a dois",
            "en": "A Plan for Two",
            "zh": "两个人的计划"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Quiet working harbor at dawn, coral and turquoise boats in distant soft focus, pale peach light and blue sea. Elena at left and Mateo at right stand next to a modest closed radio equipment case on a wooden cart, jointly reviewing a blank clipboard, collaborative rather than heroic. Same consistent outfits and faces, practical hopeful expressions; coastal radio building visible behind them, no added characters or readable signage. IDENTITY IS THE HIGHEST PRIORITY: precisely preserve the actual male face in the supplied cover reference, including the same face length-to-width ratio, nose, jaw, brow and beard shape. Mateo has short natural black curls lying low and flat along the head, not a high fluffy top, tall coils, high fade or a different haircut. Do not broaden or shorten his face. Preserve Elena as exactly the same adult woman from the reference. Match both people before adding scene detail."
        }, {
          "key": "rooftop-dusk",
          "title": {
            "es": "Sin volver a huir",
            "pt": "Sem fugir de novo",
            "en": "No More Running Away",
            "zh": "不再逃避"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Safe flat rooftop of the same coastal radio at dusk, low protective parapet and modest radio antenna in background, apricot horizon over harbor. Elena at left and Mateo at right stand close at equal eye level, hands relaxed near one another, tender but thoughtful eye contact. No climbing, no storm, no dangerous work, no kiss frozen into the base image. Two-shot supports separate face closeups and consensual romantic dialogue."
        }, {
          "key": "radio-live",
          "title": {
            "es": "La voz vuelve",
            "pt": "A voz volta",
            "en": "Our Voice Returns",
            "zh": "声音归来"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Same radio studio as radio-night, now clean and repaired, warm amber practical lights and soft neutral coastal daylight, two simple microphones, teal mixing console, a tiny red indicator light without words, harbor through arched window. Elena on left and Mateo on right sit side by side as equal cohosts, warm composed anticipation and shared focus, generic closed folder on desk. Composition supports wide and face close crops; do not draw text or floating UI."
        }, {
          "key": "terrace-morning",
          "title": {
            "es": "Quedarnos por elección",
            "pt": "Ficar por escolha",
            "en": "Choosing to Stay",
            "zh": "选择留下"
          },
          "prompt": "Original premium illustrated romantic drama, cinematic painterly 2D graphic novel, expressive mature faces, understated Latin American coastal town with no specific national flag, realistic adult proportions, rich midnight teal and amber palette, tactile weathered architecture, coherent soft film lighting, portrait 9:16 composition. Elena is 32, medium warm-brown skin, shoulder-length dark brown loose curls, small gold hoop earrings, burgundy rolled-sleeve shirt over ivory crew-neck top, charcoal trousers. Mateo is 34, medium warm-brown skin, short black curls, neat short beard, indigo rolled-sleeve shirt, sand trousers, dark wristwatch. Keep faces and costumes identical across this set. Both fully clothed, equal visual agency. Keep important faces in central upper two thirds, bottom quarter quiet for app-rendered subtitles. No text, no lettering, no speech bubbles, no logos, no watermark, no extra people, no sexualized posing. Small sea-facing terrace outside the same coastal radio in clear morning sunlight, weathered cream wall and teal open doorway behind them, harbor water shimmering softly. Elena at left and Mateo at right sit at a small table with two plain coffee mugs, gently holding hands above the table with relaxed sincere smiles. Fully clothed in identical consistent wardrobe, mature earned affection, open airy calm ending. No wedding imagery, no baby, no implied career abandonment."
        }],
        "chapters": [{
          "id": "ch-01",
          "title": {
            "es": "La cinta pendiente",
            "pt": "A fita à espera",
            "en": "The Waiting Tape",
            "zh": "等待回应的磁带"
          },
          "synopsis": {
            "es": "El reencuentro descubre una respuesta guardada y seis días para salvar la radio.",
            "pt": "O reencontro revela uma resposta guardada e seis dias para salvar a rádio.",
            "en": "Their reunion reveals an unsent reply—and just six days to save the station.",
            "zh": "重逢揭开了一段未曾送出的回应，也留下了挽救电台的最后六天。"
          },
          "nodeIds": ["s1-01", "s1-02", "s1-03"]
        }, {
          "id": "ch-02",
          "title": {
            "es": "El precio del silencio",
            "pt": "O preço do silêncio",
            "en": "The Cost of Silence",
            "zh": "沉默的代价"
          },
          "synopsis": {
            "es": "Las cuentas y una confesión explican el pasado, sin borrar el daño.",
            "pt": "As contas e uma confissão explicam o passado, sem apagar a mágoa.",
            "en": "The accounts and a confession explain the past without erasing the hurt.",
            "zh": "账目与坦白道出了往事，却无法抹去伤痛。"
          },
          "nodeIds": ["s1-04", "s1-05", "s1-06"]
        }, {
          "id": "ch-03",
          "title": {
            "es": "Una señal compartida",
            "pt": "Um sinal compartilhado",
            "en": "A Shared Signal",
            "zh": "共同的讯号"
          },
          "synopsis": {
            "es": "Un préstamo de equipo y un plan cooperativo permiten trabajar juntos sin renunciar a sus carreras.",
            "pt": "Um empréstimo de equipamento e um plano cooperativo permitem trabalhar juntos sem abandonar suas carreiras.",
            "en": "Borrowed equipment and a cooperative plan let them work together while keeping their own careers.",
            "zh": "借来的设备与合作社计划，让两人能携手经营电台，也保有各自的事业。"
          },
          "nodeIds": ["s1-07", "s1-08", "s1-09"]
        }, {
          "id": "ch-04",
          "title": {
            "es": "Preguntar antes de prometer",
            "pt": "Perguntar antes de prometer",
            "en": "Ask Before You Promise",
            "zh": "承诺之前，先问彼此"
          },
          "synopsis": {
            "es": "Una prueba falla; resuelven el problema como iguales y se acercan con consentimiento.",
            "pt": "Um teste falha; eles resolvem o problema como iguais e se aproximam com consentimento.",
            "en": "When a test fails, they solve the problem as equals and grow closer on their own terms.",
            "zh": "测试出了故障，两人平等协作解决问题，也在彼此情愿中走近。"
          },
          "nodeIds": ["s1-10", "s1-11", "s1-12"]
        }, {
          "id": "ch-05",
          "title": {
            "es": "Nuestra voz, nuestras reglas",
            "pt": "Nossa voz, nossas regras",
            "en": "Our Voice, Our Rules",
            "zh": "我们的声音，我们的约定"
          },
          "synopsis": {
            "es": "Mantienen privada la cinta y presentan un presupuesto transparente para renovar el alquiler.",
            "pt": "Mantêm a fita em segredo e apresentam um orçamento transparente para renovar o aluguel.",
            "en": "They keep the tape private and present a transparent budget to renew the lease.",
            "zh": "他们守护磁带里的私密往事，用公开透明的预算争取续租。"
          },
          "nodeIds": ["s1-13", "s1-14", "s1-15"]
        }, {
          "id": "ch-06",
          "title": {
            "es": "Buenos días, Puerto Luz",
            "pt": "Bom dia, Puerto Luz",
            "en": "Good Morning, Puerto Luz",
            "zh": "早安，光之港"
          },
          "synopsis": {
            "es": "Con la radio a salvo, escuchan el pasado y eligen una relación compatible con sus vidas.",
            "pt": "Com a rádio a salvo, ouvem o passado e escolhem uma relação compatível com suas vidas.",
            "en": "With the station saved, they listen to the past and choose a relationship that leaves room for both their lives.",
            "zh": "电台保住了。他们倾听过去，也选择了一段能容纳各自人生的感情。"
          },
          "nodeIds": ["s1-16", "s1-17", "s1-18"]
        }],
        "nodes": [{
          "id": "s1-01",
          "chapterId": "ch-01",
          "levelId": "s1-01",
          "levelNumber": 1,
          "title": {
            "es": "La luz sigue encendida",
            "pt": "A luz continua acesa",
            "en": "The Light Is Still On",
            "zh": "灯还亮着"
          },
          "objective": {
            "es": "Repara la consola para recuperar la primera señal.",
            "pt": "Conserte a mesa de som para recuperar o primeiro sinal.",
            "en": "Repair the console to bring back the first signal.",
            "zh": "修好调音台，找回最初的讯号。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-01"
          },
          "shots": [{
            "id": "s1-01-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "La luz sigue encendida. Pensé que te habías ido.",
            "pt": "A luz continua acesa. Achei que você tivesse ido embora.",
            "en": "The light is still on. I thought you’d left.",
            "zh": "灯还亮着。我以为你已经走了。",
            "sceneKey": "radio-night",
            "shot": "wide",
            "emotion": "guarded"
          }, {
            "id": "s1-01-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Alguien tenía que cuidar este lugar.",
            "pt": "Alguém precisava cuidar deste lugar.",
            "en": "Someone had to look after this place.",
            "zh": "总得有人照看这里。",
            "sceneKey": "radio-night",
            "shot": "close",
            "emotion": "hopeful"
          }, {
            "id": "s1-01-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Entonces empecemos por la señal. Lo demás puede esperar.",
            "pt": "Então vamos começar pelo sinal. O resto pode esperar.",
            "en": "Then let’s start with the signal. Everything else can wait.",
            "zh": "那就先把信号修好吧。别的事，可以慢慢来。",
            "sceneKey": "radio-night",
            "shot": "cut",
            "emotion": "resolute"
          }]
        }, {
          "id": "s1-02",
          "chapterId": "ch-01",
          "levelId": "s1-02",
          "levelNumber": 2,
          "title": {
            "es": "Dos voces guardadas",
            "pt": "Duas vozes guardadas",
            "en": "Two Voices on Tape",
            "zh": "磁带里的两个声音"
          },
          "objective": {
            "es": "Limpia el cabezal para recuperar la cinta.",
            "pt": "Limpe o cabeçote para recuperar a fita.",
            "en": "Clean the tape head to recover the recording.",
            "zh": "清洁磁头，找回磁带里的声音。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-02"
          },
          "shots": [{
            "id": "s1-02-shot-1",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Encontré tu cinta detrás de la consola.",
            "pt": "Encontrei sua fita atrás da mesa de som.",
            "en": "I found your tape behind the console.",
            "zh": "我在调音台后面找到了你的磁带。",
            "sceneKey": "radio-night",
            "shot": "wide",
            "emotion": "hesitant"
          }, {
            "id": "s1-02-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "No era para la audiencia. Era para ti.",
            "pt": "Não era para o público. Era para você.",
            "en": "It wasn’t for the audience. It was for you.",
            "zh": "那不是录给听众的，是录给你的。",
            "sceneKey": "radio-night",
            "shot": "close",
            "emotion": "vulnerable"
          }, {
            "id": "s1-02-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Grabé una respuesta. Nunca te la envié.",
            "pt": "Gravei uma resposta. Nunca enviei para você.",
            "en": "I recorded a reply. I never sent it.",
            "zh": "我录了一段回应，却一直没寄给你。",
            "sceneKey": "radio-night",
            "shot": "cut",
            "emotion": "remorseful"
          }]
        }, {
          "id": "s1-03",
          "chapterId": "ch-01",
          "levelId": "s1-03",
          "levelNumber": 3,
          "title": {
            "es": "Seis días",
            "pt": "Seis dias",
            "en": "Six Days",
            "zh": "六天"
          },
          "objective": {
            "es": "Enciende la mesa de trabajo para revisar las cuentas.",
            "pt": "Acenda a bancada para revisar as contas.",
            "en": "Light up the workbench to review the accounts.",
            "zh": "点亮工作台，核对账目。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-03"
          },
          "shots": [{
            "id": "s1-03-shot-1",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "El alquiler vence en seis días. La radio no tiene reservas.",
            "pt": "O aluguel vence em seis dias. A rádio não tem reservas.",
            "en": "The lease expires in six days. The station has no reserves.",
            "zh": "租约六天后到期。电台已经没有余钱了。",
            "sceneKey": "archive-rain",
            "shot": "wide",
            "emotion": "tense"
          }, {
            "id": "s1-03-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Podemos pedir una renovación. Necesitamos un plan que podamos cumplir.",
            "pt": "Podemos pedir uma renovação. Precisamos de um plano viável.",
            "en": "We can ask to renew. We need a plan we can actually deliver.",
            "zh": "我们可以争取续租，但得拿出一个做得到的计划。",
            "sceneKey": "archive-rain",
            "shot": "close",
            "emotion": "concerned"
          }, {
            "id": "s1-03-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Primero las cuentas. Después, las promesas.",
            "pt": "Primeiro as contas. Depois, as promessas.",
            "en": "The numbers first. The promises later.",
            "zh": "先算清账，再许承诺。",
            "sceneKey": "archive-rain",
            "shot": "cut",
            "emotion": "firm"
          }]
        }, {
          "id": "s1-04",
          "chapterId": "ch-02",
          "levelId": "s1-04",
          "levelNumber": 4,
          "title": {
            "es": "La factura",
            "pt": "A nota fiscal",
            "en": "The Invoice",
            "zh": "那张发票"
          },
          "objective": {
            "es": "Ordena el archivo para encontrar la factura del equipo.",
            "pt": "Organize o arquivo para encontrar a nota do equipamento.",
            "en": "Sort the archive to find the equipment invoice.",
            "zh": "整理档案，找到设备发票。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-04"
          },
          "shots": [{
            "id": "s1-04-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Vendiste el transmisor. ¿Por eso dejamos de salir al aire?",
            "pt": "Você vendeu o transmissor. Foi por isso que saímos do ar?",
            "en": "You sold the transmitter. Is that why we went off the air?",
            "zh": "你把发射机卖了？所以电台才停播的？",
            "sceneKey": "archive-rain",
            "shot": "wide",
            "emotion": "hurt"
          }, {
            "id": "s1-04-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "El techo se caía. Lo vendí para repararlo. Debí contártelo.",
            "pt": "O teto estava caindo. Vendi para consertá-lo. Devia ter contado.",
            "en": "The roof was falling in. I sold it to pay for repairs. I should have told you.",
            "zh": "屋顶快塌了。我卖掉它来修屋顶。我该告诉你的。",
            "sceneKey": "archive-rain",
            "shot": "close",
            "emotion": "remorseful"
          }, {
            "id": "s1-04-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Entiendo la urgencia. Pero no vuelvas a decidir por los dos.",
            "pt": "Entendo a urgência. Mas não decida por nós dois de novo.",
            "en": "I understand it was urgent. But don’t decide for both of us again.",
            "zh": "我明白当时很急。但别再替我们两个人做决定。",
            "sceneKey": "archive-rain",
            "shot": "cut",
            "emotion": "firm"
          }]
        }, {
          "id": "s1-05",
          "chapterId": "ch-02",
          "levelId": "s1-05",
          "levelNumber": 5,
          "title": {
            "es": "Lo que no dijiste",
            "pt": "O que você não disse",
            "en": "What You Never Said",
            "zh": "你没说出口的话"
          },
          "objective": {
            "es": "Recupera el cable del reproductor para escuchar su respuesta.",
            "pt": "Recupere o cabo do aparelho para ouvir a resposta dele.",
            "en": "Find the player’s cable to hear his reply.",
            "zh": "找回录音机的连接线，听听他的回应。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-05"
          },
          "shots": [{
            "id": "s1-05-shot-1",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Cuando te fuiste, mamá estaba enferma. Yo no sabía pedir ayuda.",
            "pt": "Quando você foi embora, minha mãe estava doente. Eu não sabia pedir ajuda.",
            "en": "When you left, Mom was ill. I didn’t know how to ask for help.",
            "zh": "你离开时，我妈妈病了。我不知道该怎么开口求助。",
            "sceneKey": "archive-rain",
            "shot": "wide",
            "emotion": "vulnerable"
          }, {
            "id": "s1-05-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Podías decirme que no. El silencio me hizo sentir que no importaba.",
            "pt": "Você podia dizer não. Seu silêncio me fez sentir que eu não importava.",
            "en": "You could have told me no. Your silence made me feel I didn’t matter.",
            "zh": "你可以对我说不。可你的沉默，让我觉得自己不重要。",
            "sceneKey": "archive-rain",
            "shot": "close",
            "emotion": "hurt"
          }, {
            "id": "s1-05-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Importabas. Tuve miedo. Eso explica mi silencio; no lo justifica.",
            "pt": "Você importava. Tive medo. Isso explica meu silêncio; não justifica.",
            "en": "You mattered. I was scared. That explains my silence. It doesn’t excuse it.",
            "zh": "你很重要。我只是害怕。这是我沉默的原因，却不是借口。",
            "sceneKey": "archive-rain",
            "shot": "cut",
            "emotion": "remorseful"
          }]
        }, {
          "id": "s1-06",
          "chapterId": "ch-02",
          "levelId": "s1-06",
          "levelNumber": 6,
          "title": {
            "es": "La cara B",
            "pt": "O lado B",
            "en": "Side B",
            "zh": "磁带的另一面"
          },
          "objective": {
            "es": "Estabiliza el sonido para reproducir la cara B.",
            "pt": "Estabilize o som para tocar o lado B.",
            "en": "Steady the sound to play side B.",
            "zh": "稳定声音，播放磁带B面。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-06"
          },
          "shots": [{
            "id": "s1-06-shot-1",
            "duration": 6,
            "speaker": "Mateo · grabación",
            "speakerLabels": {
              "es": "Mateo · grabación",
              "pt": "Mateo · gravação",
              "en": "Mateo · recording",
              "zh": "马特奥 · 录音"
            },
            "es": "Quiero ir contigo. No sé cómo dejar a mamá.",
            "pt": "Quero ir com você. Não sei como deixar minha mãe.",
            "en": "I want to go with you. I don’t know how to leave Mom.",
            "zh": "我想跟你一起走。可我不知道该怎么放下妈妈。",
            "sceneKey": "archive-rain",
            "shot": "wide",
            "emotion": "vulnerable"
          }, {
            "id": "s1-06-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "No necesitaba que vinieras. Necesitaba poder hablar contigo.",
            "pt": "Eu não precisava que você fosse. Precisava poder conversar com você.",
            "en": "I didn’t need you to come. I needed to be able to talk to you.",
            "zh": "我不需要你一定跟我走。我需要的是，能和你好好说话。",
            "sceneKey": "archive-rain",
            "shot": "close",
            "emotion": "sad"
          }, {
            "id": "s1-06-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Ella está bien ahora. Yo debí llamarte entonces. Perdón.",
            "pt": "Ela está bem agora. Eu devia ter ligado naquela época. Me desculpe.",
            "en": "She’s well now. I should have called you back then. I’m sorry.",
            "zh": "她现在很好。当时我就该给你打电话。对不起。",
            "sceneKey": "archive-rain",
            "shot": "cut",
            "emotion": "remorseful"
          }]
        }, {
          "id": "s1-07",
          "chapterId": "ch-03",
          "levelId": "s1-07",
          "levelNumber": 7,
          "title": {
            "es": "Equipo prestado",
            "pt": "Equipamento emprestado",
            "en": "Borrowed Equipment",
            "zh": "借来的设备"
          },
          "objective": {
            "es": "Prepara la conexión del transmisor de préstamo.",
            "pt": "Prepare a conexão do transmissor emprestado.",
            "en": "Set up the connection for the borrowed transmitter.",
            "zh": "为借来的发射机接好线路。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-07"
          },
          "shots": [{
            "id": "s1-07-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "El taller nos presta un transmisor durante una semana.",
            "pt": "A oficina emprestou um transmissor por uma semana.",
            "en": "The workshop is lending us a transmitter for a week.",
            "zh": "维修店愿意借给我们一台发射机，用一周。",
            "sceneKey": "harbor-dawn",
            "shot": "wide",
            "emotion": "hopeful"
          }, {
            "id": "s1-07-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Después podremos alquilarlo. La tarifa ya está en el presupuesto.",
            "pt": "Depois podemos alugá-lo. O valor já está no orçamento.",
            "en": "After that, we can rent it. The rate is already in the budget.",
            "zh": "之后可以租用。租金已经算进预算了。",
            "sceneKey": "harbor-dawn",
            "shot": "close",
            "emotion": "focused"
          }, {
            "id": "s1-07-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Probemos la señal antes de ofrecer algo que no podamos dar.",
            "pt": "Vamos testar o sinal antes de oferecer algo que não podemos entregar.",
            "en": "Let’s test the signal before we promise more than we can deliver.",
            "zh": "先测试信号吧。别答应了别人，却做不到。",
            "sceneKey": "harbor-dawn",
            "shot": "cut",
            "emotion": "resolute"
          }]
        }, {
          "id": "s1-08",
          "chapterId": "ch-03",
          "levelId": "s1-08",
          "levelNumber": 8,
          "title": {
            "es": "Mi trabajo también cuenta",
            "pt": "Meu trabalho também conta",
            "en": "My Work Matters Too",
            "zh": "我的事业也重要"
          },
          "objective": {
            "es": "Ajusta el micrófono del nuevo espacio de producción.",
            "pt": "Ajuste o microfone do novo espaço de produção.",
            "en": "Adjust the microphone in the new production space.",
            "zh": "调好新制作间的话筒。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-08"
          },
          "shots": [{
            "id": "s1-08-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Acepté producir una serie. Tendré que viajar dos días por semana.",
            "pt": "Aceitei produzir uma série. Vou viajar dois dias por semana.",
            "en": "I’ve agreed to produce a series. I’ll need to travel two days a week.",
            "zh": "我接了一档系列节目的制作，每周要出差两天。",
            "sceneKey": "harbor-dawn",
            "shot": "wide",
            "emotion": "cautious"
          }, {
            "id": "s1-08-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "¿Y los otros días? Quiero preguntarte, no dar nada por hecho.",
            "pt": "E nos outros dias? Quero perguntar, sem presumir nada.",
            "en": "And the other days? I want to ask, not assume.",
            "zh": "那其他日子呢？我想先问你，不想擅自认定。",
            "sceneKey": "harbor-dawn",
            "shot": "close",
            "emotion": "open"
          }, {
            "id": "s1-08-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Puedo trabajar desde aquí. Si quedarme también es mi decisión.",
            "pt": "Posso trabalhar daqui. Se ficar também for uma escolha minha.",
            "en": "I can work from here. As long as staying is my choice too.",
            "zh": "我可以在这里工作。只要留下，也是我自己的选择。",
            "sceneKey": "harbor-dawn",
            "shot": "cut",
            "emotion": "hopeful"
          }]
        }, {
          "id": "s1-09",
          "chapterId": "ch-03",
          "levelId": "s1-09",
          "levelNumber": 9,
          "title": {
            "es": "La radio es de todos",
            "pt": "A rádio é de todos",
            "en": "Everyone’s Station",
            "zh": "属于大家的电台"
          },
          "objective": {
            "es": "Conecta la línea de participación de la comunidad.",
            "pt": "Conecte a linha de participação da comunidade.",
            "en": "Connect the community participation line.",
            "zh": "接通社区参与热线。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-09"
          },
          "shots": [{
            "id": "s1-09-shot-1",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Propongo una cooperativa: cuotas claras y cuentas abiertas.",
            "pt": "Proponho uma cooperativa: contribuições claras e contas abertas.",
            "en": "I suggest a cooperative: clear contributions and open accounts.",
            "zh": "我提议成立合作社：出资说清楚，账目全公开。",
            "sceneKey": "harbor-dawn",
            "shot": "wide",
            "emotion": "focused"
          }, {
            "id": "s1-09-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Mi trabajo tendrá su propio horario. La radio necesita más de dos personas.",
            "pt": "Meu trabalho terá seu próprio horário. A rádio precisa de mais de duas pessoas.",
            "en": "My own work needs its own hours. The station needs more than the two of us.",
            "zh": "我得为自己的工作留出时间。电台不能只靠我们两个人。",
            "sceneKey": "harbor-dawn",
            "shot": "close",
            "emotion": "firm"
          }, {
            "id": "s1-09-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Los vecinos cubrirán turnos. Sus compromisos irán por escrito.",
            "pt": "Os vizinhos vão cobrir turnos. Os compromissos ficarão por escrito.",
            "en": "The neighbors will take shifts. We’ll put their commitments in writing.",
            "zh": "邻居们会轮流值班，具体安排都写下来。",
            "sceneKey": "harbor-dawn",
            "shot": "cut",
            "emotion": "hopeful"
          }]
        }, {
          "id": "s1-10",
          "chapterId": "ch-04",
          "levelId": "s1-10",
          "levelNumber": 10,
          "title": {
            "es": "Una prueba con ruido",
            "pt": "Um teste com ruído",
            "en": "Static on the Line",
            "zh": "信号里的杂音"
          },
          "objective": {
            "es": "Localiza la interferencia durante la prueba de antena.",
            "pt": "Localize a interferência durante o teste da antena.",
            "en": "Find the interference during the antenna test.",
            "zh": "测试天线，找出干扰源。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-10"
          },
          "shots": [{
            "id": "s1-10-shot-1",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "La consola funciona. El ruido viene de la antena. La reunión es mañana.",
            "pt": "A mesa funciona. O ruído vem da antena. A reunião é amanhã.",
            "en": "The console works. The static is coming from the antenna. The meeting is tomorrow.",
            "zh": "调音台正常，杂音来自天线。明天就要开会了。",
            "sceneKey": "rooftop-dusk",
            "shot": "wide",
            "emotion": "tense"
          }, {
            "id": "s1-10-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Me quedaré toda la noche. Puedo arreglarlo solo.",
            "pt": "Vou ficar a noite toda. Posso consertar sozinho.",
            "en": "I’ll stay all night. I can fix it on my own.",
            "zh": "我今晚不走了。我一个人能修好。",
            "sceneKey": "rooftop-dusk",
            "shot": "close",
            "emotion": "anxious"
          }, {
            "id": "s1-10-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Podemos hacerlo juntos. No tienes que ganarte mi cariño agotándote.",
            "pt": "Podemos fazer juntos. Você não precisa se esgotar para merecer meu carinho.",
            "en": "We can do this together. You don’t have to wear yourself out to earn my affection.",
            "zh": "我们可以一起修。你不用把自己累垮，来换我的喜欢。",
            "sceneKey": "rooftop-dusk",
            "shot": "cut",
            "emotion": "caring"
          }]
        }, {
          "id": "s1-11",
          "chapterId": "ch-04",
          "levelId": "s1-11",
          "levelNumber": 11,
          "title": {
            "es": "Decirlo a tiempo",
            "pt": "Falar na hora certa",
            "en": "Say It in Time",
            "zh": "及时说出口"
          },
          "objective": {
            "es": "Sincroniza la antena con el control de la consola.",
            "pt": "Sincronize a antena com o controle da mesa de som.",
            "en": "Sync the antenna with the console controls.",
            "zh": "同步天线与调音台的控制信号。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-11"
          },
          "shots": [{
            "id": "s1-11-shot-1",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Encontré el cable suelto. ¿Revisas la consola mientras lo conecto?",
            "pt": "Achei o cabo solto. Você confere a mesa enquanto eu conecto?",
            "en": "I found the loose cable. Can you check the console while I reconnect it?",
            "zh": "找到松掉的线了。我接线，你帮我检查调音台，好吗？",
            "sceneKey": "rooftop-dusk",
            "shot": "wide",
            "emotion": "open"
          }, {
            "id": "s1-11-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Sí. Y cuando algo nos duela, lo decimos. Sin adivinar.",
            "pt": "Sim. E quando algo doer, a gente fala. Sem adivinhar.",
            "en": "Yes. And when something hurts, we say so. No guessing.",
            "zh": "好。以后有什么让我们难过，也要说出来，别让彼此猜。",
            "sceneKey": "rooftop-dusk",
            "shot": "close",
            "emotion": "warm"
          }, {
            "id": "s1-11-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Aunque la respuesta no sea la que esperamos.",
            "pt": "Mesmo quando a resposta não for a que esperamos.",
            "en": "Even if the answer isn’t what we hoped for.",
            "zh": "哪怕答案不是我们期待的。",
            "sceneKey": "rooftop-dusk",
            "shot": "cut",
            "emotion": "sincere"
          }]
        }, {
          "id": "s1-12",
          "chapterId": "ch-04",
          "levelId": "s1-12",
          "levelNumber": 12,
          "title": {
            "es": "Una pregunta sencilla",
            "pt": "Uma pergunta simples",
            "en": "One Simple Question",
            "zh": "一个简单的问题"
          },
          "objective": {
            "es": "Afina la señal para terminar la prueba de sonido.",
            "pt": "Ajuste o sinal para terminar o teste de som.",
            "en": "Fine-tune the signal to finish the sound check.",
            "zh": "微调信号，完成试音。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-12"
          },
          "shots": [{
            "id": "s1-12-shot-1",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "La señal llega limpia al puerto. Por primera vez, ninguno se aparta.",
            "pt": "O sinal chega limpo ao porto. Pela primeira vez, ninguém se afasta.",
            "en": "The signal reaches the harbor clearly. For the first time, neither pulls away.",
            "zh": "清晰的信号传到了港口。这一次，谁也没有退开。",
            "sceneKey": "rooftop-dusk",
            "shot": "wide",
            "emotion": "relieved"
          }, {
            "id": "s1-12-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Quiero besarte. ¿Tú también quieres?",
            "pt": "Quero beijar você. Você também quer?",
            "en": "I want to kiss you. Would you like that too?",
            "zh": "我想吻你。你也愿意吗？",
            "sceneKey": "rooftop-dusk",
            "shot": "close",
            "emotion": "tender"
          }, {
            "id": "s1-12-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Sí. Un beso no borra el pasado. Pero podemos empezar aquí.",
            "pt": "Quero. Um beijo não apaga o passado. Mas podemos começar aqui.",
            "en": "Yes. A kiss won’t erase the past. But we can start here.",
            "zh": "愿意。一个吻抹不掉过去，但我们可以从这里重新开始。",
            "sceneKey": "rooftop-dusk",
            "shot": "cut",
            "emotion": "tender"
          }]
        }, {
          "id": "s1-13",
          "chapterId": "ch-05",
          "levelId": "s1-13",
          "levelNumber": 13,
          "title": {
            "es": "Una cinta privada",
            "pt": "Uma fita particular",
            "en": "A Private Tape",
            "zh": "只属于我们的磁带"
          },
          "objective": {
            "es": "Prepara la mesa de edición de la presentación.",
            "pt": "Prepare a mesa de edição da apresentação.",
            "en": "Prepare the editing console for the presentation.",
            "zh": "准备好剪辑台，为提案做准备。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-13"
          },
          "shots": [{
            "id": "s1-13-shot-1",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Podríamos contar nuestro reencuentro durante la presentación. ¿Cómo te sentirías?",
            "pt": "Podemos contar nosso reencontro na apresentação. Como você se sentiria?",
            "en": "We could share the story of our reunion at the presentation. How would you feel about that?",
            "zh": "提案时，我们也可以讲讲这次重逢。你觉得呢？",
            "sceneKey": "radio-live",
            "shot": "wide",
            "emotion": "questioning"
          }, {
            "id": "s1-13-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Nuestra cinta es privada. No quiero usarla para conseguir apoyo.",
            "pt": "Nossa fita é particular. Não quero usá-la para conseguir apoio.",
            "en": "Our tape is private. I don’t want to use it to win support.",
            "zh": "这盘磁带是我们的私事。我不想用它换取支持。",
            "sceneKey": "radio-live",
            "shot": "close",
            "emotion": "firm"
          }, {
            "id": "s1-13-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Entonces queda entre nosotros. Presentaremos el trabajo de la radio.",
            "pt": "Então fica entre nós. Vamos apresentar o trabalho da rádio.",
            "en": "Then it stays between us. We’ll present the station’s work.",
            "zh": "那就只留给我们。提案讲电台的工作就好。",
            "sceneKey": "radio-live",
            "shot": "cut",
            "emotion": "respectful"
          }]
        }, {
          "id": "s1-14",
          "chapterId": "ch-05",
          "levelId": "s1-14",
          "levelNumber": 14,
          "title": {
            "es": "Cuentas claras",
            "pt": "Contas claras",
            "en": "Open Accounts",
            "zh": "把账说清楚"
          },
          "objective": {
            "es": "Completa la prueba de emisión para presentar el plan.",
            "pt": "Conclua o teste de transmissão para apresentar o plano.",
            "en": "Complete the broadcast test to present the plan.",
            "zh": "完成试播，展示计划。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-14"
          },
          "shots": [{
            "id": "s1-14-shot-1",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "Las cuotas comprometidas cubren el alquiler y el equipo. El margen es pequeño.",
            "pt": "As contribuições prometidas cobrem o aluguel e o equipamento. A margem é pequena.",
            "en": "The pledged contributions cover rent and equipment. There’s little room to spare.",
            "zh": "大家承诺的出资够付租金和设备费用，但余地不大。",
            "sceneKey": "radio-live",
            "shot": "wide",
            "emotion": "tense"
          }, {
            "id": "s1-14-shot-2",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "No prometemos milagros. Publicaremos gastos y horarios cada mes.",
            "pt": "Não prometemos milagres. Vamos publicar gastos e horários todo mês.",
            "en": "We aren’t promising miracles. We’ll publish expenses and schedules every month.",
            "zh": "我们不承诺奇迹。每个月都会公开开支和排班。",
            "sceneKey": "radio-live",
            "shot": "close",
            "emotion": "confident"
          }, {
            "id": "s1-14-shot-3",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Y si algo falla, lo diremos antes de quedarnos sin opciones.",
            "pt": "E se algo falhar, vamos avisar antes de ficar sem opções.",
            "en": "And if something goes wrong, we’ll say so before we run out of options.",
            "zh": "如果出了问题，我们会及时说出来，不等到无路可走。",
            "sceneKey": "radio-live",
            "shot": "cut",
            "emotion": "sincere"
          }]
        }, {
          "id": "s1-15",
          "chapterId": "ch-05",
          "levelId": "s1-15",
          "levelNumber": 15,
          "title": {
            "es": "Un año de señal",
            "pt": "Um ano de sinal",
            "en": "A Year on the Air",
            "zh": "一年的讯号"
          },
          "objective": {
            "es": "Asegura la conexión para confirmar el nuevo comienzo.",
            "pt": "Garanta a conexão para confirmar o novo começo.",
            "en": "Secure the connection to confirm a new beginning.",
            "zh": "稳住连接，迎接新的开始。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-15"
          },
          "shots": [{
            "id": "s1-15-shot-1",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "La propuesta fue aceptada. La cooperativa firma un año de alquiler.",
            "pt": "A proposta foi aceita. A cooperativa assina um ano de aluguel.",
            "en": "The proposal is accepted. The cooperative signs a one-year lease.",
            "zh": "提案通过了。合作社签下了一年的租约。",
            "sceneKey": "radio-live",
            "shot": "wide",
            "emotion": "joyful"
          }, {
            "id": "s1-15-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "El primer pago está hecho. Tenemos radio, equipo y turnos.",
            "pt": "O primeiro pagamento está feito. Temos rádio, equipamento e turnos.",
            "en": "The first payment is made. We have a station, equipment, and a schedule.",
            "zh": "第一笔款付了。电台、设备和值班安排，都有着落了。",
            "sceneKey": "radio-live",
            "shot": "close",
            "emotion": "relieved"
          }, {
            "id": "s1-15-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Y las cuentas compartidas. Esta vez, nadie carga con todo.",
            "pt": "E as contas compartilhadas. Desta vez, ninguém carrega tudo sozinho.",
            "en": "And shared accounts. This time, no one carries it all alone.",
            "zh": "还有大家一起管的账。这次，谁也不用独自扛下所有事。",
            "sceneKey": "radio-live",
            "shot": "cut",
            "emotion": "joyful"
          }]
        }, {
          "id": "s1-16",
          "chapterId": "ch-06",
          "levelId": "s1-16",
          "levelNumber": 16,
          "title": {
            "es": "Escucharnos hasta el final",
            "pt": "Ouvir até o fim",
            "en": "Hear Each Other Out",
            "zh": "把彼此的话听完"
          },
          "objective": {
            "es": "Restaura el último fragmento de la cinta personal.",
            "pt": "Restaure o último trecho da fita pessoal.",
            "en": "Restore the final part of the personal recording.",
            "zh": "修复私人磁带的最后一段录音。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-16"
          },
          "shots": [{
            "id": "s1-16-shot-1",
            "duration": 6,
            "speaker": "Elena · grabación",
            "speakerLabels": {
              "es": "Elena · grabación",
              "pt": "Elena · gravação",
              "en": "Elena · recording",
              "zh": "埃莱娜 · 录音"
            },
            "es": "Si no vienes, dímelo. Quiero conocerte incluso cuando tengas miedo.",
            "pt": "Se você não vier, me diga. Quero conhecer você mesmo quando tiver medo.",
            "en": "If you’re not coming, tell me. I want to know you, even when you’re afraid.",
            "zh": "如果你不来，就告诉我。我想了解你，也包括害怕时的你。",
            "sceneKey": "terrace-morning",
            "shot": "wide",
            "emotion": "vulnerable"
          }, {
            "id": "s1-16-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Ahora la escuché hasta el final. No volveré a responder con silencio.",
            "pt": "Agora ouvi até o fim. Não vou mais responder com silêncio.",
            "en": "Now I’ve heard it all. I won’t answer with silence again.",
            "zh": "这次，我听完了。我不会再用沉默回答你。",
            "sceneKey": "terrace-morning",
            "shot": "close",
            "emotion": "sincere"
          }, {
            "id": "s1-16-shot-3",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Te perdono. La confianza la construiremos con lo que hagamos desde hoy.",
            "pt": "Eu perdoo você. A confiança será construída pelo que fizermos a partir de hoje.",
            "en": "I forgive you. We’ll build trust through what we do from today on.",
            "zh": "我原谅你。以后的信任，就靠我们从今天起的一点一滴来建立。",
            "sceneKey": "terrace-morning",
            "shot": "cut",
            "emotion": "warm"
          }]
        }, {
          "id": "s1-17",
          "chapterId": "ch-06",
          "levelId": "s1-17",
          "levelNumber": 17,
          "title": {
            "es": "Un lugar sin renuncias",
            "pt": "Um lugar sem renúncias",
            "en": "Room to Be Ourselves",
            "zh": "留下，也做自己"
          },
          "objective": {
            "es": "Programa los turnos de la nueva semana.",
            "pt": "Programe os turnos da nova semana.",
            "en": "Schedule the shifts for the coming week.",
            "zh": "安排新一周的值班。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-17"
          },
          "shots": [{
            "id": "s1-17-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Los martes viajo. Los jueves, producción. Y esta noche quiero cenar contigo.",
            "pt": "Terça eu viajo. Quinta, produção. E hoje à noite quero jantar com você.",
            "en": "Tuesdays, I travel. Thursdays, production. And tonight, I want dinner with you.",
            "zh": "周二出差，周四做节目。今晚，我想和你一起吃饭。",
            "sceneKey": "terrace-morning",
            "shot": "wide",
            "emotion": "playful"
          }, {
            "id": "s1-17-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "A las ocho. Sin micrófonos. Si cambia algo, nos avisamos.",
            "pt": "Às oito. Sem microfones. Se algo mudar, a gente avisa.",
            "en": "At eight. No microphones. If anything changes, we tell each other.",
            "zh": "八点。不带话筒。有变化，就告诉彼此。",
            "sceneKey": "terrace-morning",
            "shot": "close",
            "emotion": "tender"
          }, {
            "id": "s1-17-shot-3",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "Se toman de la mano. Quedarse ya no significa renunciar a sí mismos.",
            "pt": "Eles dão as mãos. Ficar já não significa abrir mão de si.",
            "en": "They take each other’s hands. Staying no longer means giving up who they are.",
            "zh": "他们牵起彼此的手。留下，不再意味着放弃自己。",
            "sceneKey": "terrace-morning",
            "shot": "cut",
            "emotion": "peaceful"
          }]
        }, {
          "id": "s1-18",
          "chapterId": "ch-06",
          "levelId": "s1-18",
          "levelNumber": 18,
          "title": {
            "es": "Buenos días, Puerto Luz",
            "pt": "Bom dia, Puerto Luz",
            "en": "Good Morning, Puerto Luz",
            "zh": "早安，光之港"
          },
          "objective": {
            "es": "Abre la emisión inaugural de la nueva radio.",
            "pt": "Abra a transmissão inaugural da nova rádio.",
            "en": "Start the new station’s inaugural broadcast.",
            "zh": "开启新电台的首场广播。"
          },
          "unlock": {
            "type": "level_win",
            "levelId": "s1-18"
          },
          "shots": [{
            "id": "s1-18-shot-1",
            "duration": 6,
            "speaker": "Elena",
            "speakerLabels": {
              "es": "Elena",
              "pt": "Elena",
              "en": "Elena",
              "zh": "埃莱娜"
            },
            "es": "Buenos días, Puerto Luz. Volvemos al aire con muchas voces.",
            "pt": "Bom dia, Puerto Luz. Voltamos ao ar com muitas vozes.",
            "en": "Good morning, Puerto Luz. We’re back on the air, with many voices.",
            "zh": "早安，光之港。我们带着大家的声音，重新开播了。",
            "sceneKey": "radio-live",
            "shot": "wide",
            "emotion": "joyful"
          }, {
            "id": "s1-18-shot-2",
            "duration": 6,
            "speaker": "Mateo",
            "speakerLabels": {
              "es": "Mateo",
              "pt": "Mateo",
              "en": "Mateo",
              "zh": "马特奥"
            },
            "es": "Esta casa vuelve a escuchar. Gracias por sostenerla con nosotros.",
            "pt": "Esta casa volta a ouvir. Obrigado por cuidar dela com a gente.",
            "en": "This place is listening again. Thank you for keeping it alive with us.",
            "zh": "这里又能倾听了。谢谢你们和我们一起守住它。",
            "sceneKey": "radio-live",
            "shot": "close",
            "emotion": "grateful"
          }, {
            "id": "s1-18-shot-3",
            "duration": 6,
            "speaker": "Narrador",
            "speakerLabels": {
              "es": "Narrador",
              "pt": "Narrador",
              "en": "Narrator",
              "zh": "旁白"
            },
            "es": "La radio tiene futuro. Elena y Mateo, una nueva relación. Esta vez, elegida por ambos.",
            "pt": "A rádio tem futuro. Elena e Mateo, uma nova relação. Desta vez, escolhida pelos dois.",
            "en": "The station has a future. Elena and Mateo have a new relationship. This time, they both chose it.",
            "zh": "电台有了未来，埃莱娜和马特奥也有了新的感情。这一次，是两个人共同的选择。",
            "sceneKey": "radio-live",
            "shot": "cut",
            "emotion": "peaceful"
          }]
        }],
        "ending": {
          "es": "La radio reabre con un contrato de un año y el primer pago hecho. Elena conserva su trabajo y su autonomía. Mateo deja de decidir en silencio. Ambos eligen una relación nueva, con acuerdos concretos y una cena por delante. Fin de la primera temporada.",
          "pt": "A rádio reabre com contrato de um ano e o primeiro pagamento feito. Elena mantém seu trabalho e sua autonomia. Mateo deixa de decidir em silêncio. Os dois escolhem uma nova relação, com acordos concretos e um jantar pela frente. Fim da primeira temporada.",
          "en": "The station reopens with a one-year lease and the first payment made. Elena keeps her work and her independence. Mateo stops making decisions in silence. They choose a new relationship, with clear agreements and a dinner ahead. End of season one.",
          "zh": "电台重新开播，签下了一年租约，也付清了首笔款项。埃莱娜保有自己的事业与独立，马特奥不再默默替别人做决定。他们选择了一段新的感情，有明确的约定，也有一顿期待中的晚餐。第一季完。"
        }
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Session.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Puzzle.ts'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, digest, createBoard, RULES, clone, act;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      digest = module.digest;
      createBoard = module.createBoard;
      RULES = module.RULES;
      clone = module.clone;
      act = module.act;
    }],
    execute: function () {
      exports('balance', balance);
      cclegacy._RF.push({}, "91ea28QxHtDU4eMXcU1pIDr", "Session", undefined);
      var ITEMS = ['hammer', 'shuffle', 'continue'];
      function balance(s, item) {
        return s.grants.filter(function (g) {
          return g.item === item;
        }).reduce(function (n, g) {
          return n + g.remaining;
        }, 0);
      }
      var Session = exports('Session', /*#__PURE__*/function () {
        function Session(levels) {
          this.state = void 0;
          this.commands = [];
          this.levels = void 0;
          if (!levels.length || new Set(levels.map(function (l) {
            return l.id;
          })).size !== levels.length) throw new Error('INVALID_LEVELS');
          this.levels = clone(levels);
          for (var _iterator = _createForOfIteratorHelperLoose(levels), _step; !(_step = _iterator()).done;) {
            var l = _step.value;
            createBoard(l);
          }
          this.state = {
            schema: 1,
            screen: 'intro',
            levelIndex: 0,
            runSerial: 0,
            runId: '',
            board: null,
            grants: ITEMS.map(function (item) {
              return {
                id: 'welcome:' + item,
                source: 'gameplay',
                item: item,
                quantity: item === 'hammer' ? 2 : 1,
                remaining: item === 'hammer' ? 2 : 1
              };
            }),
            consumed: [],
            completed: [],
            storyUnlocked: [],
            events: []
          };
        }
        var _proto = Session.prototype;
        _proto.event = function event(s, type, detail) {
          s.events.push({
            type: type,
            runId: s.runId,
            detail: detail,
            hash: digest({
              board: s.board,
              grants: s.grants,
              completed: s.completed,
              storyUnlocked: s.storyUnlocked
            })
          });
        };
        _proto.start = function start(s) {
          s.runSerial++;
          s.runId = this.levels[s.levelIndex].id + ":" + s.runSerial;
          s.board = createBoard(this.levels[s.levelIndex]);
          s.screen = 'puzzle';
          this.event(s, 'puzzle_start', {
            level: s.board.level.id,
            rules: RULES,
            seed: s.board.level.seed
          });
        }
        /** Persist the complete candidate before publishing any change. Storage failure rolls back. */;
        _proto.dispatch = function dispatch(command, persist) {
          var s = clone(this.state);
          var frames = [],
            reshuffled = false;
          var reject = function reject(reason) {
            return {
              ok: false,
              reason: reason,
              frames: [],
              reshuffled: false
            };
          };
          if (!command || typeof command !== 'object') return reject('INVALID_COMMAND');
          var cmd = clone(command);
          if (cmd.type === 'begin') {
            if (s.screen !== 'intro') return reject('WRONG_SCREEN');
            this.start(s);
          } else if (cmd.type === 'retry') {
            if (s.screen !== 'puzzle') return reject('WRONG_SCREEN');
            this.start(s);
          } else if (cmd.type === 'next') {
            if (s.screen !== 'story' || !this.levels[s.levelIndex]) return reject('STORY_LOCKED');
            var id = this.levels[s.levelIndex].id;
            if (!s.completed.includes(id) || !s.storyUnlocked.includes(id)) return reject('STORY_LOCKED');
            this.event(s, 'story_seen', {
              id: id
            });
            s.levelIndex++;
            if (s.levelIndex >= this.levels.length) {
              s.screen = 'ending';
              s.board = null;
            } else this.start(s);
          } else if (cmd.type === 'grant') {
            if (!ITEMS.includes(cmd.item) || !['ad-simulation', 'iap-simulation'].includes(cmd.source) || typeof cmd.id !== 'string' || !cmd.id || cmd.id.length > 160) return reject('INVALID_GRANT');
            if (!['reward', 'cancel', 'no-fill', 'pending'].includes(cmd.outcome)) return reject('INVALID_OUTCOME');
            var key = cmd.source + ':' + cmd.id;
            if (s.grants.some(function (g) {
              return g.id === key;
            })) return reject('DUPLICATE_GRANT');
            this.event(s, 'simulated_offer_result', {
              source: cmd.source,
              outcome: cmd.outcome,
              item: cmd.item
            });
            if (cmd.outcome === 'reward') {
              s.grants.push({
                id: key,
                source: cmd.source,
                item: cmd.item,
                quantity: 1,
                remaining: 1
              });
              this.event(s, 'item_granted', {
                grantId: key,
                item: cmd.item
              });
            }
          } else if (cmd.type === 'swap' || cmd.type === 'use') {
            if (s.screen !== 'puzzle' || !s.board) return reject('WRONG_SCREEN');
            if (cmd.type === 'use') {
              if (!ITEMS.includes(cmd.item) || typeof cmd.id !== 'string' || !cmd.id || cmd.id.length > 160) return reject('INVALID_CONSUME');
              if (s.consumed.includes(cmd.id)) return reject('DUPLICATE_CONSUME');
              if (balance(s, cmd.item) < 1) return reject('NO_INVENTORY');
            }
            var result = act(s.board, cmd.type === 'swap' ? {
              kind: 'swap',
              a: cmd.a,
              b: cmd.b
            } : {
              kind: cmd.item,
              target: cmd.target
            });
            if (!result.ok) return reject(result.reason);
            if (cmd.type === 'use') {
              var grant = s.grants.find(function (g) {
                return g.item === cmd.item && g.remaining > 0;
              });
              grant.remaining--;
              s.consumed.push(cmd.id);
              this.event(s, 'item_used', {
                consumeId: cmd.id,
                grantId: grant.id,
                item: cmd.item,
                target: cmd.target
              });
            }
            s.board = result.board;
            frames = result.frames;
            reshuffled = result.reshuffled;
            this.event(s, cmd.type === 'swap' ? 'swap_committed' : 'booster_committed', cmd);
            if (s.board.status === 'won') {
              var level = this.levels[s.levelIndex];
              if (this.levels.slice(0, s.levelIndex).some(function (l) {
                return !s.completed.includes(l.id);
              })) return reject('MISSING_PREREQUISITE');
              if (!s.completed.includes(level.id)) {
                s.completed.push(level.id);
                this.event(s, 'level_completed', {
                  id: level.id,
                  rules: RULES
                });
                s.storyUnlocked.push(level.id);
                this.event(s, 'story_unlocked', {
                  id: level.id
                });
              }
              s.screen = 'story';
            }
          } else return reject('UNKNOWN_COMMAND');
          var commands = [].concat(this.commands, [cmd]);
          if (commands.length > 20000) return reject('LOCAL_JOURNAL_FULL');
          try {
            persist == null || persist(JSON.stringify({
              schema: 1,
              rules: RULES,
              levelsHash: digest(this.levels),
              commands: commands,
              stateHash: digest(s)
            }));
          } catch (_unused) {
            return reject('SAVE_FAILED');
          }
          this.state = s;
          this.commands = commands;
          return {
            ok: true,
            reason: '',
            frames: frames,
            reshuffled: reshuffled
          };
        };
        _proto.serialize = function serialize() {
          return JSON.stringify({
            schema: 1,
            rules: RULES,
            levelsHash: digest(this.levels),
            commands: this.commands,
            stateHash: digest(this.state)
          });
        };
        Session.restore = function restore(levels, raw) {
          if (raw.length > 5000000) throw new Error('SAVE_TOO_LARGE');
          var data = JSON.parse(raw);
          if (data.schema !== 1 || data.rules !== RULES || data.levelsHash !== digest(levels) || !Array.isArray(data.commands) || data.commands.length > 20000) throw new Error('INCOMPATIBLE_SAVE');
          var session = new Session(levels);
          for (var _iterator2 = _createForOfIteratorHelperLoose(data.commands), _step2; !(_step2 = _iterator2()).done;) {
            var cmd = _step2.value;
            var result = session.dispatch(cmd);
            if (!result.ok) throw new Error('INVALID_JOURNAL:' + result.reason);
          }
          if (digest(session.state) !== data.stateHash) throw new Error('SAVE_INTEGRITY');
          return session;
        };
        return Session;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/VoicePolicy.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('voiceResourceFor', voiceResourceFor);
      cclegacy._RF.push({}, "b6a04OcTSRLhJRr0SQiYe8P", "VoicePolicy", undefined);
      /** Explicit route manifests never fall back to a voice in another language. */
      function voiceResourceFor(shot, language) {
        if (!shot || !['es', 'pt', 'en', 'zh'].includes(language)) return null;
        if (shot.voice !== undefined) return shot.voice[language] || null;
        return "voice/" + shot.id + (language === 'es' ? '' : '-' + language);
      }
      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});