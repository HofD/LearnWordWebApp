import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { TokenStorageService } from '../shared/services/token-storage.service';
import { AlertService } from '../shared/services/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  providers: [AlertService, AuthService],
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
    private alertService: AlertService
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
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'collections';
      this.router.navigateByUrl(returnUrl);
      //this.router.navigate(['collections']);
    }

    //TODO: Add errors
  }
}
