// 题目框架库 - 200+ 条
// 每条: { id, category, depth(1-3), template }
// depth: 1=表层, 2=中层, 3=深层

const QUESTIONS = [
  // ===== 偏好与口味 (40条) =====
  { id: 1, category: '偏好', depth: 1, template: '我最喜欢的零食是______' },
  { id: 2, category: '偏好', depth: 1, template: '我最常点的奶茶是______' },
  { id: 3, category: '偏好', depth: 1, template: '我最喜欢的颜色是______' },
  { id: 4, category: '偏好', depth: 1, template: '我最爱看的电影类型是______' },
  { id: 5, category: '偏好', depth: 1, template: '我睡前一定要做的事是______' },
  { id: 6, category: '偏好', depth: 1, template: '我最讨厌的食物是______' },
  { id: 7, category: '偏好', depth: 1, template: '我最喜欢的季节是______' },
  { id: 8, category: '偏好', depth: 1, template: '我一个人的时候最爱做的事是______' },
  { id: 9, category: '偏好', depth: 1, template: '我最喜欢的音乐类型是______' },
  { id: 10, category: '偏好', depth: 1, template: '我永远点不了的菜是______' },
  { id: 11, category: '偏好', depth: 1, template: '我最喜欢的节日是______' },
  { id: 12, category: '偏好', depth: 1, template: '我每天一定要喝的饮料是______' },
  { id: 13, category: '偏好', depth: 1, template: '我最常用的App是______' },
  { id: 14, category: '偏好', depth: 2, template: '我最近沉迷的是______' },
  { id: 15, category: '偏好', depth: 2, template: '我偷偷关注但不告诉别人的明星是______' },
  { id: 16, category: '偏好', depth: 2, template: '我最反感别人做的一件事是______' },
  { id: 17, category: '偏好', depth: 2, template: '我理想中的周末是______' },
  { id: 18, category: '偏好', depth: 2, template: '我觉得最好吃的一顿饭是______' },
  { id: 19, category: '偏好', depth: 2, template: '我最想学会的技能是______' },
  { id: 20, category: '偏好', depth: 2, template: '我偷偷喜欢但觉得很幼稚的东西是______' },
  { id: 21, category: '偏好', depth: 2, template: '让我瞬间开心的小事是______' },
  { id: 22, category: '偏好', depth: 2, template: '我无法拒绝的诱惑是______' },
  { id: 23, category: '偏好', depth: 2, template: '我觉得被严重低估的一样东西是______' },
  { id: 24, category: '偏好', depth: 2, template: '我购物车里一直舍不得买的是______' },
  { id: 25, category: '偏好', depth: 3, template: '我有一个奇怪的癖好是______' },
  { id: 26, category: '偏好', depth: 3, template: '我觉得全世界只有我喜欢的一样东西是______' },
  { id: 27, category: '偏好', depth: 3, template: '如果只能吃一种食物过完一生，我选______' },
  { id: 28, category: '偏好', depth: 1, template: '我最喜欢的动物是______' },
  { id: 29, category: '偏好', depth: 1, template: '我最想去的城市是______' },
  { id: 30, category: '偏好', depth: 2, template: '我深夜偷偷看的是______' },
  { id: 31, category: '偏好', depth: 2, template: '我觉得最治愈的东西是______' },
  { id: 32, category: '偏好', depth: 1, template: '我最喜欢的天气是______' },
  { id: 33, category: '偏好', depth: 2, template: '我偷偷收藏了很多______的图片' },
  { id: 34, category: '偏好', depth: 3, template: '我从来不跟人说的小癖好是______' },
  { id: 35, category: '偏好', depth: 1, template: '我最喜欢的一个emoji是______' },
  { id: 36, category: '偏好', depth: 2, template: '我觉得最好闻的味道是______' },
  { id: 37, category: '偏好', depth: 2, template: '我对______有执念' },
  { id: 38, category: '偏好', depth: 3, template: '我暗暗觉得自己品味很好的一个领域是______' },
  { id: 39, category: '偏好', depth: 1, template: '我最喜欢的水果是______' },
  { id: 40, category: '偏好', depth: 2, template: '我觉得被高估的一样东西是______' },

  // ===== 秘密与隐藏 (40条) =====
  { id: 41, category: '秘密', depth: 1, template: '我最怕的是______' },
  { id: 42, category: '秘密', depth: 1, template: '我最尴尬的一次经历是______' },
  { id: 43, category: '秘密', depth: 2, template: '我手机里藏着______' },
  { id: 44, category: '秘密', depth: 2, template: '我从来不让人看到我______' },
  { id: 45, category: '秘密', depth: 2, template: '我偷偷做过但不想被发现的事是______' },
  { id: 46, category: '秘密', depth: 2, template: '我在别人面前装作不在意但其实很在意的是______' },
  { id: 47, category: '秘密', depth: 3, template: '我从来没告诉任何人的一个小秘密是______' },
  { id: 48, category: '秘密', depth: 3, template: '我最不想被别人知道的一面是______' },
  { id: 49, category: '秘密', depth: 1, template: '我最容易被什么感动到哭______' },
  { id: 50, category: '秘密', depth: 2, template: '我压力大的时候会偷偷______' },
  { id: 51, category: '秘密', depth: 2, template: '我最害怕失去的是______' },
  { id: 52, category: '秘密', depth: 3, template: '我对自己最不满意的地方是______' },
  { id: 53, category: '秘密', depth: 1, template: '我最大的坏习惯是______' },
  { id: 54, category: '秘密', depth: 2, template: '我假装不喜欢但其实很想要的是______' },
  { id: 55, category: '秘密', depth: 2, template: '我偷偷嫉妒过______' },
  { id: 56, category: '秘密', depth: 3, template: '我内心深处最脆弱的一点是______' },
  { id: 57, category: '秘密', depth: 1, template: '我最常说的口头禅是______' },
  { id: 58, category: '秘密', depth: 2, template: '我一个人偷偷哭过的原因是______' },
  { id: 59, category: '秘密', depth: 2, template: '我藏在抽屉最深处的东西是______' },
  { id: 60, category: '秘密', depth: 3, template: '我有一个再也不想提起的黑历史是______' },
  { id: 61, category: '秘密', depth: 1, template: '我生气的时候会______' },
  { id: 62, category: '秘密', depth: 2, template: '我对外说自己不在乎但偷偷在意的评价是______' },
  { id: 63, category: '秘密', depth: 2, template: '我见到喜欢的人会不自觉地______' },
  { id: 64, category: '秘密', depth: 3, template: '我心里一直有一件过不去的事是______' },
  { id: 65, category: '秘密', depth: 1, template: '我难过的时候最想做的事是______' },
  { id: 66, category: '秘密', depth: 2, template: '我浏览器历史记录里最不想被看到的是______' },
  { id: 67, category: '秘密', depth: 2, template: '我有一个无法改掉的怪癖是______' },
  { id: 68, category: '秘密', depth: 3, template: '我最深的恐惧是______' },
  { id: 69, category: '秘密', depth: 1, template: '我最后悔买的一样东西是______' },
  { id: 70, category: '秘密', depth: 2, template: '我曾经为了______撒过谎' },
  { id: 71, category: '秘密', depth: 2, template: '我偷偷觉得自己像______' },
  { id: 72, category: '秘密', depth: 3, template: '我最不想面对的真相是______' },
  { id: 73, category: '秘密', depth: 1, template: '别人不知道的是，我其实很______' },
  { id: 74, category: '秘密', depth: 2, template: '我微博/朋友圈偷偷设置了______' },
  { id: 75, category: '秘密', depth: 2, template: '我假装很擅长但其实完全不会的是______' },
  { id: 76, category: '秘密', depth: 3, template: '如果能删掉记忆中的一件事，我想删______' },
  { id: 77, category: '秘密', depth: 1, template: '我最怕的一种虫子/动物是______' },
  { id: 78, category: '秘密', depth: 2, template: '我在社交场合最怕遇到的情况是______' },
  { id: 79, category: '秘密', depth: 3, template: '我有一个从未实现的承诺是______' },
  { id: 80, category: '秘密', depth: 2, template: '我曾偷偷______但假装什么都没发生' },

  // ===== 过去与记忆 (30条) =====
  { id: 81, category: '记忆', depth: 1, template: '我小时候最想成为的职业是______' },
  { id: 82, category: '记忆', depth: 1, template: '我印象最深的一次旅行是去______' },
  { id: 83, category: '记忆', depth: 2, template: '我最难忘的一次大哭是因为______' },
  { id: 84, category: '记忆', depth: 2, template: '我后悔但不会说出口的是______' },
  { id: 85, category: '记忆', depth: 3, template: '我最后悔的一个决定是______' },
  { id: 86, category: '记忆', depth: 1, template: '我人生中最开心的一天是______' },
  { id: 87, category: '记忆', depth: 2, template: '改变了我人生轨迹的一件事是______' },
  { id: 88, category: '记忆', depth: 2, template: '我曾经以为自己会一直______' },
  { id: 89, category: '记忆', depth: 3, template: '我最想回到过去改变的一件事是______' },
  { id: 90, category: '记忆', depth: 1, template: '我小时候最爱看的动画片是______' },
  { id: 91, category: '记忆', depth: 2, template: '对我影响最大的一个人是______' },
  { id: 92, category: '记忆', depth: 2, template: '我收到过最感动的礼物是______' },
  { id: 93, category: '记忆', depth: 3, template: '我曾经差点______' },
  { id: 94, category: '记忆', depth: 1, template: '我第一份工作/实习是______' },
  { id: 95, category: '记忆', depth: 2, template: '我最怀念的一段时光是______' },
  { id: 96, category: '记忆', depth: 2, template: '我曾为一个人做过最疯狂的事是______' },
  { id: 97, category: '记忆', depth: 3, template: '我生命中最痛苦的一段经历是______' },
  { id: 98, category: '记忆', depth: 1, template: '我上学时最擅长的科目是______' },
  { id: 99, category: '记忆', depth: 2, template: '我最尴尬的一次公开场合经历是______' },
  { id: 100, category: '记忆', depth: 2, template: '有一句话一直刻在我心里，那就是______' },
  { id: 101, category: '记忆', depth: 3, template: '我再也不想经历的事情是______' },
  { id: 102, category: '记忆', depth: 1, template: '我学生时代最叛逆的一件事是______' },
  { id: 103, category: '记忆', depth: 2, template: '我到现在还保留着的一样东西是______' },
  { id: 104, category: '记忆', depth: 2, template: '我第一次意识到自己长大了是______' },
  { id: 105, category: '记忆', depth: 3, template: '如果能给过去的自己说一句话，我想说______' },
  { id: 106, category: '记忆', depth: 1, template: '我小时候的外号是______' },
  { id: 107, category: '记忆', depth: 2, template: '我曾经暗恋过的人的类型是______' },
  { id: 108, category: '记忆', depth: 2, template: '我做过最勇敢的一件事是______' },
  { id: 109, category: '记忆', depth: 3, template: '我心里一直有个遗憾是______' },
  { id: 110, category: '记忆', depth: 1, template: '我小时候最害怕的事是______' },

  // ===== 关于「我们」(40条) =====
  { id: 111, category: '我们', depth: 1, template: '我们第一次见面的地方是______' },
  { id: 112, category: '我们', depth: 1, template: '第一次见她时我觉得她______' },
  { id: 113, category: '我们', depth: 2, template: '如果有一件事我希望她早点告诉我，是______' },
  { id: 114, category: '我们', depth: 2, template: '她做过让我最感动的一件事是______' },
  { id: 115, category: '我们', depth: 1, template: '我们一起做过最搞笑的事是______' },
  { id: 116, category: '我们', depth: 2, template: '她身上我最羡慕的一点是______' },
  { id: 117, category: '我们', depth: 2, template: '她不知道的是，我曾经因为她______' },
  { id: 118, category: '我们', depth: 3, template: '我和她之间有一件事我从来没提过______' },
  { id: 119, category: '我们', depth: 1, template: '我们最常一起做的事是______' },
  { id: 120, category: '我们', depth: 2, template: '她让我改变的一个观念是______' },
  { id: 121, category: '我们', depth: 2, template: '我觉得我们最像的地方是______' },
  { id: 122, category: '我们', depth: 3, template: '我曾经差点和她______' },
  { id: 123, category: '我们', depth: 1, template: '我们之间的一个默契暗号是______' },
  { id: 124, category: '我们', depth: 2, template: '她说过让我印象最深的一句话是______' },
  { id: 125, category: '我们', depth: 2, template: '我最想和她一起去的地方是______' },
  { id: 126, category: '我们', depth: 3, template: '如果她明天消失，我最后悔没做的事是______' },
  { id: 127, category: '我们', depth: 1, template: '她的口头禅是______' },
  { id: 128, category: '我们', depth: 2, template: '我觉得她最不了解我的一点是______' },
  { id: 129, category: '我们', depth: 2, template: '我们吵过最严重的一次是因为______' },
  { id: 130, category: '我们', depth: 3, template: '她不知道，每次她______的时候我都很心疼' },
  { id: 131, category: '我们', depth: 1, template: '我给她取的外号是______' },
  { id: 132, category: '我们', depth: 2, template: '她最让我受不了的一个习惯是______' },
  { id: 133, category: '我们', depth: 2, template: '我们一起经历过最难忘的事是______' },
  { id: 134, category: '我们', depth: 3, template: '我一直想对她说但说不出口的是______' },
  { id: 135, category: '我们', depth: 1, template: '她最常安慰我的方式是______' },
  { id: 136, category: '我们', depth: 2, template: '我觉得她对我最大的误解是______' },
  { id: 137, category: '我们', depth: 2, template: '我们的友情差点结束过的原因是______' },
  { id: 138, category: '我们', depth: 3, template: '在她面前我从来不敢表现出的情绪是______' },
  { id: 139, category: '我们', depth: 1, template: '我们一起吃过最好吃的一顿是______' },
  { id: 140, category: '我们', depth: 2, template: '她最不知道的是我其实很感谢她______' },
  { id: 141, category: '我们', depth: 2, template: '我觉得我们最不像的地方是______' },
  { id: 142, category: '我们', depth: 3, template: '关于她，我藏在心里最久的话是______' },
  { id: 143, category: '我们', depth: 1, template: '她最常穿的衣服风格是______' },
  { id: 144, category: '我们', depth: 2, template: '我和她之间有一个只有我们懂的梗是______' },
  { id: 145, category: '我们', depth: 2, template: '她做过让我最生气的一件事是______' },
  { id: 146, category: '我们', depth: 3, template: '我最怕有一天我们会______' },
  { id: 147, category: '我们', depth: 1, template: '她最喜欢吃的东西是______' },
  { id: 148, category: '我们', depth: 2, template: '我第一次觉得她是真朋友是因为______' },
  { id: 149, category: '我们', depth: 2, template: '如果要用三个词形容我们的友情，是______' },
  { id: 150, category: '我们', depth: 3, template: '我们之间我最想修复的一件事是______' },

  // ===== 未来与愿望 (30条) =====
  { id: 151, category: '未来', depth: 1, template: '我五年后最想过的生活是______' },
  { id: 152, category: '未来', depth: 1, template: '我最想去旅行的国家是______' },
  { id: 153, category: '未来', depth: 2, template: '我有一个从没跟任何人提过的梦想是______' },
  { id: 154, category: '未来', depth: 2, template: '如果明天要消失，我最想告诉她的一件事是______' },
  { id: 155, category: '未来', depth: 3, template: '我内心真正想要的生活是______' },
  { id: 156, category: '未来', depth: 1, template: '如果中了一千万，我第一件事要______' },
  { id: 157, category: '未来', depth: 2, template: '如果只能带一个人去旅行，我选______' },
  { id: 158, category: '未来', depth: 2, template: '我偷偷计划过但还没实现的事是______' },
  { id: 159, category: '未来', depth: 3, template: '我最害怕的未来是______' },
  { id: 160, category: '未来', depth: 1, template: '我明年最想实现的目标是______' },
  { id: 161, category: '未来', depth: 2, template: '如果可以换一种人生，我想成为______' },
  { id: 162, category: '未来', depth: 2, template: '我一直在犹豫要不要去做的事是______' },
  { id: 163, category: '未来', depth: 3, template: '十年后回看现在，我最想告诉自己的是______' },
  { id: 164, category: '未来', depth: 1, template: '我退休后最想做的事是______' },
  { id: 165, category: '未来', depth: 2, template: '我暗暗下过决心但从没行动的是______' },
  { id: 166, category: '未来', depth: 2, template: '如果这是最后一天，我会______' },
  { id: 167, category: '未来', depth: 3, template: '我对「成功」的真实定义是______' },
  { id: 168, category: '未来', depth: 1, template: '我最想拥有的超能力是______' },
  { id: 169, category: '未来', depth: 2, template: '我在等一个合适的时机去做的事是______' },
  { id: 170, category: '未来', depth: 2, template: '我希望十年后的自己记住的一件事是______' },
  { id: 171, category: '未来', depth: 3, template: '我这辈子一定要完成的一件事是______' },
  { id: 172, category: '未来', depth: 1, template: '如果能穿越到未来看一眼，我最想知道______' },
  { id: 173, category: '未来', depth: 2, template: '我想改变自己的一个特质是______' },
  { id: 174, category: '未来', depth: 2, template: '我暗暗期待的一件事是______' },
  { id: 175, category: '未来', depth: 3, template: '我最不想变成的那种人是______' },
  { id: 176, category: '未来', depth: 1, template: '如果重新选专业/职业，我会选______' },
  { id: 177, category: '未来', depth: 2, template: '我愿意为______放弃所有' },
  { id: 178, category: '未来', depth: 3, template: '我最深处的野心是______' },
  { id: 179, category: '未来', depth: 1, template: '我最想养的宠物是______' },
  { id: 180, category: '未来', depth: 2, template: '我偷偷幻想过的生活场景是______' },

  // ===== 当下感受 (20条) =====
  { id: 181, category: '当下', depth: 1, template: '此刻我最想吃的是______' },
  { id: 182, category: '当下', depth: 1, template: '今天让我最开心的事是______' },
  { id: 183, category: '当下', depth: 2, template: '此刻我最想逃到的地方是______' },
  { id: 184, category: '当下', depth: 2, template: '今天我心里有一件事还没说出来是______' },
  { id: 185, category: '当下', depth: 3, template: '此刻我脑海里反复想的一件事是______' },
  { id: 186, category: '当下', depth: 1, template: '我现在最期待的事是______' },
  { id: 187, category: '当下', depth: 2, template: '我现在最焦虑的事是______' },
  { id: 188, category: '当下', depth: 2, template: '如果此刻可以做任何事，我想______' },
  { id: 189, category: '当下', depth: 3, template: '我现在最需要但得不到的是______' },
  { id: 190, category: '当下', depth: 1, template: '我今天的心情用一个词形容是______' },
  { id: 191, category: '当下', depth: 2, template: '此刻最让我烦恼的是______' },
  { id: 192, category: '当下', depth: 2, template: '我今天假装没事但其实______' },
  { id: 193, category: '当下', depth: 3, template: '如果此刻能消除一种情绪，我想消除______' },
  { id: 194, category: '当下', depth: 1, template: '我此刻最想见的人是______' },
  { id: 195, category: '当下', depth: 2, template: '我最近一直在纠结的事是______' },
  { id: 196, category: '当下', depth: 2, template: '现在的我和一年前最大的变化是______' },
  { id: 197, category: '当下', depth: 3, template: '我现在最不想面对的事是______' },
  { id: 198, category: '当下', depth: 1, template: '我现在最想感谢的人是______' },
  { id: 199, category: '当下', depth: 2, template: '此刻如果能打一个电话，我想打给______' },
  { id: 200, category: '当下', depth: 3, template: '我此刻内心真实的感受是______' },
];

// 第3轮「共同记忆」专用题目框架
const SHARED_MEMORY_QUESTIONS = [
  { id: 301, template: '我们第一次见面时，我的第一印象是______' },
  { id: 302, template: '我们一起做过最疯狂的事是______' },
  { id: 303, template: '我们之间最搞笑的一个梗是______' },
  { id: 304, template: '我们吵过最凶的一次是因为______' },
  { id: 305, template: '我们一起吃过最好吃的是______' },
  { id: 306, template: '她帮过我最大的一次忙是______' },
  { id: 307, template: '我们一起熬过最晚的一次是______' },
  { id: 308, template: '我们的友情里最重要的一刻是______' },
  { id: 309, template: '我们说过最多次的一句话是______' },
  { id: 310, template: '最能代表我们友情的一首歌/一部电影是______' },
  { id: 311, template: '我们认识这么久最大的变化是______' },
  { id: 312, template: '我们一起经历过最难的一段时间是______' },
  { id: 313, template: '她教会我的最重要的一件事是______' },
  { id: 314, template: '我们之间有一件事每次提起都会笑的是______' },
  { id: 315, template: '我觉得我们友情能持续这么久的原因是______' },
];

// 按深度获取题目
function getQuestionsByDepth(depth) {
  return QUESTIONS.filter(q => q.depth === depth);
}

// 按分类获取题目
function getQuestionsByCategory(category) {
  return QUESTIONS.filter(q => q.category === category);
}

// 随机获取指定数量的题目（按深度权重，根据认识时长调整）
function getRandomQuestions(count, friendshipLevel) {
  // friendshipLevel: 1=刚认识, 2=半年以上, 3=老朋友
  const weights = {
    1: { 1: 0.6, 2: 0.3, 3: 0.1 },
    2: { 1: 0.3, 2: 0.5, 3: 0.2 },
    3: { 1: 0.2, 2: 0.4, 3: 0.4 },
  };
  const w = weights[friendshipLevel] || weights[2];

  const pool = [];
  QUESTIONS.forEach(q => {
    const copies = Math.ceil(w[q.depth] * 10);
    for (let i = 0; i < copies; i++) pool.push(q);
  });

  // Shuffle and pick unique
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = [];
  const usedIds = new Set();
  for (const q of shuffled) {
    if (!usedIds.has(q.id) && selected.length < count) {
      selected.push(q);
      usedIds.add(q.id);
    }
  }
  return selected;
}

// 随机获取共同记忆题
function getSharedMemoryQuestions(count) {
  const shuffled = [...SHARED_MEMORY_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// === 迷惑项自动生成系统 ===
// 每道题目配备候选答案池，系统从中随机挑选3个与真实答案不同的作为迷惑项

const DECOY_POOLS = {
  // 按题目ID精准匹配
  1: ['薯片','辣条','巧克力','果冻','饼干','坚果','奶糖','海苔','牛肉干','冰淇淋','蛋糕','棉花糖','麻花','话梅','瓜子'],
  2: ['珍珠奶茶','芋泥啵啵','杨枝甘露','椰椰拿铁','葡萄冰茶','草莓奶昔','抹茶拿铁','烧仙草','水果茶','蜜桃乌龙','柠檬茶','可可牛奶','黑糖鹿丸','芝芝莓莓','生椰拿铁'],
  3: ['粉色','蓝色','绿色','白色','黑色','紫色','红色','橙色','黄色','灰色','薄荷绿','天蓝色','米白色','珊瑚色'],
  4: ['喜剧','爱情','悬疑','恐怖','科幻','动画','纪录片','战争','奇幻','动作','文艺','犯罪','音乐','冒险'],
  5: ['刷手机','看书','听音乐','敷面膜','打游戏','追剧','写日记','冥想','喝热水','拉伸运动','刷社交媒体','和朋友聊天','发呆','吃零食'],
  6: ['香菜','苦瓜','肥肉','榴莲','芹菜','茄子','腰子','折耳根','秋葵','洋葱','青椒','胡萝卜','皮蛋','鱼腥草'],
  7: ['春天','夏天','秋天','冬天'],
  8: ['看剧','打游戏','睡觉','听歌','画画','逛街','做饭','运动','看书','刷手机','泡澡','收拾房间','弹琴','写东西'],
  9: ['流行','摇滚','古典','爵士','R&B','电子','民谣','嘻哈','轻音乐','日系','韩流','独立音乐','蓝调','乡村'],
  10: ['螺蛳粉','猪脚饭','臭豆腐','炒肝','豆汁','牛杂','毛血旺','鸡爪','鳝鱼','蛇肉','虫子','生蚝','皮蛋瘦肉粥','鱼头'],
  28: ['猫','狗','兔子','仓鼠','熊猫','企鹅','海豚','猫头鹰','柴犬','鹦鹉','小鹿','水獭','刺猬','狐狸'],
  29: ['东京','巴黎','纽约','伦敦','首尔','曼谷','墨尔本','冰岛','瑞士','新西兰','北海道','马尔代夫','希腊','意大利'],
  35: ['😂','🥰','😭','🤔','👍','❤️','🙃','😊','🥺','😎','🤣','💀','🫠','✨'],
  39: ['草莓','西瓜','芒果','葡萄','樱桃','蓝莓','苹果','橙子','桃子','荔枝','榴莲','猕猴桃','菠萝','山竹'],
  41: ['蟑螂','蜘蛛','蛇','黑暗','打雷','深海','坐飞机','幽闭空间','社交','孤独','被抛弃','失控','考试','迟到'],
  77: ['蟑螂','蜘蛛','蜈蚣','蛇','蚂蟥','老鼠','壁虎','蝎子','马蜂','水蛭','毛毛虫','苍蝇','蚊子','蜜蜂'],
  81: ['医生','老师','科学家','画家','宇航员','明星','厨师','警察','律师','作家','歌手','运动员','动物园管理员','超级英雄'],
  90: ['哆啦A梦','灌篮高手','蜡笔小新','海贼王','猫和老鼠','喜羊羊','名侦探柯南','数码宝贝','美少女战士','龙珠','火影忍者','天线宝宝','虹猫蓝兔','大耳朵图图'],
  98: ['语文','数学','英语','物理','化学','生物','历史','地理','体育','美术','音乐','政治','信息技术','心理学'],
  152: ['日本','冰岛','新西兰','挪威','瑞士','希腊','意大利','法国','西班牙','澳大利亚','加拿大','英国','韩国','埃及'],
  156: ['环球旅行','买房','捐款','辞职','开店','投资','送爸妈','请朋友吃饭','买车','存起来','出国留学','全部花光','创业','买奢侈品'],
  168: ['隐身','飞行','读心术','时间暂停','瞬移','治愈能力','变身','控制天气','超强记忆','预知未来','不用睡觉','说所有语言','复制自己','控制时间'],
  179: ['猫','狗','兔子','仓鼠','乌龟','金鱼','鹦鹉','柯基','布偶猫','柴犬','小鹿','龙猫','刺猬','蜥蜴'],
};

// 通用答案池（按题目分类，当没有精准匹配时使用）
const CATEGORY_DECOY_POOLS = {
  '偏好': [
    '看电影','听音乐','喝奶茶','吃火锅','逛街','拍照','旅行','画画','追剧','打游戏',
    '做甜点','健身','看书','弹吉他','写手账','跳舞','唱歌','骑自行车','看日落','泡温泉',
    '吃烤肉','学外语','整理房间','拼乐高','摄影','冲浪','滑雪','蹦极','做瑜伽','养花',
    '喝咖啡','看展览','去市集','看星星','做手工','玩桌游','钓鱼','爬山','骑马','看演唱会'
  ],
  '秘密': [
    '偷偷哭过','假装坚强','在意别人的看法','害怕孤独','对自己不够自信','表面开朗内心敏感',
    '很容易吃醋','经常后悔说过的话','喜欢一个人待着','害怕被忽视','会因为小事难过很久',
    '不敢表达真实想法','讨厌社交但装得很好','很依赖某个人','有选择恐惧症','经常自我怀疑',
    '看到感动的东西会偷偷流泪','害怕让别人失望','不想长大','曾经想过放弃一切',
    '对未来感到迷茫','嘴硬心软','容易心疼别人','很在意朋友的评价','假装不在乎'
  ],
  '记忆': [
    '第一天上学','搬新家','第一次坐飞机','和好朋友大吵一架','收到意外的礼物',
    '被老师表扬','考试失利','第一次旅行','失去重要的东西','一次难忘的生日',
    '转学的那天','毕业典礼','第一次独自出远门','和家人的一次旅行','一次误会',
    '深夜和朋友长聊','第一次做饭','一次意外的惊喜','搬到新城市','拿到录取通知书'
  ],
  '我们': [
    '一起逃课','深夜长聊','一起大哭','一起旅行','互相安慰','分享秘密',
    '一起追星','互相吐槽','帮对方出主意','一起熬夜','分享好吃的','互相壮胆',
    '一起做傻事','帮对方打掩护','分享喜欢的歌','一起看电影','一起逛街',
    '互相鼓励','一起减肥','一起吐槽别人','分享各自的八卦','深夜开车聊心事'
  ],
  '未来': [
    '环球旅行','开一家小店','住在海边','学会一门乐器','写一本书','去北极',
    '学会做饭','养一只猫','开咖啡馆','回到小时候','成为自由职业者','学画画',
    '住在森林里','开房车旅行','做一个好妈妈/爸爸','去蹦极','学潜水',
    '拥有一个花园','去非洲看动物','过简单的生活','学摄影','成为美食博主'
  ],
  '当下': [
    '开心','平静','焦虑','无聊','期待','感恩','疲惫','纠结','轻松','迷茫',
    '兴奋','满足','烦躁','孤独','幸福','紧张','释然','怀念','充实','惆怅',
    '安心','不安','自在','压抑','欣慰','复杂','淡定','忐忑','温暖','空虚'
  ],
};

// 为指定题目生成3个迷惑项
function generateDecoys(questionId, category, realAnswer) {
  // 优先使用精准匹配池
  let pool = DECOY_POOLS[questionId] || CATEGORY_DECOY_POOLS[category] || CATEGORY_DECOY_POOLS['偏好'];

  // 过滤掉与真实答案相同或太相似的
  const normalizedAnswer = realAnswer.trim().toLowerCase();
  pool = pool.filter(item => {
    const normalizedItem = item.trim().toLowerCase();
    return normalizedItem !== normalizedAnswer && !normalizedItem.includes(normalizedAnswer) && !normalizedAnswer.includes(normalizedItem);
  });

  // 如果池子太小，补充通用词
  if (pool.length < 3) {
    const fallback = ['选项A', '选项B', '选项C', '选项D', '其他'];
    pool = [...pool, ...fallback];
  }

  // 随机挑选3个
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
