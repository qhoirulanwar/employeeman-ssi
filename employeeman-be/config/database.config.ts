import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export default registerAs("database", (): TypeOrmModuleOptions => ({
    type: process.env.DATABASE_TYPE as any || 'sqlite',
    host: process.env.DATABASE_HOST || 'localhost',
    port: +process.env.DATABASE_PORT || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'db.sqlite',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true' || false,
    autoLoadEntities: true,
}))