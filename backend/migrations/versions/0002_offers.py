"""Add administrated offers and booking price snapshots."""
from alembic import op
import sqlalchemy as sa

revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'offers',
        sa.Column('id', sa.Uuid(as_uuid=False), primary_key=True),
        sa.Column('code', sa.String(40), nullable=False, unique=True),
        sa.Column('name', sa.String(150), nullable=False),
        sa.Column('discount_type', sa.String(20), nullable=False),
        sa.Column('discount_value', sa.Numeric(12, 2), nullable=False),
        sa.Column('starts_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('minimum_booking_amount', sa.Numeric(12, 2), nullable=False, server_default='0'),
        sa.Column('usage_limit', sa.Integer),
        sa.Column('times_used', sa.Integer, nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean, nullable=False, server_default=sa.true()),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint("discount_type IN ('percentage', 'fixed')"),
        sa.CheckConstraint('discount_value > 0'),
        sa.CheckConstraint('minimum_booking_amount >= 0'),
        sa.CheckConstraint('usage_limit IS NULL OR usage_limit > 0'),
        sa.CheckConstraint('times_used >= 0'),
        sa.CheckConstraint('expires_at > starts_at'),
    )
    with op.batch_alter_table('bookings') as batch:
        batch.add_column(sa.Column('base_amount', sa.Numeric(12, 2), nullable=False, server_default='0'))
        batch.add_column(sa.Column('discount_amount', sa.Numeric(12, 2), nullable=False, server_default='0'))
        batch.add_column(sa.Column('offer_id', sa.Uuid(as_uuid=False)))
        batch.add_column(sa.Column('offer_code_snapshot', sa.String(40)))
        batch.create_foreign_key('fk_bookings_offer_id', 'offers', ['offer_id'], ['id'])
    op.execute('UPDATE bookings SET base_amount = total_amount WHERE base_amount = 0')


def downgrade():
    with op.batch_alter_table('bookings') as batch:
        batch.drop_constraint('fk_bookings_offer_id', type_='foreignkey')
        batch.drop_column('offer_code_snapshot')
        batch.drop_column('offer_id')
        batch.drop_column('discount_amount')
        batch.drop_column('base_amount')
    op.drop_table('offers')
