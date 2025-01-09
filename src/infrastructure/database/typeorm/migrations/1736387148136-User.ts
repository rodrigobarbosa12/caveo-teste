import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class User1736387148136 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '120',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '2000',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '2000',
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['admin', 'comum'],
            default: "'comum'",
          },
          {
            name: 'is_onboarded',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users')
  }
}
