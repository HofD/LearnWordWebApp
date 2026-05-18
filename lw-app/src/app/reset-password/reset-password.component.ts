import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MustMatch } from '../_helpers/must-match.validator';
import { AuthService } from '../shared/services/auth.service';
import { AlertService } from '../shared/services/alert.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  resetPasswordForm: FormGroup;
  submitted = false;
  submitting = false;
  private code = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService,
    public i18n: I18nService
  ) {
    this.code = this.route.snapshot.queryParams['code'] ?? '';

    this.resetPasswordForm = this.formBuilder.group({
      email: [this.route.snapshot.queryParams['email'] ?? '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: MustMatch('password', 'confirmPassword')
    });
  }

  resetPassword() {
    this.submitted = true;

    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    this.authService.resetPassword(
      this.resetPasswordForm.controls['email'].value,
      this.code,
      this.resetPasswordForm.controls['password'].value
    )
      .subscribe({
        next: () => {
          this.alertService.success(this.i18n.text().password.resetSuccess, { keepAfterRouteChange: true });
          this.router.navigate(['/login']);
        },
        error: error => {
          this.alertService.error(error, { autoClose: false });
          this.submitting = false;
        }
      });
  }

  validateControl = (controlName: string) => {
    const control = this.resetPasswordForm.get(controlName)!;
    return control.invalid && (control.touched || this.submitted);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.resetPasswordForm.get(controlName)!.hasError(errorName);
  }
}
