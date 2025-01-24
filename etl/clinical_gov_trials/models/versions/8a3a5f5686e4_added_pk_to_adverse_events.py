"""added pk to adverse events

Revision ID: 8a3a5f5686e4
Revises: 52a2dc88f332
Create Date: 2025-01-06 12:18:13.233729

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8a3a5f5686e4'
down_revision = '52a2dc88f332'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint("adverse_events_pkey", "adverse_events", type_="primary")

    op.create_primary_key(
        "adverse_events_pkey", "adverse_events", ["study_id", "group_id","term"]
    )

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.alter_column('interventions', 'description',
               existing_type=sa.TEXT(),
               nullable=False)
    # ### end Alembic commands ###