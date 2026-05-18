import { NgClass, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { AlertService } from '../shared/services/alert.service';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgIf, NgClass, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  forgotPasswordForm: FormGroup;
  submitted = false;
  submitting = false;
  instructionsSent = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService,
    public i18n: I18nService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  sendResetInstructions() {
    this.submitted = true;
    this.instructionsSent = false;

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.submitting = true;

    this.authService.forgotPassword(this.forgotPasswordForm.controls['email'].value)
      .subscribe({
        next: () => {
          this.instructionsSent = true;
          this.alertService.success(this.i18n.text().password.instructionsSent);
          this.submitting = false;
        },
        error: error => {
          this.alertService.error(error, { autoClose: false });
          this.submitting = false;
        }
      });
  }

  validateControl = (controlName: string) => {
    const control = this.forgotPasswordForm.get(controlName)!;
    return control.invalid && (control.touched || this.submitted);
  }

  hasError = (controlName: string, errorName: string) => {
    return this.forgotPasswordForm.get(controlName)!.hasError(errorName);
  }
}
