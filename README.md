# Thai Pronunciation AI Learning Platform

這是一個針對中文母語者設計的泰語發音學習平台，主要練習泰語子音清濁、濁音與不送氣清音，以及泰語聲調聽辨。

## Features

- Minimal Pairs 聽辨練習
- Voicing Contrast 清濁音對比
- Voiced vs. Unaspirated 練習
- Low vs. Falling Tone 聲調聽辨
- 進階聲調聽辨
- 即時答題回饋
- 錯題整理
- 學習進度儲存
- 學習輔助
- 音檔缺漏時仍可正常顯示題目

## Target Learners

- 中文母語者
- 泰語初級到中級學習者
- 已經學過基礎泰文字母，但聽辨還不穩定的學生
- 想加強泰語發音與聲調辨識能力的學生

## Project Structure

```text
thai-pronunciation-learning-platform/
│
├── index.html
├── README.md
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── data/
│   ├── minimalPairs.json
│   ├── tonePairs.json
│   └── faq.json
│
├── audio/
│   ├── minimal-pairs/
│   │   └── .gitkeep
│   └── tones/
│       └── .gitkeep
│
└── assets/
    └── .gitkeep
```

## Audio Files

音檔請放在：

- `audio/minimal-pairs/`
- `audio/tones/`

如果尚未上傳音檔，平台仍可正常顯示題目。點擊播放時會顯示「音檔尚未上傳」提示。

## Minimal Pairs 音檔命名建議

```text
ban.mp3
pan.mp3
bo.mp3
po.mp3
bai.mp3
pai.mp3
baa_falling.mp3
paa_falling.mp3
bin.mp3
pin.mp3
bon.mp3
pon.mp3

duang.mp3
tuang.mp3
daa_low.mp3
taa_low.mp3
dii.mp3
tii.mp3
dueng.mp3
tueng.mp3
dong.mp3
tong.mp3
dao.mp3
tao.mp3
duu.mp3
tuu.mp3

ngaa.mp3
naa.mp3
nguu.mp3
nuu.mp3

rak.mp3
lak.mp3
raai.mp3
laai.mp3
ruai.mp3
luai.mp3
```

## Tone 音檔命名建議

```text
paa_low.mp3
paa_falling.mp3
khaa_low.mp3
khaa_falling.mp3
kii_low.mp3
kii_falling.mp3
khaao_low_news.mp3
khaao_falling_rice.mp3
haang_low.mp3
haang_falling.mp3
sii_low.mp3
sii_falling.mp3

naa_mid.mp3
naa_rising.mp3
khaa_mid.mp3
khaa_rising.mp3
khaao_rising_white.mp3
```

## Local Preview

因為本專案使用 `fetch()` 讀取 JSON，建議不要直接雙擊 `index.html` 開啟。  
請使用簡單的本機伺服器：

```bash
python3 -m http.server 8000
```

然後打開：

```text
http://localhost:8000
```

## Deployment

This project can be deployed using GitHub Pages.

### GitHub Pages 部署方式

1. 將專案推送到 GitHub repository
2. 進入 Settings
3. 點選 Pages
4. Source 選擇 main branch
5. Folder 選擇 `/root`
6. 儲存後等待 GitHub Pages 產生網址

## Note

本平台音檔可作為初步聽辨練習，但泰語發音仍建議搭配老師或母語者確認。  
特別是 ร、ง、送氣音與聲調細節，AI 音檔可能會有不穩定的情況。

如果之後要提升平台品質，建議將 AI 或合成音檔逐步替換成真人母語者錄音。
