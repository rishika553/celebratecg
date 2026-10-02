"""Protect offer administration from direct browser database access."""
from alembic import op

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None

def upgrade():
    if op.get_bind().dialect.name == 'postgresql':
        op.execute('ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY')
        op.execute('REVOKE ALL ON TABLE public.offers FROM PUBLIC')
        op.execute("""DO $$ BEGIN
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                REVOKE ALL ON TABLE public.offers FROM anon;
            END IF;
            IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                REVOKE ALL ON TABLE public.offers FROM authenticated;
            END IF;
        END $$;""")

def downgrade():
    # Preserve security on rollback rather than granting browser access.
    pass
