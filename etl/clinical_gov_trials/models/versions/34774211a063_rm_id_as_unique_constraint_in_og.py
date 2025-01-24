"""rm id as unique constraint in og

Revision ID: 34774211a063
Revises: 402e9b96dee8
Create Date: 2025-01-03 16:52:48.819618

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '34774211a063'
down_revision = '402e9b96dee8'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('outcome_groups_id_key', 'outcome_groups', type_='unique')
    op.add_column('outcome_measures', sa.Column('group_study_id', sa.String(), nullable=False))
    op.alter_column('outcome_measures', 'group_id',
               existing_type=sa.VARCHAR(),
               nullable=False)
    # op.drop_constraint('outcome_measures_group_id_fkey', 'outcome_measures', type_='foreignkey')
    op.create_foreign_key(None, 'outcome_measures', 'outcome_groups', ['group_study_id', 'group_id'], ['study_id', 'id'])
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'outcome_measures', type_='foreignkey')
    op.create_foreign_key('outcome_measures_group_id_fkey', 'outcome_measures', 'outcome_groups', ['group_id'], ['id'])
    op.alter_column('outcome_measures', 'group_id',
               existing_type=sa.VARCHAR(),
               nullable=True)
    op.drop_column('outcome_measures', 'group_study_id')
    op.create_unique_constraint('outcome_groups_id_key', 'outcome_groups', ['id'])
    # ### end Alembic commands ###