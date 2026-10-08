"""Allow a venue to appear in multiple categories."""
from alembic import op
import sqlalchemy as sa


revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'venue_categories',
        sa.Column('venue_id', sa.Uuid(as_uuid=False), nullable=False),
        sa.Column('category_id', sa.Uuid(as_uuid=False), nullable=False),
        sa.ForeignKeyConstraint(['venue_id'], ['venues.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['category_id'], ['categories.id']),
        sa.PrimaryKeyConstraint('venue_id', 'category_id'),
    )
    op.create_index('idx_venue_categories_category', 'venue_categories', ['category_id'])
    op.execute('INSERT INTO venue_categories (venue_id, category_id) SELECT id, category_id FROM venues')
    if op.get_bind().dialect.name == 'postgresql':
        op.execute('ALTER TABLE public.venue_categories ENABLE ROW LEVEL SECURITY')
        op.execute('REVOKE ALL ON TABLE public.venue_categories FROM PUBLIC')
        op.execute("""DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                REVOKE ALL ON TABLE public.venue_categories FROM anon;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                REVOKE ALL ON TABLE public.venue_categories FROM authenticated;
            END IF;
        END $$;""")


def downgrade():
    op.drop_index('idx_venue_categories_category', table_name='venue_categories')
    op.drop_table('venue_categories')
