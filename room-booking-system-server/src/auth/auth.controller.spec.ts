import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Pick<AuthService, 'refresh'>>;

  beforeEach(async () => {
    const mockAuthService = {
      refresh: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('refresh', () => {
    const mockTokens = {
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
      expiresAt: new Date(),
      user: { id: 1, role: 'user' },
    };

    it('should call authService.refresh with the provided refresh token', async () => {
      authService.refresh.mockResolvedValue(mockTokens);

      const result = await controller.refresh('test-refresh-token');

      expect(authService.refresh).toHaveBeenCalledWith('test-refresh-token');
      expect(result).toEqual(mockTokens);
    });

    it('should propagate errors from authService.refresh', async () => {
      const error = new Error('Invalid or expired refresh token');
      authService.refresh.mockRejectedValue(error);

      await expect(controller.refresh('invalid-token')).rejects.toThrow(error);
    });
  });
});
