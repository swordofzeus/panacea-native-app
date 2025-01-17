"""added class title field to outcome measure

Revision ID: d532153138b8
Revises: 909d20c546ef
Create Date: 2025-01-05 12:08:41.984682

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd532153138b8'
down_revision = '909d20c546ef'
branch_labels = None
depends_on = None


def upgrade():
    # op.add_column("outcome_measures", sa.Column("class_title", sa.String(), nullable=False))
    op.create_primary_key(
        "pk_outcome_measures",
        "outcome_measures",
        ["study_id", "group_id", "measure_title", "class_title"]
    )

def downgrade():
    op.drop_constraint("pk_outcome_measures", "outcome_measures", type_="primary")
    op.drop_column("outcome_measures", "class_title")