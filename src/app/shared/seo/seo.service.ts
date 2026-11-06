import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import pageMetadata from '../../../../seo/site-pages.json';

type PageMetadata = { title: string; description: string };
const SITE_ORIGIN = 'https://lorenacordobaabogada.com.ar';
const PAGES = pageMetadata as Record<string, PageMetadata>;

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(url: string): void {
    const path = url.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
    const page = PAGES[path] ?? PAGES['/'];
    const canonical = `${SITE_ORIGIN}${path === '/' ? '/' : path}`;

    this.title.setTitle(page.title);
    this.meta.updateTag({ name: 'description', content: page.description });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:title', content: page.title });
    this.meta.updateTag({ property: 'og:description', content: page.description });
    this.meta.updateTag({ property: 'og:url', content: canonical });
    this.meta.updateTag({ name: 'twitter:title', content: page.title });
    this.meta.updateTag({ name: 'twitter:description', content: page.description });

    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', canonical);
  }
}
