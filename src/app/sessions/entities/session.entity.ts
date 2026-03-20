import { BaseEntity } from 'src/shared/entities/base.entity';
import { Entity, Column } from 'typeorm';

@Entity('sessions')
export class SessionEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    name: string;

    @Column({
        type: 'time',
    })
    startTime: string;

    @Column({
        type: 'time',
    })
    endTime: string;
}
