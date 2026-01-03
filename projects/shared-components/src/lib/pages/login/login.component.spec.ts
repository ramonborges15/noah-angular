import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

import { LoginComponent } from './login.component';
import { LoginService } from '../../services/login/login.service';

class MockLoginService {
    state$ = new BehaviorSubject<any>({ status: 0, user: null, isAuthenticated: false, errors: {}, lastAttempt: null });
    isLoading$ = new BehaviorSubject<boolean>(false);
    errors$ = new BehaviorSubject<any>({});
    configure = jasmine.createSpy('configure');
    clearErrors = jasmine.createSpy('clearErrors');
    login = jasmine.createSpy('login').and.returnValue(Promise.resolve({ success: true, accessToken: 'token', user: null }));
}

describe('LoginComponent', () => {
    let component: LoginComponent;
    let fixture: ComponentFixture<LoginComponent>;
    let mockService: MockLoginService;

    beforeEach(async () => {
        mockService = new MockLoginService();

        await TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, CommonModule],
            declarations: [LoginComponent],
            providers: [{ provide: LoginService, useValue: mockService }]
        }).compileComponents();

        fixture = TestBed.createComponent(LoginComponent);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    it('should call configure on init when options provided', () => {
        component.options = { title: 'My App' } as any;
        fixture.detectChanges();
        expect(mockService.configure).toHaveBeenCalledWith(component.options);
    });
});
