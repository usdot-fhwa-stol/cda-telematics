# Configure Grafana in AWS EC2
## Environment Setup
### Prerequisites
- [Ubuntu 20.04](https://releases.ubuntu.com/20.04/)
- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Latest version Grafana image from dockerhub](https://hub.docker.com/r/grafana/grafana/tags)

### Step by step instruction
- Setup AWS RDS MYSQL database instance
    - Create Amazon RDS DB instance following [this](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_CreateDBInstance.html) guide. Note: If the RDS DB instance is not publicly accessible, making sure the security groups include one that is the same as this EC2 instance security group to allow it to make connection.

    - Connect to MYSQL from EC2 instance. Login to EC2 via ssh.
        ```    
        sudo apt install mysql-client-core-8.0     # Install mysql client in EC2 instance
        
        mysql -u <username>  -h <grafana-db-instance-endpoint>  -P 3306 -p <password>
        ```
    - Create database for Grafana. 
        ```
        CREATE SCHEMA <grafana-database-name>;
        ```
- Configure and start Grafana with docker-compose.yml
    - Login to EC2 instance and clone repository to a workspace
        ```
        git clone <repository - url>
        ```
    - Navigate to grafana directory and update grafana.ini configuration.
        - Update database connection to use MYSQL.
            ```
            [database]
            type = mysql
            host = <mysql-db-instance-endpoint>:3306
            name = <grafana-database-name>
            user = <username>
            password = <password>
            ```
        - Update logging config to console & file mode, and log level to info.
            ```
            [log]
            mode = console file
            level = info
            ```
        - Update auth config to disable the login form and signout in the side menu.
            ```
            [auth]
            disable_login_form = true
            disable_signout_menu = true
            ```
        - Update security to allow request from the same origin, and allow the dashboard to be embedable
            ```
            [security]
            # set cookie SameSite attribute. defaults to `lax`. can be set to "lax", "strict", "none" and "disabled"
            cookie_samesite = strict

            # set to true if you want to allow browsers to render Grafana in a <frame>, <iframe>, <embed> or <object>. default is false.
            allow_embedding = true
            ```
    - Navigate to directory where the docker-compose file is located. Run below bash to create configuration folders (with sudo permission).
        ```
        sudo ./grafana/grafana_config.bash
        ```
    - Run Docker-compose to bring up grafana container.
        ```
        docker-compose up
        or
        docker-compose up -d # Running this contaienr in the background
        ```

# Configure AWS Redshift connection to Grafana running in EC2
## Create customized Grafana image
- Create Grafana Dockerfile and install redshift plugin
    ```
        FROM grafana/grafana:latest
        ENV GF_INSTALL_PLUGINS "grafana-redshift-datasource"
    ```
## Create an IAM user and policy that is dedicated for Redshift connection
- Create IAM user with AWS management console: https://us-east-1.console.aws.amazon.com/iamv2/home#/users
  The created user ARN (Amazone Resource name) is: arn:aws:iam::<ID>:user/redshiftConnect
- Open the permission tab and create a policy with below JSON and attach the policy to the user:
  ```
    {
    "Version": "2012-10-17",
    "Statement": [
        {
        "Sid": "AllowReadingMetricsFromRedshift",
        "Effect": "Allow",
        "Action": [
            "redshift-data:ListTables",
            "redshift-data:DescribeTable",
            "redshift-data:GetStatementResult",
            "redshift-data:DescribeStatement",
            "redshift-data:ListSchemas",
            "redshift-data:ExecuteStatement",
            "redshift:GetClusterCredentials",
            "redshift:DescribeClusters",
            "secretsmanager:ListSecrets"
        ],
        "Resource": "*"
        },
        {
        "Sid": "AllowReadingRedshiftQuerySecrets",
        "Effect": "Allow",
        "Action": ["secretsmanager:GetSecretValue"],
        "Resource": "*",
        "Condition": {
            "Null": {
            "secretsmanager:ResourceTag/RedshiftQueryOwner": "false"
            }
        }
        }
    ]
    }
  ```
 The JSON is referred to : https://github.com/grafana/redshift-datasource
 
 After the policy is created successfully, it is shown below:
 ![image](https://user-images.githubusercontent.com/62157949/181602113-569244c2-45e3-40aa-9518-bd542d389c01.png)
 After assigning the policy to a user:
 ![image](https://user-images.githubusercontent.com/62157949/181602532-845cd50e-5384-47a8-bf47-9a62d07e4fca.png)


  

- Open the security credential tab, and click the "create access key" button to create a set of access key ID and secret key. This key pair will be used for grafana to redshift connection.

## Run docker-compose up to bring up grafana container and configure the Amazon Redshift data source.
- Login to Grafana, and open the data sources tab.
- Click add data source button at the data source configuration page. 
- Filter the list of plugins and find Amazone Redshift plugin.

### Configure connection details
#### Authentication with "Access & secret key"
- Open the data source redshift page, there is a connection detail dropdown. Click the dropdown and choose "Access & secret key".
    - Provide the access key id and secret key id. 
    - Provide the default region: us-east-1
#### Authentication with "credential file"
- Open the data source redshift page, there is a connection detail dropdown. Click the dropdown and choose "credential file".
    - Provide the credentials profile name. 
    - Provide the default region: us-east-1
    - update the docker-compose.yml with volumes to mount host machine credential file ~/.aws/credentials to the folder /usr/shared/grafana/.aws/credentials in the Grafana container. The credentials file content is similar to below:
    ```
    [default]
    aws_access_key_id = <access-key-id>
    aws_secret_access_key = <secret-key>
    region = us-east-1
    ``` 
   ![image](https://user-images.githubusercontent.com/62157949/181596809-4b6a0212-8efd-459c-bcf2-45ab990154dd.png)



### Configure Redshift details 
- Click the "Cluster identifier" at the Redshift detail panel.
    - It will display an existing cluster named "redshift-cluster-ecs" from the AWS.
    - Provide the database user.
    - Provide the database name. 
    - Click the "save & test" to make sure the connection is successful.
    
    Using "Access & secret key"<br>
    ![image](https://user-images.githubusercontent.com/62157949/181349704-c9c471ef-143b-4183-8283-e2d756ab80f5.png)
   
    Using "credentials file"<br>
    ![image](https://user-images.githubusercontent.com/62157949/181591323-bac5be52-7428-41c0-a88b-6bb87a80e371.png)