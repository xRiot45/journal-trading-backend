import { BaseEntity } from 'src/shared/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { ElementEntity } from 'src/app/elements/entities/element.entity';
import { CommentEntity } from 'src/app/comments/entities/comment.entity';

@Entity('documents')
export class DocumentEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    title: string;

    // Full canvas state mind map tersimpan sebagai JSON string
    // null = dokumen baru / blank canvas
    @Column({
        type: 'longtext',
        nullable: true,
    })
    content: string;

    @Column({
        type: 'varchar',
        length: 250,
        nullable: true,
    })
    description?: string;

    @Column({
        type: 'boolean',
        default: false,
    })
    isStarred: boolean;

    @Column({
        type: 'date',
        nullable: true,
    })
    lastEditedAt: Date;

    @OneToMany(() => ElementEntity, e => e.document)
    elements: ElementEntity[];

    @OneToMany(() => CommentEntity, c => c.document)
    comments: CommentEntity[];
}
