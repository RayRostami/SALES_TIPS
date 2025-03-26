import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { GlobalExceptionFilter } from './filters/globalExceptionFilter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // This is important
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Handle client-side routing
  app.setGlobalPrefix('api'); // Optional: Add a global prefix for API routes
  app.use((req, res, next) => {
    if (!req.url.startsWith('/api')) {
      res.sendFile(join(__dirname, '..', 'public', 'index.html'));
    } else {
      next();
    }
  });
  app.enableCors({
    origin: '*', // Allow requests from React app
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();