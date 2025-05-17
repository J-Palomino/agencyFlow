I want to compose a workflow of simple agents that do few things to help me manage email flows. 



1) define yourself who you are what accounts you have access to: i.e. slack, google calendar, google docs, google sheets, google drive, etc.

2) you move to the homepage which connects you fixed in the center as the only circular node then you see all the other nodes in the org chart.

3) you can click on any node to open it and see its details.

4) vertices from you only lead to orchestrator Agent nodes and there you can define characteristics for your orchestrator and how they initiate tasks, measure output, priritize tasks, start and stop other agents etc

5) from orchestrator nodes you can connect to 
        



The agents should be able to 

Google Auth integrations 
- receive an email
- parse the email
- Shedule Calendar Reminders
- Schedule 
- Send Email

Sales
- Initiate actions in CRMS
- Create Docs

HR
- Index conversations in a vector database
- Spawn new customer support agents to handle the email



# Set your Google Cloud Project ID
export GOOGLE_CLOUD_PROJECT="daisychain-460008"

# Set your desired Google Cloud Location
export GOOGLE_CLOUD_LOCATION="us-central1"

us-central1
us-east1
us-east4
us-west1
us-west2
us-west3
us-west4

# Set the path to your agent code directory
export AGENT_PATH="./backend/googleADKAgent" # Google Sample SDK
 

# Set a name for your Cloud Run service (optional)
export SERVICE_NAME="composioadk"

# Set an application name (optional)
export APP_NAME="googleadkApp"


# Run adk deploy cloud_run \
--project=$GOOGLE_CLOUD_PROJECT \
--region=$GOOGLE_CLOUD_LOCATION \
--service_name=$SERVICE_NAME \
--app_name=$APP_NAME \
--with_ui \
 $AGENT_PATH

<!-- // print all the above  values -->
echo "GOOGLE_CLOUD_PROJECT: $GOOGLE_CLOUD_PROJECT"
echo "GOOGLE_CLOUD_LOCATION: $GOOGLE_CLOUD_LOCATION"
echo "AGENT_PATH: $AGENT_PATH"
echo "SERVICE_NAME: $SERVICE_NAME"
echo "APP_NAME: $APP_NAME"


# To fix the permissions, you'll need to:
1. Ensure the Cloud Run API is enabled in your project
2. Make sure your account has the necessary IAM roles (at minimum roles/run.admin)
3. You can enable the Cloud Run API with:
            gcloud services enable run.googleapis.com --project=[Project_ID]
4. Grant the necessary IAM role to your account:
            gcloud projects add-iam-policy-binding [Project_ID] \
            --member="user:[user_email]" \
            --role="roles/run.admin"


# Storage

1. 
gcloud projects add-iam-policy-binding daisychain-460008 \
  --member="serviceAccount:20339446258-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

gcloud projects add-iam-policy-binding daisychain-460008 \
  --member="serviceAccount:20339446258-compute@developer.gserviceaccount.com" \
  --role="roles/storage.objectViewer"

gcloud projects add-iam-policy-binding daisychain-460008 \
  --member="serviceAccount:20339446258@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.builder"