# slotly-sdk

[Slotly](https://github.com/bannerly/server) 広告配信サーバー用の、Expo / React Native クライアント SDK です。
アプリ内の広告枠コンポーネント `AdSlot` を提供します。

## 導入

`AdSlot.tsx` をプロジェクトにコピーして使います。
HTML クリエイティブの表示に `react-native-webview` が必要です。

```sh
npx expo install react-native-webview
```

## 使い方

```tsx
import { AdSlot } from "./AdSlot";

<AdSlot
  baseUrl="https://ads.example.com"  // Slotly サーバーのオリジン
  zone="app-home-top"                 // 枠 ID（管理画面で発行）
  region="tokyo"                      // 任意: 地域ルール用
  style={{ height: 180 }}
/>
```

## 動作

- `GET /ad/<zone>?format=json` で広告を取得します
- **構造化クリエイティブ**（画像 URL + タイトル + 本文）はネイティブ描画され、表示時にインプレッション、タップ時にクリック（サーバー経由でリンク先へリダイレクト）が計測されます
- **HTML クリエイティブ**とバックフィルは WebView で表示されます
- 広告が取得できない場合は何も表示しません
- 広告表記（「広告」ラベル）はコンポーネント側で表示されます

## Props

| 名前 | 必須 | 説明 |
|---|---|---|
| `baseUrl` | ○ | Slotly サーバーのオリジン（末尾スラッシュなし） |
| `zone` | ○ | 枠 ID |
| `region` | | 地域ターゲティング用の値 |
| `style` | | 枠のスタイル |

## ライセンス

MIT License
