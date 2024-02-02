import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { EmailConfirmComponent } from './email-confirm/email-confirm.component';
import { CollectionsComponent } from './collections/collections.component';
import { authGuard } from './shared/services/auth.guard';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'confirm', component: EmailConfirmComponent },
    { path: 'collections', component: CollectionsComponent, canActivate: [authGuard] }
];
