import { AssetEntity } from 'src/app/assets/entities/asset.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true, length: 50 })
    username: string;

    @Column({ name: 'fullName', length: 100 })
    fullName: string;

    @Column({ unique: true, length: 255 })
    email: string;

    @Column({ name: 'password', type: 'text' })
    password: string;

    @Column({
        name: 'emailVerifiedAt',
        type: 'timestamp',
        nullable: true,
    })
    emailVerifiedAt: Date | null;

    @Column({
        name: 'isVerified',
        type: 'boolean',
        nullable: false,
        default: false,
    })
    isVerified: boolean;

    @Column({ name: 'currentRefreshToken', type: 'text', nullable: true })
    currentRefreshToken: string | null;

    @Column({ name: 'lastSeenAt', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    lastSeenAt: Date;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @OneToMany(() => AssetEntity, a => a.user)
    assets: AssetEntity[];
}
