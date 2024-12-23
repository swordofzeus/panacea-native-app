from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.clinical_gov_models import Study,ParticipantGroup, Participant,ParticipantDemographic
import openai

# OpenAI API configuration
# openai.api_key = OPENAI_API_KEY



def call_llm(prompt):
    """
    Calls the OpenAI API to process the prompt and return a structured response.
    """
    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a JSON-to-database mapping assistant.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        import json
        content = json.loads(response.choices[0].message.content)
        return content  # Ensure the response is a dictionary
    except Exception as e:
        print(f"Error calling LLM: {e}")
        return None


class ClinicalDataVisualizer:
    """
    A class to process and format clinical study data for visualization.
    """

    def __init__(self, session):
        """
        Initialize with a SQLAlchemy session.

        Args:
            session (Session): SQLAlchemy session object.
        """
        self.session = session

    def format_participants(self, study):
        """
        Formats participant data into the expected JSON structure for participants.

        Args:
            study (Study): The Study object from the database.

        Returns:
            dict: A dictionary formatted as the participants part of the JSON.
        """
        participant_groups = (
            self.session.query(ParticipantGroup)
            .filter(ParticipantGroup.study_id == study.study_id)
            .all()
        )
        participant_demographics = (
            self.session.query(ParticipantDemographic)
            .filter(ParticipantDemographic.study_id == study.study_id)
            .all()
        )
        if not participant_groups:
            return
        groups_prompt = self.prompt_groups(participant_groups, participant_demographics)
        groups = call_llm(groups_prompt)

        # gender_demographics_prompt = prompt_gender_demographics(participant_demographics)
        # gender_demographics = call_llm(gender_demographics_prompt)

        # dropout_rate_prompt = prompt_dropout_rate(participant_demographics)
        # dropout_rate = call_llm(dropout_rate_prompt)

        # Construct the participants JSON structure
        return groups
    def extract_dosage_from_group(self, group_name):
        """
        Helper function to infer dosage from group name.

        Args:
            group_name (str): Name of the participant group.

        Returns:
            int or None: Dosage inferred from the group name, or None if not found.
        """
        try:
            # Extract dosage as the first number found in the group name
            return int("".join(filter(str.isdigit, group_name.split()[0])))
        except (ValueError, IndexError):
            return None

    def calculate_dropout_rate(self, demographics):
        """
        Helper function to calculate the dropout rate.

        Args:
            demographics (list[ParticipantDemographic]): List of demographic records.

        Returns:
            float: Dropout rate as a decimal (e.g., 0.12 for 12%).
        """
        total_participants = sum(
            demo.value for demo in demographics if demo.measure_title == "Group Size"
        )
        dropouts = sum(
            demo.value for demo in demographics if demo.measure_title == "Dropouts"
        )

        return round(dropouts / total_participants, 2) if total_participants > 0 else 0


    def extract_studies(self):
        """
        Extract all studies from the database.

        Returns:
            list: List of Study objects.
        """
        studies = self.session.query(Study).filter(Study.processed_at != None).all()
        return studies
    def format_study_info(self, study):
        """
        Formats the study information into the expected JSON structure for studyInfo.

        Args:
            study (Study): The Study object from the database.

        Returns:
            dict: A dictionary formatted as the studyInfo part of the JSON.
        """
        # Extract fields from the Study object
        title = study.brief_title if hasattr(study, "brief_title") else study.title
        institution = study.organization
        start_date = study.start_date.strftime("%Y-%m") if study.start_date else None
        completion_date = study.completion_date.strftime("%Y-%m") if study.completion_date else None
        summary = study.description  # Assuming description serves as the summary

        # Format the JSON structure
        study_info = {
            "title": title,
            "institution": institution,
            "dates": {
                "start": start_date,
                "completion": completion_date,
            },
            "summary": summary,
        }

        return study_info

    def prompt_groups(self, participant_groups, participant_demographics):
            """
            Generates a prompt for the LLM to construct the groups part of the JSON.

            Args:
                participant_groups (list): List of ParticipantGroup records.
                participant_demographics (list): List of ParticipantDemographic records.

            Returns:
                str: The LLM prompt.
            """
            return f"""
                You are analyzing information regarding a healthcare study to build a bar graph. The x axis will be dosage
                and there will likely in some studies be groups of bars next to each other for each x axis element to compare
                how different groups did on the same dosage (ex: Male/Female, <18 Years/20-40 Years) etc. Some studies could just have
                one group. Here is the data:

            Participant Groups:
            {[x.__dict__ for x in participant_groups]}


            Your task:
            - For each group, provide:
                - groupName: The title of the group.
                - dosage: The dosage derived from the group name (e.g., "2 mg" becomes 2).
                - size: The number of people in the group (if its mentioned). It should be a count of people not number
                        of years or any other unit besides count and be a integer type.

            Format the output as a JSON array of objects, with each object representing a group.
            Ourput should be a list of JSONs that are parsable by Pythons json library do not
            prefix it with ```JSON or add a \n new lines.
            """


    def generate_visualization_data(self):
        """
        Process all studies and generate visualization data.

        Returns:
            list: List of JSON objects for each study.
        """
        visualization_data = []
        studies = self.extract_studies()

        for study in studies:
            print(f"parsing study {study.study_id}")
            try:
                study_info = self.format_study_info(study)
                participants = self.format_participants(study)
                visualization_data.append({"studyInfo": study_info, "participants": participants})
            except Exception as e:
                print(f"Error processing study {study.study_id}: {e}")

        return visualization_data


if __name__ == "__main__":


    # Database setup
    DATABASE_URL = "postgresql://testuser:testpwd@localhost:5432/panacea"
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)

    # Create session and process data
    import json
    with Session() as session:
        visualizer = ClinicalDataVisualizer(session)
        visualization_data = visualizer.generate_visualization_data()
        with open('data.json', 'w') as f:
            json.dump(visualization_data, f)

        # Print or process the generated visualization data
        # for study_data in visualization_data:
        #     print(study_data)
