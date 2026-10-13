// 制作側 art/main-characters bf16880 から取り込んだ調査記録用素材。
export const itemImages: Readonly<Record<string, string>> = {
  smartphone: new URL('../assets/images/items/smartphone.png', import.meta.url).href,
  'electronic-cigarette': new URL('../assets/images/items/electronic-cigarette.png', import.meta.url).href,
  'business-card': new URL('../assets/images/items/business-card.png', import.meta.url).href,
}