# 天気予報アプリ

任意の都市名、または現在地の気温・天気・湿度・降水確率をカレンダーから日付を選んで確認できる Web アプリです。

- Next.js (App Router) + TypeScript + Tailwind CSS
- [OpenWeatherMap](https://openweathermap.org/api) の Geocoding API / Current Weather API / 5 Day Forecast API を使用
- APIキーはサーバー側の環境変数（`.env.local` / Vercel の Environment Variables）でのみ管理し、クライアントには一切渡しません

## セットアップ

1. 依存関係をインストール

   ```bash
   npm install
   ```

2. OpenWeatherMap の無料アカウントを作成し、APIキーを取得
   - https://home.openweathermap.org/users/sign_up
   - 発行直後は反映まで最大2時間ほどかかる場合があります

3. `.env.local` にAPIキーを設定（このファイルは Git 管理対象外です）

   ```bash
   OPENWEATHER_API_KEY=あなたのAPIキー
   ```

4. 開発サーバーを起動

   ```bash
   npm run dev
   ```

   http://localhost:3000 を開いて確認できます。

## 機能

- 都市名検索（Geocoding API）または現在地取得（ブラウザの Geolocation API）
- 現在の気温・天気・体感温度を表示
- カレンダーで日付を選択し、その日の最高/最低気温・湿度・降水確率・3時間ごとの予報を表示（OpenWeatherMap 無料プランの制約上、当日から5日先まで選択可能）

## デプロイ（Vercel）

このリポジトリは Vercel に接続されています。環境変数 `OPENWEATHER_API_KEY` は Vercel プロジェクトの Settings → Environment Variables に設定してください（コードには含まれません）。
