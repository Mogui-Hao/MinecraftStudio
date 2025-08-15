// import { describe, it, expect } from 'vitest';
// import axios from 'axios';
// import AxiosMockAdapter from 'axios-mock-adapter';
// import HttpClient from '@/ts/httpClient.ts'; // 根据实际路径调整
//
// eslint-disable-next-line vitest/no-commented-out-tests
// describe('HttpClient 测试', () => {
//   const instance = axios.create(); // 创建一个 AxiosInstance
//   const mock = new AxiosMockAdapter(instance);
//   const client = new HttpClient();
//
//   afterEach(() => {
//     mock.reset();
//   });
//
// eslint-disable-next-line vitest/no-commented-out-tests
//   it('应该正确创建用户', async () => {
//     const user = { username: 'testuser', password: '123456' };
//     const mockResponse = { token: 'mocked-token-123' };
//
//     // 模拟 POST /users 返回 201 和 token
//     mock.onPost('/users', user).reply(201, mockResponse);
//
//     const response = await client.registerUser(user);
//
//     // 断言返回的 data.token 和 mockResponse.token 一致
//     expect(response.data.token).toBe(mockResponse.token);
//
//     // 断言状态码是 201
//     expect(response.status).toBe(201);
//   });
// });
