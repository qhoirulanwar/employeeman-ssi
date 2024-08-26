import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('media')
export class Media {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'model_type', nullable: true })
    modelType: string;

    @Column({ name: 'model_id', nullable: true })
    modelId: number;

    @Column({ type: 'uuid', nullable: true, unique: true })
    uuid: string;

    @Column({ name: 'collection_name', nullable: true })
    collectionName: string;

    @Column()
    name: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'mime_type', nullable: true })
    mimeType: string;

    @Column()
    disk: string;

    @Column({ name: 'conversions_disk', nullable: true })
    conversionsDisk: string;

    @Column({ type: 'bigint' })
    size: number;

    @Column({ type: 'json' })
    manipulations: Record<string, any>;

    @Column({ name: 'custom_properties', type: 'json' })
    customProperties: Record<string, any>;

    @Column({ name: 'generated_conversions', type: 'json' })
    generatedConversions: Record<string, any>;

    @Column({ name: 'responsive_images', type: 'json' })
    responsiveImages: Record<string, any>;

    @Column({ name: 'order_column', type: 'int', nullable: true })
    @Index()
    orderColumn: number;

    @CreateDateColumn({ name: 'created_at', nullable: true })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: Date;
}