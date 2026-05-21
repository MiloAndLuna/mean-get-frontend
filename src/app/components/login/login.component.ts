import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  private authService = inject(AuthService);
  private router      = inject(Router);

  mode: 'login' | 'register' | 'recovery' | 'recovery-sent' = 'login';

  email         = '';
  pass          = '';
  recoveryEmail = '';

  errorMessage = '';
  isLoading    = false;
  showPass     = false;

  async ngOnInit(): Promise<void> {
    try {
      const result = await this.authService.checkRedirectResult();
      if (result?.user) {
        this.router.navigate(['/dashboard']);
      }
    } catch {
      // no redirect result, normal flow
    }
  }

  showLogin(): void {
    this.mode         = 'login';
    this.errorMessage = '';
    this.pass         = '';
  }

  showRegister(): void {
    this.mode         = 'register';
    this.errorMessage = '';
    this.pass         = '';
  }

  showRecovery(): void {
    this.mode          = 'recovery';
    this.errorMessage  = '';
    this.recoveryEmail = this.email;
  }

  async loginGoogle(): Promise<void> {
    if (this.isLoading) return;
    this.errorMessage = '';
    this.isLoading    = true;
    try {
      await this.authService.loginWithGoogle();
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      console.error('Firebase Google error:', error?.code, error);
      this.errorMessage = 'No se pudo completar el inicio de sesión con Google. Intenta de nuevo.';
      this.isLoading = false;
    }
  }

  async onSubmitEmail(): Promise<void> {
    if (!this.email.trim() || !this.pass) return;
    this.errorMessage = '';
    this.isLoading    = true;
    try {
      if (this.mode === 'register') {
        await this.authService.registerWithEmail(this.email.trim(), this.pass);
      } else {
        await this.authService.loginWithEmail(this.email.trim(), this.pass);
      }
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = this.traducirErrorFirebase(error.code);
    } finally {
      this.isLoading = false;
    }
  }

  async sendRecovery(): Promise<void> {
    if (!this.recoveryEmail.trim()) {
      this.errorMessage = 'Ingresa tu correo electrónico.';
      return;
    }
    this.isLoading    = true;
    this.errorMessage = '';
    try {
      await this.authService.resetPassword(this.recoveryEmail.trim());
      this.mode = 'recovery-sent';
    } catch (error: any) {
      if (error.code === 'auth/invalid-email') {
        this.errorMessage = 'El formato del correo no es válido.';
      } else {
        this.mode = 'recovery-sent';
      }
    } finally {
      this.isLoading = false;
    }
  }

  private traducirErrorFirebase(code: string): string {
    const errores: Record<string, string> = {
      'auth/invalid-email':          'El formato del correo no es válido.',
      'auth/user-not-found':         'No existe una cuenta con ese correo.',
      'auth/wrong-password':         'La contraseña es incorrecta.',
      'auth/invalid-credential':     'Correo o contraseña incorrectos.',
      'auth/email-already-in-use':   'Ya existe una cuenta con ese correo.',
      'auth/weak-password':          'La contraseña debe tener al menos 6 caracteres.',
      'auth/too-many-requests':      'Demasiados intentos. Espera unos minutos.',
      'auth/network-request-failed': 'Sin conexión a internet. Verifica tu red.',
    };
    return errores[code] || 'Ocurrió un error. Intenta de nuevo.';
  }
}
