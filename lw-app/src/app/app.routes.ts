import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { CollectionsComponent } from './collections/collections.component';
import { authGuard } from './shared/services/auth.guard';
import { CollectionComponent } from './collection/collection.component';
import { ReviewComponent } from './review/review.component';
import { AboutComponent } from './about/about.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'confirm', component: EmailConfirmComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'collections', component: CollectionsComponent, canActivate: [authGuard] },
    { path: 'collections/:id', component: CollectionComponent, canActivate: [authGuard] },
    { path: 'review/:collectionId', component: ReviewComponent, canActivate: [authGuard] },
    { path: 'about', component: AboutComponent }
];
