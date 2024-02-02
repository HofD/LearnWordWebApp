import { inject } from "@angular/core";
import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from "./token-storage.service";

export const authGuard: CanActivateFn = (route, state) => {
  const tokenStorageService = inject(TokenStorageService);
  const router = inject(Router);
  const token = tokenStorageService.getToken();

  if (token != null && !tokenStorageService.isTokenExpired()) {
    return true;
  }
  else {
    router.navigate(['login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
};
