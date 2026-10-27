// Expo / React Native 用 広告枠コンポーネント（試作SDK）
// 使い方:
//   import { AdSlot } from "./AdSlot";
//   <AdSlot baseUrl="https://ads.example.com" zone="portal-top" style={{ height: 110 }} />
// 依存: react-native-webview（HTMLクリエイティブ表示用）: npx expo install react-native-webview
// 構造化クリエイティブ（native）は WebView なしで描画し、表示時に imp、タップ時に click を送る。
import React, { useEffect, useRef, useState } from "react";
import { View, Text, Image, TouchableOpacity, Linking, StyleProp, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";

type Creative = {
  type: "html" | "native";
  html?: string;
  image_url?: string;
  title?: string;
  body?: string;
  link_url: string;
  imp_url: string;
  click_url: string;
};
type AdResponse = { zone: string; source: string; campaign?: string; creative?: Creative; html: string };

type Props = {
  baseUrl: string;          // 広告基盤のオリジン（末尾スラッシュなし）
  zone: string;             // 枠ID
  region?: string;          // 地域ルール用（任意）
  city?: string;            // 市ルール用（任意・cf.city の英語表記 例 "Yokohama"）
  style?: StyleProp<ViewStyle>;
};

export function AdSlot({ baseUrl, zone, region, city, style }: Props) {
  const [ad, setAd] = useState<AdResponse | null>(null);
  const impSent = useRef(false);

  useEffect(() => {
    let cancelled = false;
    impSent.current = false;
    const params = new URLSearchParams({ format: "json" });
    if (region) params.set("region", region);
    if (city) params.set("city", city);
    fetch(`${baseUrl}/ad/${zone}?${params.toString()}`)
      .then(r => r.json())
      .then((j: AdResponse) => { if (!cancelled) setAd(j); })
      .catch(() => { /* 広告が取れない場合は枠を出さない */ });
    return () => { cancelled = true; };
  }, [baseUrl, zone, region, city]);

  if (!ad) return null;

  // バックフィル等（creative なし）は HTML として WebView 表示
  const creative = ad.creative;
  if (!creative || creative.type === "html") {
    return (
      <View style={style}>
        <WebView
          originWhitelist={["*"]}
          source={{ html: ad.html, baseUrl }}
          style={{ backgroundColor: "transparent" }}
          scrollEnabled={false}
        />
      </View>
    );
  }

  // 構造化クリエイティブ: ネイティブ描画
  const fireImp = () => {
    if (impSent.current) return;
    impSent.current = true;
    fetch(`${baseUrl}${creative.imp_url}`).catch(() => {});
  };
  const onPress = () => {
    // /click は計測後にリンク先へ 302 する
    Linking.openURL(`${baseUrl}${creative.click_url}`).catch(() => {});
  };

  return (
    <TouchableOpacity style={style} onPress={onPress} onLayout={fireImp} activeOpacity={0.85}>
      <Text style={{ fontSize: 10, color: "#888" }}>広告</Text>
      {creative.image_url ? (
        <Image source={{ uri: creative.image_url }} style={{ width: "100%", height: 140 }} resizeMode="cover" />
      ) : null}
      {creative.title ? <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 6 }}>{creative.title}</Text> : null}
      {creative.body ? <Text style={{ fontSize: 13, color: "#333", marginTop: 2 }}>{creative.body}</Text> : null}
    </TouchableOpacity>
  );
}
