from pprint import pprint
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.clinical_gov_models import (
    AdverseEvent,
    Outcome,
    OutcomeGroup,
    OutcomeMeasure,
    ParticipantStatistic,
    Study,
    ParticipantGroup,
    Participant,
    ParticipantDemographic,
    VisualizationData,
)

OutcomeGroup, Outcome, OutcomeMeasure, VisualizationData
import openai
import logging
import os

# OpenAI API configuration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY


def call_llm(prompt, expected_json=True):
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

        content = (
            json.loads(response.choices[0].message.content)
            if expected_json
            else response.choices[0].message.content
        )
        return content  # Ensure the response is a dictionary
    except Exception as e:
        print(prompt)
        print(response.choices[0].message.content)
        print(f"Error calling LLM: {e}")
        input()
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
            self.session.query(ParticipantStatistic)
            .filter(ParticipantStatistic.study_id == study.study_id)
            .all()
        )
        if not participant_groups:
            print("no participants")
            return
        groups_prompt = self.prompt_groups(participant_groups, participant_demographics)

        groups = call_llm(groups_prompt)
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

    def transform_adverse_events(self, study_id):
        """
        Transforms adverse events data into a summary suitable for visualization.

        Args:
            study_id (str): The study ID to process.

        Returns:
            dict: A dictionary containing the summarized adverse events data.
        """
        try:
            # Query adverse events for the given study ID
            adverse_events = (
                self.session.query(AdverseEvent)
                .filter(AdverseEvent.study_id == study_id)
                .all()
            )

            if not adverse_events:
                logging.info(f"No adverse events found for study {study_id}.")
                return {
                    "summary": "No adverse events reported.",
                    "common": [],
                }

            # Aggregate and process data
            events_summary = {}
            for event in adverse_events:
                if event.term not in events_summary:
                    events_summary[event.term] = 0
                events_summary[event.term] += event.num_affected or 0

            # Calculate percentages
            total_affected = sum(events_summary.values())
            common_events = [
                {"event": term, "percentage": round((count / total_affected) * 100, 2)}
                for term, count in sorted(
                    events_summary.items(), key=lambda x: x[1], reverse=True
                )
            ]

            # Generate summary text
            top_events = common_events[:3]  # Get the top 3 events
            top_events_summary = ", ".join(
                [f"{event['event']} ({event['percentage']}%)" for event in top_events]
            )
            summary_text = (
                f"The most common side effects reported were {top_events_summary}."
            )

            # Format the result
            adverse_events_data = {
                "summary": summary_text,
                "common": common_events,
            }

            print(adverse_events_data)

            return adverse_events_data

        except Exception as e:
            logging.error(
                f"Error transforming adverse events for study {study_id}: {e}"
            )
            return {
                "summary": "An error occurred while processing adverse events.",
                "common": [],
            }

    def prompt_shortened_metric_name(self, metric_name):
        """
        Generates a prompt for the LLM to create a shortened version of a metric name.

        Args:
            metric_name (str): The full metric name.

        Returns:
            str: The LLM prompt.
        """
        return f"""
        You are tasked with creating concise metric names for healthcare data visualizations.
        The goal is to keep all meaningful information while removing irrelevant details.

        Original Metric Name: {metric_name}

        Instructions:
        - Shorten the metric name to no more than 5-7 words.
        - Avoid technical jargon or redundant details.
        - Ensure it conveys the same core meaning as the original.

        Return only the shortened metric name as a string.
        """

    def prompt_metric_summary(self, metric_name, metric_data):
        """
        Generates a prompt for the LLM to create a summary for metric results.

        Args:
            metric_name (str): The name of the metric.
            metric_data (list): Data for the metric, including group names and values.

        Returns:
            str: The LLM prompt.
        """
        return f"""
        You are tasked with summarizing results from a healthcare study metric.

        Metric Name: {metric_name}
        Data:
        {metric_data}

        Instructions:
        - Summarize the results in 2-3 sentences.
        - Highlight key differences or trends among groups.
        - Use plain language suitable for a non-technical audience.
        Return the summary as plain text.
        """

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
        completion_date = (
            study.completion_date.strftime("%Y-%m") if study.completion_date else None
        )
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
            participant_demographics (list): List of ParticipantDemographic records. Use study id to match records to group.

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
            Particpant Statistics:
            {[x.__dict__ for x in participant_demographics]}


            Your task:
            - For each group, provide:
                - groupName: The title of the group.
                - dosage: The medication name + dosage + time period derived from the group name. ex: 5mg advil 6 months. placebo if its a placebo. leave empty if no drug/placebo
                - medicationName: name of medications. placebo if its a placebo. leave empty if no drug/placebo
                - size: The number of people in the group (if its mentioned). It should be a count of people not number
                        of years or any other unit besides count and be a integer type.
                - description of the group


            Format the output as a JSON array of objects, with each object representing a group.
            Ourput should be a list of JSONs that are parsable by Pythons json library do not
            prefix it with ```JSON or add a \n new lines.
            """

    def preprocess_grouped_bar_data(self, grouped_outcomes):
        """
        Preprocesses outcome data into a format suitable for a grouped bar graph.

        Args:
            grouped_outcomes (dict): Outcome data grouped as metric -> group -> data.

        Returns:
            dict: JSON structure for grouped bar graph.
        """
        visualization_data = []
        for metric, groups in grouped_outcomes.items():
            chart_data = {
                "metric_name": metric,
                "data": [],
                "yAxis": {
                    "label": "Value",
                    "unit": next(iter(next(iter(groups.values()))))["units"],
                },
                "xAxis": {"label": "Time Period"},
            }

            # Collect unique labels
            all_labels = set()
            for group_data in groups.values():
                for item in group_data:
                    label = (
                        item.get("class_title") or item.get("time_frame") or "Week 12"
                    )
                    all_labels.add(label)

            # Normalize labels across all groups
            for label in all_labels:
                label_entry = {"label": label, "values": []}
                for group, data in groups.items():
                    # Find the value for this label in the group
                    value_entry = next(
                        (
                            item["value"]
                            for item in data
                            if (item.get("class_title") or item.get("time_frame"))
                            == label
                        ),
                        None,
                    )
                    if value_entry is not None:
                        label_entry["values"].append(
                            {"group": group, "value": value_entry}
                        )

                chart_data["data"].append(label_entry)

            visualization_data.append(chart_data)

        return visualization_data

    def transform_patient_outcomes(self, study_id):
        """
        Transforms outcome data into grouped bar graph data.

        Args:
            study_id (str): The study ID to process.

        Returns:
            list: A list of grouped bar graph data dictionaries with additional fields.
        """
        try:
            # Query OutcomeMeasures and OutcomeGroups for the study
            outcomes = (
                self.session.query(OutcomeMeasure, OutcomeGroup)
                .join(
                    OutcomeGroup,
                    (OutcomeMeasure.group_study_id == OutcomeGroup.study_id)
                    & (OutcomeMeasure.group_id == OutcomeGroup.id),
                )
                .filter(OutcomeMeasure.study_id == study_id)
                .all()
            )

            if not outcomes:
                logging.info(f"No outcomes found for study {study_id}.")
                return []

            # Group outcomes by measure title
            grouped_outcomes = {}
            for outcome, group in outcomes:
                metric = outcome.measure_title or "Unknown Metric"
                group_title = group.title or "Unknown Group"

                if metric not in grouped_outcomes:
                    grouped_outcomes[metric] = {}
                if group_title not in grouped_outcomes[metric]:
                    grouped_outcomes[metric][group_title] = []

                grouped_outcomes[metric][group_title].append(
                    {
                        "class_title": outcome.class_title,
                        "time_frame": outcome.time_frame,
                        "value": outcome.value,
                        "units": outcome.unit_of_measure,
                    }
                )

            # Preprocess the grouped outcomes into graph data
            visualization_data = []
            for full_metric_name, groups in grouped_outcomes.items():
                # Use LLM to shorten the metric name
                shortened_name_prompt = self.prompt_shortened_metric_name(
                    full_metric_name
                )
                shortened_name = (
                    call_llm(shortened_name_prompt, expected_json=False)
                    or full_metric_name
                )

                # Use LLM to generate a summary of the results
                metric_summary_prompt = self.prompt_metric_summary(
                    full_metric_name, groups
                )
                metric_summary = (
                    call_llm(metric_summary_prompt, expected_json=False)
                    or "No summary available."
                )

                chart_data = {
                    "full_metric_name": full_metric_name,  # Save the original full name
                    "metric_name": shortened_name,  # Replace metric_name with shortened name
                    "summary": metric_summary,  # Add a summary of results
                    "data": [],
                    "yAxis": {
                        "label": "Value",
                        "unit": next(iter(next(iter(groups.values()))))["units"],
                    },
                    "xAxis": {"label": "Time Period"},
                }

                # Collect unique labels
                all_labels = set()
                for group_data in groups.values():
                    for item in group_data:
                        label = (
                            item.get("class_title")
                            or item.get("time_frame")
                            or "Week 12"
                        )
                        all_labels.add(label)

                # Normalize labels across all groups
                for label in all_labels:
                    label_entry = {"label": label, "values": []}
                    for group, data in groups.items():
                        # Find the value for this label in the group
                        value_entry = next(
                            (
                                item["value"]
                                for item in data
                                if (item.get("class_title") or item.get("time_frame"))
                                == label
                            ),
                            None,
                        )
                        if value_entry is not None:
                            label_entry["values"].append(
                                {"group": group, "value": value_entry}
                            )

                    chart_data["data"].append(label_entry)

                visualization_data.append(chart_data)

            return visualization_data

        except Exception as e:
            logging.error(
                f"Error transforming patient outcomes for study {study_id}: {e}"
            )
            return []

    def generate_visualization_data(self, session):
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
                # metrics = self.transform_patient_outcomes(study.study_id)
                # print("# of metrics : " + str(len(metrics)))
                study_info = self.format_study_info(study)
                participants = self.format_participants(study)
                adverse_events = self.transform_adverse_events(study.study_id)
                outcomes = self.transform_patient_outcomes(study.study_id)
                json_data = {
                    "studyInfo": study_info,
                    "participants": participants,
                    "outcomes": outcomes,
                    "adverse_events": adverse_events,
                }
                visualization_data.append(
                    {
                        "studyInfo": study_info,
                        "participants": participants,
                        "outcomes": outcomes,
                        "adverse_events": adverse_events,
                    }
                )
                vd = VisualizationData(study_id=study.study_id, data=json_data)
                session.merge(vd)
                session.commit()
                with open("visualization_data.json", "w") as f:
                    json.dump(visualization_data, f)
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
        visualization_data = visualizer.generate_visualization_data(session)
        with open("data.json", "w") as f:
            json.dump(visualization_data, f)

        # Print or process the generated visualization data
        # for study_data in visualization_data:
        #     print(study_data)
