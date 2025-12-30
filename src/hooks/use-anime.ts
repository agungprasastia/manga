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

/**
 * Hook untuk scroll reveal animation dengan Intersection Observer
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
    options?: {
        threshold?: number;
        rootMargin?: string;
        delay?: number;
        duration?: number;
        from?: 'left' | 'right' | 'bottom' | 'top' | 'scale';
        once?: boolean;
    }
) {
    const elementRef = useRef<T>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!elementRef.current) return;

        const el = elementRef.current;
        const direction = options?.from || 'bottom';
        const once = options?.once !== false; // default true

        // Set initial state
        el.style.opacity = '0';
        if (direction === 'scale') {
            el.style.transform = 'scale(0.9)';
        } else {
            const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
            const translateStart = direction === 'left' ? -50 : direction === 'right' ? 50 : direction === 'top' ? -50 : 50;
            el.style.transform = `${translateProp}(${translateStart}px)`;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && (!once || !hasAnimated.current)) {
                        hasAnimated.current = true;

                        const animProps: Record<string, any> = {
                            opacity: [0, 1],
                            duration: options?.duration || 800,
                            delay: options?.delay || 0,
                            ease: 'outExpo'
                        };

                        if (direction === 'scale') {
                            animProps.scale = [0.9, 1];
                        } else {
                            const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY';
                            const translateStart = direction === 'left' ? -50 : direction === 'right' ? 50 : direction === 'top' ? -50 : 50;
                            animProps[translateProp] = [translateStart, 0];
                        }

                        animate(el, animProps);
                    }
                });
            },
            {
                threshold: options?.threshold || 0.1,
                rootMargin: options?.rootMargin || '0px'
            }
        );

        observer.observe(el);

        return () => observer.disconnect();
    }, []);

    return elementRef;
}

/**
 * Hook untuk scroll reveal dengan stagger pada children
 */
export function useScrollRevealStagger<T extends HTMLElement = HTMLDivElement>(
    selector: string,
    options?: {
        threshold?: number;
        delay?: number;
        staggerDelay?: number;
        duration?: number;
    }
) {
    const containerRef = useRef<T>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasAnimated.current) {
                        hasAnimated.current = true;

                        const elements = container.querySelectorAll(selector);
                        if (elements.length === 0) return;

                        // Set initial state
                        elements.forEach((el) => {
                            (el as HTMLElement).style.opacity = '0';
                            (el as HTMLElement).style.transform = 'translateY(30px)';
                        });

                        // Animate with stagger
                        animate(elements, {
                            translateY: [30, 0],
                            opacity: [0, 1],
                            delay: stagger(options?.staggerDelay || 80, { start: options?.delay || 100 }),
                            duration: options?.duration || 600,
                            ease: 'outExpo'
                        });
                    }
                });
            },
            { threshold: options?.threshold || 0.2 }
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, [selector]);

    return containerRef;
}

/**
 * Animasi pulse/glow untuk badges atau highlight elements
 */
export function animatePulse(element: Element | null, options?: {
    scale?: number;
    duration?: number;
    loop?: boolean;
}) {
    if (!element) return;

    animate(element, {
        scale: [1, options?.scale || 1.05, 1],
        duration: options?.duration || 600,
        ease: 'inOutSine',
        loop: options?.loop || false
    });
}

/**
 * Animasi entrance untuk page/section
 */
export function animatePageEntrance(container: Element | null, selectors: string[]) {
    if (!container) return;

    let baseDelay = 0;

    selectors.forEach((selector, index) => {
        const elements = container.querySelectorAll(selector);
        if (elements.length === 0) return;

        elements.forEach((el) => {
            (el as HTMLElement).style.opacity = '0';
            (el as HTMLElement).style.transform = 'translateY(20px)';
        });

        animate(elements, {
            translateY: [20, 0],
            opacity: [0, 1],
            delay: stagger(50, { start: baseDelay + (index * 150) }),
            duration: 600,
            ease: 'outExpo'
        });

        baseDelay += elements.length * 50;
    });
}

/**
 * Counter animation untuk numbers
 */
export function animateCounter(
    element: HTMLElement | null,
    target: number,
    options?: { duration?: number; prefix?: string; suffix?: string }
) {
    if (!element) return;

    const obj = { value: 0 };

    animate(obj, {
        value: target,
        duration: options?.duration || 1500,
        ease: 'outExpo',
        onUpdate: () => {
            element.textContent = `${options?.prefix || ''}${Math.round(obj.value)}${options?.suffix || ''}`;
        }
    });
}

