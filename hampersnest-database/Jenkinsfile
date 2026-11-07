pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
        DB_PROJECT_DIR = 'hampersnest-database'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source repository...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${env.DB_PROJECT_DIR}") {
                    echo 'Installing database dependencies...'
                    sh 'npm ci || npm install'
                }
            }
        }

        stage('Lint & Validate Config') {
            steps {
                dir("${env.DB_PROJECT_DIR}") {
                    echo 'Validating Knexfile syntax...'
                    sh 'node -e "require(\'./knexfile.js\'); console.log(\'knexfile syntax OK\')"'
                }
            }
        }

        stage('Automated Schema Tests') {
            environment {
                NODE_ENV = 'test'
            }
            steps {
                dir("${env.DB_PROJECT_DIR}") {
                    echo 'Running automated schema & CRUD tests...'
                    sh 'npm test'
                }
            }
        }

        stage('Approve Production Sync') {
            when {
                branch 'main'
            }
            steps {
                timeout(time: 30, unit: 'MINUTES') {
                    input message: 'Proceed with Database Sync on PRODUCTION?', ok: 'Deploy Schema'
                }
            }
        }

        stage('Apply Production Sync') {
            when {
                branch 'main'
            }
            steps {
                dir("${env.DB_PROJECT_DIR}") {
                    echo 'Synchronizing schema with Production Oracle Database...'
                    sh 'npm run db:sync'
                    echo 'Verifying production table health...'
                    sh 'npm run db:verify'
                }
            }
        }
    }

    post {
        failure {
            echo '[ALERT] HampersNest Database Pipeline failed! Inspect logs for details.'
        }
        success {
            echo '[SUCCESS] Production Database pipeline completed successfully.'
        }
    }
}
