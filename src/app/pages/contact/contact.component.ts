import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { type ConsultationForm } from '../../interfaces';
import { TurnstileService } from '../../shared/security/turnstile.service';
import { SiteFooterComponent } from '../../shared/site-footer/site-footer.component';
import { RevealDirective } from '../../shared/motion/reveal.directive';
import { PointerGlowDirective } from '../../shared/motion/pointer-glow.directive';
import { ContactApiService } from './contact-api.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, SiteFooterComponent, RevealDirective, PointerGlowDirective],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('contactTurnstile') private readonly contactTurnstile?: ElementRef<HTMLDivElement>;

  private readonly api = inject(ContactApiService);
  private readonly turnstile = inject(TurnstileService);
  private turnstileWidgetId?: string;
  private turnstileToken = '';
  private destroyed = false;
  private preparingSecurity = false;

  readonly securityRequired = environment.production || Boolean(environment.turnstileSiteKey?.trim());
  isSubmitting = false;
  securityLoading = false;
  securityLoadFailed = false;
  submitMessage = '';
  submitError = '';
  securityReady = !this.securityRequired;

  form: ConsultationForm = this.emptyForm();

  ngAfterViewInit(): void {
    void this.prepareTurnstile();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.turnstile.remove(this.turnstileWidgetId);
  }

  async submitForm(): Promise<void> {
    if (this.isSubmitting) return;
    this.submitMessage = '';
    this.submitError = '';

    if (!this.form.fullName || !this.form.phone || !this.form.email || !this.form.location || !this.form.consultationType || !this.form.consultationReason.trim() || !this.form.caseDescription) {
      this.submitError = 'Completá los campos obligatorios para enviar tu consulta.';
      return;
    }
    if (this.form.consultationReason.trim().length > 21) {
      this.submitError = 'El motivo de consulta debe tener menos de 22 caracteres.';
      return;
    }
    if (this.securityRequired && (!this.securityReady || !this.turnstileToken)) {
      this.submitError = 'Completá la verificación de seguridad antes de enviar.';
      return;
    }

    this.isSubmitting = true;
    try {
      const result = await this.api.submit(this.form, this.turnstileToken);
      if (this.destroyed) return;
      this.submitMessage = result.clientEmailDelivered === false
        ? `Consulta recibida correctamente. Referencia ${result.reference}. El estudio recibió tus datos, aunque no pudimos confirmar el email automático.`
        : `Consulta recibida correctamente. Referencia ${result.reference}. También te enviamos un email de confirmación.`;
      this.form = this.emptyForm();
      this.clearVerification();
      if (this.turnstileWidgetId) this.turnstile.reset(this.turnstileWidgetId);
    } catch (error: unknown) {
      if (this.destroyed) return;
      if (error instanceof HttpErrorResponse) {
        const backendMessage = error.error && typeof error.error === 'object'
          ? (error.error as { error?: unknown }).error
          : undefined;
        this.submitError = typeof backendMessage === 'string'
          ? backendMessage
          : error.status === 0
            ? 'No se pudo conectar con el servidor. Revisá tu conexión e intentá nuevamente.'
            : error.status === 429
              ? 'Hay demasiadas solicitudes en este momento. Intentá nuevamente más tarde.'
              : 'No pudimos enviar la consulta en este momento. Intentá nuevamente en unos minutos.';
        if (error.status === 403 && this.turnstileWidgetId) {
          this.clearVerification();
          this.turnstile.reset(this.turnstileWidgetId);
        }
      } else {
        this.submitError = 'La solicitud no pudo completarse. Verificá tu conexión antes de volver a enviarla.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  retrySecurity(): void {
    if (this.isSubmitting || this.preparingSecurity) return;
    void this.prepareTurnstile();
  }

  private clearVerification(): void {
    this.turnstileToken = '';
    this.securityReady = !this.securityRequired;
  }

  private async prepareTurnstile(): Promise<void> {
    if (this.destroyed || this.preparingSecurity) return;
    const siteKey = environment.turnstileSiteKey?.trim();
    const hasRealKey = Boolean(siteKey && !siteKey.startsWith('REEMPLAZAR_'));
    if (!hasRealKey) {
      if (this.securityRequired) {
        this.submitError = 'Falta configurar la verificación de seguridad del formulario.';
        this.securityLoadFailed = true;
      }
      return;
    }

    const container = this.contactTurnstile?.nativeElement;
    if (!container) return;

    this.preparingSecurity = true;
    this.securityLoading = true;
    this.securityLoadFailed = false;
    this.clearVerification();
    this.submitError = '';

    try {
      this.turnstile.remove(this.turnstileWidgetId);
      this.turnstileWidgetId = undefined;
      container.replaceChildren();
      const widgetId = await this.turnstile.render(container, siteKey!, {
        onSuccess: token => {
          if (this.destroyed) return;
          this.turnstileToken = token;
          this.securityReady = true;
          this.securityLoadFailed = false;
          if (this.submitError.startsWith('No pudimos completar la verificación') ||
              this.submitError.startsWith('La verificación de seguridad')) this.submitError = '';
        },
        onExpired: () => {
          if (this.destroyed) return;
          this.clearVerification();
        },
        onTimeout: () => {
          if (this.destroyed) return;
          this.clearVerification();
          this.submitError = 'La verificación de seguridad caducó. Volvé a completarla.';
        },
        onError: () => {
          if (this.destroyed) return;
          this.clearVerification();
          this.securityLoadFailed = true;
          this.submitError = 'No pudimos completar la verificación de seguridad. Podés reintentarla.';
        }
      }, 'legal_contact_form');
      if (this.destroyed) {
        this.turnstile.remove(widgetId);
      } else {
        this.turnstileWidgetId = widgetId;
      }
    } catch {
      if (!this.destroyed) {
        this.securityLoadFailed = true;
        this.submitError = 'No se pudo cargar la verificación de seguridad. Podés reintentarla.';
      }
    } finally {
      this.preparingSecurity = false;
      if (!this.destroyed) this.securityLoading = false;
    }
  }

  private emptyForm(): ConsultationForm {
    return {
      fullName: '',
      phone: '',
      email: '',
      consultationType: '',
      location: '',
      consultationReason: '',
      caseDescription: ''
    };
  }
}
