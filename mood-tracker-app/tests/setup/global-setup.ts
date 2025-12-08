/**
 * Playwrightグローバルセットアップ
 * 全テスト実行前に1回だけ実行される
 */
async function globalSetup() {
    console.log('\n=== E2E Test Global Setup ===\n');
    
    const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
    console.log(`API URL: ${apiUrl}\n`);
    
    // ステップ1: APIの疎通確認
    console.log('1. Checking API connection...');
    try {
        const healthResponse = await fetch(`${apiUrl}/health`, {
            method: 'GET',
        });

        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log(`✅ API is running`);
            console.log(`   Environment: ${healthData.environment}`);
            console.log(`   Uptime: ${healthData.uptime}s\n`);
        } else {
            console.error(`❌ API health check failed: ${healthResponse.status}`);
            throw new Error(`API is not responding correctly (status: ${healthResponse.status})`);
        }
    } catch (error) {
        console.error('❌ Failed to connect to API');
        console.error('   Error:', error);
        console.error('\n⚠️  Please make sure the backend API is running:');
        console.error('   cd E:\\ReactProject\\mood-tracker-api');
        console.error('   npm run dev\n');
        throw new Error('Backend API is not running');
    }

    // ステップ2: テストユーザーのクリーンアップ
    console.log('2. Cleaning up old test users...');
    try {
        const cleanupResponse = await fetch(`${apiUrl}/api/auth/test-users/cleanup`, {
            method: 'DELETE',
        });

        if (cleanupResponse.ok) {
            const data = await cleanupResponse.json();
            console.log(`✅ ${data.message}`);
            console.log(`   Deleted ${data.deletedCount} test users\n`);
        } else {
            console.warn(`⚠️  Failed to cleanup test users: ${cleanupResponse.status}\n`);
        }
    } catch (error) {
        console.warn('⚠️  Error during test user cleanup:', error);
        console.warn('   Continuing with tests...\n');
    }

    // ステップ3: 固定テストユーザー（test_user）の確認
    console.log('3. Verifying test_user existence...');
    try {
        const loginResponse = await fetch(`${apiUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'test_user',
                password: 'Test1234!'
            })
        });

        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log(`✅ test_user exists and can login`);
            console.log(`   Token received: ${loginData.token ? 'Yes' : 'No'}\n`);
        } else if (loginResponse.status === 401) {
            console.error('❌ test_user exists but password is incorrect');
            console.error('   Expected password: Test1234!');
            console.error('\n⚠️  Please run the migration:');
            console.error('   cd E:\\ReactProject\\mood-tracker-api');
            console.error('   npm run migrate\n');
            throw new Error('test_user password is incorrect');
        } else if (loginResponse.status === 429) {
            console.error('❌ Rate limit exceeded');
            console.error('   This should not happen in test environment');
            console.error('   Please check rateLimiter.ts configuration\n');
            throw new Error('Rate limit exceeded during test setup');
        } else if (loginResponse.status === 403) {
            console.error('❌ CSRF protection blocking the request');
            console.error('   This should not happen in test environment');
            console.error('   Please check csrf.ts configuration\n');
            throw new Error('CSRF protection blocking requests in test environment');
        } else {
            const errorText = await loginResponse.text();
            console.error(`❌ test_user login failed: ${loginResponse.status}`);
            console.error(`   Response: ${errorText}`);
            console.error('\n⚠️  Please run the migration to create test_user:');
            console.error('   cd E:\\ReactProject\\mood-tracker-api');
            console.error('   npm run migrate\n');
            throw new Error(`test_user does not exist or cannot login (status: ${loginResponse.status})`);
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('does not exist')) {
            throw error;
        }
        console.error('❌ Error verifying test_user:', error);
        throw new Error('Failed to verify test_user existence');
    }

    console.log('=== Global Setup Complete ===\n');
}

export default globalSetup;
