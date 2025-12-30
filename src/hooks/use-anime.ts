'use client';

import { useEffect, useRef } from 'react';
import { animate, stagger } from 'animejs';

/**
 * Hook untuk animasi stagger pada list of elements
 * Menggunakan anime.js v4 dengan API: animate(targets, properties)
 */
export function useStaggerAnimation<T extends HTMLElement = HTMLDivElement>(
    selector: string,
    dependencies: any[] = [],
    options?: {
        delay?: number;
        staggerDelay?: number;
        duration?: number;
        from?: 'left' | 'right' | 'bottom' | 'top';
    }
) {
    const containerRef = useRef<T>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        // Reset animation flag when dependencies change (new data)
        if (dependencies.some(dep => dep)) {
            hasAnimated.current = false;
        }
    }, dependencies);

    useEffect(() => {
        if (hasAnimated.current || !containerRef.current) return;

        const elements = containerRef.current.querySelectorAll(selector);
        if (elements.length === 0) return;

        hasAnimated.current = true;

        const direction = options?.from || 'bottom';
        const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
        const translateStart = direction === 'left' ? -40 : direction === 'right' ? 40 : direction === 'top' ? -40 : 40;

        // Set initial state
        elements.forEach((el) => {
            (el as HTMLElement).style.opacity = '0';
            (el as HTMLElement).style.transform = `${translateProp === 'translateX' ? 'translateX' : 'translateY'}(${translateStart}px)`;
        });

        // Animate with stagger
        animate(elements, {
            [translateProp]: [translateStart, 0],
            opacity: [0, 1],
            delay: stagger(options?.staggerDelay || 50, { start: options?.delay || 100 }),
            duration: options?.duration || 600,
            ease: 'outExpo'
        });
    }, [selector, ...dependencies]);

    return containerRef;
}

/**
 * Hook untuk single element fade-in animation
 */
export function useFadeIn<T extends HTMLElement = HTMLDivElement>(
    dependencies: any[] = [],
    options?: {
        delay?: number;
        duration?: number;
        from?: 'left' | 'right' | 'bottom' | 'top' | 'scale';
    }
) {
    const elementRef = useRef<T>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (hasAnimated.current || !elementRef.current) return;

        hasAnimated.current = true;
        const el = elementRef.current;
        const direction = options?.from || 'bottom';

        // Set initial state
        if (direction === 'scale') {
            el.style.opacity = '0';
            el.style.transform = 'scale(0.9)';
        } else {
            const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
            const translateStart = direction === 'left' ? -30 : direction === 'right' ? 30 : direction === 'top' ? -30 : 30;
            el.style.opacity = '0';
            el.style.transform = `${translateProp}(${translateStart}px)`;
        }

        // Animate
        const animProps: Record<string, any> = {
            opacity: [0, 1],
            duration: options?.duration || 600,
            delay: options?.delay || 0,
            ease: 'outExpo'
        };

        if (direction === 'scale') {
            animProps.scale = [0.9, 1];
        } else {
            const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
            const translateStart = direction === 'left' ? -30 : direction === 'right' ? 30 : direction === 'top' ? -30 : 30;
            animProps[translateProp] = [translateStart, 0];
        }

        animate(el, animProps);
    }, dependencies);

    return elementRef;
}

/**
 * Animate cards in a container - call this imperatively
 */
export function animateCards(container: Element | null, selector: string, options?: {
    delay?: number;
    staggerDelay?: number;
}) {
    if (!container) return;

    const cards = container.querySelectorAll(selector);
    if (cards.length === 0) return;

    // Set initial state
    cards.forEach((card) => {
        (card as HTMLElement).style.opacity = '0';
        (card as HTMLElement).style.transform = 'translateY(40px)';
    });

    // Animate with stagger
    animate(cards, {
        translateY: [40, 0],
        opacity: [0, 1],
        delay: stagger(options?.staggerDelay || 50, { start: options?.delay || 100 }),
        duration: 600,
        ease: 'outExpo'
    });
}
