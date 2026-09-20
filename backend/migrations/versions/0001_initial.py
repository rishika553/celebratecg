"""Initial schema snapshot. Apply only to an empty PostgreSQL database."""
from pathlib import Path
from alembic import op

revision = '0001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    if connection.dialect.name != 'postgresql':
        raise RuntimeError('Use app.bootstrap --demo for SQLite. These migrations target PostgreSQL.')
    sql = (Path(__file__).parent.parent / 'sql' / '0001_initial.sql').read_text(encoding='utf-8')
    with connection.connection.driver_connection.cursor() as cursor:
        cursor.execute(sql)


def downgrade():
    raise RuntimeError('Initial schema downgrade is intentionally disabled. Restore a backup instead of dropping financial records.')
