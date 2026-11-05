System.register("chunks:///_virtual/InlineAtmospherePlayer.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _inheritsLoose, cclegacy, _decorator, sys, VideoPlayer;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      sys = module.sys;
      VideoPlayer = module.VideoPlayer;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "dae7cbbl0xJiqHZVXAP/2Xe", "InlineAtmospherePlayer", undefined);
      var ccclass = _decorator.ccclass;
      var InlineAtmospherePlayer = exports('InlineAtmospherePlayer', (_dec = ccclass('InlineAtmospherePlayer'), _dec(_class = /*#__PURE__*/function (_VideoPlayer) {
        _inheritsLoose(InlineAtmospherePlayer, _VideoPlayer);
        function InlineAtmospherePlayer() {
          return _VideoPlayer.apply(this, arguments) || this;
        }
        var _proto = InlineAtmospherePlayer.prototype;
        _proto.syncSource = function syncSource() {
          _VideoPlayer.prototype.syncSource.call(this);
          // Cocos 3.8.8 calls exitFullscreen on inline metadata load even when no
          // fullscreen element exists. This player is always inline; contain that
          // engine-version workaround to this instance, never patch the document.
          if (sys.isBrowser && this._impl) this._impl.canFullScreen = function () {};
        };
        return InlineAtmospherePlayer;
      }(VideoPlayer)) || _class));
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Investigation.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports('pickFeature', pickFeature);
      cclegacy._RF.push({}, "1c206IKwoxCLr9YdS/1yeRG", "Investigation", undefined);
      var IDS = exports('IDS', ['box', 'photo', 'receipt']);
      var FEATURES = exports('FEATURES', {
        box: {
          structure: {
            x: 350,
            y: 623,
            label: "Impression in the velvet"
          },
          writing: {
            x: 360,
            y: 780,
            label: "Lettering on the base"
          },
          ornament: {
            x: 205,
            y: 530,
            label: "Ribbon knot"
          }
        },
        photo: {
          structure: {
            x: 352,
            y: 593,
            label: "Metal at the nape"
          },
          writing: {
            x: 380,
            y: 786,
            label: "Date on the photo"
          },
          ornament: {
            x: 209,
            y: 440,
            label: "Flower in her hair"
          }
        },
        receipt: {
          structure: {
            x: 391,
            y: 661,
            label: "Hand-drawn part"
          },
          writing: {
            x: 289,
            y: 786,
            label: "Collection signature"
          },
          ornament: {
            x: 224,
            y: 469,
            label: "Shop stamp"
          }
        }
      });
      function pickFeature(id, x, y) {
        var items = Object.entries(FEATURES[id]);
        var best = null,
          dist = 80;
        for (var _i = 0, _items = items; _i < _items.length; _i++) {
          var _items$_i = _items[_i],
            key = _items$_i[0],
            p = _items$_i[1];
          var d = Math.hypot(x - p.x, y - p.y);
          if (d < dist) {
            best = key;
            dist = d;
          }
        }
        return best;
      }
      var pairOf = exports('pairOf', function pairOf(a, b) {
        return [a, b].sort().join('-');
      });
      var expected = exports('expected', {
        'box-photo': 'different',
        'box-receipt': 'same',
        'photo-receipt': 'different'
      });
      var linkText = exports('linkText', {
        'box-photo': "Box × Photo: different shapes",
        'box-receipt': "Box × Slip: matching shapes",
        'photo-receipt': "Photo × Slip: different shapes"
      });
      var readyForInference = exports('readyForInference', function readyForInference(links) {
        return links.includes('photo-receipt') && links.length >= 2;
      });
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./InlineAtmospherePlayer.ts', './Investigation.ts', './Main.ts', './NativeExperience.ts', './Payoff.ts', './PayoffView.ts', './ReaderPosition.ts', './Reasoning.ts', './RenderPool.ts', './Story.ts'], function () {
  return {
    setters: [null, null, null, null, null, null, null, null, null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/Main.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Story.ts', './InlineAtmospherePlayer.ts', './Payoff.ts', './PayoffView.ts', './NativeExperience.ts', './RenderPool.ts', './ReaderPosition.ts', './Reasoning.ts', './Investigation.ts'], function (exports) {
  var _inheritsLoose, _extends, _createForOfIteratorHelperLoose, _asyncToGenerator, _regeneratorRuntime, cclegacy, _decorator, view, ResolutionPolicy, director, Node, Layers, Camera, Color, UITransform, Canvas, sys, profiler, game, Game, SpriteFrame, Rect, Sprite, Label, VideoPlayer, resources, VideoClip, Graphics, Director, Component, Texture2D, assetManager, JsonAsset, restore, addRecord, RECORDS, CLUES, record, selectNote, judge, theoryIssue, deduce, choose, relationLabel, FAULT_TEXT, proceed, review, EXHIBITS, repairClaim, submitPrivate, finish, requestOriginal, questionWitness, accuse, fresh, BRANCHES, InlineAtmospherePlayer, restorePayoff, canStartPayoff, payoffStage, advancePayoff, freshPayoff, renderPayoff, validTap, featureDescription, NativeExperience, RenderPool, readingPosition, ANCHORS, FACTS, LINKS, ALTERNATIVES, FEATURES, pickFeature, IDS, linkText;
  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
      _extends = module.extends;
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
      _asyncToGenerator = module.asyncToGenerator;
      _regeneratorRuntime = module.regeneratorRuntime;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      view = module.view;
      ResolutionPolicy = module.ResolutionPolicy;
      director = module.director;
      Node = module.Node;
      Layers = module.Layers;
      Camera = module.Camera;
      Color = module.Color;
      UITransform = module.UITransform;
      Canvas = module.Canvas;
      sys = module.sys;
      profiler = module.profiler;
      game = module.game;
      Game = module.Game;
      SpriteFrame = module.SpriteFrame;
      Rect = module.Rect;
      Sprite = module.Sprite;
      Label = module.Label;
      VideoPlayer = module.VideoPlayer;
      resources = module.resources;
      VideoClip = module.VideoClip;
      Graphics = module.Graphics;
      Director = module.Director;
      Component = module.Component;
      Texture2D = module.Texture2D;
      assetManager = module.assetManager;
      JsonAsset = module.JsonAsset;
    }, function (module) {
      restore = module.restore;
      addRecord = module.addRecord;
      RECORDS = module.RECORDS;
      CLUES = module.CLUES;
      record = module.record;
      selectNote = module.selectNote;
      judge = module.judge;
      theoryIssue = module.theoryIssue;
      deduce = module.deduce;
      choose = module.choose;
      relationLabel = module.relationLabel;
      FAULT_TEXT = module.FAULT_TEXT;
      proceed = module.proceed;
      review = module.review;
      EXHIBITS = module.EXHIBITS;
      repairClaim = module.repairClaim;
      submitPrivate = module.submitPrivate;
      finish = module.finish;
      requestOriginal = module.requestOriginal;
      questionWitness = module.questionWitness;
      accuse = module.accuse;
      fresh = module.fresh;
      BRANCHES = module.BRANCHES;
    }, function (module) {
      InlineAtmospherePlayer = module.InlineAtmospherePlayer;
    }, function (module) {
      restorePayoff = module.restorePayoff;
      canStartPayoff = module.canStartPayoff;
      payoffStage = module.payoffStage;
      advancePayoff = module.advancePayoff;
      freshPayoff = module.freshPayoff;
    }, function (module) {
      renderPayoff = module.renderPayoff;
    }, function (module) {
      validTap = module.validTap;
      featureDescription = module.featureDescription;
      NativeExperience = module.NativeExperience;
    }, function (module) {
      RenderPool = module.RenderPool;
    }, function (module) {
      readingPosition = module.readingPosition;
    }, function (module) {
      ANCHORS = module.ANCHORS;
      FACTS = module.FACTS;
      LINKS = module.LINKS;
      ALTERNATIVES = module.ALTERNATIVES;
    }, function (module) {
      FEATURES = module.FEATURES;
      pickFeature = module.pickFeature;
      IDS = module.IDS;
      linkText = module.linkText;
    }],
    execute: function () {
      var _dec, _class;
      cclegacy._RF.push({}, "00928e9ESJEO7PFi9zp62/+", "Main", undefined);
      var ccclass = _decorator.ccclass;
      var C = {
        bg: '#F4EEE5',
        ink: '#302838',
        muted: '#756C75',
        wine: '#70394F',
        rose: '#DFC1BD',
        paper: '#FFF9EF',
        gold: '#B58A54',
        teal: '#386B66',
        dark: '#352C40',
        line: '#D6CBC3'
      };
      var color = function color(s) {
        return new Color().fromHEX(s);
      };
      var KEY = 'seven-minutes-missing-v5';
      var PAYOFF_KEY = 'seven-minutes-missing-payoff-v1';
      // Opt in only after checking the surrounding layout; never enlarge dense rows blindly.
      // 100 design units = 44.44 CSS px at 320 px wide in the 720 px SHOW_ALL canvas.
      var TOUCH_SIZE = 100;
      var FORMAL_IMAGES = ['nina-portrait', 'dressing-room', 'maya-portrait', 'leo-portrait', 'theo-portrait', 'story-opening', 'story-private-alliance', 'story-public-boundary', 'story-evidence-challenge', 'story-repair', 'story-leo-reconsiders', 'story-theo-reconsiders', 'reaction-nina-withdrawn', 'reaction-leo-withdrawn', 'reaction-theo-withdrawn'];
      var WeddingChapter = exports('WeddingChapter', (_dec = ccclass('WeddingChapter'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(WeddingChapter, _Component);
        function WeddingChapter() {
          var _this;
          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }
          _this = _Component.call.apply(_Component, [this].concat(args)) || this;
          _this.experience = new NativeExperience();
          _this.renderPool = new RenderPool();
          _this.renderEpoch = 0;
          _this.accessibility = [];
          _this.actions = new Map();
          _this.activeDragNode = null;
          _this.activeDragTouch = null;
          _this.touchNodes = new Map();
          _this.pressed = false;
          _this.renderPending = false;
          _this.bridgeElapsed = 0;
          _this.settingsOpen = false;
          _this.nativeMetrics = {};
          _this.formalImages = {};
          _this.imageStatus = {};
          _this.sceneArt = null;
          _this.feedbackBeat = null;
          _this.relationshipArts = {};
          _this.media = {
            portrait: 'loading',
            room: 'loading',
            video: 'unavailable'
          };
          _this.atmosphereOpen = false;
          _this.atmospherePlayer = null;
          _this.atmosphereTimer = null;
          _this.indexOpen = false;
          _this.factOpen = null;
          _this.feedbackOpen = false;
          _this.accuseOpen = null;
          _this.root = void 0;
          _this.s = fresh();
          _this.selected = [];
          _this.detail = null;
          _this.payoff = freshPayoff();
          _this.payoffActive = false;
          _this.exhibitOpen = null;
          _this.witness = 'leo';
          _this.exhibit = null;
          _this.overlay = false;
          _this.clipOpen = false;
          _this.roomHint = false;
          _this.message = '';
          _this.resetOpen = false;
          _this.archiveFailed = false;
          _this.targets = [];
          _this.saveOk = true;
          _this.lens = {
            x: 230,
            y: 700
          };
          _this.pose = {
            x: 435,
            y: 650,
            angle: 90
          };
          _this.slots = [null, null];
          _this.drag = null;
          return _this;
        }
        var _proto = WeddingChapter.prototype;
        _proto.start = function start() {
          var _this2 = this;
          view.setDesignResolutionSize(720, 1280, ResolutionPolicy.SHOW_ALL);
          var scene = director.getScene();
          var cn = new Node('StoryCamera');
          cn.layer = Layers.Enum.UI_2D;
          scene.addChild(cn);
          cn.setPosition(0, 0, 1000);
          var cam = cn.addComponent(Camera);
          cam.projection = Camera.ProjectionType.ORTHO;
          cam.clearFlags = Camera.ClearFlag.SOLID_COLOR;
          cam.clearColor = color(C.dark);
          cam.visibility = Layers.Enum.UI_2D;
          cam.near = 1;
          cam.far = 2000;
          var canvas = new Node('StoryCanvas');
          canvas.layer = Layers.Enum.UI_2D;
          scene.addChild(canvas);
          canvas.addComponent(UITransform).setContentSize(720, 1280);
          canvas.addComponent(Canvas).cameraComponent = cam;
          this.root = new Node('Page');
          this.root.layer = Layers.Enum.UI_2D;
          canvas.addChild(this.root);
          try {
            this.s = restore(sys.localStorage.getItem(KEY));
            var saved = JSON.parse(sys.localStorage.getItem(PAYOFF_KEY) || 'null');
            if ((saved == null ? void 0 : saved.story) === JSON.stringify(this.s)) {
              this.payoff = restorePayoff(saved.payoff, this.s);
              this.payoffActive = !!saved.active && this.payoff.started && canStartPayoff(this.s);
            }
          } catch (_unused) {
            this.saveOk = false;
          }
          globalThis.__WEDDING__ = {
            snapshot: function snapshot() {
              return JSON.parse(JSON.stringify({
                build: 'chapter1-20261021-native13',
                rendering: _this2.renderPool.stats(),
                nativeViewport: _this2.nativeMetrics.viewport,
                experience: {
                  available: _this2.experience.available,
                  preferences: _this2.experience.preferences,
                  metrics: _this2.nativeMetrics
                },
                accessibility: _this2.accessibility.map(function (e) {
                  return {
                    id: e.id,
                    label: e.label,
                    button: e.button
                  };
                }),
                state: _this2.s,
                payoff: _this2.payoff,
                payoffActive: _this2.payoffActive,
                payoffStage: payoffStage(_this2.payoff),
                detail: _this2.detail,
                selected: _this2.selected,
                slots: _this2.slots,
                lens: _this2.lens,
                pose: _this2.pose,
                message: _this2.message,
                resetOpen: _this2.resetOpen,
                targets: _this2.targets,
                media: _this2.media,
                atmosphereOpen: _this2.atmosphereOpen,
                storyArt: {
                  scene: _this2.sceneArt,
                  feedback: _this2.feedbackOpen ? _this2.feedbackBeat : null,
                  relationships: _this2.relationshipArts,
                  loaded: _this2.imageStatus
                }
              }));
            }
          };
          this.witness = this.s.inquiry.witness;
          profiler.hideStats();
          game.on(Game.EVENT_HIDE, this.background, this);
          this.render();
          void this.loadFormalMedia();
        };
        _proto.mediaURL = function mediaURL(file) {
          return new URL('media/' + file, document.baseURI).href;
        };
        _proto.loadFormalMedia = /*#__PURE__*/function () {
          var _loadFormalMedia = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
            var _this3 = this;
            var files, _manifest$json, manifest, response, data, _loop, _i, _FORMAL_IMAGES;
            return _regeneratorRuntime().wrap(function _callee$(_context2) {
              while (1) switch (_context2.prev = _context2.next) {
                case 0:
                  // The build inventory includes only staged, reviewed assets; absence is valid.
                  files = [];
                  _context2.prev = 1;
                  if (!sys.isNative) {
                    _context2.next = 9;
                    break;
                  }
                  _context2.next = 5;
                  return new Promise(function (resolve, reject) {
                    return resources.load('media/media', JsonAsset, function (error, asset) {
                      return error ? reject(error) : resolve(asset);
                    });
                  });
                case 5:
                  manifest = _context2.sent;
                  if (Array.isArray((_manifest$json = manifest.json) == null ? void 0 : _manifest$json.files)) files = manifest.json.files;
                  _context2.next = 17;
                  break;
                case 9:
                  _context2.next = 11;
                  return fetch(this.mediaURL('media.json'));
                case 11:
                  response = _context2.sent;
                  if (!response.ok) {
                    _context2.next = 17;
                    break;
                  }
                  _context2.next = 15;
                  return response.json();
                case 15:
                  data = _context2.sent;
                  if (Array.isArray(data.files)) files = data.files;
                case 17:
                  _context2.next = 21;
                  break;
                case 19:
                  _context2.prev = 19;
                  _context2.t0 = _context2["catch"](1);
                case 21:
                  this.media.video = files.includes('wedding-atmosphere.mp4') ? 'available' : 'unavailable';
                  _loop = /*#__PURE__*/_regeneratorRuntime().mark(function _loop() {
                    var name, key, ready;
                    return _regeneratorRuntime().wrap(function _loop$(_context) {
                      while (1) switch (_context.prev = _context.next) {
                        case 0:
                          name = _FORMAL_IMAGES[_i];
                          key = name === 'nina-portrait' ? 'portrait' : name === 'dressing-room' ? 'room' : null;
                          _this3.imageStatus[name] = files.includes(name + '.png') ? 'loading' : 'unavailable';
                          if (files.includes(name + '.png')) {
                            _context.next = 6;
                            break;
                          }
                          if (key) _this3.media[key] = 'unavailable';
                          return _context.abrupt("return", 1);
                        case 6:
                          ready = function ready(error, texture) {
                            if (!_this3.isValid) return;
                            if (error || !texture) {
                              _this3.imageStatus[name] = 'unavailable';
                              if (key) _this3.media[key] = 'unavailable';
                              return;
                            }
                            if (sys.isNative) texture.addRef();
                            _this3.formalImages[name] = texture;
                            _this3.imageStatus[name] = 'ready';
                            if (key) _this3.media[key] = 'ready';
                            // Do not replace nodes in the middle of a gesture or a running atmosphere.
                            if (!_this3.atmosphereOpen) _this3.renderPending = true;
                          };
                          if (sys.isNative) resources.load('media/' + name + '/texture', Texture2D, function (error, texture) {
                            return ready(error, texture);
                          });else assetManager.loadRemote(_this3.mediaURL(name + '.png'), {
                            ext: '.png'
                          }, function (error, image) {
                            if (error || !image) {
                              ready(error || new Error('Missing image'));
                              return;
                            }
                            var texture = new Texture2D();
                            texture.image = image;
                            ready(null, texture);
                          });
                        case 8:
                        case "end":
                          return _context.stop();
                      }
                    }, _loop);
                  });
                  _i = 0, _FORMAL_IMAGES = FORMAL_IMAGES;
                case 24:
                  if (!(_i < _FORMAL_IMAGES.length)) {
                    _context2.next = 31;
                    break;
                  }
                  return _context2.delegateYield(_loop(), "t1", 26);
                case 26:
                  if (!_context2.t1) {
                    _context2.next = 28;
                    break;
                  }
                  return _context2.abrupt("continue", 28);
                case 28:
                  _i++;
                  _context2.next = 24;
                  break;
                case 31:
                  if (this.isValid && !this.atmosphereOpen) this.renderPending = true;
                case 32:
                case "end":
                  return _context2.stop();
              }
            }, _callee, this, [[1, 19]]);
          }));
          function loadFormalMedia() {
            return _loadFormalMedia.apply(this, arguments);
          }
          return loadFormalMedia;
        }();
        _proto.formalImage = function formalImage(name, x, y, w, h, cover) {
          if (cover === void 0) {
            cover = false;
          }
          var texture = this.formalImages[name];
          if (!texture) return false;
          var frame = new SpriteFrame();
          frame.texture = texture;
          if (cover) {
            var ratio = w / h,
              sourceRatio = texture.width / texture.height;
            var sw = sourceRatio > ratio ? texture.height * ratio : texture.width,
              sh = sourceRatio > ratio ? texture.height : texture.width / ratio;
            frame.rect = new Rect((texture.width - sw) / 2, (texture.height - sh) / 2, sw, sh);
          } else {
            var scale = Math.min(w / texture.width, h / texture.height);
            w = texture.width * scale;
            h = texture.height * scale;
          }
          var n = this.makeNode('Formal ' + name, x, y, w, h);
          var sprite = n.addComponent(Sprite);
          sprite.sizeMode = Sprite.SizeMode.CUSTOM;
          sprite.spriteFrame = frame;
          n.once(Node.EventType.NODE_DESTROYED, function () {
            return frame.destroy();
          });
          return true;
        };
        _proto.personFor = function personFor(w) {
          return w === 'photographer' ? 'theo' : w;
        };
        _proto.personName = function personName(p) {
          return p === 'theo' ? 'Theo' : p.charAt(0).toUpperCase() + p.slice(1);
        };
        _proto.relationshipImage = function relationshipImage(p) {
          var target = p === 'theo' ? 'photographer' : p;
          var withdrawn = p !== 'maya' && (this.s.inquiry.claims.includes(target) || p === 'nina' && this.s.repaired === false);
          return withdrawn ? 'reaction-' + p + '-withdrawn' : p + '-portrait';
        };
        _proto.storyFrame = function storyFrame(art, x, y, w, h, fallback) {
          if (fallback === void 0) {
            fallback = 'nina';
          }
          this.sceneArt = art;
          this.rect(x, y, w, h, C.rose, 12);
          // Story art contains faces and meaningful hand gestures; never center-crop it.
          if (!this.formalImage(art, x, y, w, h)) this.portrait(x, y - 35, fallback, Math.min(h / 270, w / 220));
        };
        _proto.showFeedback = function showFeedback(next, beat) {
          this.experience.cue('consequence');
          this.feedbackBeat = beat;
          this.feedbackOpen = true;
          this.commit(next);
        };
        _proto.withdrawalBeat = function withdrawalBeat(w) {
          var speaker = this.personFor(w);
          return {
            art: 'reaction-' + speaker + '-withdrawn',
            speaker: speaker,
            title: this.personName(speaker) + ' steps back',
            caption: 'Further questions with ' + this.personName(speaker) + ' are closed. Your existing findings remain.'
          };
        };
        _proto.stopAtmosphere = function stopAtmosphere() {
          if (this.atmosphereTimer !== null) {
            clearTimeout(this.atmosphereTimer);
            this.atmosphereTimer = null;
          }
          if (this.atmospherePlayer) {
            this.atmospherePlayer.stop();
            this.atmospherePlayer.enabled = false;
            this.atmospherePlayer = null;
            if (this.media.video === 'playing') this.media.video = 'available';
          }
        };
        _proto.atmosphereModal = function atmosphereModal() {
          var _this4 = this;
          this.clearInteractive();
          var block = this.rect(360, 640, 720, 1280, C.dark, 0);
          block.on(Node.EventType.TOUCH_END, function () {});
          this.text("Before the vows · Dressing room", 360, 182, 640, 70, 36, C.paper, true);
          this.text("Outside, the guests are waiting.", 360, 257, 640, 55, 24, C.paper);
          this.rect(360, 573, 620, 550, '#CADDD2');
          this.formalImage('dressing-room', 360, 573, 620, 550);
          var status = this.text("Loading. You can skip at any time.", 360, 905, 640, 60, 25, C.paper).getComponent(Label);
          var close = function close() {
            _this4.atmosphereOpen = false;
            _this4.stopAtmosphere();
            _this4.render();
          };
          this.button('close-atmosphere', "Close film", 360, 1000, 620, TOUCH_SIZE, close, true);
          this.button('skip-atmosphere', "Skip & investigate", 360, 1120, 620, TOUCH_SIZE, function () {
            _this4.atmosphereOpen = false;
            _this4.stopAtmosphere();
            _this4.go('room');
          });
          var n = this.makeNode('Wedding atmosphere video', 360, 573, 620, 550),
            player = n.addComponent(InlineAtmospherePlayer);
          this.atmospherePlayer = player;
          // The reviewed bundled film is 960 x 960; preserve its aspect ratio on JSB.
          if (sys.isNative) n.getComponent(UITransform).setContentSize(550, 550);
          // Cocos 3.8 keepAspectRatio resets UITransform to the source pixel size.
          // Fit explicitly so the native overlay never covers the close/skip controls.
          player.playOnAwake = false;
          player.mute = true;
          player.loop = false;
          player.keepAspectRatio = false;
          player.fullScreenOnAwake = false;
          var fail = function fail() {
            if (_this4.atmospherePlayer !== player) return;
            _this4.media.video = 'unavailable';
            _this4.stopAtmosphere();
            n.active = false;
            status.string = "The film is unavailable. The scene is still here.";
          };
          n.on(VideoPlayer.EventType.ERROR, fail);
          n.on(VideoPlayer.EventType.META_LOADED, function () {
            if (!sys.isBrowser) return;
            var video = player.nativeVideo;
            if (video && video.videoWidth && video.videoHeight) {
              var scale = Math.min(620 / video.videoWidth, 550 / video.videoHeight);
              n.getComponent(UITransform).setContentSize(video.videoWidth * scale, video.videoHeight * scale);
            }
          });
          n.on(VideoPlayer.EventType.PLAYING, function () {
            if (_this4.atmosphereTimer !== null) {
              clearTimeout(_this4.atmosphereTimer);
              _this4.atmosphereTimer = null;
            }
            _this4.media.video = 'playing';
            status.string = "Close or skip whenever you are ready.";
          });
          n.on(VideoPlayer.EventType.COMPLETED, function () {
            _this4.media.video = 'available';
            player.enabled = false;
            status.string = "The moment passes. Your investigation begins.";
          });
          n.on(VideoPlayer.EventType.READY_TO_PLAY, function () {
            if (_this4.atmospherePlayer === player) player.play();
          });
          if (sys.isNative) {
            player.resourceType = VideoPlayer.ResourceType.LOCAL;
            resources.load('media/wedding-atmosphere', VideoClip, function (error, clip) {
              if (!_this4.isValid || _this4.atmospherePlayer !== player) return;
              if (error || !clip) {
                fail();
                return;
              }
              player.clip = clip;
              // Stock iOS syncPlaybackRate can start silently; restart via the public API
              // so PLAYING is emitted and the loading timeout is cleared.
              player.pause();
              player.play();
            });
          } else {
            player.resourceType = VideoPlayer.ResourceType.REMOTE;
            player.remoteURL = this.mediaURL('wedding-atmosphere.mp4');
            var _native = player.nativeVideo;
            if (_native) {
              _native.playsInline = true;
              _native.muted = true;
              _native.controls = false;
              _native.style.pointerEvents = 'none';
            }
          }
          this.atmosphereTimer = setTimeout(fail, 12000);
        };
        _proto.onDestroy = function onDestroy() {
          this.cancelDragCapture();
          game.off(Game.EVENT_HIDE, this.background, this);
          this.stopAtmosphere();
          this.renderPool.destroy();
          for (var _i2 = 0, _Object$values = Object.values(this.formalImages); _i2 < _Object$values.length; _i2++) {
            var texture = _Object$values[_i2];
            if (sys.isNative) texture == null || texture.decRef();else texture == null || texture.destroy();
          }
        };
        _proto.clearInteractive = function clearInteractive() {
          this.targets = [];
          this.accessibility = [];
          this.actions.clear();
          this.touchNodes.clear();
        };
        _proto.releaseDragCapture = function releaseDragCapture() {
          var n = this.activeDragNode;
          this.activeDragNode = null;
          this.activeDragTouch = null;
          if (n) {
            n.active = false;
            n.removeFromParent();
            n.destroy();
          }
        };
        _proto.cancelDragCapture = function cancelDragCapture() {
          this.drag = null;
          this.releaseDragCapture();
        };
        _proto.background = function background() {
          this.pressed = false;
          this.cancelDragCapture();
          this.stopAtmosphere();
          this.renderPending = true;
        };
        _proto.update = function update(dt) {
          if (this.renderPending && !this.pressed && !this.atmosphereOpen) {
            this.renderPending = false;
            this.render();
          }
          if (!this.experience.enabled) return;
          this.bridgeElapsed += dt;
          if (this.bridgeElapsed < .1) return;
          this.bridgeElapsed = 0;
          var id = this.experience.drain()[0];
          if (id) {
            var fn = this.actions.get(id);
            if (fn) {
              this.cancelDragCapture();
              fn();
            }
          }
        };
        _proto.accessible = function accessible(id, label, x, y, w, h, fn, hint) {
          this.accessibility.push({
            id: id,
            label: label,
            x: x,
            y: y,
            w: w,
            h: h,
            button: !!fn,
            hint: hint
          });
          if (fn) this.actions.set(id, fn);
        };
        _proto.bindTap = function bindTap(n, id, x, y, w, h, fn) {
          var _this5 = this;
          var bounds = {
              x: x,
              y: y,
              w: w,
              h: h
            },
            epoch = this.renderEpoch;
          var start = null;
          var touchId = null;
          var activate = function activate() {
            if (_this5.renderEpoch !== epoch || _this5.touchNodes.get(id) !== n) return;
            _this5.cancelDragCapture();
            _this5.experience.cue('tap');
            fn();
          };
          this.actions.set(id, activate);
          this.touchNodes.set(id, n);
          n.on(Node.EventType.TOUCH_START, function (e) {
            if (touchId !== null) return;
            touchId = e.getID();
            var p = e.getUILocation();
            _this5.pressed = true;
            start = {
              x: p.x,
              y: 1280 - p.y
            };
          });
          n.on(Node.EventType.TOUCH_MOVE, function (e) {
            if (touchId !== e.getID()) return;
            var p = e.getUILocation();
            if (start && Math.hypot(p.x - start.x, 1280 - p.y - start.y) > 18) start = null;
          });
          n.on(Node.EventType.TOUCH_CANCEL, function (e) {
            if (touchId !== e.getID()) return;
            touchId = null;
            _this5.pressed = false;
            start = null;
          });
          n.on(Node.EventType.TOUCH_END, function (e) {
            if (touchId !== e.getID()) return;
            touchId = null;
            var p = e.getUILocation(),
              target = _this5.targets.find(function (t) {
                return t.id === id;
              }) || bounds;
            var ok = validTap(start, {
              x: p.x,
              y: 1280 - p.y
            }, target);
            _this5.pressed = false;
            start = null;
            if (ok) activate();
          });
        };
        _proto.hit = function hit(id, x, y, w, h, fn) {
          var n = this.makeNode(id, x, y, w, h);
          this.targets.push({
            id: id,
            x: x,
            y: y,
            w: w,
            h: h
          });
          this.bindTap(n, id, x, y, w, h, fn);
          return n;
        };
        _proto.draggable = function draggable(id, kind, x, y, w, h, clue) {
          var _this6 = this;
          var n = this.makeNode(id, x, y, w, h);
          this.targets.push({
            id: id,
            x: x,
            y: y,
            w: w,
            h: h
          });
          n.on(Node.EventType.TOUCH_START, function (e) {
            if (!_this6.resetOpen && !_this6.drag) {
              _this6.activeDragTouch = e.getID();
              _this6.drag = {
                kind: kind,
                x: x,
                y: y,
                startY: y,
                id: clue
              };
              _this6.activeDragNode = n;
              n.setParent(_this6.root.parent);
              n.getComponent(UITransform).setContentSize(3000, 3000);
            }
          }, this);
          n.on(Node.EventType.TOUCH_MOVE, function (e) {
            if (_this6.activeDragNode === n && _this6.activeDragTouch === e.getID()) _this6.dragMove(e);
          }, this);
          n.on(Node.EventType.TOUCH_END, function (e) {
            if (_this6.activeDragNode !== n || _this6.activeDragTouch !== e.getID()) return;
            _this6.releaseDragCapture();
            _this6.dragEnd();
          }, this);
          n.on(Node.EventType.TOUCH_CANCEL, function (e) {
            if (_this6.activeDragNode !== n || _this6.activeDragTouch !== e.getID()) return;
            _this6.releaseDragCapture();
            _this6.dragCancel();
          }, this);
        };
        _proto.dragMove = function dragMove(e) {
          var d = this.drag;
          if (!d || this.resetOpen) return;
          var v = e.getUIDelta();
          d.x += v.x;
          d.y -= v.y;
          if (d.kind === 'lens') {
            this.lens = {
              x: Math.max(140, Math.min(580, d.x)),
              y: Math.max(410, Math.min(820, d.y))
            };
          }
          if (d.kind === 'align') {
            this.pose.x = Math.max(165, Math.min(555, d.x));
            this.pose.y = Math.max(450, Math.min(790, d.y));
          }
          if (d.kind === 'rotate') this.pose.angle = Math.atan2(d.y - this.pose.y, d.x - this.pose.x) * 180 / Math.PI + 90;
          this.renderPending = true;
        };
        _proto.dragCancel = function dragCancel() {
          this.drag = null;
          this.render();
        };
        _proto.dragEnd = function dragEnd() {
          var d = this.drag;
          if (!d) return;
          this.drag = null;
          if (d.kind === 'timeline-card' && d.id) {
            if (Math.abs(d.x - 200) < 700 && (Math.abs(d.y - d.startY) < 25 || d.y > 600 && d.y < 770)) this.commit(addRecord(this.s, d.id));else this.render();
            return;
          }
          if (d.kind === 'coat' && Math.abs(d.x - 463) > 75) {
            this.experience.cue('observe');
            this.commit(_extends({}, this.s, {
              coatMoved: true
            }));
            return;
          }
          if (d.kind === 'cover' && d.startY - d.y > 110 && this.detail) {
            this.commit(_extends({}, this.s, {
              opened: [].concat(this.s.opened, [this.detail])
            }));
            return;
          }
          if (d.kind === 'card' && d.id && d.y > 700 && d.y < 935) {
            var slot = d.x < 360 ? 0 : 1;
            this.slots = this.slots.map(function (v) {
              return v === d.id ? null : v;
            });
            this.slots[slot] = d.id;
            this.message = '';
          }
          if (d.kind === 'coat') this.message = "A corner of paper is trapped under the jacket. Drag the jacket sideways.";
          if (d.kind === 'cover' && d.startY - d.y <= 110) this.message = "Hold the cover and drag it upward to reveal what is underneath.";
          this.render();
        };
        _proto.makeNode = function makeNode(name, x, y, w, h) {
          var n = new Node(name);
          n.layer = Layers.Enum.UI_2D;
          this.root.addChild(n);
          n.setPosition(x - 360, 640 - y);
          n.addComponent(UITransform).setContentSize(w, h);
          return n;
        };
        _proto.rect = function rect(x, y, w, h, fill, r) {
          if (r === void 0) {
            r = 16;
          }
          return this.renderPool.shape(this.root, 'Panel', x, y, w, h, "rect:" + w + ":" + h + ":" + fill + ":" + r, function (g) {
            g.fillColor = color(fill);
            g.roundRect(-w / 2, -h / 2, w, h, r);
            g.fill();
          });
        };
        _proto.text = function text(t, x, y, w, h, size, fill, bold) {
          if (w === void 0) {
            w = 600;
          }
          if (h === void 0) {
            h = 60;
          }
          if (size === void 0) {
            size = 28;
          }
          if (fill === void 0) {
            fill = C.ink;
          }
          if (bold === void 0) {
            bold = false;
          }
          this.accessible('text-' + this.accessibility.length, t, x, y, w, h);
          var n = this.renderPool.text(this.root, x, y, w, h);
          var l = n.getComponent(Label);
          l.string = t;
          l.fontFamily = 'Arial';
          l.useSystemFont = true;
          l.fontSize = size;
          l.lineHeight = size * 1.25;
          l.enableWrapText = true;
          l.color = color(fill);
          l.isBold = bold;
          l.horizontalAlign = Label.HorizontalAlign.CENTER;
          l.verticalAlign = Label.VerticalAlign.CENTER;
          l.overflow = Label.Overflow.SHRINK;
          return n;
        };
        _proto.line = function line(x1, y1, x2, y2, fill, width) {
          if (fill === void 0) {
            fill = C.line;
          }
          if (width === void 0) {
            width = 3;
          }
          this.renderPool.shape(this.root, 'Line', 0, 0, 720, 1280, "line:" + x1 + ":" + y1 + ":" + x2 + ":" + y2 + ":" + fill + ":" + width, function (g) {
            g.strokeColor = color(fill);
            g.lineWidth = width;
            g.moveTo(x1, -y1);
            g.lineTo(x2, -y2);
            g.stroke();
          });
        };
        _proto.circle = function circle(x, y, r, fill) {
          this.renderPool.shape(this.root, 'Circle', x, y, r * 2, r * 2, "circle:" + r + ":" + fill, function (g) {
            g.fillColor = color(fill);
            g.circle(0, 0, r);
            g.fill();
          });
        };
        _proto.ring = function ring(x, y, r, fill, width) {
          if (fill === void 0) {
            fill = C.gold;
          }
          if (width === void 0) {
            width = 7;
          }
          this.renderPool.shape(this.root, 'Ring', x, y, r * 2, r * 2, "ring:" + r + ":" + fill + ":" + width, function (g) {
            g.strokeColor = color(fill);
            g.lineWidth = width;
            g.circle(0, 0, r);
            g.stroke();
          });
        };
        _proto.button = function button(id, label, x, y, w, h, fn, secondary, enabled) {
          if (secondary === void 0) {
            secondary = false;
          }
          if (enabled === void 0) {
            enabled = true;
          }
          var n = this.rect(x, y, w, h, enabled ? secondary ? C.paper : C.wine : C.line, 14);
          n.name = id;
          this.text(label, x, y, w - 18, h, 27, enabled ? secondary ? C.wine : C.paper : C.muted, true);
          if (enabled) {
            this.targets.push({
              id: id,
              x: x,
              y: y,
              w: w,
              h: h
            });
            this.bindTap(n, id, x, y, w, h, fn);
          }
        };
        _proto.savePayoff = function savePayoff() {
          try {
            sys.localStorage.setItem(PAYOFF_KEY, JSON.stringify({
              story: JSON.stringify(this.s),
              active: this.payoffActive,
              payoff: this.payoff
            }));
          } catch (_unused3) {
            this.saveOk = false;
          }
        };
        _proto.commit = function commit(s) {
          this.s = s;
          try {
            sys.localStorage.setItem(KEY, JSON.stringify(s));
          } catch (_unused4) {
            this.saveOk = false;
          }
          this.savePayoff();
          this.render();
        };
        _proto.payoffAction = function payoffAction(action) {
          var old = this.payoff;
          this.payoff = advancePayoff(this.payoff, this.s, action);
          if (old !== this.payoff) this.experience.cue(action.type === 'verify' && this.payoff.verified ? 'verify' : action.type === 'entrance' ? 'entrance' : action.type === 'portrait' ? 'portrait' : 'observe');
          this.savePayoff();
          this.render();
        };
        _proto.enterPayoff = function enterPayoff() {
          this.payoff = advancePayoff(this.payoff, this.s, {
            type: 'start'
          });
          this.payoffActive = this.payoff.started;
          this.feedbackOpen = false;
          this.indexOpen = false;
          this.factOpen = null;
          this.exhibitOpen = null;
          this.clipOpen = false;
          this.savePayoff();
          this.render();
        };
        _proto.payoffPage = function payoffPage() {
          var _this7 = this;
          renderPayoff({
            rect: this.rect.bind(this),
            line: this.line.bind(this),
            hit: this.hit.bind(this),
            text: function text() {
              var n = _this7.text.apply(_this7, arguments);
              n.getComponent(Label).overflow = Label.Overflow.CLAMP;
              return n;
            },
            portrait: function portrait(x, y, person, scale) {
              return _this7.portrait(x, y, person, scale);
            }
          }, this.payoff, this.s, function (action) {
            return _this7.payoffAction(action);
          }, function () {
            _this7.payoffActive = false;
            _this7.savePayoff();
            _this7.render();
          });
          if (!this.saveOk) this.text("Progress could not be saved on this device.", 360, 1252, 640, 35, 23, C.wine, true);
        };
        _proto.go = function go(screen) {
          this.message = '';
          this.selected = [];
          this.slots = [null, null];
          this.cancelDragCapture();
          this.commit(_extends({}, this.s, {
            screen: screen
          }));
        };
        _proto.header = function header(kicker, title, sub) {
          var _this8 = this;
          this.rect(360, 640, 720, 1280, C.bg, 0);
          this.text('SEVEN MINUTES MISSING', 350, 55, 420, 36, 18, C.muted);
          if (this.experience.enabled) this.button('experience-settings', 'Aa / ♪', 62, 57, 100, 100, function () {
            _this8.settingsOpen = true;
            _this8.render();
          }, true);
          this.button('reset', "Reset", 635, 57, TOUCH_SIZE, TOUCH_SIZE, function () {
            _this8.resetOpen = true;
            _this8.render();
          }, true);
          this.text(kicker, 360, 120, 630, 42, 21, C.wine, true);
          this.text(title, 360, 180, 640, 75, 42, C.ink, true);
          this.text(sub, 360, 242, 630, 64, 24, C.muted);
          if (['public', 'room', 'ending', 'board', 'compare', 'deduction'].includes(this.s.screen)) return;
          var stages = ["Search", "Compare", "Approach", "Response"];
          var idx = this.s.screen === 'intro' ? 0 : ['room'].includes(this.s.screen) ? 0 : ['board', 'compare', 'deduction'].includes(this.s.screen) ? 1 : ['choice'].includes(this.s.screen) ? 2 : 3;
          stages.forEach(function (t, i) {
            _this8.rect(108 + i * 168, 1197, 146, 42, i === idx ? C.wine : C.line, 21);
            _this8.text(t, 108 + i * 168, 1197, 140, 40, 21, i === idx ? C.paper : C.muted);
          });
          this.text(this.saveOk ? "Chapter 1 prototype · Saved on this device" : "Chapter 1 prototype · Progress could not be saved", 360, 1252, 620, 32, 17, C.muted);
        };
        _proto.portrait = function portrait(x, y, kind, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          if (this.formalImage(kind + '-portrait', x, y + 40 * scale, 190 * scale, 270 * scale)) return;
          var hair = kind === 'nina' ? C.ink : kind === 'leo' ? '#4B3E37' : '#8B665A';
          this.circle(x, y, 77 * scale, hair);
          this.rect(x, y + 111 * scale, 157 * scale, 133 * scale, kind === 'nina' ? C.teal : kind === 'leo' ? C.dark : C.paper, 40 * scale);
          this.circle(x, y + 8 * scale, 56 * scale, '#D9AD99');
          this.rect(x, y - 35 * scale, 117 * scale, 54 * scale, hair, 24 * scale);
          this.circle(x - 19 * scale, y + 8 * scale, 3 * scale, C.ink);
          this.circle(x + 19 * scale, y + 8 * scale, 3 * scale, C.ink);
          this.line(x - 10 * scale, y + 35 * scale, x + 10 * scale, y + 35 * scale, C.wine, 3);
        };
        _proto.clasp = function clasp(x, y, _double, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          if (_double) {
            this.ring(x - 23 * scale, y, 25 * scale, C.gold, 8 * scale);
            this.ring(x + 23 * scale, y, 25 * scale, C.gold, 8 * scale);
          } else {
            var _n = this.makeNode('Hook', x, y, 100, 100);
            var g = _n.addComponent(Graphics);
            g.lineWidth = 8 * scale;
            g.strokeColor = color(C.gold);
            g.arc(0, 0, 30 * scale, -Math.PI * .7, Math.PI * .65, false);
            g.stroke();
            this.line(x - 22 * scale, y + 21 * scale, x + 6 * scale, y - 9 * scale, C.gold, 8 * scale);
          }
        };
        _proto.art = function art(id, x, y, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          if (id === 'box') {
            this.rect(x, y - 42 * scale, 200 * scale, 97 * scale, C.wine, 14);
            this.rect(x, y + 32 * scale, 210 * scale, 95 * scale, C.dark, 12);
            this.clasp(x, y + 30 * scale, false, .55 * scale);
          }
          if (id === 'photo') {
            this.rect(x, y, 190 * scale, 192 * scale, C.gold, 4);
            this.rect(x, y, 172 * scale, 174 * scale, C.paper, 2);
            this.circle(x, y - 28 * scale, 33 * scale, C.rose);
            this.rect(x, y + 29 * scale, 88 * scale, 70 * scale, '#DDD3C6', 12);
            this.clasp(x, y + 43 * scale, true, .55 * scale);
          }
          if (id === 'receipt') {
            this.rect(x, y, 174 * scale, 205 * scale, C.paper, 2);
            this.text("PROP REPAIR", x, y - 59 * scale, 170 * scale, 40 * scale, 21 * scale, C.wine, true);
            this.line(x - 57 * scale, y - 23 * scale, x + 57 * scale, y - 23 * scale, C.line, 3);
            this.clasp(x, y + 16 * scale, false, .55 * scale);
            this.text('NINA', x, y + 69 * scale, 150 * scale, 30 * scale, 18 * scale, C.muted);
          }
        };
        _proto.render = function render() {
          var _this9 = this,
            _this$drag;
          this.renderEpoch++;
          this.renderPending = false;
          if (this.resetOpen || this.settingsOpen) this.cancelDragCapture();
          this.stopAtmosphere();
          this.sceneArt = null;
          this.relationshipArts = {};
          if (this.s.screen !== 'intro') this.atmosphereOpen = false;
          for (var _i3 = 0, _arr = [].concat(this.root.children); _i3 < _arr.length; _i3++) {
            var _n2 = _arr[_i3];
            if (!this.renderPool.owns(_n2)) {
              _n2.removeFromParent();
              _n2.destroy();
            }
          }
          this.renderPool.begin();
          this.clearInteractive();
          if (this.payoffActive) {
            this.payoffPage();
            if (this.experience.enabled) this.button('experience-settings', 'Aa / ♪', 650, 65, 100, 100, function () {
              _this9.settingsOpen = true;
              _this9.render();
            }, true);
            if (this.settingsOpen) this.settingsModal();
            this.finishAccessibility();
            return;
          }
          switch (this.s.screen) {
            case 'intro':
              this.intro();
              break;
            case 'room':
              this.room();
              break;
            case 'board':
              this.board();
              break;
            case 'compare':
              this.compareBench();
              break;
            case 'deduction':
              this.deduction();
              break;
            case 'repair':
              this.repairPage();
              break;
            case 'private':
              this.privatePage();
              break;
            case 'public':
              this.publicPage();
              break;
            case 'choice':
              this.choice();
              break;
            case 'response':
              this.response();
              break;
            case 'ending':
              this.ending();
              break;
          }
          if (((_this$drag = this.drag) == null ? void 0 : _this$drag.kind) === 'timeline-card') {
            var r = RECORDS.find(function (r) {
              return r.id === _this9.drag.id;
            });
            if (r) {
              this.rect(this.drag.x, this.drag.y, 250, 90, C.wine);
              this.text(r.time, this.drag.x, this.drag.y, 230, 70, 30, C.paper, true);
            }
          }
          if (this.detail) this.showDetail();
          if (this.clipOpen) this.clip();
          if (this.exhibitOpen) this.exhibitModal();
          if (this.indexOpen) this.indexModal();
          if (this.factOpen) this.factModal();
          if (this.feedbackOpen) this.feedbackModal();
          if (this.accuseOpen) this.accuseModal();
          if (this.atmosphereOpen) this.atmosphereModal();
          if (this.resetOpen) this.showReset();
          if (this.settingsOpen) this.settingsModal();
          this.finishAccessibility();
        };
        _proto.settingsModal = function settingsModal() {
          var _this10 = this;
          this.clearInteractive();
          this.rect(360, 640, 720, 1280, C.bg, 0);
          this.text('READING & FEEDBACK', 360, 150, 630, 70, 36, C.wine, true);
          this.text('Read scene uses your iPhone text size.\nEvery sound also has a visible response.', 360, 288, 620, 140, 30, C.ink);
          this.button('settings-read', 'Read the current scene', 360, 460, 620, 104, function () {
            _this10.settingsOpen = false;
            _this10.render();
            _this10.experience.reader(_this10.accessibility);
          });
          var p = this.experience.preferences;
          this.button('settings-sound', 'Sound · ' + (p.sound ? 'On' : 'Off'), 360, 610, 620, 104, function () {
            _this10.experience.settings({
              sound: !p.sound
            });
            _this10.render();
          }, true);
          this.button('settings-haptics', 'Haptics · ' + (p.haptics ? 'On' : 'Off'), 360, 750, 620, 104, function () {
            _this10.experience.settings({
              haptics: !p.haptics
            });
            _this10.render();
          }, true);
          this.text('The silent switch is respected. Audio stops when you leave the game. No speech or sound is required to solve a case.', 360, 924, 620, 175, 28, C.muted);
          this.button('settings-close', 'Return to the scene', 360, 1110, 620, 104, function () {
            _this10.settingsOpen = false;
            _this10.render();
          });
        };
        _proto.finishAccessibility = function finishAccessibility() {
          var _this11 = this;
          if (this.experience.enabled && !this.settingsOpen && !this.targets.some(function (t) {
            return t.id === 'experience-settings';
          })) this.button('experience-settings', 'Aa / ♪', 650, 57, 100, 100, function () {
            _this11.settingsOpen = true;
            _this11.render();
          }, true);
          var texts = this.accessibility.slice();
          var names = {
            'experience-settings': 'Reading and feedback settings',
            'object-box': 'Inspect the ribboned box',
            'object-photo': 'Inspect the framed photo',
            'object-receipt': 'Inspect the paper on the chair',
            invitation: 'Inspect the folded invitation',
            lipstick: 'Inspect the lipstick',
            'paper-edge': 'Inspect the paper edge under the jacket',
            coat: 'Move the jacket aside',
            cover: 'Lift the cover',
            lens: 'Magnifier',
            align: 'Move comparison overlay',
            rotate: 'Rotate comparison overlay',
            'payoff-door-direct': 'Open the wardrobe door',
            'payoff-pouch-direct': 'Untie the opaque pouch',
            'payoff-zip-direct': 'Zip: drag right, or use Slide the zip open',
            'payoff-scrubber': 'Frame scrubber: drag horizontally, or use Previous and Next'
          };
          var extra = {};
          var modal = !!(this.detail || this.clipOpen || this.exhibitOpen || this.indexOpen || this.factOpen || this.feedbackOpen || this.accuseOpen || this.atmosphereOpen || this.resetOpen || this.settingsOpen);
          if (!modal && this.s.screen === 'private' && this.s.inquiry.page === 0) {
            for (var _iterator = _createForOfIteratorHelperLoose(ANCHORS), _step; !(_step = _iterator()).done;) {
              var a = _step.value;
              var description = a.id === 'r' ? 'Both images show two hands meeting around a box marked B17.' : a.id === 's' ? 'Left: an unoccupied lamp stand. Right: a person reaching toward the lamp.' : 'Both images show a person reaching toward the lamp.';
              extra['anchor-' + a.id] = a.device + ' device; ' + a.wall + ' venue. ' + description;
            }
          }
          if (this.detail && !this.settingsOpen && !this.resetOpen && this.s.opened.includes(this.detail)) {
            var clue = this.detail;
            ['structure', 'writing', 'ornament'].forEach(function (f) {
              var p = FEATURES[clue][f];
              _this11.accessible('inspect-' + f, 'Inspect ' + (p.y > 750 ? 'lower' : p.y < 550 ? 'upper' : 'middle') + ' detail', p.x, p.y, 100, 100, function () {
                _this11.lens = {
                  x: p.x,
                  y: p.y
                };
                _this11.message = '';
                _this11.render();
              });
            });
            var f = pickFeature(clue, this.lens.x, this.lens.y);
            if (f) this.accessible('focused-detail', featureDescription(clue, f), 360, 300, 590, 130);
          }
          if (!modal && !this.payoffActive) {
            if (this.s.screen === 'board') {
              for (var _iterator2 = _createForOfIteratorHelperLoose(IDS), _step2; !(_step2 = _iterator2()).done;) {
                var id = _step2.value;
                var _f = this.s.notes[id];
                if (_f) {
                  extra['card-' + id] = CLUES[id].name + ' note';
                  this.accessible('note-description-' + id, CLUES[id].name + '. ' + featureDescription(id, _f), 138 + IDS.indexOf(id) * 222, 421, 200, 180);
                }
              }
            }
            if (this.s.screen === 'compare') this.selected.forEach(function (id, i) {
              return _this11.accessible('comparison-description-' + id, CLUES[id].name + '. ' + featureDescription(id, _this11.s.notes[id]), 195 + i * 330, 548, 290, 280);
            });
          }
          if (!this.settingsOpen && !this.resetOpen && (this.clipOpen || this.exhibitOpen === 'frames')) this.accessible('visible-frame-sequence', 'Frame one: Leo holds a closed box; Nina’s hand is apart. Frame two: both touch the box. Frame three: Nina holds it and Leo’s hand is apart. The lid stays shut in every frame.', 360, 580, 620, 430);
          if (!this.settingsOpen && !this.resetOpen && this.exhibitOpen === 'contours') {
            for (var _iterator3 = _createForOfIteratorHelperLoose(IDS), _step3; !(_step3 = _iterator3()).done;) {
              var _id = _step3.value;
              this.accessible('contour-' + _id, CLUES[_id].name + '. ' + featureDescription(_id, 'structure'), 145 + IDS.indexOf(_id) * 215, 493, 210, 200);
            }
          }
          if (this.payoffActive && !this.settingsOpen) this.payoffDescriptions(extra);
          // Enlarge only nonoverlapping controls. Dense lists are laid out explicitly.
          var _loop2 = function _loop2() {
            var t = _step4.value;
            var w = Math.max(t.w, 100),
              h = Math.max(t.h, 86);
            var overlaps = _this11.targets.some(function (o) {
              return o !== t && Math.abs(o.x - t.x) < (o.w + w) / 2 && Math.abs(o.y - t.y) < (o.h + h) / 2;
            });
            if (!overlaps) {
              var _this11$touchNodes$ge;
              t.w = w;
              t.h = h;
              (_this11$touchNodes$ge = _this11.touchNodes.get(t.id)) == null || (_this11$touchNodes$ge = _this11$touchNodes$ge.getComponent(UITransform)) == null || _this11$touchNodes$ge.setContentSize(w, h);
            }
          };
          for (var _iterator4 = _createForOfIteratorHelperLoose(this.targets), _step4; !(_step4 = _iterator4()).done;) {
            _loop2();
          }
          var _loop3 = function _loop3() {
            var t = _step5.value;
            var closest = texts.filter(function (e) {
              return Math.abs(e.x - t.x) < Math.max(8, t.w * .35) && Math.abs(e.y - t.y) < Math.max(10, t.h * .35);
            }).sort(function (a, b) {
              return Math.abs(a.y - t.y) + Math.abs(a.x - t.x) - Math.abs(b.y - t.y) - Math.abs(b.x - t.x);
            })[0];
            var label = extra[t.id] || names[t.id] || (closest == null ? void 0 : closest.label) || t.id.replace(/-/g, ' ');
            var fn = _this11.actions.get(t.id);
            if (t.id === 'coat') fn = function fn() {
              _this11.experience.cue('observe');
              _this11.commit(_extends({}, _this11.s, {
                coatMoved: true
              }));
            };
            if (t.id === 'cover') fn = function fn() {
              if (_this11.detail && !_this11.s.opened.includes(_this11.detail)) _this11.commit(_extends({}, _this11.s, {
                opened: [].concat(_this11.s.opened, [_this11.detail])
              }));
            };
            if (t.id === 'lens' || t.id === 'align' || t.id === 'rotate' || t.id === 'payoff-scrubber' || t.id === 'payoff-zip-direct' || t.id.startsWith('card-') || t.id.startsWith('timeline-card')) fn = undefined;
            _this11.accessibility = _this11.accessibility.filter(function (e) {
              return e.id !== (closest == null ? void 0 : closest.id) || extra[t.id] !== undefined || names[t.id] !== undefined;
            });
            _this11.accessible(t.id, label, t.x, t.y, t.w, t.h, fn);
          };
          for (var _iterator5 = _createForOfIteratorHelperLoose(this.targets), _step5; !(_step5 = _iterator5()).done;) {
            _loop3();
          }
          this.accessibility.sort(function (a, b) {
            return a.y - b.y || a.x - b.x;
          });
          this.renderPool.end();
          if (this.experience.enabled) {
            var reading = readingPosition({
              state: this.s,
              payoff: this.payoff,
              payoffActive: this.payoffActive,
              settingsOpen: this.settingsOpen,
              resetOpen: this.resetOpen,
              atmosphereOpen: this.atmosphereOpen,
              accuseOpen: this.accuseOpen,
              feedbackOpen: this.feedbackOpen,
              feedbackBeat: this.feedbackBeat,
              factOpen: this.factOpen,
              indexOpen: this.indexOpen,
              exhibitOpen: this.exhibitOpen,
              clipOpen: this.clipOpen,
              detail: this.detail,
              detailFeature: this.detail ? pickFeature(this.detail, this.lens.x, this.lens.y) : null,
              witness: this.witness,
              selected: this.selected
            });
            this.nativeMetrics = this.experience.metrics();
            this.experience.sync(this.settingsOpen ? 'settings' : this.payoffActive ? 'payoff-' + payoffStage(this.payoff) : this.s.screen + (modal ? '-modal' : ''), this.accessibility, this.nativeMetrics.diagnosticsEnabled ? globalThis.__WEDDING__.snapshot() : undefined, reading);
          }
        };
        _proto.payoffDescriptions = function payoffDescriptions(labels) {
          var _this12 = this;
          var p = this.payoff,
            stage = payoffStage(p);
          var describe = function describe(id, t) {
            return _this12.accessible(id, t, 360, 490, 620, 350);
          };
          var room = function room(f, mirrored) {
            var layout = mirrored ? 'From left to right in the reflection: a glass-front cabinet, a high shelf with rigid luggage, an open low basket.' : 'From left to right: an open low basket, a high shelf with rigid luggage, a glass-front cabinet.';
            return layout + (f <= 2 ? ' A light stand obscures part of the scene.' : '') + (f >= 2 && f <= 6 ? ' A soft green garment cover hangs behind the glass.' : ' No garment cover is visible in this frame.') + (f === 4 || f === 5 ? ' A dark pocket is open and a rose-colored pouch is visible.' : ' No open pocket is visible.') + (f >= 3 && f <= 6 ? mirrored ? ' A diagonal seam and three short stitches slope down to the left.' : ' A diagonal seam and three short stitches slope down to the right.' : '');
          };
          var packing = 'Packing photograph: a green garment cover with an open dark pocket and a rose-colored pouch. A diagonal seam and three short stitches slope down to the right. Beside it is a pendant, with two closed rings and E + M above 1994 in two straight rows.';
          if (stage === 'lead') describe('packing-description', packing);
          if (stage === 'workbench') {
            if (p.view === 'frames') describe('source-description', 'Frame ' + p.frame + '. ' + room(p.frame, true));
            if (p.view === 'compare') {
              var _p$pin;
              describe('pinned-description', 'Pinned frame ' + p.pin + '. ' + room((_p$pin = p.pin) != null ? _p$pin : 0, !p.mirrored));
              this.accessible('packing-description', packing, 523, 530, 285, 305);
            }
            if (p.view === 'locations' && !p.lastPlace) describe('room-description', room(3, false));
          }
          if (stage === 'object') {
            if (p.objectView === 'inspect') {
              labels['payoff-clasp-direct'] = 'Inspect the clasp';
              labels['payoff-pendant-direct'] = p.back ? 'Turn to the front' : 'Turn the pendant over';
            }
            if (p.objectView === 'inspect') describe('object-description', p.back ? 'Back of the recovered pendant: E + M over 1994 in two straight rows.' : 'Front of the recovered pendant: two closed ring outlines above a green circular face and a pale cross. The engraving is on the other side.');
            if (p.objectView === 'clasp') describe('clasp-originals', 'Left, packing photo: two separate closed rings. Right, recovered object: two separate closed rings.');
            if (p.objectView === 'engraving') describe('engraving-originals', 'Left, packing photo: E + M above 1994, two straight rows. Right, recovered object: E + M above 1994, two straight rows.');
            for (var i = 0; i < 3; i++) {
              labels['payoff-match-clasp-' + i] = ['A. One closed ring', 'B. Two separate closed rings', 'C. An open hook'][i];
              labels['payoff-match-engraving-' + i] = ['A. E + M above 1994 in straight rows', 'B. E + M above four digits curved in an arc', 'C. E + M and 1994 in a single row'][i];
            }
          }
        };
        _proto.intro = function intro() {
          var _this13 = this;
          this.header("CHAPTER 1 / THE EMPTY BOX", "Seven Minutes Missing", "You are Maya. Your wedding starts in ten minutes.");
          this.storyFrame('story-opening', 360, 480, 640, 360, 'maya');
          this.rect(360, 695, 580, 58, C.wine, 12);
          this.text("One anonymous message changes everything.", 360, 695, 570, 50, 25, C.paper);
          this.rect(360, 867, 640, 236, C.paper);
          this.text("UNKNOWN SENDER", 360, 785, 580, 40, 21, C.wine, true);
          this.text("“Look what the person you trust most took.”\n\nIn the clip, Leo hands Nina a jewelry box.\nYour family necklace is missing.", 360, 884, 588, 177, 28);
          if (this.media.video !== 'unavailable') this.button('watch-atmosphere', "A moment in the dressing room", 360, 1007, 480, 82, function () {
            _this13.atmosphereOpen = true;
            _this13.render();
          }, true);
          this.button('start', "Investigate the dressing room", 360, 1100, 640, 88, function () {
            return _this13.go('room');
          });
        };
        _proto.inspect = function inspect(id) {
          this.detail = id;
          this.lens = {
            x: 230,
            y: 700
          };
          this.message = '';
          this.render();
        };
        _proto.room = function room() {
          var _this14 = this;
          this.header("CHAPTER 1 / THE EMPTY BOX", "What was in the box?", "Dressing room \xB7 " + this.s.clues.length + " / 3 objects recorded");
          this.rect(360, 625, 640, 654, '#E7D8CC', 20);
          if (!this.formalImage('dressing-room', 360, 625, 640, 654, true)) {
            this.rect(360, 474, 264, 274, '#BCA6A5', 120);
            this.rect(360, 474, 226, 239, '#EEE4D9', 110);
            this.line(360, 370, 360, 565, '#D2BCB5', 3);
            this.rect(360, 704, 570, 46, '#9D796A', 5);
            this.rect(143, 817, 26, 190, '#9D796A', 4);
            this.rect(577, 817, 26, 190, '#9D796A', 4);
          }
          this.rect(207, 655, 200, 85, C.wine, 12);
          this.rect(207, 628, 212, 23, C.rose, 6);
          this.line(207, 614, 207, 693, C.gold, 12);
          this.art('photo', 528, 482, .75);
          this.rect(111, 494, 53, 83, C.paper, 4);
          this.text("M+L", 111, 494, 50, 60, 18, C.wine);
          this.hit('invitation', 111, 494, 78, 103, function () {
            _this14.message = "The invitation is dated today. Its creases look old.";
            _this14.render();
          });
          this.rect(354, 665, 27, 64, C.wine, 3);
          this.rect(354, 625, 24, 26, C.rose, 2);
          this.hit('lipstick', 354, 647, 86, 104, function () {
            _this14.message = "Used lipstick. Its cap is lying beside the mirror.";
            _this14.render();
          });
          this.hit('object-box', 207, 650, 200, 110, function () {
            return _this14.inspect('box');
          });
          this.hit('object-photo', 528, 482, 170, 180, function () {
            return _this14.inspect('photo');
          });
          this.art('receipt', 466, 850, .63);
          if (this.s.coatMoved) {
            this.rect(150, 868, 156, 93, C.teal, 23);
            this.hit('object-receipt', 466, 850, 150, 170, function () {
              return _this14.inspect('receipt');
            });
          } else {
            var _this$drag2;
            var x = ((_this$drag2 = this.drag) == null ? void 0 : _this$drag2.kind) === 'coat' ? this.drag.x : 463;
            this.rect(x, 818, 240, 144, C.teal, 30);
            this.line(x - 68, 760, x - 18, 850, '#28534F', 10);
            this.line(x + 68, 760, x + 18, 850, '#28534F', 10);
            this.draggable('coat', 'coat', 463, 810, 240, 126);
          }
          if (!this.s.coatMoved) this.hit('paper-edge', 466, 916, 150, 86, function () {
            _this14.message = "Paper peeks out from under the jacket. Drag the jacket away first.";
            _this14.render();
          });
          if (this.roomHint) {
            [[207, 650], [528, 482], [466, 880]].forEach(function (_ref) {
              var x = _ref[0],
                y = _ref[1];
              return _this14.ring(x, y, 92, C.gold, 3);
            });
          }
          this.button('room-hint', this.roomHint ? "Hide hints" : "Need a place to look?", 360, 1004, 380, 86, function () {
            _this14.roomHint = !_this14.roomHint;
            _this14.render();
          }, true);
          this.text(this.message || "Tap objects to inspect them. Drag obstructions aside.", 360, 1084, 640, 100, 28, this.message ? C.wine : C.muted);
          this.button('open-board', "Evidence desk  " + this.s.clues.length + "/3", 360, 1190, 640, 100, function () {
            return _this14.go('board');
          }, false, this.s.clues.length > 0);
        };
        _proto.featureArt = function featureArt(id, f, x, y, scale, ink, angle) {
          if (scale === void 0) {
            scale = 1;
          }
          if (ink === void 0) {
            ink = C.gold;
          }
          if (angle === void 0) {
            angle = 0;
          }
          if (f === 'structure') {
            var _n3 = this.makeNode('Observed contour', x, y, 180 * scale, 130 * scale);
            _n3.angle = -angle;
            var g = _n3.addComponent(Graphics);
            g.strokeColor = color(ink);
            g.lineWidth = 5 * scale;
            if (id === 'photo') {
              g.circle(-19 * scale, 0, 23 * scale);
              g.circle(19 * scale, 0, 23 * scale);
            } else {
              g.arc(0, 0, 29 * scale, -Math.PI * .7, Math.PI * .65, false);
              g.moveTo(-22 * scale, -21 * scale);
              g.lineTo(6 * scale, 9 * scale);
            }
            g.stroke();
          } else if (f === 'writing') this.text(id === 'photo' ? 'JUN 18' : id === 'receipt' ? 'Nina' : 'M & L', x, y, 160 * scale, 50 * scale, 22 * scale, ink).angle = -angle;else {
            var _n4 = this.makeNode('Ornament crop', x, y, 90 * scale, 90 * scale);
            _n4.angle = -angle;
            var _g = _n4.addComponent(Graphics);
            _g.strokeColor = color(ink);
            _g.lineWidth = 4 * scale;
            _g.circle(0, 0, 23 * scale);
            _g.moveTo(-28 * scale, -20 * scale);
            _g.lineTo(28 * scale, 20 * scale);
            _g.moveTo(28 * scale, -20 * scale);
            _g.lineTo(-28 * scale, 20 * scale);
            _g.stroke();
          }
        };
        _proto.artifact = function artifact(id) {
          var _this15 = this;
          this.rect(360, 613, 480, 450, id === 'box' ? '#4E4053' : C.paper, 16);
          if (id === 'photo') {
            this.rect(360, 602, 456, 426, '#D8C7BA', 8);
            this.circle(351, 485, 62, '#9C7768');
            this.rect(351, 585, 133, 133, '#C9A39A', 38);
            this.rect(351, 694, 240, 104, C.paper, 24);
            this.line(295, 578, 323, 610, C.gold, 4);
            this.line(379, 610, 410, 578, C.gold, 4);
          }
          if (id === 'receipt') {
            this.text("LUMIÈRE / PROP REPAIR", 380, 420, 350, 42, 23, C.wine, true);
            this.text("Item: photo-shoot necklace\nRepair: replace clasp", 370, 550, 350, 100, 26, C.ink);
            this.line(175, 730, 540, 730, C.line, 2);
          }
          if (id === 'box') {
            this.rect(360, 619, 401, 270, '#68536A', 12);
            this.line(169, 524, 231, 541, C.rose, 15);
            this.line(185, 548, 229, 510, C.rose, 15);
          }
          ['structure', 'writing', 'ornament'].forEach(function (f) {
            var p = FEATURES[id][f];
            _this15.featureArt(id, f, p.x, p.y, 1.0, id === 'box' ? '#BEA8B7' : C.gold);
          });
        };
        _proto.showDetail = function showDetail() {
          var _this16 = this;
          var id = this.detail;
          this.clearInteractive();
          var n = this.rect(360, 640, 720, 1280, C.dark, 0);
          n.on(Node.EventType.TOUCH_END, function () {});
          this.rect(360, 620, 660, 1110, C.bg, 26);
          this.text(CLUES[id].tag, 360, 112, 580, 40, 21, C.wine);
          this.text(CLUES[id].name, 360, 169, 580, 65, 38, C.ink, true);
          var opened = this.s.opened.includes(id);
          var beforeArtifact = this.accessibility.length;
          this.artifact(id);
          if (!opened) this.accessibility.splice(beforeArtifact);
          if (!opened) {
            var _this$drag3;
            var dy = ((_this$drag3 = this.drag) == null ? void 0 : _this$drag3.kind) === 'cover' ? Math.min(0, this.drag.y - this.drag.startY) : 0;
            this.rect(360, 613 + dy, 480, 450, id === 'box' ? C.wine : '#DCD0BA', 16);
            this.line(160, 613 + dy, 560, 613 + dy, id === 'box' ? C.gold : '#B5A48F', 4);
            this.text(id === 'box' ? 'M & L' : "BACK", 360, 600 + dy, 430, 80, 45, id === 'box' ? C.paper : C.muted, true);
            this.text(this.message || (id === 'box' ? "Drag the lid upward" : "Drag the folded page upward"), 360, 304, 600, 85, 27, C.muted);
            this.draggable('cover', 'cover', 360, 613, 480, 450);
            this.text("Open it first, then inspect and record the details.", 360, 943, 590, 100, 25, C.muted);
          } else {
            var _this$s$findings$id, _this$s$findings$id2;
            var f = pickFeature(id, this.lens.x, this.lens.y);
            var surface = this.makeNode('Inspect surface', 360, 613, 480, 450);
            surface.on(Node.EventType.TOUCH_END, function (e) {
              var p = e.getUILocation();
              _this16.lens = {
                x: Math.max(140, Math.min(580, p.x)),
                y: Math.max(410, Math.min(820, 1280 - p.y))
              };
              _this16.message = '';
              _this16.render();
            });
            this.rect(360, 293, 590, 134, C.paper, 15);
            if (f) {
              this.featureArt(id, f, 190, 291, 1.4);
              this.text(FEATURES[id][f].label, 434, 276, 350, 50, 26, C.ink, true);
              this.text("In focus · Save or keep looking", 434, 321, 350, 40, 20, C.muted);
            } else this.text("Tap a detail or move the magnifier", 360, 293, 570, 90, 26, C.muted);
            this.ring(this.lens.x, this.lens.y, 65, C.teal, 6);
            this.line(this.lens.x + 46, this.lens.y + 48, this.lens.x + 78, this.lens.y + 84, C.teal, 13);
            this.draggable('lens', 'lens', this.lens.x, this.lens.y, 144, 144);
            this.text(this.message || (id === 'photo' ? "Your mother fastened the family necklace on you for this engagement photo." : "Tap or drag to inspect. You can save more than one detail."), 360, 899, 600, 74, 24, C.muted);
            this.button('record-detail', f && (_this$s$findings$id = this.s.findings[id]) != null && _this$s$findings$id.includes(f) ? "Saved · Keep looking" : "Save this detail", 360, 1000, 576, 84, function () {
              if (f) {
                _this16.message = "Detail saved. Keep looking, or return to the room.";
                _this16.commit(record(_this16.s, id, f));
              }
            }, false, !!f && !((_this$s$findings$id2 = this.s.findings[id]) != null && _this$s$findings$id2.includes(f)));
          }
          this.button('close-detail', "Return to the room", 360, 1110, 576, TOUCH_SIZE, function () {
            _this16.detail = null;
            _this16.message = '';
            _this16.render();
          }, true);
        };
        _proto.board = function board() {
          var _this17 = this,
            _this$drag4;
          this.header("EVIDENCE DESK", "What can you compare?", "Drag two notes into the slots, or add them with a tap.");
          IDS.forEach(function (id, i) {
            var x = 138 + i * 222,
              f = _this17.s.notes[id];
            _this17.rect(x, 422, 206, 262, C.paper, 16);
            _this17.text(CLUES[id].name, x, 326, 192, 48, 28, C.ink, true);
            if (f) {
              _this17.featureArt(id, f, x, 395, 1.3);
              _this17.text(FEATURES[id][f].label, x, 463, 190, 60, 22, C.muted);
              _this17.draggable('card-' + id, 'card', x, 400, 206, 160, id);
              _this17.button('slot-' + id, "Compare this", x, 528, 184, 82, function () {
                var index = _this17.slots[0] === null ? 0 : 1;
                _this17.slots = _this17.slots.map(function (v) {
                  return v === id ? null : v;
                });
                _this17.slots[index] = id;
                _this17.render();
              }, true);
              var list = _this17.s.findings[id] || [];
              if (list.length > 1) _this17.button('cycle-' + id, "Detail " + (list.indexOf(f) + 1) + "/" + list.length, x, 619, 206, 82, function () {
                _this17.commit(selectNote(_this17.s, id, list[(list.indexOf(f) + 1) % list.length]));
              }, true);
            } else _this17.text("No notes yet", x, 420, 190, 60, 25, C.muted);
          });
          this.text(this.s.links.length ? this.s.links.map(function (p) {
            return linkText[p];
          }).join('\n') : "No comparisons yet. Choose two details you can check against each other.", 360, 708, 630, 62, 22, C.teal);
          [0, 1].forEach(function (i) {
            var x = 195 + i * 330,
              id = _this17.slots[i];
            _this17.rect(x, 827, 292, 172, id ? C.rose : '#E4DCD2', 14);
            if (id) {
              _this17.featureArt(id, _this17.s.notes[id], x, 805, 1);
              _this17.text(CLUES[id].name, x, 875, 270, 45, 24, C.ink, true);
            } else _this17.text(i ? "Note B" : "Note A", x, 827, 270, 70, 27, C.muted);
          });
          if (((_this$drag4 = this.drag) == null ? void 0 : _this$drag4.kind) === 'card') {
            this.rect(this.drag.x, this.drag.y, 184, 110, C.wine, 15);
            this.text(CLUES[this.drag.id].name, this.drag.x, this.drag.y, 180, 70, 26, C.paper);
          }
          var crossCheck = this.s.links.includes('photo-receipt'),
            sceneCheck = this.s.links.some(function (p) {
              return p.includes('box');
            });
          this.text(this.message || (this.s.compared ? "Both checks are complete. You can build an explanation." : "Cross-checks " + (Number(crossCheck) + Number(sceneCheck)) + "/2\n" + (!crossCheck ? "Compare the objects in the photo and repair slip." : "Connect one of those objects to the empty box.")), 360, 966, 630, 76, 23, C.muted);
          this.button('compare', "Examine pair", 196, 1051, 302, 78, function () {
            _this17.selected = _this17.slots.filter(Boolean);
            _this17.pose = {
              x: 410,
              y: 615,
              angle: 0
            };
            _this17.overlay = false;
            _this17.message = '';
            _this17.commit(_extends({}, _this17.s, {
              screen: 'compare'
            }));
          }, false, this.slots.every(Boolean));
          this.button('infer', "My explanation", 524, 1051, 302, 78, function () {
            return _this17.go('deduction');
          }, false, this.s.compared);
          this.button('back-room', "Look around the room again", 360, 1139, 630, 64, function () {
            return _this17.go('room');
          }, true);
        };
        _proto.compareBench = function compareBench() {
          var _this18 = this;
          if (this.selected.length !== 2) {
            this.s.screen = 'board';
            this.board();
            return;
          }
          var _this$selected = this.selected,
            a = _this$selected[0],
            b = _this$selected[1];
          this.header("OBSERVE & COMPARE", "What do the shapes tell you?", "Look at their structure. Can one detail verify the other?");
          this.rect(360, 584, 640, 540, C.paper, 18);
          this.text(CLUES[a].name, 194, 355, 295, 48, 27, C.gold, true);
          this.text(CLUES[b].name, 524, 355, 295, 48, 27, C.teal, true);
          if (!this.overlay) {
            this.line(360, 410, 360, 713, C.line, 2);
            this.featureArt(a, this.s.notes[a], 195, 548, 2.5, C.gold);
            this.featureArt(b, this.s.notes[b], 525, 548, 2.5, C.teal);
            this.text(FEATURES[a][this.s.notes[a]].label, 195, 700, 288, 70, 23, C.muted);
            this.text(FEATURES[b][this.s.notes[b]].label, 525, 700, 288, 70, 23, C.muted);
          } else {
            this.featureArt(a, this.s.notes[a], 330, 613, 2.4, C.gold);
            var p = this.pose,
              rad = p.angle * Math.PI / 180,
              hx = p.x + Math.sin(rad) * 145,
              hy = p.y - Math.cos(rad) * 145;
            this.ring(p.x, p.y, 130, '#A2C4BD', 2);
            this.featureArt(b, this.s.notes[b], p.x, p.y, 2.4, C.teal, p.angle);
            this.draggable('align', 'align', p.x, p.y, 250, 250);
            this.circle(hx, hy, 25, C.teal);
            this.text('↻', hx, hy, 46, 46, 28, C.paper);
            this.draggable('rotate', 'rotate', hx, hy, 68, 68);
          }
          this.button('toggle-overlay', this.overlay ? "Side by side" : "Overlay (optional)", 360, 809, 450, 62, function () {
            _this18.overlay = !_this18.overlay;
            _this18.render();
          }, true);
          this.text(this.message || (this.overlay ? "Move or rotate the teal note. You can decide at any time." : "Compare their shapes. Exact alignment is not required."), 360, 938, 620, 128, 25, C.wine);
          ['same', 'different', 'unrelated'].forEach(function (r, i) {
            return _this18.button('judge-' + r, ["Same shape", "Different", "Not comparable"][i], 138 + i * 222, 1050, 206, 80, function () {
              var out = judge(_this18.s, _this18.selected, r);
              _this18.message = out.result === 'excluded' ? "These details cannot establish which necklace it was. You can switch saved details at the desk." : out.result === 'unrelated' ? "Can writing and a shape answer the same question? “Not comparable” is also an option." : out.result === 'wrong' ? "Count each separate ring and opening, then reconsider." : out.result === 'recorded' ? out.state.compared ? "Both checks are complete. Return to the desk to build your explanation." : "Comparison saved. Return to the desk to see what still needs checking." : "Choose notes from two different objects first.";
              _this18.commit(out.state);
            }, true);
          });
          this.button('back-board', "Back to the desk", 360, 1140, 630, 86, function () {
            return _this18.go('board');
          }, true);
        };
        _proto.deduction = function deduction() {
          var _this19 = this;
          this.header("YOUR EXPLANATION", "Make your case", "Two claims. Each needs evidence that supports it.");
          var t = this.s.theory;
          this.rect(360, 464, 640, 344, C.paper);
          this.text("1. What best fits the marks in the box?", 360, 335, 600, 62, 28, C.ink, true);
          ['original', 'sample'].forEach(function (v, i) {
            return _this19.button('contents-' + v, ["Family necklace", "Photo-shoot prop"][i], 200 + i * 320, 412, 296, 72, function () {
              _this19.message = '';
              _this19.commit(_extends({}, _this19.s, {
                theory: _extends({}, t, {
                  contents: v
                })
              }));
            }, t.contents !== v);
          });
          this.text("Connect your claim to the scene with a verified pair:", 360, 490, 600, 62, 23, C.muted);
          ['box-photo', 'photo-receipt', 'box-receipt'].forEach(function (p, i) {
            return _this19.button('support-' + p, ["Box × Photo", "Photo × Slip", "Box × Slip"][i], 138 + i * 222, 564, 206, 80, function () {
              _this19.message = '';
              _this19.commit(_extends({}, _this19.s, {
                theory: _extends({}, t, {
                  support: p
                })
              }));
            }, t.support !== p, _this19.s.links.includes(p));
          });
          this.rect(360, 779, 640, 250, C.paper);
          this.text("2. What does the clip show Nina receiving?", 360, 695, 610, 66, 27, C.ink, true);
          ['sample', 'box', 'original'].forEach(function (v, i) {
            return _this19.button('video-' + v, ["Photo-shoot prop", "Jewelry box", "Family necklace"][i], 138 + i * 222, 779, 206, 76, function () {
              _this19.message = '';
              _this19.commit(_extends({}, _this19.s, {
                theory: _extends({}, t, {
                  video: v
                })
              }));
            }, t.video !== v);
          });
          this.button('review-clip', "Review the anonymous clip", 360, 871, 430, 86, function () {
            _this19.clipOpen = true;
            _this19.render();
          }, true);
          this.text(this.message || "This is still a draft. When you speak,\nthey can challenge your evidence. You can keep investigating.", 360, 965, 630, 86, 25, C.wine);
          this.button('submit-theory', "Choose how to bring it up", 360, 1056, 640, 80, function () {
            _this19.message = theoryIssue(_this19.s);
            _this19.commit(deduce(_this19.s));
          });
          this.button('back-board', "Revisit the evidence", 360, 1146, 640, 86, function () {
            return _this19.go('board');
          }, true);
        };
        _proto.handoverFrame = function handoverFrame(x, y, phase, scale) {
          var _this20 = this;
          if (scale === void 0) {
            scale = 1;
          }
          // Deterministic visible action: the closed box changes hands, never contents.
          var skin = '#D9AD99',
            s = scale,
            bx = (phase - 1) * 24;
          var r = function r(cx, cy, w, h, fill, round) {
            if (round === void 0) {
              round = 5;
            }
            return _this20.rect(x + cx * s, y + cy * s, w * s, h * s, fill, round * s);
          };
          var c = function c(cx, cy, radius, fill) {
            return _this20.circle(x + cx * s, y + cy * s, radius * s, fill);
          };
          var l = function l(ax, ay, bx, by, fill, width) {
            return _this20.line(x + ax * s, y + ay * s, x + bx * s, y + by * s, fill, width * s);
          };
          // Fixed left/right positions and sleeve colors make continuity observable.
          r(-68, 29, 43, 108, '#353640', 9);
          r(68, 29, 43, 108, C.teal, 9);
          r(68, -49, 44, 65, C.ink, 19);
          c(-68, -55, 22, '#42372F');
          c(-68, -51, 17, skin);
          c(68, -51, 17, skin);
          r(-68, -67, 35, 13, '#42372F', 6);
          r(68, -69, 39, 14, C.ink, 6);
          l(-68, -26, -68, 13, C.paper, 6);
          l(-68, -20, -68, 11, C.wine, 3);
          // The outside arms remain at rest. The inside wrists visibly contact/release.
          l(-84, -4, -87, 70, '#353640', 13);
          c(-87, 75, 6, skin);
          l(84, -4, 87, 70, C.teal, 13);
          c(87, 75, 6, skin);
          var leftHolding = phase < 2,
            rightHolding = phase > 0;
          var leftX = leftHolding ? bx - 32 : -52,
            leftY = leftHolding ? 48 : 76;
          var rightX = rightHolding ? bx + 32 : 52,
            rightY = rightHolding ? 48 : 76;
          l(-51, -5, -43, 28, '#353640', 14);
          l(-43, 28, leftX, leftY - 6, '#353640', 12);
          l(51, -5, 43, 28, C.teal, 14);
          l(43, 28, rightX, rightY - 6, C.teal, 12);
          r(bx, 40, 60, 34, C.wine, 4);
          l(bx - 30, 32, bx + 30, 32, C.gold, 2);
          r(leftX, leftY, 14, 12, skin, 4);
          r(rightX, rightY, 14, 12, skin, 4);
          this.text('Leo', x - 65 * s, y + 112 * s, 86 * s, 34 * s, 20 * s, C.paper);
          this.text('Nina', x + 65 * s, y + 112 * s, 86 * s, 34 * s, 20 * s, C.paper);
        };
        _proto.clip = function clip() {
          var _this21 = this;
          this.clearInteractive();
          var block = this.rect(360, 640, 720, 1280, C.dark, 0);
          block.on(Node.EventType.TOUCH_END, function () {});
          this.text("ANONYMOUS CLIP / FRAME REVIEW", 360, 191, 640, 70, 36, C.paper, true);
          this.text("Use only what you can actually see.", 360, 273, 630, 70, 26, C.rose);
          [0, 1, 2].forEach(function (i) {
            var x = 138 + i * 222;
            _this21.rect(x, 582, 204, 430, '#655367', 16);
            _this21.text(['00:00.0', '00:00.5', '00:01.0'][i], x, 411, 190, 46, 22, C.paper);
            _this21.handoverFrame(x, 581, i, 1);
          });
          this.text("Anonymous clip · No audio\nWhat do you see happen in these three frames?", 360, 898, 630, 112, 26, C.paper);
          this.button('close-clip', "Back to my explanation", 360, 1070, 620, TOUCH_SIZE, function () {
            _this21.clipOpen = false;
            _this21.render();
          });
        };
        _proto.choice = function choice() {
          var _this22 = this;
          var t = this.s.theory;
          this.header("BEFORE YOU SPEAK", "What will you say?", "You can still revise. Be ready to support your claims.");
          this.rect(360, 509, 640, 415, C.paper);
          this.text("YOUR EXPLANATION", 360, 345, 600, 52, 26, C.wine, true);
          this.text("The marks look more like the " + (t.contents === 'sample' ? "photo-shoot prop" : "family necklace") + ".\nI compared the " + ({
            'box-photo': "box and photo",
            'box-receipt': "box and repair slip",
            'photo-receipt': "photo and repair slip"
          }[t.support] || '') + ".\nThe clip shows you receiving the " + (t.video === 'box' ? "jewelry box" : t.video === 'sample' ? "photo-shoot prop" : "family necklace") + '.', 360, 494, 590, 218, 29);
          this.text("Nina: “Maya? What did you want to ask me?”", 360, 663, 600, 65, 25, C.muted);
          ['private', 'public'].forEach(function (a, i) {
            var b = BRANCHES[a];
            _this22.button('choose-' + a, b.label, 360, 807 + i * 158, 640, 82, function () {
              return _this22.commit(choose(_this22.s, a));
            }, i === 1);
            _this22.text(b.preview, 360, 869 + i * 158, 620, 48, 23, C.muted);
          });
          this.button('edit-draft', "Not yet. Revise my explanation", 360, 1113, 620, 66, function () {
            return _this22.go('deduction');
          }, true);
        };
        _proto.response = function response() {
          var _this23 = this;
          var wrong = this.s.faults.length > 0,
            priv = this.s.approach === 'private';
          this.header("YOU HAVE SPOKEN", wrong ? "She challenges your evidence" : "She agrees to keep looking", relationLabel(this.s) + ' · ' + (priv ? "In private" : "In front of the guests"));
          this.storyFrame(wrong ? 'story-evidence-challenge' : priv ? 'story-private-alliance' : 'story-public-boundary', 360, 459, 640, 309);
          var quote = wrong ? FAULT_TEXT[this.s.faults[0]] : priv ? "“Thank you for not calling a handoff a theft. Let’s check my index together before deciding what happened.”" : "“I’m not handing my phone to an audience. Ask Leo and Theo what they actually know.”";
          this.text(quote, 360, 734, 590, 190, 30);
          this.text(wrong ? priv ? "She will check with you. An uncertain explanation is not an accusation." : "She wants a correction in front of the guests. No trust has been lost." : priv ? "Use four phone-index entries to check the anonymous clip." : "You can question both witnesses. Her private index stays closed.", 360, 947, 610, 123, 25, C.wine);
          this.button('branch-action', wrong ? "Address her objection" : priv ? "Reconstruct the timeline" : "Question the witnesses", 360, 1090, 640, 86, function () {
            return _this23.commit(proceed(_this23.s));
          });
        };
        _proto.openExhibit = function openExhibit(e) {
          this.exhibitOpen = e;
          this.commit(review(this.s, e));
        };
        _proto.exhibitButtons = function exhibitButtons(y, keys) {
          var _this24 = this;
          keys.forEach(function (e, i) {
            var w = 620 / keys.length;
            _this24.button('view-' + e, EXHIBITS[e].name, 50 + w / 2 + i * w, y, w - 12, 72, function () {
              return _this24.openExhibit(e);
            }, true);
          });
        };
        _proto.exhibitModal = function exhibitModal() {
          var _this25 = this;
          var e = this.exhibitOpen;
          this.clearInteractive();
          var block = this.rect(360, 640, 720, 1280, C.dark, 0);
          block.on(Node.EventType.TOUCH_END, function () {});
          this.text("REVIEW / " + EXHIBITS[e].name, 360, 190, 640, 70, 36, C.paper, true);
          this.rect(360, 520, 640, 450, C.paper);
          if (e === 'contours') {
            ['photo', 'receipt', 'box'].forEach(function (id, i) {
              _this25.featureArt(id, 'structure', 145 + i * 215, 493, 2);
              _this25.text(CLUES[id].name, 145 + i * 215, 630, 200, 60, 25);
            });
          } else if (e === 'frames') {
            [0, 1, 2].forEach(function (i) {
              var x = 145 + i * 215;
              _this25.rect(x, 508, 190, 300, '#655367');
              _this25.handoverFrame(x, 482, i, .9);
              _this25.text(['00:00.0', '00:00.5', '00:01.0'][i], x, 692, 180, 40, 24);
            });
          } else if (e === 'clock') {
            [0, 1].forEach(function (i) {
              _this25.rect(200 + i * 320, 485, 280, 190, C.dark);
              _this25.text(i ? '17:50:00' : '17:43:00', 200 + i * 320, 475, 270, 90, 38, C.paper, true);
              _this25.text(i ? "Playback 00:02" : "Playback 00:01", 200 + i * 320, 625, 280, 60, 25);
            });
          } else {
            this.art('photo', 190, 480, .9);
            this.art('receipt', 520, 480, .9);
            this.text("June engagement photo       Prop-shop repair slip", 360, 668, 600, 60, 25);
          }
          this.text(EXHIBITS[e].body, 360, 879, 630, 186, 28, C.paper);
          this.button('close-exhibit', "Back to the conversation", 360, 1090, 620, TOUCH_SIZE, function () {
            _this25.exhibitOpen = null;
            _this25.render();
          });
        };
        _proto.repairPage = function repairPage() {
          var _this26 = this;
          var priv = this.s.approach === 'private';
          this.header("REPAIR THE CONVERSATION", "Answer her actual concern", priv ? "Acknowledge what the evidence cannot show, then continue." : "Correct your claim in front of the guests, then question the witnesses.");
          this.rect(360, 396, 640, 180, C.rose);
          this.text(FAULT_TEXT[this.s.faults[0]], 360, 396, 590, 150, 28, C.wine, true);
          this.text("Reviewing the wrong material costs no trust. You can try again.", 360, 548, 620, 66, 25);
          this.exhibitButtons(633, ['contours', 'scene', 'frames']);
          ['contours', 'scene', 'frames'].forEach(function (e, i) {
            return _this26.button('repair-' + e, (_this26.s.repair === e ? '✓ ' : "Cite ") + EXHIBITS[e].name, 138 + i * 222, 741, 206, 76, function () {
              return _this26.commit(_extends({}, _this26.s, {
                repair: e
              }));
            }, _this26.s.repair !== e, _this26.s.reviewed.includes(e));
          });
          this.text("“I went further than the evidence allowed.\nThis record shows why my claim was too strong.”", 360, 863, 615, 116, 27);
          this.button('repair-retract', priv ? "Explain the evidence & retract" : "Correct my claim publicly", 360, 997, 640, 82, function () {
            var next = repairClaim(_this26.s, true);
            _this26.showFeedback(next, next.repaired === true ? {
              art: 'story-repair',
              speaker: 'nina',
              title: 'The conversation stays open',
              caption: priv ? 'Nina turns back toward you. You can keep checking together.' : 'You corrected the claim in front of the guests. Her phone stays private.',
              text: priv ? 'Nina: “Thank you for saying what the evidence can—and cannot—show. Let’s keep checking.”' : 'Nina: “Thank you for correcting that in front of everyone. Now let’s hear what Leo and Theo actually saw.”'
            } : {
              art: 'story-evidence-challenge',
              speaker: 'nina',
              title: 'An objection, not broken trust',
              caption: 'Nina is still listening. Rechecking your reasoning costs no trust.'
            });
          }, false, !!this.s.repair);
          this.button('repair-insist', "Stand by it & end cooperation…", 360, 1096, 640, 70, function () {
            _this26.accuseOpen = 'nina';
            _this26.render();
          }, true);
        };
        _proto.updateInquiry = function updateInquiry(p) {
          this.commit(_extends({}, this.s, {
            inquiry: _extends({}, this.s.inquiry, p)
          }));
        };
        _proto.inquiryNav = function inquiryNav(labels, large) {
          var _this27 = this;
          if (large === void 0) {
            large = false;
          }
          labels.forEach(function (label, i) {
            return _this27.button('step-' + i, label, 138 + i * 222, large ? 326 : 322, 206, large ? TOUCH_SIZE : 82, function () {
              return _this27.updateInquiry({
                page: i
              });
            }, _this27.s.inquiry.page !== i);
          });
        };
        _proto.stepper = function stepper(id, label, value, y, min, max, change, editable) {
          if (editable === void 0) {
            editable = true;
          }
          this.text(label, 360, y - 78, 610, 44, 26, C.ink, true);
          this.button(id + '-minus', '−', 125, y, 130, TOUCH_SIZE, function () {
            return change(value - 1);
          }, true, editable && value > min);
          this.text(String(value), 360, y, 280, 75, 36, C.wine, true);
          this.button(id + '-plus', '＋', 595, y, 130, TOUCH_SIZE, function () {
            return change(value + 1);
          }, true, editable && value < max);
        };
        _proto.privatePage = function privatePage() {
          var _this28 = this;
          var q = this.s.inquiry,
            locked = q.privateVerified || q.claims.includes('nina');
          this.header("IN PRIVATE / TWO CLOCKS", "Could the clock explain it?", this.s.inquiry.claims.includes('nina') ? "Your saved index remains. The originals are not yet open." : "Nina shares her index. The originals are not yet open.");
          this.inquiryNav(["1. Match events", "2. Align clocks", "3. Test a theory"], true);
          if (q.page === 0) {
            this.text("Left: device index. Right: venue clock in the clip.\nTap a card to keep two matching events.", 360, 422, 640, 70, 25);
            ANCHORS.forEach(function (a, i) {
              var y = 540 + i * 181;
              _this28.rect(360, y, 640, 159, q.anchors.includes(a.id) ? '#D7E4DA' : C.paper);
              _this28.text(a.device + '   ↔   ' + a.wall, 360, y - 42, 600, 50, 31, C.wine, true);
              _this28.anchorImage(205, y + 1, a.id === 'r' ? 'box' : a.id === 's' ? 'empty' : 'lamp');
              _this28.anchorImage(515, y + 1, a.id === 'r' ? 'box' : 'lamp');
              _this28.text(locked ? q.anchors.includes(a.id) ? "✓ Saved matching event" : "Not selected" : q.anchors.includes(a.id) ? "✓ Selected · Tap card to remove" : "Tap this card to keep the pair", 360, y + 55, 600, 48, 25, locked ? C.muted : C.wine, true);
              if (!locked) _this28.hit('anchor-' + a.id, 360, y, 640, 159, function () {
                return _this28.updateInquiry({
                  anchors: q.anchors.includes(a.id) ? q.anchors.filter(function (v) {
                    return v !== a.id;
                  }) : q.anchors.length < 2 ? [].concat(q.anchors, [a.id]) : [q.anchors[1], a.id]
                });
              });
            });
            this.text("Similar times do not necessarily mean the same event.", 360, 1015, 630, 60, 25, C.muted);
          } else if (q.page === 1) {
            this.text("Selected pairs: " + (q.anchors.map(function (id) {
              var a = ANCHORS.find(function (a) {
                return a.id === id;
              });
              return a.device + ' ↔ ' + a.wall;
            }).join(' / ') || "None yet"), 360, 419, 640, 66, 25);
            this.stepper('offset', "Device − venue time (minutes; may be negative)", q.offset, 555, -5, 5, function (n) {
              if (!locked) _this28.updateInquiry({
                offset: n
              });
            }, !locked);
            this.text("Working conversion: device time minus " + q.offset + " min\n" + (q.anchors.map(function (id) {
              var a = ANCHORS.find(function (a) {
                return a.id === id;
              });
              return a.device + ' → 17:' + String(Number(a.device.slice(3)) - q.offset).padStart(2, '0');
            }).join('    ') || "Select two matching events first"), 360, 674, 620, 100, 27, C.teal);
            this.stepper('interval', "How many minutes separate the two events?", q.interval, 833, 0, 15, function (n) {
              if (!locked) _this28.updateInquiry({
                interval: n
              });
            }, !locked);
            this.text("Clip playback: handoff 00:01; departure 00:02.\nPlayback time is not the venue clock.", 360, 978, 630, 110, 26, C.muted);
          } else {
            this.text("Your event interval: " + q.interval + " min\nClip playback interval: 1 second", 360, 432, 630, 88, 30, C.wine, true);
            this.text("Which explanation does this calculation rule out?", 360, 526, 630, 66, 26);
            var options = [['speed', "The file may have been sped up"], ['offset', "The device clock is simply a fixed amount off"], ['clock', "The venue clock may have jumped forward"]];
            options.forEach(function (_ref2, i) {
              var id = _ref2[0],
                label = _ref2[1];
              return _this28.button('exclude-' + id, label, 360, 616 + i * 93, 640, 76, function () {
                return _this28.updateInquiry({
                  exclude: id
                });
              }, q.exclude !== id, !locked);
            });
            this.text(q.claims.includes('nina') ? q.privateVerified ? "A fixed offset cannot explain the interval. That finding stays.\nNina has stopped answering. You can review the saved index only." : "Nina will answer no more questions. Your records remain." : q.privateVerified ? "A fixed offset cannot explain the changed interval.\nThe editor is unknown. Originals are still unchecked." : "You can revise calculations or theories without losing trust.", 360, 916, 630, 105, 25, C.teal);
            if (q.privateVerified) this.button('open-index', q.claims.includes('nina') ? "Review saved index" : q.lead ? "Review the requested entry" : "Open the index & choose a file", 360, 1024, 640, 70, function () {
              _this28.indexOpen = true;
              _this28.render();
            });else this.button('submit-private', "Check this reasoning with Nina", 360, 1024, 640, 70, function () {
              var next = submitPrivate(_this28.s);
              _this28.showFeedback(next, {
                art: next.inquiry.privateVerified ? 'story-private-alliance' : 'nina-portrait',
                speaker: 'nina',
                title: next.inquiry.privateVerified ? 'A reason to keep checking' : 'Check the calculation together',
                caption: next.inquiry.privateVerified ? 'Nina shares the next step. The originals are still unopened.' : 'She stays beside you. A mistaken calculation is not an accusation.'
              });
            }, false, !locked && q.anchors.length === 2 && !!q.exclude);
          }
          if (q.page < 2) this.button('next-step', "Continue →", 360, 1105, 640, 74, function () {
            return _this28.updateInquiry({
              page: q.page + 1
            });
          });else {
            this.button('finish-private', q.privateVerified ? "Save findings & end chapter" : "Save questions & end chapter", 236, 1122, 390, 64, function () {
              return _this28.commit(finish(_this28.s));
            }, true);
            this.button('accuse-nina', "Accuse her…", 565, 1122, 230, 64, function () {
              _this28.accuseOpen = 'nina';
              _this28.render();
            }, true, !q.claims.includes('nina'));
          }
        };
        _proto.anchorImage = function anchorImage(x, y, kind) {
          this.rect(x, y, 245, 47, C.rose, 4);
          if (kind === 'box') {
            this.circle(x - 66, y - 7, 12, C.ink);
            this.circle(x + 66, y - 7, 12, C.teal);
            this.line(x - 60, y + 6, x - 20, y + 6, C.ink, 7);
            this.line(x + 60, y + 6, x + 20, y + 6, C.teal, 7);
            this.rect(x, y + 3, 48, 25, C.wine, 3);
            this.text('B17', x + 15, y + 3, 46, 23, 13, C.paper);
          } else {
            this.line(x + 34, y - 19, x + 34, y + 18, C.dark, 3);
            this.line(x + 18, y + 17, x + 50, y + 17, C.dark, 3);
            this.rect(x + 34, y - 17, 40, 15, C.gold, 3);
            if (kind === 'lamp') {
              this.circle(x - 48, y - 9, 10, C.ink);
              this.line(x - 48, y + 4, x + 26, y + 4, '#A82F3A', 8);
            }
          }
        };
        _proto.indexModal = function indexModal() {
          var _this29 = this;
          var q = this.s.inquiry;
          this.clearInteractive();
          var b = this.rect(360, 640, 720, 1280, C.dark, 0);
          b.on(Node.EventType.TOUCH_END, function () {});
          this.text("NINA’S INDEX / ORIGINALS UNOPENED", 360, 205, 650, 80, 32, C.paper, true);
          this.text(q.claims.includes('nina') ? "Saved index · Read only\nNina will not accept new requests." : q.lead ? "Your retrieval request is recorded.\nThe original has not been opened." : "Which entry falls between the two events?\nChoose one for Nina to request.", 360, 326, 630, 110, 28, C.paper);
          RECORDS.forEach(function (r, i) {
            return _this29.button('request-' + r.id, r.time + ' · ' + r.body, 360, 480 + i * 118, 640, 92, function () {
              _this29.indexOpen = false;
              var next = requestOriginal(_this29.s, r.id);
              _this29.showFeedback(next, {
                art: next.inquiry.lead ? 'story-private-alliance' : 'nina-portrait',
                speaker: 'nina',
                title: next.inquiry.lead ? 'A request, not an answer' : 'Check which moment is missing',
                caption: next.inquiry.lead ? 'C03 is requested. Neither its contents nor its readability is known.' : 'Nina keeps the index open while you reconsider.'
              });
            }, true, !q.lead && !q.claims.includes('nina'));
          });
          this.text(q.lead ? "C03 requested. An index entry does not prove the file is readable." : q.claims.includes('nina') ? "No original was requested. Your saved observations remain available." : "The index uses device time. Convert it before comparing.", 360, 965, 630, 100, 26, C.paper);
          this.button('close-index', "Back to the investigation", 360, 1090, 620, TOUCH_SIZE, function () {
            _this29.indexOpen = false;
            _this29.render();
          }, true);
        };
        _proto.publicPage = function publicPage() {
          var _this30 = this;
          var q = this.s.inquiry,
            w = this.witness,
            c = q.drafts[w],
            locked = q.accepted.includes(w) || q.claims.includes(w);
          this.header("IN PUBLIC / TEST THE CLAIM", "Test what they claim", "Clarify freely. Accusations require a separate confirmation.");
          this.inquiryNav(["1. Choose facts", "2. Connect them", "3. Test a case"]);
          ['leo', 'photographer'].forEach(function (v, i) {
            return _this30.button('witness-' + v, (v === 'leo' ? 'Leo' : 'Theo · Photographer') + (q.claims.includes(v) ? " · Withdrawn" : q.accepted.includes(v) ? " · Clarified" : ''), 200 + i * 320, 413, 300, 82, function () {
              _this30.witness = v;
              _this30.updateInquiry({
                page: 0,
                witness: v
              });
            }, w !== v);
          });
          this.rect(360, 520, 640, 126, C.paper);
          var person = this.personFor(w),
            face = this.relationshipImage(person);
          this.relationshipArts[person] = face;
          if (!this.formalImage(face, 111, 520, 108, 122)) this.portrait(111, 496, person, .4);
          var statement = q.claims.includes(w) ? '“I will keep what I already told you on record, but I am not taking more questions.”' : q.accepted.includes(w) ? w === 'leo' ? '“I recognize the box. I did not see what was inside.”' : '“I cannot guarantee it is unbroken or at its original speed. The source still needs checking.”' : w === 'leo' ? '“I recognize the box, so I know she received the family necklace.”' : '“The clip plays without stopping. I guarantee it is an unbroken, original-speed recording.”';
          this.text(statement, 418, 520, 485, 110, 25);
          if (q.page === 0) {
            this.text("Read a record before citing it. Selected: " + (c.facts.map(function (f) {
              return f.toUpperCase();
            }).join(' + ') || "None"), 360, 624, 640, 62, 24, C.wine);
            ['c', 'a', 'e', 'b', 'd'].forEach(function (f, i) {
              return _this30.button('fact-' + f, FACTS[f].title + (c.facts.includes(f) ? " · Cited" : ''), 360, 679 + i * 86, 640, 82, function () {
                _this30.factOpen = f;
                _this30.updateInquiry({
                  seen: q.seen.includes(f) ? q.seen : [].concat(q.seen, [f])
                });
              }, true);
            });
          } else if (q.page === 1) {
            this.text("Facts " + c.facts.map(function (f) {
              return f.toUpperCase();
            }).join(' + ') + ": why do they belong together?", 360, 627, 630, 70, 26, C.wine, true);
            ['ownership', 'interval', 'identity'].forEach(function (id, i) {
              return _this30.button('link-' + id, LINKS[id], 360, 737 + i * 112, 640, 88, function () {
                return _this30.editChain({
                  link: id
                });
              }, c.link !== id, !locked);
            });
          } else {
            this.text("What could fit both facts,\nyet make the witness’s claim false?", 360, 626, 630, 74, 27, C.ink, true);
            ['other-item', 'retimed', 'clock-change', 'splice', 'certain-crime'].forEach(function (id, i) {
              return _this30.button('alternative-' + id, ALTERNATIVES[id], 360, 710 + i * 86, 640, 86, function () {
                return _this30.editChain({
                  alternative: id
                });
              }, c.alternative !== id, !locked);
            });
          }
          if (q.page < 2) this.button('next-step', "Continue →", 360, 1144, 640, 86, function () {
            return _this30.updateInquiry({
              page: q.page + 1
            });
          });else {
            this.button('ask-clarify', q.accepted.includes(w) ? "Review their clarification" : "Ask them to explain this", 258, 1144, 436, 86, function () {
              var speaker = _this30.personFor(w),
                saved = q.accepted.includes(w);
              var next = saved ? _extends({}, _this30.s, {
                inquiry: _extends({}, q, {
                  feedback: (_this30.s.history.find(function (h) {
                    return w === 'leo' ? h.startsWith('Leo: “I') : h.startsWith('Theo: “I') || h.startsWith('Photographer: “I');
                  }) || 'Testimony saved.').replace(/^Photographer:/, 'Theo:')
                })
              }) : questionWitness(_this30.s, w);
              var accepted = next.inquiry.accepted.includes(w),
                withdrawn = next.inquiry.claims.includes(w);
              _this30.showFeedback(next, {
                art: withdrawn ? _this30.relationshipImage(speaker) : accepted ? w === 'leo' ? 'story-leo-reconsiders' : 'story-theo-reconsiders' : speaker + '-portrait',
                speaker: speaker,
                title: saved ? 'Saved clarification' : accepted ? 'The witness narrows the claim' : 'Test the reasoning again',
                saved: saved,
                caption: withdrawn ? 'This earlier testimony remains recorded. ' + _this30.personName(speaker) + ' will answer no further questions.' : accepted ? w === 'leo' ? 'Leo separates recognizing the box from seeing its contents.' : 'Theo withdraws a guarantee—not a confession. The original still needs checking.' : 'The witness is still willing to talk. Reconsidering a draft costs no trust.'
              });
            }, false, q.accepted.includes(w) || !locked && c.facts.length === 2 && !!c.link && !!c.alternative);
            this.button('ask-accuse', "Accuse…", 586, 1144, 184, 86, function () {
              _this30.accuseOpen = w;
              _this30.render();
            }, true, !q.claims.includes(w));
          }
          this.button('finish-public', "End questioning · " + q.accepted.length + " clarifications saved", 360, 1234, 620, 86, function () {
            return _this30.commit(finish(_this30.s));
          }, true);
        };
        _proto.editChain = function editChain(p) {
          var _extends2;
          var q = this.s.inquiry,
            w = this.witness;
          if (q.accepted.includes(w) || q.claims.includes(w)) return;
          this.updateInquiry({
            drafts: _extends({}, q.drafts, (_extends2 = {}, _extends2[w] = _extends({}, q.drafts[w], p), _extends2))
          });
        };
        _proto.factModal = function factModal() {
          var _this31 = this;
          var f = this.factOpen,
            q = this.s.inquiry,
            c = q.drafts[this.witness];
          this.clearInteractive();
          var b = this.rect(360, 640, 720, 1280, C.dark, 0);
          b.on(Node.EventType.TOUCH_END, function () {});
          this.text(FACTS[f].title, 360, 215, 640, 65, 37, C.paper, true);
          this.rect(360, 575, 640, 560, C.paper);
          if (f === 'a') {
            [0, 1, 2].forEach(function (i) {
              var x = 150 + i * 210;
              _this31.rect(x, 418, 150, 78, C.wine, 8);
              _this31.line(x - 74, 407, x + 74, 407, C.gold, 4);
              _this31.text('B17', x, 437, 140, 40, 20, C.paper);
            });
          }
          if (f === 'b') {
            this.text("YESTERDAY · B17 · PHOTO-SHOOT PROP", 360, 410, 600, 90, 34, C.wine, true);
          }
          if (f === 'c' || f === 'd') {
            this.text(f === 'c' ? '00:01    →    00:02' : '17:43    →    17:50', 360, 410, 600, 90, 37, C.wine, true);
          }
          if (f === 'e') this.text("Camera operator: Theo, photographer", 360, 410, 610, 90, 34, C.wine, true);
          this.text(FACTS[f].body, 360, 635, 590, 270, 30);
          this.button('cite-fact', c.facts.includes(f) ? "Remove this citation" : "Cite this fact", 360, 945, 620, TOUCH_SIZE, function () {
            _this31.factOpen = null;
            _this31.editChain({
              facts: c.facts.includes(f) ? c.facts.filter(function (v) {
                return v !== f;
              }) : c.facts.length < 2 ? [].concat(c.facts, [f]) : [c.facts[1], f]
            });
          }, false, !q.accepted.includes(this.witness) && !q.claims.includes(this.witness));
          this.button('close-fact', "Read only · Return", 360, 1060, 620, TOUCH_SIZE, function () {
            _this31.factOpen = null;
            _this31.render();
          }, true);
        };
        _proto.feedbackModal = function feedbackModal() {
          var _this32 = this;
          this.clearInteractive();
          var b = this.rect(360, 640, 720, 1280, C.dark, 0);
          b.on(Node.EventType.TOUCH_END, function () {});
          this.rect(360, 640, 660, 1060, C.bg);
          var beat = this.feedbackBeat || {
            art: 'nina-portrait',
            speaker: 'nina',
            title: 'Their response',
            caption: 'Your recorded facts remain. Revising a draft costs no trust.'
          };
          this.text(beat.title, 360, 190, 610, 80, 34, C.wine, true);
          this.rect(360, 425, 620, 320, C.rose);
          if (!this.formalImage(beat.art, 360, 425, 620, 320)) this.portrait(360, 380, beat.speaker, 1);
          this.text((beat.text || this.s.inquiry.feedback).replace(/^Photographer:/, 'Theo:'), 360, 735, 590, 240, 28);
          this.text(beat.caption, 360, 940, 590, 120, 25, C.wine);
          this.button('close-feedback', this.s.screen === 'ending' ? 'Review this investigation' : 'Keep investigating', 360, 1090, 600, TOUCH_SIZE, function () {
            _this32.feedbackOpen = false;
            _this32.feedbackBeat = null;
            _this32.render();
          });
        };
        _proto.accuseModal = function accuseModal() {
          var _this33 = this;
          var w = this.accuseOpen,
            repair = this.s.screen === 'repair';
          this.clearInteractive();
          var b = this.rect(360, 640, 720, 1280, C.dark, 0);
          b.on(Node.EventType.TOUCH_END, function () {});
          this.rect(360, 640, 640, 900, C.bg);
          this.text(repair ? "Stand by your claim?" : "Make a direct accusation?", 360, 296, 590, 90, 36, C.wine, true);
          this.text(repair ? "“Even after your objection, I stand by what I said.”" : w === 'leo' ? "“You helped switch the necklace.”" : "“You deleted the evidence.”", 360, 455, 580, 150, 32);
          this.text(repair ? "Nina will end this conversation. Your existing notes will be kept." : "Your evidence does not identify who did it. Confirming costs one trust level and ends further questions with this person. Facts and testimony already obtained remain.", 360, 666, 580, 220, 29);
          this.button('confirm-accusation', "Say it", 360, 870, 580, TOUCH_SIZE, function () {
            _this33.accuseOpen = null;
            var next = repair ? repairClaim(_this33.s, false) : accuse(_this33.s, w);
            var beat = _this33.withdrawalBeat(w);
            if (repair) beat.text = 'Nina: “If you will not reconsider what the evidence actually shows, this conversation is over.”';
            _this33.showFeedback(next, beat);
          }, true);
          this.button('cancel-accusation', "Do not accuse · Keep checking", 360, 987, 580, TOUCH_SIZE, function () {
            _this33.accuseOpen = null;
            _this33.render();
          }, true);
        };
        _proto.ending = function ending() {
          var _this34 = this;
          var priv = this.s.approach === 'private',
            full = priv,
            confirmed = this.s.result === 'confirmed';
          this.header("CHAPTER 1 / INVESTIGATION SAVED", confirmed ? "A lead you can follow" : "Questions left unanswered", confirmed ? "You have a next step. Your choices still affect these relationships." : "You can leave for now. Some questions remain unresolved.");
          this.rect(360, 459, 640, 307, C.paper);
          this.text("WHAT YOU KNOW", 360, 344, 600, 52, 25, C.wine, true);
          var photographer = this.s.inquiry.accepted.includes('photographer');
          var evidence = this.s.timelineFound ? "One playback second spans a seven-minute change on the venue clock.\n" + (full && this.s.inquiry.lead ? "With the fixed offset, C03 falls at 17:46.\nNext: ask Theo to open C03." : priv ? "No intervening original selected. Its contents are unknown.\nNext: request an independent check." : photographer ? "Theo gave you workstation B / reel W07.\nNext: " + (this.s.inquiry.claims.includes('photographer') ? "request the originals independently." : "retrieve and review the originals together.") : "The originals still need an independent check.") : "You have not verified the timing discrepancy.\nKeep the source material and request an independent check. A suspicion is not an established fact.";
          this.text(evidence, 360, 474, 586, 220, 28);
          var claims = this.s.inquiry.claims;
          var nina = claims.includes('nina') || this.s.repaired === false ? "Will answer no more questions" : priv ? "Willing to investigate together" : "Keeps her phone private";
          this.rect(360, 825, 640, 364, priv && this.s.trust >= 2 ? '#D7E4DA' : C.rose);
          this.text('RELATIONSHIPS / YOUR CHOICES', 360, 679, 610, 48, 27, C.ink, true);
          var people = priv ? ['nina'] : ['nina', 'leo', 'theo'];
          people.forEach(function (person, i) {
            var x = people.length === 1 ? 170 : 145 + i * 215,
              art = _this34.relationshipImage(person);
            _this34.relationshipArts[person] = art;
            _this34.text(_this34.personName(person), x, 726, 190, 42, 25, C.wine, true);
            if (!_this34.formalImage(art, x, 834, 164, 170)) _this34.portrait(x, 790, person, .58);
            var status = person === 'nina' ? nina : claims.includes(person === 'theo' ? 'photographer' : 'leo') ? 'Will answer no more questions' : _this34.s.inquiry.accepted.includes(person === 'theo' ? 'photographer' : 'leo') ? 'Clarification saved' : 'No clarification yet';
            _this34.text(status, people.length === 1 ? 443 : x, people.length === 1 ? 811 : 954, people.length === 1 ? 350 : 190, people.length === 1 ? 128 : 78, 23, C.ink, true);
          });
          var consequence = claims.length ? 'Your accusations had consequences. Already established facts remain.' : this.s.repaired === false ? 'You stood by an unverified claim. The conversation ended.' : this.s.faults.length ? 'You corrected an overclaim. The investigation can continue.' : 'You clarified the facts. Responsibility is still unproven.';
          this.text(consequence, 360, 1037, 620, 54, 21, C.wine);
          this.button('continue-payoff', this.payoff.complete ? "Revisit the wedding outcome" : this.payoff.started ? "Continue the original investigation" : "Follow the lead · Open the original", 360, 1120, 640, 100, function () {
            return _this34.enterPayoff();
          }, false, canStartPayoff(this.s));
          this.button('new-run', "Archive this run & investigate again", 360, 1230, 640, 86, function () {
            _this34.resetOpen = true;
            _this34.render();
          }, true);
        };
        _proto.showReset = function showReset() {
          var _this35 = this;
          this.clearInteractive();
          var blocker = this.rect(360, 640, 720, 1280, C.dark, 0);
          blocker.on(Node.EventType.TOUCH_END, function () {});
          this.rect(360, 640, 640, 500, C.bg, 24);
          this.text("Restart Chapter 1?", 360, 470, 590, 80, 36, C.ink, true);
          this.text(this.archiveFailed ? "Could not archive this run.\nYour progress is kept. Retry or return\nto your current run." : "This run will be archived on this device.\nA new run starts at the beginning.", 360, 565, 580, 130, 27, this.archiveFailed ? C.wine : C.muted);
          this.button('confirm-reset', this.archiveFailed ? "Retry archive & restart" : "Start again", 360, 700, 548, TOUCH_SIZE, function () {
            return _this35.archiveAndRestart();
          });
          this.button('cancel-reset', "Keep my progress", 360, 820, 548, TOUCH_SIZE, function () {
            _this35.resetOpen = false;
            _this35.archiveFailed = false;
            _this35.render();
          }, true);
        };
        _proto.archiveAndRestart = function archiveAndRestart() {
          try {
            var raw = sys.localStorage.getItem('seven-minutes-missing-runs');
            var log = raw === null ? [] : JSON.parse(raw);
            if (!Array.isArray(log)) throw new Error('Invalid run archive');
            log.push({
              at: new Date().toISOString(),
              state: this.s,
              payoff: this.payoff
            });
            sys.localStorage.setItem('seven-minutes-missing-runs', JSON.stringify(log.slice(-20)));
          } catch (_unused5) {
            this.archiveFailed = true;
            this.render();
            return;
          }
          // Keep both active saves and the current run intact until its archive is persisted.
          this.archiveFailed = false;
          this.payoff = freshPayoff();
          this.payoffActive = false;
          this.resetOpen = false;
          this.indexOpen = false;
          this.factOpen = null;
          this.feedbackOpen = false;
          this.feedbackBeat = null;
          this.accuseOpen = null;
          this.detail = null;
          this.clipOpen = false;
          this.exhibitOpen = null;
          this.witness = 'leo';
          this.exhibit = null;
          this.roomHint = false;
          this.message = '';
          this.selected = [];
          this.slots = [null, null];
          this.commit(fresh());
        };
        return WeddingChapter;
      }(Component)) || _class));
      var booted = false;
      function boot() {
        var scene = director.getScene();
        if (!scene || booted) return;
        booted = true;
        var n = new Node('Wedding');
        scene.addChild(n);
        n.addComponent(WeddingChapter);
      }
      director.on(Director.EVENT_AFTER_SCENE_LAUNCH, boot);
      game.once(Game.EVENT_GAME_INITED, boot);
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/NativeExperience.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _extends, cclegacy, native, sys;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
      native = module.native;
      sys = module.sys;
    }],
    execute: function () {
      exports({
        featureDescription: featureDescription,
        validTap: validTap
      });
      cclegacy._RF.push({}, "05acblsykBLWb3ptO0e+fuy", "NativeExperience", undefined);
      var PREFS = 'seven-minutes-experience-v1';
      /** Product bridge only; web and unsupported native hosts remain usable. */
      var NativeExperience = exports('NativeExperience', /*#__PURE__*/function () {
        function NativeExperience() {
          this.enabled = sys.isNative && sys.os === sys.OS.IOS;
          this.available = false;
          this.preferences = {
            sound: true,
            haptics: true
          };
          try {
            var p = JSON.parse(sys.localStorage.getItem(PREFS) || 'null');
            if (p) this.preferences = {
              sound: p.sound !== false,
              haptics: p.haptics !== false
            };
          } catch (_unused) {}
          if (this.enabled) this.call('settings:', JSON.stringify(this.preferences));
        }
        var _proto = NativeExperience.prototype;
        _proto.call = function call(method, arg) {
          if (!this.enabled) return null;
          try {
            var r = arg === undefined ? native.reflection.callStaticMethod('ChapterBridge', method) : native.reflection.callStaticMethod('ChapterBridge', method, arg);
            this.available = true;
            return r;
          } catch (_unused2) {
            this.available = false;
            return null;
          }
        };
        _proto.sync = function sync(screen, elements, snapshot, reading) {
          this.call('sync:', JSON.stringify({
            screen: screen,
            width: 720,
            height: 1280,
            elements: elements,
            snapshot: snapshot,
            readingKey: reading == null ? void 0 : reading.key,
            readingFocusId: reading == null ? void 0 : reading.focus
          }));
        };
        _proto.drain = function drain() {
          try {
            var a = JSON.parse(this.call('drain') || '[]');
            return Array.isArray(a) ? a.filter(function (x) {
              return typeof x === 'string';
            }) : [];
          } catch (_unused3) {
            return [];
          }
        };
        _proto.cue = function cue(name) {
          this.call('cue:', name);
        };
        _proto.reader = function reader(elements) {
          this.call('reader:', JSON.stringify({
            elements: elements
          }));
        };
        _proto.settings = function settings(p) {
          this.preferences = _extends({}, this.preferences, p);
          try {
            sys.localStorage.setItem(PREFS, JSON.stringify(this.preferences));
          } catch (_unused4) {}
          this.call('settings:', JSON.stringify(this.preferences));
        };
        _proto.metrics = function metrics() {
          try {
            return JSON.parse(this.call('metrics') || '{}');
          } catch (_unused5) {
            return {};
          }
        };
        return NativeExperience;
      }());
      /** Visible geometry only; no reducer answers or unseen evidence. */
      function featureDescription(clue, feature) {
        if (feature === 'structure') return clue === 'photo' ? 'Two separate closed metal rings sit at the nape.' : clue === 'box' ? 'A curved open hook impression with a diagonal stem in the velvet.' : 'A drawn open hook with a diagonal stem.';
        if (feature === 'writing') return clue === 'photo' ? 'Handwritten date: June 18.' : clue === 'box' ? 'Letters M and L on the base.' : 'A collection signature: Nina.';
        return 'A circle crossed by two diagonal strokes.';
      }
      function validTap(start, end, b) {
        return !!start && Math.hypot(end.x - start.x, end.y - start.y) <= 18 && Math.abs(end.x - b.x) <= b.w / 2 && Math.abs(end.y - b.y) <= b.h / 2;
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Payoff.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _extends, cclegacy;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        advancePayoff: advancePayoff,
        canStartPayoff: canStartPayoff,
        evidenceFrame: evidenceFrame,
        freshPayoff: freshPayoff,
        payoffComplete: payoffComplete,
        payoffStage: payoffStage,
        portraitParticipants: portraitParticipants,
        restorePayoff: restorePayoff,
        sourceOptions: sourceOptions,
        withdrawn: withdrawn
      });
      cclegacy._RF.push({}, "311157fHn1DEZDAJnC/WDLw", "Payoff", undefined); // Authored evidence, not a claim about the anonymous file's speed or sender.
      var PEOPLE = exports('PEOPLE', ['nina', 'leo', 'photographer']);
      var PACKING = exports('PACKING', {
        engraving: 'E + M · 1994',
        engravingLayout: 'stacked',
        clasp: 'paired-rings',
        seam: 'double',
        job: 'MW-104'
      });
      var CLASP_CANDIDATES = exports('CLASP_CANDIDATES', ['single-ring', 'paired-rings', 'open-hook']);
      var ENGRAVING_CANDIDATES = exports('ENGRAVING_CANDIDATES', ['stacked', 'circle', 'line']);
      var REELS = exports('REELS', [{
        id: 'W04',
        room: 'courtyard',
        time: '17:40',
        label: 'Courtyard · 17:40'
      }, {
        id: 'W07',
        room: 'dressing-room',
        time: '17:46',
        label: 'Dressing room · 17:46'
      }, {
        id: 'W09',
        room: 'dressing-room',
        time: '18:06',
        label: 'Dressing room · 18:06'
      }]);
      var unique = function unique(xs) {
        return Array.from(new Set(xs));
      };
      function withdrawn(s) {
        return unique([].concat(s.inquiry.claims, s.repaired === false ? ['nina'] : []));
      }
      function freshPayoff(_s) {
        return {
          version: 1,
          started: false,
          packingSeen: false,
          bookingSeen: false,
          source: null,
          decode: 'closed',
          clientLocated: false,
          frame: 0,
          pin: null,
          mirrored: false,
          zoom: false,
          view: 'frames',
          lastPlace: null,
          inspected: [],
          locationKnown: false,
          ceremony: null,
          sealed: false,
          entranceDone: false,
          wardrobeOpen: false,
          compartmentOpen: false,
          pouchOpen: false,
          back: false,
          claspSeen: false,
          engravingSeen: false,
          claspMatch: null,
          engravingMatch: null,
          objectView: 'inspect',
          verified: false,
          correction: null,
          audience: [],
          corrected: [],
          refused: [],
          responsePending: false,
          portraitDone: false,
          complete: false,
          feedback: ''
        };
      }
      function canStartPayoff(s) {
        return !!s.committed && !!s.approach && (s.screen === 'ending' || s.inquiry.lead === 'c' || s.inquiry.accepted.includes('photographer'));
      }
      function sourceOptions(p, s) {
        if (!p.started) return [];
        var sources = ['client'];
        if (s.approach === 'private' && s.inquiry.lead === 'c' && !withdrawn(s).includes('nina')) sources.unshift('c03');
        if (s.inquiry.accepted.includes('photographer')) sources.unshift('w07');
        return sources;
      }
      function evidenceFrame(p, index) {
        if (index === void 0) {
          index = p.frame;
        }
        if (p.decode !== 'open' || !Number.isInteger(index) || index < 0 || index > 8) return null;
        return {
          index: index,
          coverX: [-160, -130, -105, -82, -62, -62, -86, -112, -160][index],
          coverY: [0, 0, 5, 16, 25, 18, 7, 0, 0][index],
          coverVisible: index >= 2 && index <= 6,
          pocketVisible: index === 4 || index === 5,
          seamVisible: index >= 3 && index <= 6,
          mirror: p.mirrored
        };
      }
      function payoffStage(p) {
        if (p.complete) return 'complete';
        if (!p.started) return 'lead';
        if (p.decode !== 'open') return 'source';
        if (!p.locationKnown) return 'workbench';
        if (!p.ceremony) return 'ceremony';
        if (p.ceremony === 'begin' && !p.entranceDone) return 'entrance';
        if (!p.pouchOpen) return 'retrieve';
        if (!p.verified) return 'object';
        if (!p.entranceDone) return 'entrance';
        if (!p.correction || p.corrected.length !== p.audience.length || p.responsePending) return 'correction';
        return 'portrait';
      }
      function payoffComplete(p) {
        return p.complete;
      }
      function portraitParticipants(p) {
        return PEOPLE.filter(function (person) {
          return !p.refused.includes(person) && (p.correction === 'joint' || person === 'leo') && (person !== 'photographer' || p.audience.includes(person));
        });
      }
      function advancePayoff(p, s, a) {
        if (p.complete) return p;
        var refused = unique([].concat(p.refused, withdrawn(s)));
        var base = refused.length === p.refused.length ? p : _extends({}, p, {
          refused: refused
        });
        var set = function set(changes) {
          return _extends({}, base, {
            feedback: ''
          }, changes);
        };
        if (a.type === 'reference') return a.which === 'packing' ? set({
          packingSeen: true
        }) : a.which === 'booking' ? set({
          bookingSeen: true
        }) : base;
        if (a.type === 'start') return !p.started && canStartPayoff(s) ? set({
          started: true
        }) : base;
        if (!p.started) return base;
        switch (a.type) {
          case 'source-select':
            if (p.decode === 'open' || !sourceOptions(p, s).includes(a.source)) return base;
            return set({
              source: a.source,
              decode: 'closed',
              frame: 0,
              pin: null,
              mirrored: false
            });
          case 'client-search':
            if (p.source !== 'client' || !p.bookingSeen || p.decode === 'open') return base;
            return a.job === PACKING.job && a.room === 'dressing-room' && a.reel === 'W07' ? set({
              clientLocated: true,
              feedback: 'Client copy located: workstation B / W07. Open the file to inspect its contents.'
            }) : set({
              feedback: 'That selection does not cover the dressing-room interval. Check the receipt, room and recorded times.'
            });
          case 'source-open':
            if (!p.source || p.decode === 'open' || p.source === 'client' && !p.clientLocated || p.source === 'c03' && !sourceOptions(p, s).includes('c03')) return base;
            return a.readable === false ? set({
              decode: 'failed',
              feedback: 'The export could not be decoded. No frames were read. The studio client-copy desk remains available.'
            }) : set({
              decode: 'open',
              feedback: p.source === 'c03' ? 'C03 export opened. Its camera source is W07. These are related records, not independent witnesses.' : 'W07 client copy opened. This is the source reel associated with C03.'
            });
          case 'scrub':
            return p.decode === 'open' && !p.locationKnown && Number.isInteger(a.frame) && a.frame >= 0 && a.frame <= 8 ? set({
              frame: a.frame
            }) : base;
          case 'pin':
            return p.decode === 'open' && !p.locationKnown ? set({
              pin: p.frame
            }) : base;
          case 'mirror':
            return p.decode === 'open' && !p.locationKnown && p.pin !== null ? set({
              mirrored: !p.mirrored
            }) : base;
          case 'view':
            return p.decode === 'open' && !p.locationKnown && ['frames', 'compare', 'locations'].includes(a.view) ? set({
              view: a.view
            }) : base;
          case 'zoom':
            return p.decode === 'open' && !p.locationKnown ? set({
              zoom: !p.zoom
            }) : base;
          case 'predict':
            {
              if (p.decode !== 'open' || p.pin === null || !p.packingSeen || p.locationKnown || !['hamper', 'shelf', 'wardrobe'].includes(a.place)) return base;
              var inspected = unique([].concat(p.inspected, [a.place]));
              if (a.place === 'hamper') return set({
                inspected: inspected,
                lastPlace: a.place,
                feedback: 'You lift the hamper lid: folded towels and an empty laundry bag. The garment cover is not here.'
              });
              if (a.place === 'shelf') return set({
                inspected: inspected,
                lastPlace: a.place,
                feedback: 'You check the shelf: two rigid cases with single stitched edges. Neither has the cover’s inner pocket.'
              });
              if (![4, 5].includes(p.pin) || !p.mirrored) return set({
                inspected: inspected,
                lastPlace: a.place,
                feedback: 'The glass reflects the room, but this pinned view does not establish a matching pocket and orientation. Recheck the sequence.'
              });
              return set({
                inspected: inspected,
                lastPlace: a.place,
                locationKnown: true,
                feedback: 'Through the wardrobe glass you see the double seam and inner pocket from the packing photograph. The wardrobe is locked; the pocket is still closed.'
              });
            }
          case 'ceremony':
            return p.locationKnown && !p.ceremony && ['hold', 'begin'].includes(a.choice) ? set({
              ceremony: a.choice
            }) : base;
          case 'seal':
            return p.ceremony === 'begin' && !p.entranceDone ? set({
              sealed: true
            }) : base;
          case 'entrance':
            if (p.entranceDone || !p.ceremony || (p.ceremony === 'hold' ? !p.verified : !p.sealed)) return base;
            return set({
              entranceDone: true,
              feedback: p.ceremony === 'hold' ? 'You wear the verified family necklace, explain the ten-minute pause to the waiting guests and walk in without the missed entrance-music cue.' : 'You choose the plain ribbon and walk in at the promised time. The sealed wardrobe remains secured until after the vows.'
            });
          case 'wardrobe-open':
            return p.locationKnown && !!p.ceremony && (p.ceremony === 'hold' || p.entranceDone) ? set({
              wardrobeOpen: true
            }) : base;
          case 'compartment-open':
            return p.wardrobeOpen ? set({
              compartmentOpen: true
            }) : base;
          case 'pouch-open':
            return p.compartmentOpen ? set({
              pouchOpen: true
            }) : base;
          case 'turn':
            return p.pouchOpen && !p.verified ? set({
              back: !p.back
            }) : base;
          case 'inspect':
            if (!p.pouchOpen || p.verified) return base;
            if (a.feature === 'clasp') return set({
              claspSeen: true
            });
            return a.feature === 'engraving' && p.back ? set({
              engravingSeen: true
            }) : base;
          case 'match':
            if (p.verified || !p.packingSeen || ![0, 1, 2].includes(a.choice)) return base;
            if (a.feature === 'clasp' && p.claspSeen) return set({
              claspMatch: a.choice,
              objectView: 'engraving'
            });
            return a.feature === 'engraving' && p.engravingSeen ? set({
              engravingMatch: a.choice,
              objectView: 'check'
            }) : base;
          case 'object-view':
            return p.pouchOpen && !p.verified && ['inspect', 'clasp', 'engraving', 'check'].includes(a.view) ? set({
              objectView: a.view
            }) : base;
          case 'verify':
            if (!p.packingSeen || !p.claspSeen || !p.engravingSeen || p.claspMatch === null || p.engravingMatch === null) return base;
            if (p.claspMatch !== 1 || p.engravingMatch !== 0) return set({
              feedback: 'The selected comparison does not match both objects. Trace the clasp openings and the position of the two engraving lines in the packing photograph, then compare the recovered pendant again.'
            });
            return set({
              verified: true,
              feedback: 'The paired-ring clasp and E + M · 1994 engraving match Maya’s packing photograph. This is the family necklace. The sender and the earlier box contents remain unproven.'
            });
          case 'correction':
            return p.verified && p.entranceDone && !p.correction && ['joint', 'separate'].includes(a.choice) ? set({
              correction: a.choice,
              audience: s.approach === 'public' ? [].concat(PEOPLE) : ['nina']
            }) : base;
          case 'correct':
            if (!p.correction || p.responsePending || !p.audience.includes(a.person) || p.corrected.includes(a.person)) return base;
            return set({
              corrected: [].concat(p.corrected, [a.person]),
              responsePending: true,
              feedback: refused.includes(a.person) ? 'The factual correction is delivered. They decline the conversation and photograph; the earlier accusation is not erased.' : a.person === 'leo' ? 'Leo: “I recognized a box. I should never have said I knew what was inside.”' : a.person === 'nina' ? p.correction === 'separate' ? 'Nina: “Thank you for telling me directly. No staged reconciliation photo. Let’s talk later; we can take our own picture.”' : 'Nina: “I’ll stand with you. Finding it matters. So does what we said to each other.”' : 'Theo: “I’ll correct my description of the recording. Recovering the necklace doesn’t identify who sent the clip.”'
            });
          case 'ack-response':
            return p.responsePending ? set({
              responsePending: false
            }) : base;
          case 'portrait':
            return p.correction && !p.responsePending && p.corrected.length === p.audience.length && p.entranceDone && p.verified ? set({
              portraitDone: true
            }) : base;
          case 'complete':
            return p.portraitDone && p.verified && p.entranceDone ? set({
              complete: true
            }) : base;
          default:
            return base;
        }
      }
      // Old chapter endings are leads, never object identity or completed ceremony saves.
      // Validate earned prerequisites rather than trusting a saved screen name.
      function restorePayoff(raw, s) {
        var fallback = freshPayoff();
        try {
          var p = typeof raw === 'string' ? JSON.parse(raw) : raw;
          if (!p || p.version !== 1) return fallback;
          var bools = ['started', 'packingSeen', 'bookingSeen', 'clientLocated', 'mirrored', 'zoom', 'locationKnown', 'sealed', 'entranceDone', 'wardrobeOpen', 'compartmentOpen', 'pouchOpen', 'back', 'claspSeen', 'engravingSeen', 'verified', 'responsePending', 'portraitDone', 'complete'];
          if (bools.some(function (k) {
            return typeof p[k] !== 'boolean';
          }) || typeof p.feedback !== 'string' || p.feedback.length > 2000) return fallback;
          if (![null, 'c03', 'w07', 'client'].includes(p.source) || !['closed', 'failed', 'open'].includes(p.decode) || !Number.isInteger(p.frame) || p.frame < 0 || p.frame > 8 || !(p.pin === null || Number.isInteger(p.pin) && p.pin >= 0 && p.pin <= 8) || ![null, 'hold', 'begin'].includes(p.ceremony) || ![null, 'joint', 'separate'].includes(p.correction) || !['frames', 'compare', 'locations'].includes(p.view) || ![null, 'hamper', 'shelf', 'wardrobe'].includes(p.lastPlace)) return fallback;
          if (![null, 0, 1, 2].includes(p.claspMatch) || ![null, 0, 1, 2].includes(p.engravingMatch) || !['inspect', 'clasp', 'engraving', 'check'].includes(p.objectView) || p.objectView !== 'inspect' && !p.pouchOpen) return fallback;
          var _loop = function _loop() {
              var _arr$_i = _arr[_i],
                xs = _arr$_i[0],
                allowed = _arr$_i[1];
              if (!Array.isArray(xs) || unique(xs).length !== xs.length || xs.some(function (x) {
                return !allowed.includes(x);
              })) return {
                v: fallback
              };
            },
            _ret;
          for (var _i = 0, _arr = [[p.inspected, ['hamper', 'shelf', 'wardrobe']], [p.audience, PEOPLE], [p.corrected, PEOPLE], [p.refused, PEOPLE]]; _i < _arr.length; _i++) {
            _ret = _loop();
            if (_ret) return _ret.v;
          }
          if (p.started && !canStartPayoff(s) || p.source && !p.started || p.decode !== 'closed' && !p.source || p.clientLocated && !p.bookingSeen || p.source === 'client' && p.decode !== 'closed' && !p.clientLocated || p.source === 'c03' && (s.approach !== 'private' || s.inquiry.lead !== 'c') || p.source === 'w07' && !s.inquiry.accepted.includes('photographer')) return fallback;
          if ((p.pin !== null || p.frame !== 0 || p.mirrored || p.zoom || p.view !== 'frames' || p.inspected.length || p.locationKnown) && p.decode !== 'open' || p.mirrored && p.pin === null || p.lastPlace !== null && !p.inspected.includes(p.lastPlace) || p.inspected.length && (!p.packingSeen || p.pin === null) || p.locationKnown && (!p.inspected.includes('wardrobe') || !p.mirrored || ![4, 5].includes(p.pin))) return fallback;
          if (p.ceremony && !p.locationKnown || p.sealed && p.ceremony !== 'begin' || p.entranceDone && (!p.ceremony || p.ceremony === 'begin' && !p.sealed || p.ceremony === 'hold' && !p.verified) || p.wardrobeOpen && (!p.ceremony || p.ceremony === 'begin' && !p.entranceDone) || p.compartmentOpen && !p.wardrobeOpen || p.pouchOpen && !p.compartmentOpen || (p.back || p.claspSeen || p.engravingSeen) && !p.pouchOpen || p.claspMatch !== null && (!p.claspSeen || !p.packingSeen) || p.engravingMatch !== null && (!p.engravingSeen || !p.packingSeen) || p.verified && (!p.packingSeen || !p.claspSeen || !p.engravingSeen || p.claspMatch !== 1 || p.engravingMatch !== 0)) return fallback;
          var audience = s.approach === 'public' ? PEOPLE : ['nina'];
          if (p.correction && (!p.verified || !p.entranceDone || p.audience.join() !== audience.join()) || !p.correction && (p.audience.length || p.corrected.length || p.portraitDone) || p.corrected.some(function (x) {
            return !p.audience.includes(x);
          }) || p.responsePending && (!p.correction || !p.corrected.length) || p.portraitDone && (p.corrected.length !== p.audience.length || p.responsePending) || p.complete && !p.portraitDone) return fallback;
          return _extends({}, p, {
            refused: unique([].concat(p.refused, withdrawn(s)))
          });
        } catch (_unused) {
          return fallback;
        }
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/PayoffView.ts", ['cc', './Payoff.ts'], function (exports) {
  var cclegacy, Node, Label, Graphics, Color, payoffStage, PACKING, sourceOptions, REELS, portraitParticipants;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Label = module.Label;
      Graphics = module.Graphics;
      Color = module.Color;
    }, function (module) {
      payoffStage = module.payoffStage;
      PACKING = module.PACKING;
      sourceOptions = module.sourceOptions;
      REELS = module.REELS;
      portraitParticipants = module.portraitParticipants;
    }],
    execute: function () {
      exports('renderPayoff', renderPayoff);
      cclegacy._RF.push({}, "1bf45WoS5VL776O6Fham3IZ", "PayoffView", undefined);

      /** Main owns the node tree, targets, persistence and every state transition. */

      var C = {
        bg: '#F4EEE5',
        ink: '#302838',
        muted: '#756C75',
        wine: '#70394F',
        rose: '#DFC1BD',
        paper: '#FFF9EF',
        gold: '#B58A54',
        teal: '#386B66',
        dark: '#352C40',
        line: '#D6CBC3'
      };
      var names = {
        maya: 'Maya',
        nina: 'Nina',
        leo: 'Leo',
        theo: 'Theo'
      };
      var Painter = /*#__PURE__*/function () {
        function Painter(ui) {
          this.ui = ui;
        }
        var _proto = Painter.prototype;
        _proto.text = function text(t, x, y, w, h, size, fill, bold) {
          if (w === void 0) {
            w = 620;
          }
          if (h === void 0) {
            h = 90;
          }
          if (size === void 0) {
            size = 36;
          }
          if (fill === void 0) {
            fill = C.ink;
          }
          if (bold === void 0) {
            bold = false;
          }
          var n = this.ui.text(t, x, y, w, h, size, fill, bold);
          var l = n.getComponent(Label);
          if (l) {
            l.overflow = Label.Overflow.CLAMP;
            l.enableWrapText = true;
            l.lineHeight = size * 1.2;
          }
          return n;
        };
        _proto.rect = function rect(x, y, w, h, fill, r) {
          if (r === void 0) {
            r = 14;
          }
          return this.ui.rect(x, y, w, h, fill, r);
        };
        _proto.line = function line(x1, y1, x2, y2, fill, width) {
          if (fill === void 0) {
            fill = C.line;
          }
          if (width === void 0) {
            width = 3;
          }
          this.ui.line(x1, y1, x2, y2, fill, width);
        };
        _proto.circle = function circle(x, y, r, fill, stroke, width) {
          if (width === void 0) {
            width = 4;
          }
          var n = this.rect(x, y, r * 2, r * 2, fill, r),
            g = n.getComponent(Graphics);
          if (stroke) {
            g.strokeColor = new Color().fromHEX(stroke);
            g.lineWidth = width;
            g.circle(0, 0, r - width / 2);
            g.stroke();
          }
          return n;
        };
        _proto.button = function button(id, label, y, fn, secondary, enabled, x, w, h) {
          if (secondary === void 0) {
            secondary = false;
          }
          if (enabled === void 0) {
            enabled = true;
          }
          if (x === void 0) {
            x = 360;
          }
          if (w === void 0) {
            w = 620;
          }
          if (h === void 0) {
            h = 104;
          }
          this.rect(x, y, w, h, enabled ? secondary ? C.paper : C.wine : C.line);
          this.text(label, x, y, w - 32, h - 12, 34, enabled ? secondary ? C.wine : C.paper : C.muted, true);
          if (enabled) this.ui.hit('payoff-' + id, x, y, w, h, fn);
        };
        _proto.heading = function heading(kicker, title, sub) {
          this.rect(360, 640, 720, 1280, C.bg, 0);
          this.text(kicker.toUpperCase(), 360, 65, 640, 40, 24, C.wine, true);
          this.text(title, 360, 135, 640, 70, 44, C.ink, true);
          this.text(sub, 360, 235, 624, 118, 36, C.muted);
        };
        _proto.person = function person(x, y, p, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          if (this.ui.portrait) {
            this.ui.portrait(x, y, p, scale);
            return;
          }
          this.circle(x, y, 42 * scale, p === 'leo' ? C.dark : C.wine);
          this.rect(x, y + 77 * scale, 94 * scale, 102 * scale, p === 'nina' ? C.teal : C.paper, 30 * scale);
          this.circle(x, y + 5 * scale, 32 * scale, '#D9AD99');
          this.circle(x - 12 * scale, y + 7 * scale, 2.5 * scale, C.ink);
          this.circle(x + 12 * scale, y + 7 * scale, 2.5 * scale, C.ink);
          this.line(x - 8 * scale, y + 21 * scale, x + 8 * scale, y + 21 * scale, C.wine, 3);
        };
        _proto.rings = function rings(x, y, scale, closed) {
          if (scale === void 0) {
            scale = 1;
          }
          if (closed === void 0) {
            closed = true;
          }
          if (closed) {
            this.circle(x - 17 * scale, y, 23 * scale, C.paper, C.gold, 7 * scale);
            this.circle(x + 17 * scale, y, 23 * scale, C.paper, C.gold, 7 * scale);
          } else {
            var n = this.rect(x, y, 68 * scale, 68 * scale, C.paper, 0),
              g = n.getComponent(Graphics);
            g.strokeColor = new Color().fromHEX(C.gold);
            g.lineWidth = 7 * scale;
            g.arc(0, 0, 25 * scale, -Math.PI * .68, Math.PI * .65, false);
            g.stroke();
            this.line(x - 19 * scale, y + 18 * scale, x + 6 * scale, y - 9 * scale, C.gold, 7 * scale);
          }
        };
        _proto.pendant = function pendant(x, y, back, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          this.line(x - 69 * scale, y - 79 * scale, x - 43 * scale, y - 5 * scale, C.gold, 5 * scale);
          this.line(x + 69 * scale, y - 79 * scale, x + 43 * scale, y - 5 * scale, C.gold, 5 * scale);
          this.circle(x, y + 2 * scale, 55 * scale, C.gold, C.ink, 3 * scale);
          this.circle(x, y + 2 * scale, 45 * scale, back ? '#E0BC79' : C.teal);
          if (back) this.text('E + M\n1994', x, y + 2 * scale, 100 * scale, 65 * scale, 21 * scale, C.ink, true);else {
            this.line(x - 21 * scale, y + 2 * scale, x + 21 * scale, y + 2 * scale, C.paper, 5 * scale);
            this.line(x, y - 19 * scale, x, y + 23 * scale, C.paper, 5 * scale);
          }
        };
        _proto.engraving = function engraving(x, y, choice, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          this.circle(x, y, 70 * scale, '#E0BC79', C.gold, 6 * scale);
          if (choice === 0) this.text('E + M\n1994', x, y, 130 * scale, 95 * scale, 30 * scale, C.ink, true);else if (choice === 1) {
            this.text('E + M', x, y - 33 * scale, 130 * scale, 40 * scale, 28 * scale, C.ink, true);
            this.text('1', x - 42 * scale, y + 14 * scale, 32 * scale, 40 * scale, 27 * scale, C.ink);
            this.text('9', x - 17 * scale, y + 38 * scale, 32 * scale, 40 * scale, 27 * scale, C.ink);
            this.text('9', x + 17 * scale, y + 38 * scale, 32 * scale, 40 * scale, 27 * scale, C.ink);
            this.text('4', x + 42 * scale, y + 14 * scale, 32 * scale, 40 * scale, 27 * scale, C.ink);
          } else this.text('E + M · 1994', x, y, 137 * scale, 75 * scale, 22 * scale, C.ink, true);
        };
        _proto.claspDiagram = function claspDiagram(x, y, choice, scale) {
          if (scale === void 0) {
            scale = 1;
          }
          if (choice === 0) this.circle(x, y, 30 * scale, C.paper, C.gold, 8 * scale);else this.rings(x, y, scale, choice === 1);
        };
        _proto.seam = function seam(x, y, scale, flip) {
          if (scale === void 0) {
            scale = 1;
          }
          if (flip === void 0) {
            flip = 1;
          }
          this.line(x - 29 * scale * flip, y - 43 * scale, x + 24 * scale * flip, y + 39 * scale, C.paper, 5 * scale);
          this.line(x - 14 * scale * flip, y - 43 * scale, x + 39 * scale * flip, y + 39 * scale, C.gold, 3 * scale);
          for (var i = 0; i < 3; i++) this.line(x + (14 + i * 8) * scale * flip, y + (4 + i * 12) * scale, x + (27 + i * 8) * scale * flip, y + (4 + i * 12) * scale, C.paper, 4 * scale);
        };
        _proto.cover = function cover(x, y, w, h, pocket, flip) {
          if (pocket === void 0) {
            pocket = false;
          }
          if (flip === void 0) {
            flip = 1;
          }
          this.rect(x, y, w, h, '#73867B', w * .12);
          this.line(x - w * .25, y - h * .42, x, y - h * .55, C.ink, 4);
          this.line(x, y - h * .55, x + w * .25, y - h * .42, C.ink, 4);
          this.line(x, y - h * .44, x, y + h * .43, '#465C51', 3);
          this.seam(x + flip * w * .22, y + h * .23, w / 150, flip);
          if (pocket) {
            this.rect(x - flip * w * .19, y + h * .1, w * .47, h * .22, '#344C43', 4);
            this.rect(x - flip * w * .17, y + h * .1, w * .25, h * .16, C.rose, 7);
          }
        };
        _proto.packing = function packing(x, y, w, h) {
          this.rect(x, y, w, h, C.paper, 7);
          this.rect(x, y - 15, w - 24, h - 44, '#D9D1C3', 2);
          this.cover(x + w * .22, y - 12, w * .26, h * .65, true);
          this.pendant(x - w * .2, y - 5, true, Math.min(w / 460, h / 260));
          this.rings(x - w * .2, y - h * .31, Math.min(w / 400, h / 240));
          this.text('MAYA’S PACKING PHOTO', x, y + h / 2 - 17, w - 20, 26, 19, C.ink, true);
        }
        /** Authored room coordinates: low open hamper, high luggage shelf, glazed wardrobe. */;
        _proto.room = function room(x, y, w, h, mirror, frame, selected) {
          if (mirror === void 0) {
            mirror = false;
          }
          if (frame === void 0) {
            frame = 4;
          }
          this.rect(x, y, w, h, '#DDD2C3', 7);
          var flip = mirror ? -1 : 1;
          var px = function px(n) {
              return x + (n - .5) * w * flip;
            },
            py = function py(n) {
              return y + (n - .5) * h;
            };
          this.line(px(.05), py(.78), px(.95), py(.78), '#AA9C8F', 3);
          this.line(px(.63), py(.03), px(.63), py(.78), '#C6B8A8', 3);
          // All three plausible destinations retain different shapes and contents.
          this.rect(px(.15), py(.71), w * .22, h * .29, '#A9896E', 8);
          for (var i = 0; i < 4; i++) this.line(px(.055 + i * .05), py(.58), px(.055 + i * .05), py(.84), '#DAC6A9', 3);
          this.rect(px(.15), py(.57), w * .24, h * .045, C.dark, 2);
          this.line(px(.35), py(.36), px(.59), py(.36), C.ink, 7);
          this.line(px(.37), py(.36), px(.37), py(.77), C.ink, 4);
          this.line(px(.57), py(.36), px(.57), py(.77), C.ink, 4);
          this.rect(px(.46), py(.28), w * .19, h * .13, C.dark, 5);
          this.rect(px(.79), py(.47), w * .26, h * .78, '#9A7E68', 5);
          this.rect(px(.79), py(.46), w * .22, h * .69, '#B2C6C0', 2);
          if (frame >= 2 && frame <= 6) {
            var shift = frame === 3 ? -.025 : frame === 4 ? .016 : 0;
            this.cover(px(.79 + shift), py(.45), w * .16, h * .52, frame === 4 || frame === 5, flip);
          }
          this.line(px(.7), py(.17), px(.73), py(.68), '#DCE9E2', 3);
          this.line(px(.81), py(.14), px(.9), py(.45), '#DCE9E2', 3);
          this.circle(px(.887), py(.51), w * .009, C.gold);
          // Moving light stand creates an occlusion in early frames.
          if (frame <= 2) {
            var sx = .38 + frame * .12;
            this.line(px(sx), py(.2), px(sx), py(.89), C.ink, 6);
            this.line(px(sx), py(.82), px(sx - .09), py(.93), C.ink, 5);
            this.line(px(sx), py(.82), px(sx + .09), py(.93), C.ink, 5);
            this.rect(px(sx), py(.19), w * .12, h * .1, C.paper, 3);
          }
          if (selected) {
            var _positions$selected;
            var positions = {
              hamper: .15,
              shelf: .46,
              wardrobe: .79
            };
            this.circle(px((_positions$selected = positions[selected]) != null ? _positions$selected : .79), py(.94), 9, C.wine);
          }
        };
        _proto.source = function source(x, y, w, h, frame, zoom, flipped) {
          if (zoom) {
            this.room(x, y, w, h, flipped ? false : true, frame);
            return;
          }
          this.rect(x, y, w, h, '#D5C7BA', 5);
          this.rect(x - w * .31, y + h * .18, w * .23, h * .35, C.rose, 12);
          this.line(x - w * .4, y - h * .32, x - w * .16, y - h * .32, C.ink, 6);
          this.rect(x + w * .16, y, w * .61, h * .88, '#887565', 3);
          this.room(x + w * .16, y, w * .56, h * .8, !flipped, frame);
          this.text('REC  ·  17:46:0' + frame, x, y + h * .43, w - 20, 35, 22, C.paper, true);
        };
        return Painter;
      }();
      /**
       * Rendering has no game-state side effects. Every button emits a reducer action.
       * The source is a deterministic, authored sequence; no decoded-video claim is made.
       */
      function renderPayoff(ui, p, story, send, onSaveLeave) {
        var d = new Painter(ui),
          stage = payoffStage(p);
        var action = function action(a) {
          return function () {
            return send(a);
          };
        };
        var footer = function footer() {
          return d.button('save-leave', p.complete ? 'Return to chapter' : 'Save & leave · unfinished', 1208, onSaveLeave, true);
        };
        var note = function note(t, y) {
          if (y === void 0) {
            y = 1092;
          }
          return d.text(t, 360, y, 620, 100, 32, C.muted);
        };
        var header = function header(k, t, s) {
          return d.heading(k, t, s);
        };
        if (stage === 'lead') {
          header('Chapter 1 · follow the original', 'A lead, not an ending', 'Find the necklace, then decide how to enter and put the record right.');
          d.packing(360, 490, 620, 340);
          d.text('Your photo, taken while packing.', 360, 715, 620, 70, 36, C.ink, true);
          d.text(PACKING.engraving + ' · two closed rings', 360, 780, 620, 65, 34, C.muted);
          d.button('start', 'Follow the original', 946, action({
            type: 'start'
          }));
          note('The anonymous sender is still unknown.');
        } else if (stage === 'source') {
          var sources = sourceOptions(p, story);
          header('1 · original source', p.source === 'client' ? 'Studio client copy' : 'Open the actual record', p.decode === 'failed' ? 'This export is unreadable. No frame findings were earned.' : 'An index or request is not an opened file.');
          if (p.source === 'client' && !p.clientLocated) {
            d.rect(360, 440, 620, 238, C.paper);
            d.text('MAYA’S BOOKING RECEIPT', 360, 354, 580, 42, 24, C.wine, true);
            d.text('Job ' + PACKING.job + '\nDressing room · 17:40–17:50', 360, 438, 580, 122, 36, C.ink, true);
            if (!p.bookingSeen) d.button('booking', 'Read the booking receipt', 620, action({
              type: 'reference',
              which: 'booking'
            }), true);else {
              d.text('Choose the room and recorded time.', 360, 618, 620, 72, 34, C.muted);
              REELS.forEach(function (r, i) {
                return d.button('reel-' + r.id, r.label, 730 + i * 118, action({
                  type: 'client-search',
                  job: PACKING.job,
                  room: r.room,
                  reel: r.id
                }), true);
              });
            }
            if (p.feedback) note(p.feedback, 1094);
          } else if (p.source && p.decode !== 'failed') {
            d.rect(360, 514, 620, 350, C.paper);
            d.text(p.source === 'c03' ? 'C03' : 'W07', 360, 435, 540, 90, 68, C.wine, true);
            d.text(p.source === 'c03' ? 'Nina’s retained export' : 'Studio · workstation B\nMaya’s client copy', 360, 560, 540, 140, 36, C.ink);
            d.button('open-source', 'Open file', 827, action({
              type: 'source-open'
            }));
            d.button('choose-studio', 'Use studio client access', 951, action({
              type: 'source-select',
              source: 'client'
            }), true);
            note('C03 and W07 share a camera source.');
          } else {
            d.rect(360, 448, 620, 220, C.paper);
            d.text(p.decode === 'failed' ? 'No decoded frames' : 'Maya has client access through her studio booking.', 360, 448, 560, 160, 38, C.ink, true);
            sources.forEach(function (s, i) {
              return d.button('source-' + s, s === 'c03' ? 'Open Nina’s C03 export' : s === 'w07' ? 'Use Theo’s W07 locator' : 'Find the studio client copy', 665 + i * 122, action({
                type: 'source-select',
                source: s
              }), s === 'client');
            });
            note('Cooperation can supply a locator.\nIt cannot substitute for looking.');
          }
        } else if (stage === 'workbench') {
          var page = p.view;
          if (page === 'frames') {
            header('2 · source workbench', 'Look between the moments', 'Step or scrub. Pause on something you want to compare.');
            d.source(360, 486, 620, 350, p.frame, p.zoom, false);
            d.text('Frame ' + p.frame + ' / 8' + (p.pin !== null ? '  ·  pinned ' + p.pin : ''), 360, 702, 620, 46, 28, C.muted);
            d.line(100, 756, 620, 756, C.line, 12);
            var thumb = d.circle(100 + p.frame * 65, 756, 16, C.wine);
            var scrub = ui.hit('payoff-scrubber', 360, 756, 620, 100, function () {});
            var frameFromTouch = function frameFromTouch(e) {
              return Math.max(0, Math.min(8, Math.round((e.getUILocation().x - 100) / 65)));
            };
            // Move the native thumb without replacing the active target. Commit on release.
            scrub.on(Node.EventType.TOUCH_MOVE, function (e) {
              return thumb.setPosition(100 + frameFromTouch(e) * 65 - 360, 640 - 756);
            });
            scrub.on(Node.EventType.TOUCH_END, function (e) {
              return send({
                type: 'scrub',
                frame: frameFromTouch(e)
              });
            });
            d.button('prev', 'Previous', 857, action({
              type: 'scrub',
              frame: Math.max(0, p.frame - 1)
            }), true, p.frame > 0, 195, 290);
            d.button('next', 'Next', 857, action({
              type: 'scrub',
              frame: Math.min(8, p.frame + 1)
            }), true, p.frame < 8, 525, 290);
            d.button('pin', 'Pin this frame', 978, action({
              type: 'pin'
            }), false, true, 195, 290);
            d.button('zoom', p.zoom ? 'Wide view' : 'Magnify', 978, action({
              type: 'zoom'
            }), true, true, 525, 290);
            d.button('compare', 'Compare pinned frame', 1100, action({
              type: 'view',
              view: 'compare'
            }), false, p.pin !== null);
          } else if (page === 'compare') {
            var _p$pin;
            header('2 · compare originals', 'Two views of one room', 'Which details stay the same when the view changes?');
            d.text('PINNED ' + p.pin, 198, 342, 290, 40, 25, C.wine, true);
            d.text('PACKING PHOTO', 523, 342, 290, 40, 25, C.wine, true);
            d.room(198, 530, 285, 305, !p.mirrored, (_p$pin = p.pin) != null ? _p$pin : 0);
            d.packing(523, 530, 285, 305);
            d.text(p.mirrored ? 'Flipped crop' : 'Mirror crop', 198, 730, 290, 60, 32, C.ink, true);
            d.text(PACKING.engraving, 523, 730, 290, 60, 29, C.ink, true);
            d.button('mirror', p.mirrored ? 'Restore reflection' : 'Flip pinned crop', 838, action({
              type: 'mirror'
            }), true);
            d.button('packing', p.packingSeen ? 'Packing photo inspected' : 'Inspect packing photo', 954, action({
              type: 'reference',
              which: 'packing'
            }), true);
            d.button('locations', 'Compare with the room', 1070, action({
              type: 'view',
              view: 'locations'
            }), false, p.packingSeen);
            // A full-width target always leads back; no precision tapping required.
            d.button('return-frames', '‹', 65, action({
              type: 'view',
              view: 'frames'
            }), true, true, 78, 112, 100);
          } else {
            header('3 · test a location', 'Where would you look?', 'Use the room, the packing photo and your pinned view.');
            if (p.lastPlace === 'hamper') {
              d.rect(360, 496, 490, 290, '#A9896E');
              d.rect(360, 416, 510, 35, C.dark, 5);
              [0, 1, 2].forEach(function (i) {
                return d.rect(310 + i * 35, 477 + i * 35, 230, 39, C.paper, 9);
              });
              d.rect(490, 570, 100, 100, C.line, 20);
              d.text('Folded towels. An empty laundry bag.', 360, 709, 620, 80, 34, C.muted);
            } else if (p.lastPlace === 'shelf') {
              d.line(90, 595, 630, 595, C.ink, 10);
              d.rect(248, 495, 230, 185, C.dark, 12);
              d.rect(507, 520, 200, 140, '#926F61', 10);
              d.line(152, 490, 343, 490, C.gold, 4);
              d.line(425, 520, 588, 520, C.gold, 4);
              d.text('Two rigid cases, with single seams.', 360, 709, 620, 80, 34, C.muted);
            } else {
              var _p$lastPlace;
              d.room(360, 500, 620, 355, false, 3, (_p$lastPlace = p.lastPlace) != null ? _p$lastPlace : undefined);
              if (p.lastPlace === 'wardrobe') d.text('Check the pinned pocket and orientation.', 360, 726, 620, 85, 32, C.muted);
            }
            d.button('predict-hamper', 'Open hamper', 835, action({
              type: 'predict',
              place: 'hamper'
            }), true, true, 195, 290);
            d.button('predict-shelf', 'Check shelf', 835, action({
              type: 'predict',
              place: 'shelf'
            }), true, true, 525, 290);
            d.button('predict-wardrobe', 'Look through wardrobe glass', 951, action({
              type: 'predict',
              place: 'wardrobe'
            }));
            d.button('review-frames', 'Recheck the original', 1067, action({
              type: 'view',
              view: 'frames'
            }), true);
          }
        } else if (stage === 'ceremony') {
          header('4 · an explicit tradeoff', 'The wardrobe is locked', 'Opening it now interrupts the entrance setup. The coordinator has the key.');
          d.room(360, 477, 620, 280, false, 4, 'wardrobe');
          d.text('Hold: inspect the pocket before the vows.\nThe planned music cue will pass.', 360, 716, 620, 130, 36, C.ink);
          d.button('hold', 'Hold the entrance · ten minutes', 840, action({
            type: 'ceremony',
            choice: 'hold'
          }));
          d.text('Begin: keep the promised time.\nCheck the pocket after the vows.', 360, 973, 620, 116, 36, C.ink);
          d.button('begin', 'Begin without the necklace', 1092, action({
            type: 'ceremony',
            choice: 'begin'
          }), true);
        } else if (stage === 'retrieve') {
          header('5 · physical examination', p.wardrobeOpen ? 'Open what is inside' : 'The coordinator unlocks it', p.ceremony === 'begin' ? 'The vows are over. The seal stayed in place.' : 'The entrance is held. You have the key.');
          d.rect(360, 600, 530, 540, '#92755F', 8);
          if (!p.wardrobeOpen) {
            d.rect(360, 600, 470, 490, '#B2C6C0', 3);
            d.cover(360, 587, 200, 380, false);
            d.circle(563, 603, 14, C.gold);
            ui.hit('payoff-door-direct', 360, 600, 470, 490, action({
              type: 'wardrobe-open'
            }));
            d.button('wardrobe-open', 'Open the wardrobe', 1000, action({
              type: 'wardrobe-open'
            }));
          } else {
            d.cover(360, 578, 290, 414, false);
            if (!p.compartmentOpen) {
              d.line(225, 611, 495, 611, C.dark, 12);
              for (var i = 0; i < 17; i++) d.line(231 + i * 15, 601, 231 + i * 15, 622, C.gold, 4);
              var pull = d.rect(247, 646, 28, 51, C.gold, 7);
              var zip = ui.hit('payoff-zip-direct', 360, 632, 340, 124, function () {});
              var zipStart = null,
                zipDistance = 0;
              zip.on(Node.EventType.TOUCH_START, function (e) {
                zipStart = e.getUILocation().x;
                zipDistance = 0;
              });
              zip.on(Node.EventType.TOUCH_MOVE, function (e) {
                if (zipStart !== null) {
                  zipDistance = e.getUILocation().x - zipStart;
                  pull.setPosition(247 + Math.max(0, Math.min(225, zipDistance)) - 360, 640 - 646);
                }
              });
              zip.on(Node.EventType.TOUCH_END, function () {
                if (zipDistance >= 95) send({
                  type: 'compartment-open'
                });else pull.setPosition(247 - 360, 640 - 646);
                zipStart = null;
              });
              zip.on(Node.EventType.TOUCH_CANCEL, function () {
                zipStart = null;
                zipDistance = 0;
                pull.setPosition(247 - 360, 640 - 646);
              });
              d.button('unzip', 'Slide the zip open', 1000, action({
                type: 'compartment-open'
              }));
            } else {
              d.rect(360, 615, 292, 187, C.dark, 9);
              d.rect(360, 635, 205, 153, C.rose, 27);
              d.line(270, 586, 450, 586, C.wine, 8);
              d.line(342, 582, 360, 604, C.wine, 6);
              d.line(378, 582, 360, 604, C.wine, 6);
              ui.hit('payoff-pouch-direct', 360, 635, 205, 153, action({
                type: 'pouch-open'
              }));
              d.button('pouch-open', 'Untie the opaque pouch', 1000, action({
                type: 'pouch-open'
              }));
            }
          }
          note(p.compartmentOpen ? 'A closed pouch establishes no identity.' : 'Opening the cover is an observation.');
        } else if (stage === 'object') {
          if (p.objectView !== 'inspect') {
            var feature = p.objectView === 'clasp' ? 'clasp' : 'engraving';
            var check = p.objectView === 'check';
            header('5 · compare the physical object', check ? 'Do both details agree?' : feature === 'clasp' ? 'Trace the clasp openings' : 'Compare the engraving layout', check ? 'The photo and recovered object must agree in both details.' : 'Choose the diagram that appears in both originals.');
            d.text('PACKING PHOTO', 195, 340, 290, 45, 25, C.wine, true);
            d.text('RECOVERED', 525, 340, 290, 45, 25, C.wine, true);
            d.rect(195, 498, 290, 260, C.paper);
            d.rect(525, 498, 290, 260, C.paper);
            if (feature === 'clasp' && !check) {
              d.claspDiagram(195, 490, 1, 1.7);
              d.claspDiagram(525, 490, 1, 1.7);
            } else {
              d.engraving(195, 490, 0, 1.25);
              d.engraving(525, 490, 0, 1.25);
            }
            if (check) {
              d.text(p.feedback ? 'The comparison needs another look.' : 'Your chosen diagrams are ready to compare.', 360, 711, 620, 100, 36, p.feedback ? C.wine : C.muted, true);
              d.button('revise-clasp', 'Review clasp', 838, action({
                type: 'object-view',
                view: 'clasp'
              }), true, true, 195, 290);
              d.button('revise-engraving', 'Review engraving', 838, action({
                type: 'object-view',
                view: 'engraving'
              }), true, true, 525, 290);
              d.button('verify', 'Confirm the physical match', 970, action({
                type: 'verify'
              }));
              d.button('object-again', 'Handle the pendant again', 1090, action({
                type: 'object-view',
                view: 'inspect'
              }), true);
            } else {
              d.text('Tap a diagram. You can revise it.', 360, 703, 620, 80, 34, C.muted);
              [0, 1, 2].forEach(function (choice) {
                var x = 150 + choice * 210,
                  y = 886,
                  selected = (feature === 'clasp' ? p.claspMatch : p.engravingMatch) === choice;
                d.rect(x, y, 188, 214, selected ? C.rose : C.paper, 14);
                if (feature === 'clasp') d.claspDiagram(x, y - 17, choice, 1.35);else d.engraving(x, y - 17, choice, .95);
                d.text(String.fromCharCode(65 + choice), x, y + 78, 150, 42, 30, C.wine, true);
                ui.hit('payoff-match-' + feature + '-' + choice, x, y, 188, 214, action({
                  type: 'match',
                  feature: feature,
                  choice: choice
                }));
              });
              d.button('handle-again', 'Back to the physical object', 1088, action({
                type: 'object-view',
                view: 'inspect'
              }), true);
            }
          } else {
            header('5 · verify the object', 'Compare both sides', 'A familiar shape is not enough. Examine the clasp and the engraving.');
            d.rect(360, 502, 620, 360, C.paper);
            d.pendant(360, 539, p.back, 1.35);
            d.rings(360, 385, 1.1);
            ui.hit('payoff-pendant-direct', 360, 550, 224, 220, action({
              type: 'turn'
            }));
            ui.hit('payoff-clasp-direct', 360, 385, 130, 100, action({
              type: 'inspect',
              feature: 'clasp'
            }));
            d.text(p.back ? PACKING.engraving : 'Pendant front', 360, 735, 620, 58, 36, C.ink, true);
            d.button('turn', p.back ? 'Turn to the front' : 'Turn the pendant over', 827, action({
              type: 'turn'
            }), true, true, 195, 290);
            d.button('inspect-clasp', p.claspSeen ? 'Clasp observed' : 'Inspect clasp', 827, action({
              type: 'inspect',
              feature: 'clasp'
            }), true, true, 525, 290);
            d.button('inspect-engraving', p.engravingSeen ? 'Engraving observed' : 'Inspect engraving', 944, action({
              type: 'inspect',
              feature: 'engraving'
            }), true, p.back);
            d.button('compare-object', 'Compare the two originals', 1061, action({
              type: 'object-view',
              view: 'clasp'
            }), false, p.claspSeen && p.engravingSeen && p.packingSeen);
            // The reference is deliberately visible during verification, not inferred from a badge.
            d.text('Compare the shape and position of each detail.', 360, 1138, 630, 52, 29, C.muted);
          }
        } else if (stage === 'entrance') {
          var hold = p.ceremony === 'hold';
          header('6 · the entrance', hold ? 'The guests have waited' : 'Keep the promised entrance', hold ? 'Maya wears the verified necklace. The music cue has passed.' : 'Maya chooses a plain ribbon. The wardrobe stays sealed until after the vows.');
          d.rect(360, 563, 620, 475, '#E4D6C5', 4);
          d.line(310, 800, 340, 385, C.paper, 60);
          d.line(410, 800, 380, 385, C.paper, 60);
          [130, 590].forEach(function (x) {
            return [420, 540, 660].forEach(function (y) {
              d.circle(x, y, 28, C.wine);
              d.rect(x, y + 45, 65, 52, C.rose, 12);
            });
          });
          d.person(360, 530, 'maya', .95);
          if (hold) d.pendant(360, 566.1, false, .209);else {
            d.line(338.6, 557, 381.4, 557, C.wine, 5);
            d.line(360, 557, 348, 574, C.wine, 4);
            d.line(360, 557, 372, 574, C.wine, 4);
          }
          if (!hold && !p.sealed) {
            d.button('seal', 'Seal the wardrobe request', 959, action({
              type: 'seal'
            }));
            note('You secure the key request yourself.');
          } else {
            d.text(hold ? '“Thank you for waiting. I chose this pause.”' : 'The coordinator takes your sealed request.', 360, 895, 620, 112, 36, C.ink);
            d.button('entrance', hold ? 'Explain the pause & enter' : 'Enter on the original cue', 1059, action({
              type: 'entrance'
            }));
          }
        } else if (stage === 'correction') {
          var audience = p.correction ? p.audience : story.approach === 'public' ? ['nina', 'leo', 'photographer'] : ['nina'];
          var personName = function personName(who) {
            return who === 'photographer' ? 'Theo' : who === 'nina' ? 'Nina' : 'Leo';
          };
          var audienceText = audience.map(personName).join(', ');
          header('7 · correct the record', 'Who heard the claim?', 'Only ' + audienceText + '. No uninformed guests will be contacted.');
          if (!p.correction) {
            d.pendant(360, 450, true, 1.3);
            d.text('Joint: one shared account.\nEach person can still refuse to join.', 360, 659, 620, 118, 36, C.ink);
            d.button('joint', 'Correct it together', 793, action({
              type: 'correction',
              choice: 'joint'
            }));
            d.text(p.refused.includes('nina') ? 'Separate: private corrections.\nNina’s refusal still stands.' : 'Separate: private conversations.\nNina chooses a separate photograph.', 360, 929, 620, 118, 36, C.ink);
            d.button('separate', 'Speak to each person privately', 1067, action({
              type: 'correction',
              choice: 'separate'
            }), true);
          } else {
            var next = p.responsePending ? p.corrected[p.corrected.length - 1] : audience.find(function (who) {
              return !p.corrected.includes(who);
            });
            var declined = next && p.refused.includes(next);
            if (next && !declined) d.person(360, 443, next === 'photographer' ? 'theo' : next, 1.05);else {
              d.rect(360, 525, 238, 249, C.paper);
              d.line(288, 486, 432, 486, C.line, 6);
              d.text('A boundary\nremains', 360, 567, 210, 110, 32, C.muted, true);
            }
            d.text(next ? personName(next) + (declined ? ' declined to meet.' : p.correction === 'joint' ? ' joins the correction.' : ' · a private conversation.') : 'All corrections delivered.', 360, 740, 620, 100, 36, C.ink, true);
            var previous = p.feedback;
            if (previous) d.text(previous, 360, 900, 620, 182, 34, C.muted);else d.text(declined ? 'Deliver the facts without requiring a reply, an apology or a photograph.' : 'Show the recovered object and correct only what the evidence establishes.', 360, 898, 620, 170, 36, C.muted);
            if (p.responsePending) d.button('ack-response', 'Continue', 1071, action({
              type: 'ack-response'
            }));else if (next) d.button('correct-' + next, declined ? 'Deliver factual correction' : 'Show the object & speak', 1071, action({
              type: 'correct',
              person: next
            }));
          }
        } else {
          var participants = portraitParticipants(p).map(function (w) {
            return w === 'photographer' ? 'theo' : w;
          });
          var cast = ['maya'].concat(participants);
          header(stage === 'complete' ? 'Chapter 1 · complete' : '8 · the portrait', p.portraitDone ? 'The necklace is recovered' : 'Who chooses to stand here?', p.correction === 'joint' ? 'A joint correction does not require reconciliation.' : p.refused.includes('nina') ? 'Private correction delivered. Nina still declines a photograph.' : 'Private correction. Nina chooses her own photograph with Maya.');
          d.rect(360, 516, 636, 366, '#DCCABD', 5);
          var slots = ['maya', 'leo', 'nina', 'theo'];
          slots.forEach(function (person, i) {
            var x = 118 + i * 161;
            if (cast.includes(person)) {
              d.person(x, 439, person, .58);
              if (person === 'maya') d.pendant(x, 461.04, false, .1276);
            } else {
              d.rect(x, 524, 92, 102, '#C9B7AA', 28);
              d.line(x - 45, 576, x + 45, 576, C.muted, 3);
            }
            d.text(cast.includes(person) ? names[person] : '—', x, 645, 148, 45, 27, cast.includes(person) ? C.ink : C.muted, true);
          });
          if (p.correction === 'separate' && !p.refused.includes('nina')) {
            d.rect(164, 822, 214, 182, C.paper);
            d.person(121, 766, 'maya', .35);
            d.pendant(121, 779.3, false, .077);
            d.person(205, 766, 'nina', .35);
            d.text('Maya + Nina', 164, 884, 210, 40, 25, C.ink, true);
            d.text('Their separate photograph.\nA later conversation remains.', 483, 819, 350, 155, 34, C.muted);
          } else d.text(p.refused.length ? 'Empty places preserve the refusals.\nMaya speaks for herself.' : 'The participants chose to join.\nThe facts do not settle every hurt.', 360, 817, 620, 150, 36, C.muted);
          if (!p.portraitDone) d.button('portrait', 'Take the agreed photograph', 1034, action({
            type: 'portrait'
          }));else if (!p.complete) d.button('complete', 'Finish Chapter 1', 1034, action({
            type: 'complete'
          }));else d.text(p.ceremony === 'hold' ? 'Family necklace at the vows.\nA delayed entrance, without its planned cue.' : 'Plain ribbon at the vows.\nFamily necklace recovered afterward.', 360, 1033, 620, 132, 34, C.ink, true);
          note('The anonymous sender remains unknown.', 1135);
        }
        footer();
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/ReaderPosition.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Payoff.ts'], function (exports) {
  var _extends, cclegacy, payoffStage;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      payoffStage = module.payoffStage;
    }],
    execute: function () {
      exports('readingPosition', readingPosition);
      cclegacy._RF.push({}, "6e7c5DeL89JWoaiBryETLX4", "ReaderPosition", undefined);
      /** Navigation identity only. Draft answers, counters and button states do not
       * constitute a new reading scene; command validity still uses the full payload. */
      function readingPosition(c) {
        var page = function page(parts, focus) {
          return _extends({
            key: JSON.stringify(parts)
          }, focus ? {
            focus: focus
          } : {});
        };
        var s = c.state,
          p = c.payoff;
        if (c.settingsOpen) return page(['settings']);
        // Match Main.render's early payoff return: ordinary modals are not rendered.
        if (c.payoffActive) {
          var stage = payoffStage(p),
            base = ['payoff', stage];
          if (stage === 'source') return page([].concat(base, [p.source, p.decode, p.source === 'client' && p.clientLocated]));
          if (stage === 'workbench') return page([].concat(base, [p.view, p.view === 'locations' ? p.lastPlace : null]), p.view === 'frames' ? 'source-description' : p.view === 'compare' ? 'pinned-description' : !p.lastPlace ? 'room-description' : undefined);
          if (stage === 'retrieve') return page([].concat(base, [p.wardrobeOpen, p.compartmentOpen]));
          if (stage === 'object') return page([].concat(base, [p.objectView, p.objectView === 'inspect' && p.back]), p.objectView === 'inspect' ? 'object-description' : p.objectView === 'clasp' ? 'clasp-originals' : p.objectView === 'engraving' ? 'engraving-originals' : undefined);
          if (stage === 'entrance') return page([].concat(base, [p.sealed]));
          if (stage === 'correction') return page([].concat(base, [p.correction, p.responsePending, p.responsePending ? p.corrected[p.corrected.length - 1] : p.audience.find(function (w) {
            return !p.corrected.includes(w);
          }), p.responsePending ? p.feedback : null]));
          if (stage === 'portrait') return page([].concat(base, [p.portraitDone]));
          return page(base);
        }
        // Last rendered modal wins, matching Main.render's stacking order.
        if (c.resetOpen) return page(['reset']);
        if (c.atmosphereOpen) return page(['atmosphere']);
        if (c.accuseOpen) return page(['accuse', c.accuseOpen, s.screen === 'repair']);
        if (c.feedbackOpen) {
          var b = c.feedbackBeat;
          return page(['feedback', b == null ? void 0 : b.speaker, b == null ? void 0 : b.title, (b == null ? void 0 : b.text) || s.inquiry.feedback, b == null ? void 0 : b.caption]);
        }
        if (c.factOpen) return page(['fact', c.factOpen]);
        if (c.indexOpen) return page(['index']);
        if (c.exhibitOpen) return page(['exhibit', c.exhibitOpen]);
        if (c.clipOpen) return page(['clip']);
        if (c.detail) {
          var opened = s.opened.includes(c.detail);
          return page(['detail', c.detail, opened, opened ? c.detailFeature : null], opened && c.detailFeature ? 'focused-detail' : undefined);
        }
        if (s.screen === 'private' || s.screen === 'public') return page([s.screen, s.inquiry.page, s.screen === 'public' ? c.witness : null]);
        if (s.screen === 'compare') return page([s.screen].concat(c.selected));
        if (s.screen === 'repair') return page([s.screen, s.approach, s.faults[0]]);
        return page([s.screen]);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Reasoning.ts", ['cc'], function (exports) {
  var cclegacy;
  return {
    setters: [function (module) {
      cclegacy = module.cclegacy;
    }],
    execute: function () {
      exports({
        calibrationValid: calibrationValid,
        chainFeedback: chainFeedback,
        chainValid: chainValid,
        inquiryValid: inquiryValid
      });
      cclegacy._RF.push({}, "3c2d4aqwTlBlYWAPjh4oue/", "Reasoning", undefined); // Working hypotheses are editable. Only explicit responsibility claims close cooperation.
      var emptyChain = exports('emptyChain', function emptyChain() {
        return {
          facts: [],
          link: null,
          alternative: null
        };
      });
      var freshInquiry = exports('freshInquiry', function freshInquiry() {
        return {
          witness: 'leo',
          page: 0,
          seen: [],
          drafts: {
            leo: emptyChain(),
            photographer: emptyChain()
          },
          accepted: [],
          claims: [],
          anchors: [],
          offset: 0,
          interval: 0,
          exclude: null,
          lead: null,
          privateVerified: false,
          feedback: '',
          checks: 0
        };
      });
      var FACTS = exports('FACTS', {
        a: {
          title: "Record A · Extracted frames",
          body: "00:00–00:01: Leo hands Nina a box.\nThe lid stays closed. A B17 label is on its corner.\nThe contents are not visible."
        },
        b: {
          title: "Record B · Prop register",
          body: "Yesterday’s receipt: box B17.\nUsed for a photo-shoot prop necklace; returned before today’s handoff.\nNo record of what was put inside afterward."
        },
        c: {
          title: "Record C · File readings",
          body: "The same anonymous file:\nHandoff at playback 00:01.\nNina leaves at playback 00:02."
        },
        d: {
          title: "Record D · Visible readings",
          body: "The same clock by the door:\nHandoff 17:43:00; Nina leaves 17:50:00.\nThe intervening events are not in this file."
        },
        e: {
          title: "Record E · Crew sheet",
          body: "Theo, the photographer, is listed as the camera operator.\nThe file’s creator and sender are not listed.\nA filename does not identify who made it."
        }
      });
      var LINKS = exports('LINKS', {
        identity: "Same container does not mean same contents",
        interval: "Playback time differs from the venue-clock interval",
        ownership: "The camera operator must be responsible for the file"
      });
      var ALTERNATIVES = exports('ALTERNATIVES', {
        'other-item': "There could be a different object inside",
        'clock-change': "Someone could have advanced the venue clock",
        'retimed': "The file could have been sped up",
        'splice': "The file could have been spliced together",
        'certain-crime': "Other explanations are ruled out; guilt is certain"
      });
      var ANCHORS = exports('ANCHORS', [{
        id: 'r',
        device: '17:45',
        wall: '17:43',
        mark: "Handoff · B17 label faces right",
        valid: true
      }, {
        id: 's',
        device: '17:48',
        wall: '17:50',
        mark: "Left: empty light stand / Right: crew member in red",
        valid: false
      }, {
        id: 't',
        device: '17:52',
        wall: '17:50',
        mark: "Departure · Crew member in red moves the light stand",
        valid: true
      }]);
      function chainValid(w, c) {
        return [].concat(c.facts).sort().join() === (w === 'leo' ? 'a,b' : 'c,d') && c.link === (w === 'leo' ? 'identity' : 'interval') && (w === 'leo' ? c.alternative === 'other-item' : ['retimed', 'splice'].includes(c.alternative));
      }
      function calibrationValid(q) {
        return [].concat(q.anchors).sort().join() === 'r,t' && q.offset === 2 && q.interval === 7 && q.exclude === 'offset';
      }
      function chainFeedback(w, c) {
        if (c.facts.length !== 2 || !c.link || !c.alternative) return "Your explanation is incomplete. Keep two facts, connect them and describe another possibility.";
        if (w === 'photographer' && c.alternative === 'clock-change') return "Theo: “Even if someone advanced the venue clock, my camera could have recorded every second at normal speed. Would your example actually make my claim false?”";
        // One holistic counter-question, never per-choice right/wrong or answer highlighting.
        return w === 'leo' ? "Leo: “Do those records rule out every other possible object in the box? Recognizing a box and seeing inside it are different things.”" : "Theo: “Playback time, the venue clock and the editor are different issues. Does your explanation fit both readings without assuming something we haven’t verified?”";
      }
      function inquiryValid(q) {
        if (!q || !['leo', 'photographer'].includes(q.witness) || ![0, 1, 2].includes(q.page) || !Array.isArray(q.seen) || q.seen.some(function (f) {
          return !['a', 'b', 'c', 'd', 'e'].includes(f);
        }) || !q.drafts || !Array.isArray(q.accepted) || !Array.isArray(q.claims) || !Array.isArray(q.anchors) || typeof q.feedback !== 'string' || !Number.isInteger(q.checks) || q.checks < 0) return false;
        if ([q.seen, q.accepted, q.claims, q.anchors].some(function (a) {
          return new Set(a).size !== a.length;
        }) || q.accepted.some(function (w) {
          return !['leo', 'photographer'].includes(w);
        }) || q.claims.some(function (w) {
          return !['leo', 'photographer', 'nina'].includes(w);
        }) || q.anchors.length > 2 || q.anchors.some(function (a) {
          return !ANCHORS.some(function (b) {
            return b.id === a;
          });
        })) return false;
        if (!Number.isInteger(q.offset) || q.offset < -5 || q.offset > 5 || !Number.isInteger(q.interval) || q.interval < 0 || q.interval > 15 || ![null, 'offset', 'speed', 'clock'].includes(q.exclude) || typeof q.privateVerified !== 'boolean' || ![null, 'c'].includes(q.lead) || q.lead !== null && !q.privateVerified) return false;
        for (var _i = 0, _arr = ['leo', 'photographer']; _i < _arr.length; _i++) {
          var w = _arr[_i];
          var c = q.drafts[w];
          if (!c || !Array.isArray(c.facts) || c.facts.length > 2 || new Set(c.facts).size !== c.facts.length || c.facts.some(function (f) {
            return !q.seen.includes(f);
          }) || ![null].concat(Object.keys(LINKS)).includes(c.link) || ![null].concat(Object.keys(ALTERNATIVES)).includes(c.alternative) || q.accepted.includes(w) && !chainValid(w, c)) return false;
        }
        return !q.privateVerified || calibrationValid(q);
      }
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/RenderPool.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  var _createForOfIteratorHelperLoose, cclegacy, Node, Layers, UITransform, Graphics, Label, sys;
  return {
    setters: [function (module) {
      _createForOfIteratorHelperLoose = module.createForOfIteratorHelperLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      Node = module.Node;
      Layers = module.Layers;
      UITransform = module.UITransform;
      Graphics = module.Graphics;
      Label = module.Label;
      sys = module.sys;
    }],
    execute: function () {
      cclegacy._RF.push({}, "b61e9xUZY1L/6IRYBWEaPjJ", "RenderPool", undefined);
      /** Bounded reuse of presentation nodes only. Drag-capture nodes never enter this pool. */
      var RenderPool = exports('RenderPool', /*#__PURE__*/function () {
        function RenderPool() {
          this.entries = {
            shape: [],
            text: []
          };
          this.cursor = {
            shape: 0,
            text: 0
          };
          this.owned = new Set();
          this.fresh = 0;
          this.reused = 0;
          this.passes = 0;
        }
        var _proto = RenderPool.prototype;
        _proto.owns = function owns(node) {
          return this.owned.has(node);
        };
        _proto.begin = function begin() {
          this.passes++;
          this.cursor = {
            shape: 0,
            text: 0
          };
          for (var _i = 0, _Object$values = Object.values(this.entries); _i < _Object$values.length; _i++) {
            var list = _Object$values[_i];
            for (var _iterator = _createForOfIteratorHelperLoose(list), _step; !(_step = _iterator()).done;) {
              var node = _step.value.node;
              // A rectangle may have been a button or modal blocker in the previous frame.
              for (var _i2 = 0, _arr = [Node.EventType.TOUCH_START, Node.EventType.TOUCH_MOVE, Node.EventType.TOUCH_END, Node.EventType.TOUCH_CANCEL]; _i2 < _arr.length; _i2++) {
                var event = _arr[_i2];
                node.off(event);
              }
              node.active = false;
              node.removeFromParent();
            }
          }
        };
        _proto.take = function take(kind, parent, name, x, y, w, h) {
          var index = this.cursor[kind]++;
          var entry = this.entries[kind][index];
          if (!entry) {
            var node = new Node(name);
            node.layer = Layers.Enum.UI_2D;
            node.addComponent(UITransform);
            if (kind === 'shape') node.addComponent(Graphics);else node.addComponent(Label);
            entry = {
              node: node,
              signature: ''
            };
            this.entries[kind].push(entry);
            this.owned.add(node);
            this.fresh++;
          } else this.reused++;
          var n = entry.node;
          n.name = name;
          n.angle = 0;
          n.setScale(1, 1, 1);
          parent.addChild(n);
          n.setPosition(x - 360, 640 - y);
          n.getComponent(UITransform).setContentSize(w, h);
          n.active = true;
          return entry;
        };
        _proto.shape = function shape(parent, name, x, y, w, h, signature, draw) {
          var entry = this.take('shape', parent, name, x, y, w, h);
          // Cocos JSB destroys render draw infos on disable. Re-enabling a cached
          // Graphics node does not re-register its native model unless geometry is
          // uploaded again. Keep node reuse, but rebuild native drawing commands.
          if (sys.isNative || entry.signature !== signature) {
            var _g = entry.node.getComponent(Graphics);
            _g.clear();
            draw(_g);
            entry.signature = signature;
          }
          return entry.node;
        };
        _proto.text = function text(parent, x, y, w, h) {
          return this.take('text', parent, 'Text', x, y, w, h).node;
        };
        _proto.end = function end() {
          // Retain at most a small reserve above this screen's needs, not a chapter-wide high-water mark.
          for (var _i3 = 0, _arr2 = ['shape', 'text']; _i3 < _arr2.length; _i3++) {
            var kind = _arr2[_i3];
            var keep = this.cursor[kind] + (kind === 'shape' ? 16 : 8),
              list = this.entries[kind];
            while (list.length > keep) {
              var entry = list.pop();
              this.owned["delete"](entry.node);
              entry.node.destroy();
            }
          }
        };
        _proto.stats = function stats() {
          return {
            passes: this.passes,
            created: this.fresh,
            reused: this.reused,
            retainedShapes: this.entries.shape.length,
            retainedLabels: this.entries.text.length
          };
        };
        _proto.destroy = function destroy() {
          for (var _i4 = 0, _Object$values2 = Object.values(this.entries); _i4 < _Object$values2.length; _i4++) {
            var list = _Object$values2[_i4];
            for (var _iterator2 = _createForOfIteratorHelperLoose(list), _step2; !(_step2 = _iterator2()).done;) {
              var node = _step2.value.node;
              node.destroy();
            }
          }
          this.entries = {
            shape: [],
            text: []
          };
          this.owned.clear();
        };
        return RenderPool;
      }());
      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/Story.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc', './Investigation.ts', './Reasoning.ts'], function (exports) {
  var _extends, cclegacy, pairOf, expected, readyForInference, IDS, freshInquiry, calibrationValid, chainValid, chainFeedback, inquiryValid;
  return {
    setters: [function (module) {
      _extends = module.extends;
    }, function (module) {
      cclegacy = module.cclegacy;
    }, function (module) {
      pairOf = module.pairOf;
      expected = module.expected;
      readyForInference = module.readyForInference;
      IDS = module.IDS;
    }, function (module) {
      freshInquiry = module.freshInquiry;
      calibrationValid = module.calibrationValid;
      chainValid = module.chainValid;
      chainFeedback = module.chainFeedback;
      inquiryValid = module.inquiryValid;
    }],
    execute: function () {
      exports({
        accuse: accuse,
        addRecord: addRecord,
        availableRecords: availableRecords,
        choose: choose,
        deduce: deduce,
        faultsFor: faultsFor,
        finish: finish,
        judge: judge,
        markGap: markGap,
        proceed: proceed,
        questionWitness: questionWitness,
        record: record,
        repairClaim: repairClaim,
        requestOriginal: requestOriginal,
        restore: restore,
        review: review,
        selectNote: selectNote,
        submitPrivate: submitPrivate,
        theoryIssue: theoryIssue
      });
      cclegacy._RF.push({}, "70342gyaddFRoVSDlWGUqmR", "Story", undefined);
      var fresh = exports('fresh', function fresh() {
        return {
          version: 5,
          inquiry: freshInquiry(),
          screen: 'intro',
          findings: {},
          theory: {
            contents: null,
            support: null,
            video: null
          },
          clues: [],
          notes: {},
          opened: ['photo'],
          coatMoved: false,
          links: [],
          compared: false,
          deduced: false,
          approach: null,
          committed: null,
          faults: [],
          trust: 2,
          history: [],
          reviewed: [],
          repair: null,
          repaired: null,
          order: [],
          gap: [],
          scope: null,
          testimonies: [],
          result: null,
          timelineFound: false
        };
      });
      var CLUES = exports('CLUES', {
        box: {
          name: "Jewelry box",
          tag: "Dressing room / Vanity"
        },
        photo: {
          name: "Engagement photo",
          tag: "Dressing room / Beside the mirror"
        },
        receipt: {
          name: "Repair slip",
          tag: "Dressing room / Under the jacket"
        }
      });
      var BRANCHES = exports('BRANCHES', {
        "private": {
          label: "Talk to Nina privately",
          preview: "Protect her privacy. Ask to check her phone index together."
        },
        "public": {
          label: "Raise it in front of everyone",
          preview: "Hear from the witnesses. Her private phone stays closed."
        }
      });
      var EXHIBITS = exports('EXHIBITS', {
        contours: {
          name: "Three shapes",
          body: "Photo: two closed rings.\nRepair sketch: one open hook.\nVelvet impression: one open hook."
        },
        scene: {
          name: "Sources",
          body: "The engagement photo is from June. The slip is from the prop shop.\nOnly the box impression comes from today’s room. Identifying different objects does not establish what happened here."
        },
        frames: {
          name: "The handoff",
          body: "Leo hands Nina a closed box.\nThe lid stays shut in all three frames.\nThe necklace itself is never visible."
        },
        clock: {
          name: "The clock",
          body: "Frame 01: venue clock 17:43:00.\nFrame 02: same clock, 17:50:00.\nThe clip advances just one second."
        }
      });
      var RECORDS = exports('RECORDS', [{
        id: 'c',
        time: '17:48',
        body: "C03 · Empty room & light stand",
        rank: 2
      }, {
        id: 'a',
        time: '17:43',
        body: "C01 · Camera setup",
        rank: 0
      }, {
        id: 'd',
        time: '17:52',
        body: "C04 · Nina leaves",
        rank: 3
      }, {
        id: 'b',
        time: '17:45',
        body: "C02 · Leo hands over the box",
        rank: 1
      }]);
      var faultEvidence = exports('faultEvidence', {
        contents: 'contours',
        support: 'scene',
        video: 'frames'
      });
      var FAULT_TEXT = exports('FAULT_TEXT', {
        contents: "“You’ve called those old marks a match for the family necklace. Did you compare the clasps?”",
        support: "“The photo and slip show two different objects. How does that tell you what was in this box today?”",
        video: "“The clip shows me taking a box. How can you say you saw the necklace inside?”"
      });
      var relationLabel = exports('relationLabel', function relationLabel(s) {
        return s.trust >= 3 ? "Ready to investigate together" : s.trust >= 2 ? "Cautiously cooperating" : s.trust === 1 ? "Cooperation strained" : "No more private evidence shared";
      });
      function record(s, id, feature) {
        var _extends2, _extends3;
        if (s.committed || !s.opened.includes(id)) return s;
        var found = s.findings[id] || [];
        return _extends({}, s, {
          clues: s.clues.includes(id) ? s.clues : [].concat(s.clues, [id]),
          findings: _extends({}, s.findings, (_extends2 = {}, _extends2[id] = found.includes(feature) ? found : [].concat(found, [feature]), _extends2)),
          notes: _extends({}, s.notes, (_extends3 = {}, _extends3[id] = feature, _extends3))
        });
      }
      function selectNote(s, id, feature) {
        var _s$findings, _extends4;
        return !s.committed && (_s$findings = s.findings[id]) != null && _s$findings.includes(feature) ? _extends({}, s, {
          notes: _extends({}, s.notes, (_extends4 = {}, _extends4[id] = feature, _extends4))
        }) : s;
      }
      function judge(s, ids, relation) {
        if (s.committed || ids.length !== 2 || ids[0] === ids[1] || ids.some(function (id) {
          return !s.notes[id];
        })) return {
          state: s,
          result: 'invalid'
        };
        if (ids.some(function (id) {
          return s.notes[id] !== 'structure';
        })) return {
          state: s,
          result: relation === 'unrelated' ? 'excluded' : 'unrelated'
        };
        var pair = pairOf(ids[0], ids[1]);
        if (expected[pair] !== relation) return {
          state: s,
          result: 'wrong'
        };
        var links = s.links.includes(pair) ? s.links : [].concat(s.links, [pair]);
        return {
          state: _extends({}, s, {
            links: links,
            compared: readyForInference(links)
          }),
          result: 'recorded'
        };
      }
      // Drafting has no correctness oracle. Consequences begin only when a claim is spoken.
      function theoryIssue(s) {
        return !s.compared ? "Complete the cross-checks first." : !s.theory.contents || !s.theory.support || !s.theory.video ? "Complete both claims and their evidence. This is still a draft." : '';
      }
      function deduce(s) {
        return !s.committed && !theoryIssue(s) && s.clues.length === 3 ? _extends({}, s, {
          deduced: true,
          screen: 'choice'
        }) : s;
      }
      function faultsFor(t, links) {
        var f = [];
        if (t.contents !== 'sample') f.push('contents');
        if (t.support === 'photo-receipt' || !t.support || !links.includes(t.support)) f.push('support');
        if (t.video !== 'box') f.push('video');
        return f;
      }
      function choose(s, approach) {
        if (s.screen !== 'choice' || s.committed || !s.deduced || theoryIssue(s)) return s;
        var faults = faultsFor(s.theory, s.links),
          trust = approach === 'private' ? 3 : 2;
        return _extends({}, s, {
          committed: _extends({}, s.theory),
          approach: approach,
          faults: faults,
          trust: trust,
          screen: 'response',
          history: [approach === 'private' ? "Shared the explanation privately" : "Raised the explanation publicly", faults.length ? "Nina asked you to check a gap in your evidence" : approach === 'private' ? "Separated facts from assumptions; gained access to the phone index" : "Nina kept her phone private; the witnesses agreed to respond"]
        });
      }
      function review(s, e) {
        return s.committed && !s.result ? _extends({}, s, {
          reviewed: s.reviewed.includes(e) ? s.reviewed : [].concat(s.reviewed, [e])
        }) : s;
      }
      function proceed(s) {
        if (s.screen !== 'response') return s;
        return _extends({}, s, {
          screen: s.faults.length ? 'repair' : s.approach
        });
      }
      function repairClaim(s, retract) {
        if (s.screen !== 'repair' || s.repaired !== null) return s;
        var e = faultEvidence[s.faults[0]];
        if (retract && (!s.repair || !s.reviewed.includes(s.repair))) return s;
        if (retract && s.repair !== e) return _extends({}, s, {
          inquiry: _extends({}, s.inquiry, {
            feedback: "Nina: “That record doesn’t answer what I asked. Keep checking. I’m not ending the conversation because you looked at the wrong thing.”"
          })
        });
        var repaired = retract && s.repair === e;
        var line = repaired ? s.approach === 'public' ? "Corrected the claim publicly; kept the original records" : "Acknowledged the evidence’s limits; continued together" : retract ? "Withdrew the accusation without addressing her concern; cooperation remained closed" : "Stood by the accusation; Nina ended the conversation";
        return _extends({}, s, {
          repaired: repaired,
          trust: repaired ? s.trust : 0,
          screen: repaired ? s.approach : 'ending',
          result: repaired ? null : 'tentative',
          history: [].concat(s.history, [line])
        });
      }
      function availableRecords(s) {
        return !s.faults.length || s.repaired === true ? RECORDS : RECORDS.filter(function (r) {
          return r.id === 'b' || r.id === 'd';
        });
      }
      // Legacy workspace helpers retained for archived UI input; they never resolve a hypothesis.
      function addRecord(s, id) {
        return s;
      }
      function markGap(s, id) {
        return s;
      }
      function submitPrivate(s) {
        if (s.screen !== 'private' || s.result || s.inquiry.claims.includes('nina') || s.inquiry.privateVerified) return s;
        var ok = calibrationValid(s.inquiry);
        return _extends({}, s, {
          inquiry: _extends({}, s.inquiry, {
            privateVerified: ok,
            checks: s.inquiry.checks + 1,
            feedback: ok ? "Nina: “A fixed offset shifts both times equally. It can’t change the interval. We still need the originals to distinguish editing, speed changes and a clock problem.”" : "Nina: “Are both sides showing the same event? Put the two clocks on the same basis. Does your explanation fit both pairs of readings?”"
          }),
          history: ok ? [].concat(s.history, ["Calibrated two events; ruled out a fixed clock offset"]) : s.history
        });
      }
      function questionWitness(s, witness) {
        if (s.screen !== 'public' || s.result || s.inquiry.claims.includes(witness) || s.inquiry.accepted.includes(witness)) return s;
        var c = s.inquiry.drafts[witness],
          ok = chainValid(witness, c);
        var line = witness === 'leo' ? "Leo: “I recognized the box. I didn’t see inside it. That doesn’t prove it held the family necklace—or that it had to be the prop.”" : "Theo: “I take back my guarantee of an unbroken, original-speed recording. Request workstation B, reel W07. Speed changes and a clock problem still need checking.”";
        return _extends({}, s, {
          inquiry: _extends({}, s.inquiry, {
            checks: s.inquiry.checks + 1,
            accepted: ok ? [].concat(s.inquiry.accepted, [witness]) : s.inquiry.accepted,
            feedback: ok ? line : chainFeedback(witness, c)
          }),
          history: ok ? [].concat(s.history, [line]) : s.history
        });
      }
      function accuse(s, target) {
        if (s.result || !(s.screen === 'private' && target === 'nina' || s.screen === 'public' && target !== 'nina') || s.inquiry.claims.includes(target)) return s;
        var line = (target === 'nina' ? 'Nina' : target === 'leo' ? 'Leo' : "Theo") + ": “Your evidence doesn’t prove I did it. I’ll keep the existing records, but I won’t answer more questions.”";
        return _extends({}, s, {
          trust: Math.max(0, s.trust - 1),
          inquiry: _extends({}, s.inquiry, {
            claims: [].concat(s.inquiry.claims, [target]),
            feedback: line
          }),
          history: [].concat(s.history, ["Made an unsupported accusation; " + line])
        });
      }
      function requestOriginal(s, id) {
        if (s.screen !== 'private' || !s.inquiry.privateVerified || s.faults.length && s.repaired !== true || s.inquiry.claims.includes('nina') || !RECORDS.some(function (r) {
          return r.id === id;
        }) || s.inquiry.lead) return s;
        var ok = id === 'c';
        return _extends({}, s, {
          inquiry: _extends({}, s.inquiry, {
            lead: ok ? 'c' : null,
            checks: s.inquiry.checks + 1,
            feedback: ok ? "Nina: “C03 is 17:48 on the device, or 17:46 at the venue with that offset. It falls between the events. I’ve noted your request. We won’t know whether it’s readable or what it shows until we open it.”" : "Nina: “We need the gap between those two events. Convert this entry to venue time, then check where it falls.”"
          }),
          history: ok ? [].concat(s.history, ["Requested C03; its contents and readability remain unverified"]) : s.history
        });
      }
      function finish(s) {
        if (!['private', 'public'].includes(s.screen) || s.result) return s;
        var gap = s.approach === 'private' ? s.inquiry.privateVerified : s.inquiry.accepted.includes('photographer');
        var ok = s.approach === 'private' ? gap && s.inquiry.lead === 'c' : s.inquiry.accepted.length === 2;
        return _extends({}, s, {
          screen: 'ending',
          result: ok ? 'confirmed' : 'tentative',
          timelineFound: gap
        });
      }
      function restore(raw) {
        try {
          var s = JSON.parse(raw || 'null');
          var screens = ['intro', 'room', 'board', 'compare', 'deduction', 'choice', 'response', 'repair', 'private', 'public', 'ending'];
          if (!s || s.version !== 5 || !screens.includes(s.screen) || !Array.isArray(s.clues) || !Array.isArray(s.opened) || !Array.isArray(s.links) || !s.notes || !s.findings || typeof s.coatMoved !== 'boolean') return fresh();
          if (s.clues.some(function (x) {
            return !IDS.includes(x);
          }) || s.opened.some(function (x) {
            return !IDS.includes(x);
          }) || new Set(s.clues).size !== s.clues.length || s.clues.some(function (id) {
            return !s.opened.includes(id) || !Array.isArray(s.findings[id]) || !s.findings[id].includes(s.notes[id]) || s.findings[id].some(function (f) {
              return !['structure', 'writing', 'ornament'].includes(f);
            });
          })) return fresh();
          var validTheory = function validTheory(t) {
            return t && [null, 'original', 'sample'].includes(t.contents) && [null, 'box', 'original', 'sample'].includes(t.video) && [null, 'box-photo', 'box-receipt', 'photo-receipt'].includes(t.support);
          };
          if (!validTheory(s.theory) || s.links.some(function (p) {
            return !expected[p] || p.split('-').some(function (id) {
              var _s$findings2;
              return !((_s$findings2 = s.findings[id]) != null && _s$findings2.includes('structure'));
            });
          }) || new Set(s.links).size !== s.links.length || s.compared !== readyForInference(s.links)) return fresh();
          if (typeof s.deduced !== 'boolean' || typeof s.timelineFound !== 'boolean' || ![null, 'private', 'public'].includes(s.approach) || !Number.isInteger(s.trust) || s.trust < 0 || s.trust > 3 || ![null, true, false].includes(s.repaired) || ![null, 'confirmed', 'tentative'].includes(s.result)) return fresh();
          if (!inquiryValid(s.inquiry)) return fresh();
          if (['response', 'repair'].includes(s.screen) && JSON.stringify(_extends({}, s.inquiry, {
            feedback: ''
          })) !== JSON.stringify(freshInquiry())) return fresh();
          if (s.order.length || s.gap.length || s.scope || s.testimonies.length) return fresh();
          if (!Array.isArray(s.reviewed) || s.reviewed.some(function (e) {
            return !EXHIBITS[e];
          }) || ![null].concat(Object.keys(EXHIBITS)).includes(s.repair) || !Array.isArray(s.history) || s.history.some(function (x) {
            return typeof x !== 'string';
          }) || !Array.isArray(s.faults) || !Array.isArray(s.testimonies) || !Array.isArray(s.order) || !Array.isArray(s.gap) || ![null, 'unknown', 'deleted'].includes(s.scope)) return fresh();
          if (new Set(s.order).size !== s.order.length || s.order.some(function (id) {
            return !RECORDS.some(function (r) {
              return r.id === id;
            });
          }) || new Set(s.gap).size !== s.gap.length || s.gap.length > 2 || s.gap.some(function (id) {
            return !RECORDS.some(function (r) {
              return r.id === id;
            });
          })) return fresh();
          if (s.testimonies.length > 2 || new Set(s.testimonies.map(function (t) {
            return t.witness;
          })).size !== s.testimonies.length || s.testimonies.some(function (t) {
            return !['leo', 'photographer'].includes(t.witness) || !EXHIBITS[t.exhibit] || !s.reviewed.includes(t.exhibit) || !['clarify', 'accuse'].includes(t.question) || t.supported !== (t.question === 'clarify' && t.exhibit === (t.witness === 'leo' ? 'frames' : 'clock'));
          })) return fresh();
          if (s.committed) {
            if (!validTheory(s.committed) || JSON.stringify(s.theory) !== JSON.stringify(s.committed) || !s.approach || !s.deduced || theoryIssue(s) || JSON.stringify(s.faults) !== JSON.stringify(faultsFor(s.committed, s.links)) || !['response', 'repair', 'private', 'public', 'ending'].includes(s.screen)) return fresh();
          } else if (s.approach || s.faults.length || s.history.length || s.reviewed.length || s.repair || s.repaired !== null || s.order.length || s.gap.length || s.scope || s.testimonies.length || s.result || s.timelineFound || s.trust !== 2 || ['response', 'repair', 'private', 'public', 'ending'].includes(s.screen)) return fresh();
          if (s.screen === 'choice' && (!s.deduced || theoryIssue(s))) return fresh();
          if (s.screen === 'repair' && (!s.faults.length || s.repaired !== null) || s.screen === 'private' && s.approach !== 'private' || s.screen === 'public' && s.approach !== 'public' || s.screen === 'ending' && !s.result || s.screen !== 'ending' && s.result) return fresh();
          if (s.faults.length && ['private', 'public'].includes(s.screen) && s.repaired !== true) return fresh();
          if (s.result === 'confirmed' && (!s.timelineFound || s.faults.length && s.repaired !== true)) return fresh();
          // Derive consequences from committed actions, not editable trust/result flags.
          if (s.committed) {
            var initial = s.approach === 'private' ? 3 : 2;
            var base = s.repaired === null ? initial : s.repaired ? initial : 0;
            if (s.trust !== Math.max(0, base - s.inquiry.claims.length) || !s.faults.length && s.repaired !== null) return fresh();
            if (s.repaired === true && (s.repair !== faultEvidence[s.faults[0]] || !s.reviewed.includes(s.repair))) return fresh();
            if (s.approach === 'private' && (s.inquiry.accepted.length || s.inquiry.claims.some(function (w) {
              return w !== 'nina';
            }))) return fresh();
            if (s.approach === 'public' && (s.inquiry.privateVerified || s.inquiry.lead || s.inquiry.claims.includes('nina'))) return fresh();
            if (s.repaired === false && (s.screen !== 'ending' || s.result !== 'tentative' || s.timelineFound)) return fresh();
            if (s.screen === 'ending' && s.repaired !== false) {
              var gap = s.approach === 'private' ? s.inquiry.privateVerified : s.inquiry.accepted.includes('photographer');
              var ok = s.approach === 'private' ? gap && s.inquiry.lead === 'c' : s.inquiry.accepted.length === 2;
              if (s.timelineFound !== gap || s.result === 'confirmed' !== ok) return fresh();
            } else if (s.timelineFound) return fresh();
          } else if (JSON.stringify(s.inquiry) !== JSON.stringify(freshInquiry())) return fresh();
          return _extends({}, s, {
            screen: s.screen === 'compare' ? 'board' : s.screen
          });
        } catch (_unused) {
          return fresh();
        }
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