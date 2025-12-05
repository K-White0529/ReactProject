/**
 * Playwrightグローバルセットアップ
 * 全テスト実行前に1回だけ実行される
 */
async function globalSetup() {
    console.log('\n=== Global Setup: Cleaning up test users ===\n');
    
    try {
        const apiUrl = process.env.VITE_API_URL || 'http://localhost:3000';
        const response = await fetch(`${apiUrl}/api/auth/test-users/cleanup`, {
            method: 'DELETE',
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${data.message}`);
            console.log(`   Deleted ${data.deletedCount} test users\n`);
        } else {
            console.warn(`⚠️  Failed to cleanup test users: ${response.status}`);
        }
    } catch (error) {
        console.warn('⚠️  Error during test user cleanup:', error);
        console.warn('   Continuing with tests...\n');
    }
}

export default globalSetup;
