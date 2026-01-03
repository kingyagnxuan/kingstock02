// 板块与个股的映射关系
export const sectorStockMapping: Record<string, Array<{
  code: string;
  name: string;
  currentPrice: number;
  priceChangePercent: number;
  volume: number;
  volumeRatio: number;
  capitalFlow: number;
  capitalFlowPercent: number;
}>> = {
  "AI应用": [
    {
      code: "300750",
      name: "宁德时代",
      currentPrice: 245.30,
      priceChangePercent: 8.5,
      volume: 125000000,
      volumeRatio: 2.1,
      capitalFlow: 52000000,
      capitalFlowPercent: 92.5,
    },
    {
      code: "688008",
      name: "澜起科技",
      currentPrice: 89.50,
      priceChangePercent: 6.2,
      volume: 98000000,
      volumeRatio: 1.8,
      capitalFlow: 38000000,
      capitalFlowPercent: 85.3,
    },
    {
      code: "688111",
      name: "金山办公",
      currentPrice: 156.80,
      priceChangePercent: 5.1,
      volume: 75000000,
      volumeRatio: 1.5,
      capitalFlow: 28000000,
      capitalFlowPercent: 78.9,
    },
    {
      code: "688036",
      name: "传音控股",
      currentPrice: 112.45,
      priceChangePercent: 4.3,
      volume: 65000000,
      volumeRatio: 1.2,
      capitalFlow: 18000000,
      capitalFlowPercent: 65.2,
    },
    {
      code: "688012",
      name: "中芯国际",
      currentPrice: 89.90,
      priceChangePercent: 3.8,
      volume: 45000000,
      volumeRatio: 0.9,
      capitalFlow: 12000000,
      capitalFlowPercent: 52.1,
    },
  ],
  "商业航天": [
    {
      code: "603738",
      name: "航发动力",
      currentPrice: 78.30,
      priceChangePercent: 7.2,
      volume: 115000000,
      volumeRatio: 1.9,
      capitalFlow: 45000000,
      capitalFlowPercent: 88.5,
    },
    {
      code: "600760",
      name: "中航沈飞",
      currentPrice: 95.60,
      priceChangePercent: 6.5,
      volume: 92000000,
      volumeRatio: 1.7,
      capitalFlow: 35000000,
      capitalFlowPercent: 82.3,
    },
    {
      code: "600372",
      name: "中航电子",
      currentPrice: 52.40,
      priceChangePercent: 5.8,
      volume: 78000000,
      volumeRatio: 1.4,
      capitalFlow: 25000000,
      capitalFlowPercent: 75.6,
    },
    {
      code: "002179",
      name: "中航光电",
      currentPrice: 68.90,
      priceChangePercent: 4.9,
      volume: 68000000,
      volumeRatio: 1.1,
      capitalFlow: 16000000,
      capitalFlowPercent: 62.4,
    },
    {
      code: "300114",
      name: "中航电测",
      currentPrice: 45.20,
      priceChangePercent: 3.5,
      volume: 48000000,
      volumeRatio: 0.8,
      capitalFlow: 10000000,
      capitalFlowPercent: 48.9,
    },
  ],
  "车工信息化": [
    {
      code: "601633",
      name: "长城汽车",
      currentPrice: 38.50,
      priceChangePercent: 6.8,
      volume: 105000000,
      volumeRatio: 1.8,
      capitalFlow: 42000000,
      capitalFlowPercent: 85.2,
    },
    {
      code: "600104",
      name: "上汽集团",
      currentPrice: 28.70,
      priceChangePercent: 5.5,
      volume: 88000000,
      volumeRatio: 1.6,
      capitalFlow: 32000000,
      capitalFlowPercent: 78.9,
    },
    {
      code: "002594",
      name: "比亚迪",
      currentPrice: 285.30,
      priceChangePercent: 4.2,
      volume: 72000000,
      volumeRatio: 1.3,
      capitalFlow: 22000000,
      capitalFlowPercent: 68.5,
    },
    {
      code: "600006",
      name: "东风汽车",
      currentPrice: 12.80,
      priceChangePercent: 3.9,
      volume: 62000000,
      volumeRatio: 1.0,
      capitalFlow: 14000000,
      capitalFlowPercent: 55.3,
    },
    {
      code: "601238",
      name: "广汽集团",
      currentPrice: 19.45,
      priceChangePercent: 2.8,
      volume: 42000000,
      volumeRatio: 0.7,
      capitalFlow: 8000000,
      capitalFlowPercent: 42.1,
    },
  ],
  "蓝色光标": [
    {
      code: "601857",
      name: "中国石油",
      currentPrice: 8.95,
      priceChangePercent: 5.2,
      volume: 95000000,
      volumeRatio: 1.7,
      capitalFlow: 38000000,
      capitalFlowPercent: 82.1,
    },
    {
      code: "600028",
      name: "中国石化",
      currentPrice: 5.48,
      priceChangePercent: 4.8,
      volume: 82000000,
      volumeRatio: 1.5,
      capitalFlow: 28000000,
      capitalFlowPercent: 75.6,
    },
    {
      code: "600688",
      name: "上海石化",
      currentPrice: 6.15,
      priceChangePercent: 4.1,
      volume: 68000000,
      volumeRatio: 1.2,
      capitalFlow: 18000000,
      capitalFlowPercent: 65.3,
    },
    {
      code: "600989",
      name: "宝丰能源",
      currentPrice: 12.30,
      priceChangePercent: 3.5,
      volume: 55000000,
      volumeRatio: 0.9,
      capitalFlow: 12000000,
      capitalFlowPercent: 52.8,
    },
    {
      code: "603619",
      name: "中国神华",
      currentPrice: 38.90,
      priceChangePercent: 2.9,
      volume: 38000000,
      volumeRatio: 0.6,
      capitalFlow: 7000000,
      capitalFlowPercent: 38.5,
    },
  ],
};

// 获取板块的个股数据
export function getSectorStocks(sectorName: string) {
  return sectorStockMapping[sectorName] || [];
}

// 获取所有板块名称
export function getAllSectorNames() {
  return Object.keys(sectorStockMapping);
}
