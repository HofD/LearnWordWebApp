import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { TokenStorageService } from '../shared/services/token-storage.service';
import { AlertService } from '../shared/services/alert.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private tokenStorageService: TokenStorageService,
    private alertService: AlertService,
    public i18n: I18nService
  ) {
    this.loginForm = this.formBuilder.group({
      userEmail: ['', Validators.required],
      userPassword: ['', Validators.required]
    });
  }

  async login() {
    if (this.loginForm.invalid) {
      this.alertService.error(this.loginForm.value);
      return;
    }

    await this.authService.login(this.loginForm.controls['userEmail'].value, this.loginForm.controls['userPassword'].value);

    if (this.tokenStorageService.getToken() != null) {
      this.authService.sendAuthStateChangeNotification(true);
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'collections';
      this.router.navigateByUrl(returnUrl);
      //this.router.navigate(['collections']);
    }

    //TODO: Add errors
  }
}
