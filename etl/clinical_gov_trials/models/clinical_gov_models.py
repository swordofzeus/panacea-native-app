from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Date,
    ForeignKey,
    Text,
    create_engine,
    Float,
    PrimaryKeyConstraint,
    ForeignKeyConstraint,
    DateTime
)
from sqlalchemy.orm import relationship, sessionmaker, declarative_base

Base = declarative_base()


class Study(Base):
    __tablename__ = "studies"

    study_id = Column(String, primary_key=True)  # Using `nctId` directly
    brief_title = Column(String, nullable=False)
    official_title = Column(String)
    overall_status = Column(String)
    start_date = Column(Date)
    completion_date = Column(Date)
    primary_completion_date = Column(Date)
    has_results = Column(Boolean, default=False)
    organization = Column(String)
    description = Column(Text)
    processed_at = Column(DateTime, nullable=True)  # New field to track processing time

    time_series_data = relationship(
        "TimeSeriesData", back_populates="study", cascade="all, delete-orphan"
    )
    # Relationships
    conditions = relationship(
        "StudyCondition", back_populates="study", cascade="all, delete-orphan"
    )
    keywords = relationship(
        "StudyKeyword", back_populates="study", cascade="all, delete-orphan"
    )
    phases = relationship(
        "StudyPhase", back_populates="study", cascade="all, delete-orphan"
    )
    arms = relationship(
        "StudyArm", back_populates="study", cascade="all, delete-orphan"
    )
    interventions = relationship(
        "Intervention", back_populates="study", cascade="all, delete-orphan"
    )
    outcomes = relationship(
        "Outcome", back_populates="study", cascade="all, delete-orphan"
    )
    participants = relationship(
        "Participant", back_populates="study", cascade="all, delete-orphan"
    )

    contacts = relationship(
        "Contact", back_populates="study", cascade="all, delete-orphan"
    )
    # Relationships
    participant_groups = relationship("ParticipantGroup", back_populates="study")
    adverse_event_groups = relationship(
        "AdverseEventGroup", back_populates="study", cascade="all, delete-orphan"
    )


class Group(Base):
    __tablename__ = "groups"

    id = Column(String, primary_key=True)
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    title = Column(String)
    description = Column(String)


class StudyCondition(Base):
    __tablename__ = "study_conditions"

    study_id = Column(String, ForeignKey("studies.study_id"), primary_key=True)
    condition = Column(String, primary_key=True, nullable=False)

    # Relationship back to `Study`
    study = relationship("Study", back_populates="conditions")


class StudyKeyword(Base):
    __tablename__ = "study_keywords"
    study_id = Column(
        String, ForeignKey("studies.study_id"), nullable=False, primary_key=True
    )
    keyword = Column(String, nullable=False, primary_key=True)

    study = relationship("Study", back_populates="keywords")


class StudyPhase(Base):
    __tablename__ = "study_phases"
    study_id = Column(
        String, ForeignKey("studies.study_id"), nullable=False, primary_key=True
    )
    phase = Column(String, nullable=False, primary_key=True)

    study = relationship("Study", back_populates="phases")


class StudyArm(Base):
    __tablename__ = "study_arms"

    id = Column(String, primary_key=True)  # Use provided ID like "BG000"
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    label = Column(String, nullable=False)
    type = Column(String)
    description = Column(Text)

    study = relationship("Study", back_populates="arms")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(String, primary_key=True)  # Use provided ID like "BG000"
    study_id = Column(
        String, ForeignKey("studies.study_id"), nullable=False, primary_key=True
    )
    name = Column(String, nullable=False)
    description = Column(Text)
    type = Column(String)

    study = relationship("Study", back_populates="interventions")


class Outcome(Base):
    __tablename__ = "outcomes"
    # NCT00826111
    id = Column(String, primary_key=True)  # Use provided ID like "OG000"
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    type = Column(String, nullable=False)
    measure = Column(Text, nullable=False)
    time_frame = Column(String)
    # description = Column(String)

    study = relationship("Study", back_populates="outcomes")


class Participant(Base):
    __tablename__ = "participants"

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    age_category = Column(String)
    sex = Column(String)
    count = Column(Integer)

    study = relationship("Study", back_populates="participants")


# AdverseEventGroup Entity
class AdverseEventGroup(Base):
    __tablename__ = "adverse_event_groups"

    study_id = Column(String, ForeignKey("studies.study_id"), primary_key=True)
    id = Column(String, primary_key=True)  # Unique group ID
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    serious_num_affected = Column(Integer, nullable=True)
    serious_num_at_risk = Column(Integer, nullable=True)
    other_num_affected = Column(Integer, nullable=True)
    other_num_at_risk = Column(Integer, nullable=True)

    # Relationships
    study = relationship("Study", back_populates="adverse_event_groups")
    adverse_events = relationship(
        "AdverseEvent",
        back_populates="adverse_event_group",
        cascade="all, delete-orphan",
    )


class AdverseEvent(Base):
    __tablename__ = "adverse_events"

    study_id = Column(String, nullable=False)
    group_id = Column(String, nullable=False)
    term = Column(String, primary_key=True)  # Term of the adverse event
    severity = Column(String, nullable=True)  # Serious, Non-serious
    organ_system = Column(String, nullable=True)
    assessment_type = Column(String, nullable=True)  # SYSTEMATIC_ASSESSMENT, etc.
    num_events = Column(Integer, nullable=True)
    num_affected = Column(Integer, nullable=True)
    num_at_risk = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)

    # Relationships
    adverse_event_group = relationship(
        "AdverseEventGroup", back_populates="adverse_events"
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["study_id", "group_id"],
            ["adverse_event_groups.study_id", "adverse_event_groups.id"],
        ),
        PrimaryKeyConstraint("study_id", "group_id", "term"),
    )


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    name = Column(String)
    role = Column(String)
    organization = Column(String)

    study = relationship("Study", back_populates="contacts")


class TimeSeriesData(Base):
    __tablename__ = "time_series_data"

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String, ForeignKey("studies.study_id"), nullable=False)
    outcome_id = Column(String, ForeignKey("outcomes.id"), nullable=False)
    group_id = Column(String, nullable=False)  # Corresponds to groupId in JSON
    time_frame = Column(String, nullable=True)
    value = Column(Float, nullable=True)
    lower_limit = Column(Float, nullable=True)
    upper_limit = Column(Float, nullable=True)

    # Relationships
    study = relationship("Study", back_populates="time_series_data")
    outcome = relationship("Outcome")


# ParticipantGroup Entity
class ParticipantGroup(Base):
    __tablename__ = "participant_groups"

    study_id = Column(String, ForeignKey("studies.study_id"), primary_key=True)
    id = Column(String, primary_key=True)  # Changed from group_id to id
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)

    # Relationships
    study = relationship("Study", back_populates="participant_groups")
    participant_demographics = relationship(
        "ParticipantDemographic", back_populates="participant_group"
    )
    participant_statistics = relationship(
        "ParticipantStatistic", back_populates="participant_group"
    )
    participant_denoms = relationship(
        "ParticipantDenom", back_populates="participant_group"
    )

    __table_args__ = (PrimaryKeyConstraint("study_id", "id"),)


# ParticipantDemographic Entity
class ParticipantDemographic(Base):
    __tablename__ = "participant_demographics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String)
    group_id = Column(String)
    measure_title = Column(String)  # Age, Sex, etc.
    param_type = Column(String)  # MEAN, COUNT_OF_PARTICIPANTS, etc.
    dispersion_type = Column(String, nullable=True)  # STANDARD_DEVIATION
    unit_of_measure = Column(String, nullable=True)  # years, Participants, etc.
    category = Column(String, nullable=True)  # Male, Female, etc.
    value = Column(Float, nullable=True)
    spread = Column(Float, nullable=True)  # e.g., 7.4 for SD

    # Relationships
    participant_group = relationship(
        "ParticipantGroup", back_populates="participant_demographics"
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["study_id", "group_id"],
            ["participant_groups.study_id", "participant_groups.id"],
        ),
    )


# ParticipantStatistic Entity
class ParticipantStatistic(Base):
    __tablename__ = "participant_statistics"

    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String)
    group_id = Column(String)
    measure_title = Column(String)
    param_type = Column(String)
    dispersion_type = Column(String, nullable=True)
    value = Column(Float, nullable=True)
    spread = Column(Float, nullable=True)
    unit_of_measure = Column(String, nullable=True)

    # Relationships
    participant_group = relationship(
        "ParticipantGroup", back_populates="participant_statistics"
    )

    __table_args__ = (
        ForeignKeyConstraint(
            ["study_id", "group_id"],
            ["participant_groups.study_id", "participant_groups.id"],
        ),
    )


# ParticipantDenom Entity
class ParticipantDenom(Base):
    __tablename__ = "participant_denoms"

    study_id = Column(String, nullable=False)
    group_id = Column(String, nullable=False)
    units = Column(String, nullable=True)
    count = Column(Integer, nullable=True)

    # Relationships
    participant_group = relationship(
        "ParticipantGroup", back_populates="participant_denoms"
    )

    __table_args__ = (
        PrimaryKeyConstraint("study_id", "group_id"),
        ForeignKeyConstraint(
            ["study_id", "group_id"],
            ["participant_groups.study_id", "participant_groups.id"],
        ),
    )


class BaselineCharacteristics(Base):
    __tablename__ = "baseline_characteristics"
    id = Column(Integer, primary_key=True, autoincrement=True)
    study_id = Column(String, ForeignKey("studies.study_id"))
    population_description = Column(Text)  # Description of the population


# Database connection
DATABASE_URL = "sqlite:///clinical_trials.db"  # Replace with your DB URL for local host
engine = create_engine(DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Ensure tables are created
Base.metadata.create_all(bind=engine)
