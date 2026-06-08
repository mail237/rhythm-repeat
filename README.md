# 🎙️ Rhythm Repeat

英語・ドイツ語のフレーズをネイティブ発音のリズムで繰り返し聴いて体に叩き込む反復練習 Web アプリ。

## 機能

- Google Cloud TTS によるネイティブ発音再生
- ループ再生（1 / 3 / 5 / 10 / ∞）・速度調整（0.75x / 1.0x / 1.25x）
- 再生中の単語ハイライト
- TTS 音声キャッシュ（localStorage）
- フレーズライブラリ・統計・連続練習日数
- Claude AI による口語フレーズ提案
- PWA 対応（ホーム画面に追加可能）

## セットアップ

```bash
cd rhythm-repeat
npm install
cp .env.example .env
# .env に API キーを記入
npm run dev
```

### 必要な API キー

| キー | 用途 | 取得先 |
|------|------|--------|
| `GOOGLE_TTS_API_KEY` | 音声合成 | [Google Cloud Console](https://console.cloud.google.com/) → Text-to-Speech API |
| `ANTHROPIC_API_KEY` | AI フレーズ提案 | [Anthropic Console](https://console.anthropic.com/) |

API キーはサーバー側プロキシ（`/api/tts`, `/api/claude`）経由でのみ使用され、フロントエンドには露出しません。

## Vercel デプロイ

1. GitHub にリポジトリをプッシュ
2. [Vercel](https://vercel.com) でインポート
3. 環境変数を設定:
   - `GOOGLE_TTS_API_KEY`
   - `ANTHROPIC_API_KEY`
4. デプロイ

```bash
npx vercel --prod
```

## 技術スタック

- React 19 + Vite + TypeScript
- Tailwind CSS 4
- Vercel Edge Functions（API プロキシ）
- localStorage（フレーズ・設定・TTS キャッシュ）

## プロジェクト構成

```
api/           Vercel Edge Functions（TTS / Claude プロキシ）
dev-server/    ローカル開発用 API ミドルウェア
src/
  components/  UI コンポーネント
  hooks/       状態管理・再生ロジック
  services/    API クライアント
  types/       型定義
```
