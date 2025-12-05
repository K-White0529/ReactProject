/**
 * パフォーマンス監視ユーティリティ
 */

import { useRef, useEffect } from 'react';

interface RenderInfo {
    componentName: string;
    renderCount: number;
    lastRenderTime: number;
}

class PerformanceMonitor {
    private renderCounts: Map<string, RenderInfo> = new Map();
    private enabled: boolean = import.meta.env.MODE === 'development';

    /**
     * コンポーネントのレンダリングを記録
     */
    logRender(componentName: string): void {
        if (!this.enabled) return;

        const now = Date.now();
        const current = this.renderCounts.get(componentName);

        if (current) {
            current.renderCount++;
            current.lastRenderTime = now;
        } else {
            this.renderCounts.set(componentName, {
                componentName,
                renderCount: 1,
                lastRenderTime: now,
            });
        }
    }

    /**
     * レンダリング統計を取得
     */
    getStats(): RenderInfo[] {
        return Array.from(this.renderCounts.values()).sort(
            (a, b) => b.renderCount - a.renderCount
        );
    }

    /**
     * 統計をコンソールに出力
     */
    printStats(): void {
        if (!this.enabled) return;

        console.group('🎯 レンダリング統計');
        const stats = this.getStats();
        stats.forEach(({ componentName, renderCount }) => {
            console.log(`${componentName}: ${renderCount}回`);
        });
        console.groupEnd();
    }

    /**
     * 統計をリセット
     */
    reset(): void {
        this.renderCounts.clear();
    }

    /**
     * 監視を有効化/無効化
     */
    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * カスタムフック：コンポーネントのレンダリングをログ
 */
export function useRenderLogger(componentName: string): void {
    if (import.meta.env.MODE === 'development') {
        performanceMonitor.logRender(componentName);
    }
}

/**
 * カスタムフック：レンダリング理由を追跡（開発環境のみ）
 */
export function useWhyDidYouUpdate(name: string, props: Record<string, unknown>): void {
    if (import.meta.env.MODE !== 'development') return;

    const previousProps = useRef<Record<string, unknown> | null>(null);

    useEffect(() => {
        if (previousProps.current) {
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            const changedProps: Record<string, { from: unknown; to: unknown }> = {};

            allKeys.forEach((key) => {
                if (previousProps.current![key] !== props[key]) {
                    changedProps[key] = {
                        from: previousProps.current![key],
                        to: props[key],
                    };
                }
            });

            if (Object.keys(changedProps).length > 0) {
                console.log('[why-did-you-update]', name, changedProps);
            }
        }

        previousProps.current = props;
    });
}
