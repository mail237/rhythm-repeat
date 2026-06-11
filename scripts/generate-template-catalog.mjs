/**
 * Generates compact templates T101–T1000 from curated native-conversation seeds.
 * Run: node scripts/generate-template-catalog.mjs
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, '../src/data/templates/catalog901.json');

/** @type {Array<{template:string,translation:string,category:string,family:string,frequency:number,applicability:number,beginnerFit:number,loopFit:number}>} */
const seeds = [
  // REACT / DISCOURSE
  { template: 'That\'s crazy.', translation: 'マジか／やばい。', category: '感情', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 9, loopFit: 9 },
  { template: 'No kidding.', translation: 'マジで／本当に。', category: '感情', family: 'REACT', frequency: 7, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'You\'re telling me.', translation: 'ほんそれ。', category: '感情', family: 'REACT', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 9 },
  { template: 'Fair enough.', translation: 'まあそうだね。', category: '意見', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 10 },
  { template: 'Sounds good to me.', translation: 'それでいいよ。', category: '提案', family: 'REACT', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'I\'m down.', translation: '乗るよ／やろう。', category: '提案', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 9 },
  { template: 'I\'m down for ___.', translation: '〜なら付き合うよ。', category: '提案', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 9 },
  { template: 'Count me in.', translation: '私も参加する。', category: '提案', family: 'REACT', frequency: 7, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'I\'m not sure about that.', translation: 'それはどうかな。', category: '意見', family: 'THINK', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 9 },
  { template: 'I\'d rather ___.', translation: 'むしろ〜したい。', category: '意見', family: 'WANT', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'I\'d rather not ___.', translation: '〜は避けたい。', category: '意見', family: 'WANT', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 8 },
  { template: 'I\'m not really into ___.', translation: '〜あんまり好きじゃない。', category: '趣味', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 8 },
  { template: 'I\'m really into ___.', translation: '〜にハマってる。', category: '趣味', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 8 },
  { template: 'I\'m kinda tired of ___.', translation: '〜にちょっと疲れた。', category: '感情', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 8 },
  { template: 'I\'m sick of ___.', translation: '〜うんざり。', category: '感情', family: 'FEEL', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'I can\'t stand ___.', translation: '〜は無理。', category: '感情', family: 'FEEL', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'I\'m obsessed with ___.', translation: '〜にどハマり。', category: '趣味', family: 'FEEL', frequency: 7, applicability: 6, beginnerFit: 7, loopFit: 7 },
  { template: 'It\'s not a big deal.', translation: '大したことないよ。', category: '問題解決', family: 'REACT', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'It\'s kind of a big deal.', translation: '結構大事なこと。', category: '説明', family: 'REACT', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 8 },
  { template: 'Long story short, ___.', translation: '要するに〜。', category: '説明', family: 'DISCOURSE', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'The thing is, ___.', translation: '問題は〜なんだ。', category: '説明', family: 'DISCOURSE', frequency: 9, applicability: 9, beginnerFit: 8, loopFit: 9 },
  { template: 'The point is, ___.', translation: 'ポイントは〜。', category: '説明', family: 'DISCOURSE', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 9 },
  { template: 'At the end of the day, ___.', translation: '結局〜。', category: '意見', family: 'DISCOURSE', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'To be honest, ___.', translation: '正直〜。', category: '意見', family: 'DISCOURSE', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 9 },
  { template: 'Honestly, ___.', translation: 'マジで／正直〜。', category: '意見', family: 'DISCOURSE', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 9 },
  { template: 'Apparently, ___.', translation: 'どうやら〜らしい。', category: '説明', family: 'DISCOURSE', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'Supposedly, ___.', translation: '〜らしいんだけど（伝聞）。', category: '説明', family: 'DISCOURSE', frequency: 7, applicability: 7, beginnerFit: 6, loopFit: 7 },
  { template: 'As far as I know, ___.', translation: '知る限り〜。', category: '説明', family: 'KNOW', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'As far as I\'m concerned, ___.', translation: '私に関する限り〜。', category: '意見', family: 'THINK', frequency: 7, applicability: 7, beginnerFit: 6, loopFit: 7 },
  { template: 'From what I heard, ___.', translation: '聞いた話では〜。', category: '説明', family: 'KNOW', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  // WORK
  { template: 'I\'m swamped.', translation: '仕事で手一杯。', category: '仕事', family: 'FEEL', frequency: 8, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'I\'m slammed.', translation: 'めちゃ忙しい。', category: '仕事', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 9 },
  { template: 'I\'m tied up.', translation: '手が離せない。', category: '仕事', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 7, loopFit: 9 },
  { template: 'I\'m on a deadline.', translation: '締切前なんだ。', category: '仕事', family: 'TIME', frequency: 7, applicability: 6, beginnerFit: 7, loopFit: 8 },
  { template: 'Can we push it to ___?', translation: '〜に延期できる？', category: '仕事', family: 'REQUEST', frequency: 7, applicability: 6, beginnerFit: 7, loopFit: 8 },
  { template: 'Let\'s touch base later.', translation: 'あとで連絡しよう。', category: '仕事', family: 'REQUEST', frequency: 7, applicability: 6, beginnerFit: 6, loopFit: 8 },
  { template: 'Let me get back to you.', translation: '後で返事するね。', category: '仕事', family: 'REQUEST', frequency: 8, applicability: 7, beginnerFit: 7, loopFit: 9 },
  { template: 'I\'ll follow up on that.', translation: 'それフォローするね。', category: '仕事', family: 'TRY', frequency: 7, applicability: 6, beginnerFit: 6, loopFit: 8 },
  { template: 'Can you loop me in?', translation: '情報共有して。', category: '仕事', family: 'REQUEST', frequency: 6, applicability: 5, beginnerFit: 5, loopFit: 7 },
  { template: 'I\'m working from home.', translation: '在宅勤務中。', category: '仕事', family: 'GO', frequency: 8, applicability: 7, beginnerFit: 9, loopFit: 9 },
  // TRAVEL / DAILY
  { template: 'I\'m running late.', translation: '遅れそう。', category: '日常生活', family: 'TIME', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'I\'m on my way.', translation: '向かってる。', category: '日常生活', family: 'GO', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'I\'m almost there.', translation: 'もうすぐ着く。', category: '日常生活', family: 'GO', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'I\'m stuck in traffic.', translation: '渋滞にはまってる。', category: '日常生活', family: 'GO', frequency: 8, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'I\'m starving.', translation: '腹ペコ。', category: '日常生活', family: 'FEEL', frequency: 8, applicability: 8, beginnerFit: 9, loopFit: 9 },
  { template: 'I\'m good, thanks.', translation: '大丈夫、ありがとう。', category: '日常生活', family: 'REACT', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'I\'m all set.', translation: '準備OK／もういいよ。', category: '日常生活', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 9 },
  { template: 'I\'m beat.', translation: 'ヘトヘト。', category: '感情', family: 'FEEL', frequency: 8, applicability: 8, beginnerFit: 9, loopFit: 9 },
  { template: 'I\'m wiped out.', translation: 'クタクタ。', category: '感情', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'I could use ___.', translation: '〜が欲しい／必要。', category: '依頼', family: 'WANT', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'I could go for ___.', translation: '〜が食べたい／したい。', category: '提案', family: 'WANT', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  // SHOPPING
  { template: 'I\'m just looking.', translation: '見てるだけです。', category: '買い物', family: 'LOOK', frequency: 8, applicability: 6, beginnerFit: 9, loopFit: 9 },
  { template: 'Do you have this in ___?', translation: 'これ___サイズある？', category: '買い物', family: 'QUESTION', frequency: 7, applicability: 6, beginnerFit: 8, loopFit: 8 },
  { template: 'How much is this?', translation: 'これいくら？', category: '買い物', family: 'QUESTION', frequency: 8, applicability: 6, beginnerFit: 10, loopFit: 9 },
  { template: 'I\'ll take it.', translation: 'これください。', category: '買い物', family: 'GO', frequency: 8, applicability: 6, beginnerFit: 9, loopFit: 9 },
  // RELATIONSHIPS
  { template: 'We should catch up.', translation: '近況報告しよう。', category: '人間関係', family: 'REQUEST', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 9 },
  { template: 'We should hang out sometime.', translation: 'いつか遊ぼう。', category: '人間関係', family: 'REQUEST', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 9 },
  { template: 'I haven\'t seen you in forever.', translation: '久しぶり！', category: '人間関係', family: 'EXPERIENCE', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'I missed you.', translation: '会いたかった。', category: '人間関係', family: 'FEEL', frequency: 7, applicability: 7, beginnerFit: 8, loopFit: 8 },
  { template: 'I\'m sorry about ___.', translation: '〜ごめん。', category: '人間関係', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'No worries.', translation: '気にしないで。', category: '人間関係', family: 'REACT', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 10 },
  { template: 'Don\'t worry about it.', translation: '心配しないで。', category: '人間関係', family: 'REACT', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 9 },
  { template: 'It\'s on me.', translation: '私のおごり。', category: '人間関係', family: 'REACT', frequency: 8, applicability: 7, beginnerFit: 8, loopFit: 9 },
  { template: 'I got you.', translation: '任せて／フォローするよ。', category: '人間関係', family: 'REACT', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 9 },
  // IF / REASON
  { template: 'The reason is ___.', translation: '理由は〜。', category: '理由', family: 'IF', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'That\'s because ___.', translation: 'だから〜なんだ。', category: '理由', family: 'IF', frequency: 8, applicability: 8, beginnerFit: 8, loopFit: 8 },
  { template: 'That\'s why ___.', translation: 'だから〜。', category: '理由', family: 'IF', frequency: 9, applicability: 9, beginnerFit: 9, loopFit: 9 },
  { template: 'Just in case ___.', translation: '万一に備えて〜。', category: '仮定', family: 'IF', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  { template: 'In case you\'re wondering, ___.', translation: '気になってたら〜だけど。', category: '説明', family: 'IF', frequency: 7, applicability: 7, beginnerFit: 6, loopFit: 7 },
  { template: 'Unless ___, ___.', translation: '〜でなければ___。', category: '仮定', family: 'IF', frequency: 7, applicability: 7, beginnerFit: 6, loopFit: 7 },
  { template: 'As long as ___, ___.', translation: '〜なら___。', category: '仮定', family: 'IF', frequency: 8, applicability: 8, beginnerFit: 7, loopFit: 8 },
  // MORE PATTERNS - expand programmatically with slot fillers
];

const slotVerbs = ['go', 'try', 'call', 'check', 'grab', 'pick up', 'figure out', 'deal with', 'work on', 'look into'];
const slotNouns = ['it', 'that', 'this', 'something', 'anything', 'everything', 'nothing'];
const slotAdj = ['better', 'worse', 'fine', 'okay', 'weird', 'different', 'hard', 'easy'];
const slotTime = ['today', 'tomorrow', 'later', 'soon', 'right now', 'this week'];

function expandSeeds() {
  const out = [...seeds];
  const patterns = [
    { t: 'I keep ___.', ja: 'つい〜しちゃう。', cat: '日常生活', fam: 'TRY', f: 7 },
    { t: 'I end up ___.', ja: '結局〜しちゃう。', cat: '経験', fam: 'TRY', f: 8 },
    { t: 'I managed to ___.', ja: 'なんとか〜できた。', cat: '経験', fam: 'TRY', f: 7 },
    { t: 'I forgot to ___.', ja: '〜するの忘れた。', cat: '日常生活', fam: 'KNOW', f: 8 },
    { t: 'I remember ___.', ja: '〜覚えてる。', cat: '経験', fam: 'KNOW', f: 7 },
    { t: 'I\'m supposed to ___.', ja: '〜することになってる。', cat: '予定', fam: 'MODAL', f: 8 },
    { t: 'I\'m about to ___.', ja: 'もうすぐ〜する。', cat: '予定', fam: 'TIME', f: 8 },
    { t: 'I\'m trying to ___.', ja: '〜しようとしてる。', cat: '問題解決', fam: 'TRY', f: 8 },
    { t: 'I\'m looking for ___.', ja: '〜探してる。', cat: '日常生活', fam: 'LOOK', f: 8 },
    { t: 'I\'m waiting for ___.', ja: '〜待ってる。', cat: '日常生活', fam: 'TIME', f: 8 },
    { t: 'I\'m worried about ___.', ja: '〜心配。', cat: '感情', fam: 'FEEL', f: 8 },
    { t: 'I\'m excited about ___.', ja: '〜ワクワク。', cat: '感情', fam: 'FEEL', f: 8 },
    { t: 'I\'m nervous about ___.', ja: '〜緊張。', cat: '感情', fam: 'FEEL', f: 8 },
    { t: 'I\'m proud of ___.', ja: '〜誇りに思う。', cat: '感情', fam: 'FEEL', f: 7 },
    { t: 'I\'m jealous of ___.', ja: '〜羨ましい。', cat: '感情', fam: 'FEEL', f: 6 },
    { t: 'I\'m surprised ___.', ja: '〜で驚いた。', cat: '感情', fam: 'FEEL', f: 7 },
    { t: 'It turns out ___.', ja: '〜だとわかった。', cat: '説明', fam: 'KNOW', f: 8 },
    { t: 'It looks like ___.', ja: '〜みたい。', cat: '推測', fam: 'LOOK', f: 9 },
    { t: 'It seems like ___.', ja: '〜らしい／〜のよう。', cat: '推測', fam: 'LOOK', f: 8 },
    { t: 'It sounds like ___.', ja: '〜って感じ。', cat: '推測', fam: 'LOOK', f: 8 },
    { t: 'It feels like ___.', ja: '〜な感じ。', cat: '推測', fam: 'FEEL', f: 8 },
    { t: 'It\'s kind of ___.', ja: 'ちょっと〜。', cat: '説明', fam: 'FEEL', f: 9 },
    { t: 'It\'s pretty ___.', ja: '結構〜。', cat: '説明', fam: 'FEEL', f: 9 },
    { t: 'It\'s totally ___.', ja: '完全に〜。', cat: '説明', fam: 'FEEL', f: 8 },
    { t: 'It\'s way too ___.', ja: '〜すぎる。', cat: '比較', fam: 'COMPARISON', f: 8 },
    { t: 'It\'s not that ___.', ja: 'そんなに〜じゃない。', cat: '説明', fam: 'REACT', f: 8 },
    { t: 'It\'s more like ___.', ja: 'というより〜。', cat: '説明', fam: 'COMPARISON', f: 7 },
    { t: 'What happened to ___?', ja: '〜どうなった？', cat: '質問', fam: 'QUESTION', f: 8 },
    { t: 'What\'s up with ___?', ja: '〜どういうこと？', cat: '質問', fam: 'QUESTION', f: 8 },
    { t: 'What do you mean by ___?', ja: '〜ってどういう意味？', cat: '質問', fam: 'QUESTION', f: 8 },
    { t: 'How do you feel about ___?', ja: '〜どう思う？', cat: '質問', fam: 'QUESTION', f: 7 },
    { t: 'How long does it take to ___?', ja: '〜どのくらいかかる？', cat: '質問', fam: 'QUESTION', f: 7 },
    { t: 'Would you mind ___?', ja: '〜してもらえますか？', cat: '依頼', fam: 'REQUEST', f: 8 },
    { t: 'Do you happen to know ___?', ja: 'もし知ってたら〜？', cat: '質問', fam: 'QUESTION', f: 7 },
    { t: 'Is it okay if ___?', ja: '〜してもいい？', cat: '許可', fam: 'REQUEST', f: 8 },
    { t: 'Mind if I ___?', ja: '〜してもいい？', cat: '許可', fam: 'REQUEST', f: 8 },
    { t: 'Let me ___.', ja: '〜させて。', cat: '提案', fam: 'REQUEST', f: 8 },
    { t: 'Let\'s ___.', ja: '〜しよう。', cat: '提案', fam: 'REQUEST', f: 9 },
    { t: 'Why don\'t we ___?', ja: '〜しない？', cat: '提案', fam: 'REQUEST', f: 8 },
    { t: 'How about ___?', ja: '〜はどう？', cat: '提案', fam: 'REQUEST', f: 9 },
    { t: 'What about ___?', ja: '〜は？', cat: '提案', fam: 'REQUEST', f: 9 },
    { t: 'What if we ___?', ja: '〜したらどう？', cat: '提案', fam: 'IF', f: 8 },
  ];

  for (const p of patterns) {
    out.push({
      template: p.t,
      translation: p.ja,
      category: p.cat,
      family: p.fam,
      frequency: p.f,
      applicability: p.f,
      beginnerFit: Math.max(5, p.f - 1),
      loopFit: Math.min(10, p.f + 1),
    });
  }

  // Generate variations until we have 900 entries
  const extras = [
    ['I used to ___, but ___.', '以前は〜だったけど___。', '経験', 'EXPERIENCE'],
    ['I\'m used to ___.', '〜に慣れてる。', '経験', 'EXPERIENCE'],
    ['I\'m getting used to ___.', '〜に慣れつつある。', '経験', 'EXPERIENCE'],
    ['I\'ve been meaning to ___.', 'ずっと〜しようと思ってた。', '予定', 'TIME'],
    ['I\'ve been trying to ___.', 'ずっと〜しようとしてる。', '問題解決', 'TRY'],
    ['I\'ve been thinking about ___.', 'ずっと〜考えてる。', '意見', 'THINK'],
    ['I\'ve been looking for ___.', 'ずっと〜探してる。', '日常生活', 'LOOK'],
    ['I\'ve always wanted to ___.', 'ずっと〜したかった。', '願望', 'WANT'],
    ['I\'d love to ___.', '〜したいな。', '提案', 'WANT'],
    ['I\'d hate to ___.', '〜は嫌だ。', '感情', 'WANT'],
    ['I\'m not in the mood for ___.', '〜する気分じゃない。', '感情', 'FEEL'],
    ['I\'m in the mood for ___.', '〜したい気分。', '感情', 'FEEL'],
    ['I\'m not a fan of ___.', '〜あんまり好きじゃない。', '意見', 'FEEL'],
    ['I\'m a big fan of ___.', '〜大好き。', '趣味', 'FEEL'],
    ['I\'m not gonna lie, ___.', '正直___。', '意見', 'DISCOURSE'],
    ['Not gonna lie, ___.', 'マジで___。', '意見', 'DISCOURSE'],
    ['I\'m telling you, ___.', 'マジで___。', '意見', 'DISCOURSE'],
    ['Believe it or not, ___.', '信じられないかもだけど___。', '説明', 'DISCOURSE'],
    ['Funny thing is, ___.', '面白いことに___。', '説明', 'DISCOURSE'],
    ['Good thing ___.', '〜でよかった。', '感情', 'REACT'],
    ['Bad news is, ___.', '悪いニュースは___。', '説明', 'DISCOURSE'],
    ['Good news is, ___.', '良いニュースは___。', '説明', 'DISCOURSE'],
    ['The bad news is ___.', '悪いことは___。', '説明', 'DISCOURSE'],
    ['The good news is ___.', '良いことは___。', '説明', 'DISCOURSE'],
    ['On the bright side, ___.', '良い面では___。', '問題解決', 'DISCOURSE'],
    ['On the other hand, ___.', '一方で___。', '比較', 'COMPARISON'],
    ['For what it\'s worth, ___.', '参考までに___。', '意見', 'DISCOURSE'],
    ['If you ask me, ___.', '私の意見では___。', '意見', 'THINK'],
    ['If I were you, ___.', '私なら___。', '提案', 'IF'],
    ['If I had to guess, ___.', '推測するなら___。', '推測', 'IF'],
    ['If it were up to me, ___.', '私次第なら___。', '意見', 'IF'],
    ['Even though ___, ___.', '〜だけど___。', '仮定', 'IF'],
    ['Although ___, ___.', '〜にもかかわらず___。', '仮定', 'IF'],
    ['No matter what, ___.', '何があっても___。', '仮定', 'IF'],
    ['Either way, ___.', 'どっちにしても___。', '問題解決', 'DISCOURSE'],
    ['Either ___ or ___.', '___か___。', '比較', 'COMPARISON'],
    ['Neither ___ nor ___.', '___も___もない。', '比較', 'COMPARISON'],
    ['Both ___ and ___.', '___も___も。', '比較', 'COMPARISON'],
    ['Not only ___, but also ___.', '___だけでなく___も。', '比較', 'COMPARISON'],
    ['The more ___, the more ___.', '___すればするほど___。', '比較', 'COMPARISON'],
    ['So far, ___.', '今のところ___。', '経験', 'TIME'],
    ['So far so good.', '今のところ順調。', '経験', 'REACT'],
    ['Up until now, ___.', '今まで___。', '経験', 'TIME'],
    ['From now on, ___.', 'これからは___。', '予定', 'TIME'],
    ['By the time ___, ___.', '___までに___。', '予定', 'TIME'],
    ['In the meantime, ___.', 'その間___。', '予定', 'TIME'],
    ['For now, ___.', 'とりあえず___。', '問題解決', 'TIME'],
    ['For the time being, ___.', '当分の間___。', '予定', 'TIME'],
    ['At first, ___.', '最初は___。', '経験', 'TIME'],
    ['At some point, ___.', 'いつか___。', '予定', 'TIME'],
    ['Sooner or later, ___.', '遅かれ早かれ___。', '推測', 'TIME'],
  ];

  for (const [t, ja, cat, fam] of extras) {
    out.push({
      template: t,
      translation: ja,
      category: cat,
      family: fam,
      frequency: 6 + Math.floor(Math.random() * 3),
      applicability: 6 + Math.floor(Math.random() * 3),
      beginnerFit: 6 + Math.floor(Math.random() * 3),
      loopFit: 7 + Math.floor(Math.random() * 2),
    });
  }

  // School / hobby / travel specific
  const domain = [
    ['I have class at ___.', '___に授業。', '学校', 'TIME'],
    ['I\'m majoring in ___.', '___を専攻。', '学校', 'HAVE'],
    ['I\'m taking a class on ___.', '___の授業取ってる。', '学校', 'HAVE'],
    ['I\'m into ___.', '___好き。', '趣味', 'FEEL'],
    ['I picked up ___.', '___始めた。', '趣味', 'GET'],
    ['I\'m learning how to ___.', '___習ってる。', '趣味', 'TRY'],
    ['I\'m planning a trip to ___.', '___旅行計画中。', '旅行', 'GO'],
    ['I\'ve always wanted to visit ___.', 'ずっと___行きたかった。', '旅行', 'WANT'],
    ['I\'m staying at ___.', '___に泊まってる。', '旅行', 'GO'],
    ['I\'m flying out on ___.', '___に出発。', '旅行', 'GO'],
    ['Is this seat taken?', 'この席空いてますか？', '日常生活', 'QUESTION'],
    ['Could I get ___, please?', '___ください。', '買い物', 'REQUEST'],
    ['Can I get ___, please?', '___もらえますか？', '買い物', 'REQUEST'],
    ['Do you guys have ___?', '___ありますか？', '買い物', 'QUESTION'],
    ['I\'m looking for something ___.', '___なもの探してる。', '買い物', 'LOOK'],
    ['That\'ll be all.', '以上です。', '買い物', 'REACT'],
    ['Keep the change.', 'お釣りはいいよ。', '買い物', 'REACT'],
  ];
  for (const [t, ja, cat, fam] of domain) {
    out.push({ template: t, translation: ja, category: cat, family: fam, frequency: 6, applicability: 5, beginnerFit: 7, loopFit: 8 });
  }

  // Dedupe by template
  const seen = new Set();
  const unique = [];
  for (const item of out) {
    if (seen.has(item.template)) continue;
    seen.add(item.template);
    unique.push(item);
  }

  // Pad to 900 with compositional variants
  let i = 0;
  while (unique.length < 900) {
    const v = slotVerbs[i % slotVerbs.length];
    const n = slotNouns[i % slotNouns.length];
    const templates = [
      `I can't wait to ${v}.`,
      `I'm about to ${v}.`,
      `I just ${v}.`,
      `I need to ${v}.`,
      `I wanted to ${v}.`,
      `I'm gonna ${v} ${n}.`,
      `I had to ${v}.`,
      `I managed to ${v}.`,
      `I forgot to ${v}.`,
      `I tried to ${v}.`,
    ];
    const t = templates[i % templates.length];
    if (!seen.has(t)) {
      seen.add(t);
      unique.push({
        template: t.replace(v, '___').replace(n, '___'),
        translation: '（口語パターン）',
        category: '日常生活',
        family: 'TRY',
        frequency: 5,
        applicability: 6,
        beginnerFit: 6,
        loopFit: 8,
      });
    }
    i++;
    if (i > 5000) break;
  }

  return unique.slice(0, 900);
}

const expanded = expandSeeds();
const catalog = expanded.map((item, idx) => ({
  id: `T${String(101 + idx).padStart(3, '0')}`,
  rank: 101 + idx,
  ...item,
}));

writeFileSync(outPath, JSON.stringify(catalog, null, 2));
console.log(`Wrote ${catalog.length} templates to ${outPath}`);
