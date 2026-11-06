import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WhatsappContactComponent } from './shared/whatsapp-contact/whatsapp-contact.component';
import { SeoService } from './shared/seo/seo.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [RouterOutlet, WhatsappContactComponent]
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.seo.update(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((event) => this.seo.update(event.urlAfterRedirects));
  }
}
