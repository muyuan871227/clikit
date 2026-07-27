// ===== DISH DATA =====
// All 6 Phase 1 dishes with full configuration

const DISHES = [
    {
        id: 'fried_egg',
        name: '黄油煎蛋',
        nameEn: 'Butter Fried Egg',
        cuisine: '基础',
        cuisineIcon: '🍳',
        gestureType: 'tap',
        gestureHint: '点击',
        gestureIcon: '👆',
        gestureDesc: '蛋白凝固的瞬间，点击出锅',
        heatSpeed: 0.8,       // %/second
        criticalMin: 65,      // critical zone start
        criticalMax: 92,      // critical zone end
        burnTime: 5,          // seconds after critical max before burn
        // Visual colors at different heat stages
        foodColors: {
            raw:     { fill: '#f5e6d0', ring: '#ffeedd', yolk: '#ffcc44' },
            cooking: { fill: '#f0d8b0', ring: '#ffe0c0', yolk: '#ffaa22' },
            perfect: { fill: '#e8c896', ring: '#ffd4a0', yolk: '#ff9900' },
            burnt:   { fill: '#8b6914', ring: '#a07020', yolk: '#885500' },
        },
        // Sensory explosion config
        explosion: {
            text: '完美凝固 · 蛋白质变性',
            subtext: '62°C 蛋白质开始凝固，形成如云朵般柔软的边缘',
            color: '#ffd700',
            particleColor: '#ffeecc',
        },
        // Cookbook knowledge
        knowledge: {
            title: '蛋白质变性反应',
            content: '鸡蛋在62°C时蛋白开始凝固，70°C时蛋黄开始变稠。完美的煎蛋需要中低温慢煎，让蛋白完全凝固而蛋黄保持流动。黄油不仅提供香气，其中的乳固体还会在煎制过程中轻微焦化，赋予煎蛋迷人的坚果香。',
        },
        story: '一颗完美的煎蛋，是每个厨师的起点，也是终极考验。看似简单，却需要对火候的极致掌控。',
        // Preview splash gradient
        previewGradient: 'radial-gradient(circle at 50% 45%, #ffcc44 0%, #ff9900 30%, #cc6600 60%, #1a1208 100%)',
    },
    {
        id: 'pepper_steak',
        name: '黑椒牛排',
        nameEn: 'Pepper Steak',
        cuisine: '烧烤',
        cuisineIcon: '🥩',
        gestureType: 'swipe_down',
        gestureHint: '下滑翻面',
        gestureIcon: '👇',
        gestureDesc: '焦化层形成的瞬间，快速下滑翻面',
        heatSpeed: 0.6,
        criticalMin: 75,
        criticalMax: 88,
        burnTime: 5,
        foodColors: {
            raw:     { fill: '#cc4455', ring: '#dd6677', detail: '#aa2233' },
            cooking: { fill: '#aa5544', ring: '#cc7766', detail: '#883322' },
            perfect: { fill: '#8b6040', ring: '#a07850', detail: '#6b4020' },
            burnt:   { fill: '#3a2a1a', ring: '#4a3020', detail: '#2a1a0a' },
        },
        explosion: {
            text: '完美焦化 · 美拉德反应',
            subtext: '140°C-165°C 氨基酸与还原糖反应，产生上千种风味化合物',
            color: '#ffd700',
            particleColor: '#ffddaa',
        },
        knowledge: {
            title: '美拉德反应',
            content: '美拉德反应是食物中氨基酸和还原糖在加热时发生的一系列复杂反应，产生棕色物质和丰富的风味化合物。这个反应在140°C-165°C之间最为活跃，正是牛排形成完美焦香表皮的温度区间。黑椒中的胡椒碱在高温下释放辛辣芳香，与美拉德产物完美融合。',
        },
        story: '一块完美的牛排，外焦里嫩。那道金棕色的焦化层，是时间与温度最精密的合作。',
        previewGradient: 'radial-gradient(circle at 50% 45%, #8b6040 0%, #6b4020 30%, #3a2010 60%, #1a0a05 100%)',
    },
    {
        id: 'tempura',
        name: '天妇罗',
        nameEn: 'Tempura',
        cuisine: '日式',
        cuisineIcon: '🍤',
        gestureType: 'swipe_up',
        gestureHint: '上滑出锅',
        gestureIcon: '☝️',
        gestureDesc: '面衣金黄酥脆的瞬间，上滑出锅',
        heatSpeed: 1.0,
        criticalMin: 78,
        criticalMax: 90,
        burnTime: 4,
        foodColors: {
            raw:     { fill: '#f5e8d0', ring: '#ffeedd', detail: '#e8d4b8' },
            cooking: { fill: '#e8cc88', ring: '#f0d898', detail: '#d4b870' },
            perfect: { fill: '#d4a040', ring: '#e0b050', detail: '#c09030' },
            burnt:   { fill: '#6b4010', ring: '#7a4a18', detail: '#5a3008' },
        },
        explosion: {
            text: '完美酥脆 · 水分蒸发临界',
            subtext: '180°C 面衣水分瞬间蒸发，形成层层酥脆的黄金外壳',
            color: '#ffe066',
            particleColor: '#fff5dd',
        },
        knowledge: {
            title: '酥脆的科学',
            content: '天妇罗面衣在180°C油温中，水分迅速蒸发产生大量气泡，形成酥脆的多孔结构。完美的天妇罗面衣应该轻薄如蝉翼，金黄透亮。日本料理人追求的是能听到面衣在耳边碎裂的声音——那是酥脆的最高境界。',
        },
        story: '天妇罗的极致，是把最新鲜的食材锁在最轻薄的外衣里。一秒之差，酥脆与油腻便是两个世界。',
        previewGradient: 'radial-gradient(circle at 50% 45%, #d4a040 0%, #c09030 30%, #806020 60%, #1a1208 100%)',
    },
    {
        id: 'miso_ramen',
        name: '味噌拉面',
        nameEn: 'Miso Ramen',
        cuisine: '日式',
        cuisineIcon: '🍜',
        gestureType: 'long_press',
        gestureHint: '长按收汁，松手',
        gestureIcon: '✊',
        gestureDesc: '汤底浓缩到完美稠度，长按后松手',
        heatSpeed: 0.5,
        criticalMin: 72,
        criticalMax: 88,
        burnTime: 6,
        foodColors: {
            raw:     { fill: '#f5e0c0', ring: '#ffe8d0', detail: '#e8d0a8' },
            cooking: { fill: '#cc8844', ring: '#dd9955', detail: '#bb7733' },
            perfect: { fill: '#b07030', ring: '#c08040', detail: '#a06020' },
            burnt:   { fill: '#5a3818', ring: '#6a4420', detail: '#4a2810' },
        },
        explosion: {
            text: '完美浓缩 · 鲜味共振',
            subtext: '味噌中的谷氨酸与昆布的肌苷酸产生鲜味协同效应，浓度提升8倍',
            color: '#ffcc66',
            particleColor: '#ffeebb',
        },
        knowledge: {
            title: '鲜味协同效应',
            content: '味噌中含有丰富的谷氨酸钠（天然味精），与昆布高汤中的肌苷酸相遇时，会产生鲜味的「协同效应」——两者结合产生的鲜味是各自单独存在时的8倍。这就是为什么味噌拉面的汤底如此令人上瘾。收汁的过程就是浓缩这种鲜味的过程。',
        },
        story: '一碗完美的拉面，汤底是灵魂。无数个小时的慢炖，只为那一口让人闭眼的浓醇。',
        previewGradient: 'radial-gradient(circle at 50% 50%, #cc8844 0%, #aa6633 30%, #664422 60%, #1a1008 100%)',
    },
    {
        id: 'souffle',
        name: '舒芙蕾',
        nameEn: 'Soufflé',
        cuisine: '法式',
        cuisineIcon: '🧁',
        gestureType: 'tap',
        gestureHint: '点击开炉门',
        gestureIcon: '👆',
        gestureDesc: '最高膨胀点前0.5秒，点击开炉门',
        heatSpeed: 0.4,
        criticalMin: 82,
        criticalMax: 92,
        burnTime: 4,
        foodColors: {
            raw:     { fill: '#fff5e0', ring: '#fffae8', detail: '#f0e0c0' },
            cooking: { fill: '#ffe8b8', ring: '#fff0cc', detail: '#f0d8a0' },
            perfect: { fill: '#e8c878', ring: '#f0d488', detail: '#d8b860' },
            burnt:   { fill: '#8b7030', ring: '#9a7838', detail: '#7a6020' },
        },
        explosion: {
            text: '完美膨胀 · 蛋白霜极限',
            subtext: '蛋白霜中的空气在烤箱中膨胀到极限，下一秒就会塌陷',
            color: '#fff0aa',
            particleColor: '#fffadd',
        },
        knowledge: {
            title: '蛋白霜膨胀原理',
            content: '舒芙蕾的膨胀来自蛋白霜中被搅打进去的空气气泡。在烤箱的高温下，这些气泡膨胀，同时蛋白质凝固将结构固定。完美的舒芙蕾需要在膨胀到最高点、结构刚刚固化的那一刻取出——早一秒不够蓬松，晚一秒便会塌陷。',
        },
        story: '舒芙蕾是甜品中最傲娇的存在。它不等人，只在那完美的一刻存在，然后消失。',
        previewGradient: 'radial-gradient(circle at 50% 45%, #ffe8b8 0%, #e8c878 30%, #c0a050 60%, #1a1408 100%)',
    },
    {
        id: 'salmon_sashimi',
        name: '三文鱼刺身',
        nameEn: 'Salmon Sashimi',
        cuisine: '日式',
        cuisineIcon: '🍣',
        gestureType: 'swipe_right',
        gestureHint: '横划切片',
        gestureIcon: '👉',
        gestureDesc: '力度与速度的完美控制，横划精准切片',
        heatSpeed: 0.7,
        criticalMin: 70,
        criticalMax: 85,
        burnTime: 5,
        foodColors: {
            raw:     { fill: '#ff8866', ring: '#ffaa88', detail: '#ff6644' },
            cooking: { fill: '#ff7755', ring: '#ff9977', detail: '#ff5533' },
            perfect: { fill: '#ff6644', ring: '#ff8866', detail: '#ee5533' },
            burnt:   { fill: '#884433', ring: '#995544', detail: '#773322' },
        },
        explosion: {
            text: '完美切割 · 纤维断面之美',
            subtext: '45度斜切，让三文鱼的脂肪纹理在断面形成最美的大理石花纹',
            color: '#ffaa88',
            particleColor: '#ffddcc',
        },
        knowledge: {
            title: '刺身的切割艺术',
            content: '刺身的切割不仅是技术，更是艺术。45度斜切（削ぎ切り）是最常用的手法，一刀入魂，让三文鱼丰富的脂肪纹理在断面完美呈现。刀工的关键在于：一刀切断，绝不来回拉锯。鱼肉的细胞在完美的一刀中保持完整，口感才能达到入口即化的境界。',
        },
        story: '刺身是对食材最高的敬意——不加任何烹饪，只用一刀，展现鱼肉最纯粹的美。',
        previewGradient: 'radial-gradient(circle at 50% 45%, #ff8866 0%, #ff6644 30%, #cc4422 60%, #1a0808 100%)',
    },
];

// Gesture type descriptions for UI
const GESTURE_TYPES = {
    tap: { icon: '👆', label: '点击', desc: '在临界时刻点击屏幕' },
    swipe_down: { icon: '👇', label: '下滑', desc: '快速向下滑动' },
    swipe_up: { icon: '☝️', label: '上滑', desc: '快速向上轻弹' },
    long_press: { icon: '✊', label: '长按松手', desc: '长按后在临界时刻松手' },
    swipe_right: { icon: '👉', label: '横划', desc: '从左向右精准横划' },
};

// Difficulty multipliers for critical zone width
const DIFFICULTY = {
    easy:   { label: '新手', multiplier: 1.5 },
    normal: { label: '普通', multiplier: 1.0 },
    hard:   { label: '挑战', multiplier: 0.7 },
};

// Get today's featured dish
function getTodayDish() {
    const hash = Utils.dayHash(Utils.today());
    return DISHES[hash % DISHES.length];
}
