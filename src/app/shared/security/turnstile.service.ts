import { Injectable } from '@angular/core';

interface TurnstileApi {
  render(container: HTMLElement, options: Record<string, unknown>): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

/**
 * Carga una sola vez el script oficial de Turnstile.
 * Si falla la red, CSP o una extensión lo bloquea, permite un nuevo intento.
 * No modifica la política CSP interna del iframe de Cloudflare.
 */
@Injectable({ providedIn: 'root' })
export class TurnstileService {
  private scriptPromise?: Promise<TurnstileApi>;

  load(): Promise<TurnstileApi> {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (this.scriptPromise) return this.scriptPromise;

    const pending = new Promise<TurnstileApi>((resolve, reject) => {
      let script = document.querySelector<HTMLScriptElement>('script[data-lc-turnstile]');
      let settled = false;
      let pollId: number | undefined;
      let timeoutId: number | undefined;

      const cleanup = (): void => {
        if (pollId !== undefined) window.clearInterval(pollId);
        if (timeoutId !== undefined) window.clearTimeout(timeoutId);
        script?.removeEventListener('load', onLoad);
        script?.removeEventListener('error', onError);
      };

      const finish = (error?: Error): void => {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) {
          script?.remove();
          reject(error);
        } else if (window.turnstile) {
          resolve(window.turnstile);
        } else {
          reject(new Error('Turnstile no pudo inicializarse.'));
        }
      };

      const checkReady = (): void => {
        if (window.turnstile) finish();
      };
      const onLoad = (): void => checkReady();
      const onError = (): void => finish(new Error('No se pudo cargar la verificación de seguridad.'));

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset['lcTurnstile'] = 'true';
        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);
        document.head.appendChild(script);
      } else {
        script.addEventListener('load', onLoad);
        script.addEventListener('error', onError);
      }

      // También cubre scripts ya presentes cuyo evento load ocurrió antes de registrarnos.
      pollId = window.setInterval(checkReady, 100);
      timeoutId = window.setTimeout(
        () => finish(new Error('La verificación de seguridad tardó demasiado en cargar.')),
        12_000
      );
      checkReady();
    });

    // Fundamental: no conservar una promesa rechazada entre intentos.
    this.scriptPromise = pending.catch((error: unknown) => {
      this.scriptPromise = undefined;
      throw error;
    });
    return this.scriptPromise;
  }

  async render(
    container: HTMLElement,
    siteKey: string,
    callbacks: {
      onSuccess: (token: string) => void;
      onExpired: () => void;
      onError: (code?: string) => void;
      onTimeout?: () => void;
    },
    action = 'legal_triage_session'
  ): Promise<string> {
    const api = await this.load();
    const widgetId = api.render(container, {
      sitekey: siteKey,
      theme: 'auto',
      size: 'flexible',
      language: 'es',
      action,
      callback: callbacks.onSuccess,
      'expired-callback': callbacks.onExpired,
      'error-callback': callbacks.onError,
      'timeout-callback': callbacks.onTimeout ?? callbacks.onExpired
    });
    if (!widgetId) throw new Error('Turnstile no devolvió un identificador de widget.');
    return widgetId;
  }

  reset(widgetId?: string): void {
    if (window.turnstile && widgetId) window.turnstile.reset(widgetId);
  }

  remove(widgetId?: string): void {
    if (window.turnstile && widgetId) window.turnstile.remove(widgetId);
  }
}
