import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WhatsappContactComponent } from './shared/whatsapp-contact/whatsapp-contact.component';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	imports: [RouterOutlet, WhatsappContactComponent]
})
export class AppComponent {}
