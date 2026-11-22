import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeders/seeder.module';
import { DatabaseSeeder } from './seeders/database.seeder';

function parseArgs() {
  const args = process.argv.slice(2);
  const action = args[0];

  let repeat: number | undefined;
  let batchSize: number | undefined;

  for (const arg of args) {
    if (arg.startsWith('--repeat=')) {
      repeat = parseInt(arg.split('=')[1], 10);
    } else if (arg.startsWith('--batch=')) {
      batchSize = parseInt(arg.split('=')[1], 10);
    }
  }

  return { action, repeat, batchSize };
}

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeederModule);
  const seeder = appContext.get(DatabaseSeeder);

  const { action, repeat, batchSize } = parseArgs();

  try {
    switch (action) {
      case 'run':
        await seeder.seedAll({ repeat, batchSize });
        break;
      case 'clear':
        await seeder.clearAll();
        break;
      case 'refresh':
        await seeder.clearAll();
        await seeder.seedAll({ repeat, batchSize });
        break;
      default:
        console.error(
          '❌ 알 수 없는 액션입니다. run, clear, refresh 중 하나를 사용하세요.',
        );
        console.log('\n사용법:');
        console.log('  npm run seed:run [-- --repeat=N --batch=N]');
        console.log('  npm run seed:clear');
        console.log('  npm run seed:refresh [-- --repeat=N --batch=N]');
        console.log('\n예시:');
        console.log('  npm run seed:run -- --repeat=100 --batch=10');
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ 시딩(seeding) 실패:', error);
    throw error;
  } finally {
    await appContext.close();
  }
}

bootstrap()
  .then(() => {
    console.log('🎉 스크립트가 성공적으로 완료되었습니다.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 스크립트가 실패했습니다:', error);
    process.exit(1);
  });
