import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Subscription } from 'rxjs';
import { Alert, AlertType } from '../shared/models/alert.model';
import { AlertService } from '../shared/services/alert.service';
import { CommonModule } from '@angular/common';
import { I18nService } from '../i18n/i18n.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css'
})
export class MessagesComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;

  messages: Alert[] = [];
  messageSubscription!: Subscription;
  routeSubscription!: Subscription;

  constructor(
      private router: Router,
      private alertService: AlertService,
      public i18n: I18nService
  ) { }

  ngOnInit() {
      // subscribe to new messages
      this.messageSubscription = this.alertService.onAlert(this.id)
          .subscribe(alert => {
              // clear alerts when an empty alert is received
              if (!alert.message) {
                  // filter out alerts without 'keepAfterRouteChange' flag
                  this.messages = this.messages.filter(x => x.keepAfterRouteChange);

                  // remove 'keepAfterRouteChange' flag on the rest
                  this.messages.forEach(x => delete x.keepAfterRouteChange);
                  return;
              }

              // add alert to array
              this.messages.push(alert);

              // auto close alert if required
              if (alert.autoClose) {
                  setTimeout(() => this.removeMessage(alert), 3000);
              }
          });

      // clear alerts on location change
      this.routeSubscription = this.router.events.subscribe(event => {
          if (event instanceof NavigationStart) {
              this.alertService.clear(this.id);
          }
      });
  }

  ngOnDestroy() {
      // unsubscribe to avoid memory leaks
      this.messageSubscription.unsubscribe();
      this.routeSubscription.unsubscribe();
  }

  removeMessage(alert: Alert) {
      // check if already removed to prevent error on auto close
      if (!this.messages.includes(alert)) return;

      if (this.fade) {
          // fade out alert
          alert.fade = true;

          // remove alert after faded out
          setTimeout(() => {
              this.messages = this.messages.filter(x => x !== alert);
          }, 250);
      } else {
          // remove alert
          this.messages = this.messages.filter(x => x !== alert);
      }
  }

  cssClasses(alert: Alert) {
      if (!alert) return;

      const classes = ['alert', 'alert-dismissible', 'mt-4', 'container'];

      const alertTypeClass = {
          [AlertType.Success]: 'alert-success',
          [AlertType.Error]: 'alert-danger',
          [AlertType.Info]: 'alert-info',
          [AlertType.Warning]: 'alert-warning'
      }

      if (alert.type !== undefined) {
          classes.push(alertTypeClass[alert.type]);
      }

      if (alert.fade) {
          classes.push('fade');
      }

      return classes.join(' ');
  }
}
