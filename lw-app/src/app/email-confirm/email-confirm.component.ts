import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { AlertService } from '../shared/services/alert.service';
import { first } from 'rxjs';
import { CommonModule } from '@angular/common';

enum EmailStatus {
  Verifying,
  Failed,
  Verified
}

@Component({
  selector: 'app-email-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './email-confirm.component.html',
  styleUrl: './email-confirm.component.css'
})
export class EmailConfirmComponent implements OnInit {
  EmailStatus = EmailStatus;
  emailStatus = EmailStatus.Verifying;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private alertService: AlertService
  ) { }

  ngOnInit(): void {
    const userId = this.route.snapshot.queryParams['userId'];
    const code = this.route.snapshot.queryParams['code'];
    console.log(code);

    this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

    this.authService.confirmEmail(userId, encodeURIComponent(code))
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
          this.emailStatus = EmailStatus.Verified;
          this.router.navigate(['../login'], { relativeTo: this.route });
        },
        error: () => {
          this.emailStatus = EmailStatus.Failed;
        }
      })
  }
}
