import { Component } from '@angular/core';

/** Acceso directo de contacto; no crea sesiones ni consume la API de entrevistas. */
@Component({
  selector: 'app-whatsapp-contact',
  standalone: true,
  templateUrl: './whatsapp-contact.component.html',
  styleUrls: ['./whatsapp-contact.component.scss']
})
export class WhatsappContactComponent {
  readonly whatsappUrl = 'https://wa.me/5491131076843';
}
