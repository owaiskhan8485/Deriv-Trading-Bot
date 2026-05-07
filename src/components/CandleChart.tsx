import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi } from 'lightweight-charts';

interface CandleChartProps {
  data: any[];
  activeTrade?: any;
}

export const CandleChart: React.FC<CandleChartProps> = ({ data, activeTrade }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  const priceLineRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: true,
      },
      rightPriceScale: {
        borderColor: '#1e293b',
      },
      crosshair: {
        mode: 0, // Normal
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (seriesRef.current) {
      if (priceLineRef.current) {
        seriesRef.current.removePriceLine(priceLineRef.current);
        priceLineRef.current = null;
      }

      if (activeTrade && activeTrade.entrySpot) {
        priceLineRef.current = seriesRef.current.createPriceLine({
          price: activeTrade.entrySpot,
          color: activeTrade.direction === 'CALL' ? '#10b981' : '#f43f5e',
          lineWidth: 2,
          lineStyle: 2, // Dotted
          axisLabelVisible: true,
          title: `ENTRY: ${activeTrade.entrySpot}`,
        });
      }
    }
  }, [activeTrade]);

  useEffect(() => {
    if (seriesRef.current && data.length > 0) {
      // Map data to lightweight-charts format
      // Lightweight-charts expects time as number o string (UTCTimestamp)
      const formattedData = data.map(candle => ({
        time: candle.epoch as any,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      })).sort((a, b) => a.time - b.time);

      seriesRef.current.setData(formattedData);
    }
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full" />;
};
