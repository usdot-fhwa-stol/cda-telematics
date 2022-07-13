# Configure Grafana 
## Environment Setup
### Prerequisites
- [Ubuntu 20.04](https://releases.ubuntu.com/20.04/)
- [Docker](https://docs.docker.com/engine/install/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- [Latest version Grafana image from dockerhub](https://hub.docker.com/r/grafana/grafana/tags)

### Step by step instruction
- Setup MYSQL database for Grafana
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
- Configure and start Grafana with docker-compose
    - Clone repository
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